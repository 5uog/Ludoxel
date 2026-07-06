/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { copyTextToClipboard, createDocsSectionPermalink } from '../../lib/docsSectionPermalink';

type DocsSectionHeadingProps = {
  sectionId: string;
  title: string;
};

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_RESET_DELAY_MS = 1200;

function getCopyButtonLabel(copyState: CopyState, title: string): string {
  if (copyState === 'copied') {
    return `Copied link to ${title}`;
  }

  if (copyState === 'failed') {
    return `Could not copy link to ${title}`;
  }

  return `Copy link to ${title}`;
}

export default function DocsSectionHeading({ sectionId, title }: DocsSectionHeadingProps): React.JSX.Element {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const label = getCopyButtonLabel(copyState, title);

  useEffect(() => {
    if (copyState === 'idle') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle');
    }, COPY_FEEDBACK_RESET_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyState]);

  async function handleCopySectionLink(): Promise<void> {
    try {
      await copyTextToClipboard(createDocsSectionPermalink(sectionId));
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  return (
    <div className="group/header relative">
      <button
        aria-label={label}
        className="absolute -left-10 top-1 flex items-center border-0 bg-transparent p-0 opacity-0 transition-opacity duration-150 group-hover/header:opacity-100 focus:opacity-100 focus:outline-0 group/link"
        onClick={handleCopySectionLink}
        title={label}
        type="button"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-card text-muted-foreground shadow-sm brightness-[1.35] ring-1 ring-border/80 transition-[filter,box-shadow,color,border-color] duration-150 hover:text-foreground hover:brightness-150 hover:ring-muted-foreground/60 group-focus/link:border-2 group-focus/link:border-primary">
          <Link2 className="h-3 w-3" aria-hidden="true" />
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {copyState === 'copied' ? `Copied link to ${title}.` : null}
        {copyState === 'failed' ? `Could not copy link to ${title}.` : null}
      </span>

      <h2 className="mb-4 text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}
