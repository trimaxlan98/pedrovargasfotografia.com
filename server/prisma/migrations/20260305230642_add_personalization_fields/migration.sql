-- AlterTable
ALTER TABLE "digital_invitations" ADD COLUMN "defaultGuestName" TEXT DEFAULT 'Familia y Amigos';
ALTER TABLE "digital_invitations" ADD COLUMN "guestGreeting" TEXT DEFAULT 'Hola';

-- AlterTable
ALTER TABLE "invitation_guests" ADD COLUMN "personalizedMessage" TEXT;
