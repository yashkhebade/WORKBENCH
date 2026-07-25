-- PHASE 2: Categorized File Containers & Real-Time Logging

-- 1. Add category to files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other';

-- 2. Create activity_logs table for real-time tracking
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER DEFAULT 1, -- Mocked user ID for now
    action_type VARCHAR(100) NOT NULL, -- e.g., 'file_uploaded', 'task_created', 'project_created'
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'file', 'task', 'project'
    entity_id INTEGER NOT NULL,
    details TEXT, -- Optional JSON or text details about the action
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
