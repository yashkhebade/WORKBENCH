const { run, get, all } = require('../config/db');

class Note {
    static async search(projectId, query) {
        const q = `%${query}%`;
        return all(`
            SELECT n.*, u.name as author_name 
            FROM notes n
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.project_id = ? 
              AND (n.title LIKE ? OR n.content_markdown LIKE ?)
            ORDER BY n.updated_at DESC
        `, [projectId, q, q]);
    }

    static async findAllByProject(projectId) {
        return all(`
            SELECT n.*, u.name as author_name 
            FROM notes n
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.project_id = ?
            ORDER BY n.updated_at DESC
        `, [projectId]);
    }

    static async findById(id) {
        return get('SELECT * FROM notes WHERE id = ?', [id]);
    }

    static async getVersions(noteId) {
        return all(`
            SELECT v.*, u.name as author_name 
            FROM note_versions v
            LEFT JOIN users u ON v.author_id = u.id
            WHERE v.note_id = ?
            ORDER BY v.created_at DESC
        `, [noteId]);
    }

    static async create({ project_id, author_id, task_id, file_id, title, content_markdown }) {
        const res = await run(
            `INSERT INTO notes (project_id, author_id, task_id, file_id, title, content_markdown) 
             VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
            [project_id, author_id, task_id || null, file_id || null, title, content_markdown]
        );
        const noteId = res.id;
        
        await run(
            'INSERT INTO note_versions (note_id, content_markdown, author_id) VALUES (?, ?, ?)',
            [noteId, content_markdown, author_id]
        );
        return noteId;
    }

    static async update(id, { title, content_markdown, author_id }) {
        await run(
            'UPDATE notes SET title = ?, content_markdown = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content_markdown, id]
        );
        
        await run(
            'INSERT INTO note_versions (note_id, content_markdown, author_id) VALUES (?, ?, ?)',
            [id, content_markdown, author_id]
        );
    }
    
    static async delete(id) {
        return run('DELETE FROM notes WHERE id = ?', [id]);
    }
}

module.exports = Note;
