/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import { heroShortcuts } from '../../../data/home';

export default function HeroShortcutList(): React.JSX.Element {
  return (
    <div className="page-reveal page-reveal-delay-3 flex flex-wrap items-center justify-center gap-3 mt-8">
      <span className="text-sm text-muted-foreground">Search shortcuts:</span>
      {heroShortcuts.map((shortcut) => (
        <Link className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground border border-border rounded-xl transition-colors hover:text-foreground hover:border-muted-foreground/50" key={shortcut.href} to={shortcut.href}>
          {shortcut.label}
        </Link>
      ))}
    </div>
  );
}
