-- AlterTable: add new sections fields for the invitation landing page experience
ALTER TABLE "digital_invitations" ADD COLUMN "ceremonyVenue" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "ceremonyAddress" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "ceremonyTime" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "ceremonyPhoto" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "ceremonyMapUrl" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "receptionVenue" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "receptionAddress" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "receptionTime" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "receptionPhoto" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "receptionMapUrl" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "parentsInfo" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "sponsorsInfo" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "giftsInfo" TEXT;
ALTER TABLE "digital_invitations" ADD COLUMN "instagramHandle" TEXT;
