import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding database...');

  // 1. Create a Trainer
  const trainer = await prisma.trainer.upsert({
    where: { email: 'trainer@gmtraining.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'trainer@gmtraining.com',
      specialization: 'Full Stack Development',
      bio: 'Expert in React and Node.js',
      avatar: 'https://i.pravatar.cc/150?u=trainer',
      rating: 4.8,
      experience: '5 years',
    },
  });
  console.log(`Created trainer: ${trainer.name}`);

  // 2. Create a Course
  const course = await prisma.course.create({
    data: {
      title: 'Full Stack Web Development Bootcamp',
      description: 'Learn full stack web development from scratch.',
      shortDescription: 'Master React, Node.js, and databases.',
      price: 99.99,
      discountPrice: 49.99,
      category: 'Web Development',
      level: 'Beginner',
      duration: '40 hours',
      isPublished: true,
      trainerId: trainer.id,
    },
  });
  console.log(`Created course: ${course.title}`);

  // 3. Create a Module
  const module = await prisma.module.create({
    data: {
      title: 'Introduction to React',
      description: 'Basics of React, components, and state.',
      order: 1,
      courseId: course.id,
    },
  });
  console.log(`Created module: ${module.title}`);

  // 4. Create Lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'What is React?',
      description: 'Understanding the React library.',
      order: 1,
      duration: '10 mins',
      isFree: true,
      moduleId: module.id,
    },
  });
  
  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Components and Props',
      description: 'Building reusable UI components.',
      order: 2,
      duration: '15 mins',
      isFree: false,
      moduleId: module.id,
    },
  });
  console.log(`Created lessons: ${lesson1.title}, ${lesson2.title}`);

  // 5. Create a Student
  const student = await prisma.student.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      name: 'Alice Smith',
      email: 'student@example.com',
      avatar: 'https://i.pravatar.cc/150?u=student',
    },
  });
  console.log(`Created student: ${student.name}`);

  // 6. Create an Enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      paymentStatus: 'completed',
    },
  });
  console.log(`Enrolled student in course.`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
