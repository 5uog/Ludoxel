/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type SearchIndexEntry } from '../../../data/docs/search';
import { type SearchMatchQuality, type SearchRow } from '../types/searchCommand.types';

type SearchConcept = {
  id: string;
  label: string;
  terms: string[];
  categoryHints?: string[];
  intentHints?: string[];
};

type SearchPreparedQuery = {
  raw: string;
  normalized: string;
  tokens: string[];
  expandedTokens: string[];
  exactPhrases: string[];
  conceptLabels: string[];
  categoryHints: string[];
  intentIds: string[];
};

type SearchSignal = {
  label: string;
  score: number;
  quality: SearchMatchQuality;
};

const SEARCH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'can',
  'for',
  'from',
  'how',
  'i',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'use',
  'using',
  'what',
  'when',
  'where',
  'why',
  'with',
]);

const SEARCH_CONCEPTS: SearchConcept[] = [
  {
    id: 'ai',
    label: 'AI NPC behavior',
    terms: ['ai', 'npc', 'bot', 'agent', 'computer player', 'enemy', 'opponent', 'learning', 'policy', 'training', 'ai player', '人工知能', '敵', 'npc'],
    categoryHints: ['gameplay', 'systems', 'settings', 'data'],
    intentHints: ['gameplay', 'configure', 'runtime-data'],
  },
  {
    id: 'renderer',
    label: 'Renderer and graphics pipeline',
    terms: ['renderer', 'rendering', 'graphics', 'opengl', 'wgpu', 'webgpu', 'metal', 'shader', 'fog', 'shadow', 'camera', 'viewport', 'frame', '描画', '影', 'シェーダー'],
    categoryHints: ['systems', 'settings', 'data'],
    intentHints: ['architecture', 'configure', 'diagnose'],
  },
  {
    id: 'othello',
    label: 'Othello mode',
    terms: ['othello', 'reversi', 'board', 'disc', 'opening book', 'book', 'move ordering', 'bitboard', 'オセロ', 'リバーシ', '盤面'],
    categoryHints: ['manual', 'gameplay', 'systems', 'data'],
    intentHints: ['gameplay', 'architecture', 'runtime-data'],
  },
  {
    id: 'settings',
    label: 'Settings and preferences',
    terms: ['settings', 'preferences', 'configuration', 'config', 'option', 'toggle', 'slider', 'control', 'keybind', 'shortcut', '設定', '環境設定', 'オプション'],
    categoryHints: ['settings', 'manual'],
    intentHints: ['configure'],
  },
  {
    id: 'blocks',
    label: 'Blocks, voxels, and world interaction',
    terms: ['block', 'blocks', 'voxel', 'chunk', 'collision', 'placement', 'placing', 'break', 'breaking', 'inventory', 'hotbar', 'item', 'world', 'ブロック', 'チャンク', '衝突'],
    categoryHints: ['manual', 'gameplay', 'systems', 'data'],
    intentHints: ['gameplay', 'architecture', 'runtime-data'],
  },
  {
    id: 'distribution',
    label: 'Build, package, and deployment',
    terms: ['build', 'package', 'packaging', 'distribution', 'deploy', 'deployment', 'release', 'vercel', 'desktop', 'installer', 'bundle', '配布', 'ビルド', 'デプロイ'],
    categoryHints: ['distribution', 'legal', 'support'],
    intentHints: ['operate', 'legal-boundary'],
  },
  {
    id: 'legal',
    label: 'Legal authority and material scope',
    terms: [
      'legal',
      'license',
      'licence',
      'copyright',
      'permission',
      'reuse',
      'redistribution',
      'rights',
      'terms',
      'third party',
      'attribution',
      'jurisdiction',
      '法務',
      '著作権',
      '許諾',
      'ライセンス',
    ],
    categoryHints: ['legal', 'distribution', 'support'],
    intentHints: ['legal-boundary'],
  },
  {
    id: 'support',
    label: 'Support, feedback, and security reporting',
    terms: ['support', 'feedback', 'contact', 'issue', 'problem', 'bug', 'security', 'report', 'vulnerability', 'help', '問い合わせ', '報告', 'サポート'],
    categoryHints: ['support', 'legal', 'distribution'],
    intentHints: ['operate', 'diagnose'],
  },
  {
    id: 'search',
    label: 'Documentation discovery',
    terms: ['search', 'find', 'documentation', 'docs', 'article', 'guide', 'reference', '検索', '文書', '記事'],
    categoryHints: ['manual', 'support'],
    intentHints: ['learn'],
  },
  {
    id: 'persistence',
    label: 'Runtime state and saved data',
    terms: ['save', 'saved', 'state', 'storage', 'persistence', 'runtime data', 'json', 'manifest', 'integrity', '保存', '永続化', '状態'],
    categoryHints: ['systems', 'settings', 'data'],
    intentHints: ['runtime-data', 'architecture'],
  },
];

