const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
            { expiresIn: '7d' } // 1 week session
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
