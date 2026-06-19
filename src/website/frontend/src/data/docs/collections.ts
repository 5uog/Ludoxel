/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsPages, getDocsPageHref, getDocsPagePath } from './articles';
import { getDocsHrefFromSegments, type DocsPageContent, type DocsSearchSection } from './types';

export type DocsCollection = {
  title: string;
  description: string;
  pathSegments: string[];
  pages: DocsPageContent[];
};

export type DocsBreadcrumb = {
  label: string;
  href: string;
};

const docsCollectionDescriptions: Record<DocsSearchSection, string> = {
  Manual: 'Technical operation notes for practitioners who need precise startup, window, control, and overlay behavior.',
  Gameplay: 'Gameplay documentation for readers who can follow My World state, AI NPC interaction, and Othello match constraints.',
  Systems: 'Runtime, rendering, audio, input, AI, learning, and Othello system notes tied to implementation boundaries.',
  Settings: 'Guides for camera, crosshair, cloud, shadow, audio, keybind, player, AI, and Othello settings.',
  Data: 'Local user data, saved state, generated learning data, output, and material-boundary documentation.',
  Distribution: 'Desktop package, build, check, license-inclusion, and release-boundary documentation.',
  Legal: 'License authority, material scope, use restrictions, and repository-governance documentation.',
  Support: 'Problem report, limited question, security contact, and unsupported-request documentation.',
};

function normalizeDocsPath(path: string | undefined): string {
  return path?.replace(/^\/+|\/+$/g, '') ?? '';
}

function splitDocsPath(path: string | undefined): string[] {
  const normalizedPath = normalizeDocsPath(path);

  if (normalizedPath.length === 0) {
    return [];
  }

  return normalizedPath.split('/').filter(Boolean);
}

function matchesPathPrefix(page: DocsPageContent, pathSegments: string[]): boolean {
  return pathSegments.every((segment, index) => page.pathSegments[index] === segment);
}

function titleForCollection(pathSegments: string[], pages: DocsPageContent[]): string {
  if (pathSegments.length === 0) {
    return 'Ludoxel Docs';
  }

  const firstPage = pages[0];

  if (pathSegments.length === 1) {
    return firstPage.category;
  }

  if (pathSegments.length === 2) {
    return firstPage.subcategory;
  }

  return firstPage.group;
}

function descriptionForCollection(pathSegments: string[], pages: DocsPageContent[]): string {
  if (pathSegments.length === 0) {
    return 'Technical Ludoxel documentation for practitioners, researchers, and programming-literate readers.';
  }

  const firstPage = pages[0];

  if (pathSegments.length === 1) {
    return docsCollectionDescriptions[firstPage.category];
  }

  if (pathSegments.length === 2) {
    return `Articles under ${firstPage.category} / ${firstPage.subcategory}.`;
  }

  return `Articles under ${firstPage.category} / ${firstPage.subcategory} / ${firstPage.group}.`;
}

export function getDocsPage(path: string | undefined): DocsPageContent | undefined {
  const requestedPath = normalizeDocsPath(path);

  if (requestedPath.length === 0) {
    return undefined;
  }

  return docsPages.find((page) => getDocsPagePath(page) === requestedPath);
}

export function getDocsCollection(path: string | undefined): DocsCollection | undefined {
  const pathSegments = splitDocsPath(path);

  if (pathSegments.length > 3) {
    return undefined;
  }

  const pages = docsPages.filter((page) => matchesPathPrefix(page, pathSegments));

  if (pages.length === 0) {
    return undefined;
  }

  return {
    title: titleForCollection(pathSegments, pages),
    description: descriptionForCollection(pathSegments, pages),
    pathSegments,
    pages,
  };
}

export function getDocsCollectionHref(pathSegments: string[]): string {
  return getDocsHrefFromSegments(pathSegments);
}

export function getDocsBreadcrumbs(page: DocsPageContent): DocsBreadcrumb[] {
  return [
    {
      label: 'Docs',
      href: '/docs',
    },
    {
      label: page.category,
      href: getDocsCollectionHref(page.pathSegments.slice(0, 1)),
    },
    {
      label: page.subcategory,
      href: getDocsCollectionHref(page.pathSegments.slice(0, 2)),
    },
    {
      label: page.group,
      href: getDocsCollectionHref(page.pathSegments.slice(0, 3)),
    },
    {
      label: page.title,
      href: getDocsPageHref(page),
    },
  ];
}

export function getDocsCollectionBreadcrumbs(collection: DocsCollection): DocsBreadcrumb[] {
  const breadcrumbs: DocsBreadcrumb[] = [
    {
      label: 'Docs',
      href: '/docs',
    },
  ];

  if (collection.pathSegments.length === 0) {
    return breadcrumbs;
  }

  const firstPage = collection.pages[0];

  breadcrumbs.push({
    label: firstPage.category,
    href: getDocsCollectionHref(firstPage.pathSegments.slice(0, 1)),
  });

  if (collection.pathSegments.length >= 2) {
    breadcrumbs.push({
      label: firstPage.subcategory,
      href: getDocsCollectionHref(firstPage.pathSegments.slice(0, 2)),
    });
  }

  if (collection.pathSegments.length >= 3) {
    breadcrumbs.push({
      label: firstPage.group,
      href: getDocsCollectionHref(firstPage.pathSegments.slice(0, 3)),
    });
  }

  return breadcrumbs;
}

export function getOnThisPage(page: DocsPageContent): { label: string; href: string }[] {
  const sectionLinks = page.sections.map((section) => ({
    label: section.title,
    href: `#${section.id}`,
  }));

  if (!page.references || page.references.length === 0) {
    return sectionLinks;
  }

  return [
    ...sectionLinks,
    {
      label: 'See also',
      href: '#see-also',
    },
  ];
}
