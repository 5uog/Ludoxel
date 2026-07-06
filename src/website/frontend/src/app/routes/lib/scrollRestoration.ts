/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const HASH_SCROLL_MAX_FRAME_COUNT = 60;
const HASH_SCROLL_SETTLE_FRAME_COUNT = 4;
const HASH_SCROLL_EXTRA_TOP_GAP_PX = 16;
const HASH_SCROLL_EPSILON_PX = 0.5;

export function decodeHashTarget(hash: string): string {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

function readPixelValue(value: string): number {
  const numericValue = Number.parseFloat(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function getHashTarget(hash: string): HTMLElement | null {
  const targetId = decodeHashTarget(hash);

  if (targetId.length === 0) {
    return null;
  }

  const target = document.getElementById(targetId);

  return target instanceof HTMLElement ? target : null;
}

function getFixedHeaderOffset(): number {
  const header = document.querySelector('header');

  if (!(header instanceof HTMLElement)) {
    return 0;
  }

  const headerHeight = header.getBoundingClientRect().height;

  return Number.isFinite(headerHeight) ? headerHeight : 0;
}

function getComputedScrollOffset(target: HTMLElement): number {
  const computedStyle = window.getComputedStyle(target);
  const scrollMarginTop = readPixelValue(computedStyle.scrollMarginTop);
  const fixedHeaderSafeOffset = getFixedHeaderOffset() + HASH_SCROLL_EXTRA_TOP_GAP_PX;

  return Math.max(scrollMarginTop, fixedHeaderSafeOffset);
}

function getLayoutDocumentTop(target: HTMLElement): number {
  let top = 0;
  let currentElement: HTMLElement | null = target;

  while (currentElement !== null) {
    top += currentElement.offsetTop;

    const nextOffsetParent: Element | null = currentElement.offsetParent;
    currentElement = nextOffsetParent instanceof HTMLElement ? nextOffsetParent : null;
  }

  return top;
}

function getFixedHeaderSafeScrollTop(target: HTMLElement): number {
  return Math.max(getLayoutDocumentTop(target) - getComputedScrollOffset(target), 0);
}

function scrollElementIntoFixedHeaderSafeView(target: HTMLElement): number {
  const top = getFixedHeaderSafeScrollTop(target);

  window.scrollTo({
    left: window.scrollX,
    top,
    behavior: 'auto',
  });

  return top;
}

function getRunningAnimations(target: HTMLElement): Animation[] {
  return target.getAnimations({ subtree: true }).filter((animation) => animation.playState !== 'finished');
}

function schedulePostAnimationScroll(hash: string, target: HTMLElement, isCancelled: () => boolean): void {
  const runningAnimations = getRunningAnimations(target);

  if (runningAnimations.length === 0) {
    return;
  }

  void Promise.allSettled(runningAnimations.map((animation) => animation.finished)).then(() => {
    if (isCancelled()) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (!isCancelled()) {
        scrollToHashTarget(hash);
      }
    });
  });
}

export function scrollToHashTarget(hash: string): boolean {
  const target = getHashTarget(hash);

  if (target === null) {
    return false;
  }

  scrollElementIntoFixedHeaderSafeView(target);
  return true;
}

export function scheduleHashTargetScroll(hash: string): () => void {
  let cancelled = false;
  let frameId = 0;
  let frameCount = 0;
  let settledFrameCount = 0;
  let lastTargetTop: number | null = null;
  let postAnimationScrollScheduled = false;

  function isCancelled(): boolean {
    return cancelled;
  }

  function scheduleNextFrame(): void {
    frameId = window.requestAnimationFrame(scrollFrame);
  }

  function scrollFrame(): void {
    if (cancelled) {
      return;
    }

    frameCount += 1;

    const target = getHashTarget(hash);

    if (target !== null) {
      const targetTop = scrollElementIntoFixedHeaderSafeView(target);
      const targetTopChanged = lastTargetTop === null || Math.abs(targetTop - lastTargetTop) > HASH_SCROLL_EPSILON_PX;

      lastTargetTop = targetTop;
      settledFrameCount = targetTopChanged ? 0 : settledFrameCount + 1;

      if (!postAnimationScrollScheduled) {
        postAnimationScrollScheduled = true;
        schedulePostAnimationScroll(hash, target, isCancelled);
      }

      if (settledFrameCount >= HASH_SCROLL_SETTLE_FRAME_COUNT) {
        return;
      }
    }

    if (frameCount < HASH_SCROLL_MAX_FRAME_COUNT) {
      scheduleNextFrame();
    }
  }

  scheduleNextFrame();

  return () => {
    cancelled = true;

    if (frameId !== 0) {
      window.cancelAnimationFrame(frameId);
    }
  };
}
