-- Add missing fields to Booking table
ALTER TABLE "Booking" ADD COLUMN "bookingRef" TEXT UNIQUE;
ALTER TABLE "Booking" ADD COLUMN "guests" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Booking" ADD COLUMN "subtotal" DOUBLE PRECISION NOT NULL;
ALTER TABLE "Booking" ADD COLUMN "cleaningFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN "securityDeposit" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Update existing bookings with calculated values and generated booking references
UPDATE "Booking" 
SET 
  "bookingRef" = CONCAT('BK-', SUBSTRING(id::text, 1, 8)),
  "subtotal" = "price",
  "guests" = 1; 