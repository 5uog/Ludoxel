/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Search, X } from 'lucide-react';

import { getChangelogFilterButtonClassName } from '../../lib/changelogClassNames';
import { CHANGELOG_RELEASE_KIND_FILTERS, countChangelogEntriesByReleaseKind, countChangelogEntriesByTag, formatChangelogEntryCount } from '../../lib/changelogFilters';
import { type ChangelogControlsState } from '../../hooks/useChangelogControls';
import ChangelogSearchOverlay from './ChangelogSearchOverlay';

const CHANGELOG_SEARCH_INPUT_ID = 'changelog-search-panel-input';

type ChangelogSearchPanelProps = {
  controls: ChangelogControlsState;
};

function getPanelClassName(isClosing: boolean): string {
  const baseClassName = 'search-dialog-panel relative z-10 mx-auto flex w-full max-w-3xl flex-col rounded-xl border border-border bg-background shadow-2xl';
  const heightClassName = 'max-h-[calc(100dvh-2rem)] md:max-h-[calc(100dvh-6rem)]';

  return isClosing ? `${baseClassName} ${heightClassName} search-dialog-panel-exit` : `${baseClassName} ${heightClassName}`;
}

function getPanelStateText(controls: ChangelogControlsState): string {
  if (controls.filteredEntries.length === 0) {
    return 'No changelog entry matches the current search and filter state.';
  }

  if (controls.hasActiveFilters) {
    return 'The changelog page is showing the filtered entry set.';
  }

  return 'No search or filter condition is active.';
}

export default function ChangelogSearchPanel({ controls }: ChangelogSearchPanelProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain px-3 py-4 md:py-12" role="dialog" aria-modal="true" aria-label="Search and filter changelog">
      <ChangelogSearchOverlay isClosing={controls.isPanelClosing} onClose={controls.closePanel} />

      <div className={getPanelClassName(controls.isPanelClosing)}>
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

          <input
            ref={controls.inputRef}
            aria-describedby="changelog-search-panel-status"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            id={CHANGELOG_SEARCH_INPUT_ID}
            placeholder="Search versions, tags, section titles, and release text..."
            type="search"
            value={controls.searchQuery}
            onChange={controls.handleSearchInputChange}
          />

          {controls.searchQuery.length > 0 ? (
            <button
              aria-label="Clear changelog search"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              type="button"
              onClick={controls.clearSearchQuery}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          <button
            aria-label="Close changelog search and filters"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            type="button"
            onClick={controls.closePanel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-5">
          <div className="grid gap-5">
            <section aria-labelledby="changelog-release-kind-filter-heading">
              <h2 className="mb-2 text-sm font-semibold text-foreground" id="changelog-release-kind-filter-heading">
                Release type
              </h2>

              <div className="flex flex-wrap gap-2">
                {CHANGELOG_RELEASE_KIND_FILTERS.map((releaseKind) => {
                  const isActive = controls.selectedReleaseKinds.includes(releaseKind.id);

                  return (
                    <button
                      aria-pressed={isActive}
                      className={getChangelogFilterButtonClassName(isActive)}
                      key={releaseKind.id}
                      type="button"
                      onClick={() => controls.toggleReleaseKind(releaseKind.id)}
                    >
                      {releaseKind.label}
                      <span className="ml-1 opacity-70">{countChangelogEntriesByReleaseKind(controls.entries, releaseKind.id)}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="changelog-tag-filter-heading">
              <h2 className="mb-2 text-sm font-semibold text-foreground" id="changelog-tag-filter-heading">
                Tags
              </h2>

              <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-52">
                {controls.allTags.map((tag) => {
                  const isActive = controls.selectedTags.includes(tag);

                  return (
                    <button aria-pressed={isActive} className={getChangelogFilterButtonClassName(isActive)} key={tag} type="button" onClick={() => controls.toggleTag(tag)}>
                      {tag}
                      <span className="ml-1 opacity-70">{countChangelogEntriesByTag(controls.entries, tag)}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card/50 p-4" aria-labelledby="changelog-filter-state-heading">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground" id="changelog-filter-state-heading">
                    {formatChangelogEntryCount(controls.filteredEntries.length, controls.totalEntries)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground" id="changelog-search-panel-status">
                    {getPanelStateText(controls)}
                  </p>
                </div>

                {controls.hasActiveFilters ? (
                  <button
                    className="inline-flex items-center gap-2 self-start rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
                    type="button"
                    onClick={controls.clearFilters}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                  </button>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
