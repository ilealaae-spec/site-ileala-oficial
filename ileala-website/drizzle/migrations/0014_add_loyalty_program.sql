-- Loyalty Program for ILE ALA
-- Tiers: Green (0-1499 AED), Silver (1500-3999 AED), Gold (4000-7499 AED), Platinum (7500+ AED)

-- Main loyalty members table
CREATE TABLE IF NOT EXISTS "loyalty_members" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE REFERENCES "users"("id"),

  -- Tier information
  "tier" VARCHAR(20) DEFAULT 'green' NOT NULL,

  -- Spending tracking (in fils)
  "totalSpentAllTime" INTEGER DEFAULT 0 NOT NULL,
  "totalSpentCurrentYear" INTEGER DEFAULT 0 NOT NULL,
  "yearStartDate" TIMESTAMP DEFAULT NOW() NOT NULL,

  -- Order tracking
  "totalOrders" INTEGER DEFAULT 0 NOT NULL,

  -- Benefits tracking
  "freeShippingUsed" INTEGER DEFAULT 0 NOT NULL,
  "birthdayGiftClaimed" INTEGER DEFAULT 0 NOT NULL,

  -- Member info
  "birthday" TIMESTAMP,
  "whatsappNumber" VARCHAR(50),
  "preferredLanguage" VARCHAR(5) DEFAULT 'en',

  -- Tier history
  "tierUpgradedAt" TIMESTAMP,
  "previousTier" VARCHAR(20),

  -- Status
  "active" INTEGER DEFAULT 1 NOT NULL,
  "joinedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tier benefits configuration table
CREATE TABLE IF NOT EXISTS "loyalty_tier_benefits" (
  "id" SERIAL PRIMARY KEY,
  "tier" VARCHAR(20) NOT NULL UNIQUE,

  -- Spending thresholds (in fils)
  "minSpend" INTEGER DEFAULT 0 NOT NULL,
  "maxSpend" INTEGER,

  -- Discount benefits
  "discountPercent" INTEGER DEFAULT 0 NOT NULL,

  -- Shipping benefits
  "freeStandardShipping" INTEGER DEFAULT 0 NOT NULL,
  "freeExpressShipping" INTEGER DEFAULT 0 NOT NULL,

  -- Access benefits
  "earlyAccessHours" INTEGER DEFAULT 0 NOT NULL,
  "exclusiveProducts" INTEGER DEFAULT 0 NOT NULL,

  -- Special benefits
  "birthdayReward" INTEGER DEFAULT 0 NOT NULL,
  "prioritySupport" INTEGER DEFAULT 0 NOT NULL,
  "personalConcierge" INTEGER DEFAULT 0 NOT NULL,
  "eventInvites" INTEGER DEFAULT 0 NOT NULL,
  "surpriseGifts" INTEGER DEFAULT 0 NOT NULL,

  -- Display
  "displayNameEN" VARCHAR(100) NOT NULL,
  "displayNamePT" VARCHAR(100) NOT NULL,
  "cardColor" VARCHAR(50) NOT NULL,
  "cardGradient" VARCHAR(255),
  "iconUrl" VARCHAR(512),

  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Activity log for tracking member activities
CREATE TABLE IF NOT EXISTS "loyalty_activity_log" (
  "id" SERIAL PRIMARY KEY,
  "memberId" INTEGER NOT NULL REFERENCES "loyalty_members"("id"),

  "activityType" VARCHAR(50) NOT NULL,
  "description" TEXT,

  -- For purchases
  "orderId" INTEGER REFERENCES "orders"("id"),
  "amountSpent" INTEGER,

  -- Tier changes
  "fromTier" VARCHAR(20),
  "toTier" VARCHAR(20),

  -- Metadata
  "metadata" TEXT,

  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_loyalty_members_user" ON "loyalty_members" ("userId");
CREATE INDEX IF NOT EXISTS "idx_loyalty_members_tier" ON "loyalty_members" ("tier");
CREATE INDEX IF NOT EXISTS "idx_loyalty_activity_member" ON "loyalty_activity_log" ("memberId");
CREATE INDEX IF NOT EXISTS "idx_loyalty_activity_type" ON "loyalty_activity_log" ("activityType");

-- Insert default tier configurations
INSERT INTO "loyalty_tier_benefits" (
  "tier", "minSpend", "maxSpend", "discountPercent",
  "freeStandardShipping", "freeExpressShipping",
  "earlyAccessHours", "exclusiveProducts",
  "birthdayReward", "prioritySupport", "personalConcierge", "eventInvites", "surpriseGifts",
  "displayNameEN", "displayNamePT", "cardColor", "cardGradient"
) VALUES
-- GREEN: 0 - 1,499 AED (0 - 149,900 fils)
(
  'green', 0, 149900, 0,
  0, 0,
  0, 0,
  0, 0, 0, 0, 0,
  'Green Member', 'Membro Green',
  '#255238', 'linear-gradient(135deg, #255238 0%, #1a3d28 100%)'
),
-- SILVER: 1,500 - 3,999 AED (150,000 - 399,900 fils)
(
  'silver', 150000, 399900, 0,
  1, 0,
  0, 0,
  1, 0, 0, 0, 0,
  'Silver Member', 'Membro Silver',
  '#9CA3AF', 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)'
),
-- GOLD: 4,000 - 7,499 AED (400,000 - 749,900 fils)
(
  'gold', 400000, 749900, 0,
  1, 1,
  24, 0,
  1, 1, 0, 0, 0,
  'Gold Member', 'Membro Gold',
  '#D4AF37', 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)'
),
-- PLATINUM: 7,500+ AED (750,000+ fils)
(
  'platinum', 750000, NULL, 0,
  1, 1,
  48, 1,
  1, 1, 1, 1, 1,
  'Platinum Member', 'Membro Platinum',
  '#1a1a1a', 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 50%, #3d3d3d 100%)'
)
ON CONFLICT ("tier") DO NOTHING;
