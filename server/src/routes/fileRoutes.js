const express = require('express');
const router = express.Router();
const FileController = require('../controllers/FileController');
const { authenticate } = require('../middlewares/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Use memory storage so we can forward the buffer directly to Telegram without writing to disk
const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    limits: { fileSize: (process.env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024 }
});

router.use(authenticate);

router.post('/project/:projectId', upload.single('file'), FileController.uploadFile);
router.get('/project/:projectId', FileController.getProjectFiles);
router.get('/task/:taskId', FileController.getTaskFiles);
router.get('/:fileId/versions', FileController.getFileVersions);
router.get('/download/:versionId', FileController.downloadOrPreview);

module.exports = router;
