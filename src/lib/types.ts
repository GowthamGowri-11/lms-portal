// ===== LMS Data Types =====

export interface Trainer {
  id: string;
  name: string;
  email: string;
  specialization: string;
  bio: string;
  avatar: string;
  rating: number;
  coursesCount: number;
  studentsCount: number;
  experience: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  logo: string;
  price: number;
  discountPrice?: number;
  trainerId: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessonsCount: number;
  studentsEnrolled: number;
  rating: number;
  tags: string[];
  isPublished: boolean;
  syllabus: string[];
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: string[];
  completedCourses: string[];
  createdAt: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  courseId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  enrolledAt: string;
  progress: number;
}
