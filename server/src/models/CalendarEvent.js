const { run, get, all } = require('../config/db');

class CalendarEvent {
    static async findAllByProject(projectId) {
        return all('SELECT * FROM calendar_events WHERE project_id = ? ORDER BY start_time ASC', [projectId]);
    }

    static async create({ project_id, creator_id, title, description, start_time, end_time }) {
        return run(
            'INSERT INTO calendar_events (project_id, creator_id, title, description, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
            [project_id, creator_id, title, description, start_time, end_time]
        );
    }

    static async update(id, { title, description, start_time, end_time }) {
        return run(
            'UPDATE calendar_events SET title = ?, description = ?, start_time = ?, end_time = ? WHERE id = ?',
            [title, description, start_time, end_time, id]
        );
    }

    static async delete(id) {
        return run('DELETE FROM calendar_events WHERE id = ?', [id]);
    }
}

module.exports = CalendarEvent;
