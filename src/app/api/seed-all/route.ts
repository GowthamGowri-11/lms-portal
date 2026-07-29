import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const allCourses = await prisma.course.findMany({
    include: { modules: { include: { lessons: true }, orderBy: { order: 'asc' } } }
  });

  let totalUpdated = 0;

  for (const course of allCourses) {
    // Skip courses that already have lessons (like Python)
    const hasLessons = course.modules.some(m => m.lessons.length > 0);
    if (hasLessons) continue;

    const topics = [
      {
        title: "Introduction & Environment Setup",
        content: `# Introduction & Setup\n\nWelcome to **${course.title}**! In this first module, we will explore the foundations and set up our development environment.\n\n## Core Objectives\n- Understand the history and use cases.\n- Install necessary tools.\n- Write your first "Hello World" application.\n\n## Required Tools\n- A modern web browser.\n- A text editor (VS Code recommended).\n- A terminal or command prompt.\n\n> "A journey of a thousand miles begins with a single step."`
      },
      {
        title: "Core Concepts & Fundamentals",
        content: `# Core Concepts & Fundamentals\n\nNow that you are set up, let's dive into the core concepts.\n\n## Basic Syntax and Types\nEvery language or framework has a fundamental syntax.\n\n## Example Code\n\`\`\`javascript\n// This is a generic example\nconst initialize = () => {\n  console.log("Core concepts loaded!");\n};\ninitialize();\n\`\`\`\n\n## Practice\nTry writing a small script that utilizes these core types and logs them to the console.`
      },
      {
        title: "Intermediate Techniques",
        content: `# Intermediate Techniques\n\nBuilding upon the basics, we will now look at intermediate patterns and standard practices.\n\n## State Management & Logic\nUnderstanding how data flows through your application is critical.\n- How to handle user input.\n- Managing application state.\n- Handling side effects.\n\n## Example\n\`\`\`javascript\nfunction handleData(data) {\n  if (!data) throw new Error("No data provided");\n  return data.map(item => item.value);\n}\n\`\`\``
      },
      {
        title: "Advanced Patterns & Architecture",
        content: `# Advanced Patterns\n\nIn this section, we tackle advanced architecture and scaling.\n\n## Performance Optimization\n- Lazy loading\n- Memoization techniques\n- Efficient data fetching\n\n## Security Best Practices\nAlways validate input and sanitize output. Never trust the client.`
      },
      {
        title: "Real World Project & Wrap-up",
        content: `# Real World Project\n\nIt's time to put everything together into a final capstone project.\n\n## Project Requirements\n1. Initialize a new repository.\n2. Implement the core features discussed in previous modules.\n3. Deploy the application to a cloud provider.\n\n## Next Steps\nCongratulations on completing **${course.title}**! Keep practicing and building your portfolio.`
      }
    ];

    // If the course has no modules at all, create them
    let targetModules = course.modules;
    if (targetModules.length === 0) {
      for (let i = 0; i < topics.length; i++) {
        const mod = await prisma.module.create({
          data: {
            title: topics[i].title,
            courseId: course.id,
            order: i
          }
        });
        targetModules.push({ ...mod, lessons: [] } as any);
      }
    }

    // Now seed the lessons for these modules
    for (let i = 0; i < Math.min(targetModules.length, topics.length); i++) {
      const mod = targetModules[i];
      const topic = topics[i];
      
      if (mod.lessons.length === 0) {
        await prisma.lesson.create({
          data: {
            title: topic.title,
            notes: topic.content,
            moduleId: mod.id,
            order: 0
          }
        });
        totalUpdated++;
      }
    }
  }

  return NextResponse.json({ success: true, seededLessons: totalUpdated });
}
