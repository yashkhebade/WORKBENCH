const { all } = require('../config/db');

exports.getTimeline = async (req, res) => {
    try {
        const { subject_id, project_id, search, filter_type, filter_tag } = req.query;
        let params = [];
        
        // Use 1=0 to completely disable a subquery if it doesn't match the type filter
        let fileWhere = (!filter_type || filter_type === 'all' || filter_type === 'file') ? '1=1' : '1=0';
        let noteWhere = (!filter_type || filter_type === 'all' || filter_type === 'note' || filter_type === 'milestone') ? '1=1' : '1=0';
        
        if (filter_type === 'milestone') {
            noteWhere += ` AND n.is_milestone = 1`;
        } else if (filter_type === 'note') {
            noteWhere += ` AND (n.is_milestone = 0 OR n.is_milestone IS NULL)`;
        }
        
        let paramIndex = 1;
        if (subject_id) {
            fileWhere += ` AND p.subject_id = $${paramIndex}`;
            noteWhere += ` AND p.subject_id = $${paramIndex}`;
            params.push(subject_id);
            paramIndex++;
        }
        
        if (project_id) {
            fileWhere += ` AND f.project_id = $${paramIndex}`;
            noteWhere += ` AND n.project_id = $${paramIndex}`;
            params.push(project_id);
            paramIndex++;
        }
        
        if (search) {
            const searchTerm = `%${search}%`;
            fileWhere += ` AND (f.name ILIKE $${paramIndex} OR f.tags ILIKE $${paramIndex} OR f.description ILIKE $${paramIndex})`;
            noteWhere += ` AND (n.title ILIKE $${paramIndex} OR n.tags ILIKE $${paramIndex} OR n.content_markdown ILIKE $${paramIndex})`;
            params.push(searchTerm);
            paramIndex++;
        }
        
        if (filter_tag && filter_tag !== 'all') {
            const tagTerm = `%${filter_tag}%`;
            fileWhere += ` AND f.tags ILIKE $${paramIndex}`;
            noteWhere += ` AND n.tags ILIKE $${paramIndex}`;
            params.push(tagTerm);
            paramIndex++;
        }

        // Unified query combining files and notes
        const query = `
            SELECT 
                'file' as type,
                f.id,
                f.name as title,
                f.description as content,
                f.tags,
                f.created_at,
                f.filetype,
                f.size,
                false as is_milestone,
                p.name as project_name,
                p.subject_id,
                s.name as subject_name,
                u.name as author_name,
                v.id as version_id
            FROM files f
            JOIN projects p ON f.project_id = p.id
            LEFT JOIN subjects s ON p.subject_id = s.id
            LEFT JOIN users u ON f.uploader_id = u.id
            LEFT JOIN file_versions v ON v.file_id = f.id AND v.version_number = (SELECT MAX(version_number) FROM file_versions WHERE file_id = f.id)
            WHERE ${fileWhere}
            
            UNION ALL
            
            SELECT 
                'note' as type,
                n.id,
                n.title,
                n.content_markdown as content,
                n.tags,
                n.created_at,
                NULL as filetype,
                NULL as size,
                COALESCE(n.is_milestone, false) as is_milestone,
                p.name as project_name,
                p.subject_id,
                s.name as subject_name,
                u.name as author_name,
                NULL as version_id
            FROM notes n
            LEFT JOIN projects p ON n.project_id = p.id
            LEFT JOIN subjects s ON p.subject_id = s.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE ${noteWhere}
            
            ORDER BY created_at DESC
        `;
        
        const items = await all(query, params);
        res.json(items);
    } catch (err) {
        console.error('Timeline error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
