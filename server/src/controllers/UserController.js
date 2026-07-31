const { get, run } = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const user = await get('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1', [req.user.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar_url } = req.body;
        await run(
            'UPDATE users SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url) WHERE id = $3',
            [name ? name.trim() : null, avatar_url || null, req.user.id]
        );
        const updated = await get('SELECT id, name, email, role, avatar_url FROM users WHERE id = $1', [req.user.id]);
        res.json({ message: 'Profile updated successfully', user: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
