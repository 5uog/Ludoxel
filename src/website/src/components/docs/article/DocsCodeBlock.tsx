/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsCodeBlock as DocsCodeBlockContent } from '../../../data/docs/types';
import { useDocsCodeCopy } from '../logic/useDocsCodeCopy';
import DocsHighlightedCode from './DocsHighlightedCode';
import { renderInlineText } from './DocsInlineText';

type DocsCodeBlockProps = {
  block: DocsCodeBlockContent;
  blockIndex: number;
  sectionId: string;
};

export default function DocsCodeBlock({ block, blockIndex, sectionId }: DocsCodeBlockProps): React.JSX.Element {
  const { copyCode, copyLabel } = useDocsCodeCopy(block.code);

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background shadow-2xl" key={`${sectionId}-code-${blockIndex}`}>
      <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-2.5">
        {block.caption ? <figcaption className="min-w-0 text-sm text-muted-foreground">{renderInlineText(block.caption)}</figcaption> : <span />}

        <button
          className="ml-2 flex h-6 shrink-0 items-center justify-center rounded bg-secondary px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          onClick={copyCode}
          type="button"
        >
          {copyLabel}
        </button>
      </div>

      <pre className="overflow-x-auto bg-secondary/30 px-4 py-4 font-mono text-sm leading-7">
        <code className="block min-w-full">
          <DocsHighlightedCode code={block.code} language={block.language} />
        </code>
      </pre>
    </figure>
  );
}
