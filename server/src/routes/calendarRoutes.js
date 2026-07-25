const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/CalendarController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/project/:projectId', CalendarController.getUnifiedCalendar);
router.post('/', CalendarController.createEvent);
router.put('/:id', CalendarController.updateEvent);
router.delete('/:id', CalendarController.deleteEvent);

module.exports = router;
