const { run, get, all } = require('../config/db');

exports.getTeamMembers = async (req, res) => {
    try {
        const members = await all(`
            SELECT id, name, email, role, avatar_url, created_at
            FROM users
            ORDER BY name ASC
        `);
        const invites = await all(`
            SELECT id, email, role, status, created_at
            FROM team_invites
            WHERE status = 'Pending'
            ORDER BY created_at DESC
        `);
        res.json({ members, invites });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.inviteMember = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Check if user already exists
        const existingUser = await get('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email is already a team member' });
        }

        // Insert invite
        await run(
            'INSERT INTO team_invites (email, role, invited_by, status) VALUES ($1, $2, $3, $4)',
            [email.trim(), role || 'Member', req.user.id, 'Pending']
        );

        res.status(201).json({ message: `Invitation sent to ${email}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { id } = req.params;
        // Don't allow removing yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot remove yourself' });
        }
        await run('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Team member removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
