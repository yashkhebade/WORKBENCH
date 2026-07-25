-- Add workflow columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT 'Ideation';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workflow_steps TEXT;
