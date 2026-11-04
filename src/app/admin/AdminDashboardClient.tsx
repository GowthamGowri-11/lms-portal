'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  GraduationCap,
  IndianRupee,
  PlayCircle,
  Activity,
  Plus,
  UserPlus,
  BarChart3,
  Clock,
  CheckCircle2,
  CreditCard,
  UserCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { PageTransition } from '@/components/animations/MotionWrappers';
import hub from '@/components/admin/hub/hub.module.css';
import { BarChart, DonutChart, LineChart, ProgressList, Sparkline } from '@/components/admin/hub/HubCharts';
import {
  RANGE_OPTIONS,
  RangeKey,
  bucketCounts,
  bucketSums,
  comparePeriod,
  formatINR,
  formatPct,
  relativeTime,
  sparklineFromSeries,
} from '@/lib/adminAnalytics';

type CourseRow = {
  id: string;
  title: string;
  logo: string;
  category: string;
  isPublished: boolean;
  trainerId: string;
  trainerName: string;
  studentsEnrolled: number;
  price: number;
  discountPrice: number | null;
  createdAt: string;
  lessonsCount: number;
};

type Props = {
  admin: { name: string; email: string; image: string };
  courses: CourseRow[];
  trainers: { id: string; name: string; email: string; createdAt: string }[];
  students: { id: string; name: string; email: string; avatar: string; createdAt: string; isOnboarded: boolean }[];
  enrollments: {
    id: string;
    studentId: string;
    courseId: string;
    paymentStatus: string;
    progress: number;
    enrolledAt: string;
  }[];
  lessons: { id: string; title: string; createdAt: string; coursePublished: boolean }[];
  users: { id: string; name: string | null; email: string | null; role: string; createdAt: string; isOnboarded: boolean }[];
  developers: { id: string; name: string; createdAt: string }[];
  courseProgress: { courseId: string; percentage: number; isCompleted: boolean; studentId: string }[];
};

const paid = (status: string) => status === 'completed' || status === 'assigned';

