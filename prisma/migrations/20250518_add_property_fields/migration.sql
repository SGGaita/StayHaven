-- AlterTable
ALTER TABLE "Property" ADD COLUMN "cleaningFee" DOUBLE PRECISION,
                       ADD COLUMN "securityDeposit" DOUBLE PRECISION,
                       ADD COLUMN "checkInTime" TEXT,
                       ADD COLUMN "checkOutTime" TEXT,
                       ADD COLUMN "houseRules" JSONB,
                       ADD COLUMN "customRules" JSONB,
                       ADD COLUMN "bedrooms" INTEGER NOT NULL DEFAULT 1,
                       ADD COLUMN "beds" INTEGER NOT NULL DEFAULT 1,
                       ADD COLUMN "bathrooms" INTEGER NOT NULL DEFAULT 1,
                       ADD COLUMN "maxGuests" INTEGER NOT NULL DEFAULT 1,
                       ADD COLUMN "minimumStay" INTEGER NOT NULL DEFAULT 1,
                       ADD COLUMN "maximumStay" INTEGER NOT NULL DEFAULT 30,
                       ADD COLUMN "instantBooking" BOOLEAN NOT NULL DEFAULT false; 