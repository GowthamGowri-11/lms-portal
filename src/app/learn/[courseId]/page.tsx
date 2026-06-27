import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCourseProgression } from '@/lib/progression';

export default async function LearnLandingPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  
  let student = await prisma.student.findFirst();
  if (!student) {
    student = await prisma.student.create({
      data: {
        name: 'Sample Student',
        email: 'student@gmtraining.com',
      },
    });
  }

  const { items, lockedIds } = await getCourseProgression(courseId, student.id);

  if (items.length === 0) {
    redirect(`/courses/${courseId}`);
  }

  // Redirect to the first item that is unlocked (which will be their current active learning point)
  // Start searching from the end to find the furthest unlocked item
  let activeItem = items[0];
  for (let i = items.length - 1; i >= 0; i--) {
    if (!lockedIds.has(items[i].id)) {
      activeItem = items[i];
      break;
    }
  }

  redirect(activeItem.url);
}
