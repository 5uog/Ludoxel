/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */

import ludoxelLogoUrl from '../../../../assets/branding/ludoxel.png';

import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { getStartedHref, mainNavigation } from '../data/navigation';
import SearchCommand from './SearchCommand';

type HeaderProps = {
  activePath?: string;
};

function isNavigationItemActive(currentPath: string, href: string): boolean {
  if (href === '/') {
    return currentPath === '/';
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function Header({ activePath }: HeaderProps): React.JSX.Element {
  const location = useLocation();
  const currentPath = activePath ?? location.pathname;
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateScrolled = (): void => {
      setIsScrolled(window.scrollY > 50);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled);
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const headerClassName = `fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
    isScrolled ? 'bg-background border-b border-border' : 'bg-transparent border-b border-white/10'
  }`;

  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={headerClassName}>
      <nav className="flex items-center justify-between w-full max-w-[90rem] mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center gap-6">
          <Link className="flex items-center gap-2" to="/" onClick={closeMobileMenu}>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Ludoxel</h1>
            </div>
          </Link>

          <SearchCommand variant="header" placeholder="Search..." enableShortcut />
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
            {mainNavigation.map((item) => {
              const isActive = isNavigationItemActive(currentPath, item.href);
              const className = `px-3 py-2 text-sm font-medium transition-colors rounded-xl ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`;

              return (
                <Link className={className} to={item.href} key={item.href}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            className="hidden lg:inline-flex items-center justify-center gap-1 py-3 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-xl transition-colors hover:bg-primary/90"
            to={getStartedHref}
          >
            <span>Get started</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <div className="lg:hidden flex items-center gap-2">
            <SearchCommand variant="icon" placeholder="Search..." />

            <button
              aria-controls="mobile-header-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-haspopup="dialog"
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/50"
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-header-navigation" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="fixed inset-0 z-50 bg-black/80" type="button" aria-label="Close menu" onClick={closeMobileMenu} />

          <div className="fixed inset-y-0 right-0 z-50 h-full w-3/4 max-w-sm border-l border-border bg-background p-6 shadow-lg transition ease-in-out">
            <button
              aria-label="Close"
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
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

              <Link
                className="flex items-center justify-center gap-2 mt-4 py-3 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-xl transition-colors hover:bg-primary/90"
                to={getStartedHref}
                onClick={closeMobileMenu}
              >
                <span>Get started</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
