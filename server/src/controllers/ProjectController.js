const Project = require('../models/Project');

exports.getAll = async (req, res) => {
    try {
        const projects = req.user.role === 'Admin'
            ? await Project.findAll()
            : await Project.findAllForUser(req.user.id);
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, description, subject_id } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Project name is required' });
        
        const { get } = require('../config/db');
        const existing = await get('SELECT id FROM projects WHERE LOWER(name) = LOWER($1)', [name.trim()]);
        if (existing) {
            return res.status(400).json({ error: 'A project with this name already exists' });
        }

        const result = await Project.create({ name: name.trim(), description, subject_id });
        if (req.user) {
            await Project.addMember(result.lastID, req.user.id, 'owner');
        }
        res.status(201).json({ message: 'Project created', id: result.lastID });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.archive = async (req, res) => {
    try {
        const { run } = require('../config/db');
        await run('UPDATE projects SET archived = true WHERE id = $1', [req.params.id]);
        res.json({ message: 'Project archived successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.update = async (req, res) => {
    try {
        await Project.update(req.params.id, req.body);
        res.json({ message: 'Project updated' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateState = async (req, res) => {
    try {
        const { workflow_state } = req.body;
        if (!workflow_state) return res.status(400).json({ error: 'Workflow state required' });
        await Project.updateState(req.params.id, workflow_state);
        res.json({ message: 'Project state updated', workflow_state });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateWorkflowSteps = async (req, res) => {
    try {
        const { steps } = req.body;
        if (!Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({ error: 'steps must be a non-empty array' });
        }
        await Project.updateWorkflowSteps(req.params.id, steps);
        const project = await Project.findById(req.params.id);
        res.json({ message: 'Workflow steps updated', steps, project });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.delete = async (req, res) => {
    try {
        await Project.delete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { user_id, role } = req.body;
        if (!user_id) return res.status(400).json({ error: 'User ID is required' });
        await Project.addMember(req.params.id, user_id, role || 'member');
        res.json({ message: 'Member added successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMembers = async (req, res) => {
    try {
        const members = await Project.getMembers(req.params.id);
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
