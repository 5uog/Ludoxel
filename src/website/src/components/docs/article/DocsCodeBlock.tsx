/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Check, Copy } from 'lucide-react';

import { type DocsCodeBlock as DocsCodeBlockContent } from '../../../data/docs/types';
import { type DocsCodeCopyStatus, useDocsCodeCopy } from '../logic/useDocsCodeCopy';
import DocsHighlightedCode from './DocsHighlightedCode';
import { renderInlineText } from './DocsInlineText';

type DocsCodeBlockProps = {
  block: DocsCodeBlockContent;
  blockIndex: number;
  sectionId: string;
};

function getCodeCopyButtonLabel(copyStatus: DocsCodeCopyStatus): string {
  if (copyStatus === 'copied') {
    return 'Code copied';
  }

  if (copyStatus === 'failed') {
    return 'Could not copy code';
  }

  return 'Copy code';
}

function renderCodeCopyIcon(copyStatus: DocsCodeCopyStatus): React.JSX.Element {
  if (copyStatus === 'copied') {
    return <Check className="h-3.5 w-3.5" aria-hidden="true" />;
  }

  return <Copy className="h-3.5 w-3.5" aria-hidden="true" />;
}

export default function DocsCodeBlock({ block, blockIndex, sectionId }: DocsCodeBlockProps): React.JSX.Element {
  const { copyCode, copyStatus } = useDocsCodeCopy(block.code);
  const copyButtonLabel = getCodeCopyButtonLabel(copyStatus);

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background shadow-2xl" key={`${sectionId}-code-${blockIndex}`}>
      <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-2.5">
        {block.caption ? <figcaption className="min-w-0 text-sm text-muted-foreground">{renderInlineText(block.caption)}</figcaption> : <span />}

        <button
          aria-label={copyButtonLabel}
          className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          onClick={copyCode}
          title={copyButtonLabel}
          type="button"
        >
          {renderCodeCopyIcon(copyStatus)}
        </button>

        <span className="sr-only" aria-live="polite">
          {copyStatus === 'copied' ? 'Code copied.' : null}
          {copyStatus === 'failed' ? 'Could not copy code.' : null}
        </span>
      </div>

      <pre className="overflow-x-auto bg-secondary/30 px-4 py-4 font-mono text-sm leading-7">
        <code className="block min-w-full">
          <DocsHighlightedCode code={block.code} language={block.language} />
        </code>
      </pre>
    </figure>
  );
}
