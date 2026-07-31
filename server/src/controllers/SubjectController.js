const Subject = require('../models/Subject');

exports.getAll = async (req, res) => {
    try {
        const subjects = await Subject.findAll();
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        
        await Subject.create(name);
        res.status(201).json({ message: 'Subject created' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
