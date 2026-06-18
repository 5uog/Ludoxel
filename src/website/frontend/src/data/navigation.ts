/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type NavigationItem = {
  label: string;
  href: string;
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

export const getStartedHref = 'https://github.com/5uog/Ludoxel';
