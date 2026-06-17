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
    label: 'Starting Ludoxel',
    href: '/docs/manual/first-use/application/starting-ludoxel',
  },
  {
    label: 'Rendering Systems',
    href: '/docs/systems/rendering/backend-and-world-rendering/understanding-render-distance-fog-and-shadows',
  },
  {
    label: 'AI NPC Systems',
    href: '/docs/systems/intelligence/ai-and-othello-systems/understanding-ai-action-selection',
  },
];
