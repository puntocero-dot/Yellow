-- =============================================
-- MIGRATION: Security Update for Production
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add password_hash column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Update admin user email and password
UPDATE users 
SET email = 'admin@theyellowexpress.com',
    password_hash = '$2b$10$AhJwzzI./j8Mr5YDLnFTBeuGRhDBsJ15cdz62ym7uU/HQ3Ab9/U7O'
WHERE role = 'admin' AND email LIKE '%admin%';

-- 3. Update driver users email and password
UPDATE users 
SET email = 'driver1@theyellowexpress.com',
    password_hash = '$2b$10$Hcv6Qul/kIsUAGMFxm9rheZ9yHl44NLfuGE5FtZVDdnRQy.pewdQy'
WHERE role = 'driver' AND (email LIKE '%driver1%' OR full_name = 'Carlos Martínez');

UPDATE users 
SET email = 'driver2@theyellowexpress.com',
    password_hash = '$2b$10$Hcv6Qul/kIsUAGMFxm9rheZ9yHl44NLfuGE5FtZVDdnRQy.pewdQy'
WHERE role = 'driver' AND (email LIKE '%driver2%' OR full_name = 'María López');

-- 4. If no users exist yet, insert them
INSERT INTO users (email, full_name, phone, role, password_hash)
SELECT 'admin@theyellowexpress.com', 'Admin Yellow Express', '+1 323 555 0100', 'admin', '$2b$10$AhJwzzI./j8Mr5YDLnFTBeuGRhDBsJ15cdz62ym7uU/HQ3Ab9/U7O'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@theyellowexpress.com');

INSERT INTO users (email, full_name, phone, role, password_hash)
SELECT 'driver1@theyellowexpress.com', 'Carlos Martínez', '+503 7890 1234', 'driver', '$2b$10$Hcv6Qul/kIsUAGMFxm9rheZ9yHl44NLfuGE5FtZVDdnRQy.pewdQy'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'driver1@theyellowexpress.com');

INSERT INTO users (email, full_name, phone, role, password_hash)
SELECT 'driver2@theyellowexpress.com', 'María López', '+503 7890 5678', 'driver', '$2b$10$Hcv6Qul/kIsUAGMFxm9rheZ9yHl44NLfuGE5FtZVDdnRQy.pewdQy'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'driver2@theyellowexpress.com');

-- 5. Verify the update
SELECT id, email, full_name, role, 
  CASE WHEN password_hash IS NOT NULL THEN 'SET' ELSE 'NOT SET' END as password_status
FROM users;
