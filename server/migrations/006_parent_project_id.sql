-- Add parent_project_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS parent_project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE;
