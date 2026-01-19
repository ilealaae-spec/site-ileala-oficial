-- Gift Cards table for ILE ALA
-- Allows customers to purchase and send gift cards

CREATE TABLE IF NOT EXISTS "gift_cards" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(16) NOT NULL UNIQUE,
  "amount" INTEGER NOT NULL,
  "balanceRemaining" INTEGER NOT NULL,
  "status" VARCHAR(20) DEFAULT 'pending' NOT NULL,
  "purchasedBy" INTEGER REFERENCES "users"("id"),
  "purchasedAt" TIMESTAMP,
  "orderId" INTEGER,
  "recipientEmail" VARCHAR(320) NOT NULL,
  "recipientName" VARCHAR(255),
  "senderName" VARCHAR(255),
  "message" TEXT,
  "deliveryType" VARCHAR(20) DEFAULT 'immediate' NOT NULL,
  "scheduledDate" TIMESTAMP,
  "deliveredAt" TIMESTAMP,
  "validUntil" TIMESTAMP NOT NULL,
  "redeemedBy" INTEGER REFERENCES "users"("id"),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_gift_cards_code" ON "gift_cards" ("code");
CREATE INDEX IF NOT EXISTS "idx_gift_cards_status" ON "gift_cards" ("status");
CREATE INDEX IF NOT EXISTS "idx_gift_cards_recipient" ON "gift_cards" ("recipientEmail");
CREATE INDEX IF NOT EXISTS "idx_gift_cards_scheduled" ON "gift_cards" ("scheduledDate") WHERE "deliveryType" = 'scheduled' AND "status" = 'active' AND "deliveredAt" IS NULL;
