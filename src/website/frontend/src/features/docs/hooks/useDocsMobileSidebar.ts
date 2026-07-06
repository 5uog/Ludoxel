/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const MOBILE_SHEET_ANIMATION_MS = 500;

type DocsMobileSidebarState = {
  isOpen: boolean;
  isClosing: boolean;
  backdropClassName: string;
  panelClassName: string;
  open: () => void;
  close: () => void;
};

function getMobileSidebarBackdropClassName(isClosing: boolean): string {
  return isClosing ? 'mobile-sheet-backdrop mobile-sheet-backdrop-exit fixed inset-0 bg-black/80' : 'mobile-sheet-backdrop fixed inset-0 bg-black/80';
}

function getMobileSidebarPanelClassName(isClosing: boolean): string {
  return isClosing
    ? 'mobile-sheet-panel-left mobile-sheet-panel-left-exit fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-sm border-r border-border bg-background shadow-lg'
    : 'mobile-sheet-panel-left fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-sm border-r border-border bg-background shadow-lg';
}

export function useDocsMobileSidebar(currentLocationKey: string): DocsMobileSidebarState {
  const previousLocationKeyRef = useRef<string>(currentLocationKey);
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
    }, MOBILE_SHEET_ANIMATION_MS);
  }, [isOpen]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    if (previousLocationKeyRef.current === currentLocationKey) {
      return;
    }

    previousLocationKeyRef.current = currentLocationKey;

    if (isOpen) {
      close();
    }
  }, [close, currentLocationKey, isOpen]);

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
    backdropClassName: getMobileSidebarBackdropClassName(isClosing),
    panelClassName: getMobileSidebarPanelClassName(isClosing),
    open,
    close,
  };
}
