/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useEffect, useState } from 'react';

const DESKTOP_HEADER_OFFSET_PX = 64;

export function useDocsFooterOverlap(currentLocationKey: string): number {
  const [footerOverlapPx, setFooterOverlapPx] = useState<number>(0);

  useEffect(() => {
    let animationFrameId: number | null = null;
    let lastFooterOverlapPx = -1;

    const updateFooterOverlap = (): void => {
      animationFrameId = null;

      const footer = document.querySelector('footer');
      const viewportHeight = window.innerHeight;
      const maxOverlapPx = Math.max(0, viewportHeight - DESKTOP_HEADER_OFFSET_PX);
      const nextFooterOverlapPx = footer instanceof HTMLElement ? Math.min(maxOverlapPx, Math.max(0, Math.ceil(viewportHeight - footer.getBoundingClientRect().top))) : 0;

      if (nextFooterOverlapPx === lastFooterOverlapPx) {
        return;
      }

      lastFooterOverlapPx = nextFooterOverlapPx;
      setFooterOverlapPx(nextFooterOverlapPx);
    };

    const scheduleFooterOverlapUpdate = (): void => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateFooterOverlap);
    };

    scheduleFooterOverlapUpdate();
    window.addEventListener('scroll', scheduleFooterOverlapUpdate, { passive: true });
    window.addEventListener('resize', scheduleFooterOverlapUpdate);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener('scroll', scheduleFooterOverlapUpdate);
      window.removeEventListener('resize', scheduleFooterOverlapUpdate);
    };
  }, [currentLocationKey]);

  return footerOverlapPx;
}
