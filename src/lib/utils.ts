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

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = columns.map((col) => col.label).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        // Handle dates, nulls, and escape commas
        if (value === null || value === undefined) return '';
        if (Object.prototype.toString.call(value) === '[object Date]') return (value as Date).toISOString().split('T')[0];
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
