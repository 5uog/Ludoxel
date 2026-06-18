/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Search } from 'lucide-react';

import { type SearchCommandVariant } from '../logic/searchCommand.types';
import { getSearchTriggerClassName } from '../logic/searchClassNames';
import SearchShortcutHint from './SearchShortcutHint';

type SearchTriggerProps = {
  placeholder: string;
  variant: SearchCommandVariant;
  onOpen: () => void;
};

export default function SearchTrigger({ placeholder, variant, onOpen }: SearchTriggerProps): React.JSX.Element {
  return (
    <button className={getSearchTriggerClassName(variant)} type="button" aria-label={variant === 'icon' ? 'Search' : undefined} onClick={onOpen}>
      {variant === 'icon' ? (
        <Search className="h-5 w-5" />
      ) : (
        <>
          <div className="flex flex-1 items-center gap-3">
            <Search className={variant === 'hero' ? 'h-5 w-5 shrink-0 text-muted-foreground' : 'h-4 w-4 shrink-0 text-muted-foreground'} />
            <span className={variant === 'hero' ? 'text-base text-muted-foreground' : 'text-sm text-muted-foreground'}>{placeholder}</span>
          </div>

          <SearchShortcutHint variant={variant} />
        </>
      )}
    </button>
  );
}
