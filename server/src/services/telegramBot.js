const TelegramBot = require('node-telegram-bot-api');
const FileModel = require('../models/File');
const NoteModel = require('../models/Note');
const ProjectModel = require('../models/Project');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
let bot = null;

if (token) {
    bot = new TelegramBot(token, { polling: true });

    bot.on('message', async (msg) => {
        const incomingChatId = msg.chat.id;

        // If the user hasn't set their TELEGRAM_CHAT_ID, tell them what it is.
        if (!chatId) {
            bot.sendMessage(incomingChatId, `Welcome! Your Chat ID is:\n\n\`${incomingChatId}\`\n\nPlease add TELEGRAM_CHAT_ID=${incomingChatId} to your Render environment variables or .env file to complete setup.`, { parse_mode: 'Markdown' });
            return;
        }

        // Only process messages from the authorized user
        if (incomingChatId.toString() !== chatId.toString()) {
            bot.sendMessage(incomingChatId, "Unauthorized access. This bot is private.");
            return;
        }

        // Handle text notes
        if (msg.text && !msg.text.startsWith('/')) {
            try {
                // Find "General" project
                const projects = await ProjectModel.findAll();
                const generalProject = projects.find(p => p.name === 'General' || p.name.includes('General')) || projects[0];

                if (!generalProject) {
                    return bot.sendMessage(chatId, "No projects found to attach this note to.");
                }

                await NoteModel.create({
                    project_id: generalProject.id,
                    author_id: 1, // Fallback to first user for quick capture
                    title: 'Quick Note',
                    content_markdown: msg.text,
                    tags: 'mobile-capture'
                });

                bot.sendMessage(chatId, `✅ Saved to Timeline: ${generalProject.name}`);
            } catch (err) {
                console.error(err);
                bot.sendMessage(chatId, `❌ Failed to save note: ${err.message}`);
            }
        }
        
        // Handle photos
        if (msg.photo) {
            try {
                // Get the highest resolution photo
                const photo = msg.photo[msg.photo.length - 1];
                const fileId = photo.file_id;
                
                const projects = await ProjectModel.findAll();
                const generalProject = projects.find(p => p.name === 'General' || p.name.includes('General')) || projects[0];

                await FileModel.create({
                    project_id: generalProject.id,
                    uploader_id: 1,
                    name: `Mobile_Photo_${Date.now()}.jpg`,
                    description: msg.caption || '',
                    file_path: `/storage/telegram_${fileId}`,
                    filetype: 'image',
                    size: photo.file_size,
                    tags: 'mobile-capture',
                    telegram_file_id: fileId
                });
                bot.sendMessage(chatId, `📸 Photo saved to Timeline: ${generalProject.name}`);
            } catch (err) {
                console.error(err);
                bot.sendMessage(chatId, `❌ Failed to save photo: ${err.message}`);
            }
        }
    });
}

// Function to upload file buffer directly to Telegram
const uploadToTelegram = async (buffer, filename, mimetype) => {
    if (!bot || !chatId) {
        throw new Error("Telegram bot or Chat ID not configured.");
    }

    try {
        const fileOptions = {
            filename: filename,
            contentType: mimetype
        };

        const msg = await bot.sendDocument(chatId, buffer, {}, fileOptions);
        if (msg.document) return msg.document.file_id;
        if (msg.photo) return msg.photo[msg.photo.length - 1].file_id;
        if (msg.video) return msg.video.file_id;
        
        throw new Error("Failed to extract file_id from Telegram response");
    } catch (err) {
        console.error("Telegram Upload Error:", err);
        throw err;
    }
};

// Function to get the temporary download URL from Telegram
const getFileUrl = async (fileId) => {
    if (!bot) throw new Error("Telegram bot not configured.");
    return await bot.getFileLink(fileId);
};

module.exports = {
    bot,
    uploadToTelegram,
    getFileUrl
};
