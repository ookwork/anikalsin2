-- AlterTable
ALTER TABLE "AddOn" ADD COLUMN "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "eventDate" DATETIME;

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "productId" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "BlockedDate_date_idx" ON "BlockedDate"("date");

-- CreateIndex
CREATE INDEX "BlockedDate_productId_idx" ON "BlockedDate"("productId");