function avatarColor(seed: string) {
  const colors = ['#2563EB', '#8B5CF6', '#16A34A', '#F59E0B', '#0EA5E9'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function AdminDashboardClient(props: Props) {
  const {
    admin,
    courses,
    trainers,
    students,
    enrollments,
    lessons,
    users,
    developers,
    courseProgress,
  } = props;

  const [range, setRange] = useState<RangeKey>('30d');
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'REGISTRATIONS' | 'CONTENT' | 'PAYMENTS'>('ALL');
  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const coursePrice = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.discountPrice || course?.price || 0;
  };

  const totalRevenue = enrollments.filter((e) => e.paymentStatus === 'completed').reduce((sum, e) => sum + coursePrice(e.courseId), 0);
  const activeStudentIds = new Set(
    enrollments.filter((e) => paid(e.paymentStatus)).map((e) => e.studentId)
  );

  const courseDelta = comparePeriod(courses.map((c) => c.createdAt), range);
  const trainerDelta = comparePeriod(trainers.map((t) => t.createdAt), range);
  const studentDelta = comparePeriod(students.map((s) => s.createdAt), range);
  const lessonDelta = comparePeriod(lessons.map((l) => l.createdAt), range);
  const enrollmentDelta = comparePeriod(enrollments.map((e) => e.enrolledAt), range);
  const revenueSeries = bucketSums(
    enrollments
      .filter((e) => e.paymentStatus === 'completed')
      .map((e) => ({ at: e.enrolledAt, amount: coursePrice(e.courseId) })),
    range
  );
  const revenueCurrent = revenueSeries.reduce((s, p) => s + p.value, 0);
  const revenueDelta = comparePeriod(
    enrollments.filter((e) => e.paymentStatus === 'completed').map((e) => e.enrolledAt),
    range
  );

  const kpis = [
    {
      id: 'courses',
      label: 'Total Courses',
      value: String(courses.length),
      icon: BookOpen,
      color: '#2563EB',
      series: sparklineFromSeries(bucketCounts(courses.map((c) => c.createdAt), range)),
      change: formatPct(courseDelta.pct),
      positive: (courseDelta.pct ?? 0) >= 0,
      note: courseDelta.pct === null && courseDelta.current > 0 ? 'No prior-period data' : 'vs previous period',
    },
    {
      id: 'trainers',
      label: 'Total Faculty Mentors',
      value: String(trainers.length),
      icon: Users,
      color: '#8B5CF6',
      series: sparklineFromSeries(bucketCounts(trainers.map((t) => t.createdAt), range)),
      change: formatPct(trainerDelta.pct),
      positive: (trainerDelta.pct ?? 0) >= 0,
      note: trainerDelta.pct === null && trainerDelta.current > 0 ? 'No prior-period data' : 'vs previous period',
    },
    {
      id: 'students',
      label: 'Total Enrolled Students',
      value: String(students.length),
      icon: GraduationCap,
      color: '#16A34A',
      series: sparklineFromSeries(bucketCounts(students.map((s) => s.createdAt), range)),
      change: formatPct(studentDelta.pct),
      positive: (studentDelta.pct ?? 0) >= 0,
      note: studentDelta.pct === null && studentDelta.current > 0 ? 'No prior-period data' : 'vs previous period',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: formatINR(totalRevenue),
      icon: IndianRupee,
      color: '#0EA5E9',
      series: sparklineFromSeries(revenueSeries),
      change: formatPct(revenueDelta.pct),
      positive: (revenueDelta.pct ?? 0) >= 0,
      note: 'Completed enrollments only',
    },
    {
      id: 'lessons',
      label: 'Total Lessons',
      value: String(lessons.length),
      icon: PlayCircle,
      color: '#F59E0B',
      series: sparklineFromSeries(bucketCounts(lessons.map((l) => l.createdAt), range)),
      change: formatPct(lessonDelta.pct),
      positive: (lessonDelta.pct ?? 0) >= 0,
      note: lessonDelta.pct === null && lessonDelta.current > 0 ? 'No prior-period data' : 'vs previous period',
    },
    {
      id: 'active',
      label: 'Active Students',
      value: String(activeStudentIds.size),
      icon: Activity,
      color: '#16A34A',
      series: sparklineFromSeries(bucketCounts(enrollments.filter((e) => paid(e.paymentStatus)).map((e) => e.enrolledAt), range)),
      change: formatPct(enrollmentDelta.pct),
      positive: (enrollmentDelta.pct ?? 0) >= 0,
      note: 'Students with a paid or assigned enrollment',
    },
  ];

  const enrollmentTrend = bucketCounts(enrollments.map((e) => e.enrolledAt), range);
  const activitySeries = bucketCounts(
    [
      ...enrollments.map((e) => e.enrolledAt),
    ],
    range
  );

  const courseDistribution = [...courses]
    .map((c) => ({
      label: c.title,
      value: enrollments.filter((e) => e.courseId === c.id).length,
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const completion = [...courses]
    .map((c) => {
      const rows = courseProgress.filter((p) => p.courseId === c.id);
      const avg = rows.length ? rows.reduce((s, r) => s + r.percentage, 0) / rows.length : 0;
      return { label: c.title, value: avg };
    })
    .filter((c) => courseProgress.some((p) => courses.find((x) => x.id === p.courseId)?.title === c.label))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const recentStudents = students.slice(0, 6);
  const popularCourses = [...courses]
    .map((c) => {
      const enrolled = enrollments.filter((e) => e.courseId === c.id);
      const rows = courseProgress.filter((p) => p.courseId === c.id);
      const completionPct = rows.length ? rows.reduce((s, r) => s + r.percentage, 0) / rows.length : 0;
      return { ...c, enrolledCount: enrolled.length || c.studentsEnrolled || 0, completionPct };
    })
    .sort((a, b) => b.enrolledCount - a.enrolledCount)
    .slice(0, 6);

  const activities = [
    ...students.map((s) => ({
      at: s.createdAt,
      title: `${s.name} registered as a student`,
      icon: GraduationCap,
      color: '#16A34A',
      category: 'REGISTRATIONS',
    })),
    ...courses.map((c) => ({
      at: c.createdAt,
      title: `Course created: ${c.title}`,
      icon: BookOpen,
      color: '#2563EB',
      category: 'CONTENT',
    })),
    ...lessons.map((l) => ({
      at: l.createdAt,
      title: `Lesson added: ${l.title}`,
      icon: PlayCircle,
      color: '#F59E0B',
      category: 'CONTENT',
    })),
    ...enrollments.filter((e) => e.paymentStatus === 'completed').map((e) => {
      const student = students.find((s) => s.id === e.studentId);
      const course = courses.find((c) => c.id === e.courseId);
      return {
        at: e.enrolledAt,
        title: `Payment completed${student ? ` by ${student.name}` : ''}${course ? ` · ${course.title}` : ''}`,
        icon: CreditCard,
        color: '#16A34A',
        category: 'PAYMENTS',
      };
    }),
    ...trainers.map((t) => ({
      at: t.createdAt,
      title: `Trainer registered: ${t.name}`,
      icon: Users,
      color: '#8B5CF6',
      category: 'REGISTRATIONS',
    })),
    ...developers.map((d) => ({
      at: d.createdAt,
      title: `Developer profile added: ${d.name}`,
      icon: UserCircle,
      color: '#111827',
      category: 'REGISTRATIONS',
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const filteredActivities = activities.filter((item) => {
    if (activityFilter === 'ALL') return true;
    return item.category === activityFilter;
  }).slice(0, 12);

  const successful = enrollments.filter((e) => e.paymentStatus === 'completed').length;
  const pendingPay = enrollments.filter((e) => e.paymentStatus === 'pending').length;
  const failedPay = enrollments.filter((e) => !['completed', 'pending', 'assigned'].includes(e.paymentStatus)).length;
  const recentTx = enrollments.slice(0, 6);

  // Revenue by course breakdown
  const revenueByCourse = [...courses]
    .map((c) => {
      const courseEnrollments = enrollments.filter((e) => e.courseId === c.id && e.paymentStatus === 'completed');
      const revenue = courseEnrollments.reduce((sum, e) => sum + coursePrice(e.courseId), 0);
      return { course: c, revenue, enrollments: courseEnrollments.length };
    })
    .filter((item) => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const publishedCourses = courses.filter((c) => c.isPublished).length;

  return (
    <PageTransition>
      <div className={hub.page}>
        <div className={hub.welcomeCard}>
          <div className={hub.welcomeMain}>
            <div className={hub.kicker}>ATLYX Admin Hub</div>
            <h1 className={hub.title}>
              {greeting}, {admin.name.split(' ')[0]}
            </h1>
            <p className={hub.subtitle}>
              Platform overview across courses, faculty, enrollments, assessments, and payments. All figures are computed from live records.
            </p>
            <div className={hub.headerActions} style={{ marginTop: 16 }}>
              <Link href="/admin/students" className={`${hub.quickAction} ${hub.quickActionPrimary}`}>
                <UserPlus size={14} /> Add Student
              </Link>
              <Link href="/admin/courses" className={hub.quickAction}>
                <Plus size={14} /> Create Course
              </Link>
              <Link href="/admin/trainers" className={hub.quickAction}>
                <Users size={14} /> Add Trainer
              </Link>
              <Link href="/admin/payments" className={hub.quickAction}>
                <BarChart3 size={14} /> View Reports
              </Link>
            </div>
          </div>
          <div className={hub.profileCard}>
            <div className={hub.avatar} style={{ background: avatarColor(admin.name) }}>
              {admin.image ? <img src={admin.image} alt="" /> : (admin.name.charAt(0) || 'A').toUpperCase()}
            </div>
            <div className={hub.profileMeta}>
              <div className={hub.profileName}>{admin.name}</div>
              <div className={hub.profileRole}>{admin.email || 'Administrator'}</div>
              <div className={hub.dateLine}>{today}</div>
            </div>
          </div>
        </div>

        <div className={hub.statsGrid}>
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.id} className={hub.statCard}>
                <div className={hub.statTop}>
                  <div
                    className={hub.statIcon}
                    style={{ background: `${kpi.color}14`, borderColor: `${kpi.color}33`, color: kpi.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <span className={`${hub.trend} ${kpi.change ? (kpi.positive ? hub.trendUp : hub.trendDown) : hub.trendFlat}`}>
                    {kpi.change ? (kpi.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />) : null}
                    {kpi.change || '—'}
                  </span>
                </div>
                <div className={hub.statValue}>{kpi.value}</div>
                <div className={hub.statLabel}>{kpi.label}</div>
                <div className={hub.statFooter}>
                  <Sparkline values={kpi.series} color={kpi.color} />
                </div>
                <div className={hub.itemMeta}>{kpi.note}</div>
              </div>
            );
          })}
        </div>

        <div className={hub.card} style={{ marginBottom: 14, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 13 }}>Analytics window</strong>
          <div className={hub.rangeTabs}>
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`${hub.rangeTab} ${range === opt.key ? hub.rangeTabActive : ''}`}
                onClick={() => setRange(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={hub.chartsGrid}>
          <section className={hub.card}>
            <div className={hub.cardHeader}>
              <div>
                <h2 className={hub.cardTitle}>Student Enrollment Trends</h2>
                <p className={hub.cardHint}>New enrollments in the selected window</p>
              </div>
            </div>
            <div className={hub.chartBody}>
              {enrollmentTrend.every((p) => p.value === 0) ? (
                <div className={hub.empty}>No enrollments in this period.</div>
              ) : (
                <LineChart data={enrollmentTrend} color="#2563EB" />
              )}
            </div>
          </section>
          <section className={hub.card}>
            <div className={hub.cardHeader}>
              <div>
                <h2 className={hub.cardTitle}>Revenue Analytics</h2>
                <p className={hub.cardHint}>Completed payments · {formatINR(revenueCurrent)} this window</p>
              </div>
            </div>
            <div className={hub.chartBody}>
              {revenueSeries.every((p) => p.value === 0) ? (
                <div className={hub.empty}>No completed payments in this period.</div>
              ) : (
                <LineChart data={revenueSeries} color="#16A34A" fill valuePrefix="₹" />
              )}
            </div>
          </section>
        </div>

        <div className={hub.chartsRow3}>
          <section className={hub.card}>
            <div className={hub.cardHeader}>
              <div>
                <h2 className={hub.cardTitle}>Course Enrollment Distribution</h2>
                <p className={hub.cardHint}>Top courses by recorded enrollments</p>
              </div>
            </div>
            <DonutChart data={courseDistribution} />
          </section>
          <section className={hub.card}>
            <div className={hub.cardHeader}>
              <div>
                <h2 className={hub.cardTitle}>Student Activity</h2>
                <p className={hub.cardHint}>Enrollments, quiz attempts, and code submissions</p>
              </div>
            </div>
            <div className={hub.chartBody}>
              {activitySeries.every((p) => p.value === 0) ? (
                <div className={hub.empty}>No activity in this period.</div>
              ) : (
                <BarChart data={activitySeries} color="#8B5CF6" />
              )}
            </div>
          </section>
        </div>

        <section className={hub.card} style={{ marginBottom: 14 }}>
          <div className={hub.cardHeader}>
            <div>
              <h2 className={hub.cardTitle}>Course Completion</h2>
              <p className={hub.cardHint}>Average learner progress from CourseProgress records</p>
            </div>
          </div>
          <ProgressList items={completion} />
        </section>

        <div className={hub.splitGrid}>
          <section className={hub.card}>
            <div className={hub.cardHeader}>
              <div>
                <h2 className={hub.cardTitle}>Recent Students</h2>
                <p className={hub.cardHint}>Latest registrations</p>
              </div>
              <Link href="/admin/students" className={hub.linkBtn}>
                View all
              </Link>
            </div>
            <div className={hub.list}>
              {recentStudents.length === 0 && <div className={hub.empty}>No students registered yet.</div>}
              {recentStudents.map((s) => {
                const enrolled = enrollments.filter((e) => e.studentId === s.id);
                return (
                  <div key={s.id} className={hub.listItem}>
                    <div className={hub.thumb} style={{ background: avatarColor(s.name) }}>
                      {s.avatar ? <img src={s.avatar} alt="" /> : s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={hub.itemTitle}>{s.name}</div>
                      <div className={hub.itemMeta}>
                        {s.email} · {enrolled.length} course{enrolled.length === 1 ? '' : 's'} · {new Date(s.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <span className={hub.pill} style={{ background: s.isOnboarded ? '#f0fdf4' : '#fffbeb', color: s.isOnboarded ? '#16A34A' : '#F59E0B' }}>
                      {s.isOnboarded ? 'Active' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={hub.card}>
            <div className={hub.cardHeader}>
              <div>
                <h2 className={hub.cardTitle}>Popular Courses</h2>
                <p className={hub.cardHint}>Ranked by enrollment count</p>
              </div>
              <Link href="/admin/courses" className={hub.linkBtn}>
                View all
              </Link>
            </div>
            <div className={hub.list}>
              {popularCourses.length === 0 && <div className={hub.empty}>No courses yet.</div>}
              {popularCourses.map((c) => (
                <div key={c.id} className={hub.listItem}>
                  <div className={hub.thumb} style={{ background: avatarColor(c.title) }}>
                    {c.logo && (c.logo.startsWith('http') || c.logo.startsWith('/')) ? (
                      <img src={c.logo} alt="" />
                    ) : (
                      (c.title.charAt(0) || 'C').toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className={hub.itemTitle}>{c.title}</div>
                    <div className={hub.itemMeta}>
                      {c.trainerName} · {c.enrolledCount} enrolled · {Math.round(c.completionPct)}% avg completion
                    </div>
                  </div>
                  <span className={hub.pill} style={{ background: c.isPublished ? '#eff6ff' : '#f8fafc', color: c.isPublished ? '#2563EB' : '#64748B' }}>
                    {c.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={hub.splitGrid}>
          <section className={hub.card}>
            <div className={hub.cardHeader}>
              <div>
                <h2 className={hub.cardTitle}>Recent Platform Activities</h2>
                <p className={hub.cardHint}>Registrations, content, and payments</p>
              </div>
              <div className={hub.rangeTabs}>
                <button
                  className={`${hub.rangeTab} ${activityFilter === 'ALL' ? hub.rangeTabActive : ''}`}
                  onClick={() => setActivityFilter('ALL')}
                >
                  All
                </button>
                <button
                  className={`${hub.rangeTab} ${activityFilter === 'REGISTRATIONS' ? hub.rangeTabActive : ''}`}
                  onClick={() => setActivityFilter('REGISTRATIONS')}
                >
                  Users
                </button>
                <button
                  className={`${hub.rangeTab} ${activityFilter === 'CONTENT' ? hub.rangeTabActive : ''}`}
                  onClick={() => setActivityFilter('CONTENT')}
                >
                  Content
                </button>
                <button
                  className={`${hub.rangeTab} ${activityFilter === 'PAYMENTS' ? hub.rangeTabActive : ''}`}
                  onClick={() => setActivityFilter('PAYMENTS')}
                >
                  Payments
                </button>
              </div>
            </div>
            <div className={hub.timeline}>
              {filteredActivities.length === 0 && <div className={hub.empty}>No recorded activity yet.</div>}
              {filteredActivities.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={`${item.at}-${i}`} className={hub.timelineItem}>
                    <div className={hub.timelineIcon} style={{ background: `${item.color}18`, color: item.color }}>
                      <Icon size={14} />
                    </div>
                    <div className={hub.itemTitle} style={{ fontWeight: 600 }}>
                      {item.title}
                    </div>
                    <div className={hub.itemMeta}>{relativeTime(item.at)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={hub.card}>
            <div className={hub.cardHeader}>
              <div>
                <h2 className={hub.cardTitle}>Payment Overview</h2>
                <p className={hub.cardHint}>Enrollment payment statuses · method is not stored</p>
              </div>
              <Link href="/admin/payments" className={hub.linkBtn}>
                View All Transactions
              </Link>
            </div>
            <div className={hub.statsGrid} style={{ gridTemplateColumns: '1fr 1fr', padding: '0 12px', marginBottom: 0 }}>
              <div>
                <div className={hub.statValue} style={{ fontSize: '1.2rem' }}>{formatINR(totalRevenue)}</div>
                <div className={hub.statLabel}>Total revenue</div>
              </div>
              <div>
                <div className={hub.statValue} style={{ fontSize: '1.2rem' }}>{successful}</div>
                <div className={hub.statLabel}>Successful</div>
              </div>
              <div>
                <div className={hub.statValue} style={{ fontSize: '1.2rem' }}>{pendingPay}</div>
                <div className={hub.statLabel}>Pending</div>
              </div>
              <div>
                <div className={hub.statValue} style={{ fontSize: '1.2rem' }}>{failedPay}</div>
                <div className={hub.statLabel}>Other / failed</div>
              </div>
            </div>
            <div className={hub.list}>
              {recentTx.map((e) => {
                const student = students.find((s) => s.id === e.studentId);
                const course = courses.find((c) => c.id === e.courseId);
                return (
                  <div key={e.id} className={hub.listItem}>
                    <div className={hub.thumb} style={{ background: '#eff6ff', color: '#2563EB' }}>
                      <IndianRupee size={16} />
                    </div>
                    <div>
                      <div className={hub.itemTitle}>{student?.name || 'Student'} · {course?.title || 'Course'}</div>
                      <div className={hub.itemMeta}>{formatINR(coursePrice(e.courseId))} · {new Date(e.enrolledAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <span className={hub.pill}>{e.paymentStatus}</span>
                  </div>
                );
              })}
            </div>
            <div className={hub.chartBody} style={{ minHeight: 140 }}>
              <LineChart data={revenueSeries} color="#16A34A" fill valuePrefix="₹" height={140} />
            </div>
          </section>
        </div>

        <section className={hub.card} style={{ marginBottom: 14 }}>
          <div className={hub.cardHeader}>
            <div>
              <h2 className={hub.cardTitle}>Revenue by Course</h2>
              <p className={hub.cardHint}>Top performing courses by completed payment revenue</p>
            </div>
          </div>
          <div className={hub.list}>
            {revenueByCourse.length === 0 && <div className={hub.empty}>No revenue data yet.</div>}
            {revenueByCourse.map((item) => (
              <div key={item.course.id} className={hub.listItem}>
                <div className={hub.thumb} style={{ background: avatarColor(item.course.title) }}>
                  {item.course.logo && (item.course.logo.startsWith('http') || item.course.logo.startsWith('/')) ? (
                    <img src={item.course.logo} alt="" />
                  ) : (
                    (item.course.title.charAt(0) || 'C').toUpperCase()
                  )}
                </div>
                <div>
                  <div className={hub.itemTitle}>{item.course.title}</div>
                  <div className={hub.itemMeta}>{item.enrollments} enrollments</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={hub.itemTitle} style={{ color: '#16A34A' }}>{formatINR(item.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={hub.card}>
          <div className={hub.cardHeader}>
            <div>
              <h2 className={hub.cardTitle}>System Overview</h2>
              <p className={hub.cardHint}>Live counts from users, content, and requests</p>
            </div>
          </div>
          <div className={hub.statsGrid} style={{ padding: '0 12px 16px' }}>
            <OverviewMetric icon={Users} label="Registered users" value={users.length} />
            <OverviewMetric icon={CheckCircle2} label="Onboarded users" value={users.filter((u) => u.isOnboarded).length} />
            <OverviewMetric icon={BookOpen} label="Published courses" value={publishedCourses} />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function OverviewMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className={hub.statCard} style={{ boxShadow: 'none' }}>
      <div className={hub.statTop}>
        <div className={hub.statIcon} style={{ background: '#eff6ff', borderColor: '#dbeafe', color: '#2563EB' }}>
          <Icon size={16} />
        </div>
      </div>
      <div className={hub.statValue}>{value}</div>
      <div className={hub.statLabel}>{label}</div>
    </div>
  );
}
