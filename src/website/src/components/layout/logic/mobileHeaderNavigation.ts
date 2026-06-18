/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const MOBILE_HEADER_NAVIGATION_ANIMATION_MS = 500;

export function getMobileHeaderBackdropClassName(isClosing: boolean): string {
  return isClosing ? 'mobile-sheet-backdrop mobile-sheet-backdrop-exit fixed inset-0 z-50 bg-black/80' : 'mobile-sheet-backdrop fixed inset-0 z-50 bg-black/80';
}

export function getMobileHeaderPanelClassName(isClosing: boolean): string {
  return isClosing
    ? 'mobile-sheet-panel-right mobile-sheet-panel-right-exit fixed inset-y-0 right-0 z-50 h-full w-3/4 max-w-sm border-l border-border bg-background p-6 shadow-lg'
    : 'mobile-sheet-panel-right fixed inset-y-0 right-0 z-50 h-full w-3/4 max-w-sm border-l border-border bg-background p-6 shadow-lg';
}
