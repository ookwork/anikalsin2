-- CreateTable
CREATE TABLE "ProductModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "installmentInfo" TEXT,
    "modelId" TEXT,
    "colorName" TEXT,
    "colorHex" TEXT,
    "stockCount" INTEGER NOT NULL DEFAULT 1,
    "featuredImageUrl" TEXT,
    "videoUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProductModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "description", "featuredImageUrl", "id", "installmentInfo", "isActive", "metaDescription", "metaTitle", "name", "order", "price", "shortDescription", "slug", "stockCount", "updatedAt", "videoUrl", "colorName")
SELECT "createdAt", "description", "featuredImageUrl", "id", "installmentInfo", "isActive", "metaDescription", "metaTitle", "name", "order", "price", "shortDescription", "slug", "stockCount", "updatedAt", "videoUrl", json_extract("colorOptions", '$[0]')
FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_modelId_idx" ON "Product"("modelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ProductModel_slug_key" ON "ProductModel"("slug");
