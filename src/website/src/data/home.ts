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
    label: 'Overview',
    href: '/docs/overview',
  },
  {
    label: 'Core Features',
    href: '/docs/overview#core-features',
  },
];
