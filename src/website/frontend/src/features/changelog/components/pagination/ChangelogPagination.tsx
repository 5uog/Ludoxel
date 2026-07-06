/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getChangelogPageNumberButtonClassName, getChangelogPaginationActionButtonClassName } from '../../lib/changelogClassNames';
import { getChangelogPaginationItems } from '../../lib/changelogPagination';

type ChangelogPaginationProps = {
  currentPage: number;
  pageJumpValue: string;
  totalPages: number;
  goToPage: (page: number) => void;
  handlePageJumpChange: React.ChangeEventHandler<HTMLInputElement>;
  handlePageJumpKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  jumpToPage: () => void;
};

export default function ChangelogPagination({
  currentPage,
  pageJumpValue,
  totalPages,
  goToPage,
  handlePageJumpChange,
  handlePageJumpKeyDown,
  jumpToPage,
}: ChangelogPaginationProps): React.JSX.Element | null {
  if (totalPages <= 1) {
    return null;
  }

  const paginationItems = getChangelogPaginationItems(currentPage, totalPages);
  const actionButtonClassName = getChangelogPaginationActionButtonClassName();

  return (
    <nav aria-label="Changelog pagination" className="page-reveal page-reveal-delay-3 mt-12 border-t border-border pt-6">
      <span className="sr-only">
        Page {currentPage} of {totalPages}
      </span>

      <div className="flex w-full flex-wrap items-center justify-between gap-x-12 gap-y-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2" aria-label="Pagination pages">
          <button className={actionButtonClassName} disabled={currentPage === 1} type="button" onClick={() => goToPage(currentPage - 1)}>
            &lt; Back
          </button>

          {paginationItems.map((item) => {
            if (item.kind === 'ellipsis') {
              return (
                <span className="inline-flex h-9 min-w-8 shrink-0 items-center justify-center px-1 text-sm font-semibold text-muted-foreground" key={item.key}>
                  ...
                </span>
              );
            }

            return (
              <button
                aria-current={item.page === currentPage ? 'page' : undefined}
                className={getChangelogPageNumberButtonClassName(item.page === currentPage)}
                key={item.page}
                type="button"
                onClick={() => goToPage(item.page)}
              >
                {item.page}
              </button>
            );
          })}

          <button className={actionButtonClassName} disabled={currentPage === totalPages} type="button" onClick={() => goToPage(currentPage + 1)}>
            Next &gt;
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2" aria-label="Jump to changelog page">
          <label className="text-sm font-semibold text-muted-foreground" htmlFor="changelog-page-jump-input">
            Page
          </label>

          <input
            className="h-9 w-16 rounded-lg border border-border bg-background px-2.5 text-sm font-semibold text-foreground outline-none transition-colors [appearance:textfield] placeholder:text-muted-foreground focus:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            id="changelog-page-jump-input"
            inputMode="numeric"
            max={totalPages}
            min={1}
            type="number"
            value={pageJumpValue}
            onChange={handlePageJumpChange}
            onKeyDown={handlePageJumpKeyDown}
          />

          <button className={actionButtonClassName} type="button" onClick={jumpToPage}>
            Go
          </button>
        </div>
      </div>
    </nav>
  );
}
