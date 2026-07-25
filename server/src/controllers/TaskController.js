const Task = require('../models/Task');
const { getIo } = require('../socket');

exports.getAllByProject = async (req, res) => {
    try {
        const tasks = await Task.findAllByProject(req.params.projectId);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const { project_id, title } = req.body;
        if (!project_id || !title) return res.status(400).json({ error: 'Project ID and title are required' });
        await Task.create(req.body);
        res.status(201).json({ message: 'Task created' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.update = async (req, res) => {
    try {
        await Task.update(req.params.id, req.body);
        
        try {
            getIo().emit('task:updated', { taskId: req.params.id, updates: req.body });
        } catch(e) {}
        
        res.json({ message: 'Task updated' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.delete = async (req, res) => {
    try {
        await Task.delete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.suggestPriority = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.status(400).json({ error: 'Description required' });
        const desc = description.toLowerCase();
        let priority = "Low";
        if (desc.includes("urgent") || desc.includes("critical") || desc.includes("bug")) {
            priority = "High";
        } else if (desc.includes("feature") || desc.includes("enhancement")) {
            priority = "Medium";
        }
        res.json({ suggested_priority: priority });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.toggleTimer = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { action } = req.body; // 'start' or 'stop'
        
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        
        let updates = {};
        if (action === 'start' && task.timer_status === 'stopped') {
            updates.timer_status = 'running';
            // In sqlite we can use CURRENT_TIMESTAMP or JS Date
            updates.last_timer_start = new Date().toISOString().replace('T', ' ').substring(0, 19); 
        } else if (action === 'stop' && task.timer_status === 'running') {
            updates.timer_status = 'stopped';
            if (task.last_timer_start) {
                // calculate diff in minutes
                const start = new Date(task.last_timer_start + 'Z');
                const now = new Date();
                const diffMins = Math.floor((now - start) / 60000);
                updates.time_spent = (task.time_spent || 0) + diffMins;
                updates.last_timer_start = null;
            }
        }
        
        if (Object.keys(updates).length > 0) {
            await Task.update(taskId, updates);
            const updatedTask = await Task.findById(taskId);
            try { getIo().emit('task:updated', { taskId, updates }); } catch(e) {}
            return res.json(updatedTask);
        }
        
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
