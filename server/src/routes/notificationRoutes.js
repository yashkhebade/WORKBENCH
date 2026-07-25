const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', NotificationController.getNotifications);

module.exports = router;
