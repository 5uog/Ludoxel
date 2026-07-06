/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import { type DocsInlineText, type DocsInlineTextPart } from '../../../../data/docs/types';
import DocsMath from './DocsMath';

type InlineTextPart = string | React.JSX.Element;

const INLINE_LINK_CLASS_NAME = 'link font-semibold underline decoration-current underline-offset-4 transition-opacity hover:opacity-80';
const INLINE_CODE_CLASS_NAME =
  'inline max-w-full whitespace-normal break-words rounded border border-border bg-secondary px-1.5 py-0.5 align-baseline font-mono text-[0.92em] text-foreground [overflow-wrap:anywhere]';

function isEscaped(text: string, index: number): boolean {
  let backslashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
    backslashCount += 1;
  }

  return backslashCount % 2 === 1;
}

function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

function findUnescapedSequence(text: string, sequence: string, fromIndex: number): number {
  let cursor = fromIndex;

  while (cursor < text.length) {
    const nextIndex = text.indexOf(sequence, cursor);

    if (nextIndex === -1) {
      return -1;
    }

    if (!isEscaped(text, nextIndex)) {
      return nextIndex;
    }

    cursor = nextIndex + sequence.length;
  }

  return -1;
}

function findClosingBacktick(text: string, fromIndex: number): number {
  let cursor = fromIndex;

  while (cursor < text.length) {
    const nextIndex = text.indexOf('`', cursor);

    if (nextIndex === -1) {
      return -1;
    }

    if (!isEscaped(text, nextIndex)) {
      return nextIndex;
    }

    cursor = nextIndex + 1;
  }

  return -1;
}

function findInlineDollarEnd(text: string, fromIndex: number): number {
  let cursor = fromIndex;

  while (cursor < text.length) {
    const nextIndex = text.indexOf('$', cursor);

    if (nextIndex === -1) {
      return -1;
    }

    if (!isEscaped(text, nextIndex) && text[nextIndex - 1] !== '$' && text[nextIndex + 1] !== '$') {
      return nextIndex;
    }

    cursor = nextIndex + 1;
  }

  return -1;
}

function unescapeBackticks(text: string): string {
  return text.replace(/\\`/g, '`');
}

function pushTextPart(parts: InlineTextPart[], text: string): void {
  if (text.length > 0) {
    parts.push(unescapeBackticks(text));
  }
}

function renderInlineLink(part: Exclude<DocsInlineTextPart, string>, partIndex: number): React.JSX.Element {
  if (isExternalHref(part.href)) {
    return (
      <a className={INLINE_LINK_CLASS_NAME} href={part.href} key={`inline-link-${partIndex}`} rel="noreferrer" target="_blank">
        {part.label}
      </a>
    );
  }

  return (
    <Link className={INLINE_LINK_CLASS_NAME} key={`inline-link-${partIndex}`} to={part.href}>
      {part.label}
    </Link>
  );
}

function renderInlineTextPart(part: DocsInlineTextPart, partIndex: number): InlineTextPart[] {
  if (typeof part === 'string') {
    return renderInlineTextString(part);
  }

  return [renderInlineLink(part, partIndex)];
}

function renderInlineTextString(text: string): InlineTextPart[] {
  const parts: InlineTextPart[] = [];
  let cursor = 0;
  let plainStart = 0;

  while (cursor < text.length) {
    if (text[cursor] === '`' && !isEscaped(text, cursor)) {
      const codeEnd = findClosingBacktick(text, cursor + 1);

      if (codeEnd !== -1) {
        pushTextPart(parts, text.slice(plainStart, cursor));
        const code = unescapeBackticks(text.slice(cursor + 1, codeEnd));
        parts.push(
          <code className={INLINE_CODE_CLASS_NAME} key={`code-${cursor}-${codeEnd}`}>
            {code}
          </code>,
        );
        cursor = codeEnd + 1;
        plainStart = cursor;
        continue;
      }
    }

    if (text.startsWith('\\(', cursor)) {
      const mathEnd = findUnescapedSequence(text, '\\)', cursor + 2);

      if (mathEnd !== -1) {
        pushTextPart(parts, text.slice(plainStart, cursor));
        parts.push(<DocsMath displayMode={false} expression={text.slice(cursor + 2, mathEnd)} key={`math-paren-${cursor}-${mathEnd}`} />);
        cursor = mathEnd + 2;
        plainStart = cursor;
        continue;
      }
    }

    if (text[cursor] === '$' && text[cursor + 1] !== '$' && !isEscaped(text, cursor)) {
      const mathEnd = findInlineDollarEnd(text, cursor + 1);

      if (mathEnd !== -1) {
        pushTextPart(parts, text.slice(plainStart, cursor));
        parts.push(<DocsMath displayMode={false} expression={text.slice(cursor + 1, mathEnd)} key={`math-dollar-${cursor}-${mathEnd}`} />);
        cursor = mathEnd + 1;
        plainStart = cursor;
        continue;
      }
    }

    cursor += 1;
  }

  pushTextPart(parts, text.slice(plainStart));
  return parts;
}

export function renderInlineText(text: DocsInlineText): InlineTextPart[] {
  if (typeof text === 'string') {
    return renderInlineTextString(text);
  }

  return text.flatMap((part, partIndex) => renderInlineTextPart(part, partIndex));
}
