/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type ChangelogPaginationItem =
  | {
      kind: 'page';
      page: number;
    }
  | {
      kind: 'ellipsis';
      key: string;
    };

const VISIBLE_PAGE_WINDOW = 4;

export function getChangelogTotalPages(entryCount: number, entriesPerPage: number): number {
  return Math.max(1, Math.ceil(entryCount / entriesPerPage));
}

export function clampChangelogPage(page: number, totalPages: number): number {
  const maximumPage = Math.max(1, totalPages);

  return Math.min(Math.max(page, 1), maximumPage);
}

function getPageRange(startPage: number, endPage: number): ChangelogPaginationItem[] {
  return Array.from({ length: endPage - startPage + 1 }, (_, index) => ({
    kind: 'page' as const,
    page: startPage + index,
  }));
}

export function getChangelogPaginationItems(currentPage: number, totalPages: number): ChangelogPaginationItem[] {
  const clampedPage = clampChangelogPage(currentPage, totalPages);

  if (totalPages <= VISIBLE_PAGE_WINDOW + 1) {
    return getPageRange(1, totalPages);
  }

  if (clampedPage <= VISIBLE_PAGE_WINDOW) {
    return [...getPageRange(1, VISIBLE_PAGE_WINDOW), { kind: 'ellipsis', key: 'end-ellipsis' }, { kind: 'page', page: totalPages }];
  }

  if (clampedPage >= totalPages - VISIBLE_PAGE_WINDOW + 1) {
    return [{ kind: 'page', page: 1 }, { kind: 'ellipsis', key: 'start-ellipsis' }, ...getPageRange(totalPages - VISIBLE_PAGE_WINDOW + 1, totalPages)];
  }

  return [...getPageRange(clampedPage, clampedPage + VISIBLE_PAGE_WINDOW - 1), { kind: 'ellipsis', key: 'end-ellipsis' }, { kind: 'page', page: totalPages }];
}

export function getChangelogPageEntries<Entry>(entries: Entry[], currentPage: number, entriesPerPage: number): Entry[] {
  const firstVisibleEntryIndex = (currentPage - 1) * entriesPerPage;

  return entries.slice(firstVisibleEntryIndex, firstVisibleEntryIndex + entriesPerPage);
}

export function parseChangelogPageJump(value: string, currentPage: number, totalPages: number): number {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return currentPage;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isFinite(parsedValue)) {
    return currentPage;
  }

  return clampChangelogPage(Math.trunc(parsedValue), totalPages);
}
