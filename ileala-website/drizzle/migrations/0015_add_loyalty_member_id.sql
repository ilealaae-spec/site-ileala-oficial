-- Add unique Member ID column to loyalty_members table
-- Format: ILA-XXXXXX (e.g., ILA-000001)

-- Add the memberId column
ALTER TABLE "loyalty_members"
ADD COLUMN IF NOT EXISTS "memberId" VARCHAR(20) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_loyalty_members_member_id" ON "loyalty_members" ("memberId");

-- Update existing members with generated memberIds based on their id
UPDATE "loyalty_members"
SET "memberId" = 'ILA-' || LPAD(id::text, 6, '0')
WHERE "memberId" IS NULL;
