import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const courseModules: Record<string, { section: string; lessons: string[] }[]> = {
  frontend: [
    { section: 'HTML Foundations', lessons: ['HTML Basics', 'HTML Forms', 'Semantic HTML'] },
    { section: 'CSS Mastery', lessons: ['CSS Basics', 'Flexbox', 'Grid', 'Responsive Design'] },
    { section: 'JavaScript Core', lessons: ['JavaScript Intro', 'DOM Manipulation', 'ES6+ Features'] },
    { section: 'React & Ecosystem', lessons: ['React Basics', 'Hooks & State', 'Redux', 'API Integration'] },
    { section: 'Deployment', lessons: ['Build & Deploy'] },
  ],
  backend: [
    { section: 'Node.js Foundations', lessons: ['Node.js Basics', 'Express Framework', 'REST API Design'] },
    { section: 'Authentication & Security', lessons: ['Authentication', 'JWT & Sessions'] },
    { section: 'Databases', lessons: ['MongoDB', 'Prisma ORM', 'PostgreSQL'] },
    { section: 'Advanced Topics', lessons: ['File Upload', 'Deployment'] },
  ],
  java: [
    { section: 'Java Basics', lessons: ['Variables & Types', 'Conditions', 'Loops', 'Arrays'] },
    { section: 'Object-Oriented Programming', lessons: ['Methods', 'OOP Concepts', 'Collections', 'Exception Handling'] },
    { section: 'Advanced Java', lessons: ['Threads & Concurrency', 'Spring Boot'] },
  ],
  python: [
    { section: 'Python Basics', lessons: ['Variables & Types', 'Loops & Conditions', 'Functions'] },
    { section: 'OOP & Modules', lessons: ['OOP in Python', 'File Handling', 'Modules & Packages'] },
    { section: 'Data Science', lessons: ['NumPy', 'Pandas'] },
    { section: 'Web Development', lessons: ['Flask', 'Django'] },
  ],
};

