/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Command } from 'lucide-react';

import { type SearchCommandVariant } from '../logic/searchCommand.types';

type SearchShortcutHintProps = {
  variant: SearchCommandVariant;
};

function getKeyClassName(variant: SearchCommandVariant): string {
  return variant === 'hero'
    ? 'flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-muted-foreground backdrop-blur-sm'
    : 'flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground';
}

export default function SearchShortcutHint({ variant }: SearchShortcutHintProps): React.JSX.Element {
  const keyClassName = getKeyClassName(variant);

  return (
    <div className="flex shrink-0 items-center gap-1">
      <kbd className={keyClassName} aria-label="Command">
        <Command className="h-3.5 w-3.5" aria-hidden="true" />
      </kbd>
      <kbd className={keyClassName}>K</kbd>
    </div>
  );
}
