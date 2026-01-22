-- Run this in Neon SQL Editor to check the newsletter table structure

-- 1. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'newsletter'
ORDER BY ordinal_position;

-- 2. Check if id column exists and see some data
SELECT * FROM newsletter LIMIT 5;

-- 3. If id column doesn't exist, add it:
-- ALTER TABLE newsletter ADD COLUMN id SERIAL PRIMARY KEY;

-- 4. If table structure is wrong, you may need to recreate it:
-- DROP TABLE newsletter;
-- CREATE TABLE newsletter (
--   id SERIAL PRIMARY KEY,
--   email VARCHAR(255) NOT NULL UNIQUE,
--   name VARCHAR(255),
--   subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL,
--   active INTEGER DEFAULT 1 NOT NULL,
--   source VARCHAR(50) DEFAULT 'website' NOT NULL
-- );
