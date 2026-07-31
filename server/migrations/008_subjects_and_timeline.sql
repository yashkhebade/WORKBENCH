-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add subject_id to projects (nullable initially to prevent errors on existing rows)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL;

-- Create default subject and assign existing projects
INSERT INTO subjects (name) SELECT 'General' WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'General');
UPDATE projects SET subject_id = (SELECT id FROM subjects WHERE name = 'General') WHERE subject_id IS NULL;

-- Tags for files and notes
ALTER TABLE files ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT;

-- Enhance files table for MVP 
ALTER TABLE files ADD COLUMN IF NOT EXISTS filetype TEXT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS size INTEGER;
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_path TEXT;
