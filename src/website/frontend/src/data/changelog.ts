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
