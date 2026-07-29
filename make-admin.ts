import "dotenv/config";
import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function makeAdmin() {
  const email = 'gowrigowtham1106@gmail.com';
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  
  console.log(`Successfully made ${user.name} (${user.email}) an ADMIN!`);
}

makeAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
