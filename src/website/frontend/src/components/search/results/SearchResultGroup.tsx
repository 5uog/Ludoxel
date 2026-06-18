/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type SearchIndexEntry } from '../../../data/docs/search';
import { type SearchRow } from '../logic/searchCommand.types';
import { getSectionMeta } from '../logic/searchSections';
import SearchResultRow from './SearchResultRow';

type SearchResultGroupProps = {
  filteredRows: SearchRow[];
  rows: SearchRow[];
  sectionKey: string;
  selectedIndex: number;
  onMouseEnter: (index: number) => void;
  onSelect: (entry: SearchIndexEntry) => void;
};

export default function SearchResultGroup({ filteredRows, rows, sectionKey, selectedIndex, onMouseEnter, onSelect }: SearchResultGroupProps): React.JSX.Element {
  const sectionMeta = getSectionMeta(sectionKey);

  return (
    <div className="[&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
      <div cmdk-group-heading="">{sectionMeta.label}</div>

      {rows.map((row) => {
        const resultIndex = filteredRows.findIndex((candidate) => candidate.index === row.index);
        const isSelected = resultIndex === selectedIndex;

        return (
          <SearchResultRow
            entry={row.entry}
            isSelected={isSelected}
            key={row.entry.href}
            sectionMeta={sectionMeta}
            onMouseEnter={() => onMouseEnter(resultIndex)}
            onSelect={() => onSelect(row.entry)}
          />
        );
      })}
    </div>
  );
}
