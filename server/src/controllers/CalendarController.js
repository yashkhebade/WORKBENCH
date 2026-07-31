const CalendarEvent = require('../models/CalendarEvent');
const Task = require('../models/Task');

exports.getUnifiedCalendar = async (req, res) => {
    try {
        const projectId = req.params.projectId || req.query.projectId;
        
        // Fetch standalone events
        const events = await CalendarEvent.findAllByProject(projectId);
        
        // Fetch tasks to extract due dates as events
        let tasks = [];
        if (!projectId || projectId === 'all') {
            const { all } = require('../config/db');
            tasks = await all('SELECT * FROM tasks WHERE due_date IS NOT NULL');
        } else {
            tasks = await Task.findAllByProject(projectId);
        }
        
        // Map to a unified format
        const unified = [
            ...events.map(e => ({
                id: `evt_${e.id}`,
                title: e.title,
                start: e.start_time,
                end: e.end_time || e.start_time,
                type: e.event_type || 'meeting',
                is_recurring: e.is_recurring,
                raw: e
            })),
            ...tasks.filter(t => t.due_date).map(t => ({
                id: `tsk_${t.id}`,
                title: `Task Due: ${t.title}`,
                start: t.due_date,
                end: t.due_date,
                type: 'deadline',
                is_recurring: false,
                raw: t
            }))
        ];
        
        res.json(unified);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { project_id, title, description, start_time, end_time, event_type, is_recurring } = req.body;
        if (!title || !start_time) {
            return res.status(400).json({ error: 'Title and start time are required' });
        }
        await CalendarEvent.create({
            project_id: project_id || null,
            creator_id: req.user.id,
            title,
            description,
            start_time,
            end_time: end_time || start_time,
            event_type: event_type || 'meeting',
            is_recurring: !!is_recurring
        });
        res.status(201).json({ message: 'Event created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        // Strip evt_ prefix if passed
        const id = req.params.id.replace('evt_', '');
        await CalendarEvent.delete(id);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const id = req.params.id.replace('evt_', '');
        const { title, description, start_time, end_time, event_type, is_recurring } = req.body;
        // If it's a task, update task due date
        if (req.params.id.startsWith('tsk_')) {
            const taskId = req.params.id.replace('tsk_', '');
            await Task.update(taskId, { due_date: start_time });
        } else {
            await CalendarEvent.update(id, { title, description, start_time, end_time, event_type, is_recurring });
        }
        res.json({ message: 'Event updated' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
