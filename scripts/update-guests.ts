import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating GUEST users to STUDENT...');
  const result = await prisma.user.updateMany({
    where: { role: 'GUEST' },
    data: { role: 'STUDENT' },
  });
  console.log(`Successfully updated ${result.count} users from GUEST to STUDENT.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
