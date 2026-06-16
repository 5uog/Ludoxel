/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type NavigationItem = {
  label: string;
  href: string;
};

export type DocsSidebarItem = {
  title: string;
  href: string;
  icon: 'file' | 'wrench' | 'layers' | 'settings' | 'sparkles' | 'shield';
};

export type DocsSidebarSection = {
  title: string;
  items: DocsSidebarItem[];
};

export const docsHomeHref = '/docs/introduction';

export const mainNavigation: NavigationItem[] = [
  {
    label: 'Docs',
    href: docsHomeHref,
  },
  {
    label: 'Changelog',
    href: '/changelog',
  },
];

export const docsSidebarSections: DocsSidebarSection[] = [
  {
    title: 'Application',
    items: [
      {
        title: 'Introduction',
        href: '/docs/introduction',
        icon: 'file',
      },
      {
        title: 'World Runtime',
        href: '/docs/world-runtime',
        icon: 'layers',
      },
      {
        title: 'Othello Mode',
        href: '/docs/othello',
        icon: 'sparkles',
      },
    ],
  },
  {
    title: 'Systems',
    items: [
      {
        title: 'Rendering Backends',
        href: '/docs/rendering',
        icon: 'layers',
      },
      {
        title: 'AI NPC Systems',
        href: '/docs/ai-npcs',
        icon: 'wrench',
      },
      {
        title: 'Settings Surface',
        href: '/docs/settings',
        icon: 'settings',
      },
    ],
  },
  {
    title: 'Project',
    items: [
      {
        title: 'Project Structure',
        href: '/docs/project-structure',
        icon: 'shield',
      },
      {
        title: 'Support and Reports',
        href: '/docs/support',
        icon: 'file',
      },
    ],
  },
];

export const getStartedHref = 'https://github.com/5uog/Ludoxel';
