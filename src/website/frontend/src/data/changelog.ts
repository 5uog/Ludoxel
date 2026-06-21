/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type ChangelogSection = {
  title: string;
  items: string[];
};

export type ChangelogEntry = {
  date: string;
  tags: string[];
  sections: ChangelogSection[];
};

export const changelogEntries: ChangelogEntry[] = [
  {
    date: 'v3.6.3',
    tags: ['Desktop Application', 'Player Animation', 'Third-Person Rendering'],
    sections: [
      {
        title: 'Third-Person Swing',
        items: [
          'Reshaped the attacking, breaking, and placing swing of the third-person player so the main-hand arm now pitches forward from the shoulder instead of being drawn across the body.',
          'Kept the swinging arm, hand, held block, and special item on the outward side of the torso so they no longer pass through the chest in the front view or the back in the rear view.',
          'Aligned the ground shadow with the corrected swing so the cast shadow follows the same arm and held-item motion as the visible body.',
        ],
      },
      {
        title: 'Idle Arm Motion',
        items: [
          'Added a gentle idle sway to both arms while the player is standing still, pivoting each arm at the shoulder so only the lower arm drifts outward and the shoulder stays in place.',
          'Faded the idle sway out while walking or swinging so it never fights the walk cycle or an attack.',
        ],
      },
      {
        title: 'Head and Body Turning',
        items: [
          'Made the third-person body turn follow the look direction with a short delay, so a fast turn lets the head lead while the body catches up and then settles.',
          'Bounded how far the head can turn ahead of the body and kept camera control, picking, placement, and collision responding to the look direction without delay.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.2',
    tags: ['Desktop Application', 'Startup'],
    sections: [
      {
        title: 'Viewport Loading',
        items: [
          'Continued viewport preparation when Ludoxel loses desktop focus during startup, so loading status can advance while visible chunks are prepared.',
          'Completed startup loading by closing the splash, restoring the active main window when appropriate, and then returning focus to the loaded viewport.',
        ],
      },
    ],
  },
];
