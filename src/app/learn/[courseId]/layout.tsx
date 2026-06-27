import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CourseSidebar from '@/components/learn/CourseSidebar';
import PremiumLockScreen from '@/components/learn/PremiumLockScreen';
import { LearnProvider } from './LearnContext';
import { getCourseProgression } from '@/lib/progression';
import { DEVELOPMENT_MODE } from '@/lib/config';


export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  // Get student (demo user)
  let student = await prisma.student.findFirst();
  if (!student) {
    student = await prisma.student.create({
      data: {
        name: 'Sample Student',
        email: 'student@gmtraining.com',
      },
    });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) notFound();

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: course.id,
      },
    },
  });

  if (!DEVELOPMENT_MODE && !enrollment) {
    // In production, enforce enrollment via premium lock screen
    return <PremiumLockScreen course={course} studentId={student.id} />;
  }

  // Get dynamic course progression
  const {
    items,
    completedIds,
    lockedIds,
    modules,
    codingProblems,
    quizzes,
  } = await getCourseProgression(course.id, student.id);

  return (
    <LearnProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <CourseSidebar
          course={course}
          student={student}
          modules={modules}
          codingProblems={codingProblems}
          quizzes={quizzes}
          completedIds={completedIds}
          lockedIds={lockedIds}
          items={items}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {children}
        </div>
      </div>
    </LearnProvider>
  );
}
