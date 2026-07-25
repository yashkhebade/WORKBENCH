const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');
const { authenticate } = require('../middlewares/auth');
const { requireProjectAccess } = require('../middlewares/projectAccess');

router.use(authenticate); // Protect all project routes

const byIdParam = (req) => req.params.id;

router.get('/', ProjectController.getAll); // already filtered by membership in the controller
router.get('/:id', requireProjectAccess(byIdParam), ProjectController.getById);
router.post('/', ProjectController.create); // no existing project to check yet; creator is auto-added as owner
router.put('/:id', requireProjectAccess(byIdParam), ProjectController.update);
router.put('/:id/state', requireProjectAccess(byIdParam), ProjectController.updateState);
router.put('/:id/workflow-steps', requireProjectAccess(byIdParam), ProjectController.updateWorkflowSteps);
router.delete('/:id', requireProjectAccess(byIdParam), ProjectController.delete);

router.post('/:id/members', requireProjectAccess(byIdParam), ProjectController.addMember);
router.get('/:id/members', requireProjectAccess(byIdParam), ProjectController.getMembers);

module.exports = router;
