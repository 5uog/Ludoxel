/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useMemo } from 'react';

import { type DocsCodeBlockLanguage } from '../../../data/docs/types';
import { highlightDocsCodeLine } from '../logic/docsCodeHighlight';
import { type DocsHighlightTokenKind } from '../logic/docsCodeHighlight.types';

const TOKEN_CLASS_NAMES: Record<DocsHighlightTokenKind, string> = {
  plain: 'docs-code-token docs-code-token--plain',
  comment: 'docs-code-token docs-code-token--comment',
  keyword: 'docs-code-token docs-code-token--keyword',
  control: 'docs-code-token docs-code-token--control',
  modifier: 'docs-code-token docs-code-token--modifier',
  string: 'docs-code-token docs-code-token--string',
  number: 'docs-code-token docs-code-token--number',
  function: 'docs-code-token docs-code-token--function',
  type: 'docs-code-token docs-code-token--type',
  property: 'docs-code-token docs-code-token--property',
  constant: 'docs-code-token docs-code-token--constant',
  variable: 'docs-code-token docs-code-token--variable',
  tag: 'docs-code-token docs-code-token--tag',
  attribute: 'docs-code-token docs-code-token--attribute',
  operator: 'docs-code-token docs-code-token--operator',
  punctuation: 'docs-code-token docs-code-token--punctuation',
  regex: 'docs-code-token docs-code-token--regex',
  inserted: 'docs-code-token docs-code-token--inserted',
  deleted: 'docs-code-token docs-code-token--deleted',
  meta: 'docs-code-token docs-code-token--meta',
};

type DocsHighlightedCodeProps = {
  code: string;
  language: DocsCodeBlockLanguage;
};

export default function DocsHighlightedCode({ code, language }: DocsHighlightedCodeProps): React.JSX.Element {
  const highlightedLines = useMemo(
    () =>
      code.split('\n').map((line) => ({
        line,
        tokens: highlightDocsCodeLine(line, language),
      })),
    [code, language],
  );

  return (
    <>
      {highlightedLines.map((line, lineIndex) => (
        <span className="flex w-max min-w-full" key={lineIndex}>
          <span className="w-12 shrink-0 select-none pr-5 text-right text-muted-foreground/70">{lineIndex + 1}</span>
          <span className="whitespace-pre">
            {line.tokens.map((token, tokenIndex) => (
              <span className={TOKEN_CLASS_NAMES[token.kind]} key={`${lineIndex}-${tokenIndex}`}>
                {token.value}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}
