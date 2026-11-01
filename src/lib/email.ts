import nodemailer from 'nodemailer';
import { prisma } from './prisma';

export type NotificationType =
  | 'COURSE_ASSIGNMENT'
  | 'NEW_LESSON'
  | 'NEW_NOTES'
  | 'NEW_QUIZ'
  | 'COURSE_PUBLISHED'
  | 'ANNOUNCEMENT';

export interface SendNotificationOptions {
  recipientEmail: string;
  recipientName?: string;
  userId?: string;
  studentId?: string;
  type: NotificationType;
  title: string;
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  details?: { label: string; value: string }[];
  metadata?: Record<string, any>;
}

// Ensure base URL is always available for deep linking
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Generates responsive, high-converting, branded HTML email template for ATLYX LMS.
 */
export function generateEmailHtml({
  recipientName,
  type,
  title,
  message,
  actionUrl,
  actionText = 'View Details',
  details = [],
}: {
  recipientName?: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  details?: { label: string; value: string }[];
}): string {
  const badgeColors: Record<NotificationType, { bg: string; text: string; label: string }> = {
    COURSE_ASSIGNMENT: { bg: '#eff6ff', text: '#2563eb', label: 'Course Assignment' },
    NEW_LESSON: { bg: '#f0fdf4', text: '#16a34a', label: 'New Curriculum Lesson' },
    NEW_NOTES: { bg: '#fdf4ff', text: '#a855f7', label: 'New Study Resources & Notes' },
    NEW_QUIZ: { bg: '#fff7ed', text: '#ea580c', label: 'Course Quiz Assessment' },
    COURSE_PUBLISHED: { bg: '#faf5ff', text: '#9333ea', label: 'New Course Publication' },
    ANNOUNCEMENT: { bg: '#fef2f2', text: '#dc2626', label: 'Important Course Update' },
  };

  const badge = badgeColors[type] || badgeColors.COURSE_ASSIGNMENT;
  const targetUrl = actionUrl
    ? actionUrl.startsWith('http')
      ? actionUrl
      : `${BASE_URL}${actionUrl}`
    : BASE_URL;

  // Wrap target URL through login redirect flow if user is signed out
  const loginWrappedUrl = `${BASE_URL}/login?callbackUrl=${encodeURIComponent(targetUrl)}`;

  const detailsRows = details
    .map(
      (d) => `
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9; width: 38%;">${d.label}</td>
        <td style="padding: 8px 12px; font-size: 13px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${d.value}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);">
          
          <!-- Header Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 32px 32px 28px; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background: #e17055; color: #ffffff; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 8px; font-weight: 900; font-size: 18px; margin-right: 10px; vertical-align: middle;">A</div>
                    <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; vertical-align: middle;">ATLYX</span>
                    <span style="font-size: 13px; color: #c7d2fe; margin-left: 8px; font-weight: 500; vertical-align: middle;">ACADEMY</span>
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 20px 0 0; line-height: 1.3;">${title}</h1>
            </td>
          </tr>

          <!-- Notification Type Badge -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <span style="display: inline-block; background-color: ${badge.bg}; color: ${badge.text}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 12px; border-radius: 20px;">
                ${badge.label}
              </span>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 16px 32px 24px; font-size: 15px; line-height: 1.6; color: #334155;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #0f172a; font-weight: 600;">
                Hello ${recipientName || 'Student'},
              </p>
              <p style="margin: 0 0 20px; color: #475569;">
                ${message}
              </p>

              ${
                details.length > 0
                  ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  ${detailsRows}
                </table>
              </div>`
                  : ''
              }

              <!-- Action Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px;">
                <tr>
                  <td align="center" style="border-radius: 10px; background: #e17055;">
                    <a href="${loginWrappedUrl}" target="_blank" style="font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 10px; background-color: #e17055;">
                      ${actionText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                🔒 If you are currently signed out, clicking above will securely direct you to sign in with your Google student account and take you straight to your course.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #475569;">ATLYX LMS & Learning Systems</p>
              <p style="margin: 0 0 8px;">You are receiving this automated email because you are a registered student or enrolled in this curriculum.</p>
              <p style="margin: 0; color: #94a3b8;">&copy; ${new Date().getFullYear()} ATLYX. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Transporter setup
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Sends a notification, creates database audit record, and handles SMTP delivery.
 */
export async function sendNotification(options: SendNotificationOptions) {
  const {
    recipientEmail,
    recipientName,
    userId,
    studentId,
    type,
    title,
    subject,
    message,
    actionUrl,
    actionText,
    details = [],
    metadata = {},
  } = options;

  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn(`[Notification] Invalid recipient email: ${recipientEmail}`);
    return null;
  }

  const html = generateEmailHtml({
    recipientName,
    type,
    title,
    message,
    actionUrl,
    actionText,
    details,
  });

  // 1. Create database notification record in PENDING state
  let notificationRecord: any = null;
  try {
    notificationRecord = await prisma.notification.create({
      data: {
        recipientEmail,
        recipientName: recipientName || null,
        userId: userId || null,
        studentId: studentId || null,
        type,
        title,
        subject,
        message,
        htmlContent: html,
        metadata: JSON.stringify({ ...metadata, actionUrl }),
        status: 'PENDING',
      },
    });
  } catch (err: any) {
    console.error('[Notification DB Error]:', err?.message || err);
  }

  // 2. Deliver via SMTP or Dev Simulation
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || `"ATLYX LMS" <${process.env.SMTP_USER || 'no-reply@atlyx.com'}>`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to: recipientEmail,
        subject,
        html,
        text: `${title}\n\n${message}\n\nVisit: ${actionUrl ? `${BASE_URL}${actionUrl}` : BASE_URL}`,
      });

      console.log(`[Notification] Email successfully dispatched to ${recipientEmail} (ID: ${info.messageId})`);

      if (notificationRecord) {
        await prisma.notification.update({
          where: { id: notificationRecord.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      }

      return { success: true, messageId: info.messageId, status: 'SENT' };
    } catch (err: any) {
      console.error(`[Notification Delivery Failure] to ${recipientEmail}:`, err?.message || err);
      if (notificationRecord) {
        await prisma.notification.update({
          where: { id: notificationRecord.id },
          data: { status: 'FAILED', error: err?.message || 'SMTP error' },
        });
      }
      return { success: false, error: err?.message, status: 'FAILED' };
    }
  } else {
    // Development fallback / SMTP credentials not configured
    console.log(
      `[Notification DEV SIMULATION] Logged notification to ${recipientEmail} for [${type}]: "${subject}"`
    );
    if (notificationRecord) {
      await prisma.notification.update({
        where: { id: notificationRecord.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          error: 'Delivered via Development Simulation (Configure SMTP_USER & SMTP_PASSWORD for live inbox delivery)',
        },
      });
    }
    return { success: true, status: 'SENT_DEV', simulated: true };
  }
}

