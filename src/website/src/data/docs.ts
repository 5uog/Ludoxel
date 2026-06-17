/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsPages } from './docs/index';
import { docsSearchSections, getDocsHrefFromSegments, type DocsPageContent, type DocsSearchSection } from './docs/types';

export type { DocsPageContent, DocsReference, DocsSearchSection, DocsSection } from './docs/types';

export { docsPages, docsSearchSections };

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
  Manual: 'User-facing guides for starting Ludoxel, reading the window, controlling the player, and using everyday overlays.',
  Gameplay: 'Gameplay guides for My World, AI NPC interaction, and Othello match play.',
  Systems: 'Runtime, rendering, audio, input, AI, learning, and Othello system documentation.',
  Settings: 'Guides for camera, crosshair, cloud, shadow, audio, keybind, player, AI, and Othello settings.',
  Data: 'Local user data, saved state, generated learning data, output, and material-boundary documentation.',
  Distribution: 'Desktop package, build, check, license-inclusion, and release-boundary documentation.',
  Legal: 'License authority, material scope, use restrictions, and repository-governance documentation.',
  Support: 'Problem report, limited question, security contact, and unsupported-request documentation.',
  Developer: 'Repository boundary, documentation source, tooling, GitHub policy, and authorized-operation documentation.',
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
    return 'Browse the Ludoxel documentation categories and open the article placeholders that still need full body text.';
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

export function getDocsPagePath(page: DocsPageContent): string {
  return page.pathSegments.join('/');
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

export function getDocsPageHref(page: DocsPageContent): string {
  return getDocsHrefFromSegments(page.pathSegments);
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
