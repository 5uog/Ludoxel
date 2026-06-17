/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ArrowRight, Clock, FileText, Layers, Search, Settings, Shield, Sparkles, Wrench } from 'lucide-react';
import { type ChangeEvent, type ComponentType, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { searchIndex, type SearchIndexEntry } from '../../data/docs/search';

type SearchCommandProps = {
  variant: 'header' | 'hero' | 'icon';
  placeholder: string;
  enableShortcut?: boolean;
  entries?: SearchIndexEntry[];
};

type SearchSectionMeta = {
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

type SearchRow = {
  entry: SearchIndexEntry;
  index: number;
};

const SECTION_META: Record<string, SearchSectionMeta> = {
  manual: {
    label: 'Manual',
    Icon: FileText,
  },
  gameplay: {
    label: 'Gameplay',
    Icon: Sparkles,
  },
  systems: {
    label: 'Systems',
    Icon: Layers,
  },
  settings: {
    label: 'Settings',
    Icon: Settings,
  },
  data: {
    label: 'Data',
    Icon: FileText,
  },
  distribution: {
    label: 'Distribution',
    Icon: Wrench,
  },
  legal: {
    label: 'Legal',
    Icon: Shield,
  },
  support: {
    label: 'Support',
    Icon: FileText,
  },
  developer: {
    label: 'Developer',
    Icon: Wrench,
  },
  application: {
    label: 'Application',
    Icon: FileText,
  },
  project: {
    label: 'Project',
    Icon: Shield,
  },
  updates: {
    label: 'Updates',
    Icon: Clock,
  },
};

const HEADER_BUTTON_CLASS_NAME =
  'hidden lg:inline-flex search-bar-gradient-border items-center justify-between py-2 pl-6 pr-2.5 w-[309px] min-w-[309px] gap-5 hover:bg-accent/5 transition-colors cursor-pointer';

const HERO_BUTTON_CLASS_NAME =
  'search-bar-gradient-border bg-accent/5 rounded-xl inline-flex items-center justify-between py-4 pl-4 md:pl-8 pr-4 w-full max-w-[600px] gap-3 md:gap-5 hover:bg-accent/10 transition-colors cursor-pointer';

const ICON_BUTTON_CLASS_NAME =
  'flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/50';

const SEARCH_DIALOG_ANIMATION_MS = 200;

function getSectionKey(entry: SearchIndexEntry): string {
  return entry.section.trim().toLowerCase();
}

function getSectionMeta(sectionKey: string): SearchSectionMeta {
  return (
    SECTION_META[sectionKey] ?? {
      label: sectionKey,
      Icon: FileText,
    }
  );
}

export default function SearchCommand({ variant, placeholder, enableShortcut = false, entries }: SearchCommandProps): React.JSX.Element {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const activeEntries = entries ?? searchIndex;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredRows = useMemo<SearchRow[]>(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return activeEntries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => {
        const searchableText = `${entry.title} ${entry.description} ${entry.section}`.toLowerCase();
        return searchableText.includes(normalizedQuery);
      });
  }, [activeEntries, normalizedQuery]);

  const groupedRows = useMemo(() => {
    return filteredRows.reduce<Record<string, SearchRow[]>>((groups, row) => {
      const sectionKey = getSectionKey(row.entry);
      const group = groups[sectionKey] ?? [];
      group.push(row);
      groups[sectionKey] = group;
      return groups;
    }, {});
  }, [filteredRows]);

  const clearCloseTimer = (): void => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openSearch = (): void => {
    clearCloseTimer();
    setIsClosing(false);
    setIsOpen(true);
  };

  const closeSearch = (): void => {
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
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

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
  }, [enableShortcut]);

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
  }, [isOpen, isClosing]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [normalizedQuery]);

  useEffect(() => {
    if (selectedIndex >= filteredRows.length) {
      setSelectedIndex(Math.max(0, filteredRows.length - 1));
    }
  }, [filteredRows.length, selectedIndex]);

  const selectEntry = (entry: SearchIndexEntry): void => {
    closeSearch();
    navigate(entry.href);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (event.key === 'ArrowDown' && filteredRows.length > 0) {
      event.preventDefault();
      setSelectedIndex((currentIndex) => (currentIndex + 1) % filteredRows.length);
      return;
    }

    if (event.key === 'ArrowUp' && filteredRows.length > 0) {
      event.preventDefault();
      setSelectedIndex((currentIndex) => (currentIndex - 1 + filteredRows.length) % filteredRows.length);
      return;
    }

    if (event.key === 'Enter' && filteredRows[selectedIndex]) {
      event.preventDefault();
      selectEntry(filteredRows[selectedIndex].entry);
    }
  };

  const buttonClassName = variant === 'header' ? HEADER_BUTTON_CLASS_NAME : variant === 'hero' ? HERO_BUTTON_CLASS_NAME : ICON_BUTTON_CLASS_NAME;
  const searchDialogBackdropClassName = isClosing
    ? 'search-dialog-backdrop search-dialog-backdrop-exit absolute inset-0 bg-black/60 backdrop-blur-sm'
    : 'search-dialog-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm';
  const searchDialogPanelClassName = isClosing ? 'search-dialog-panel search-dialog-panel-exit relative z-10 w-full max-w-[600px] mx-4' : 'search-dialog-panel relative z-10 w-full max-w-[600px] mx-4';

  const searchDialog = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 md:pt-32" role="dialog" aria-modal="true" aria-label="Search documentation">
      <button className={searchDialogBackdropClassName} type="button" aria-label="Close search" onClick={closeSearch} />

      <div className={searchDialogPanelClassName}>
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center border-b border-border px-4">
            <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />

            <input
              ref={inputRef}
              autoFocus
              className="flex h-14 w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="Search documentation..."
              value={query}
            />

            <kbd className="ml-2 hidden h-6 items-center justify-center rounded bg-secondary px-2 text-xs font-medium text-muted-foreground sm:flex">ESC</kbd>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-none">
            {normalizedQuery.length >= 2 && filteredRows.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No results found for &quot;{normalizedQuery}&quot;</p>
              </div>
            ) : null}

            {normalizedQuery.length < 2 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">Type at least 2 characters to search...</p>
              </div>
            ) : null}

            {(Object.entries(groupedRows) as [string, SearchRow[]][]).map(([sectionKey, rows]) => {
              const sectionMeta = getSectionMeta(sectionKey);
              const Icon = sectionMeta.Icon;

              return (
                <div
                  className="[&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
                  key={sectionKey}
                >
                  <div cmdk-group-heading="">{sectionMeta.label}</div>

                  {rows.map((row) => {
                    const resultIndex = filteredRows.findIndex((candidate) => candidate.index === row.index);
                    const isSelected = resultIndex === selectedIndex;

                    return (
                      <button
                        className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left data-[selected=true]:bg-accent"
                        data-selected={isSelected ? 'true' : 'false'}
                        key={row.entry.href}
                        type="button"
                        onClick={() => selectEntry(row.entry)}
                        onMouseEnter={() => setSelectedIndex(resultIndex)}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground group-data-[selected=true]:bg-primary/10 group-data-[selected=true]:text-primary">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{row.entry.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{row.entry.description}</p>
                        </div>

                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {filteredRows.length > 0 ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
              <span>
                {filteredRows.length} result
                {filteredRows.length !== 1 ? 's' : ''}
              </span>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">↵</kbd>
                  select
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className={buttonClassName} type="button" aria-label={variant === 'icon' ? 'Search' : undefined} onClick={openSearch}>
        {variant === 'icon' ? (
          <Search className="h-5 w-5" />
        ) : (
          <>
            <div className="flex flex-1 items-center gap-3">
              <Search className={variant === 'hero' ? 'h-5 w-5 shrink-0 text-muted-foreground' : 'h-4 w-4 shrink-0 text-muted-foreground'} />
              <span className={variant === 'hero' ? 'text-base text-muted-foreground' : 'text-sm text-muted-foreground'}>{placeholder}</span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <kbd
                className={
                  variant === 'hero'
                    ? 'flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-muted-foreground backdrop-blur-sm'
                    : 'flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground'
                }
              >
                ⌘
              </kbd>
              <kbd
                className={
                  variant === 'hero'
                    ? 'flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-muted-foreground backdrop-blur-sm'
                    : 'flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground'
                }
              >
                K
              </kbd>
            </div>
          </>
        )}
      </button>

      {searchDialog === null ? null : createPortal(searchDialog, document.body)}
    </>
  );
}
