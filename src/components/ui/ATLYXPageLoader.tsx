'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ATLYXLoadingScreen from './ATLYXLoadingScreen';

export default function ATLYXPageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const prevRouteRef = useRef(`${pathname}?${searchParams.toString()}`);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, dismiss loader promptly
  useEffect(() => {
    const currentRoute = `${pathname}?${searchParams.toString()}`;
    if (prevRouteRef.current !== currentRoute) {
      prevRouteRef.current = currentRoute;
      
      // Cancel pending loader display if transition finished fast
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (isLoading) {
        setIsExiting(true);
        exitTimerRef.current = setTimeout(() => {
          setIsLoading(false);
          setIsExiting(false);
        }, 80);
      }
    }
  }, [pathname, searchParams, isLoading]);

  // Global click interceptor for internal navigation links with debounce
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Check if it is a valid internal navigation
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/api') &&
        !href.startsWith('#') &&
        targetAttr !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey &&
        !anchor.hasAttribute('download')
      ) {
        const url = new URL(href, window.location.origin);
        const isSamePage =
          url.pathname === window.location.pathname &&
          url.search === window.location.search &&
          !url.hash;

        if (!isSamePage) {
          if (showTimerRef.current) clearTimeout(showTimerRef.current);
          if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
          if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

          setIsExiting(false);

          // Debounce: Only show full loader if page transition takes longer than 150ms
          // Instant transitions won't flash the heavy overlay
          showTimerRef.current = setTimeout(() => {
            setIsLoading(true);

            // Safety timeout to prevent loader from hanging indefinitely
            safetyTimerRef.current = setTimeout(() => {
              setIsExiting(true);
              setTimeout(() => {
                setIsLoading(false);
                setIsExiting(false);
              }, 80);
            }, 3000);
          }, 150);
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  if (!isLoading) return null;

  return <ATLYXLoadingScreen isExiting={isExiting} />;
}
