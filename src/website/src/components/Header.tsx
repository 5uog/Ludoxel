/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { getStartedHref, mainNavigation } from '../data/navigation';
import SearchCommand from './SearchCommand';

type HeaderProps = {
  activePath?: string;
};

const MOBILE_SHEET_ANIMATION_MS = 500;

function isNavigationItemActive(currentPath: string, href: string): boolean {
  if (href === '/') {
    return currentPath === '/';
  }

  if (href.startsWith('/docs')) {
    return currentPath.startsWith('/docs');
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function Header({ activePath }: HeaderProps): React.JSX.Element {
  const location = useLocation();
  const currentPath = activePath ?? location.pathname;
  const previousPathRef = useRef<string>(currentPath);
  const closeTimerRef = useRef<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState<boolean>(false);

  const clearCloseTimer = (): void => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openMobileMenu = (): void => {
    clearCloseTimer();
    setIsMobileMenuClosing(false);
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = (): void => {
    if (!isMobileMenuOpen || closeTimerRef.current !== null) {
      return;
    }

    setIsMobileMenuClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMobileMenuClosing(false);
      closeTimerRef.current = null;
    }, MOBILE_SHEET_ANIMATION_MS);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (previousPathRef.current === currentPath) {
      return;
    }

    previousPathRef.current = currentPath;

    if (isMobileMenuOpen) {
      closeMobileMenu();
    }
  }, [currentPath, isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen || isMobileMenuClosing) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isMobileMenuClosing]);

  const mobileMenuBackdropClassName = isMobileMenuClosing ? 'mobile-sheet-backdrop mobile-sheet-backdrop-exit fixed inset-0 z-50 bg-black/80' : 'mobile-sheet-backdrop fixed inset-0 z-50 bg-black/80';

  const mobileMenuPanelClassName = isMobileMenuClosing
    ? 'mobile-sheet-panel-right mobile-sheet-panel-right-exit fixed inset-y-0 right-0 z-50 h-full w-3/4 max-w-sm border-l border-border bg-background p-6 shadow-lg'
    : 'mobile-sheet-panel-right fixed inset-y-0 right-0 z-50 h-full w-3/4 max-w-sm border-l border-border bg-background p-6 shadow-lg';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background">
      <nav className="flex items-center justify-between w-full max-w-[90rem] mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center gap-6">
          <Link className="flex items-center gap-2" to="/" onClick={closeMobileMenu}>
            <h1 className="text-xl font-bold text-foreground">Ludoxel</h1>
          </Link>

          <SearchCommand variant="header" placeholder="Search..." enableShortcut />
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
            {mainNavigation.map((item) => {
              const isActive = isNavigationItemActive(currentPath, item.href);
              const className = `px-3 py-2 text-sm font-medium transition-colors rounded-xl ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`;

              return (
                <Link className={className} to={item.href} key={item.href}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <a
            className="hidden lg:inline-flex items-center justify-center gap-1 py-3 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-xl transition-colors hover:bg-primary/90"
            href={getStartedHref}
            rel="noreferrer"
            target="_blank"
          >
            <span>Get started</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>

          <div className="lg:hidden flex items-center gap-2">
            <SearchCommand variant="icon" placeholder="Search..." />

            <button
              aria-controls="mobile-header-navigation"
              aria-expanded={isMobileMenuOpen && !isMobileMenuClosing}
              aria-haspopup="dialog"
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/50"
              type="button"
              onClick={openMobileMenu}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-header-navigation" role="dialog" aria-modal="true" aria-label="Menu">
          <button className={mobileMenuBackdropClassName} type="button" aria-label="Close menu" onClick={closeMobileMenu} />

          <div className={mobileMenuPanelClassName}>
            <button
              aria-label="Close"
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              type="button"
              onClick={closeMobileMenu}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 className="text-lg font-semibold text-foreground">Menu</h2>
            </div>

            <nav className="flex flex-col gap-2 mt-8" aria-label="Mobile primary navigation">
              {mainNavigation.map((item) => {
                const isActive = isNavigationItemActive(currentPath, item.href);
                const className = `px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                  isActive ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`;

                return (
                  <Link className={className} to={item.href} key={item.href} onClick={closeMobileMenu}>
                    {item.label}
                  </Link>
                );
              })}

              <a
                className="flex items-center justify-center gap-2 mt-4 py-3 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-xl transition-colors hover:bg-primary/90"
                href={getStartedHref}
                rel="noreferrer"
                target="_blank"
                onClick={closeMobileMenu}
              >
                <span>Get started</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
