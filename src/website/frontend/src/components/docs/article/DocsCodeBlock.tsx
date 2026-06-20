/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';

import { type DocsCodeBlock as DocsCodeBlockContent, type DocsCodeBlockLanguage, type DocsSingleCodeBlock, type DocsTabbedCodeBlock } from '../../../data/docs/types';
import { getDocsCodeLanguageLabel } from '../logic/docsCodeLanguages';
import { type DocsCodeCopyStatus, useDocsCodeCopy } from '../logic/useDocsCodeCopy';
import DocsHighlightedCode from './DocsHighlightedCode';
import { renderInlineText } from './DocsInlineText';

type DocsCodeBlockProps = {
  block: DocsCodeBlockContent;
  blockIndex: number;
  sectionId: string;
};

type DocsCodeCopyButtonProps = {
  code: string;
};

type DocsCodeHeaderMetaProps = {
  caption?: DocsSingleCodeBlock['caption'];
  language: DocsCodeBlockLanguage;
};

type DocsCodePreProps = {
  code: string;
  language: DocsCodeBlockLanguage;
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

function isTabbedCodeBlock(block: DocsCodeBlockContent): block is DocsTabbedCodeBlock {
  return 'tabs' in block;
}

function clampDefaultTabIndex(block: DocsTabbedCodeBlock): number {
  if (block.tabs.length === 0) {
    return 0;
  }

  const requestedIndex = block.defaultTabIndex ?? 0;

  if (requestedIndex < 0) {
    return 0;
  }

  if (requestedIndex >= block.tabs.length) {
    return block.tabs.length - 1;
  }

  return requestedIndex;
}

function DocsCodeCopyButton({ code }: DocsCodeCopyButtonProps): React.JSX.Element {
  const { copyCode, copyStatus } = useDocsCodeCopy(code);
  const copyButtonLabel = getCodeCopyButtonLabel(copyStatus);

  return (
    <>
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
    </>
  );
}

function DocsCodeHeaderMeta({ caption, language }: DocsCodeHeaderMetaProps): React.JSX.Element {
  const languageLabel = getDocsCodeLanguageLabel(language);

  return (
    <div className="flex min-w-0 items-center gap-3">
      {caption ? <figcaption className="min-w-0 text-sm text-muted-foreground">{renderInlineText(caption)}</figcaption> : null}
      <span className="shrink-0 rounded-md border border-border bg-secondary/50 px-2 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {languageLabel}
      </span>
    </div>
  );
}

function DocsCodePre({ code, language }: DocsCodePreProps): React.JSX.Element {
  return (
    <pre className="overflow-x-auto bg-secondary/30 px-4 py-4 font-mono text-sm leading-7">
      <code className="block min-w-full">
        <DocsHighlightedCode code={code} language={language} />
      </code>
    </pre>
  );
}

function DocsSingleCodeBlock({ block, blockIndex, sectionId }: { block: DocsSingleCodeBlock; blockIndex: number; sectionId: string }): React.JSX.Element {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background shadow-2xl" key={`${sectionId}-code-${blockIndex}`}>
      <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-2.5">
        <DocsCodeHeaderMeta caption={block.caption} language={block.language} />
        <DocsCodeCopyButton code={block.code} />
      </div>

      <DocsCodePre code={block.code} language={block.language} />
    </figure>
  );
}

function DocsTabbedCodeBlock({ block, blockIndex, sectionId }: { block: DocsTabbedCodeBlock; blockIndex: number; sectionId: string }): React.JSX.Element {
  const initialTabIndex = useMemo(() => clampDefaultTabIndex(block), [block]);
  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);
  const safeActiveTabIndex = activeTabIndex >= 0 && activeTabIndex < block.tabs.length ? activeTabIndex : initialTabIndex;
  const activeTab = block.tabs[safeActiveTabIndex];

  if (activeTab === undefined) {
    return (
      <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background shadow-2xl" key={`${sectionId}-code-${blockIndex}`}>
        <div className="px-4 py-3 text-sm text-muted-foreground">No code tabs are available.</div>
      </figure>
    );
  }

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background shadow-2xl" key={`${sectionId}-code-${blockIndex}`}>
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border bg-background px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" role="tablist" aria-label={block.caption ?? 'Code examples'}>
          {block.tabs.map((tab, tabIndex) => {
            const isActive = tabIndex === safeActiveTabIndex;

            return (
              <button
                aria-controls={`${sectionId}-code-${blockIndex}-panel`}
                aria-selected={isActive}
                className={`relative shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'}`}
                id={`${sectionId}-code-${blockIndex}-tab-${tabIndex}`}
                key={`${tab.label}-${tabIndex}`}
                onClick={() => {
                  setActiveTabIndex(tabIndex);
                }}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <span>{tab.label}</span>
                <span className="ml-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground/80">{getDocsCodeLanguageLabel(tab.language)}</span>
                {isActive ? <span className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-primary" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>

        <DocsCodeCopyButton code={activeTab.code} key={`${sectionId}-code-${blockIndex}-copy-${safeActiveTabIndex}`} />
      </div>

      {block.caption ? <figcaption className="border-b border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">{renderInlineText(block.caption)}</figcaption> : null}

      <div aria-labelledby={`${sectionId}-code-${blockIndex}-tab-${safeActiveTabIndex}`} id={`${sectionId}-code-${blockIndex}-panel`} role="tabpanel">
        <DocsCodePre code={activeTab.code} language={activeTab.language} />
      </div>
    </figure>
  );
}

export default function DocsCodeBlock({ block, blockIndex, sectionId }: DocsCodeBlockProps): React.JSX.Element {
  if (isTabbedCodeBlock(block)) {
    return <DocsTabbedCodeBlock block={block} blockIndex={blockIndex} sectionId={sectionId} />;
  }

  return <DocsSingleCodeBlock block={block} blockIndex={blockIndex} sectionId={sectionId} />;
}
