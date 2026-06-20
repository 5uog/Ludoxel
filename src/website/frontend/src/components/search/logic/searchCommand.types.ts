/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type ChangeEvent, type ComponentType, type KeyboardEvent, type RefObject } from 'react';

import { type SearchIndexEntry } from '../../../data/docs/search';

export type SearchCommandVariant = 'header' | 'hero' | 'icon';

export type SearchCommandProps = {
  variant: SearchCommandVariant;
  placeholder: string;
  enableShortcut?: boolean;
  entries?: SearchIndexEntry[];
};

export type SearchSectionMeta = {
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

export type SearchMatchQuality = 'direct' | 'semantic' | 'recommended';

export type SearchRow = {
  entry: SearchIndexEntry;
  index: number;
  score: number;
  quality: SearchMatchQuality;
  reason: string;
  excerpt: string;
  matchedTerms: string[];
};

export type GroupedSearchRows = Record<string, SearchRow[]>;

export type SearchCommandState = {
  displayRows: SearchRow[];
  filteredRows: SearchRow[];
  groupedRows: GroupedSearchRows;
  inputRef: RefObject<HTMLInputElement | null>;
  isClosing: boolean;
  isOpen: boolean;
  normalizedQuery: string;
  query: string;
  selectedIndex: number;
  closeSearch: () => void;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  openSearch: () => void;
  selectEntry: (entry: SearchIndexEntry) => void;
  setSelectedIndex: (index: number) => void;
};
