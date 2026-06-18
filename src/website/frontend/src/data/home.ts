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
    href: '/docs/manual/starting-the-application/launch-and-space-selection/starting-ludoxel',
  },
  {
    label: 'Rendering Systems',
    href: '/docs/systems/rendering-backends/world-visuals/understanding-render-distance-fog-and-shadows',
  },
  {
    label: 'AI NPC Systems',
    href: '/docs/systems/feedback-and-intelligence/ai-decision-records/understanding-ai-action-selection',
  },
];
