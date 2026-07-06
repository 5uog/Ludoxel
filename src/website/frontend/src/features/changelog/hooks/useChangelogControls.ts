/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type ChangeEvent, type KeyboardEvent, type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type ChangelogEntry } from '../../../data/changelog';
import { type ChangelogFilterState, type ChangelogReleaseKindId, filterChangelogEntries, getAllChangelogTags, hasActiveChangelogFilters } from '../lib/changelogFilters';
import { clampChangelogPage, getChangelogPageEntries, getChangelogTotalPages, parseChangelogPageJump } from '../lib/changelogPagination';

const CHANGELOG_PANEL_ANIMATION_MS = 200;

export type ChangelogControlsState = {
  allTags: string[];
  currentPage: number;
  entries: ChangelogEntry[];
  entriesPerPage: number;
  filteredEntries: ChangelogEntry[];
  hasActiveFilters: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  isPanelClosing: boolean;
  isPanelOpen: boolean;
  pageJumpValue: string;
  searchQuery: string;
  selectedReleaseKinds: ChangelogReleaseKindId[];
  selectedTags: string[];
  totalEntries: number;
  totalPages: number;
  visibleEntries: ChangelogEntry[];
  clearFilters: () => void;
  clearSearchQuery: () => void;
  closePanel: () => void;
  goToPage: (page: number) => void;
  handlePageJumpChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePageJumpKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleSearchInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  jumpToPage: () => void;
  openPanel: () => void;
  toggleReleaseKind: (releaseKind: ChangelogReleaseKindId) => void;
  toggleTag: (tag: string) => void;
};

export function useChangelogControls(entries: ChangelogEntry[], entriesPerPage: number): ChangelogControlsState {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelClosing, setIsPanelClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReleaseKinds, setSelectedReleaseKinds] = useState<ChangelogReleaseKindId[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState('1');

  const allTags = useMemo(() => getAllChangelogTags(entries), [entries]);

  const filters = useMemo<ChangelogFilterState>(
    () => ({
      searchQuery,
      selectedReleaseKinds,
      selectedTags,
    }),
    [searchQuery, selectedReleaseKinds, selectedTags],
  );

  const filteredEntries = useMemo(() => filterChangelogEntries(entries, filters), [entries, filters]);
  const totalPages = getChangelogTotalPages(filteredEntries.length, entriesPerPage);
  const effectiveCurrentPage = clampChangelogPage(currentPage, totalPages);
  const visibleEntries = useMemo(() => getChangelogPageEntries(filteredEntries, effectiveCurrentPage, entriesPerPage), [effectiveCurrentPage, entriesPerPage, filteredEntries]);
  const hasActiveFilters = hasActiveChangelogFilters(filters);

  const clearCloseTimer = useCallback((): void => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const openPanel = useCallback((): void => {
    clearCloseTimer();
    setIsPanelClosing(false);
    setIsPanelOpen(true);
  }, [clearCloseTimer]);

  const closePanel = useCallback((): void => {
    if (!isPanelOpen || closeTimerRef.current !== null) {
      return;
    }

    setIsPanelClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsPanelOpen(false);
      setIsPanelClosing(false);
      closeTimerRef.current = null;
    }, CHANGELOG_PANEL_ANIMATION_MS);
  }, [isPanelOpen]);

  const resetPage = (): void => {
    setCurrentPage(1);
    setPageJumpValue('1');
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
    resetPage();
  };

  const clearSearchQuery = (): void => {
    setSearchQuery('');
    resetPage();
  };

  const toggleReleaseKind = (releaseKind: ChangelogReleaseKindId): void => {
    setSelectedReleaseKinds((currentReleaseKinds) =>
      currentReleaseKinds.includes(releaseKind) ? currentReleaseKinds.filter((currentReleaseKind) => currentReleaseKind !== releaseKind) : [...currentReleaseKinds, releaseKind],
    );
    resetPage();
  };

  const toggleTag = (tag: string): void => {
    setSelectedTags((currentTags) => (currentTags.includes(tag) ? currentTags.filter((currentTag) => currentTag !== tag) : [...currentTags, tag]));
    resetPage();
  };

  const clearFilters = (): void => {
    setSearchQuery('');
    setSelectedReleaseKinds([]);
    setSelectedTags([]);
    resetPage();
  };

  const goToPage = (page: number): void => {
    const nextPage = clampChangelogPage(page, totalPages);

    setCurrentPage(nextPage);
    setPageJumpValue(String(nextPage));
  };

  const handlePageJumpChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setPageJumpValue(event.target.value);
  };

  const jumpToPage = (): void => {
    const nextPage = parseChangelogPageJump(pageJumpValue, effectiveCurrentPage, totalPages);

    setCurrentPage(nextPage);
    setPageJumpValue(String(nextPage));
  };

  const handlePageJumpKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      jumpToPage();
    }
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen || isPanelClosing) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

      if (isCommandSearch) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [closePanel, isPanelClosing, isPanelOpen]);

  useEffect(() => {
    if (currentPage !== effectiveCurrentPage) {
      setCurrentPage(effectiveCurrentPage);
    }
  }, [currentPage, effectiveCurrentPage]);

  useEffect(() => {
    setPageJumpValue(String(effectiveCurrentPage));
  }, [effectiveCurrentPage]);

  return {
    allTags,
    currentPage: effectiveCurrentPage,
    entries,
    entriesPerPage,
    filteredEntries,
    hasActiveFilters,
    inputRef,
    isPanelClosing,
    isPanelOpen,
    pageJumpValue,
    searchQuery,
    selectedReleaseKinds,
    selectedTags,
    totalEntries: entries.length,
    totalPages,
    visibleEntries,
    clearFilters,
    clearSearchQuery,
    closePanel,
    goToPage,
    handlePageJumpChange,
    handlePageJumpKeyDown,
    handleSearchInputChange,
    jumpToPage,
    openPanel,
    toggleReleaseKind,
    toggleTag,
  };
}
