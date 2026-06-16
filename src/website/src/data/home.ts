/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type ShortcutLink = {
  label: string;
  href: string;
};

export const heroShortcuts: ShortcutLink[] = [
  {
    label: 'Introduction',
    href: '/docs/introduction',
  },
  {
    label: 'Rendering Backends',
    href: '/docs/rendering',
  },
  {
    label: 'AI NPC Systems',
    href: '/docs/ai-npcs',
  },
];
