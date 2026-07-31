const { run, get, all } = require('../config/db');

class CalendarEvent {
    static async findAll() {
        return all('SELECT * FROM calendar_events ORDER BY start_time ASC');
    }

    static async findAllByProject(projectId) {
        if (!projectId || projectId === 'all') {
            return this.findAll();
        }
        return all('SELECT * FROM calendar_events WHERE project_id = ? ORDER BY start_time ASC', [projectId]);
    }

    static async create({ project_id, creator_id, title, description, start_time, end_time, event_type = 'meeting', is_recurring = false }) {
        return run(
            'INSERT INTO calendar_events (project_id, creator_id, title, description, start_time, end_time, event_type, is_recurring) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [project_id, creator_id, title, description, start_time, end_time, event_type, is_recurring]
        );
    }

    static async update(id, { title, description, start_time, end_time, event_type, is_recurring }) {
        return run(
            'UPDATE calendar_events SET title = ?, description = ?, start_time = ?, end_time = ?, event_type = COALESCE(?, event_type), is_recurring = COALESCE(?, is_recurring) WHERE id = ?',
            [title, description, start_time, end_time, event_type, is_recurring, id]
        );
    }

    static async delete(id) {
        return run('DELETE FROM calendar_events WHERE id = ?', [id]);
    }
}

module.exports = CalendarEvent;
