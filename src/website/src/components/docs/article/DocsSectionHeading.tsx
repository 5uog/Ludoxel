/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useEffect, useState } from 'react';

import { copyTextToClipboard, createDocsSectionPermalink } from '../logic/docsSectionPermalink';

type DocsSectionHeadingProps = {
  sectionId: string;
  title: string;
};

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_RESET_DELAY_MS = 1200;

function DocsSectionLinkIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="12px" viewBox="0 0 576 512">
      <path d="M0 256C0 167.6 71.6 96 160 96h72c13.3 0 24 10.7 24 24s-10.7 24-24 24H160C98.1 144 48 194.1 48 256s50.1 112 112 112h72c13.3 0 24 10.7 24 24s-10.7 24-24 24H160C71.6 416 0 344.4 0 256zm576 0c0 88.4-71.6 160-160 160H344c-13.3 0-24-10.7-24-24s10.7-24 24-24h72c61.9 0 112-50.1 112-112s-50.1-112-112-112H344c-13.3 0-24-10.7-24-24s10.7-24 24-24h72c88.4 0 160 71.6 160 160zM184 232H392c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
    </svg>
  );
}

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
          <DocsSectionLinkIcon />
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
