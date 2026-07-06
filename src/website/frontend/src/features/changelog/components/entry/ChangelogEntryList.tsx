/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type ChangelogEntry } from '../../../../data/changelog';
import ChangelogEntryCard from './ChangelogEntryCard';

type ChangelogEntryListProps = {
  entries: ChangelogEntry[];
};

export default function ChangelogEntryList({ entries }: ChangelogEntryListProps): React.JSX.Element {
  if (entries.length === 0) {
    return (
      <div className="page-reveal page-reveal-delay-2 rounded-2xl border border-border bg-card/50 p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold text-foreground">No matching changelog entries</h2>
        <p className="text-sm text-muted-foreground">The current search and filter set selects no release record.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {entries.map((entry, entryIndex) => (
        <ChangelogEntryCard entry={entry} key={entry.date} revealDelay={Math.min(entryIndex + 1, 4)} />
      ))}
    </div>
  );
}
