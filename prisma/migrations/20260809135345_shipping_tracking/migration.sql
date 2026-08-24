-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "shippingCarrier" TEXT;
ALTER TABLE "Reservation" ADD COLUMN "shippingDate" DATETIME;
ALTER TABLE "Reservation" ADD COLUMN "shippingTrackingNumber" TEXT;

