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

  // 1. ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
  if (
    text.includes('artificial intelligence') ||
    text.includes('ai') ||
    text.includes('machine learning') ||
    text.includes('deep learning') ||
    text.includes('neural')
  ) {
    return {
      tag: 'Artificial Intelligence',
      icon: '🧠',
      gradient: 'linear-gradient(135deg, #0b1120 0%, #141e33 50%, #1e1b4b 100%)',
      accent: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.25)',
      imageSrc: '/images/courses/ai.svg',
    };
  }

  // 2. DATABASE ENGINEERING
  if (
    text.includes('database') ||
    text.includes('sql') ||
    text.includes('postgres') ||
    text.includes('mongo') ||
    text.includes('data engineering')
  ) {
    return {
      tag: 'Database Engineering',
      icon: '🗄️',
      gradient: 'linear-gradient(135deg, #090e1a 0%, #0f172a 50%, #1e3a8a 100%)',
      accent: '#2563eb',
      glow: 'rgba(37, 99, 235, 0.22)',
      imageSrc: '/images/courses/database.svg',
    };
  }

  // 3. COMPUTER SCIENCE & ALGORITHMS
  if (
    text.includes('computer science') ||
    text.includes('algorithm') ||
    text.includes('data structure') ||
    text.includes('dsa')
  ) {
    return {
      tag: 'Computer Science',
      icon: '📐',
      gradient: 'linear-gradient(135deg, #0b0f17 0%, #111827 50%, #1e293b 100%)',
      accent: '#10b981',
      glow: 'rgba(16, 185, 129, 0.22)',
      imageSrc: '/images/courses/computerscience.svg',
    };
  }

  // 4. JAVA
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

  // 5. PYTHON
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

  // 6. FULL STACK & WEB DEVELOPMENT
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
      tag: 'Web Development',
      icon: '💻',
      gradient: 'linear-gradient(135deg, #090e17 0%, #0f172a 50%, #0369a1 100%)',
      accent: '#0284c7',
      glow: 'rgba(2, 132, 199, 0.22)',
      imageSrc: '/images/courses/fullstack.svg',
    };
  }

  // 7. C++ / SYSTEMS
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

  // 8. DEFAULT / OTHER
  return {
    tag: category || 'Academic Track',
    icon: '🎓',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    accent: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.15)',
    imageSrc: '/images/courses/general.svg',
  };
}