export function normalizeSearchText(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9一-龯ぁ-んァ-ンー]+/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function tokenizeSearchText(value: string): string[] {
  return uniqueValues(
    normalizeSearchText(value)
      .split(' ')
      .filter((token) => token.length >= 2)
      .filter((token) => !SEARCH_STOP_WORDS.has(token)),
  );
}

function conceptMatchesQuery(concept: SearchConcept, normalizedQuery: string, queryTokens: string[]): boolean {
  const queryTokenSet = new Set(queryTokens);

  return concept.terms.some((term) => {
    const normalizedTerm = normalizeSearchText(term);
    const termTokens = tokenizeSearchText(normalizedTerm);

    if (termTokens.length <= 1) {
      return queryTokenSet.has(normalizedTerm);
    }

    return normalizedQuery.includes(normalizedTerm) || termTokens.some((token) => queryTokenSet.has(token));
  });
}

function prepareSearchQuery(rawQuery: string): SearchPreparedQuery {
  const normalized = normalizeSearchText(rawQuery);
  const tokens = tokenizeSearchText(normalized);
  const concepts = SEARCH_CONCEPTS.filter((concept) => conceptMatchesQuery(concept, normalized, tokens));

  const expandedTokens = uniqueValues([
    ...tokens,
    ...concepts.flatMap((concept) => concept.terms.flatMap((term) => tokenizeSearchText(term))),
    ...concepts.flatMap((concept) => concept.intentHints ?? []),
    ...concepts.flatMap((concept) => concept.categoryHints ?? []),
  ]);

  const exactPhrases = uniqueValues([normalized, ...concepts.flatMap((concept) => concept.terms.map(normalizeSearchText)), ...concepts.map((concept) => normalizeSearchText(concept.label))]).filter(
    (phrase) => phrase.length >= 3,
  );

  return {
    raw: rawQuery,
    normalized,
    tokens,
    expandedTokens,
    exactPhrases,
    conceptLabels: concepts.map((concept) => concept.label),
    categoryHints: uniqueValues(concepts.flatMap((concept) => concept.categoryHints ?? []).map(normalizeSearchText)),
    intentIds: uniqueValues(concepts.flatMap((concept) => [concept.id, ...(concept.intentHints ?? [])]).map(normalizeSearchText)),
  };
}

function addSignal(signals: SearchSignal[], label: string, score: number, quality: SearchMatchQuality): number {
  if (score <= 0) {
    return 0;
  }

  signals.push({
    label,
    score,
    quality,
  });

  return score;
}

