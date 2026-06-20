/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const docsSearchSections = ['Manual', 'Gameplay', 'Systems', 'Settings', 'Data', 'Distribution', 'Legal', 'Support'] as const;

export type DocsSearchSection = (typeof docsSearchSections)[number];

export type DocsReference = {
  title: string;
  href: string;
  description: string;
};

export const docsKnownCodeBlockLanguages = [
  'bat',
  'c',
  'cmd',
  'conf',
  'cpp',
  'cs',
  'css',
  'diff',
  'dockerfile',
  'env',
  'frag',
  'gitignore',
  'glsl',
  'go',
  'graphql',
  'h',
  'hpp',
  'html',
  'ini',
  'java',
  'js',
  'json',
  'jsonc',
  'jsx',
  'kt',
  'lua',
  'makefile',
  'md',
  'ps1',
  'py',
  'qss',
  'r',
  'rb',
  'rs',
  'rust',
  'scss',
  'sh',
  'sql',
  'swift',
  'toml',
  'ts',
  'tsx',
  'txt',
  'vert',
  'wgsl',
  'xml',
  'yaml',
  'yml',
] as const;

export type DocsKnownCodeBlockLanguage = (typeof docsKnownCodeBlockLanguages)[number];

export type DocsCodeBlockLanguage = DocsKnownCodeBlockLanguage | (string & {});

export type DocsSingleCodeBlock = {
  language: DocsCodeBlockLanguage;
  code: string;
  caption?: string;
};

export type DocsTabbedCodeBlockTab = {
  label: string;
  language: DocsCodeBlockLanguage;
  code: string;
};

export type DocsTabbedCodeBlock = {
  caption?: string;
  tabs: DocsTabbedCodeBlockTab[];
  defaultTabIndex?: number;
};

export type DocsCodeBlock = DocsSingleCodeBlock | DocsTabbedCodeBlock;

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

export type DocsInlineTextLink = {
  kind: 'link';
  label: string;
  href: string;
};

export type DocsInlineTextPart = string | DocsInlineTextLink;

export type DocsInlineText = string | DocsInlineTextPart[];

export type DocsNoteBlockType = 'note' | 'info' | 'warning';

export type DocsNoteBlockLink = DocsInlineTextLink;

export type DocsNoteBlockContentPart = DocsInlineTextPart;

export type DocsNoteBlock = {
  type: DocsNoteBlockType;
  content: DocsNoteBlockContentPart | DocsNoteBlockContentPart[];
};

export type DocsParagraphBlock = {
  kind: 'paragraph';
  text: DocsInlineText;
};

export type DocsListBlock = {
  kind: 'list';
  items: DocsInlineText[];
  ordered?: boolean;
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

export type DocsNoteContentBlock = {
  kind: 'note';
  note: DocsNoteBlock;
};

export type DocsStepItem = {
  id?: string;
  title: DocsInlineText;
  content: DocsArticleContentBlock[];
};

export type DocsStepsBlock = {
  kind: 'steps';
  steps: DocsStepItem[];
};

export type DocsArticleContentBlock = DocsParagraphBlock | DocsListBlock | DocsCodeContentBlock | DocsMediaContentBlock | DocsMathContentBlock | DocsNoteContentBlock | DocsStepsBlock;

export type DocsSection = {
  id: string;
  title: string;
  body?: DocsInlineText[];
  items?: DocsInlineText[];
  codeBlocks?: DocsCodeBlock[];
  mediaBlocks?: DocsMediaBlock[];
  mathBlocks?: DocsMathBlock[];
  noteBlocks?: DocsNoteBlock[];
  content?: DocsArticleContentBlock[];
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
