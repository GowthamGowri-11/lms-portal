import { Course } from '@/generated/prisma/client';

// SQLite stores arrays as JSON strings.
// This type represents a Course with tags/syllabus parsed back to string[].
export type CourseWithArrays = Omit<Course, 'tags' | 'syllabus'> & {
  tags: string[];
  syllabus: string[];
};

export function parseCourse(course: Course): CourseWithArrays {
  return {
    ...course,
    tags: parseJsonArray(course.tags as unknown as string),
    syllabus: parseJsonArray(course.syllabus as unknown as string),
  };
}

export function parseJsonArray(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function stringifyArray(arr: string[]): string {
  return JSON.stringify(arr);
}
