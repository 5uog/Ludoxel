/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { searchIndex, type SearchIndexEntry } from '../../../data/docs/search';
import { SEARCH_DIALOG_ANIMATION_MS } from '../lib/searchAnimation';
import { type SearchCommandState, type SearchRow } from '../types/searchCommand.types';
import { filterSearchRows, flattenGroupedSearchRows, groupSearchRows } from '../lib/searchRows';
import { normalizeSearchText } from '../lib/searchSemantics';

export function useSearchCommand(enableShortcut: boolean, entries?: SearchIndexEntry[]): SearchCommandState {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const activeEntries = entries ?? searchIndex;
  const normalizedQuery = normalizeSearchText(query);

  const filteredRows = useMemo<SearchRow[]>(() => filterSearchRows(activeEntries, normalizedQuery), [activeEntries, normalizedQuery]);
  const groupedRows = useMemo(() => groupSearchRows(filteredRows), [filteredRows]);
  const displayRows = useMemo<SearchRow[]>(() => flattenGroupedSearchRows(groupedRows), [groupedRows]);

  const clearCloseTimer = useCallback((): void => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const openSearch = useCallback((): void => {
    clearCloseTimer();
    setIsClosing(false);
    setIsOpen(true);
  }, [clearCloseTimer]);

  const closeSearch = useCallback((): void => {
    if (!isOpen || closeTimerRef.current !== null) {
      return;
    }

    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setQuery('');
      setSelectedIndex(0);
      closeTimerRef.current = null;
    }, SEARCH_DIALOG_ANIMATION_MS);
  }, [isOpen]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!enableShortcut) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

      if (isCommandSearch) {
        event.preventDefault();
        openSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcut, openSearch]);

  useEffect(() => {
    if (!isOpen || isClosing) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch, isClosing, isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [normalizedQuery]);

  useEffect(() => {
    if (selectedIndex >= displayRows.length) {
      setSelectedIndex(Math.max(0, displayRows.length - 1));
    }
  }, [displayRows.length, selectedIndex]);

  const selectEntry = useCallback(
    (entry: SearchIndexEntry): void => {
      closeSearch();
      navigate(entry.href);
    },
    [closeSearch, navigate],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (event.key === 'ArrowDown' && displayRows.length > 0) {
      event.preventDefault();
      setSelectedIndex((currentIndex) => (currentIndex + 1) % displayRows.length);
      return;
    }

    if (event.key === 'ArrowUp' && displayRows.length > 0) {
      event.preventDefault();
      setSelectedIndex((currentIndex) => (currentIndex - 1 + displayRows.length) % displayRows.length);
      return;
    }

    if (event.key === 'Enter' && displayRows[selectedIndex]) {
      event.preventDefault();
      selectEntry(displayRows[selectedIndex].entry);
    }
  };

  return {
    displayRows,
    filteredRows,
    groupedRows,
    inputRef,
    isClosing,
    isOpen,
    normalizedQuery,
    query,
    selectedIndex,
    closeSearch,
    handleInputChange,
    handleInputKeyDown,
    openSearch,
    selectEntry,
    setSelectedIndex,
  };
}
