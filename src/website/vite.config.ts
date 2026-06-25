/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { dirname } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

import { docsPages, getDocsPageHref } from './frontend/src/data/docs/articles';
import { getDocsHrefFromSegments } from './frontend/src/data/docs/types';
import { siteOrigin } from './frontend/src/data/seo';

const frontendRoot = fileURLToPath(new URL('./frontend', import.meta.url));
const outputDirectory = fileURLToPath(new URL('./dist', import.meta.url));
const sitemapPublicPath = fileURLToPath(new URL('./frontend/public/sitemap.xml', import.meta.url));
const sitemapOutputPath = fileURLToPath(new URL('./dist/sitemap.xml', import.meta.url));

function toAbsoluteSiteUrl(pathname: string, hash?: string): string {
  const url = new URL(pathname, siteOrigin);

  if (hash !== undefined && hash.length > 0) {
    url.hash = hash;
  }

  return url.toString();
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function addUniqueRoute(routes: string[], seenRoutes: Set<string>, route: string): void {
  if (seenRoutes.has(route)) {
    return;
  }

  seenRoutes.add(route);
  routes.push(route);
}

function collectDocsCollectionRoutes(routes: string[], seenRoutes: Set<string>): void {
  for (const page of docsPages) {
    for (let depth = 1; depth <= 3; depth += 1) {
      addUniqueRoute(routes, seenRoutes, getDocsHrefFromSegments(page.pathSegments.slice(0, depth)));
    }
  }
}

function collectDocsArticleRoutes(routes: string[], seenRoutes: Set<string>): void {
  for (const page of docsPages) {
    const articleHref = getDocsPageHref(page);

    addUniqueRoute(routes, seenRoutes, articleHref);

    for (const section of page.sections) {
      addUniqueRoute(routes, seenRoutes, `${articleHref}#${section.id}`);
    }

    if (page.references && page.references.length > 0) {
      addUniqueRoute(routes, seenRoutes, `${articleHref}#see-also`);
    }
  }
}

function collectSitemapRoutes(): string[] {
  const routes: string[] = [];
  const seenRoutes = new Set<string>();

  addUniqueRoute(routes, seenRoutes, '/');
  addUniqueRoute(routes, seenRoutes, '/docs');
  addUniqueRoute(routes, seenRoutes, '/changelog');

  collectDocsCollectionRoutes(routes, seenRoutes);
  collectDocsArticleRoutes(routes, seenRoutes);

  return routes;
}

function toSitemapLocation(route: string): string {
  const [pathname, hash] = route.split('#', 2);

  return escapeXml(toAbsoluteSiteUrl(pathname, hash));
}

function buildSitemapXml(): string {
  const urls = collectSitemapRoutes()
    .map((route) => `  <url>\n    <loc>${toSitemapLocation(route)}</loc>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function writeGeneratedFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });

  if (existsSync(path) && readFileSync(path, 'utf8') === content) {
    return;
  }

  writeFileSync(path, content, 'utf8');
}

function sitemapPlugin(): Plugin {
  return {
    name: 'ludoxel-sitemap',
    buildStart() {
      writeGeneratedFile(sitemapPublicPath, buildSitemapXml());
    },
    closeBundle() {
      writeGeneratedFile(sitemapOutputPath, buildSitemapXml());
    },
  };
}

export default defineConfig({
  root: frontendRoot,
  plugins: [sitemapPlugin(), react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 3000,
    emptyOutDir: true,
    outDir: outputDirectory,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
});
