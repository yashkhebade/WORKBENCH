const express = require('express');
const router = express.Router();
const searchController = require('../controllers/SearchController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', searchController.globalSearch);

module.exports = router;
