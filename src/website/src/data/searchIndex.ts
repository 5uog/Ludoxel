/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type SearchIndexEntry = {
  title: string;
  description: string;
  href: string;
  section: string;
};

export const searchIndex: SearchIndexEntry[] = [
  {
    title: 'Overview',
    description: 'Ludoxel desktop app, project layout, and documentation hub.',
    href: '/docs/overview',
    section: 'Docs',
  },
  {
    title: 'What is Ludoxel?',
    description: 'Desktop voxel sandbox, Python core, PyQt6 interface, OpenGL, and WGPU.',
    href: '/docs/overview#what-is-ludoxel',
    section: 'Docs',
  },
  {
    title: 'Core Features',
    description: 'Voxel runtime, renderer paths, AI NPCs, Othello mode, and settings.',
    href: '/docs/overview#core-features',
    section: 'Docs',
  },
  {
    title: 'Project Architecture',
    description: 'Foundations, application, simulation, presentation, and website boundaries.',
    href: '/docs/overview#project-architecture',
    section: 'Docs',
  },
  {
    title: 'Settings and Backends',
    description: 'Display, world, player, audio, camera, cloud, shadow, AI, and renderer backend notes.',
    href: '/docs/overview#settings-and-backends',
    section: 'Docs',
  },
  {
    title: 'Getting Help',
    description: 'Where to start before changing the Ludoxel application.',
    href: '/docs/overview#getting-help',
    section: 'Docs',
  },
  {
    title: 'Changelog',
    description: 'Public website notes and unreleased documentation hub changes.',
    href: '/changelog',
    section: 'Updates',
  },
];
