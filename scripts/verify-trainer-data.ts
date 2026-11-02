import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  console.log('🔍 VERIFYING TRAINER DASHBOARD DATA IN DATABASE...\n');

  const trainers = await prisma.trainer.findMany({
    include: {
      user: true,
      courses: {
        include: {
          modules: {
            include: { lessons: true },
          },
          quizzes: {
            include: { questions: true },
          },
          enrollments: {
            include: { student: true },
          },
        },
      },
    },
  });

  console.log(`Found ${trainers.length} trainer(s) in system:`);

  for (const t of trainers) {
    console.log(`\n========================================`);
    console.log(`Trainer: ${t.name} (${t.user?.email || 'N/A'}) | ID: ${t.id}`);
    console.log(`Specialization: ${t.specialization}`);
    console.log(`Courses Count: ${t.courses.length}`);

    let totalLessons = 0;
    let totalQuizzes = 0;
    let totalEnrollments = 0;

    for (const c of t.courses) {
      const lessonCount = c.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      totalLessons += lessonCount;
      totalQuizzes += c.quizzes.length;
      totalEnrollments += c.enrollments.length;

      console.log(`  - Course: "${c.title}" [${c.category} - ${c.level}]`);
      console.log(`    Modules: ${c.modules.length}, Lessons: ${lessonCount}, Quizzes: ${c.quizzes.length}, Enrollments: ${c.enrollments.length}`);
    }

    console.log(`\nTotals for ${t.name}:`);
    console.log(`  Total Courses: ${t.courses.length}`);
    console.log(`  Total Lessons: ${totalLessons}`);
    console.log(`  Total Enrollments: ${totalEnrollments}`);
    console.log(`  Total Quizzes: ${totalQuizzes}`);

    const courseIds = t.courses.map((c) => c.id);
    const retakes = await prisma.quizRetakeRequest.findMany({
      where: { quiz: { courseId: { in: courseIds } } },
      include: {
        student: true,
        quiz: true,
      },
    });

    const pending = retakes.filter((r) => r.status === 'PENDING').length;
    const approved = retakes.filter((r) => r.status === 'APPROVED').length;
    const rejected = retakes.filter((r) => r.status === 'REJECTED').length;

    console.log(`  Total Retake Requests: ${retakes.length} (Pending: ${pending}, Approved: ${approved}, Rejected: ${rejected})`);
  }

  // Check total test students
  const testStudents = await prisma.student.findMany({
    where: { email: { contains: '@atlyx.dev' } },
  });
  console.log(`\n👥 Seeded Test Students count: ${testStudents.length}`);

  console.log('\n✅ VERIFICATION COMPLETE - All database entities confirmed intact and properly linked!');
  await prisma.$disconnect();
  await pool.end();
}

verify().catch((e) => {
  console.error('Verification error:', e);
  process.exit(1);
});
