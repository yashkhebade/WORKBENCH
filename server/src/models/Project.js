const { run, get, all } = require('../config/db');

class Project {
    static async findAll() {
        return all('SELECT * FROM projects ORDER BY created_at DESC');
    }

    static async findById(id) {
        return get('SELECT * FROM projects WHERE id = $1', [id]);
    }

    // Used for non-Admin users: only return projects they're actually a member of.
    static async findAllForUser(userId) {
        return all(`
            SELECT p.* FROM projects p
            JOIN project_members pm ON pm.project_id = p.id
            WHERE pm.user_id = $1
            ORDER BY p.created_at DESC
        `, [userId]);
    }

    static async create({ name, description, status = 'Draft', parent_project_id = null }) {
        return run(
            'INSERT INTO projects (name, description, status, parent_project_id) VALUES (?, ?, ?, ?) RETURNING id',
            [name, description, status, parent_project_id]
        );
    }

    static async update(id, { name, description, status }) {
        return run(
            'UPDATE projects SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, description, status, id]
        );
    }

    static async updateState(id, workflow_state) {
        return run(
            'UPDATE projects SET workflow_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [workflow_state, id]
        );
    }

    static async updateWorkflowSteps(id, steps) {
        return run(
            'UPDATE projects SET workflow_steps = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(steps), id]
        );
    }

    static async delete(id) {
        return run('DELETE FROM projects WHERE id = ?', [id]);
    }

    static async addMember(projectId, userId, role = 'member') {
        return run(
            'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?) ON CONFLICT (project_id, user_id) DO NOTHING',
            [projectId, userId, role]
        );
    }

    static async getMembers(projectId) {
        return all(`
            SELECT u.id, u.name, u.email, pm.role
            FROM project_members pm
            JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = ?
        `, [projectId]);
    }
}

module.exports = Project;
