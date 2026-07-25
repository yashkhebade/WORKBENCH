const Note = require('../models/Note');

exports.getProjectNotes = async (req, res) => {
    try {
        const notes = await Note.findAllByProject(req.params.projectId);
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.searchNotes = async (req, res) => {
    try {
        const { projectId, q } = req.query;
        if (!q) return res.json([]);
        const notes = await Note.search(projectId, q);
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getVersions = async (req, res) => {
    try {
        const versions = await Note.getVersions(req.params.id);
        res.json(versions);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const payload = { ...req.body, author_id: req.user.id };
        await Note.create(payload);
        res.status(201).json({ message: 'Note created' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.update = async (req, res) => {
    try {
        await Note.update(req.params.id, { ...req.body, author_id: req.user.id });
        res.json({ message: 'Note updated' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.delete = async (req, res) => {
    try {
        await Note.delete(req.params.id);
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
