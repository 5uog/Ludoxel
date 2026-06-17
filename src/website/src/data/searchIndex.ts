/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsPages, getDocsPageHref } from './docs';

export type SearchIndexEntry = {
  title: string;
  description: string;
  href: string;
  section: string;
};

const docsSearchEntries: SearchIndexEntry[] = docsPages.map((page) => ({
  title: page.title,
  description: page.description,
  href: getDocsPageHref(page),
  section: page.searchSection,
}));

export const searchIndex: SearchIndexEntry[] = [
  ...docsSearchEntries,
  {
    title: 'Changelog',
    description: 'Public website notes and unreleased documentation hub changes.',
    href: '/changelog',
    section: 'Updates',
  },
];
