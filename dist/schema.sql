-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "eventDate" TEXT,
    "service" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "eventType" TEXT NOT NULL,
    "venue" TEXT,
    "guestCount" INTEGER,
    "budget" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "adminNotes" TEXT,
    "totalPrice" REAL,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolio_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TEXT,
    "location" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "iconName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "digital_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "names" TEXT NOT NULL,
    "eventDate" TEXT NOT NULL,
    "eventTime" TEXT,
    "venue" TEXT,
    "message" TEXT,
    "template" TEXT NOT NULL DEFAULT 'elegante',
    "primaryColor" TEXT NOT NULL DEFAULT '#1a2744',
    "textColor" TEXT NOT NULL DEFAULT '#F5F0E8',
    "fontStyle" TEXT NOT NULL DEFAULT 'serif',
    "isDark" BOOLEAN NOT NULL DEFAULT true,
    "dressCode" TEXT,
    "rsvpContact" TEXT,
    "shareToken" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "digital_invitations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "phone" TEXT NOT NULL DEFAULT '+52 55 1234 5678',
    "email" TEXT NOT NULL DEFAULT 'hola@studiolumiere.mx',
    "address" TEXT NOT NULL DEFAULT 'Ciudad de México, CDMX',
    "instagram" TEXT,
    "facebook" TEXT,
    "whatsapp" TEXT,
    "aboutText" TEXT,
    "heroTitle" TEXT NOT NULL DEFAULT 'Cada Momento Contado en Luz',
    "heroSubtitle" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "digital_invitations_shareToken_key" ON "digital_invitations"("shareToken");
/*
  Warnings:

  - You are about to drop the column `rsvpContact` on the `digital_invitations` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "invitation_guests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "response" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invitation_guests_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "digital_invitations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_digital_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "names" TEXT NOT NULL,
    "eventDate" TEXT NOT NULL,
    "eventTime" TEXT,
    "venue" TEXT,
    "locationNote" TEXT,
    "message" TEXT,
    "quote" TEXT,
    "hashtag" TEXT,
    "template" TEXT NOT NULL DEFAULT 'elegante',
    "primaryColor" TEXT NOT NULL DEFAULT '#1a2744',
    "textColor" TEXT NOT NULL DEFAULT '#F5F0E8',
    "fontStyle" TEXT NOT NULL DEFAULT 'serif',
    "isDark" BOOLEAN NOT NULL DEFAULT true,
    "dressCode" TEXT,
    "rsvpLabel" TEXT,
    "rsvpValue" TEXT,
    "gallery" TEXT,
    "shareToken" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "rsvpDeadline" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "digital_invitations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_digital_invitations" ("clientId", "createdAt", "dressCode", "eventDate", "eventTime", "eventType", "fontStyle", "id", "isDark", "isPublished", "message", "names", "primaryColor", "shareToken", "template", "textColor", "title", "updatedAt", "venue", "views") SELECT "clientId", "createdAt", "dressCode", "eventDate", "eventTime", "eventType", "fontStyle", "id", "isDark", "isPublished", "message", "names", "primaryColor", "shareToken", "template", "textColor", "title", "updatedAt", "venue", "views" FROM "digital_invitations";
DROP TABLE "digital_invitations";
ALTER TABLE "new_digital_invitations" RENAME TO "digital_invitations";
CREATE UNIQUE INDEX "digital_invitations_shareToken_key" ON "digital_invitations"("shareToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "invitation_guests_token_key" ON "invitation_guests"("token");
-- AlterTable
ALTER TABLE "digital_invitations" ADD COLUMN "defaultGuestName" TEXT DEFAULT 'Familia y Amigos';
ALTER TABLE "digital_invitations" ADD COLUMN "guestGreeting" TEXT DEFAULT 'Hola';

-- AlterTable
ALTER TABLE "invitation_guests" ADD COLUMN "personalizedMessage" TEXT;
-- Add archival columns for soft-delete/history workflow
ALTER TABLE "bookings" ADD COLUMN "archivedAt" DATETIME;
ALTER TABLE "bookings" ADD COLUMN "archiveReason" TEXT;

ALTER TABLE "digital_invitations" ADD COLUMN "archivedAt" DATETIME;
ALTER TABLE "digital_invitations" ADD COLUMN "archiveReason" TEXT;

CREATE INDEX "bookings_archivedAt_idx" ON "bookings"("archivedAt");
CREATE INDEX "digital_invitations_archivedAt_idx" ON "digital_invitations"("archivedAt");
