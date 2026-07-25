const { all } = require('../config/db');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Dynamic notifications: tasks due soon
        const upcomingTasks = await all(`
            SELECT id, title, due_date, project_id 
            FROM tasks 
            WHERE assignee_id = ? 
              AND status != 'Done'
              AND due_date IS NOT NULL
              AND due_date <= NOW() + INTERVAL '1 day'
              AND due_date >= NOW() - INTERVAL '1 day'
        `, [userId]);
        
        const notifications = upcomingTasks.map(t => ({
            id: `task_${t.id}`,
            message: `Task "${t.title}" is due soon!`,
            type: 'reminder'
        }));
        
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
