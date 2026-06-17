/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ChevronRight, FileText, Home as HomeIcon, Layers, List, Menu, Settings, Shield, Sparkles, Wrench, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  docsSearchSections,
  type DocsCollection,
  type DocsPageContent,
  type DocsSearchSection,
  getDocsBreadcrumbs,
  getDocsCollectionBreadcrumbs,
  getDocsCollectionHref,
  getDocsPageHref,
  getOnThisPage,
} from '../data/docs';
import { createDocsSearchEntries } from '../data/searchIndex';
import { docsSidebarSections, type DocsSidebarItem } from '../data/navigation';
import AnimatedText from './AnimatedText';
import SearchCommand from './SearchCommand';

const iconMap: Record<DocsSidebarItem['icon'], React.ComponentType<{ className?: string }>> = {
  file: FileText,
  wrench: Wrench,
  layers: Layers,
  settings: Settings,
  sparkles: Sparkles,
  shield: Shield,
};

const MOBILE_SHEET_ANIMATION_MS = 500;

type SplitHref = {
  pathname: string;
  hash: string;
};

type InlineTextPart = string | React.JSX.Element;

type DocsLayoutProps =
  | {
      page: DocsPageContent;
    }
  | {
      collection: DocsCollection;
    };

function splitHref(href: string): SplitHref {
  const [pathname, hash = ''] = href.split('#');

  return {
    pathname,
    hash: hash.length > 0 ? `#${hash}` : '',
  };
}

function isSidebarItemActive(currentPathname: string, href: string): boolean {
  const target = splitHref(href);
  return currentPathname === target.pathname;
}

function isOnThisPageItemActive(currentHash: string, href: string, index: number): boolean {
  if (currentHash.length === 0) {
    return index === 0;
  }

  return currentHash === href;
}

