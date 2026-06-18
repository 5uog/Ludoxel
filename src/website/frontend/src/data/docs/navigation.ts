/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsPages, getDocsPageHref } from './articles';
import { docsSearchSections, type DocsSearchSection } from './types';

export type DocsSidebarItem = {
  title: string;
  href: string;
  icon: 'file' | 'wrench' | 'layers' | 'settings' | 'sparkles' | 'shield';
};

export type DocsSidebarSection = {
  title: string;
  items: DocsSidebarItem[];
};

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
