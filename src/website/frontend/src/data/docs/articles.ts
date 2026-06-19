/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { dataPages } from './content/data';
import { distributionPages } from './content/distribution';
import { gameplayPages } from './content/gameplay';
import { legalPages } from './content/legal';
import { manualPages } from './content/manual';
import { settingsPages } from './content/settings';
import { supportPages } from './content/support';
import { systemsPages } from './content/systems';
import { getDocsHrefFromSegments, type DocsPageContent, type DocsReference } from './types';

const rawDocsPages: DocsPageContent[] = [...manualPages, ...gameplayPages, ...systemsPages, ...settingsPages, ...dataPages, ...distributionPages, ...legalPages, ...supportPages];

function buildReferenceMap(pages: DocsPageContent[]): Map<string, DocsReference> {
  return new Map(
    pages.map((page) => [
      page.title,
      {
        title: page.title,
        href: getDocsHrefFromSegments(page.pathSegments),
        description: 'Related article.',
      },
    ]),
  );
}

function withResolvedReferences(pages: DocsPageContent[]): DocsPageContent[] {
  const referencesByTitle = buildReferenceMap(pages);

  return pages.map((page) => ({
    ...page,
    references: page.relatedTitles?.map((title) => referencesByTitle.get(title)).filter((reference): reference is DocsReference => reference !== undefined),
  }));
}

export type DocsArticlePaginationLink = {
  title: string;
  href: string;
};

export type DocsArticlePaginationLinks = {
  previous: DocsArticlePaginationLink | null;
  next: DocsArticlePaginationLink | null;
};

export const docsPages: DocsPageContent[] = withResolvedReferences(rawDocsPages);

export function getDocsPagePath(page: DocsPageContent): string {
  return page.pathSegments.join('/');
}

export function getDocsPageHref(page: DocsPageContent): string {
  return getDocsHrefFromSegments(page.pathSegments);
}

function toDocsArticlePaginationLink(page: DocsPageContent | undefined): DocsArticlePaginationLink | null {
  if (page === undefined) {
    return null;
  }

  return {
    title: page.navigationTitle,
    href: getDocsPageHref(page),
  };
}

export function getDocsArticlePaginationLinks(page: DocsPageContent): DocsArticlePaginationLinks {
  const currentPageIndex = docsPages.findIndex((candidatePage) => getDocsPagePath(candidatePage) === getDocsPagePath(page));

  if (currentPageIndex === -1) {
    return {
      previous: null,
      next: null,
    };
  }

  return {
    previous: toDocsArticlePaginationLink(docsPages[currentPageIndex - 1]),
    next: toDocsArticlePaginationLink(docsPages[currentPageIndex + 1]),
  };
}
