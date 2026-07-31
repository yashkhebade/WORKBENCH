const { all } = require('../config/db');

exports.globalSearch = async (req, res) => {
    try {
        const query = req.query.q ? `%${req.query.q.toLowerCase()}%` : '%';
        if (!req.query.q || req.query.q.trim().length < 2) {
            return res.json({ tasks: [], notes: [], files: [], projects: [] });
        }

        const tasks = await all(`
            SELECT t.id, t.title, t.description, t.status, t.priority, p.name as project_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE LOWER(t.title) LIKE $1 OR LOWER(COALESCE(t.description, '')) LIKE $1
            LIMIT 6
        `, [query]);

        const notes = await all(`
            SELECT n.id, n.title, n.tags, p.name as project_name
            FROM notes n
            LEFT JOIN projects p ON n.project_id = p.id
            WHERE LOWER(n.title) LIKE $1 OR LOWER(COALESCE(n.content_markdown, '')) LIKE $1
            LIMIT 6
        `, [query]);

        const files = await all(`
            SELECT f.id, f.name, f.tags, p.name as project_name
            FROM files f
            LEFT JOIN projects p ON f.project_id = p.id
            WHERE LOWER(f.name) LIKE $1 OR LOWER(COALESCE(f.description, '')) LIKE $1
            LIMIT 6
        `, [query]);

        const projects = await all(`
            SELECT id, name, description, status, workflow_state
            FROM projects
            WHERE LOWER(name) LIKE $1 OR LOWER(COALESCE(description, '')) LIKE $1
            LIMIT 6
        `, [query]);

        res.json({ tasks, notes, files, projects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
