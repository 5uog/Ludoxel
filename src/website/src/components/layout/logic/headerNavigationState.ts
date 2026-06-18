/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function isNavigationItemActive(currentPath: string, href: string): boolean {
  if (href === '/') {
    return currentPath === '/';
  }

  if (href.startsWith('/docs')) {
    return currentPath.startsWith('/docs');
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}
