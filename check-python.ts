import { prisma } from './src/lib/prisma';

async function run() {
  const course = await prisma.course.findFirst({
    where: { title: { contains: 'Python' } },
    include: { modules: { include: { lessons: true } } }
  });
  
  if (!course) {
    console.log("No python course found.");
    return;
  }
  
  console.log("Course:", course.title);
  for (const mod of course.modules) {
    console.log(`Module: ${mod.title} - ${mod.lessons.length} lessons`);
  }
}
run();
