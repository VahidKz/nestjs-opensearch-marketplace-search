CREATE TYPE "FreshnessGrade" AS ENUM ('AMBIENT', 'CHILLED', 'FROZEN', 'FRESH');

CREATE TABLE "Supplier" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "rating" DECIMAL(3, 2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "stockQuantity" INTEGER NOT NULL DEFAULT 0,
  "freshnessGrade" "FreshnessGrade" NOT NULL,
  "tags" TEXT[],
  "allergens" TEXT[],
  "deliveryRegions" TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "indexedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier"("slug");
CREATE INDEX "Supplier_country_city_idx" ON "Supplier"("country", "city");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_categoryId_isActive_idx" ON "Product"("categoryId", "isActive");
CREATE INDEX "Product_supplierId_isActive_idx" ON "Product"("supplierId", "isActive");
CREATE INDEX "Product_updatedAt_idx" ON "Product"("updatedAt");

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_supplierId_fkey"
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
