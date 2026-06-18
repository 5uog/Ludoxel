/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
type InlineTextPart = string | React.JSX.Element;

export function renderInlineText(text: string): InlineTextPart[] {
  return text
    .split(/(`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        return (
          <code className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.92em] text-foreground" key={`${part}-${index}`}>
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
}
