const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get } = require('../config/db');

// In-memory store for reset codes. In production, this would be in Redis or the DB.
const resetCodes = new Map();

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }
        if (password.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters' });
        }
        const existing = await User.findByEmail(email);
        if (existing) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }
        await User.create({ name, email, password, role: 'Member' });
        const user = await User.findByEmail(email);

        try {
            const projectResult = await Project.create({
                name: 'Welcome to Team Hub',
                description: 'A sample project to help you get started with the workspace.',
                status: 'Active',
                workflow_state: 'In Progress'
            });
            const projectId = projectResult.id || projectResult.lastID;
            
            await Project.addMember(projectId, user.id, 'owner');

            await Task.create({
                project_id: projectId,
                assignee_id: user.id,
                title: 'Explore the Dashboard',
                description: 'Check out the activity feed and project stats on your new dashboard.',
                status: 'Done',
                priority: 'Low'
            });
            await Task.create({
                project_id: projectId,
                assignee_id: user.id,
                title: 'Try Drag & Drop',
                description: 'Move this task to the "In Progress" or "Done" column.',
                status: 'To Do',
                priority: 'Medium'
            });
            await Task.create({
                project_id: projectId,
                assignee_id: null,
                title: 'Upload a File',
                description: 'Go to the Timeline and drop a PDF or image into the project.',
                status: 'In Progress',
                priority: 'High'
            });
        } catch (seedErr) {
            console.error('Failed to seed welcome project:', seedErr);
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' } // 30 day persistent session
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { targetUserId, newPassword, currentPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }

        const isSelfChange = !targetUserId || targetUserId === req.user.id;

        if (!isSelfChange) {
            // Changing someone else's password requires admin rights.
            if (req.user.role !== 'Admin') {
                return res.status(403).json({ error: 'Only admins can reset other users passwords' });
            }
        } else {
            // Self-service change requires proving you know the current password,
            // so a briefly-stolen token can't be used to lock the real owner out.
            if (!currentPassword) {
                return res.status(400).json({ error: 'currentPassword is required to change your own password' });
            }
            const user = await User.findById(req.user.id);
            const fullUser = await User.findByEmail(user.email); // includes password_hash
            const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        }

        const uid = targetUserId || req.user.id;
        await User.updatePassword(uid, newPassword);
        
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findByEmail(email);
        if (!user) {
            // Return success even if user doesn't exist to prevent email enumeration
            return res.json({ message: 'If an account exists, a reset code was sent.' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save code with 15 minute expiration
        resetCodes.set(email, {
            code,
            userId: user.id,
            expiresAt: Date.now() + 15 * 60 * 1000
        });

        // Simulating email delivery
        console.log(`[EMAIL MOCK] Password reset code for ${email} is: ${code}`);

        // For this demo, we return the code in the response so the UI can show it.
        // In production, NEVER do this!
        res.json({ 
            message: 'If an account exists, a reset code was sent.',
            demo_code: code // DEMO ONLY
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.resetPasswordWithCode = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }

        const record = resetCodes.get(email);
        if (!record || record.code !== code || Date.now() > record.expiresAt) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        await User.updatePassword(record.userId, newPassword);
        
        // Consume the code
        resetCodes.delete(email);

        res.json({ message: 'Password has been successfully reset' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
