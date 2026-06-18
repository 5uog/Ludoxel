/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useMemo } from 'react';

import { type DocsCodeBlockLanguage } from '../../../data/docs/types';
import { highlightDocsCodeLine, type DocsHighlightTokenKind } from '../logic/docsCodeHighlight';

const TOKEN_CLASS_NAMES: Record<DocsHighlightTokenKind, string> = {
  plain: 'text-foreground',
  comment: 'text-muted-foreground',
  keyword: 'text-violet-300',
  string: 'text-amber-300',
  number: 'text-orange-300',
  function: 'text-sky-300',
  type: 'text-emerald-300',
  property: 'text-lime-300',
  operator: 'text-cyan-300',
  punctuation: 'text-cyan-300',
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
