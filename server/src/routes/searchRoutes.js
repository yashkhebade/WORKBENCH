const express = require('express');
const router = express.Router();
const searchController = require('../controllers/SearchController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', searchController.globalSearch);

module.exports = router;
