/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsPages, getDocsPageHref, type DocsPageContent } from './docs';

export type SearchIndexEntry = {
  title: string;
  description: string;
  href: string;
  section: string;
};

export function createDocsSearchEntries(pages: DocsPageContent[]): SearchIndexEntry[] {
  return pages.map((page) => ({
    title: page.title,
    description: page.description,
    href: getDocsPageHref(page),
    section: page.searchSection,
  }));
}

export const searchIndex: SearchIndexEntry[] = createDocsSearchEntries(docsPages);
