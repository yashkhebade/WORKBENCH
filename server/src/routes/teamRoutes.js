const express = require('express');
const router = express.Router();
const teamController = require('../controllers/TeamController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/members', teamController.getTeamMembers);
router.post('/invite', teamController.inviteMember);
router.delete('/members/:id', teamController.removeMember);

module.exports = router;
