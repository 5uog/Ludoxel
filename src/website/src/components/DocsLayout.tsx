/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ChevronRight, FileText, Home as HomeIcon, Layers, List, Menu, Settings, Shield, Sparkles, Wrench, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { docsIntro, docsSections, onThisPage } from '../data/docs';
import { docsSidebarSections, type DocsSidebarItem } from '../data/navigation';
import AnimatedText from './AnimatedText';

const iconMap: Record<DocsSidebarItem['icon'], React.ComponentType<{ className?: string }>> = {
  file: FileText,
  wrench: Wrench,
  layers: Layers,
  settings: Settings,
  sparkles: Sparkles,
  shield: Shield,
};

function splitHref(href: string): { pathname: string; hash: string } {
  const [pathname, hash = ''] = href.split('#');
  return {
    pathname,
    hash: hash.length > 0 ? `#${hash}` : '',
  };
}

function isSidebarItemActive(currentPathname: string, currentHash: string, href: string): boolean {
  const target = splitHref(href);

  if (target.hash.length > 0) {
    return currentPathname === target.pathname && currentHash === target.hash;
  }

  return currentPathname === target.pathname && currentHash.length === 0;
}

function isOnThisPageItemActive(currentHash: string, href: string, index: number): boolean {
  if (currentHash.length === 0) {
    return index === 0;
  }

  return currentHash === href;
}

type DocsSidebarProps = {
  currentPathname: string;
  currentHash: string;
  onNavigate?: () => void;
};

function DocsSidebar({ currentPathname, currentHash, onNavigate }: DocsSidebarProps): React.JSX.Element {
  return (
    <div className="relative overflow-hidden h-full py-6">
      <div className="h-full w-full rounded-[inherit] overflow-y-auto scrollbar-none">
        <div className="space-y-6 px-4">
          {docsSidebarSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3>

              <div className="relative mt-1">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-sidebar-border" />

                <div className="relative">
                  {section.items.map((item) => {
                    const Icon = iconMap[item.icon];
                    const isActive = isSidebarItemActive(currentPathname, currentHash, item.href);

                    return (
                      <Link
                        className={
                          isActive
                            ? 'relative flex items-center gap-3 pl-6 pr-3 py-2 text-sm transition-colors text-foreground font-medium'
                            : 'relative flex items-center gap-3 pl-6 pr-3 py-2 text-sm transition-colors text-muted-foreground hover:text-foreground'
                        }
                        key={item.href}
                        to={item.href}
                        onClick={onNavigate}
                      >
                        {isActive ? <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-sidebar-primary" /> : null}
                        <Icon className={isActive ? 'h-4 w-4 shrink-0 text-sidebar-primary' : 'h-4 w-4 shrink-0'} />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DocsLayout(): React.JSX.Element {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const currentPathname = location.pathname;
  const currentHash = location.hash;

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen]);

  const closeMobileSidebar = (): void => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex pt-16 max-w-[90rem] mx-auto flex-1 w-full">
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <button
          aria-controls="mobile-docs-navigation"
          aria-expanded={isMobileSidebarOpen}
          aria-haspopup="dialog"
          aria-label="Open navigation"
          className="p-2 rounded-md bg-background border border-border hover:bg-secondary transition-colors"
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-docs-navigation" role="dialog" aria-modal="true" aria-label="Documentation navigation">
          <button className="mobile-sheet-backdrop fixed inset-0 bg-black/80" type="button" aria-label="Close navigation" onClick={closeMobileSidebar} />

          <aside className="mobile-sheet-panel-left fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-sm border-r border-sidebar-border bg-sidebar-background shadow-lg">
            <button
              aria-label="Close navigation"
              className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              type="button"
              onClick={closeMobileSidebar}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <DocsSidebar currentPathname={currentPathname} currentHash={currentHash} onNavigate={closeMobileSidebar} />
          </aside>
        </div>
      ) : null}

      <aside className="hidden lg:block w-64 shrink-0 border-r border-sidebar-border bg-sidebar-background sticky top-16 h-[calc(100vh-4rem)]">
        <DocsSidebar currentPathname={currentPathname} currentHash={currentHash} />
      </aside>

      <main className="flex-1 min-w-0 px-4 md:px-6 lg:px-12 pt-16 lg:pt-10 pb-10 overflow-hidden page-reveal">
        <div className="max-w-3xl w-full">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link className="hover:text-foreground transition-colors flex items-center gap-1" to="/docs/overview">
              <HomeIcon className="h-4 w-4" />
              <span>Docs</span>
            </Link>

            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className="hover:text-foreground transition-colors cursor-pointer">{docsIntro.eyebrow}</span>
            </div>

            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{docsIntro.title}</span>
            </div>
          </nav>

          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <AnimatedText text={docsIntro.title} />
            </h1>
            <p className="text-lg text-muted-foreground mb-12">{docsIntro.description}</p>
          </div>

          <div className="space-y-12">
            {docsSections.map((section, index) => (
              <section className={`scroll-mt-24 page-reveal page-reveal-delay-${Math.min(index + 1, 4)}`} id={section.id} key={section.id}>
                <h2 className="font-semibold tracking-tight mb-4 text-2xl">{section.title}</h2>

                <div className="text-muted-foreground leading-relaxed space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {section.items ? (
                    <ul className="list-disc list-inside space-y-2 ml-2 mt-4">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <aside className="hidden xl:block w-56 shrink-0 sticky top-24 h-fit pr-6">
        <div className="flex items-center gap-2 text-sm font-semibold mb-4">
          <List className="h-4 w-4" />
          <span>On this page</span>
        </div>

        <nav className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sidebar-border" />

          <div className="relative">
            {onThisPage.map((item, index) => {
              const isActive = isOnThisPageItemActive(currentHash, item.href, index);

              return (
                <a
                  className={
                    isActive
                      ? 'relative block w-full text-left text-sm py-1.5 transition-colors pl-4 text-foreground font-medium'
                      : 'relative block w-full text-left text-sm py-1.5 transition-colors pl-4 text-muted-foreground hover:text-foreground'
                  }
                  href={item.href}
                  key={item.href}
                >
                  {isActive ? <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sidebar-primary" /> : null}
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      </aside>
    </div>
  );
}
