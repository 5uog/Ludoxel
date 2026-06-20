/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { docsPages, getDocsPageHref } from './articles';
import {
  type DocsArticleContentBlock,
  type DocsCodeBlock,
  type DocsInlineText,
  type DocsInlineTextPart,
  type DocsMediaBlock,
  type DocsNoteBlock,
  type DocsPageContent,
  type DocsSection,
} from './types';

export type SearchIndexRecommendation = {
  title: string;
  href: string;
  reason: string;
};

export type SearchIndexSemanticFields = {
  category: string;
  subcategory: string;
  group: string;
  slug: string;
  path: string;
  headings: string[];
  anchors: string[];
  body: string;
  code: string;
  media: string;
  keywords: string[];
  aliases: string[];
  intentIds: string[];
  text: string;
};

export type SearchIndexEntry = {
  title: string;
  description: string;
  href: string;
  section: string;
  semantic: SearchIndexSemanticFields;
  recommendations: SearchIndexRecommendation[];
};

type SearchContentFragments = {
  body: string[];
  code: string[];
  media: string[];
};

const SEARCH_KEYWORD_STOP_WORDS = new Set([
  'about',
  'after',
  'also',
  'and',
  'are',
  'because',
  'before',
  'between',
  'does',
  'for',
  'from',
  'how',
  'into',
  'its',
  'only',
  'that',
  'the',
  'this',
  'through',
  'under',
  'when',
  'where',
  'which',
  'with',
]);

const CATEGORY_ALIASES: Record<string, string[]> = {
  Manual: ['guide', 'how to', 'operation', 'starting', 'usage', 'user manual', 'manual', '使い方', '操作'],
  Gameplay: ['play', 'game rules', 'mechanics', 'interaction', 'player behavior', 'ゲームプレイ', 'ルール'],
  Systems: ['architecture', 'runtime', 'pipeline', 'renderer', 'simulation', 'subsystem', 'system design', '設計', '実装'],
  Settings: ['configuration', 'preferences', 'options', 'controls', 'toggles', 'sliders', '設定', '環境設定'],
  Data: ['schema', 'state', 'persistence', 'serialization', 'runtime data', 'storage', 'データ', '保存'],
  Distribution: ['build', 'package', 'deployment', 'release', 'vercel', 'desktop bundle', '配布', 'ビルド'],
  Legal: ['license', 'copyright', 'permission', 'rights', 'terms', 'law', 'legal boundary', '法務', '著作権'],
  Support: ['help', 'contact', 'feedback', 'issue', 'problem report', 'security report', 'サポート', '問い合わせ'],
};

