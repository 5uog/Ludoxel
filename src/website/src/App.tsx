/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useLayoutEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';

import ChangelogPage from './routes/ChangelogPage';
import DocsPage from './routes/DocsPage';
import HomePage from './routes/HomePage';
import NotFoundPage from './routes/NotFoundPage';

type ScrollPosition = {
  left: number;
  top: number;
};

function decodeHashTarget(hash: string): string {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

function scrollToHashTarget(hash: string): void {
  const target = document.getElementById(decodeHashTarget(hash));

  if (target !== null) {
    target.scrollIntoView({ block: 'start' });
  }
}

function RouteScrollRestoration(): React.JSX.Element | null {
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

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <RouteScrollRestoration />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs/*" element={<DocsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
