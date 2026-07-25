const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', DashboardController.getDashboardData);

module.exports = router;
