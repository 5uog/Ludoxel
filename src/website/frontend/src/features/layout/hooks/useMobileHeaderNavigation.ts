/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { getMobileHeaderBackdropClassName, getMobileHeaderPanelClassName, MOBILE_HEADER_NAVIGATION_ANIMATION_MS } from '../lib/mobileHeaderNavigation';

type MobileHeaderNavigationState = {
  isOpen: boolean;
  isClosing: boolean;
  backdropClassName: string;
  panelClassName: string;
  open: () => void;
  close: () => void;
};

export function useMobileHeaderNavigation(currentPath: string): MobileHeaderNavigationState {
  const previousPathRef = useRef<string>(currentPath);
  const closeTimerRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const clearCloseTimer = useCallback((): void => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const open = useCallback((): void => {
    clearCloseTimer();
    setIsClosing(false);
    setIsOpen(true);
  }, [clearCloseTimer]);

  const close = useCallback((): void => {
    if (!isOpen || closeTimerRef.current !== null) {
      return;
    }

    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, MOBILE_HEADER_NAVIGATION_ANIMATION_MS);
  }, [isOpen]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    if (previousPathRef.current === currentPath) {
      return;
    }

    previousPathRef.current = currentPath;

    if (isOpen) {
      close();
    }
  }, [close, currentPath, isOpen]);

  useEffect(() => {
    if (!isOpen || isClosing) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, isClosing, isOpen]);

  return {
    isOpen,
    isClosing,
    backdropClassName: getMobileHeaderBackdropClassName(isClosing),
    panelClassName: getMobileHeaderPanelClassName(isClosing),
    open,
    close,
  };
}
