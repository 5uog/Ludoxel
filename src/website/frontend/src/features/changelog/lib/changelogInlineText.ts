/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type ChangelogInlineTextPart =
  | {
      kind: 'text';
      text: string;
    }
  | {
      kind: 'code';
      code: string;
      key: string;
    };

function isEscaped(text: string, index: number): boolean {
  let backslashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
    backslashCount += 1;
  }

  return backslashCount % 2 === 1;
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

function unescapeBackticks(text: string): string {
  return text.replace(/\\`/g, '`');
}

function pushTextPart(parts: ChangelogInlineTextPart[], text: string): void {
  if (text.length > 0) {
    parts.push({ kind: 'text', text: unescapeBackticks(text) });
  }
}

export function parseChangelogInlineText(text: string): ChangelogInlineTextPart[] {
  const parts: ChangelogInlineTextPart[] = [];
  let cursor = 0;
  let plainStart = 0;

  while (cursor < text.length) {
    if (text[cursor] === '`' && !isEscaped(text, cursor)) {
      const codeEnd = findClosingBacktick(text, cursor + 1);

      if (codeEnd !== -1) {
        pushTextPart(parts, text.slice(plainStart, cursor));
        parts.push({
          kind: 'code',
          code: unescapeBackticks(text.slice(cursor + 1, codeEnd)),
          key: `code-${cursor}-${codeEnd}`,
        });
        cursor = codeEnd + 1;
        plainStart = cursor;
        continue;
      }
    }

    cursor += 1;
  }

  pushTextPart(parts, text.slice(plainStart));
  return parts;
}