/**
 * Non-blocking asynchronous notification dispatch
 */
export function sendNotificationAsync(options: SendNotificationOptions) {
  // Fire and forget, does not hold HTTP response
  setTimeout(() => {
    sendNotification(options).catch((err) => {
      console.error('[sendNotificationAsync error]:', err);
    });
  }, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// HIGHER-LEVEL WORKFLOW NOTIFIERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Triggered when admin assigns a course to a student
 */
export async function notifyCourseAssignment({
  student,
  course,
}: {
  student: { id: string; name: string; email: string; userId?: string | null };
  course: { id: string; title: string; category?: string; level?: string; duration?: string };
}) {
  return sendNotificationAsync({
    recipientEmail: student.email,
    recipientName: student.name,
    studentId: student.id,
    userId: student.userId || undefined,
    type: 'COURSE_ASSIGNMENT',
    title: `You've Been Assigned to: ${course.title}`,
    subject: `[Course Enrolled] You have been assigned access to ${course.title}`,
    message: `Your administrator has granted you full access to the course "${course.title}". You can now start watching lectures, reading protected notes, completing assignments, and taking module quizzes.`,
    actionUrl: `/courses/${course.id}`,
    actionText: 'Start Learning Now',
    details: [
      { label: 'Course', value: course.title },
      { label: 'Category', value: course.category || 'Engineering' },
      { label: 'Level', value: course.level || 'Beginner' },
      { label: 'Duration', value: course.duration || 'Self-paced' },
    ],
    metadata: { courseId: course.id },
  });
}

/**
 * Triggered when a new lesson is published in a course
 */
export async function notifyNewLessonPublished({
  course,
  lesson,
}: {
  course: { id: string; title: string };
  lesson: { id: string; title: string; duration?: string; description?: string };
}) {
  // Find all active enrollments for this course
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    include: { student: true },
  });

  for (const en of enrollments) {
    if (!en.student?.email) continue;
    sendNotificationAsync({
      recipientEmail: en.student.email,
      recipientName: en.student.name,
      studentId: en.student.id,
      userId: en.student.userId || undefined,
      type: 'NEW_LESSON',
      title: `New Lesson Available: ${lesson.title}`,
      subject: `[New Lesson] "${lesson.title}" published in ${course.title}`,
      message: `A new lesson "${lesson.title}" has been published in your enrolled course "${course.title}". Check out the updated syllabus and continue your learning journey.`,
      actionUrl: `/learn/${course.id}/lesson/${lesson.id}`,
      actionText: 'Go to Lesson',
      details: [
        { label: 'Course', value: course.title },
        { label: 'Lesson', value: lesson.title },
        { label: 'Duration', value: lesson.duration || 'Standard' },
      ],
      metadata: { courseId: course.id, lessonId: lesson.id },
    });
  }
}

