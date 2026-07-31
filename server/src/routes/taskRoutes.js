const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');
const { authenticate } = require('../middlewares/auth');
const { requireProjectAccess } = require('../middlewares/projectAccess');
const Task = require('../models/Task');

router.use(authenticate); // Protect all task routes

const fromUrlProjectId = (req) => req.params.projectId;
const fromBodyProjectId = (req) => req.body.project_id;
const fromTaskLookup = async (req) => {
    const task = await Task.findById(req.params.id);
    return task && task.project_id;
};

router.get('/project/:projectId', requireProjectAccess(fromUrlProjectId), TaskController.getAllByProject);
router.post('/', requireProjectAccess(fromBodyProjectId), TaskController.create);
router.post('/suggest-priority', TaskController.suggestPriority); // stateless helper, no project data touched
router.put('/:id', requireProjectAccess(fromTaskLookup), TaskController.update);
router.get('/:id/comments', requireProjectAccess(fromTaskLookup), TaskController.getComments);
router.post('/:id/comments', requireProjectAccess(fromTaskLookup), TaskController.addComment);

module.exports = router;