function scorePhraseMatch(
  text: string,
  preparedQuery: SearchPreparedQuery,
  phraseWeight: number,
  label: string,
  quality: SearchMatchQuality,
  signals: SearchSignal[],
  matchedTerms: Set<string>,
): number {
  if (!text) {
    return 0;
  }

  const normalizedText = normalizeSearchText(text);
  let score = 0;

  if (preparedQuery.normalized.length >= 3 && normalizedText === preparedQuery.normalized) {
    matchedTerms.add(preparedQuery.normalized);
    score += addSignal(signals, `Exact ${label}`, phraseWeight * 1.8, quality);
  }

  if ((preparedQuery.normalized.length >= 3 || preparedQuery.normalized.includes(' ')) && normalizedText.includes(preparedQuery.normalized)) {
    matchedTerms.add(preparedQuery.normalized);
    score += addSignal(signals, `${label} phrase`, phraseWeight, quality);
  }

  for (const phrase of preparedQuery.exactPhrases) {
    if (phrase === preparedQuery.normalized) {
      continue;
    }

    if (phrase.length >= 3 && normalizedText.includes(phrase)) {
      matchedTerms.add(phrase);
      score += addSignal(signals, `${label} concept`, phraseWeight * 0.45, quality);
    }
  }

  return score;
}

function scoreTokenMatch(
  text: string,
  preparedQuery: SearchPreparedQuery,
  tokenWeight: number,
  label: string,
  quality: SearchMatchQuality,
  signals: SearchSignal[],
  matchedTerms: Set<string>,
): number {
  if (!text) {
    return 0;
  }

  const normalizedText = normalizeSearchText(text);
  const textTokens = new Set(tokenizeSearchText(normalizedText));
  let score = 0;

  for (const token of preparedQuery.expandedTokens) {
    if (token.length < 2) {
      continue;
    }

    if (textTokens.has(token)) {
      matchedTerms.add(token);
      score += addSignal(signals, `${label} token`, tokenWeight, quality);
      continue;
    }

    if (token.length >= 3 && normalizedText.includes(token)) {
      matchedTerms.add(token);
      score += addSignal(signals, `${label} partial`, tokenWeight * 0.65, quality);
    }
  }

  return score;
}

function scoreTextField(
  text: string,
  preparedQuery: SearchPreparedQuery,
  options: {
    label: string;
    phraseWeight: number;
    tokenWeight: number;
    quality: SearchMatchQuality;
  },
  signals: SearchSignal[],
  matchedTerms: Set<string>,
): number {
  return (
    scorePhraseMatch(text, preparedQuery, options.phraseWeight, options.label, options.quality, signals, matchedTerms) +
    scoreTokenMatch(text, preparedQuery, options.tokenWeight, options.label, options.quality, signals, matchedTerms)
  );
}

function scoreListField(
  values: string[],
  preparedQuery: SearchPreparedQuery,
  options: {
    label: string;
    phraseWeight: number;
    tokenWeight: number;
    quality: SearchMatchQuality;
  },
  signals: SearchSignal[],
  matchedTerms: Set<string>,
): number {
  return values.reduce((total, value) => total + scoreTextField(value, preparedQuery, options, signals, matchedTerms), 0);
}

function scoreIntentMatch(entry: SearchIndexEntry, preparedQuery: SearchPreparedQuery, signals: SearchSignal[], matchedTerms: Set<string>): number {
  const entryIntentIds = new Set(entry.semantic.intentIds.map(normalizeSearchText));
  const entryCategory = normalizeSearchText(entry.section);
  let score = 0;

  for (const intentId of preparedQuery.intentIds) {
    if (entryIntentIds.has(intentId)) {
      matchedTerms.add(intentId);
      score += addSignal(signals, 'Intent match', 95, 'semantic');
    }
  }

  for (const categoryHint of preparedQuery.categoryHints) {
    if (entryCategory === categoryHint) {
      matchedTerms.add(categoryHint);
      score += addSignal(signals, 'Category recommendation', 70, 'recommended');
    }
  }

  return score;
}

