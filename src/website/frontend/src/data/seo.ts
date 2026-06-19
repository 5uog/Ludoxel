/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type SeoStructuredDataType = 'WebPage' | 'TechArticle' | 'CollectionPage';

export type SeoMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  structuredDataType: SeoStructuredDataType;
};

export const siteOrigin = 'https://ludoxel.vercel.app';

const siteTitle = 'Ludoxel';
const technicalAudience = 'practitioners, researchers, and programming-literate readers';
const homeTitle = 'Ludoxel - Technical Voxel Sandbox Documentation';
const homeDescription =
  'Technical Ludoxel documentation for practitioners and programming-literate readers covering renderer behavior, AI NPC systems, Othello rules, settings, distribution boundaries, and legal material scope.';

function trimTrailingSlash(pathname: string): string {
  if (pathname === '/') {
    return pathname;
  }

  return pathname.replace(/\/+$/g, '');
}

function normalizePathname(pathname: string): string {
  const cleanPathname = trimTrailingSlash(pathname);

  if (cleanPathname.length === 0) {
    return '/';
  }

  return cleanPathname.startsWith('/') ? cleanPathname : `/${cleanPathname}`;
}

function splitDocsPath(pathname: string): string[] {
  const cleanPathname = normalizePathname(pathname);

  if (cleanPathname === '/docs') {
    return [];
  }

  if (!cleanPathname.startsWith('/docs/')) {
    return [];
  }

  return cleanPathname.slice('/docs/'.length).split('/').filter(Boolean);
}

function titleCaseSegment(segment: string): string {
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function docsTitleFromSegments(pathSegments: string[]): string {
  if (pathSegments.length === 0) {
    return `Docs - ${siteTitle}`;
  }

  return `${titleCaseSegment(pathSegments[pathSegments.length - 1])} - ${siteTitle} Docs`;
}

function docsDescriptionFromSegments(pathSegments: string[]): string {
  if (pathSegments.length === 0) {
    return `Technical Ludoxel documentation for ${technicalAudience}.`;
  }

  const topic = titleCaseSegment(pathSegments[pathSegments.length - 1]);

  return `Technical Ludoxel documentation about ${topic} for ${technicalAudience}.`;
}

function docsStructuredDataType(pathSegments: string[]): SeoStructuredDataType {
  return pathSegments.length >= 4 ? 'TechArticle' : 'CollectionPage';
}

export function toCanonicalUrl(pathname: string): string {
  const cleanPathname = normalizePathname(pathname);

  if (cleanPathname === '/') {
    return `${siteOrigin}/`;
  }

  return `${siteOrigin}${cleanPathname}`;
}

export function getSeoMetadata(pathname: string): SeoMetadata {
  const cleanPathname = normalizePathname(pathname);

  if (cleanPathname === '/changelog') {
    return {
      title: `Changelog - ${siteTitle}`,
      description: 'Technical change records for the Ludoxel website and documentation surface.',
      canonicalPath: '/changelog',
      structuredDataType: 'WebPage',
    };
  }

  if (cleanPathname === '/docs' || cleanPathname.startsWith('/docs/')) {
    const docsPathSegments = splitDocsPath(cleanPathname);

    return {
      title: docsTitleFromSegments(docsPathSegments),
      description: docsDescriptionFromSegments(docsPathSegments),
      canonicalPath: cleanPathname,
      structuredDataType: docsStructuredDataType(docsPathSegments),
    };
  }

  return {
    title: homeTitle,
    description: homeDescription,
    canonicalPath: '/',
    structuredDataType: 'WebPage',
  };
}

export function buildStructuredData(metadata: SeoMetadata): Record<string, unknown> {
  const canonicalUrl = toCanonicalUrl(metadata.canonicalPath);

  return {
    '@context': 'https://schema.org',
    '@type': metadata.structuredDataType,
    name: metadata.title,
    description: metadata.description,
    url: canonicalUrl,
    inLanguage: 'en',
    audience: {
      '@type': 'Audience',
      audienceType: 'Practitioners, researchers, and programming-literate readers',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: siteTitle,
      url: `${siteOrigin}/`,
    },
  };
}
