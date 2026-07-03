/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import AnimatedText from '../components/animation/AnimatedText';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import { changelogEntries, type ChangelogEntry } from '../data/changelog';

type ChangelogInlinePart = string | React.JSX.Element;
type ReleaseKindFilterId = 'release' | 'beta' | 'hotfix';

type ReleaseKindFilter = {
  id: ReleaseKindFilterId;
  label: string;
};

const ENTRIES_PER_PAGE = 6;
const CHANGELOG_INLINE_CODE_CLASS_NAME =
  'inline max-w-full whitespace-normal break-words rounded border border-border bg-secondary px-1.5 py-0.5 align-baseline font-mono text-[0.92em] text-foreground [overflow-wrap:anywhere]';

const RELEASE_KIND_FILTERS: ReleaseKindFilter[] = [
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

function isEscaped(text: string, index: number): boolean {
  let backslashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
    backslashCount += 1;
  }

  return backslashCount % 2 === 1;
}

function findClosingBacktick(text: string, fromIndex: number): number {
  let cursor = fromIndex;

  while (cursor < text.length) {
    const nextIndex = text.indexOf('`', cursor);

    if (nextIndex === -1) {
      return -1;
    }

    if (!isEscaped(text, nextIndex)) {
      return nextIndex;
    }

    cursor = nextIndex + 1;
  }

  return -1;
}

function unescapeBackticks(text: string): string {
  return text.replace(/\\`/g, '`');
}

function pushTextPart(parts: ChangelogInlinePart[], text: string): void {
  if (text.length > 0) {
    parts.push(unescapeBackticks(text));
  }
}

function renderChangelogItemText(text: string): ChangelogInlinePart[] {
  const parts: ChangelogInlinePart[] = [];
  let cursor = 0;
  let plainStart = 0;

  while (cursor < text.length) {
    if (text[cursor] === '`' && !isEscaped(text, cursor)) {
      const codeEnd = findClosingBacktick(text, cursor + 1);

      if (codeEnd !== -1) {
        pushTextPart(parts, text.slice(plainStart, cursor));
        parts.push(
          <code className={CHANGELOG_INLINE_CODE_CLASS_NAME} key={`code-${cursor}-${codeEnd}`}>
            {unescapeBackticks(text.slice(cursor + 1, codeEnd))}
          </code>,
        );
        cursor = codeEnd + 1;
        plainStart = cursor;
        continue;
      }
    }

    cursor += 1;
  }

  pushTextPart(parts, text.slice(plainStart));
  return parts;
}

function entryIncludesHotfix(entry: ChangelogEntry): boolean {
  return /\bhotfix\b/i.test(entry.date);
}

function entryIncludesBeta(entry: ChangelogEntry): boolean {
  return /\bbeta\b/i.test(entry.date);
}

function entryMatchesReleaseKind(entry: ChangelogEntry, releaseKind: ReleaseKindFilterId): boolean {
  if (releaseKind === 'hotfix') {
    return entryIncludesHotfix(entry);
  }

  if (releaseKind === 'beta') {
    return entryIncludesBeta(entry);
  }

  return !entryIncludesHotfix(entry) && !entryIncludesBeta(entry);
}

function entryMatchesReleaseKinds(entry: ChangelogEntry, selectedReleaseKinds: ReleaseKindFilterId[]): boolean {
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

function getChangelogSearchText(entry: ChangelogEntry): string {
  return [entry.date, ...entry.tags, ...entry.sections.flatMap((section) => [section.title, ...section.items])].join('\n').toLowerCase();
}

function entryMatchesSearch(entry: ChangelogEntry, searchQuery: string): boolean {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (normalizedSearchQuery.length === 0) {
    return true;
  }

  return getChangelogSearchText(entry).includes(normalizedSearchQuery);
}

function getReleaseKindCount(releaseKind: ReleaseKindFilterId): number {
  return changelogEntries.filter((entry) => entryMatchesReleaseKind(entry, releaseKind)).length;
}

function getTagCount(tag: string): number {
  return changelogEntries.filter((entry) => entry.tags.includes(tag)).length;
}

function getPageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));

  return Array.from({ length: 5 }, (_, index) => firstPage + index);
}

function getFilterButtonClassName(isActive: boolean): string {
  if (isActive) {
    return 'rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors';
  }

  return 'rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground';
}

function getPaginationButtonClassName(isActive: boolean): string {
  if (isActive) {
    return 'flex h-9 min-w-9 items-center justify-center rounded-full border border-primary bg-primary px-3 text-sm font-semibold text-primary-foreground';
  }

  return 'flex h-9 min-w-9 items-center justify-center rounded-full border border-border bg-background px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground';
}

function formatResultSummary(filteredCount: number, totalCount: number): string {
  if (filteredCount === totalCount) {
    return `${totalCount} entries`;
  }

  return `${filteredCount} of ${totalCount} entries`;
}

