/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ArrowUpRight, X } from 'lucide-react';

import { getStartedHref, mainNavigation } from '../../../../data/navigation';
import MobileHeaderNavigationItem from './MobileHeaderNavigationItem';

type MobileHeaderNavigationProps = {
  backdropClassName: string;
  currentPath: string;
  panelClassName: string;
  onClose: () => void;
};

export default function MobileHeaderNavigation({ backdropClassName, currentPath, panelClassName, onClose }: MobileHeaderNavigationProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 lg:hidden" id="mobile-header-navigation" role="dialog" aria-modal="true" aria-label="Menu">
      <button className={backdropClassName} type="button" aria-label="Close menu" onClick={onClose} />

      <div className={panelClassName}>
        <button aria-label="Close" className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" type="button" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-foreground">Menu</h2>
        </div>

        <nav className="flex flex-col gap-2 mt-8" aria-label="Mobile primary navigation">
          {mainNavigation.map((item) => (
            <MobileHeaderNavigationItem currentPath={currentPath} item={item} key={item.href} onNavigate={onClose} />
          ))}

          <a className="flex items-center justify-center gap-2 mt-4 py-3 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-xl transition-colors hover:bg-primary/90" href={getStartedHref} rel="noreferrer" target="_blank" onClick={onClose}>
            <span>Get started</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </div>
  );
}
