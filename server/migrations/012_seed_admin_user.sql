-- 012_seed_admin_user.sql
-- Seeds the admin user (Yash) into the users table if not already present.
-- Password hash is bcrypt('2006', rounds=10)

INSERT INTO users (name, email, password_hash, role)
SELECT 'Yash', 'khebadeyash1234@gmail.com', '$2b$10$abgAEoorHIfq..1VuB/0s.qnI3a/fL4ufy8skfHC/j4xqH8BBbgFe', 'Admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE LOWER(email) = 'khebadeyash1234@gmail.com'
);
