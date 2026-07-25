const { run, get, all } = require('../config/db');

class Task {
    static async findAllByProject(projectId) {
        return all(`
            SELECT t.*, u.name as assignee_name 
            FROM tasks t 
            LEFT JOIN users u ON t.assignee_id = u.id 
            WHERE t.project_id = ? 
            ORDER BY t.created_at DESC
        `, [projectId]);
    }

    static async findById(id) {
        return get('SELECT * FROM tasks WHERE id = ?', [id]);
    }

    static async create({ project_id, assignee_id, title, description, status = 'To Do', category, priority = 'Medium', due_date, parent_task_id }) {
        return run(
            `INSERT INTO tasks (project_id, assignee_id, title, description, status, category, priority, due_date, parent_task_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            [project_id, assignee_id, title, description, status, category, priority, due_date, parent_task_id]
        );
    }

    static async update(id, updates) {
        // Build dynamic query
        const keys = Object.keys(updates);
        if (keys.length === 0) return null;
        
        const setString = keys.map(k => `${k} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        
        return run(
            `UPDATE tasks SET ${setString}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
    }

    static async delete(id) {
        return run('DELETE FROM tasks WHERE id = ?', [id]);
    }
}

module.exports = Task;
