/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { List } from 'lucide-react';

import { isOnThisPageItemActive } from '../logic/docsNavigationState';

type DocsOnThisPageItem = {
  label: string;
  href: string;
};

type DocsOnThisPageProps = {
  currentHash: string;
  footerOverlapPx: number;
  items: DocsOnThisPageItem[];
};

export default function DocsOnThisPage({ currentHash, footerOverlapPx, items }: DocsOnThisPageProps): React.JSX.Element {
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
            const isActive = isOnThisPageItemActive(currentHash, item.href, index);

            return (
              <a
                className={
                  isActive
                    ? 'relative block w-full py-1.5 pl-4 text-left text-sm font-medium text-foreground transition-colors'
                    : 'relative block w-full py-1.5 pl-4 text-left text-sm text-muted-foreground transition-colors hover:text-foreground'
                }
                href={item.href}
                key={item.href}
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
