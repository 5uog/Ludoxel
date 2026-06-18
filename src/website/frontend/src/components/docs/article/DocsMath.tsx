/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import katex from 'katex';

export type DocsMathProps = {
  expression: string;
  displayMode: boolean;
};

function renderMathToHtml(expression: string, displayMode: boolean): string | undefined {
  try {
    return katex.renderToString(expression, {
      displayMode,
      output: 'htmlAndMathml',
      strict: 'warn',
      throwOnError: false,
    });
  } catch {
    return undefined;
  }
}

export default function DocsMath({ expression, displayMode }: DocsMathProps): React.JSX.Element {
  const renderedHtml = renderMathToHtml(expression, displayMode);

  if (renderedHtml === undefined) {
    return <code className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.92em] text-foreground">{expression}</code>;
  }

  if (displayMode) {
    return <div className="docs-math docs-math--display" dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
  }

  return <span className="docs-math docs-math--inline" dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
}