const TEXT_ALIAS_RULES: { terms: string[]; aliases: string[]; intents: string[] }[] = [
  {
    terms: ['ai', 'npc', 'learning', 'policy', 'training'],
    aliases: ['bot', 'agent', 'computer player', 'enemy', 'opponent', '人工知能', 'npc'],
    intents: ['ai', 'gameplay', 'runtime-data'],
  },
  {
    terms: ['renderer', 'rendering', 'opengl', 'wgpu', 'shader', 'viewport', 'camera', 'shadow', 'fog'],
    aliases: ['graphics', 'graphics pipeline', 'frame pipeline', 'draw path', '描画', 'シェーダー'],
    intents: ['renderer', 'architecture', 'diagnose'],
  },
  {
    terms: ['othello', 'reversi', 'board', 'disc', 'opening book', 'bitboard'],
    aliases: ['board game', 'reversi mode', 'オセロ', 'リバーシ'],
    intents: ['othello', 'gameplay'],
  },
  {
    terms: ['settings', 'preferences', 'option', 'toggle', 'slider', 'keybind', 'shortcut'],
    aliases: ['configuration', 'config', 'controls', '設定', '環境設定'],
    intents: ['settings', 'configure'],
  },
  {
    terms: ['block', 'voxel', 'chunk', 'collision', 'placement', 'inventory', 'hotbar'],
    aliases: ['world interaction', 'block placing', 'block breaking', 'ブロック', 'チャンク'],
    intents: ['blocks', 'gameplay'],
  },
  {
    terms: ['license', 'copyright', 'permission', 'redistribution', 'third-party', 'jurisdiction'],
    aliases: ['legal authority', 'material scope', 'rights boundary', '法務', '著作権', '許諾'],
    intents: ['legal', 'legal-boundary'],
  },
  {
    terms: ['build', 'package', 'distribution', 'deployment', 'vercel', 'release'],
    aliases: ['deploy', 'packaging', 'desktop bundle', '配布', 'ビルド', 'デプロイ'],
    intents: ['distribution', 'operate'],
  },
  {
    terms: ['feedback', 'issue', 'support', 'security', 'contact', 'problem'],
    aliases: ['help', 'report', 'vulnerability report', '問い合わせ', '報告'],
    intents: ['support', 'operate', 'diagnose'],
  },
];

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function compactText(values: string[]): string {
  return values
    .map((value) => value.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');
}

function keywordSource(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveKeywords(values: string[]): string[] {
  return uniqueValues(
    keywordSource(values.join(' '))
      .split(' ')
      .filter((token) => token.length >= 3)
      .filter((token) => !SEARCH_KEYWORD_STOP_WORDS.has(token)),
  ).slice(0, 96);
}

function readInlineTextPart(part: DocsInlineTextPart): string {
  if (typeof part === 'string') {
    return part;
  }

  return `${part.label} ${part.href}`;
}

function readInlineText(value: DocsInlineText | undefined): string {
  if (value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.map(readInlineTextPart).join(' ');
}

function readNoteBlock(note: DocsNoteBlock): string {
  return Array.isArray(note.content) ? note.content.map(readInlineTextPart).join(' ') : readInlineTextPart(note.content);
}

function readCodeBlock(codeBlock: DocsCodeBlock): string {
  if ('tabs' in codeBlock) {
    return compactText([codeBlock.caption ?? '', ...codeBlock.tabs.map((tab) => compactText([tab.label, tab.language, tab.code]))]);
  }

  return compactText([codeBlock.caption ?? '', codeBlock.language, codeBlock.code]);
}

function readMediaBlock(media: DocsMediaBlock): string {
  if (media.kind === 'image') {
    return compactText([media.alt, media.caption ?? '', media.src]);
  }

  return compactText([media.caption ?? '', media.poster ?? '', ...media.sources.map((source) => compactText([source.type, source.src]))]);
}

function mergeFragments(left: SearchContentFragments, right: SearchContentFragments): SearchContentFragments {
  return {
    body: [...left.body, ...right.body],
    code: [...left.code, ...right.code],
    media: [...left.media, ...right.media],
  };
}

function readContentBlock(block: DocsArticleContentBlock): SearchContentFragments {
  if (block.kind === 'paragraph') {
    return {
      body: [readInlineText(block.text)],
      code: [],
      media: [],
    };
  }

  if (block.kind === 'list') {
    return {
      body: block.items.map(readInlineText),
      code: [],
      media: [],
    };
  }

  if (block.kind === 'code') {
    return {
      body: [],
      code: [readCodeBlock(block)],
      media: [],
    };
  }

  if (block.kind === 'media') {
    return {
      body: [],
      code: [],
      media: [readMediaBlock(block.media)],
    };
  }

  if (block.kind === 'math') {
    return {
      body: [compactText([block.math.expression, block.math.caption ?? ''])],
      code: [],
      media: [],
    };
  }

  if (block.kind === 'note') {
    return {
      body: [readNoteBlock(block.note)],
      code: [],
      media: [],
    };
  }

  return block.steps.reduce<SearchContentFragments>(
    (fragments, step) =>
      mergeFragments(
        fragments,
        step.content.reduce<SearchContentFragments>((stepFragments, contentBlock) => mergeFragments(stepFragments, readContentBlock(contentBlock)), {
          body: [readInlineText(step.title)],
          code: [],
          media: [],
        }),
      ),
    {
      body: [],
      code: [],
      media: [],
    },
  );
}

function readSectionFragments(section: DocsSection): SearchContentFragments {
  const contentFragments = (section.content ?? []).reduce<SearchContentFragments>((fragments, block) => mergeFragments(fragments, readContentBlock(block)), {
    body: [],
    code: [],
    media: [],
  });

  return mergeFragments(contentFragments, {
    body: [
      ...(section.body ?? []).map(readInlineText),
      ...(section.items ?? []).map(readInlineText),
      ...(section.mathBlocks ?? []).map((math) => compactText([math.expression, math.caption ?? ''])),
      ...(section.noteBlocks ?? []).map(readNoteBlock),
    ],
    code: (section.codeBlocks ?? []).map(readCodeBlock),
    media: (section.mediaBlocks ?? []).map(readMediaBlock),
  });
}

function createAliases(page: DocsPageContent, corpusText: string): string[] {
  const aliases = new Set<string>(CATEGORY_ALIASES[page.category] ?? []);

  aliases.add(page.category);
  aliases.add(page.subcategory);
  aliases.add(page.group);
  aliases.add(page.navigationTitle);

  const searchableCorpus = keywordSource(corpusText);

  for (const rule of TEXT_ALIAS_RULES) {
    if (rule.terms.some((term) => searchableCorpus.includes(keywordSource(term)))) {
      for (const alias of rule.aliases) {
        aliases.add(alias);
      }
    }
  }

  return uniqueValues([...aliases]);
}

function createIntentIds(page: DocsPageContent, corpusText: string): string[] {
  const intentIds = new Set<string>([page.category.toLowerCase()]);

  const searchableCorpus = keywordSource(corpusText);

  for (const rule of TEXT_ALIAS_RULES) {
    if (rule.terms.some((term) => searchableCorpus.includes(keywordSource(term)))) {
      for (const intent of rule.intents) {
        intentIds.add(intent);
      }
    }
  }

  return uniqueValues([...intentIds]);
}

function createRecommendations(page: DocsPageContent): SearchIndexRecommendation[] {
  return (page.references ?? []).slice(0, 5).map((reference) => ({
    title: reference.title,
    href: reference.href,
    reason: reference.description || 'Related article.',
  }));
}

export function createDocsSearchEntries(pages: DocsPageContent[]): SearchIndexEntry[] {
  return pages.map((page) => {
    const sectionFragments = page.sections.map(readSectionFragments);
    const headings = page.sections.map((section) => section.title);
    const anchors = page.sections.map((section) => section.id);
    const body = compactText(sectionFragments.flatMap((fragments) => fragments.body));
    const code = compactText(sectionFragments.flatMap((fragments) => fragments.code));
    const media = compactText(sectionFragments.flatMap((fragments) => fragments.media));
    const path = page.pathSegments.join('/');

    const corpusText = compactText([page.title, page.navigationTitle, page.description, page.category, page.subcategory, page.group, page.searchSection, path, ...headings, body, code, media]);

    const semantic: SearchIndexSemanticFields = {
      category: page.category,
      subcategory: page.subcategory,
      group: page.group,
      slug: page.slug,
      path,
      headings,
      anchors,
      body,
      code,
      media,
      keywords: deriveKeywords([corpusText]),
      aliases: createAliases(page, corpusText),
      intentIds: createIntentIds(page, corpusText),
      text: corpusText,
    };

    return {
      title: page.title,
      description: page.description,
      href: getDocsPageHref(page),
      section: page.searchSection,
      semantic,
      recommendations: createRecommendations(page),
    };
  });
}

export const searchIndex: SearchIndexEntry[] = createDocsSearchEntries(docsPages);
