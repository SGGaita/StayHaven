# Migration `20250519_update_booking_model`

This migration adds the missing fields to the Booking model to align the database schema with the Prisma schema definition.

## Changes

- Added `bookingRef` as a unique text field
- Added `guests` as an integer with default value 1
- Added `subtotal` as a required double precision field
- Added `cleaningFee` as a double precision field with default value 0
- Added `serviceFee` as a double precision field with default value 0
- Added `securityDeposit` as a double precision field with default value 0
- Updated existing bookings with calculated values and generated booking references 