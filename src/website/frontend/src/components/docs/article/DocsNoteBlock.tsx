/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { CircleAlert, TriangleAlert } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { type DocsNoteBlock as DocsNoteBlockContent, type DocsNoteBlockContentPart, type DocsNoteBlockType } from '../../../data/docs/types';
import { renderInlineText } from './DocsInlineText';

type DocsNoteBlockProps = {
  block: DocsNoteBlockContent;
  blockIndex: number;
  sectionId: string;
};

type DocsNoteBlockStyle = {
  calloutClassName: string;
  contentClassName: string;
  iconClassName: string;
  iconLabel: string;
};

const NOTE_LINK_CLASS_NAME = 'link font-semibold underline decoration-current underline-offset-4 transition-opacity hover:opacity-80';

const NOTE_BLOCK_STYLES: Record<DocsNoteBlockType, DocsNoteBlockStyle> = {
  note: {
    calloutClassName: 'callout my-4 flex gap-3 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-600/20',
    contentClassName:
      'prose min-w-0 w-full text-sm text-blue-800 dark:prose-invert dark:text-blue-300 [&_a]:border-current [&_a]:!text-current [&_code]:!text-current [&_kbd]:!text-current [&_kbd]:bg-background-light dark:[&_kbd]:bg-background-dark [&_strong]:!text-current',
    iconClassName: 'size-4 text-blue-800 dark:text-blue-300',
    iconLabel: 'Note',
  },
  info: {
    calloutClassName: 'callout my-4 flex gap-3 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-600/20',
    contentClassName:
      'prose min-w-0 w-full text-sm text-blue-800 dark:prose-invert dark:text-blue-300 [&_a]:border-current [&_a]:!text-current [&_code]:!text-current [&_kbd]:!text-current [&_kbd]:bg-background-light dark:[&_kbd]:bg-background-dark [&_strong]:!text-current',
    iconClassName: 'size-4 text-blue-800 dark:text-blue-300',
    iconLabel: 'Info',
  },
  warning: {
    calloutClassName:
      "callout my-4 flex gap-3 overflow-hidden rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 dark:border-yellow-900 dark:bg-yellow-600/20 [&_[data-component-part='callout-icon']]:mt-px",
    contentClassName:
      'prose min-w-0 w-full text-sm text-yellow-800 dark:prose-invert dark:text-yellow-300 [&_a]:border-current [&_a]:!text-current [&_code]:!text-current [&_kbd]:!text-current [&_kbd]:bg-background-light dark:[&_kbd]:bg-background-dark [&_strong]:!text-current',
    iconClassName: 'size-5 flex-none text-yellow-800 dark:text-yellow-300',
    iconLabel: 'Warning',
  },
};

function getNoteBlockContentParts(content: DocsNoteBlockContent['content']): DocsNoteBlockContentPart[] {
  return Array.isArray(content) ? content : [content];
}

function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

function renderInfoIcon(style: DocsNoteBlockStyle): React.JSX.Element {
  return <CircleAlert aria-label={style.iconLabel} className={style.iconClassName} />;
}

function renderWarningIcon(style: DocsNoteBlockStyle): React.JSX.Element {
  return <TriangleAlert aria-label={style.iconLabel} className={style.iconClassName} />;
}

function renderNoteBlockIcon(type: DocsNoteBlockType, style: DocsNoteBlockStyle): React.JSX.Element {
  if (type === 'warning') {
    return renderWarningIcon(style);
  }

  return renderInfoIcon(style);
}

function renderNoteBlockContentPart(part: DocsNoteBlockContentPart, partIndex: number): React.JSX.Element {
  if (typeof part === 'string') {
    return <Fragment key={`note-text-${partIndex}`}>{renderInlineText(part)}</Fragment>;
  }

  if (isExternalHref(part.href)) {
    return (
      <a className={NOTE_LINK_CLASS_NAME} href={part.href} key={`note-link-${partIndex}`} rel="noreferrer" target="_blank">
        {part.label}
      </a>
    );
  }

  return (
    <Link className={NOTE_LINK_CLASS_NAME} key={`note-link-${partIndex}`} to={part.href}>
      {part.label}
    </Link>
  );
}

export default function DocsNoteBlock({ block, blockIndex, sectionId }: DocsNoteBlockProps): React.JSX.Element {
  const style = NOTE_BLOCK_STYLES[block.type];
  const contentParts = getNoteBlockContentParts(block.content);

  return (
    <div className={style.calloutClassName} data-callout-type={block.type} key={`${sectionId}-note-${blockIndex}`}>
      <div className="mt-0.5 w-4" data-component-part="callout-icon">
        {renderNoteBlockIcon(block.type, style)}
      </div>

      <div className={style.contentClassName} data-component-part="callout-content">
        <span data-as="p">{contentParts.map((part, partIndex) => renderNoteBlockContentPart(part, partIndex))}</span>
      </div>
    </div>
  );
}