function scoreRecommendationMatch(entry: SearchIndexEntry, preparedQuery: SearchPreparedQuery, signals: SearchSignal[], matchedTerms: Set<string>): number {
  const recommendationText = entry.recommendations.map((recommendation) => `${recommendation.title} ${recommendation.reason}`).join(' ');
  return scoreTextField(
    recommendationText,
    preparedQuery,
    {
      label: 'Related article',
      phraseWeight: 55,
      tokenWeight: 16,
      quality: 'recommended',
    },
    signals,
    matchedTerms,
  );
}

function diceCoefficient(left: string, right: string): number {
  if (left === right) {
    return 1;
  }

  if (left.length < 3 || right.length < 3) {
    return 0;
  }

  const leftPairs = new Map<string, number>();
  for (let index = 0; index < left.length - 1; index += 1) {
    const pair = left.slice(index, index + 2);
    leftPairs.set(pair, (leftPairs.get(pair) ?? 0) + 1);
  }

  let intersection = 0;
  for (let index = 0; index < right.length - 1; index += 1) {
    const pair = right.slice(index, index + 2);
    const count = leftPairs.get(pair) ?? 0;

    if (count > 0) {
      intersection += 1;
      leftPairs.set(pair, count - 1);
    }
  }

  return (2 * intersection) / (left.length + right.length - 2);
}

function scoreFuzzyMatch(entry: SearchIndexEntry, preparedQuery: SearchPreparedQuery, signals: SearchSignal[], matchedTerms: Set<string>): number {
  const candidateTokens = uniqueValues(
    tokenizeSearchText(
      [
        entry.title,
        entry.description,
        entry.section,
        entry.semantic.category,
        entry.semantic.subcategory,
        entry.semantic.group,
        ...entry.semantic.headings,
        ...entry.semantic.keywords,
        ...entry.semantic.aliases,
      ].join(' '),
    ),
  );

  let score = 0;

  for (const queryToken of preparedQuery.tokens) {
    if (queryToken.length < 4) {
      continue;
    }

    const fuzzyCandidate = candidateTokens.find((candidateToken) => Math.abs(candidateToken.length - queryToken.length) <= 2 && diceCoefficient(candidateToken, queryToken) >= 0.82);

    if (fuzzyCandidate !== undefined) {
      matchedTerms.add(fuzzyCandidate);
      score += addSignal(signals, 'Typo-tolerant match', 28, 'semantic');
    }
  }

  return score;
}

function truncateSearchExcerpt(value: string, preferredTerm: string | undefined, maxLength = 180): string {
  const compact = value.replace(/\s+/g, ' ').trim();

  if (compact.length <= maxLength) {
    return compact;
  }

  if (preferredTerm === undefined || preferredTerm.length < 2) {
    return `${compact.slice(0, maxLength - 1).trim()}…`;
  }

  const lowerCompact = compact.toLowerCase();
  const lowerTerm = preferredTerm.toLowerCase();
  const index = lowerCompact.indexOf(lowerTerm);
  const start = index > 64 ? index - 64 : 0;
  const end = Math.min(compact.length, start + maxLength - 1);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < compact.length ? '…' : '';

  return `${prefix}${compact.slice(start, end).trim()}${suffix}`;
}

function buildSearchExcerpt(entry: SearchIndexEntry, preparedQuery: SearchPreparedQuery, matchedTerms: string[]): string {
  const candidates = [entry.description, ...entry.semantic.headings, entry.semantic.body, entry.semantic.code, entry.semantic.media, entry.semantic.text].filter(
    (candidate) => candidate.trim().length > 0,
  );

  const preferredTerms = uniqueValues([preparedQuery.normalized, ...matchedTerms, ...preparedQuery.tokens]).filter((term) => term.length >= 2);

  for (const preferredTerm of preferredTerms) {
    const matchedCandidate = candidates.find((candidate) => normalizeSearchText(candidate).includes(preferredTerm));

    if (matchedCandidate !== undefined) {
      return truncateSearchExcerpt(matchedCandidate, preferredTerm);
    }
  }

  return truncateSearchExcerpt(entry.description || entry.semantic.text || entry.title, undefined);
}

