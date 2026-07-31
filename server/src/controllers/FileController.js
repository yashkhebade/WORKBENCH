const FileModel = require('../models/File');
const fs = require('fs');
const path = require('path');
const { getIo } = require('../socket');
const telegramBot = require('../services/telegramBot');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const projectId = req.params.projectId;
        const uploaderId = req.user.id;
        const filename = req.file.originalname;
        // The file is now in memory, not on disk
        const description = req.body.description || '';
        const taskId = req.body.task_id || null;
        const category = req.body.category || 'other';
        const tags = req.body.tags || '';

        const mimeType = req.file.mimetype;
        let filetype = 'other';
        let autoTags = [];

        if (mimeType.startsWith('image/')) filetype = 'image';
        else if (mimeType.startsWith('video/')) filetype = 'video';
        else if (mimeType.includes('pdf')) { filetype = 'pdf'; autoTags.push('datasheet'); }
        else if (mimeType.includes('text/') || mimeType.includes('json') || mimeType.includes('javascript')) filetype = 'code';
        else if (mimeType.includes('word') || mimeType.includes('document')) filetype = 'document';

        // Auto-tagging based on extension
        const ext = path.extname(filename).toLowerCase();
        if (['.brd', '.kicad_pcb', '.sch'].includes(ext)) autoTags.push('hardware');
        if (['.c', '.cpp', '.h', '.ino'].includes(ext)) { filetype = 'code'; autoTags.push('firmware'); }
        if (['.step', '.stl', '.sldprt'].includes(ext)) autoTags.push('mechanical');

        const finalTags = [req.body.tags || '', ...autoTags].filter(Boolean).join(',');

        // Upload directly to Telegram
        let telegramFileId = null;
        try {
            telegramFileId = await telegramBot.uploadToTelegram(req.file.buffer, filename, mimeType);
        } catch (err) {
            console.error("Failed to upload to Telegram", err);
            return res.status(500).json({ error: 'Failed to save file to cloud storage.' });
        }

        // Check if file exists in project
        const existingFile = await FileModel.findByNameAndProject(filename, projectId);

        if (existingFile) {
            // Auto-versioning: Add new version
            const nextVersion = await FileModel.addVersion({
                file_id: existingFile.id,
                file_path: 'telegram',
                telegram_file_id: telegramFileId
            });
            try { getIo().emit('file:uploaded', { name: filename, version: nextVersion }); } catch(e) {}
            res.json({ message: 'New version uploaded' });
        } else {
            // New file
            await FileModel.createFileWithVersion({
                project_id: projectId,
                uploader_id: uploaderId,
                name: filename,
                description,
                file_path: 'telegram',
                task_id: taskId,
                category,
                filetype,
                size: req.file.size,
                tags: finalTags,
                telegram_file_id: telegramFileId
            });
            try { getIo().emit('file:uploaded', { name: filename, version: 1, category, task_id: taskId }); } catch(e) {}
            res.status(201).json({ message: 'File uploaded' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProjectFiles = async (req, res) => {
    try {
        const files = await FileModel.findAllByProject(req.params.projectId);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTaskFiles = async (req, res) => {
    try {
        const files = await FileModel.findAllByTask(req.params.taskId);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getFileVersions = async (req, res) => {
    try {
        const versions = await FileModel.getVersions(req.params.fileId);
        res.json(versions);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Only these types are safe to render inline in the browser on our own origin.
// Anything else (html, svg, js, etc.) could execute as script if previewed
// inline, so it's always forced to download instead.
const PREVIEWABLE_MIME_PREFIXES = ['image/', 'application/pdf', 'text/plain'];

function guessMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const map = {
        '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf',
        '.txt': 'text/plain', '.csv': 'text/plain'
    };
    return map[ext] || 'application/octet-stream';
}

exports.downloadOrPreview = async (req, res) => {
    try {
        const version = await FileModel.findVersionById(req.params.versionId);
        if (!version) return res.status(404).json({ error: 'Version not found' });

        // If it's a telegram file, redirect to the Telegram temporary URL
        if (version.file_path === 'telegram' || version.telegram_file_id) {
            const telegramFileId = version.telegram_file_id || version.file_path.split('telegram_')[1];
            if (telegramFileId) {
                const telegramUrl = await telegramBot.getFileUrl(telegramFileId);
                return res.redirect(telegramUrl);
            }
        }

        // Fallback for old local files (if any exist)
        const absolutePath = path.resolve(__dirname, '../../', version.file_path);
        const mimeType = guessMimeType(version.name);
        const isSafeToPreview = PREVIEWABLE_MIME_PREFIXES.some(p => mimeType.startsWith(p));

        if (req.query.preview === 'true' && isSafeToPreview) {
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox;");
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.sendFile(absolutePath);
        } else {
            res.download(absolutePath, version.name); // Force download for anything not on the safe list
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
