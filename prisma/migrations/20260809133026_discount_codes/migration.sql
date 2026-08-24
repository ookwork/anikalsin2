-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "eventCity" TEXT,
    "deliveryAddress" TEXT,
    "rentalStart" DATETIME NOT NULL,
    "rentalEnd" DATETIME NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "adminNote" TEXT,
    "frameId" TEXT,
    "framePriceAtBooking" INTEGER,
    "discountCodeId" TEXT,
    "discountAmount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "Frame" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("adminNote", "createdAt", "customerEmail", "customerName", "customerPhone", "deliveryAddress", "eventCity", "frameId", "framePriceAtBooking", "id", "note", "productId", "quantity", "rentalEnd", "rentalStart", "status", "updatedAt") SELECT "adminNote", "createdAt", "customerEmail", "customerName", "customerPhone", "deliveryAddress", "eventCity", "frameId", "framePriceAtBooking", "id", "note", "productId", "quantity", "rentalEnd", "rentalStart", "status", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE INDEX "Reservation_productId_rentalStart_rentalEnd_idx" ON "Reservation"("productId", "rentalStart", "rentalEnd");
CREATE INDEX "Reservation_frameId_idx" ON "Reservation"("frameId");
CREATE INDEX "Reservation_discountCodeId_idx" ON "Reservation"("discountCodeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

