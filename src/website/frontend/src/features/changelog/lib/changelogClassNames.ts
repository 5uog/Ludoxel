/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const CHANGELOG_FILTER_BUTTON_CLASS_NAME =
  'rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const CHANGELOG_FILTER_BUTTON_ACTIVE_CLASS_NAME = 'rounded-lg border border-primary bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const CHANGELOG_PAGE_NUMBER_BUTTON_CLASS_NAME =
  'inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const CHANGELOG_PAGE_NUMBER_BUTTON_ACTIVE_CLASS_NAME =
  'inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-primary bg-secondary px-3 text-sm font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const CHANGELOG_PAGINATION_ACTION_BUTTON_CLASS_NAME =
  'inline-flex h-9 shrink-0 items-center justify-center border-0 bg-transparent px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-35';

export function getChangelogFilterButtonClassName(isActive: boolean): string {
  return isActive ? CHANGELOG_FILTER_BUTTON_ACTIVE_CLASS_NAME : CHANGELOG_FILTER_BUTTON_CLASS_NAME;
}

export function getChangelogPageNumberButtonClassName(isActive: boolean): string {
  return isActive ? CHANGELOG_PAGE_NUMBER_BUTTON_ACTIVE_CLASS_NAME : CHANGELOG_PAGE_NUMBER_BUTTON_CLASS_NAME;
}

export function getChangelogPaginationActionButtonClassName(): string {
  return CHANGELOG_PAGINATION_ACTION_BUTTON_CLASS_NAME;
}
