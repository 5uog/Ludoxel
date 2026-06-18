/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useCallback, useMemo, useRef, useState } from 'react';

type UseDocsVideoPlaybackOptions = {
  autoPlay: boolean;
};

type UseDocsVideoPlaybackResult = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  progressPercent: number;
  currentTimeLabel: string;
  durationLabel: string;
  togglePlayback: () => void;
  handleEnded: () => void;
  handlePause: () => void;
  handlePlay: () => void;
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
};

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0:00';
  }

  const roundedSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function useDocsVideoPlayback({ autoPlay }: UseDocsVideoPlaybackOptions): UseDocsVideoPlaybackResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progressPercent = useMemo(() => {
    if (!Number.isFinite(duration) || duration <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const syncVideoTime = useCallback(() => {
    const video = videoRef.current;

    if (video === null) {
      return;
    }

    setCurrentTime(video.currentTime);
    setDuration(video.duration);
  }, []);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;

    if (video === null) {
      return;
    }

    if (video.paused) {
      void video.play();
      return;
    }

    video.pause();
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    syncVideoTime();
  }, [syncVideoTime]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    syncVideoTime();
  }, [syncVideoTime]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    syncVideoTime();
  }, [syncVideoTime]);

  const handleTimeUpdate = useCallback(() => {
    syncVideoTime();
  }, [syncVideoTime]);

  const handleLoadedMetadata = useCallback(() => {
    syncVideoTime();
  }, [syncVideoTime]);

  return {
    videoRef,
    isPlaying,
    progressPercent,
    currentTimeLabel: formatTime(currentTime),
    durationLabel: formatTime(duration),
    togglePlayback,
    handleEnded,
    handlePause,
    handlePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
  };
}
