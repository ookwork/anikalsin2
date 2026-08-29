/*
  Warnings:

  - You are about to drop the `ManualPageImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `careText` on the `ManualPage` table. All the data in the column will be lost.
  - You are about to drop the column `chargeText` on the `ManualPage` table. All the data in the column will be lost.
  - You are about to drop the column `returnText` on the `ManualPage` table. All the data in the column will be lost.
  - You are about to drop the column `setupText` on the `ManualPage` table. All the data in the column will be lost.
  - You are about to drop the column `usageText` on the `ManualPage` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `ManualPage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ManualPageImage_manualPageId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ManualPageImage";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ManualPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ManualPage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ManualPage" ("createdAt", "id", "isPublished", "productId", "updatedAt") SELECT "createdAt", "id", "isPublished", "productId", "updatedAt" FROM "ManualPage";
DROP TABLE "ManualPage";
ALTER TABLE "new_ManualPage" RENAME TO "ManualPage";
CREATE UNIQUE INDEX "ManualPage_productId_key" ON "ManualPage"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
