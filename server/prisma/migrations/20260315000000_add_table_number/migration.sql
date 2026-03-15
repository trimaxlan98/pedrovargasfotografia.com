-- Add enableTableNumber to digital_invitations
ALTER TABLE "digital_invitations" ADD COLUMN "enableTableNumber" BOOLEAN NOT NULL DEFAULT false;

-- Add tableNumber to invitation_guests
ALTER TABLE "invitation_guests" ADD COLUMN "tableNumber" INTEGER;
