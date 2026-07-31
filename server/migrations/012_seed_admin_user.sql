-- 012_seed_admin_user.sql
-- Upserts the admin user with new password hash for '2006@Yash'

INSERT INTO users (name, email, password_hash, role)
VALUES ('Yash', 'khebadeyash1234@gmail.com', '$2b$10$a.fYbFOnchMXFsQiUspkEuKrSJy2dfFDOJptR/zyzGIt8JEQa4PYa', 'Admin')
ON CONFLICT (email) DO UPDATE SET
    password_hash = '$2b$10$a.fYbFOnchMXFsQiUspkEuKrSJy2dfFDOJptR/zyzGIt8JEQa4PYa',
    name = 'Yash',
    role = 'Admin';