export default function ChangelogPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReleaseKinds, setSelectedReleaseKinds] = useState<ReleaseKindFilterId[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const allTags = useMemo(() => [...new Set(changelogEntries.flatMap((entry) => entry.tags))].sort((firstTag, secondTag) => firstTag.localeCompare(secondTag)), []);

  const filteredEntries = useMemo(
    () => changelogEntries.filter((entry) => entryMatchesReleaseKinds(entry, selectedReleaseKinds) && entryMatchesTags(entry, selectedTags) && entryMatchesSearch(entry, searchQuery)),
    [searchQuery, selectedReleaseKinds, selectedTags],
  );

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE));
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const firstVisibleEntryIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const visibleEntries = filteredEntries.slice(firstVisibleEntryIndex, firstVisibleEntryIndex + ENTRIES_PER_PAGE);
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedReleaseKinds.length > 0 || selectedTags.length > 0;

  const setSearchQueryAndResetPage = (nextSearchQuery: string): void => {
    setSearchQuery(nextSearchQuery);
    setCurrentPage(1);
  };

  const toggleReleaseKind = (releaseKind: ReleaseKindFilterId): void => {
    setSelectedReleaseKinds((currentReleaseKinds) =>
      currentReleaseKinds.includes(releaseKind) ? currentReleaseKinds.filter((currentReleaseKind) => currentReleaseKind !== releaseKind) : [...currentReleaseKinds, releaseKind],
    );
    setCurrentPage(1);
  };

  const toggleTag = (tag: string): void => {
    setSelectedTags((currentTags) => (currentTags.includes(tag) ? currentTags.filter((currentTag) => currentTag !== tag) : [...currentTags, tag]));
    setCurrentPage(1);
  };

  const clearFilters = (): void => {
    setSearchQuery('');
    setSelectedReleaseKinds([]);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const goToPage = (page: number): void => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <Header activePath="/changelog" />

      <main className="flex-1 pb-16 pt-24">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-12">
            <div className="page-reveal mb-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                <AnimatedText text="Changelog" />
              </h1>
            </div>

            <p className="page-reveal page-reveal-delay-2 mb-4 text-xl font-medium text-primary">Ludoxel desktop application release notes</p>

            <p className="page-reveal page-reveal-delay-3 max-w-2xl text-muted-foreground">
              Track user-visible changes to the Ludoxel desktop application without treating local build artifacts as release authority.
            </p>
          </div>

          <section aria-label="Changelog filters" className="page-reveal page-reveal-delay-2 mb-10 rounded-2xl border border-border bg-card/50 p-4 shadow-sm md:p-5">
            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="changelog-search">
                  Search
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    id="changelog-search"
                    placeholder="Search versions, tags, section titles, and release text..."
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQueryAndResetPage(event.target.value)}
                  />
                  {searchQuery.length > 0 ? (
                    <button
                      aria-label="Clear changelog search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      type="button"
                      onClick={() => setSearchQueryAndResetPage('')}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-foreground">Release type</h2>
                <div className="flex flex-wrap gap-2">
                  {RELEASE_KIND_FILTERS.map((releaseKind) => {
                    const isActive = selectedReleaseKinds.includes(releaseKind.id);

                    return (
                      <button aria-pressed={isActive} className={getFilterButtonClassName(isActive)} key={releaseKind.id} type="button" onClick={() => toggleReleaseKind(releaseKind.id)}>
                        {releaseKind.label}
                        <span className="ml-1 opacity-70">{getReleaseKindCount(releaseKind.id)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-foreground">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const isActive = selectedTags.includes(tag);

                    return (
                      <button aria-pressed={isActive} className={getFilterButtonClassName(isActive)} key={tag} type="button" onClick={() => toggleTag(tag)}>
                        {tag}
                        <span className="ml-1 opacity-70">{getTagCount(tag)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>{formatResultSummary(filteredEntries.length, changelogEntries.length)}</span>

                {hasActiveFilters ? (
                  <button
                    className="inline-flex items-center gap-2 self-start rounded-full border border-border px-3 py-1.5 font-semibold transition-colors hover:border-foreground/40 hover:text-foreground sm:self-auto"
                    type="button"
                    onClick={clearFilters}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          {visibleEntries.length > 0 ? (
            <div className="space-y-12">
              {visibleEntries.map((entry, entryIndex) => (
                <div className={`page-reveal page-reveal-delay-${Math.min(entryIndex + 1, 4)} flex flex-col gap-6 md:flex-row md:gap-12`} key={entry.date}>
                  <div className="shrink-0 md:sticky md:top-24 md:w-48 md:self-start">
                    <div className="flex flex-col gap-3">
                      <span className="text-sm font-medium text-muted-foreground">{entry.date}</span>

                      <div className="flex flex-row flex-wrap gap-2 md:flex-col">
                        {entry.tags.map((tag) => (
                          <span className="changelog-badge" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 border-b border-border pb-12 last:border-b-0">
                    <div className="space-y-6">
                      {entry.sections.map((section) => (
                        <div className="space-y-3" key={section.title}>
                          <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>

                          <ul className="space-y-2">
                            {section.items.map((item) => (
                              <li className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground" key={item}>
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current text-primary" />
                                <span className="min-w-0">{renderChangelogItemText(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="page-reveal page-reveal-delay-2 rounded-2xl border border-border bg-card/50 p-8 text-center">
              <h2 className="mb-2 text-lg font-semibold text-foreground">No matching changelog entries</h2>
              <p className="text-sm text-muted-foreground">The current search and filter set selects no release record.</p>
            </div>
          )}

          {filteredEntries.length > ENTRIES_PER_PAGE ? (
            <nav aria-label="Changelog pagination" className="page-reveal page-reveal-delay-3 mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  disabled={currentPage === 1}
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                >
                  Previous
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                    className={getPaginationButtonClassName(pageNumber === currentPage)}
                    key={pageNumber}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  className="rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  disabled={currentPage === totalPages}
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </nav>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
