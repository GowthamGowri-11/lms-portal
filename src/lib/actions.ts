'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';

// ===== TRAINERS =====

export async function createTrainer(data: {
  name: string;
  email: string;
  specialization: string;
  bio?: string;
  avatar?: string;
  experience?: string;
}) {
  const trainer = await prisma.trainer.create({
    data: {
      ...data,
      bio: data.bio || '',
      avatar: data.avatar || '',
      experience: data.experience || '',
    },
  });
  
  revalidatePath('/admin/trainers');
  revalidatePath('/trainers');
  return trainer;
}

export async function updateTrainer(id: string, data: {
  name?: string;
  email?: string;
  specialization?: string;
  bio?: string;
  avatar?: string;
  experience?: string;
}) {
  const trainer = await prisma.trainer.update({
    where: { id },
    data,
  });
  
  revalidatePath('/admin/trainers');
  revalidatePath('/trainers');
  revalidatePath('/admin/courses'); // Refresh assigned courses view
  return trainer;
}

export async function deleteTrainer(id: string) {
  // Disconnect or delete courses associated with this trainer?
  // Since we have a strict relation, deleting the trainer will fail if they have courses.
  // For this LMS, we'll delete the trainer and cascade delete courses, OR just delete the trainer if no courses.
  // Let's delete courses associated first to avoid constraint errors (or change schema to cascade later).
  await prisma.course.deleteMany({ where: { trainerId: id } });
  const trainer = await prisma.trainer.delete({ where: { id } });
  
  revalidatePath('/admin/trainers');
  revalidatePath('/trainers');
  revalidatePath('/admin/courses');
  return trainer;
}

// ===== COURSES =====

export async function createCourse(data: {
  title: string;
  description?: string;
  shortDescription?: string;
  logo?: string;
  price: number;
  discountPrice?: number | null;
  category?: string;
  level?: string;
  duration?: string;
  lessonsCount?: number;
  tags?: string[];
  syllabus?: string[];
  isPublished?: boolean;
  trainerId: string;
}) {
  const course = await prisma.course.create({
    data: {
      ...data,
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      logo: data.logo || '📘',
      category: data.category || 'General',
      level: data.level || 'Beginner',
      duration: data.duration || '0 hours',
      lessonsCount: data.lessonsCount || 0,
      tags: data.tags || [],
      syllabus: data.syllabus || [],
      isPublished: data.isPublished ?? false,
    },
  });

  revalidatePath('/admin/courses');
  revalidatePath('/courses');
  revalidatePath('/admin');
  return course;
}

export async function updateCourse(id: string, data: any) {
  const course = await prisma.course.update({
    where: { id },
    data,
  });

  revalidatePath('/admin/courses');
  revalidatePath('/courses');
  revalidatePath(`/courses/${id}`);
  revalidatePath('/admin');
  return course;
}

export async function deleteCourse(id: string) {
  await prisma.enrollment.deleteMany({ where: { courseId: id } });
  const course = await prisma.course.delete({ where: { id } });

  revalidatePath('/admin/courses');
  revalidatePath('/courses');
  revalidatePath('/admin');
  return course;
}
