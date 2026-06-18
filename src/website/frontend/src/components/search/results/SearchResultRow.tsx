/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ArrowRight } from 'lucide-react';

import { type SearchIndexEntry } from '../../../data/docs/search';
import { type SearchSectionMeta } from '../logic/searchCommand.types';

type SearchResultRowProps = {
  entry: SearchIndexEntry;
  isSelected: boolean;
  sectionMeta: SearchSectionMeta;
  onMouseEnter: () => void;
  onSelect: () => void;
};

export default function SearchResultRow({ entry, isSelected, sectionMeta, onMouseEnter, onSelect }: SearchResultRowProps): React.JSX.Element {
  const Icon = sectionMeta.Icon;

  return (
    <button
      className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left data-[selected=true]:bg-accent"
      data-selected={isSelected ? 'true' : 'false'}
      type="button"
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground group-data-[selected=true]:bg-primary/10 group-data-[selected=true]:text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
        <p className="truncate text-xs text-muted-foreground">{entry.description}</p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
    </button>
  );
}
