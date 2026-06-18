/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Menu, X } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { getOnThisPage } from '../../data/docs/collections';
import AnimatedText from '../animation/AnimatedText';
import DocsArticleContent from './article/DocsArticleContent';
import DocsBreadcrumbs from './breadcrumbs/DocsBreadcrumbs';
import DocsCollectionContent from './collection/DocsCollectionContent';
import DocsCopyrightBanner from './legal/DocsCopyrightBanner';
import { type DocsLayoutProps } from './logic/docsLayout.types';
import { getDocsContentWidthClassName, getDocsLayoutClassName, getDocsLayoutView } from './logic/docsLayoutView';
import { useDocsFooterOverlap } from './logic/useDocsFooterOverlap';
import { useDocsMobileSidebar } from './logic/useDocsMobileSidebar';
import DocsOnThisPage from './navigation/DocsOnThisPage';
import DocsSidebar from './navigation/DocsSidebar';

export default function DocsLayout(props: DocsLayoutProps): React.JSX.Element {
  const location = useLocation();
  const currentLocationKey = `${location.pathname}${location.hash}`;
  const view = useMemo(() => getDocsLayoutView(props), [props]);
  const currentPathname = location.pathname;
  const currentHash = location.hash;
  const onThisPage = view.kind === 'article' ? getOnThisPage(view.page) : [];
  const layoutClassName = getDocsLayoutClassName(view);
  const contentWidthClassName = getDocsContentWidthClassName(view);
  const footerOverlapPx = useDocsFooterOverlap(currentLocationKey);
  const mobileSidebar = useDocsMobileSidebar(currentLocationKey);

  return (
    <div className={layoutClassName}>
      <div className="fixed left-4 top-20 z-40 lg:hidden">
        <button
          aria-controls="mobile-docs-navigation"
          aria-expanded={mobileSidebar.isOpen && !mobileSidebar.isClosing}
          aria-haspopup="dialog"
          aria-label="Open navigation"
          className="rounded-md border border-border bg-background p-2 transition-colors hover:bg-secondary"
          type="button"
          onClick={mobileSidebar.open}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileSidebar.isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-docs-navigation" role="dialog" aria-modal="true" aria-label="Documentation navigation">
          <button className={mobileSidebar.backdropClassName} type="button" aria-label="Close navigation" onClick={mobileSidebar.close} />

          <aside className={mobileSidebar.panelClassName}>
            <button
              aria-label="Close navigation"
              className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              type="button"
              onClick={mobileSidebar.close}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <DocsSidebar currentPathname={currentPathname} onNavigate={mobileSidebar.close} />
          </aside>
        </div>
      ) : null}

      <aside
        className="fixed left-[max(0px,calc((100vw-90rem)/2))] top-16 z-30 hidden w-64 shrink-0 overflow-hidden border-r border-border bg-background transition-[bottom] duration-300 ease-out lg:block"
        style={{ bottom: `${footerOverlapPx}px` }}
      >
        <DocsSidebar currentPathname={currentPathname} />
      </aside>

      <main className="page-reveal min-w-0 flex-1 overflow-visible px-4 pb-20 pt-16 md:px-6 lg:px-12 lg:pt-10">
        <div className={contentWidthClassName}>
          <DocsBreadcrumbs breadcrumbs={view.breadcrumbs} />

          <div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              <AnimatedText animationKey={currentPathname} text={view.title} />
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              <AnimatedText animationKey={`${currentPathname}-description`} text={view.description} />
            </p>
          </div>

          <DocsCopyrightBanner />

          {view.kind === 'article' ? <DocsArticleContent page={view.page} /> : <DocsCollectionContent collection={view.collection} />}
        </div>
      </main>

      {view.kind === 'article' ? <DocsOnThisPage currentHash={currentHash} footerOverlapPx={footerOverlapPx} items={onThisPage} /> : null}
    </div>
  );
}
