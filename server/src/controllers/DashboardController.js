const { all, get } = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. 4 Stat Cards (Current)
        const stats = await get(`
            SELECT 
                (SELECT COUNT(*) FROM projects WHERE status != 'Done' AND COALESCE(archived, false) = false) as active_projects,
                (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND status != 'Done') as my_tasks,
                (SELECT COUNT(*) FROM tasks WHERE status = 'In Progress') as in_progress,
                (SELECT COUNT(*) FROM tasks WHERE status = 'Done') as completed_tasks
        `, [userId]);

        // 1b. 4 Stat Cards (7 days ago, for trends)
        const prevStats = await get(`
            SELECT 
                (SELECT COUNT(*) FROM projects WHERE status != 'Done' AND COALESCE(archived, false) = false AND created_at < NOW() - INTERVAL '7 days') as active_projects,
                (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND status != 'Done' AND created_at < NOW() - INTERVAL '7 days') as my_tasks,
                (SELECT COUNT(*) FROM tasks WHERE status = 'In Progress' AND created_at < NOW() - INTERVAL '7 days') as in_progress,
                (SELECT COUNT(*) FROM tasks WHERE status = 'Done' AND created_at < NOW() - INTERVAL '7 days') as completed_tasks
        `, [userId]);
        
        // Calculate trends
        const calcTrend = (curr, prev) => {
            const diff = parseInt(curr || 0) - parseInt(prev || 0);
            return {
                value: diff > 0 ? `+${diff}` : diff.toString(),
                trendUp: diff >= 0
            };
        };

        const trends = {
            active_projects: calcTrend(stats.active_projects, prevStats.active_projects),
            my_tasks: calcTrend(stats.my_tasks, prevStats.my_tasks),
            in_progress: calcTrend(stats.in_progress, prevStats.in_progress),
            completed_tasks: calcTrend(stats.completed_tasks, prevStats.completed_tasks)
        };

        // 1c. "This Week" Urgency Summary
        const thisWeek = await get(`
            SELECT
                (SELECT COUNT(*) FROM tasks WHERE due_date >= NOW() AND due_date <= NOW() + INTERVAL '7 days' AND status != 'Done') as due_this_week,
                (SELECT COUNT(*) FROM tasks WHERE due_date < NOW() AND status != 'Done') as overdue_count
        `);

        // 2. Active Projects List with Owner details & Timestamps
        const activeProjectsList = await all(`
            SELECT p.id, p.name, p.status, p.workflow_state, p.workflow_steps, p.updated_at, p.created_at,
                (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
                (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Done') as completed_tasks,
                COALESCE(u.name, 'Admin') as owner_name,
                u.avatar_url as owner_avatar
            FROM projects p
            LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.role = 'owner'
            LEFT JOIN users u ON pm.user_id = u.id
            WHERE p.status != 'Done' AND COALESCE(p.archived, false) = false
            ORDER BY p.updated_at DESC
        `);

        // 3. My Tasks (Prioritized)
        const myTasksList = await all(`
            SELECT id, title, priority, status, due_date
            FROM tasks
            WHERE assignee_id = $1 AND status != 'Done'
            ORDER BY 
                CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
                due_date ASC
            LIMIT 5
        `, [userId]);

        // 4. Upcoming Deadlines
        const upcomingDeadlines = await all(`
            SELECT 'event' as type, title, start_time as date
            FROM calendar_events
            WHERE start_time >= NOW() AND start_time <= NOW() + INTERVAL '7 days'
            
            UNION ALL
            
            SELECT 'task' as type, title, due_date as date
            FROM tasks
            WHERE due_date >= NOW() AND due_date <= NOW() + INTERVAL '7 days' AND status != 'Done'
            
            ORDER BY date ASC
            LIMIT 5
        `);

        // 5. Recent Files
        const recentFiles = await all(`
            SELECT f.id, f.name, v.version_number, v.uploaded_at, COALESCE(u.name, 'Member') as uploader_name
            FROM files f
            JOIN file_versions v ON f.id = v.file_id
            LEFT JOIN users u ON f.uploader_id = u.id
            ORDER BY v.uploaded_at DESC
            LIMIT 5
        `);

        // 6. Activity Feed with Real User Name Resolution
        const activityFeed = await all(`
            SELECT 'task' as type, t.title as name, t.created_at as time, 'Task created' as action, COALESCE(u.name, 'Team Member') as user_name 
            FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
            UNION ALL
            SELECT 'file' as type, f.name, v.uploaded_at as time, 'File uploaded (v' || CAST(v.version_number AS TEXT) || ')' as action, COALESCE(u.name, 'Team Member') as user_name
            FROM files f JOIN file_versions v ON f.id = v.file_id LEFT JOIN users u ON f.uploader_id = u.id
            UNION ALL
            SELECT 'note' as type, n.title as name, n.created_at as time, 'Note created' as action, COALESCE(u.name, 'Team Member') as user_name
            FROM notes n LEFT JOIN users u ON n.author_id = u.id
            ORDER BY time DESC
            LIMIT 10
        `);

        res.json({
            stats,
            trends,
            thisWeek,
            activeProjects: activeProjectsList,
            myTasks: myTasksList,
            deadlines: upcomingDeadlines,
            recentFiles,
            activity: activityFeed
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
