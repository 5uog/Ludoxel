/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsSidebarSections } from '../../../data/docs/navigation';

type SplitHref = {
  pathname: string;
  hash: string;
};

function splitHref(href: string): SplitHref {
  const [pathname, hash = ''] = href.split('#');

  return {
    pathname,
    hash: hash.length > 0 ? `#${hash}` : '',
  };
}

export function isSidebarItemActive(currentPathname: string, href: string): boolean {
  const target = splitHref(href);
  return currentPathname === target.pathname;
}

export function isOnThisPageItemActive(currentHash: string, href: string, index: number): boolean {
  if (currentHash.length === 0) {
    return index === 0;
  }

  return currentHash === href;
}

export function findActiveSidebarSectionTitle(currentPathname: string): string | null {
  const activeSection = docsSidebarSections.find((section) => section.items.some((item) => isSidebarItemActive(currentPathname, item.href)));

  return activeSection?.title ?? null;
}
