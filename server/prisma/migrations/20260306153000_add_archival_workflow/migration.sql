-- Add archival columns for soft-delete/history workflow
ALTER TABLE "bookings" ADD COLUMN "archivedAt" DATETIME;
ALTER TABLE "bookings" ADD COLUMN "archiveReason" TEXT;

ALTER TABLE "digital_invitations" ADD COLUMN "archivedAt" DATETIME;
ALTER TABLE "digital_invitations" ADD COLUMN "archiveReason" TEXT;

CREATE INDEX "bookings_archivedAt_idx" ON "bookings"("archivedAt");
CREATE INDEX "digital_invitations_archivedAt_idx" ON "digital_invitations"("archivedAt");