/**
 * Triggered when new notes/resources are published for a lesson
 */
export async function notifyNewNotesPublished({
  course,
  lesson,
  note,
}: {
  course: { id: string; title: string };
  lesson: { id: string; title: string };
  note: { id: string; title: string; category?: string; fileType?: string };
}) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    include: { student: true },
  });

  for (const en of enrollments) {
    if (!en.student?.email) continue;
    sendNotificationAsync({
      recipientEmail: en.student.email,
      recipientName: en.student.name,
      studentId: en.student.id,
      userId: en.student.userId || undefined,
      type: 'NEW_NOTES',
      title: `New Notes Available: ${note.title}`,
      subject: `[New Notes] Study material published for ${course.title}`,
      message: `New study resources and notes ("${note.title}") have been added to "${lesson.title}" in your course "${course.title}".`,
      actionUrl: `/learn/${course.id}/lesson/${lesson.id}`,
      actionText: 'View Study Notes',
      details: [
        { label: 'Course', value: course.title },
        { label: 'Lesson', value: lesson.title },
        { label: 'Material', value: note.title },
        { label: 'Format', value: (note.fileType || 'PDF').toUpperCase() },
      ],
      metadata: { courseId: course.id, lessonId: lesson.id, noteId: note.id },
    });
  }
}

/**
 * Triggered when a new quiz is published
 */
export async function notifyNewQuizPublished({
  course,
  quiz,
}: {
  course: { id: string; title: string };
  quiz: { id: string; title: string; passMark?: number; timeLimit?: number; questionsCount?: number };
}) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    include: { student: true },
  });

  for (const en of enrollments) {
    if (!en.student?.email) continue;
    sendNotificationAsync({
      recipientEmail: en.student.email,
      recipientName: en.student.name,
      studentId: en.student.id,
      userId: en.student.userId || undefined,
      type: 'NEW_QUIZ',
      title: `New Quiz Test: ${quiz.title}`,
      subject: `[Quiz Available] Test your knowledge in ${course.title}`,
      message: `A new assessment quiz "${quiz.title}" has been published in "${course.title}". Test your understanding to earn course credits toward your certificate.`,
      actionUrl: `/learn/${course.id}/quiz/${quiz.id}`,
      actionText: 'Take Quiz Now',
      details: [
        { label: 'Course', value: course.title },
        { label: 'Quiz', value: quiz.title },
        { label: 'Pass Mark', value: `${quiz.passMark || 70}%` },
        { label: 'Time Limit', value: quiz.timeLimit ? `${quiz.timeLimit} mins` : 'Untimed' },
      ],
      metadata: { courseId: course.id, quizId: quiz.id },
    });
  }
}
