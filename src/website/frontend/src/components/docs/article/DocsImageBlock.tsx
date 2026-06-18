/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Pause, Play } from 'lucide-react';
import { useMemo, useState } from 'react';

import { type DocsImageMediaBlock } from '../../../data/docs/types';
import { renderInlineText } from './DocsInlineText';

type DocsImageBlockProps = {
  block: DocsImageMediaBlock;
  blockIndex: number;
  sectionId: string;
};

function isAnimatedGif(src: string): boolean {
  return src.toLowerCase().split('?')[0].endsWith('.gif');
}

export default function DocsImageBlock({ block, blockIndex, sectionId }: DocsImageBlockProps): React.JSX.Element {
  const hasGifControls = block.controls === true && isAnimatedGif(block.src);
  const [isPlaying, setIsPlaying] = useState(!hasGifControls);
  const imageKey = useMemo(() => `${sectionId}-image-${blockIndex}-${isPlaying ? 'playing' : 'stopped'}`, [blockIndex, isPlaying, sectionId]);

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background shadow-2xl" key={`${sectionId}-image-${blockIndex}`}>
      {block.caption || hasGifControls ? (
        <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-2.5">
          {block.caption ? <figcaption className="min-w-0 text-sm text-muted-foreground">{renderInlineText(block.caption)}</figcaption> : <span />}

          {hasGifControls ? (
            <button
              aria-label={isPlaying ? 'Stop animated image' : 'Play animated image'}
              className="ml-2 inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded bg-secondary px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
              onClick={() => {
                setIsPlaying((currentValue) => !currentValue);
              }}
              type="button"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Stop' : 'Play'}</span>
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="relative overflow-hidden bg-secondary/30">
        {isPlaying ? (
          <img className="block max-h-136 w-full object-contain" key={imageKey} src={block.src} alt={block.alt} loading="lazy" />
        ) : block.poster ? (
          <img className="block max-h-136 w-full object-contain" src={block.poster} alt={block.alt} loading="lazy" />
        ) : (
          <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-muted-foreground">Animated image stopped.</div>
        )}
      </div>
    </figure>
  );
}
