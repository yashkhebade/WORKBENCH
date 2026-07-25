const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.serialize(() => {
    // projects updates
    db.run('ALTER TABLE projects ADD COLUMN parent_project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE', () => {});
    
    // project members
    db.run(`CREATE TABLE IF NOT EXISTS project_members (
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        PRIMARY KEY (project_id, user_id)
    )`, () => {});
    
    console.log('Project features schema migration complete');
});
