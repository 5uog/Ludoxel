/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type SearchIndexEntry } from '../../../data/docs/search';
import { type GroupedSearchRows, type SearchRow } from './searchCommand.types';

export function getSectionKey(entry: SearchIndexEntry): string {
  return entry.section.trim().toLowerCase();
}

export function filterSearchRows(entries: SearchIndexEntry[], normalizedQuery: string): SearchRow[] {
  if (normalizedQuery.length < 2) {
    return [];
  }

  return entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => {
      const searchableText = `${entry.title} ${entry.description} ${entry.section}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
}

export function groupSearchRows(rows: SearchRow[]): GroupedSearchRows {
  return rows.reduce<GroupedSearchRows>((groups, row) => {
    const sectionKey = getSectionKey(row.entry);
    const group = groups[sectionKey] ?? [];
    group.push(row);
    groups[sectionKey] = group;
    return groups;
  }, {});
}
