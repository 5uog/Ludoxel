/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Pause, Play } from 'lucide-react';

import { type DocsVideoMediaBlock } from '../../../../data/docs/types';
import { useDocsVideoPlayback } from '../../hooks/useDocsVideoPlayback';
import DocsMediaFrame from './DocsMediaFrame';

type DocsVideoBlockProps = {
  block: DocsVideoMediaBlock;
  blockIndex: number;
  sectionId: string;
};

export default function DocsVideoBlock({ block }: DocsVideoBlockProps): React.JSX.Element {
  const playback = useDocsVideoPlayback({ autoPlay: block.autoPlay === true });
  const hasControls = block.controls === true;

  return (
    <DocsMediaFrame caption={block.caption}>
      <div className="w-full bg-secondary/30">
        <video
          ref={playback.videoRef}
          className="block max-h-136 w-full object-contain"
          autoPlay={block.autoPlay === true}
          controls={false}
          loop={block.loop === true}
          muted={block.muted ?? true}
          playsInline={block.playsInline ?? true}
          poster={block.poster}
          preload="metadata"
          onEnded={playback.handleEnded}
          onPause={playback.handlePause}
          onPlay={playback.handlePlay}
          onTimeUpdate={playback.handleTimeUpdate}
          onLoadedMetadata={playback.handleLoadedMetadata}
        >
          {block.sources.map((source) => (
            <source key={`${source.type}-${source.src}`} src={source.src} type={source.type} />
          ))}
        </video>

        {hasControls ? (
          <div className="border-t border-border bg-background px-4 py-3">
            <div className="flex items-center gap-3">
              <button aria-label={playback.isPlaying ? 'Pause video' : 'Play video'} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground" onClick={playback.togglePlayback} type="button">
                {playback.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${playback.progressPercent}%` }} />
              </div>

              <span className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {playback.currentTimeLabel} / {playback.durationLabel}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </DocsMediaFrame>
  );
}
