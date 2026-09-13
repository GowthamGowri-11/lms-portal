import React from 'react';

interface TechLogoProps {
  name: string;
  size?: number;
  className?: string;
}

export default function TechLogo({ name, size = 18, className = '' }: TechLogoProps) {
  const key = name.toLowerCase();

  // 1. PYTHON (Official dual-snake logo)
  if (key.includes('python')) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <path
          fill="#3776AB"
          d="M63.02 0c-14.86 0-23.77 2.15-28.73 6.38-4.7 4.02-7.25 10.37-7.25 18.06v13.56h36.1v4.52H27.04v-1.13c0-7.39-2.55-13.84-7.25-17.86-5.06-4.33-14.07-6.53-28.93-6.53H0v13.56c0 14.86 2.15 23.77 6.38 28.73 4.02 4.7 10.37 7.25 18.06 7.25h13.56V48.42h4.52v36.1h-1.13c-7.39 0-13.84 2.55-17.86 7.25-4.33 5.06-6.53 14.07-6.53 28.93V128h13.56c14.86 0 23.77-2.15 28.73-6.38 4.7-4.02 7.25-10.37 7.25-18.06V90h-36.1v-4.52h43.1v1.13c0 7.39 2.55 13.84 7.25 17.86 5.06 4.33 14.07 6.53 28.93 6.53H128V97.44c0-14.86-2.15-23.77-6.38-28.73-4.02-4.7-10.37-7.25-18.06-7.25H90v18.06h-4.52v-36.1h1.13c7.39 0 13.84-2.55 17.86-7.25 4.33-5.06 6.53-14.07 6.53-28.93V0H63.02z"
        />
        <path
          fill="#FFD43B"
          d="M64.98 128c14.86 0 23.77-2.15 28.73-6.38 4.7-4.02 7.25-10.37 7.25-18.06V90H64.86v-4.52h36.1v1.13c0 7.39 2.55 13.84 7.25 17.86 5.06 4.33 14.07 6.53 28.93 6.53H128v-13.56c0-14.86-2.15-23.77-6.38-28.73-4.02-4.7-10.37-7.25-18.06-7.25h-13.56v18.06h-4.52v-36.1h1.13c7.39 0 13.84-2.55 17.86-7.25 4.33-5.06 6.53-14.07 6.53-28.93V0h-13.56c-14.86 0-23.77 2.15-28.73 6.38-4.7 4.02-7.25 10.37-7.25 18.06V38h36.1v4.52H37.9v-1.13c0-7.39-2.55-13.84-7.25-17.86-5.06-4.33-14.07-6.53-28.93-6.53H0v13.56c0 14.86 2.15 23.77 6.38 28.73 4.02 4.7 10.37 7.25 18.06 7.25H38V64h4.52v36.1h-1.13c-7.39 0-13.84 2.55-17.86 7.25-4.33 5.06-6.53 14.07-6.53 28.93V128h21.08z"
        />
        <circle cx="45" cy="20" r="6" fill="#fff" />
        <circle cx="83" cy="108" r="6" fill="#fff" />
      </svg>
    );
  }

  // 2. JAVA (Official Java Coffee Cup Logo)
  if (key.includes('java') && !key.includes('javascript')) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <path
          fill="#5382A1"
          d="M52.4 82.2c0 0-9.6 1.8-6.8 6.9 3.5 6.3 14.7 6.7 14.7 6.7s26.4 1.4 34.6-6.7c-3 1.9-8.4 3.7-14.2 4.4-15.6 1.8-24.9.4-28.3-1.6-4.3-2.6-1.5-6.6-1.5-6.6l1.5-3.1zm-8.8 19.3c0 0-8.8 2.3-5.2 7.7 4.5 6.8 18.5 7.2 18.5 7.2s33.7 1.5 44.2-7.2c-3.8 2-10.7 4-18.1 4.7-19.9 1.9-31.8.4-36.2-1.7-5.5-2.8-1.9-7.1-1.9-7.1l-1.3-3.6z"
        />
        <path
          fill="#E76F00"
          d="M68.5 24.2c6.2 7.1 4.1 13.5-3.3 22.3-5.9 7-7.2 11.5-1.9 18.7-8.8-9.4-10.4-18.7.6-26.6 8.5-6.1 10.4-9.9 4.6-14.4zm10.7-13.5c8.6 9.8 4.2 18.7-5.8 30.8-7.9 9.6-9.8 16-2.5 25.8-12.3-13.1-14.4-26 .8-36.9 11.7-8.4 14.4-13.7 7.5-19.7zm-28 66.8c11.9 2.5 30.7 2.3 43.1-1 3.5-.9 5.8-1.9 5.8-1.9s-2.1 1.7-5.2 2.9c-13.8 5.2-38 4.8-49.7.7-4.3-1.5-3.8-3.3-3.8-3.3s1.2 1.3 9.8 2.6z"
        />
        <path
          fill="#5382A1"
          d="M102.3 95.8c-1.2 9.2-12.8 14.7-27.2 17.5-23.7 4.6-48.5 2.1-48.5-7.3 0-6.1 11.3-10.1 27.2-12 18.5-2.2 38.3-.9 45 4.5 2.3 1.9 3.5 3.9 3.5 3.9l0 .2c10.4-6.4 12-16.1 12-16.1s-1.8 20.3-12 29.3zm-5.6-13.8c-1.3-5.2-14.4-9.3-33-8.8-18.8.5-33.8 5.5-33.8 11.5 0 5.4 12.1 9.9 28.5 10.7-11.4-2.1-18.9-5.7-18.9-9.8 0-4.5 9.3-8.3 22.9-9.5 14.7-1.3 28.7 1.1 34.3 5.9z"
        />
      </svg>
    );
  }

  // 3. C++ / SYSTEMS (Official C++ Hexagonal Shield Logo)
  if (key.includes('c++') || key.includes('cpp')) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <path
          fill="#00599C"
          d="M117.5 33.1L67.7 4.3a7.4 7.4 0 00-7.4 0L10.5 33.1a7.4 7.4 0 00-3.7 6.4v57.6a7.4 7.4 0 003.7 6.4l49.8 28.8a7.4 7.4 0 007.4 0l49.8-28.8a7.4 7.4 0 003.7-6.4V39.5a7.4 7.4 0 00-3.7-6.4z"
        />
        <path
          fill="#004482"
          d="M64 4.3v119.4a7.4 7.4 0 003.7-1l49.8-28.8a7.4 7.4 0 003.7-6.4V39.5a7.4 7.4 0 00-3.7-6.4L67.7 4.3a7.4 7.4 0 00-3.7-1z"
        />
        <path
          fill="#659AD2"
          d="M64 15.6l40.1 23.1a5.9 5.9 0 013 5.1v46.3a5.9 5.9 0 01-3 5.1L64 118.4V15.6z"
        />
        {/* C letter */}
        <path
          fill="#FFFFFF"
          d="M60.6 44.5c-10.8 0-19.5 8.7-19.5 19.5s8.7 19.5 19.5 19.5c6.5 0 12.3-3.2 15.9-8.1l-7.3-4.2c-2.2 2.7-5.3 4.4-8.6 4.4-6.4 0-11.6-5.2-11.6-11.6s5.2-11.6 11.6-11.6c3.3 0 6.4 1.7 8.6 4.4l7.3-4.2c-3.6-4.9-9.4-8.1-15.9-8.1z"
        />
        {/* + Plus 1 */}
        <path
          fill="#00599C"
          d="M87.8 57.6h-3.4v-3.4h-3.4v3.4h-3.4v3.4h3.4v3.4h3.4V61h3.4v-3.4z"
        />
        {/* + Plus 2 */}
        <path
          fill="#00599C"
          d="M103.8 57.6h-3.4v-3.4H97v3.4h-3.4v3.4H97V61h3.4v-3.4h3.4v-3.4z"
        />
      </svg>
    );
  }

  // 4. REACT.JS (Official Cyan Atom Orbitals)
  if (key.includes('react')) {
    return (
      <svg width={size} height={size} viewBox="-11.5 -10.23174 23 20.46348" className={className}>
        <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  // 5. NODE.JS (Official Green Hexagon)
  if (key.includes('node')) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <path
          fill="#689F63"
          d="M64 4.5L9.6 35.8v62.6L64 129.7l54.4-31.3V35.8L64 4.5zm0 18.2l39 22.5v45L64 112.7 25 90.2v-45L64 22.7z"
        />
        <path
          fill="#333333"
          d="M64 42.5c-11.9 0-21.5 9.6-21.5 21.5s9.6 21.5 21.5 21.5 21.5-9.6 21.5-21.5S75.9 42.5 64 42.5zm0 33c-6.4 0-11.5-5.1-11.5-11.5s5.1-11.5 11.5-11.5 11.5 5.1 11.5 11.5S70.4 75.5 64 75.5z"
        />
      </svg>
    );
  }

  // 6. TYPESCRIPT (Official TS Blue Tile)
  if (key.includes('typescript')) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <rect width="128" height="128" rx="16" fill="#3178C6" />
        <path
          fill="#ffffff"
          d="M72.2 46.8h-37v13.5h11.4v48.2H60.8V60.3h11.4V46.8zm23.6 24.8c-6.8 0-12.8 2.8-15.6 5.8l6.4 9.6c2.4-2.1 5.9-4 9.4-4 4.1 0 6.6 1.8 6.6 4.6 0 2.9-3.2 4.1-8.5 6.3-8.8 3.6-14.7 7.7-14.7 16.5 0 9.7 7.9 16.4 19.8 16.4 6.8 0 13.5-2.7 17.5-6.2l-6-9.6c-2.9 2.5-7.3 4.4-11.3 4.4-4.8 0-7.3-2-7.3-4.7 0-3.1 3.5-4.4 9.3-6.8 9.3-3.8 14.3-8.3 14.3-16.5 0-9.8-7.8-15.8-19.9-15.8z"
        />
      </svg>
    );
  }

  // 7. JAVASCRIPT (Official JS Yellow Tile)
  if (key.includes('javascript') || key === 'js') {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <rect width="128" height="128" rx="16" fill="#F7DF1E" />
        <path
          fill="#000000"
          d="M67.3 84.7c0 13.8-8.5 19.6-19.8 19.6-10.4 0-16.7-5.2-20.2-12.2l12.4-7.2c2.1 4 4.8 7.3 8.3 7.3 3.9 0 6.3-1.6 6.3-7.5V36h13v48.7zm28.8-37.4c13.7 0 22.4 9.2 22.4 22.9 0 14.8-9.7 23.4-23.7 23.4-14.2 0-23.3-8.8-23.3-23.2 0-14.7 9.8-23.1 24.6-23.1zm-.6 34.4c6.3 0 10.4-4.8 10.4-11.4 0-6.7-4.1-11.2-10.4-11.2-6.2 0-10.3 4.6-10.3 11.2 0 6.6 4.1 11.4 10.3 11.4z"
        />
      </svg>
    );
  }

  // 8. FULL STACK WEB / MODERN WEB DEV (Official Layered Stack)
  if (key.includes('full stack') || key.includes('fullstack') || key.includes('web dev') || key.includes('web developer')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="20" height="14" x="2" y="3" rx="2" fill="#2563EB" fillOpacity="0.15" stroke="#2563EB" strokeWidth="2" />
        <path d="M8 21h8M12 17v4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 8l2.5 2.5L7 13M13 13h4" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 9. AWS CLOUD
  if (key.includes('aws') || key.includes('cloud')) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <path
          fill="#FF9900"
          d="M33.6 86.8c-12.7-4.9-20.9-15.6-20.9-28.5 0-17.7 15.3-32 34.3-32 5.9 0 11.6 1.4 16.5 4 4.5-9.3 14.5-15.6 26.2-15.6 15.9 0 28.8 11.8 28.8 26.4 0 1.5-.1 3-.4 4.4 7.2 4.1 11.9 11.4 11.9 19.6 0 13.5-12.7 24.4-28.4 24.4H33.6z"
        />
        <path
          fill="#232F3E"
          d="M40 98c25 14 52 10 68-4"
          stroke="#232F3E"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 10. DOCKER & K8S
  if (key.includes('docker') || key.includes('k8s')) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <path
          fill="#2496ED"
          d="M124.6 57.8c-2.3-1.6-7.1-2.4-11.4-1.2-1.3-4.8-4.7-8.9-9.5-11.4l-3.3-1.7-2.1 3.1c-3.1 4.6-4.5 10.1-4.2 15.5H79.6V49.2h12V36.7h-12V24.2H67.1v12.5h12v12.5H42.1V36.7h12.5V24.2H42.1v-12H29.6v12h12.5v12.5H17.1V36.7h12.5V24.2H17.1v-12H4.6v36.7c0 10.8 4.2 21 11.7 28.6C26 87.3 43.5 93.6 64 93.6c31.8 0 58.6-15.4 63.8-33.1.2-.8.3-1.7.3-2.5-.1-.1-1.3-.1-3.5-.2z"
        />
      </svg>
    );
  }

  // 11. SPRING BOOT
  if (key.includes('spring')) {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
        <path
          fill="#6DB33F"
          d="M112.5 15.5C85.3 12.2 46.2 33.8 28.4 60.6 15.5 80 16.4 100.2 26 111.8c11.6 14.2 33.6 15.5 53.6 2.6C106.4 96.6 128 57.5 112.5 15.5zM64 96.2c-15.5 0-28.2-12.7-28.2-28.2 0-8.8 4-16.7 10.3-21.8 8.8 11.2 21.5 17.5 35.5 17.5-6.3 19.3-20.2 32.5-17.6 32.5z"
        />
      </svg>
    );
  }

  // 12. MACHINE LEARNING / AI
  if (key.includes('machine learning') || key.includes('ai') || key.includes('data science')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="4" y="4" width="16" height="16" rx="4" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="2" />
        <circle cx="9" cy="9" r="2" fill="#8B5CF6" />
        <circle cx="15" cy="9" r="2" fill="#8B5CF6" />
        <circle cx="12" cy="15" r="2" fill="#8B5CF6" />
        <path d="M9 9l3 6 3-6" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 13. SYSTEM ARCHITECTURE
  if (key.includes('architecture') || key.includes('system')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#0284C7" fillOpacity="0.15" stroke="#0284C7" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#0284C7" fillOpacity="0.15" stroke="#0284C7" strokeWidth="2" />
        <rect x="8.5" y="14" width="7" height="7" rx="1.5" fill="#0284C7" fillOpacity="0.15" stroke="#0284C7" strokeWidth="2" />
        <path d="M6.5 10v2a2 2 0 002 2h7a2 2 0 002-2v-2" stroke="#0284C7" strokeWidth="1.5" />
      </svg>
    );
  }

  // 14. MENTORSHIP / LEADERSHIP
  if (key.includes('mentorship') || key.includes('leadership')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="9" fill="#F59E0B" fillOpacity="0.15" stroke="#D97706" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 15. DEFAULT CODE / PROGRAMMING
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="4" fill="#2563EB" fillOpacity="0.15" stroke="#2563EB" strokeWidth="2" />
      <path d="M8 10l-2 2 2 2M16 10l2 2-2 2M13 8l-2 8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
