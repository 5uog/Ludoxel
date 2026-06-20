/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type ReactNode } from 'react';

import { type DocsInlineText } from '../../../data/docs/types';
import { renderInlineText } from './DocsInlineText';

type DocsMediaFrameProps = {
  caption?: DocsInlineText;
  children: ReactNode;
};

const frameGridStyle = {
  backgroundImage: 'linear-gradient(to right, rgb(229 231 235 / 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgb(229 231 235 / 0.2) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  backgroundPosition: '10px 10px',
  maskImage: 'linear-gradient(0deg, rgb(255 255 255), rgb(255 255 255 / 0.6))',
  WebkitMaskImage: 'linear-gradient(0deg, rgb(255 255 255), rgb(255 255 255 / 0.6))',
};

export default function DocsMediaFrame({ caption, children }: DocsMediaFrameProps): React.JSX.Element {
  return (
    <figure data-name="frame" className="frame not-prose relative my-6 overflow-hidden rounded-2xl bg-gray-50/50 p-2 dark:bg-gray-800/25">
      <div className="pointer-events-none absolute inset-0 dark:opacity-40" style={frameGridStyle} />

      <div className="relative flex justify-center overflow-hidden rounded-xl bg-background/70">{children}</div>

      {caption ? (
        <figcaption
          className="relative mt-3 rounded-2xl px-8 pb-2 pt-0 text-center text-sm text-gray-700 dark:text-gray-400 [&_a:hover]:border-b-2 [&_a]:border-b [&_a]:border-primary [&_a]:font-semibold [&_a]:no-underline [&_p]:m-0 dark:[&_a]:border-primary/70 dark:[&_a]:text-white"
          contentEditable={false}
          data-component-part="frame-caption"
        >
          <div className="space-y-4 whitespace-normal">
            <p className="whitespace-pre-line">{renderInlineText(caption)}</p>
          </div>
        </figcaption>
      ) : null}

      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-black/5 dark:border-white/5" />
    </figure>
  );
}
