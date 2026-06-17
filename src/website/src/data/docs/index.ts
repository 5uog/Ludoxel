/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { dataPages } from './data';
import { developerPages } from './developer';
import { distributionPages } from './distribution';
import { gameplayPages } from './gameplay';
import { legalPages } from './legal';
import { manualPages } from './manual';
import { settingsPages } from './settings';
import { supportPages } from './support';
import { systemsPages } from './systems';
import { getDocsHrefFromSegments, type DocsPageContent, type DocsReference } from './types';

const rawDocsPages: DocsPageContent[] = [...manualPages, ...gameplayPages, ...systemsPages, ...settingsPages, ...dataPages, ...distributionPages, ...legalPages, ...supportPages, ...developerPages];

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

export const docsPages: DocsPageContent[] = withResolvedReferences(rawDocsPages);
