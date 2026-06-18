/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ChevronRight } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { docsSidebarSections } from '../../../data/docs/navigation';
import { findActiveSidebarSectionTitle, isSidebarItemActive } from '../logic/docsNavigationState';
import { docsSidebarIconMap } from '../logic/docsSidebarIcons';

type DocsSidebarProps = {
  currentPathname: string;
  onNavigate?: () => void;
};

export default function DocsSidebar({ currentPathname, onNavigate }: DocsSidebarProps): React.JSX.Element {
  const sidebarId = useId();
  const activeSectionTitle = useMemo(() => findActiveSidebarSectionTitle(currentPathname), [currentPathname]);
  const [openSectionTitle, setOpenSectionTitle] = useState<string | null>(activeSectionTitle);

  useEffect(() => {
    setOpenSectionTitle(activeSectionTitle);
  }, [activeSectionTitle, currentPathname]);

  const toggleSection = (sectionTitle: string): void => {
    setOpenSectionTitle((currentSectionTitle) => (currentSectionTitle === sectionTitle ? null : sectionTitle));
  };

  return (
    <div className="h-full overflow-y-auto py-6 scrollbar-none">
      <div className="space-y-2 px-4">
        {docsSidebarSections.map((section) => {
          const isSectionOpen = openSectionTitle === section.title;
          const sectionPanelId = `${sidebarId}-${section.title.toLowerCase()}-panel`;

          return (
            <div key={section.title}>
              <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <button
                  aria-controls={sectionPanelId}
                  aria-expanded={isSectionOpen}
                  className="flex w-full items-center gap-2 text-left transition-colors hover:text-foreground"
                  type="button"
                  onClick={() => toggleSection(section.title)}
                >
                  <ChevronRight
                    className={isSectionOpen ? 'h-3.5 w-3.5 shrink-0 rotate-90 transition-transform duration-300 ease-out' : 'h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out'}
                  />
                  <span className="truncate">{section.title}</span>
                </button>
              </h3>

              <div
                aria-hidden={!isSectionOpen}
                className={isSectionOpen ? 'grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out' : 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out'}
                id={sectionPanelId}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="relative mt-1">
                    <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-border" />

                    <div className="relative">
                      {section.items.map((item) => {
                        const Icon = docsSidebarIconMap[item.icon];
                        const isActive = isSidebarItemActive(currentPathname, item.href);

                        return (
                          <Link
                            aria-hidden={!isSectionOpen}
                            className={
                              isActive
                                ? 'relative flex items-center gap-3 py-2 pl-6 pr-3 text-sm font-medium text-foreground transition-colors'
                                : 'relative flex items-center gap-3 py-2 pl-6 pr-3 text-sm text-muted-foreground transition-colors hover:text-foreground'
                            }
                            key={item.href}
                            tabIndex={isSectionOpen ? undefined : -1}
                            to={item.href}
                            onClick={onNavigate}
                          >
                            {isActive ? <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-foreground" /> : null}
                            <Icon className={isActive ? 'h-4 w-4 shrink-0 text-foreground' : 'h-4 w-4 shrink-0'} />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
