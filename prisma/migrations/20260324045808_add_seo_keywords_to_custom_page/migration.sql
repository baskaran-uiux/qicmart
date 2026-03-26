-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "upiProofImage" TEXT;
ALTER TABLE "Payment" ADD COLUMN "upiUTR" TEXT;

-- CreateTable
CREATE TABLE "CustomPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "template" TEXT NOT NULL DEFAULT 'default',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomPage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SIMPLE',
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "cost" REAL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "barcode" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "attributes" TEXT NOT NULL DEFAULT '[]',
    "variations" TEXT NOT NULL DEFAULT '[]',
    "weight" REAL,
    "length" REAL,
    "width" REAL,
    "height" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "focusKeyword" TEXT,
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("attributes", "barcode", "categoryId", "compareAtPrice", "cost", "createdAt", "description", "height", "id", "images", "isActive", "isBestSeller", "length", "name", "price", "sku", "slug", "stock", "storeId", "type", "updatedAt", "variations", "weight", "width") SELECT "attributes", "barcode", "categoryId", "compareAtPrice", "cost", "createdAt", "description", "height", "id", "images", "isActive", "isBestSeller", "length", "name", "price", "sku", "slug", "stock", "storeId", "type", "updatedAt", "variations", "weight", "width" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "logo" TEXT,
    "banner" TEXT,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "themeConfig" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPlatformDisabled" BOOLEAN NOT NULL DEFAULT false,
    "isStorefrontDisabled" BOOLEAN NOT NULL DEFAULT false,
    "isAdminPanelDisabled" BOOLEAN NOT NULL DEFAULT false,
    "razorpayKeyId" TEXT,
    "razorpayKeySecret" TEXT,
    "razorpayWebhookSecret" TEXT,
    "isRazorpayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "upiId" TEXT,
    "upiName" TEXT,
    "isUpiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customDomain" TEXT,
    "isDomainVerified" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "favicon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Store" ("banner", "createdAt", "currency", "customDomain", "description", "id", "isActive", "isAdminPanelDisabled", "isDomainVerified", "isPlatformDisabled", "isRazorpayEnabled", "isStorefrontDisabled", "logo", "name", "ownerId", "razorpayKeyId", "razorpayKeySecret", "razorpayWebhookSecret", "slug", "themeConfig", "updatedAt") SELECT "banner", "createdAt", "currency", "customDomain", "description", "id", "isActive", "isAdminPanelDisabled", "isDomainVerified", "isPlatformDisabled", "isRazorpayEnabled", "isStorefrontDisabled", "logo", "name", "ownerId", "razorpayKeyId", "razorpayKeySecret", "razorpayWebhookSecret", "slug", "themeConfig", "updatedAt" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");
CREATE UNIQUE INDEX "Store_customDomain_key" ON "Store"("customDomain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CustomPage_storeId_slug_key" ON "CustomPage"("storeId", "slug");
