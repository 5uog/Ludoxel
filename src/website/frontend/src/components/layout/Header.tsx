/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ArrowUpRight, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { getStartedHref } from '../../data/navigation';
import SearchCommand from '../search/SearchCommand';
import DesktopHeaderNavigation from './desktop/DesktopHeaderNavigation';
import { type HeaderProps } from './logic/header.types';
import { useMobileHeaderNavigation } from './logic/useMobileHeaderNavigation';
import MobileHeaderNavigation from './mobile/MobileHeaderNavigation';

export default function Header({ activePath }: HeaderProps): React.JSX.Element {
  const location = useLocation();
  const currentPath = activePath ?? location.pathname;
  const mobileNavigation = useMobileHeaderNavigation(currentPath);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background">
      <nav className="flex items-center justify-between w-full max-w-360 mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center gap-6">
          <Link className="flex items-center gap-2" to="/" onClick={mobileNavigation.close}>
            <h1 className="text-xl font-bold text-foreground">Ludoxel</h1>
          </Link>

          <SearchCommand variant="header" placeholder="Search..." enableShortcut />
        </div>

        <div className="flex items-center gap-2">
          <DesktopHeaderNavigation currentPath={currentPath} />

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
              aria-expanded={mobileNavigation.isOpen && !mobileNavigation.isClosing}
              aria-haspopup="dialog"
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/50"
              type="button"
              onClick={mobileNavigation.open}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {mobileNavigation.isOpen ? (
        <MobileHeaderNavigation backdropClassName={mobileNavigation.backdropClassName} currentPath={currentPath} panelClassName={mobileNavigation.panelClassName} onClose={mobileNavigation.close} />
      ) : null}
    </header>
  );
}
