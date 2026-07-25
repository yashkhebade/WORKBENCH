-- PHASE 3: Project Workflow FSM

-- 1. Add workflow_state to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workflow_state VARCHAR(50) DEFAULT 'Ideation';
