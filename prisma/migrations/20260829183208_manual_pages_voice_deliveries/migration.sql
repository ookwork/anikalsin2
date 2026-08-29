-- CreateTable
CREATE TABLE "ManualPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "setupText" TEXT,
    "usageText" TEXT,
    "chargeText" TEXT,
    "careText" TEXT,
    "returnText" TEXT,
    "videoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ManualPage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ManualPageImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manualPageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ManualPageImage_manualPageId_fkey" FOREIGN KEY ("manualPageId") REFERENCES "ManualPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "driveUrl" TEXT,
    "message" TEXT,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VoiceDelivery_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ManualPage_productId_key" ON "ManualPage"("productId");

-- CreateIndex
CREATE INDEX "ManualPageImage_manualPageId_idx" ON "ManualPageImage"("manualPageId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceDelivery_reservationId_key" ON "VoiceDelivery"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceDelivery_accessToken_key" ON "VoiceDelivery"("accessToken");
