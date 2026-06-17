/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsPages, getDocsPageHref } from './docs';
import { docsSearchSections, type DocsSearchSection } from './docs/types';

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

export const docsHomeHref = '/docs';

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

const docsCategoryIcons: Record<DocsSearchSection, DocsSidebarItem['icon']> = {
  Manual: 'file',
  Gameplay: 'sparkles',
  Systems: 'layers',
  Settings: 'settings',
  Data: 'file',
  Distribution: 'wrench',
  Legal: 'shield',
  Support: 'file',
  Developer: 'wrench',
};

export const docsSidebarSections: DocsSidebarSection[] = docsSearchSections.map((section) => ({
  title: section,
  items: docsPages
    .filter((page) => page.category === section)
    .map((page) => ({
      title: page.navigationTitle,
      href: getDocsPageHref(page),
      icon: docsCategoryIcons[section],
    })),
}));

export const getStartedHref = 'https://github.com/5uog/Ludoxel';
