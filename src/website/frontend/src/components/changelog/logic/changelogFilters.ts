/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type ChangelogEntry } from '../../../data/changelog';

export type ChangelogReleaseKindId = 'hotfix' | 'beta' | 'release';

export type ChangelogReleaseKindFilter = {
  id: ChangelogReleaseKindId;
  label: string;
};

export type ChangelogFilterState = {
  searchQuery: string;
  selectedReleaseKinds: ChangelogReleaseKindId[];
  selectedTags: string[];
};

export const CHANGELOG_RELEASE_KIND_FILTERS: ChangelogReleaseKindFilter[] = [
  {
    id: 'hotfix',
    label: 'Hotfix',
  },
  {
    id: 'beta',
    label: 'Beta',
  },
  {
    id: 'release',
    label: 'Release Version',
  },
];

function normalizeChangelogSearchText(text: string): string {
  return text.trim().toLowerCase();
}

function entryIncludesHotfix(entry: ChangelogEntry): boolean {
  return /\bhotfix\b/i.test(entry.date);
}

function entryIncludesBeta(entry: ChangelogEntry): boolean {
  return /\bbeta\b/i.test(entry.date);
}

export function getChangelogReleaseKind(entry: ChangelogEntry): ChangelogReleaseKindId {
  if (entryIncludesHotfix(entry)) {
    return 'hotfix';
  }

  if (entryIncludesBeta(entry)) {
    return 'beta';
  }

  return 'release';
}

export function getChangelogReleaseKindLabel(releaseKind: ChangelogReleaseKindId): string {
  return CHANGELOG_RELEASE_KIND_FILTERS.find((filter) => filter.id === releaseKind)?.label ?? 'Release Version';
}

function getChangelogSearchText(entry: ChangelogEntry): string {
  const releaseKindLabel = getChangelogReleaseKindLabel(getChangelogReleaseKind(entry));

  return [entry.date, releaseKindLabel, ...entry.tags, ...entry.sections.flatMap((section) => [section.title, ...section.items])].join('\n').toLowerCase();
}

function entryMatchesSearch(entry: ChangelogEntry, searchQuery: string): boolean {
  const normalizedSearchQuery = normalizeChangelogSearchText(searchQuery);

  if (normalizedSearchQuery.length === 0) {
    return true;
  }

  return getChangelogSearchText(entry).includes(normalizedSearchQuery);
}

function entryMatchesReleaseKind(entry: ChangelogEntry, releaseKind: ChangelogReleaseKindId): boolean {
  return getChangelogReleaseKind(entry) === releaseKind;
}

function entryMatchesReleaseKinds(entry: ChangelogEntry, selectedReleaseKinds: ChangelogReleaseKindId[]): boolean {
  if (selectedReleaseKinds.length === 0) {
    return true;
  }

  return selectedReleaseKinds.some((releaseKind) => entryMatchesReleaseKind(entry, releaseKind));
}

function entryMatchesTags(entry: ChangelogEntry, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) {
    return true;
  }

  return selectedTags.every((tag) => entry.tags.includes(tag));
}

export function filterChangelogEntries(entries: ChangelogEntry[], filters: ChangelogFilterState): ChangelogEntry[] {
  const searchFilteredEntries = entries.filter((entry) => entryMatchesSearch(entry, filters.searchQuery));
  const releaseFilteredEntries = searchFilteredEntries.filter((entry) => entryMatchesReleaseKinds(entry, filters.selectedReleaseKinds));

  return releaseFilteredEntries.filter((entry) => entryMatchesTags(entry, filters.selectedTags));
}

export function getAllChangelogTags(entries: ChangelogEntry[]): string[] {
  return [...new Set(entries.flatMap((entry) => entry.tags))].sort((firstTag, secondTag) => firstTag.localeCompare(secondTag));
}

export function countChangelogEntriesByReleaseKind(entries: ChangelogEntry[], releaseKind: ChangelogReleaseKindId): number {
  return entries.filter((entry) => entryMatchesReleaseKind(entry, releaseKind)).length;
}

export function countChangelogEntriesByTag(entries: ChangelogEntry[], tag: string): number {
  return entries.filter((entry) => entry.tags.includes(tag)).length;
}

export function hasActiveChangelogFilters(filters: ChangelogFilterState): boolean {
  return filters.searchQuery.trim().length > 0 || filters.selectedReleaseKinds.length > 0 || filters.selectedTags.length > 0;
}

export function formatChangelogEntryCount(filteredCount: number, totalCount: number): string {
  if (filteredCount === totalCount) {
    return `${totalCount} entries`;
  }

  return `${filteredCount} of ${totalCount} entries`;
}
