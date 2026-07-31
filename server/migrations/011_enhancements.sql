-- 011_enhancements.sql

-- Add avatar_url to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add archived flag to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add event_type and recurrence to calendar_events
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'meeting';
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team invites table
CREATE TABLE IF NOT EXISTS team_invites (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clean dummy test tasks & duplicate test projects
DELETE FROM tasks WHERE title IN ('ytr', 'yash', 'test', 'Test task');
DELETE FROM projects p1 USING projects p2 WHERE LOWER(p1.name) = LOWER(p2.name) AND p1.id > p2.id AND LOWER(p1.name) IN ('test_proj', 'yash');
