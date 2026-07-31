const { run, get, all } = require('../config/db');

class FileModel {
    static async findAllByProject(projectId) {
        // Get all files with their latest version info
        return all(`
            SELECT f.*, u.name as uploader_name, 
                   v.id as latest_version_id, v.version_number, v.file_path, v.uploaded_at
            FROM files f
            LEFT JOIN users u ON f.uploader_id = u.id
            LEFT JOIN file_versions v ON v.file_id = f.id
            WHERE f.project_id = ?
            AND v.version_number = (
                SELECT MAX(version_number) FROM file_versions WHERE file_id = f.id
            )
            ORDER BY f.created_at DESC
        `, [projectId]);
    }

    static async findAllByTask(taskId) {
        return all(`
            SELECT f.*, u.name as uploader_name, 
                   v.id as latest_version_id, v.version_number, v.file_path, v.uploaded_at
            FROM files f
            LEFT JOIN users u ON f.uploader_id = u.id
            LEFT JOIN file_versions v ON v.file_id = f.id
            WHERE f.task_id = ?
            AND v.version_number = (
                SELECT MAX(version_number) FROM file_versions WHERE file_id = f.id
            )
            ORDER BY f.created_at DESC
        `, [taskId]);
    }

    static async findByNameAndProject(name, projectId) {
        return get('SELECT * FROM files WHERE name = $1 AND project_id = $2', [name, projectId]);
    }

    static async findById(fileId) {
        return get('SELECT * FROM files WHERE id = $1', [fileId]);
    }

    static async findVersionById(versionId) {
        return get(`
            SELECT v.*, f.name, f.project_id
            FROM file_versions v
            JOIN files f ON v.file_id = f.id
            WHERE v.id = ?
        `, [versionId]);
    }

    static async getVersions(fileId) {
        return all('SELECT * FROM file_versions WHERE file_id = ? ORDER BY version_number DESC', [fileId]);
    }

    static async createFileWithVersion({ project_id, uploader_id, name, description, file_path, task_id, category, filetype, size, tags }) {
        // Insert logical file
        const fileRes = await run(
            'INSERT INTO files (project_id, uploader_id, name, description, task_id, category, filetype, size, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
            [project_id, uploader_id, name, description, task_id || null, category || 'other', filetype, size, tags || null]
        );
        const fileId = fileRes.id;

        // Insert first version
        await run(
            'INSERT INTO file_versions (file_id, version_number, file_path) VALUES (?, ?, ?)',
            [fileId, 1, file_path]
        );
        return fileId;
    }

    static async addVersion({ file_id, file_path }) {
        const latest = await get('SELECT MAX(version_number) as max_v FROM file_versions WHERE file_id = ?', [file_id]);
        const nextVersion = (latest.max_v || 0) + 1;
        
        await run(
            'INSERT INTO file_versions (file_id, version_number, file_path) VALUES (?, ?, ?)',
            [file_id, nextVersion, file_path]
        );
        return nextVersion;
    }
    static async create({ project_id, uploader_id, name, description, file_path, filetype, size, tags }) {
        return run(
            'INSERT INTO files (project_id, uploader_id, name, description, file_path, filetype, size, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
            [project_id, uploader_id, name, description, file_path, filetype, size, tags || null]
        );
    }
}

module.exports = FileModel;
