/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import { scrollToHashTarget } from './logic/scrollRestoration';
import { type ScrollPosition } from './logic/scrollRestoration.types';

export default function RouteScrollRestoration(): React.JSX.Element | null {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousLocationKeyRef = useRef(location.key);
  const scrollPositionsRef = useRef(new Map<string, ScrollPosition>());

  useLayoutEffect(() => {
    const previousLocationKey = previousLocationKeyRef.current;

    scrollPositionsRef.current.set(previousLocationKey, {
      left: window.scrollX,
      top: window.scrollY,
    });

    previousLocationKeyRef.current = location.key;

    if (location.hash.length > 0) {
      scrollToHashTarget(location.hash);
      return;
    }

    if (navigationType === 'POP') {
      const restoredPosition = scrollPositionsRef.current.get(location.key);

      window.scrollTo({
        left: restoredPosition?.left ?? 0,
        top: restoredPosition?.top ?? 0,
        behavior: 'auto',
      });

      return;
    }

    window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
  }, [location.hash, location.key, navigationType]);

  return null;
}
