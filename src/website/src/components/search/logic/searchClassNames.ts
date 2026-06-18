/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type SearchCommandVariant } from './searchCommand.types';

const HEADER_BUTTON_CLASS_NAME =
  'hidden lg:inline-flex search-bar-gradient-border items-center justify-between py-2 pl-6 pr-2.5 w-[309px] min-w-[309px] gap-5 hover:bg-accent/5 transition-colors cursor-pointer';

const HERO_BUTTON_CLASS_NAME =
  'search-bar-gradient-border bg-accent/5 rounded-xl inline-flex items-center justify-between py-4 pl-4 md:pl-8 pr-4 w-full max-w-[600px] gap-3 md:gap-5 hover:bg-accent/10 transition-colors cursor-pointer';

const ICON_BUTTON_CLASS_NAME =
  'flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/50';

export function getSearchTriggerClassName(variant: SearchCommandVariant): string {
  if (variant === 'header') {
    return HEADER_BUTTON_CLASS_NAME;
  }

  if (variant === 'hero') {
    return HERO_BUTTON_CLASS_NAME;
  }

  return ICON_BUTTON_CLASS_NAME;
}

export function getSearchDialogBackdropClassName(isClosing: boolean): string {
  return isClosing ? 'search-dialog-backdrop search-dialog-backdrop-exit absolute inset-0 bg-black/60 backdrop-blur-sm' : 'search-dialog-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm';
}

export function getSearchDialogPanelClassName(isClosing: boolean): string {
  return isClosing ? 'search-dialog-panel search-dialog-panel-exit relative z-10 w-full max-w-[600px] mx-4' : 'search-dialog-panel relative z-10 w-full max-w-[600px] mx-4';
}
