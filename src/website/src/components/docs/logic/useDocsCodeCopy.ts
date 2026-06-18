/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useCallback, useEffect, useRef, useState } from 'react';

type DocsCodeCopyLabel = 'Copy' | 'Copied' | 'Failed';

const COPY_LABEL_RESET_DELAY_MS = 1600;

export function useDocsCodeCopy(code: string): { copyCode: () => void; copyLabel: DocsCodeCopyLabel } {
  const [copyLabel, setCopyLabel] = useState<DocsCodeCopyLabel>('Copy');
  const resetTimerRef = useRef<number | null>(null);

  const resetCopyLabelLater = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopyLabel('Copy');
      resetTimerRef.current = null;
    }, COPY_LABEL_RESET_DELAY_MS);
  }, []);

  const copyCode = useCallback(() => {
    if (navigator.clipboard?.writeText === undefined) {
      setCopyLabel('Failed');
      resetCopyLabelLater();
      return;
    }

    void navigator.clipboard.writeText(code).then(
      () => {
        setCopyLabel('Copied');
        resetCopyLabelLater();
      },
      () => {
        setCopyLabel('Failed');
        resetCopyLabelLater();
      },
    );
  }, [code, resetCopyLabelLater]);

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
    copyLabel,
  };
}
