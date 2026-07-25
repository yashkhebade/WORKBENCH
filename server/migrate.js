const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.serialize(() => {
    // files updates
    db.run('ALTER TABLE files ADD COLUMN task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE', () => {});
    db.run('ALTER TABLE files ADD COLUMN category TEXT DEFAULT "other"', () => {});
    
    // activity logs
    db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER,
        action_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {});
    
    // tasks updates
    db.run('ALTER TABLE tasks ADD COLUMN time_spent INTEGER DEFAULT 0', () => {});
    db.run('ALTER TABLE tasks ADD COLUMN timer_status TEXT DEFAULT "stopped"', () => {});
    db.run('ALTER TABLE tasks ADD COLUMN last_timer_start DATETIME', () => {});
    
    // projects updates
    db.run('ALTER TABLE projects ADD COLUMN repository_url TEXT', () => {});
    
    console.log('Schema migration complete');
});
