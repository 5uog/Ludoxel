/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type DocsCodeCopyStatus = 'idle' | 'copied' | 'failed';

const COPY_STATUS_RESET_DELAY_MS = 1600;

export function useDocsCodeCopy(code: string): { copyCode: () => void; copyStatus: DocsCodeCopyStatus } {
  const [copyStatus, setCopyStatus] = useState<DocsCodeCopyStatus>('idle');
  const resetTimerRef = useRef<number | null>(null);

  const resetCopyStatusLater = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopyStatus('idle');
      resetTimerRef.current = null;
    }, COPY_STATUS_RESET_DELAY_MS);
  }, []);

  const copyCode = useCallback(() => {
    if (navigator.clipboard?.writeText === undefined) {
      setCopyStatus('failed');
      resetCopyStatusLater();
      return;
    }

    void navigator.clipboard.writeText(code).then(
      () => {
        setCopyStatus('copied');
        resetCopyStatusLater();
      },
      () => {
        setCopyStatus('failed');
        resetCopyStatusLater();
      },
    );
  }, [code, resetCopyStatusLater]);

  useEffect(
    () => () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  return {
    copyCode,
    copyStatus,
  };
}
