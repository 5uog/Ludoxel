/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type SearchIndexEntry } from '../../../data/docs/search';
import { type GroupedSearchRows, type SearchRow } from './searchCommand.types';
import { rankSearchEntry } from './searchSemantics';

const MAX_SEARCH_RESULTS = 24;

export function getSectionKey(entry: SearchIndexEntry): string {
  return entry.section.trim().toLowerCase();
}

export function getSearchRowDomId(row: SearchRow): string {
  return `search-result-option-${row.index}`;
}

export function filterSearchRows(entries: SearchIndexEntry[], normalizedQuery: string): SearchRow[] {
  if (normalizedQuery.length < 2) {
    return [];
  }

  return entries
    .map((entry, index) => rankSearchEntry(entry, index, normalizedQuery))
    .filter((row): row is SearchRow => row !== null)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.entry.title.localeCompare(right.entry.title);
    })
    .slice(0, MAX_SEARCH_RESULTS);
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

export function flattenGroupedSearchRows(groups: GroupedSearchRows): SearchRow[] {
  return Object.values(groups).flat();
}
