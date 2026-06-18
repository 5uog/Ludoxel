/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getDocsCollectionHref } from '../../../data/docs/collections';
import { type DocsPageContent, type DocsSearchSection } from '../../../data/docs/types';

export function groupPagesByCategory(pages: DocsPageContent[]): Map<DocsSearchSection, DocsPageContent[]> {
  const groupedPages = new Map<DocsSearchSection, DocsPageContent[]>();

  pages.forEach((page) => {
    const existingPages = groupedPages.get(page.category) ?? [];
    existingPages.push(page);
    groupedPages.set(page.category, existingPages);
  });

  return groupedPages;
}

export function groupPagesBySubcategory(pages: DocsPageContent[]): Map<string, DocsPageContent[]> {
  const groupedPages = new Map<string, DocsPageContent[]>();

  pages.forEach((page) => {
    const existingPages = groupedPages.get(page.subcategory) ?? [];
    existingPages.push(page);
    groupedPages.set(page.subcategory, existingPages);
  });

  return groupedPages;
}

export function groupPagesByGroup(pages: DocsPageContent[]): Map<string, DocsPageContent[]> {
  const groupedPages = new Map<string, DocsPageContent[]>();

  pages.forEach((page) => {
    const existingPages = groupedPages.get(page.group) ?? [];
    existingPages.push(page);
    groupedPages.set(page.group, existingPages);
  });

  return groupedPages;
}

export function firstPageHrefForCategory(pages: DocsPageContent[]): string {
  return getDocsCollectionHref(pages[0]?.pathSegments.slice(0, 1) ?? []);
}

export function firstPageHrefForSubcategory(pages: DocsPageContent[]): string {
  return getDocsCollectionHref(pages[0]?.pathSegments.slice(0, 2) ?? []);
}

export function firstPageHrefForGroup(pages: DocsPageContent[]): string {
  return getDocsCollectionHref(pages[0]?.pathSegments.slice(0, 3) ?? []);
}
