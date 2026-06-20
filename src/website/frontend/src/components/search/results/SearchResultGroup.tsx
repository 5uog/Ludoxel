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
    <div className="**:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wider **:[[cmdk-group-heading]]:text-muted-foreground">
      <div cmdk-group-heading="">{sectionMeta.label}</div>

      {rows.map((row) => {
        const resultIndex = filteredRows.findIndex((candidate) => candidate.index === row.index);
        const isSelected = resultIndex === selectedIndex;

        return <SearchResultRow isSelected={isSelected} key={row.entry.href} row={row} sectionMeta={sectionMeta} onMouseEnter={() => onMouseEnter(resultIndex)} onSelect={() => onSelect(row.entry)} />;
      })}
    </div>
  );
}
