export interface CourseThemeInfo {
  tag: string;
  icon: string;
  gradient: string;
  accent: string;
  glow: string;
  imageSrc: string;
}

export function getCourseVisual(category?: string | null, title?: string | null, logo?: string | null): CourseThemeInfo {
  if (logo && logo.trim().length > 0 && !logo.startsWith('http') && (logo.endsWith('.svg') || logo.endsWith('.png') || logo.endsWith('.jpg') || logo.endsWith('.webp'))) {
    // If it's a local valid path
    return {
      tag: category || 'Course',
      icon: '🎓',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
      accent: '#2563eb',
      glow: 'rgba(37, 99, 235, 0.15)',
      imageSrc: logo,
    };
  }

  const text = `${category || ''} ${title || ''}`.toLowerCase();

  // 1. JAVA (matches user's Java image)
  if (text.includes('java') && !text.includes('javascript')) {
    return {
      tag: 'Java Enterprise',
      icon: '☕',
      gradient: 'linear-gradient(135deg, #172d42 0%, #234566 50%, #3d6d96 100%)',
      accent: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.18)',
      imageSrc: '/images/courses/java.svg',
    };
  }

  // 2. PYTHON (matches user's Python hexagon badge image)
  if (text.includes('python')) {
    return {
      tag: 'Python & Data',
      icon: '🐍',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e3a8a 100%)',
      accent: '#ffd534',
      glow: 'rgba(255, 213, 52, 0.18)',
      imageSrc: '/images/courses/python.svg',
    };
  }

  // 3. FULL STACK & WEB DEVELOPMENT (matches user's Full Stack ribbon image)
  if (
    text.includes('full stack') ||
    text.includes('fullstack') ||
    text.includes('web development') ||
    text.includes('web dev') ||
    text.includes('react') ||
    text.includes('node') ||
    text.includes('next') ||
    text.includes('frontend') ||
    text.includes('backend')
  ) {
    return {
      tag: 'Full Stack Engineering',
      icon: '💻',
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 50%, #e2e8f0 100%)',
      accent: '#0284c7',
      glow: 'rgba(2, 132, 199, 0.15)',
      imageSrc: '/images/courses/fullstack.svg',
    };
  }

  // 4. C++ / SYSTEMS (matches official C++ blue logo)
  if (text.includes('c++') || text.includes('cpp') || text.includes('system')) {
    return {
      tag: 'Systems & C++',
      icon: '⚙️',
      gradient: 'linear-gradient(135deg, #080e1a 0%, #0f1c30 50%, #1b2d4b 100%)',
      accent: '#00599c',
      glow: 'rgba(0, 89, 156, 0.2)',
      imageSrc: '/images/courses/cpp.svg',
    };
  }

  // 5. DEFAULT / OTHER
  return {
    tag: category || 'Academic Track',
    icon: '🎓',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    accent: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.15)',
    imageSrc: '/images/courses/general.svg',
  };
}
