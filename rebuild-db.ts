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

async function rebuild() {
  console.log('Rebuilding missing base data...');

  // 1. Ensure Trainer exists
  let trainer = await prisma.trainer.findUnique({ where: { email: 'trainer@gmtraining.com' } });
  if (!trainer) {
    trainer = await prisma.trainer.create({
      data: {
        name: 'John Doe',
        email: 'trainer@gmtraining.com',
        specialization: 'Programming Languages',
        bio: 'Expert in Python, Java, and C++',
        avatar: 'https://i.pravatar.cc/150?u=trainer',
        rating: 4.8,
        experience: '5 years',
      },
    });
    console.log('Created Trainer:', trainer.name);
  }

  // 2. Ensure Developer exists
  const dev = await prisma.developer.create({
    data: {
      name: 'Gowtham',
      role: 'Developer',
    }
  });
  console.log('Created Developer:', dev.name);

  // 3. Recreate base courses
  const courseNames = ['Python', 'Java', 'C++'];
  for (const title of courseNames) {
    let c = await prisma.course.findFirst({ where: { title } });
    if (!c) {
      c = await prisma.course.create({
        data: {
          title,
          description: `Master ${title} from scratch.`,
          shortDescription: `Complete ${title} course`,
          price: 49.99,
          category: 'Programming',
          level: 'Beginner',
          duration: '30 hours',
          isPublished: true,
          trainerId: trainer.id,
        }
      });
      console.log('Created Course:', c.title);
      
      // Create 20 empty modules so the seed scripts can populate them
      for (let i = 0; i < 20; i++) {
        await prisma.module.create({
          data: {
            title: `Module ${i+1}`,
            order: i,
            courseId: c.id
          }
        });
      }
      console.log(`Created 20 empty modules for ${title}.`);
    }
  }

  console.log('Base database successfully rebuilt! You can now run the seed endpoints.');
}

rebuild()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
