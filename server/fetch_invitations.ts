import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const invitations = await prisma.digitalInvitation.findMany({
    take: 2,
    include: {
      client: true,
      guests: true
    }
  });

  console.log(JSON.stringify(invitations, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
