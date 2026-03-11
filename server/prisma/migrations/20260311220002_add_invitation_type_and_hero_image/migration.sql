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
    "invitationType" TEXT NOT NULL DEFAULT 'general',
    "heroImage" TEXT,
    "gallery" TEXT,
    "shareToken" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "rsvpDeadline" DATETIME,
    "archivedAt" DATETIME,
    "archiveReason" TEXT,
    "guestGreeting" TEXT DEFAULT 'Hola',
    "defaultGuestName" TEXT DEFAULT 'Familia y Amigos',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "digital_invitations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_digital_invitations" ("archiveReason", "archivedAt", "clientId", "createdAt", "defaultGuestName", "dressCode", "eventDate", "eventTime", "eventType", "fontStyle", "gallery", "guestGreeting", "hashtag", "id", "isDark", "isPublished", "locationNote", "message", "names", "primaryColor", "quote", "rsvpDeadline", "rsvpLabel", "rsvpValue", "shareToken", "template", "textColor", "title", "updatedAt", "venue", "views") SELECT "archiveReason", "archivedAt", "clientId", "createdAt", "defaultGuestName", "dressCode", "eventDate", "eventTime", "eventType", "fontStyle", "gallery", "guestGreeting", "hashtag", "id", "isDark", "isPublished", "locationNote", "message", "names", "primaryColor", "quote", "rsvpDeadline", "rsvpLabel", "rsvpValue", "shareToken", "template", "textColor", "title", "updatedAt", "venue", "views" FROM "digital_invitations";
DROP TABLE "digital_invitations";
ALTER TABLE "new_digital_invitations" RENAME TO "digital_invitations";
CREATE UNIQUE INDEX "digital_invitations_shareToken_key" ON "digital_invitations"("shareToken");
CREATE INDEX "digital_invitations_archivedAt_idx" ON "digital_invitations"("archivedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
