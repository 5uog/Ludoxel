/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import { scheduleHashTargetScroll } from './logic/scrollRestoration';
import { type ScrollPosition } from './logic/scrollRestoration.types';

export default function RouteScrollRestoration(): React.JSX.Element | null {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousLocationKeyRef = useRef(location.key);
  const scrollPositionsRef = useRef(new Map<string, ScrollPosition>());
  const cancelHashScrollRef = useRef<(() => void) | null>(null);

  const cancelScheduledHashScroll = useCallback((): void => {
    cancelHashScrollRef.current?.();
    cancelHashScrollRef.current = null;
  }, []);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const handleHashChange = (): void => {
      const currentHash = window.location.hash;

      if (currentHash.length === 0) {
        return;
      }

      cancelScheduledHashScroll();
      cancelHashScrollRef.current = scheduleHashTargetScroll(currentHash);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      cancelScheduledHashScroll();
    };
  }, [cancelScheduledHashScroll]);

  useLayoutEffect(() => {
    cancelScheduledHashScroll();

    const previousLocationKey = previousLocationKeyRef.current;

    scrollPositionsRef.current.set(previousLocationKey, {
      left: window.scrollX,
      top: window.scrollY,
    });

    previousLocationKeyRef.current = location.key;

    if (location.hash.length > 0) {
      cancelHashScrollRef.current = scheduleHashTargetScroll(location.hash);
      return cancelScheduledHashScroll;
    }

    if (navigationType === 'POP') {
      const restoredPosition = scrollPositionsRef.current.get(location.key);

      window.scrollTo({
        left: restoredPosition?.left ?? 0,
        top: restoredPosition?.top ?? 0,
        behavior: 'auto',
      });

      return undefined;
    }

    window.scrollTo({ left: 0, top: 0, behavior: 'auto' });

    return undefined;
  }, [cancelScheduledHashScroll, location.hash, location.key, location.pathname, navigationType]);

  return null;
}
