/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type CSSProperties, type ReactNode } from 'react';

type DocsTreeLineOffset = 'article' | 'text-sm' | 'text-base';

type DocsTreeProps = {
  children: ReactNode;
  className?: string;
};

type DocsTreeItemProps = {
  children: ReactNode;
  isLast: boolean;
  lineOffset: DocsTreeLineOffset;
  className?: string;
  contentClassName?: string;
};

const docsTreeLineOffsets: Record<DocsTreeLineOffset, string> = {
  article: '0.8125rem',
  'text-sm': '0.625rem',
  'text-base': '0.75rem',
};

function combineClassNames(...classNames: (string | undefined | false)[]): string {
  return classNames.filter(Boolean).join(' ');
}

function getDocsTreeItemStyle(lineOffset: DocsTreeLineOffset): CSSProperties {
  return {
    '--docs-tree-line-y': docsTreeLineOffsets[lineOffset],
  } as CSSProperties;
}

export function DocsTree({ children, className }: DocsTreeProps): React.JSX.Element {
  return <ul className={combineClassNames('[--docs-tree-item-py:0.25rem]', className)}>{children}</ul>;
}

export function DocsTreeItem({ children, isLast, lineOffset, className, contentClassName }: DocsTreeItemProps): React.JSX.Element {
  return (
    <li className={combineClassNames('relative py-(--docs-tree-item-py) pl-6', className)} style={getDocsTreeItemStyle(lineOffset)}>
      <span aria-hidden="true" className="absolute left-0 top-0 h-[calc(var(--docs-tree-item-py)+var(--docs-tree-line-y))] w-4 border-b border-l border-border" />

      {isLast ? null : <span aria-hidden="true" className="absolute bottom-0 left-0 top-[calc(var(--docs-tree-item-py)+var(--docs-tree-line-y))] border-l border-border" />}

      <div className={contentClassName}>{children}</div>
    </li>
  );
}
