const express = require('express');
const router = express.Router();
const teamController = require('../controllers/TeamController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/members', teamController.getTeamMembers);
router.post('/invite', teamController.inviteMember);
router.delete('/members/:id', teamController.removeMember);

module.exports = router;