function renderInlineText(text: string): InlineTextPart[] {
  return text
    .split(/(`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        return (
          <code className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.92em] text-foreground" key={`${part}-${index}`}>
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
}

function groupPagesByCategory(pages: DocsPageContent[]): Map<DocsSearchSection, DocsPageContent[]> {
  const groupedPages = new Map<DocsSearchSection, DocsPageContent[]>();

  pages.forEach((page) => {
    const existingPages = groupedPages.get(page.category) ?? [];
    existingPages.push(page);
    groupedPages.set(page.category, existingPages);
  });

  return groupedPages;
}

function groupPagesBySubcategory(pages: DocsPageContent[]): Map<string, DocsPageContent[]> {
  const groupedPages = new Map<string, DocsPageContent[]>();

  pages.forEach((page) => {
    const existingPages = groupedPages.get(page.subcategory) ?? [];
    existingPages.push(page);
    groupedPages.set(page.subcategory, existingPages);
  });

  return groupedPages;
}

function groupPagesByGroup(pages: DocsPageContent[]): Map<string, DocsPageContent[]> {
  const groupedPages = new Map<string, DocsPageContent[]>();

  pages.forEach((page) => {
    const existingPages = groupedPages.get(page.group) ?? [];
    existingPages.push(page);
    groupedPages.set(page.group, existingPages);
  });

  return groupedPages;
}

function firstPageHrefForCategory(pages: DocsPageContent[]): string {
  return getDocsCollectionHref(pages[0]?.pathSegments.slice(0, 1) ?? []);
}

function firstPageHrefForSubcategory(pages: DocsPageContent[]): string {
  return getDocsCollectionHref(pages[0]?.pathSegments.slice(0, 2) ?? []);
}

function firstPageHrefForGroup(pages: DocsPageContent[]): string {
  return getDocsCollectionHref(pages[0]?.pathSegments.slice(0, 3) ?? []);
}

function ArticleTitleList({ pages }: { pages: DocsPageContent[] }): React.JSX.Element {
  return (
    <ul className="space-y-2 border-l border-border pl-4">
      {pages.map((page) => (
        <li className="leading-relaxed" key={getDocsPageHref(page)}>
          <Link className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={getDocsPageHref(page)}>
            {page.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DocsRootCollection({ pagesByCategory }: { pagesByCategory: Map<DocsSearchSection, DocsPageContent[]> }): React.JSX.Element {
  return (
    <div className="space-y-10">
      {docsSearchSections
        .map((section) => {
          const sectionPages = pagesByCategory.get(section);

          if (sectionPages === undefined || sectionPages.length === 0) {
            return null;
          }

          const pagesBySubcategory = groupPagesBySubcategory(sectionPages);

          return (
            <section className="page-reveal page-reveal-delay-2" key={section}>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForCategory(sectionPages)}>
                  {section}
                </Link>
              </h2>

              <div className="space-y-6">
                {[...pagesBySubcategory.entries()].map(([subcategory, subcategoryPages]) => {
                  const pagesByGroup = groupPagesByGroup(subcategoryPages);

                  return (
                    <div className="border-l border-border pl-4" key={subcategory}>
                      <h3 className="mb-3 text-base font-medium">
                        <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForSubcategory(subcategoryPages)}>
                          {subcategory}
                        </Link>
                      </h3>

                      <div className="space-y-5">
                        {[...pagesByGroup.entries()].map(([group, groupPages]) => (
                          <div key={group}>
                            <h4 className="mb-2 text-sm font-medium">
                              <Link className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={firstPageHrefForGroup(groupPages)}>
                                {group}
                              </Link>
                            </h4>

                            <ArticleTitleList pages={groupPages} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
        .filter(Boolean)}
    </div>
  );
}

function DocsCategoryCollection({ pagesBySubcategory }: { pagesBySubcategory: Map<string, DocsPageContent[]> }): React.JSX.Element {
  return (
    <div className="space-y-10">
      {[...pagesBySubcategory.entries()].map(([subcategory, subcategoryPages], index) => {
        const pagesByGroup = groupPagesByGroup(subcategoryPages);

        return (
          <section className={`page-reveal page-reveal-delay-${Math.min(index + 2, 4)}`} key={subcategory}>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">
              <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForSubcategory(subcategoryPages)}>
                {subcategory}
              </Link>
            </h2>

            <div className="space-y-5 border-l border-border pl-4">
              {[...pagesByGroup.entries()].map(([group, groupPages]) => (
                <div key={group}>
                  <h3 className="mb-2 text-sm font-medium">
                    <Link className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={firstPageHrefForGroup(groupPages)}>
                      {group}
                    </Link>
                  </h3>

                  <ArticleTitleList pages={groupPages} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DocsSubcategoryCollection({ pagesByGroup }: { pagesByGroup: Map<string, DocsPageContent[]> }): React.JSX.Element {
  return (
    <div className="space-y-10">
      {[...pagesByGroup.entries()].map(([group, groupPages], index) => (
        <section className={`page-reveal page-reveal-delay-${Math.min(index + 2, 4)}`} key={group}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForGroup(groupPages)}>
              {group}
            </Link>
          </h2>

          <ArticleTitleList pages={groupPages} />
        </section>
      ))}
    </div>
  );
}

function DocsCollectionContent({ collection }: { collection: DocsCollection }): React.JSX.Element {
  const searchEntries = useMemo(() => createDocsSearchEntries(collection.pages), [collection.pages]);
  const pagesByCategory = useMemo(() => groupPagesByCategory(collection.pages), [collection.pages]);
  const pagesBySubcategory = useMemo(() => groupPagesBySubcategory(collection.pages), [collection.pages]);
  const pagesByGroup = useMemo(() => groupPagesByGroup(collection.pages), [collection.pages]);
  const searchPlaceholder = collection.pathSegments.length === 0 ? 'Search all documentation articles' : `Search ${collection.title} articles`;

  return (
    <div className="space-y-10">
      <div className="page-reveal page-reveal-delay-1 max-w-2xl">
        <SearchCommand variant="hero" placeholder={searchPlaceholder} entries={searchEntries} />
      </div>

      {collection.pathSegments.length === 0 ? <DocsRootCollection pagesByCategory={pagesByCategory} /> : null}
      {collection.pathSegments.length === 1 ? <DocsCategoryCollection pagesBySubcategory={pagesBySubcategory} /> : null}
      {collection.pathSegments.length === 2 ? <DocsSubcategoryCollection pagesByGroup={pagesByGroup} /> : null}

      {collection.pathSegments.length === 3 ? (
        <section className="page-reveal page-reveal-delay-2">
          <ArticleTitleList pages={collection.pages} />
        </section>
      ) : null}
    </div>
  );
}

function DocsArticleContent({ page }: { page: DocsPageContent }): React.JSX.Element {
  return (
    <div className="space-y-12">
      {page.sections.map((section, index) => (
        <section className={`scroll-mt-24 page-reveal page-reveal-delay-${Math.min(index + 1, 4)}`} id={section.id} key={section.id}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">{section.title}</h2>

          <div className="space-y-4 leading-relaxed text-muted-foreground">
            {section.body.map((paragraph, paragraphIndex) => (
              <p key={`${section.id}-paragraph-${paragraphIndex}`}>{renderInlineText(paragraph)}</p>
            ))}

            {section.items ? (
              <ul className="ml-2 mt-4 list-inside list-disc space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={`${section.id}-item-${itemIndex}`}>{renderInlineText(item)}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      {page.references && page.references.length > 0 ? (
        <section className="scroll-mt-24 border-t border-border pt-8" id="see-also">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">See also</h2>
          <ul className="list-disc space-y-2 pl-5">
            {page.references.map((reference) => (
              <li className="text-muted-foreground" key={reference.href}>
                <Link className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={reference.href}>
                  {reference.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

type DocsSidebarProps = {
  currentPathname: string;
  onNavigate?: () => void;
};

function DocsSidebar({ currentPathname, onNavigate }: DocsSidebarProps): React.JSX.Element {
  return (
    <div className="relative h-full overflow-hidden py-6">
      <div className="h-full w-full overflow-y-auto rounded-[inherit] scrollbar-none">
        <div className="space-y-6 px-4">
          {docsSidebarSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3>

              <div className="relative mt-1">
                <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-border" />

                <div className="relative">
                  {section.items.map((item) => {
                    const Icon = iconMap[item.icon];
                    const isActive = isSidebarItemActive(currentPathname, item.href);

                    return (
                      <Link
                        className={
                          isActive
                            ? 'relative flex items-center gap-3 py-2 pl-6 pr-3 text-sm font-medium text-foreground transition-colors'
                            : 'relative flex items-center gap-3 py-2 pl-6 pr-3 text-sm text-muted-foreground transition-colors hover:text-foreground'
                        }
                        key={item.href}
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DocsLayout(props: DocsLayoutProps): React.JSX.Element {
  const location = useLocation();
  const currentLocationKey = `${location.pathname}${location.hash}`;
  const previousLocationKeyRef = useRef<string>(currentLocationKey);
  const closeTimerRef = useRef<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileSidebarClosing, setIsMobileSidebarClosing] = useState<boolean>(false);

  const view =
    'page' in props
      ? {
          kind: 'article' as const,
          title: props.page.title,
          description: props.page.description,
          breadcrumbs: getDocsBreadcrumbs(props.page),
          page: props.page,
        }
      : {
          kind: 'collection' as const,
          title: props.collection.title,
          description: props.collection.description,
          breadcrumbs: getDocsCollectionBreadcrumbs(props.collection),
          collection: props.collection,
        };

  const currentPathname = location.pathname;
  const currentHash = location.hash;
  const onThisPage = view.kind === 'article' ? getOnThisPage(view.page) : [];

  const clearCloseTimer = (): void => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openMobileSidebar = (): void => {
    clearCloseTimer();
    setIsMobileSidebarClosing(false);
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = (): void => {
    if (!isMobileSidebarOpen || closeTimerRef.current !== null) {
      return;
    }

    setIsMobileSidebarClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsMobileSidebarOpen(false);
      setIsMobileSidebarClosing(false);
      closeTimerRef.current = null;
    }, MOBILE_SHEET_ANIMATION_MS);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (previousLocationKeyRef.current === currentLocationKey) {
      return;
    }

    previousLocationKeyRef.current = currentLocationKey;

    if (isMobileSidebarOpen) {
      closeMobileSidebar();
    }
  }, [currentLocationKey, isMobileSidebarOpen]);

  useEffect(() => {
    if (!isMobileSidebarOpen || isMobileSidebarClosing) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen, isMobileSidebarClosing]);

  const mobileSidebarBackdropClassName = isMobileSidebarClosing ? 'mobile-sheet-backdrop mobile-sheet-backdrop-exit fixed inset-0 bg-black/80' : 'mobile-sheet-backdrop fixed inset-0 bg-black/80';

  const mobileSidebarPanelClassName = isMobileSidebarClosing
    ? 'mobile-sheet-panel-left mobile-sheet-panel-left-exit fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-sm border-r border-border bg-background shadow-lg'
    : 'mobile-sheet-panel-left fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-sm border-r border-border bg-background shadow-lg';

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-1 pt-16">
      <div className="fixed left-4 top-20 z-40 lg:hidden">
        <button
          aria-controls="mobile-docs-navigation"
          aria-expanded={isMobileSidebarOpen && !isMobileSidebarClosing}
          aria-haspopup="dialog"
          aria-label="Open navigation"
          className="rounded-md border border-border bg-background p-2 transition-colors hover:bg-secondary"
          type="button"
          onClick={openMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-docs-navigation" role="dialog" aria-modal="true" aria-label="Documentation navigation">
          <button className={mobileSidebarBackdropClassName} type="button" aria-label="Close navigation" onClick={closeMobileSidebar} />

          <aside className={mobileSidebarPanelClassName}>
            <button
              aria-label="Close navigation"
              className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              type="button"
              onClick={closeMobileSidebar}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <DocsSidebar currentPathname={currentPathname} onNavigate={closeMobileSidebar} />
          </aside>
        </div>
      ) : null}

      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border lg:block">
        <DocsSidebar currentPathname={currentPathname} />
      </aside>

      <main className="page-reveal min-w-0 flex-1 overflow-hidden px-4 pb-10 pt-16 md:px-6 lg:px-12 lg:pt-10">
        <div className={view.kind === 'article' ? 'w-full max-w-3xl' : 'w-full max-w-5xl'}>
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            {view.breadcrumbs.map((breadcrumb, index) => {
              const isLast = index === view.breadcrumbs.length - 1;

              return (
                <div className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap" key={breadcrumb.href}>
                  {index === 0 ? null : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <Link
                    aria-current={isLast ? 'page' : undefined}
                    className={
                      isLast
                        ? 'inline-flex items-center gap-1 whitespace-nowrap font-medium text-foreground'
                        : 'inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground'
                    }
                    to={breadcrumb.href}
                  >
                    {index === 0 ? <HomeIcon className="h-4 w-4 shrink-0" /> : null}
                    <span className="whitespace-nowrap">{breadcrumb.label}</span>
                  </Link>
                </div>
              );
            })}
          </nav>

          <div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              <AnimatedText text={view.title} />
            </h1>
            <p className="mb-12 text-lg text-muted-foreground">{view.description}</p>
          </div>

          {view.kind === 'article' ? <DocsArticleContent page={view.page} /> : <DocsCollectionContent collection={view.collection} />}
        </div>
      </main>

      {view.kind === 'article' ? (
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 pr-6 xl:block">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <List className="h-4 w-4" />
            <span>On this page</span>
          </div>

          <nav className="relative">
            <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-border" />

            <div className="relative">
              {onThisPage.map((item, index) => {
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
      ) : null}
    </div>
  );
}
