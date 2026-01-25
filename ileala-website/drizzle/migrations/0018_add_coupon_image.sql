-- Add imageUrl field to coupons table for promotional images
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- Add showInPopup field to control which coupon appears in the welcome popup
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "showInPopup" INTEGER DEFAULT 0 NOT NULL;

-- Add description fields for the coupon (shown in popup)
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "titleEN" VARCHAR(255);
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "titlePT" VARCHAR(255);
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "descriptionEN" TEXT;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "descriptionPT" TEXT;

-- Create index for popup lookup
CREATE INDEX IF NOT EXISTS "coupons_show_in_popup_idx" ON "coupons" ("showInPopup");