async function main() {
  console.log('🌱 Seeding database...');

  // ===== Trainers =====
  const trainer1 = await prisma.trainer.upsert({
    where: { email: 'arjun@gmtraining.com' },
    update: {},
    create: {
      name: 'Arjun Sharma',
      email: 'arjun@gmtraining.com',
      specialization: 'Full Stack Development',
      bio: '10+ years building scalable web apps with React, Node.js and cloud technologies.',
      rating: 4.9,
      experience: '10 years',
    },
  });

  const trainer2 = await prisma.trainer.upsert({
    where: { email: 'priya@gmtraining.com' },
    update: {},
    create: {
      name: 'Priya Nair',
      email: 'priya@gmtraining.com',
      specialization: 'UI/UX & Frontend Development',
      bio: 'Award-winning designer and frontend developer with expertise in Figma and React.',
      rating: 4.8,
      experience: '8 years',
    },
  });

  const trainer3 = await prisma.trainer.upsert({
    where: { email: 'ravi@gmtraining.com' },
    update: {},
    create: {
      name: 'Ravi Kumar',
      email: 'ravi@gmtraining.com',
      specialization: 'Java & Backend Development',
      bio: 'Senior Java developer with 12 years in enterprise software and Spring Boot.',
      rating: 4.7,
      experience: '12 years',
    },
  });

  const trainer4 = await prisma.trainer.upsert({
    where: { email: 'ananya@gmtraining.com' },
    update: {},
    create: {
      name: 'Ananya Patel',
      email: 'ananya@gmtraining.com',
      specialization: 'Python & Data Science',
      bio: 'Data scientist and Python expert with experience in ML and web frameworks.',
      rating: 4.8,
      experience: '7 years',
    },
  });

  // ===== Courses =====
  const courses = [
    {
      id: 'course-frontend',
      title: 'Complete Frontend Development Bootcamp',
      description: 'Master HTML, CSS, JavaScript and React from scratch. Build production-ready projects and deploy them to the cloud.',
      shortDescription: 'Build modern web interfaces with HTML, CSS, JS and React.',
      logo: '⚛️',
      price: 4999,
      discountPrice: 1999,
      category: 'Web Development',
      level: 'Beginner',
      duration: '52 hours',
      studentsEnrolled: 1540,
      rating: 4.9,
      tags: JSON.stringify(['HTML', 'CSS', 'JavaScript', 'React', 'Redux', 'Responsive Design']),
      syllabus: JSON.stringify(['HTML & CSS', 'JavaScript', 'React', 'Redux', 'API Integration', 'Deployment']),
      trainerId: trainer1.id,
      moduleKey: 'frontend',
    },
    {
      id: 'course-backend',
      title: 'Node.js & Express Backend Mastery',
      description: 'Build powerful REST APIs and backend services with Node.js, Express, JWT auth, MongoDB and PostgreSQL.',
      shortDescription: 'Build scalable backends with Node.js, Express and databases.',
      logo: '🟢',
      price: 4499,
      discountPrice: 1799,
      category: 'Web Development',
      level: 'Intermediate',
      duration: '44 hours',
      studentsEnrolled: 980,
      rating: 4.8,
      tags: JSON.stringify(['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST API', 'JWT']),
      syllabus: JSON.stringify(['Node.js', 'Express', 'REST APIs', 'Auth', 'Databases', 'Deployment']),
      trainerId: trainer1.id,
      moduleKey: 'backend',
    },
    {
      id: 'course-java',
      title: 'Java Programming – Zero to Spring Boot',
      description: 'Complete Java course covering basics through OOP, Collections, Exception Handling, Threads and Spring Boot.',
      shortDescription: 'Master Java from fundamentals to enterprise Spring Boot development.',
      logo: '☕',
      price: 4999,
      discountPrice: 1999,
      category: 'Programming',
      level: 'Beginner',
      duration: '48 hours',
      studentsEnrolled: 760,
      rating: 4.7,
      tags: JSON.stringify(['Java', 'OOP', 'Spring Boot', 'Collections', 'Threads', 'JPA']),
      syllabus: JSON.stringify(['Java Basics', 'OOP', 'Collections', 'Exception Handling', 'Threads', 'Spring Boot']),
      trainerId: trainer3.id,
      moduleKey: 'java',
    },
    {
      id: 'course-python',
      title: 'Python Mastery – From Basics to Django',
      description: 'Learn Python from scratch through OOP, File Handling, NumPy, Pandas, Flask and Django web development.',
      shortDescription: 'Master Python for scripting, data science and web development.',
      logo: '🐍',
      price: 3999,
      discountPrice: 1499,
      category: 'Programming',
      level: 'Beginner',
      duration: '46 hours',
      studentsEnrolled: 1120,
      rating: 4.8,
      tags: JSON.stringify(['Python', 'OOP', 'NumPy', 'Pandas', 'Flask', 'Django']),
      syllabus: JSON.stringify(['Python Basics', 'OOP', 'Modules', 'Data Science', 'Flask', 'Django']),
      trainerId: trainer4.id,
      moduleKey: 'python',
    },
  ];

  for (const courseData of courses) {
    const { moduleKey, ...rest } = courseData;

    const course = await prisma.course.upsert({
      where: { id: rest.id },
      update: {},
      create: { ...rest, isPublished: true, lessonsCount: 0 },
    });

    // Skip if modules already seeded
    const existingModules = await prisma.module.count({ where: { courseId: course.id } });
    if (existingModules > 0) continue;

    const sections = courseModules[moduleKey];
    let totalLessons = 0;

    for (let mIdx = 0; mIdx < sections.length; mIdx++) {
      const sec = sections[mIdx];
      const mod = await prisma.module.create({
        data: {
          title: sec.section,
          order: mIdx,
          courseId: course.id,
        },
      });

      for (let lIdx = 0; lIdx < sec.lessons.length; lIdx++) {
        await prisma.lesson.create({
          data: {
            title: sec.lessons[lIdx],
            order: lIdx,
            moduleId: mod.id,
            isFree: mIdx === 0 && lIdx === 0,
            duration: `${Math.floor(Math.random() * 30) + 15} min`,
            notes: `# ${sec.lessons[lIdx]}\n\nThis lesson covers the key concepts of **${sec.lessons[lIdx]}**.\n\n## Learning Objectives\n- Understand the fundamentals\n- Apply concepts in practice\n- Build real examples\n\n## Key Concepts\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n## Code Example\n\`\`\`\n// Example code will be shown here\nconsole.log("Hello, ${sec.lessons[lIdx]}!");\n\`\`\`\n\n## Summary\n- Key point 1\n- Key point 2\n- Key point 3`,
          },
        });
        totalLessons++;
      }

      // Create quiz for each module
      const quiz = await prisma.quiz.create({
        data: {
          title: `${sec.section} Quiz`,
          description: `Test your knowledge of ${sec.section}`,
          courseId: course.id,
          moduleId: mod.id,
          timeLimit: 10,
          passMark: 70,
        },
      });

      // Add sample questions
      await prisma.quizQuestion.createMany({
        data: [
          {
            quizId: quiz.id,
            question: `What is the primary purpose of ${sec.section}?`,
            type: 'mcq',
            options: JSON.stringify([
              `To understand ${sec.section} fundamentals`,
              'To write backend code',
              'To design databases',
              'To deploy applications',
            ]),
            correctAnswer: `To understand ${sec.section} fundamentals`,
            explanation: `${sec.section} is used to build a strong foundation in this area.`,
            order: 0,
          },
          {
            quizId: quiz.id,
            question: `${sec.section} is an important topic in modern development.`,
            type: 'truefalse',
            options: JSON.stringify(['True', 'False']),
            correctAnswer: 'True',
            explanation: `Yes, ${sec.section} is fundamental to modern development practices.`,
            order: 1,
          },
          {
            quizId: quiz.id,
            question: `Which of the following are key concepts in ${sec.section}? (Select all that apply)`,
            type: 'multiple',
            options: JSON.stringify(['Fundamentals', 'Best Practices', 'Advanced Patterns', 'Documentation']),
            correctAnswer: JSON.stringify(['Fundamentals', 'Best Practices']),
            explanation: `Fundamentals and Best Practices are the core concepts.`,
            order: 2,
          },
        ],
      });
    }

    // Update course lesson count
    await prisma.course.update({
      where: { id: course.id },
      data: { lessonsCount: totalLessons },
    });

    // Add coding problems to first lesson
    const firstLesson = await prisma.lesson.findFirst({
      where: { module: { courseId: course.id } },
      orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
    });

    if (firstLesson) {
      await prisma.codingProblem.create({
        data: {
          title: 'Hello World',
          difficulty: 'Easy',
          description: `Write a program that prints "Hello, World!" to the console.`,
          inputFormat: 'No input required.',
          outputFormat: 'Print "Hello, World!" on a single line.',
          constraints: 'No constraints.',
          examples: JSON.stringify([{ input: '', output: 'Hello, World!', explanation: 'Simply print the greeting.' }]),
          visibleTests: JSON.stringify([{ input: '', expected: 'Hello, World!' }]),
          hiddenTests: JSON.stringify([{ input: '', expected: 'Hello, World!' }]),
          starterCode: JSON.stringify({
            python: 'print("Hello, World!")',
            javascript: 'console.log("Hello, World!");',
            java: 'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
            cpp: '#include<iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
          }),
          languages: JSON.stringify(['python', 'javascript', 'java', 'cpp']),
          lessonId: firstLesson.id,
          points: 10,
        },
      });

      await prisma.codingProblem.create({
        data: {
          title: 'Sum of Two Numbers',
          difficulty: 'Easy',
          description: 'Given two integers A and B, return their sum.',
          inputFormat: 'Two integers A and B on the same line.',
          outputFormat: 'Print the sum of A and B.',
          constraints: '-10^9 <= A, B <= 10^9',
          examples: JSON.stringify([
            { input: '3 5', output: '8', explanation: '3 + 5 = 8' },
            { input: '-2 7', output: '5', explanation: '-2 + 7 = 5' },
          ]),
          visibleTests: JSON.stringify([
            { input: '3 5', expected: '8' },
            { input: '-2 7', expected: '5' },
          ]),
          hiddenTests: JSON.stringify([
            { input: '100 200', expected: '300' },
            { input: '0 0', expected: '0' },
          ]),
          starterCode: JSON.stringify({
            python: 'a, b = map(int, input().split())\n# Write your solution here',
            javascript: 'const [a, b] = require("fs").readFileSync("/dev/stdin","utf8").trim().split(" ").map(Number);\n// Write your solution here',
            java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        // Write your solution here\n    }\n}',
            cpp: '#include<iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // Write your solution here\n    return 0;\n}',
          }),
          languages: JSON.stringify(['python', 'javascript', 'java', 'cpp']),
          lessonId: firstLesson.id,
          points: 10,
        },
      });
    }
  }

  // ===== Developer =====
  await prisma.developer.upsert({
    where: { id: 'dev-1' },
    update: {},
    create: {
      id: 'dev-1',
      name: 'Bala Sujith',
      role: 'Full Stack Developer',
      bio: 'Passionate developer building the next generation LMS platform with Next.js, Prisma, and TypeScript.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
  });

  // ===== Sample Student =====
  await prisma.student.upsert({
    where: { email: 'student@gmtraining.com' },
    update: {},
    create: {
      name: 'Sample Student',
      email: 'student@gmtraining.com',
    },
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
