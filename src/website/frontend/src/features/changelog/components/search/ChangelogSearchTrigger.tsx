/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Search } from 'lucide-react';

type ChangelogSearchTriggerProps = {
  onOpen: () => void;
};

export default function ChangelogSearchTrigger({ onOpen }: ChangelogSearchTriggerProps): React.JSX.Element {
  return (
    <button aria-haspopup="dialog" className="search-bar-gradient-border inline-flex w-full max-w-150 cursor-pointer items-center justify-between gap-3 bg-accent/5 py-4 pl-4 pr-4 transition-colors hover:bg-accent/10 md:gap-5 md:pl-8" type="button" onClick={onOpen}>
      <span className="flex flex-1 items-center gap-3">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="text-left text-base text-muted-foreground">Search and filter changelog</span>
      </span>
    </button>
  );
}
