const { get } = require('../config/db');

/**
 * Checks whether a given user is a member of a given project.
 * Admins bypass this check entirely (see requireProjectAccess below).
 */
async function isMember(projectId, userId) {
    if (!projectId || !userId) return false;
    const row = await get(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
    );
    return !!row;
}

/**
 * Route-guard factory. Pass in a function that resolves the relevant
 * project_id from the request (params, body, or a DB lookup via a
 * task/file id). Admins always pass. Everyone else must be a row in
 * project_members for that project.
 *
 * Usage:
 *   router.get('/:id', requireProjectAccess(req => req.params.id), Controller.getById);
 *   router.put('/:id', requireProjectAccess(async req => {
 *       const task = await Task.findById(req.params.id);
 *       return task && task.project_id;
 *   }), Controller.update);
 */
function requireProjectAccess(resolveProjectId) {
    return async (req, res, next) => {
        try {
            if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
            if (req.user.role === 'Admin') return next();

            const projectId = await resolveProjectId(req);
            if (!projectId) return res.status(404).json({ error: 'Not found' });

            const member = await isMember(projectId, req.user.id);
            if (!member) {
                return res.status(403).json({ error: 'Forbidden: you are not a member of this project' });
            }
            next();
        } catch (err) {
            console.error('Project access check failed:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

module.exports = { requireProjectAccess, isMember };
