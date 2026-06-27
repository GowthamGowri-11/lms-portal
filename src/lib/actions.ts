'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { stringifyArray } from './utils';

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
  const trainer = await prisma.trainer.update({ where: { id }, data });

  revalidatePath('/admin/trainers');
  revalidatePath('/trainers');
  revalidatePath('/admin/courses');
  return trainer;
}

export async function deleteTrainer(id: string) {
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
      title: data.title,
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      logo: data.logo || '📘',
      price: data.price,
      discountPrice: data.discountPrice ?? null,
      category: data.category || 'General',
      level: data.level || 'Beginner',
      duration: data.duration || '0 hours',
      lessonsCount: data.lessonsCount || 0,
      tags: stringifyArray(data.tags || []),
      syllabus: stringifyArray(data.syllabus || []),
      isPublished: data.isPublished ?? false,
      trainerId: data.trainerId,
    },
  });

  revalidatePath('/admin/courses');
  revalidatePath('/courses');
  revalidatePath('/admin');
  return course;
}

export async function updateCourse(id: string, data: Record<string, unknown>) {
  // Serialize array fields if provided
  const updateData = { ...data };
  if (Array.isArray(updateData.tags)) {
    updateData.tags = stringifyArray(updateData.tags as string[]);
  }
  if (Array.isArray(updateData.syllabus)) {
    updateData.syllabus = stringifyArray(updateData.syllabus as string[]);
  }

  const course = await prisma.course.update({ where: { id }, data: updateData });

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

// ===== DEVELOPERS =====

export async function createDeveloper(data: {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  resume?: string;
}) {
  const developer = await prisma.developer.create({
    data: {
      ...data,
      bio: data.bio || '',
      avatar: data.avatar || '',
      github: data.github || '',
      linkedin: data.linkedin || '',
      resume: data.resume || '',
    },
  });

  revalidatePath('/admin/developers');
  revalidatePath('/about');
  return developer;
}

export async function updateDeveloper(id: string, data: {
  name?: string;
  role?: string;
  bio?: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  resume?: string;
}) {
  const developer = await prisma.developer.update({ where: { id }, data });

  revalidatePath('/admin/developers');
  revalidatePath('/about');
  return developer;
}

export async function deleteDeveloper(id: string) {
  const developer = await prisma.developer.delete({ where: { id } });

  revalidatePath('/admin/developers');
  revalidatePath('/about');
  return developer;
}
