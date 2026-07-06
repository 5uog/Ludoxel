/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { List } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { isOnThisPageItemActive } from '../../lib/docsNavigationState';

type DocsOnThisPageItem = {
  label: string;
  href: string;
};

type DocsOnThisPageProps = {
  currentHash: string;
  footerOverlapPx: number;
  items: DocsOnThisPageItem[];
};

type ResolvedOnThisPageTarget = DocsOnThisPageItem & {
  id: string;
};

const ACTIVE_SECTION_TOP_OFFSET_PX = 112;
const DOCUMENT_BOTTOM_EPSILON_PX = 2;
const NAVIGATION_FOCUS_LOCK_TIMEOUT_MS = 1000;

function decodeHashTarget(hash: string): string {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

function resolveHashFromItems(currentHash: string, items: DocsOnThisPageItem[]): string {
  if (items.length === 0) {
    return '';
  }

  return items.some((item) => item.href === currentHash) ? currentHash : items[0].href;
}

function resolveTargets(items: DocsOnThisPageItem[]): ResolvedOnThisPageTarget[] {
  return items
    .map((item) => ({
      ...item,
      id: decodeHashTarget(item.href),
    }))
    .filter((item) => item.id.length > 0);
}

function getDocumentBottom(): number {
  return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}

function isAtDocumentBottom(): boolean {
  return window.scrollY + window.innerHeight >= getDocumentBottom() - DOCUMENT_BOTTOM_EPSILON_PX;
}

function getDocumentTop(target: HTMLElement): number {
  return target.getBoundingClientRect().top + window.scrollY;
}

function isNavigationTargetSettled(hash: string): boolean {
  const target = document.getElementById(decodeHashTarget(hash));

  if (!(target instanceof HTMLElement)) {
    return true;
  }

  if (isAtDocumentBottom()) {
    return true;
  }

  const targetViewportTop = target.getBoundingClientRect().top;

  return targetViewportTop >= 0 && targetViewportTop <= ACTIVE_SECTION_TOP_OFFSET_PX;
}

function resolveActiveHashFromScroll(targets: ResolvedOnThisPageTarget[]): string {
  if (targets.length === 0) {
    return '';
  }

  if (isAtDocumentBottom()) {
    return targets[targets.length - 1].href;
  }

  const activationTop = window.scrollY + ACTIVE_SECTION_TOP_OFFSET_PX;
  let activeHash = targets[0].href;

  for (const target of targets) {
    const element = document.getElementById(target.id);

    if (!(element instanceof HTMLElement)) {
      continue;
    }

    if (getDocumentTop(element) <= activationTop) {
      activeHash = target.href;
    }
  }

  return activeHash;
}

export default function DocsOnThisPage({ currentHash, footerOverlapPx, items }: DocsOnThisPageProps): React.JSX.Element {
  const itemHrefs = items.map((item) => item.href).join('\u001f');
  const targets = useMemo(() => resolveTargets(items), [itemHrefs]);
  const navigationFocusLockHashRef = useRef<string | null>(null);
  const navigationFocusLockTimeoutRef = useRef<number>(0);
  const [activeHash, setActiveHash] = useState(() => resolveHashFromItems(currentHash, items));

  function clearNavigationFocusLockTimeout(): void {
    if (navigationFocusLockTimeoutRef.current === 0) {
      return;
    }

    window.clearTimeout(navigationFocusLockTimeoutRef.current);
    navigationFocusLockTimeoutRef.current = 0;
  }

  function releaseNavigationFocusLock(): void {
    navigationFocusLockHashRef.current = null;
    clearNavigationFocusLockTimeout();
  }

  function holdNavigationFocus(hash: string): void {
    navigationFocusLockHashRef.current = hash;
    clearNavigationFocusLockTimeout();
    navigationFocusLockTimeoutRef.current = window.setTimeout(() => {
      releaseNavigationFocusLock();
      setActiveHash(resolveActiveHashFromScroll(targets));
    }, NAVIGATION_FOCUS_LOCK_TIMEOUT_MS);
  }

  function handleNavigate(href: string): void {
    holdNavigationFocus(href);
    setActiveHash(href);
  }

  useEffect(() => {
    const nextActiveHash = resolveHashFromItems(currentHash, items);

    if (currentHash.length > 0 && nextActiveHash === currentHash) {
      holdNavigationFocus(nextActiveHash);
    } else {
      releaseNavigationFocusLock();
    }

    setActiveHash(nextActiveHash);

    return clearNavigationFocusLockTimeout;
  }, [currentHash, itemHrefs, targets]);

  useEffect(() => {
    if (targets.length === 0) {
      setActiveHash('');
      return undefined;
    }

    let frameId = 0;

    function updateActiveHash(): void {
      frameId = 0;

      const lockedHash = navigationFocusLockHashRef.current;

      if (lockedHash !== null) {
        if (!isNavigationTargetSettled(lockedHash)) {
          return;
        }

        releaseNavigationFocusLock();
      }

      const nextActiveHash = resolveActiveHashFromScroll(targets);
      setActiveHash((currentActiveHash) => (currentActiveHash === nextActiveHash ? currentActiveHash : nextActiveHash));
    }

    function scheduleUpdate(): void {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveHash);
    }

    scheduleUpdate();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [targets]);

  return (
    <aside
      className="fixed right-[max(0px,calc((100vw-90rem)/2))] top-24 z-20 hidden w-56 shrink-0 overflow-y-auto pr-6 transition-[max-height] duration-300 ease-out xl:block"
      style={{ maxHeight: `calc(100vh - 6rem - ${footerOverlapPx}px)` }}
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <List className="h-4 w-4" />
        <span>On this page</span>
      </div>

      <nav className="relative">
        <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-border" />

        <div className="relative">
          {items.map((item, index) => {
            const isActive = isOnThisPageItemActive(activeHash, item.href, index);

            return (
              <a
                className={
                  isActive
                    ? 'relative block w-full py-1.5 pl-4 text-left text-sm font-medium text-foreground transition-colors'
                    : 'relative block w-full py-1.5 pl-4 text-left text-sm text-muted-foreground transition-colors hover:text-foreground'
                }
                href={item.href}
                key={item.href}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => handleNavigate(item.href)}
              >
                {isActive ? <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-foreground" /> : null}
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
