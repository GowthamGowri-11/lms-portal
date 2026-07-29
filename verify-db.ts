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

async function verify() {
  console.log("Checking NeonDB counts...");
  const users = await prisma.user.count();
  const trainers = await prisma.trainer.count();
  const courses = await prisma.course.count();
  const modules = await prisma.module.count();
  const lessons = await prisma.lesson.count();
  const devs = await prisma.developer.count();

  console.log(`Users: ${users}`);
  console.log(`Trainers: ${trainers}`);
  console.log(`Courses: ${courses}`);
  console.log(`Modules: ${modules}`);
  console.log(`Lessons: ${lessons}`);
  console.log(`Developers: ${devs}`);
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
