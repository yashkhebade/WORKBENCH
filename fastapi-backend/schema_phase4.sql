-- PHASE 4: Advanced Features Integration

-- 1. Git/VCS Integration
ALTER TABLE projects ADD COLUMN IF NOT EXISTS repository_url VARCHAR(255);

-- 2. Time Tracking FSM
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0; -- in minutes
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS timer_status VARCHAR(50) DEFAULT 'stopped'; -- 'running', 'stopped'
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_timer_start TIMESTAMP WITH TIME ZONE;
