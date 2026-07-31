const express = require('express');
const router = express.Router();
const TimelineController = require('../controllers/TimelineController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', TimelineController.getTimeline);

module.exports = router;
