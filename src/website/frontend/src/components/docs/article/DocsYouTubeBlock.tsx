/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useEffect, useId, useMemo, useRef } from 'react';
import { type DocsYouTubeMediaBlock } from '../../../data/docs/types';
import { renderInlineText } from './DocsInlineText';

type DocsYouTubeBlockProps = {
  block: DocsYouTubeMediaBlock;
  blockIndex: number;
  sectionId: string;
};

type YouTubePlayerState = {
  ENDED: number;
};

type YouTubePlayerEvent = {
  target: {
    mute: () => void;
    playVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  };
  data: number;
};

type YouTubePlayerConstructor = new (
  elementId: string,
  options: {
    events: {
      onReady?: (event: YouTubePlayerEvent) => void;
      onStateChange?: (event: YouTubePlayerEvent) => void;
    };
  },
) => {
  destroy: () => void;
};

type YouTubeApi = {
  Player: YouTubePlayerConstructor;
  PlayerState: YouTubePlayerState;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youTubeApiPromise: Promise<YouTubeApi> | undefined;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube IFrame API is only available in the browser.'));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youTubeApiPromise) {
    return youTubeApiPromise;
  }

  youTubeApiPromise = new Promise<YouTubeApi>((resolve) => {
    const previousReadyHandler = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();

      if (window.YT?.Player) {
        resolve(window.YT);
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.append(script);
  });

  return youTubeApiPromise;
}

function setBooleanParameter(searchParams: URLSearchParams, name: string, value: boolean | undefined): void {
  if (value === undefined) {
    return;
  }

  searchParams.set(name, value ? '1' : '0');
}

function getBrowserOrigin(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.location.origin;
}

function createYouTubeEmbedSrc(block: DocsYouTubeMediaBlock, origin: string | undefined): string {
  const host = block.privacyEnhanced === false ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com';
  const embedUrl = new URL(`/embed/${encodeURIComponent(block.videoId)}`, host);

  setBooleanParameter(embedUrl.searchParams, 'autoplay', block.autoPlay);
  setBooleanParameter(embedUrl.searchParams, 'controls', block.controls);
  setBooleanParameter(embedUrl.searchParams, 'mute', block.muted);
  setBooleanParameter(embedUrl.searchParams, 'playsinline', block.playsInline);

  if (block.loop === true) {
    /*
     * Single-video URL looping requires playlist={videoId}, but that
     * conversion can make this embed unavailable. Keep the iframe URL
     * playable and perform the repeat through the IFrame Player API.
     */
    embedUrl.searchParams.set('enablejsapi', '1');

    if (origin) {
      embedUrl.searchParams.set('origin', origin);
    }
  }

  return embedUrl.toString();
}

export default function DocsYouTubeBlock({ block, blockIndex, sectionId }: DocsYouTubeBlockProps): React.JSX.Element {
  const reactId = useId();
  const iframeId = `docs-youtube-${sectionId}-${blockIndex}-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const playerRef = useRef<{ destroy: () => void } | null>(null);
  const embedSrc = useMemo(() => createYouTubeEmbedSrc(block, getBrowserOrigin()), [block]);

  useEffect(() => {
    if (block.loop !== true) {
      return;
    }

    let cancelled = false;

    loadYouTubeApi()
      .then((youTubeApi) => {
        if (cancelled) {
          return;
        }

        playerRef.current = new youTubeApi.Player(iframeId, {
          events: {
            onReady: (event) => {
              if (block.muted === true) {
                event.target.mute();
              }
            },
            onStateChange: (event) => {
              if (event.data !== youTubeApi.PlayerState.ENDED) {
                return;
              }

              event.target.seekTo(0, true);
              event.target.playVideo();
            },
          },
        });
      })
      .catch(() => {
        /*
         * Failure to load the optional API must not break the embed itself.
         * The iframe remains playable; only renderer-side loop emulation is lost.
         */
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [block.loop, block.muted, iframeId]);

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background shadow-2xl" key={`${sectionId}-youtube-${blockIndex}`}>
      {block.caption ? <figcaption className="border-b border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">{renderInlineText(block.caption)}</figcaption> : null}

      <div className="bg-secondary/30">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="block aspect-video max-h-136 w-full"
          id={iframeId}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={embedSrc}
          title={block.title}
        />
      </div>
    </figure>
  );
}