function selectReason(signals: SearchSignal[], preparedQuery: SearchPreparedQuery): string {
  const bestSignal = [...signals].sort((left, right) => right.score - left.score)[0];

  if (bestSignal === undefined) {
    return 'Recommended article';
  }

  if (bestSignal.label.startsWith('Exact')) {
    return 'Exact article match';
  }

  if (bestSignal.label.includes('concept') || preparedQuery.conceptLabels.length > 0) {
    return preparedQuery.conceptLabels[0] ?? 'Concept match';
  }

  return bestSignal.label;
}

function selectQuality(signals: SearchSignal[]): SearchMatchQuality {
  if (signals.some((signal) => signal.quality === 'direct')) {
    return 'direct';
  }

  if (signals.some((signal) => signal.quality === 'semantic')) {
    return 'semantic';
  }

  return 'recommended';
}

export function rankSearchEntry(entry: SearchIndexEntry, index: number, rawQuery: string): SearchRow | null {
  const preparedQuery = prepareSearchQuery(rawQuery);

  if (preparedQuery.normalized.length < 2) {
    return null;
  }

  const signals: SearchSignal[] = [];
  const matchedTerms = new Set<string>();

  let score = 0;

  score += scoreTextField(
    entry.title,
    preparedQuery,
    {
      label: 'Title',
      phraseWeight: 520,
      tokenWeight: 92,
      quality: 'direct',
    },
    signals,
    matchedTerms,
  );

  score += scoreTextField(
    entry.description,
    preparedQuery,
    {
      label: 'Description',
      phraseWeight: 260,
      tokenWeight: 52,
      quality: 'direct',
    },
    signals,
    matchedTerms,
  );

  score += scoreTextField(
    entry.section,
    preparedQuery,
    {
      label: 'Section',
      phraseWeight: 120,
      tokenWeight: 38,
      quality: 'direct',
    },
    signals,
    matchedTerms,
  );

  score += scoreListField(
    entry.semantic.aliases,
    preparedQuery,
    {
      label: 'Synonym',
      phraseWeight: 220,
      tokenWeight: 64,
      quality: 'semantic',
    },
    signals,
    matchedTerms,
  );

  score += scoreListField(
    entry.semantic.keywords,
    preparedQuery,
    {
      label: 'Keyword',
      phraseWeight: 180,
      tokenWeight: 46,
      quality: 'semantic',
    },
    signals,
    matchedTerms,
  );

  score += scoreListField(
    entry.semantic.headings,
    preparedQuery,
    {
      label: 'Heading',
      phraseWeight: 190,
      tokenWeight: 44,
      quality: 'semantic',
    },
    signals,
    matchedTerms,
  );

  score += scoreTextField(
    entry.semantic.body,
    preparedQuery,
    {
      label: 'Body',
      phraseWeight: 130,
      tokenWeight: 18,
      quality: 'semantic',
    },
    signals,
    matchedTerms,
  );

  score += scoreTextField(
    entry.semantic.code,
    preparedQuery,
    {
      label: 'Code',
      phraseWeight: 95,
      tokenWeight: 16,
      quality: 'semantic',
    },
    signals,
    matchedTerms,
  );

  score += scoreIntentMatch(entry, preparedQuery, signals, matchedTerms);
  score += scoreRecommendationMatch(entry, preparedQuery, signals, matchedTerms);
  score += scoreFuzzyMatch(entry, preparedQuery, signals, matchedTerms);

  if (score <= 0) {
    return null;
  }

  const visibleMatchedTerms = uniqueValues([...matchedTerms])
    .filter((term) => term.length >= 2)
    .slice(0, 6);

  return {
    entry,
    index,
    score,
    quality: selectQuality(signals),
    reason: selectReason(signals, preparedQuery),
    excerpt: buildSearchExcerpt(entry, preparedQuery, visibleMatchedTerms),
    matchedTerms: visibleMatchedTerms,
  };
}
