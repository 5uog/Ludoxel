/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Search } from 'lucide-react';

import { getSearchDialogPanelClassName } from '../logic/searchClassNames';
import { type SearchCommandState, type SearchRow } from '../logic/searchCommand.types';
import SearchResultGroup from '../results/SearchResultGroup';
import SearchDialogOverlay from './SearchDialogOverlay';

type SearchDialogProps = Pick<
  SearchCommandState,
  | 'closeSearch'
  | 'filteredRows'
  | 'groupedRows'
  | 'handleInputChange'
  | 'handleInputKeyDown'
  | 'inputRef'
  | 'isClosing'
  | 'normalizedQuery'
  | 'query'
  | 'selectEntry'
  | 'selectedIndex'
  | 'setSelectedIndex'
>;

export default function SearchDialog({
  closeSearch,
  filteredRows,
  groupedRows,
  handleInputChange,
  handleInputKeyDown,
  inputRef,
  isClosing,
  normalizedQuery,
  query,
  selectEntry,
  selectedIndex,
  setSelectedIndex,
}: SearchDialogProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 md:pt-32" role="dialog" aria-modal="true" aria-label="Search documentation">
      <SearchDialogOverlay isClosing={isClosing} onClose={closeSearch} />

      <div className={getSearchDialogPanelClassName(isClosing)}>
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

            {(Object.entries(groupedRows) as [string, SearchRow[]][]).map(([sectionKey, rows]) => (
              <SearchResultGroup
                filteredRows={filteredRows}
                key={sectionKey}
                rows={rows}
                sectionKey={sectionKey}
                selectedIndex={selectedIndex}
                onMouseEnter={setSelectedIndex}
                onSelect={selectEntry}
              />
            ))}
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
  );
}
