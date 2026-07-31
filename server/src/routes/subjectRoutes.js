const express = require('express');
const router = express.Router();
const SubjectController = require('../controllers/SubjectController');

router.get('/', SubjectController.getAll);
router.post('/', SubjectController.create);

module.exports = router;
