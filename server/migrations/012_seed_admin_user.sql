-- 012_seed_admin_user.sql
-- Safely upserts admin user without relying on UNIQUE constraint.
-- Uses INSERT WHERE NOT EXISTS + UPDATE pattern.

-- Step 1: Insert only if email doesn't exist yet
INSERT INTO users (name, email, password_hash, role)
SELECT 'Yash', 'khebadeyash1234@gmail.com', '$2b$10$hDQ.hLcN9GDyjX3NfhvGfeUZb7w8xY6wUiZ3Knf4inbPJPJYl2sdO', 'Admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE LOWER(email) = 'khebadeyash1234@gmail.com'
);

-- Step 2: Always update the password to the latest value (handles existing users too)
UPDATE users SET
    password_hash = '$2b$10$hDQ.hLcN9GDyjX3NfhvGfeUZb7w8xY6wUiZ3Knf4inbPJPJYl2sdO',
    name = 'Yash',
    role = 'Admin'
WHERE LOWER(email) = 'khebadeyash1234@gmail.com';
