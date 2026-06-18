/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const docsSearchSections = ['Manual', 'Gameplay', 'Systems', 'Settings', 'Data', 'Distribution', 'Legal', 'Support', 'Developer'] as const;

export type DocsSearchSection = (typeof docsSearchSections)[number];

export type DocsReference = {
  title: string;
  href: string;
  description: string;
};

export type DocsCodeBlockLanguage = 'py' | 'ts' | 'tsx' | 'json' | 'sh' | 'toml' | 'qss' | 'css' | 'glsl' | 'vert' | 'frag' | 'comp' | 'wgsl';

export type DocsCodeBlock = {
  language: DocsCodeBlockLanguage;
  code: string;
  caption?: string;
};

export type DocsVideoSource = {
  src: string;
  type: string;
};

export type DocsImageMediaBlock = {
  kind: 'image';
  src: string;
  alt: string;
  caption?: string;
  controls?: boolean;
  loop?: boolean;
  poster?: string;
};

export type DocsVideoMediaBlock = {
  kind: 'video';
  sources: DocsVideoSource[];
  caption?: string;
  controls?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
};

export type DocsMediaBlock = DocsImageMediaBlock | DocsVideoMediaBlock;

export type DocsMathBlock = {
  expression: string;
  displayMode?: boolean;
  caption?: string;
};

export type DocsParagraphBlock = {
  kind: 'paragraph';
  text: string;
};

export type DocsListBlock = {
  kind: 'list';
  items: string[];
};

export type DocsCodeContentBlock = DocsCodeBlock & {
  kind: 'code';
};

export type DocsMediaContentBlock = {
  kind: 'media';
  media: DocsMediaBlock;
};

export type DocsMathContentBlock = {
  kind: 'math';
  math: DocsMathBlock;
};

export type DocsArticleContentBlock = DocsParagraphBlock | DocsListBlock | DocsCodeContentBlock | DocsMediaContentBlock | DocsMathContentBlock;

export type DocsSection = {
  id: string;
  title: string;
  body: string[];
  items?: string[];
  codeBlocks?: DocsCodeBlock[];
  mediaBlocks?: DocsMediaBlock[];
  mathBlocks?: DocsMathBlock[];
};

export type DocsPageContent = {
  slug: string;
  pathSegments: string[];
  category: DocsSearchSection;
  subcategory: string;
  group: string;
  navigationTitle: string;
  eyebrow: string;
  title: string;
  description: string;
  searchSection: DocsSearchSection;
  sections: DocsSection[];
  relatedTitles?: string[];
  references?: DocsReference[];
};

export type DefineDocsArticleInput = {
  category: DocsSearchSection;
  subcategory: string;
  group: string;
  title: string;
  description: string;
  sections: DocsSection[];
  relatedTitles?: string[];
};

export function toDocsSlug(value: string): string {
  return value
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getDocsHrefFromSegments(pathSegments: string[]): string {
  if (pathSegments.length === 0) {
    return '/docs';
  }

  return `/docs/${pathSegments.join('/')}`;
}

export function defineDocsArticle(input: DefineDocsArticleInput): DocsPageContent {
  const pathSegments = [input.category, input.subcategory, input.group, input.title].map(toDocsSlug);

  return {
    slug: toDocsSlug(input.title),
    pathSegments,
    category: input.category,
    subcategory: input.subcategory,
    group: input.group,
    navigationTitle: input.title,
    eyebrow: input.category,
    title: input.title,
    description: input.description,
    searchSection: input.category,
    sections: input.sections,
    relatedTitles: input.relatedTitles,
  };
}
