/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
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
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={style.iconClassName} aria-label={style.iconLabel}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 1.3C10.14 1.3 12.7 3.86 12.7 7C12.7 10.14 10.14 12.7 7 12.7C5.48908 12.6974 4.0408 12.096 2.97241 11.0276C1.90403 9.9592 1.30264 8.51092 1.3 7C1.3 3.86 3.86 1.3 7 1.3ZM7 0C3.14 0 0 3.14 0 7C0 10.86 3.14 14 7 14C10.86 14 14 10.86 14 7C14 3.14 10.86 0 7 0ZM8 3H6V8H8V3ZM8 9H6V11H8V9Z"
      />
    </svg>
  );
}

function renderWarningIcon(style: DocsNoteBlockStyle): React.JSX.Element {
  return (
    <svg className={style.iconClassName} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-label={style.iconLabel}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
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
