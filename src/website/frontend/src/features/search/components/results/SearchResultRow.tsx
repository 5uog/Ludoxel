/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

import { type SearchRow, type SearchSectionMeta } from '../../types/searchCommand.types';
import { getSearchRowDomId } from '../../lib/searchRows';

type SearchResultRowProps = {
  row: SearchRow;
  isSelected: boolean;
  sectionMeta: SearchSectionMeta;
  onMouseEnter: () => void;
  onSelect: () => void;
};

function getQualityLabel(row: SearchRow): string {
  if (row.quality === 'direct') {
    return 'Direct';
  }

  if (row.quality === 'semantic') {
    return 'Semantic';
  }

  return 'Recommended';
}

function getQualityClassName(row: SearchRow): string {
  const baseClassName = 'rounded-full px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide transition-colors group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground';

  if (row.quality === 'direct') {
    return `${baseClassName} bg-primary/10 text-primary`;
  }

  if (row.quality === 'semantic') {
    return `${baseClassName} bg-secondary text-muted-foreground`;
  }

  return `${baseClassName} border border-border text-muted-foreground group-data-[selected=true]:border-primary`;
}

export default function SearchResultRow({ row, isSelected, sectionMeta, onMouseEnter, onSelect }: SearchResultRowProps): React.JSX.Element {
  const rowRef = useRef<HTMLButtonElement | null>(null);
  const Icon = sectionMeta.Icon;
  const entry = row.entry;
  const excerpt = row.excerpt.trim();
  const shouldShowExcerpt = excerpt.length > 0 && excerpt !== entry.description.trim();
  const visibleTerms = row.matchedTerms.slice(0, 3);

  useEffect(() => {
    if (!isSelected) {
      return;
    }

    rowRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [isSelected]);

  return (
    <button
      ref={rowRef}
      id={getSearchRowDomId(row)}
      aria-selected={isSelected}
      className="group flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left outline-none transition-colors data-[selected=true]:bg-accent"
      data-selected={isSelected ? 'true' : 'false'}
      role="option"
      tabIndex={-1}
      type="button"
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors group-data-[selected=true]:bg-primary/10 group-data-[selected=true]:text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
          <span className={getQualityClassName(row)}>{getQualityLabel(row)}</span>
        </div>

        <p className="mt-0.5 truncate text-xs text-muted-foreground transition-colors group-data-[selected=true]:text-foreground">{entry.description}</p>

        {shouldShowExcerpt ? <p className="mt-1 truncate text-xs text-muted-foreground transition-colors group-data-[selected=true]:text-foreground">{excerpt}</p> : null}

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="truncate text-[0.6875rem] text-muted-foreground transition-colors group-data-[selected=true]:text-foreground">{row.reason}</span>

          {visibleTerms.map((term) => (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.625rem] text-muted-foreground transition-colors group-data-[selected=true]:bg-background/80 group-data-[selected=true]:text-foreground" key={term}>
              {term}
            </span>
          ))}
        </div>
      </div>

      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
    </button>
  );
}
