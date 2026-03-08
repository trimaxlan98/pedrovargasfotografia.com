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
