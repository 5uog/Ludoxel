/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsPages } from './docs/index';
import type { DocsPageContent } from './docs/types';

export type { DocsPageContent, DocsReference, DocsSearchSection, DocsSection } from './docs/types';

export { docsPages };

export const docsDefaultSlug = 'application-overview';

export function getDocsPage(slug: string | undefined): DocsPageContent | undefined {
  const requestedSlug = slug ?? docsDefaultSlug;
  return docsPages.find((page) => page.slug === requestedSlug);
}

export function getDocsPageHref(page: DocsPageContent): string {
  return `/docs/${page.slug}`;
}

export function getOnThisPage(page: DocsPageContent): { label: string; href: string }[] {
  const sectionLinks = page.sections.map((section) => ({
    label: section.title,
    href: `#${section.id}`,
  }));

  if (!page.references || page.references.length === 0) {
    return sectionLinks;
  }

  return [
    ...sectionLinks,
    {
      label: 'References',
      href: '#references',
    },
  ];
}
