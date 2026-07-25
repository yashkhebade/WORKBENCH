const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/NoteController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/search', NoteController.searchNotes);
router.get('/project/:projectId', NoteController.getProjectNotes);
router.get('/:id/versions', NoteController.getVersions);
router.post('/', NoteController.create);
router.put('/:id', NoteController.update);
router.delete('/:id', NoteController.delete);

module.exports = router;
