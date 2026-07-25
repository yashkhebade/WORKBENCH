const express = require('express');
const router = express.Router();
const FileController = require('../controllers/FileController');
const { authenticate } = require('../middlewares/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Setup storage folder per project
const storageLocation = process.env.STORAGE_LOCATION || './uploads';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const projectId = req.params.projectId;
        const dir = path.join(storageLocation, `project_${projectId}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // unique filename on disk to avoid conflicts, DB tracks original name
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

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
