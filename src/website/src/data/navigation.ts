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

export const mainNavigation: NavigationItem[] = [
  {
    label: 'Docs',
    href: '/docs/overview',
  },
  {
    label: 'Changelog',
    href: '/changelog',
  },
];

export const docsSidebarSections: DocsSidebarSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Overview',
        href: '/docs/overview',
        icon: 'file',
      },
      {
        title: 'What is Ludoxel?',
        href: '/docs/overview#what-is-ludoxel',
        icon: 'wrench',
      },
      {
        title: 'Core Features',
        href: '/docs/overview#core-features',
        icon: 'sparkles',
      },
    ],
  },
  {
    title: 'Runtime & Systems',
    items: [
      {
        title: 'Project Architecture',
        href: '/docs/overview#project-architecture',
        icon: 'layers',
      },
      {
        title: 'Settings and Backends',
        href: '/docs/overview#settings-and-backends',
        icon: 'settings',
      },
      {
        title: 'Getting Help',
        href: '/docs/overview#getting-help',
        icon: 'shield',
      },
    ],
  },
];

export const getStartedHref = 'https://github.com/5uog/Ludoxel';
