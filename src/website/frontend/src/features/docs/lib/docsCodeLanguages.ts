/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsCodeBlockLanguage } from '../../../data/docs/types';

export type DocsCodeLanguageFamily =
  | 'plain'
  | 'batch'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'css'
  | 'diff'
  | 'dockerfile'
  | 'go'
  | 'graphql'
  | 'html'
  | 'ini'
  | 'java'
  | 'javascript'
  | 'json'
  | 'kotlin'
  | 'lua'
  | 'makefile'
  | 'markdown'
  | 'php'
  | 'powershell'
  | 'python'
  | 'r'
  | 'ruby'
  | 'rust'
  | 'shader'
  | 'shell'
  | 'sql'
  | 'swift'
  | 'toml'
  | 'wgsl'
  | 'xml'
  | 'yaml';

export type NormalizedDocsCodeLanguage = {
  id: string;
  displayName: string;
  family: DocsCodeLanguageFamily;
  lineCommentPrefixes: readonly string[];
  blockCommentPairs: readonly { open: string; close: string }[];
  propertyDelimiters: readonly string[];
};

type DocsLanguageDefinition = {
  id: string;
  displayName: string;
  family: DocsCodeLanguageFamily;
  aliases: readonly string[];
  lineCommentPrefixes?: readonly string[];
  blockCommentPairs?: readonly { open: string; close: string }[];
  propertyDelimiters?: readonly string[];
};

const C_STYLE_BLOCK_COMMENT = [{ open: '/*', close: '*/' }] as const;

const HTML_BLOCK_COMMENT = [{ open: '<!--', close: '-->' }] as const;

const DEFAULT_LANGUAGE: NormalizedDocsCodeLanguage = {
  id: 'plain',
  displayName: 'Text',
  family: 'plain',
  lineCommentPrefixes: [],
  blockCommentPairs: [],
  propertyDelimiters: [],
};

const LANGUAGE_DEFINITIONS: readonly DocsLanguageDefinition[] = [
  {
    id: 'bat',
    displayName: 'Batch',
    family: 'batch',
    aliases: ['bat', 'batch', 'cmd'],
    lineCommentPrefixes: ['rem ', '::'],
  },
  {
    id: 'c',
    displayName: 'C',
    family: 'c',
    aliases: ['c', 'h'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'cpp',
    displayName: 'C++',
    family: 'cpp',
    aliases: ['cc', 'cpp', 'cxx', 'c++', 'hpp', 'hh', 'hxx'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'cs',
    displayName: 'C#',
    family: 'csharp',
    aliases: ['cs', 'csharp', 'c#'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'css',
    displayName: 'CSS',
    family: 'css',
    aliases: ['css', 'scss', 'sass', 'less', 'qss'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
    propertyDelimiters: [':'],
  },
  {
    id: 'diff',
    displayName: 'Diff',
    family: 'diff',
    aliases: ['diff', 'patch'],
  },
  {
    id: 'dockerfile',
    displayName: 'Dockerfile',
    family: 'dockerfile',
    aliases: ['dockerfile', 'containerfile'],
    lineCommentPrefixes: ['#'],
  },
  {
    id: 'env',
    displayName: 'Env',
    family: 'ini',
    aliases: ['env', 'dotenv', 'conf', 'config', 'cfg', 'ini', 'properties'],
    lineCommentPrefixes: ['#', ';'],
    propertyDelimiters: ['='],
  },
  {
    id: 'go',
    displayName: 'Go',
    family: 'go',
    aliases: ['go', 'golang'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'graphql',
    displayName: 'GraphQL',
    family: 'graphql',
    aliases: ['graphql', 'gql'],
    lineCommentPrefixes: ['#'],
  },
  {
    id: 'html',
    displayName: 'HTML',
    family: 'html',
    aliases: ['html', 'htm'],
    blockCommentPairs: HTML_BLOCK_COMMENT,
  },
  {
    id: 'java',
    displayName: 'Java',
    family: 'java',
    aliases: ['java'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'js',
    displayName: 'JavaScript',
    family: 'javascript',
    aliases: ['js', 'jsx', 'javascript', 'mjs', 'cjs'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'json',
    displayName: 'JSON',
    family: 'json',
    aliases: ['json', 'jsonc'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
    propertyDelimiters: [':'],
  },
  {
    id: 'kt',
    displayName: 'Kotlin',
    family: 'kotlin',
    aliases: ['kt', 'kts', 'kotlin'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'lua',
    displayName: 'Lua',
    family: 'lua',
    aliases: ['lua'],
    lineCommentPrefixes: ['--'],
    blockCommentPairs: [{ open: '--[[', close: ']]' }],
  },
  {
    id: 'makefile',
    displayName: 'Makefile',
    family: 'makefile',
    aliases: ['make', 'makefile', 'mk'],
    lineCommentPrefixes: ['#'],
    propertyDelimiters: [':', '='],
  },
  {
    id: 'md',
    displayName: 'Markdown',
    family: 'markdown',
    aliases: ['md', 'markdown', 'mdx'],
  },
  {
    id: 'php',
    displayName: 'PHP',
    family: 'php',
    aliases: ['php'],
    lineCommentPrefixes: ['//', '#'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'ps1',
    displayName: 'PowerShell',
    family: 'powershell',
    aliases: ['ps1', 'powershell', 'pwsh'],
    lineCommentPrefixes: ['#'],
    blockCommentPairs: [{ open: '<#', close: '#>' }],
  },
  {
    id: 'py',
    displayName: 'Python',
    family: 'python',
    aliases: ['py', 'python', 'pyi', 'pyw'],
    lineCommentPrefixes: ['#'],
  },
  {
    id: 'r',
    displayName: 'R',
    family: 'r',
    aliases: ['r', 'rscript'],
    lineCommentPrefixes: ['#'],
  },
  {
    id: 'rb',
    displayName: 'Ruby',
    family: 'ruby',
    aliases: ['rb', 'ruby'],
    lineCommentPrefixes: ['#'],
  },
  {
    id: 'rs',
    displayName: 'Rust',
    family: 'rust',
    aliases: ['rs', 'rust'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'sh',
    displayName: 'Shell',
    family: 'shell',
    aliases: ['bash', 'command', 'console', 'fish', 'shell', 'sh', 'terminal', 'zsh'],
    lineCommentPrefixes: ['#'],
  },
  {
    id: 'glsl',
    displayName: 'GLSL',
    family: 'shader',
    aliases: ['comp', 'frag', 'fragment', 'glsl', 'tesc', 'tese', 'vert', 'vertex'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'sql',
    displayName: 'SQL',
    family: 'sql',
    aliases: ['sql'],
    lineCommentPrefixes: ['--'],
    blockCommentPairs: [{ open: '/*', close: '*/' }],
  },
  {
    id: 'swift',
    displayName: 'Swift',
    family: 'swift',
    aliases: ['swift'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'toml',
    displayName: 'TOML',
    family: 'toml',
    aliases: ['toml'],
    lineCommentPrefixes: ['#'],
    propertyDelimiters: ['='],
  },
  {
    id: 'ts',
    displayName: 'TypeScript',
    family: 'javascript',
    aliases: ['ts', 'tsx', 'typescript'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'txt',
    displayName: 'Text',
    family: 'plain',
    aliases: ['plain', 'text', 'txt'],
  },
  {
    id: 'wgsl',
    displayName: 'WGSL',
    family: 'wgsl',
    aliases: ['wgsl'],
    lineCommentPrefixes: ['//'],
    blockCommentPairs: C_STYLE_BLOCK_COMMENT,
  },
  {
    id: 'xml',
    displayName: 'XML',
    family: 'xml',
    aliases: ['svg', 'xml'],
    blockCommentPairs: HTML_BLOCK_COMMENT,
  },
  {
    id: 'yaml',
    displayName: 'YAML',
    family: 'yaml',
    aliases: ['yaml', 'yml'],
    lineCommentPrefixes: ['#'],
    propertyDelimiters: [':'],
  },
];

const LANGUAGE_BY_ALIAS = new Map<string, DocsLanguageDefinition>();

for (const definition of LANGUAGE_DEFINITIONS) {
  LANGUAGE_BY_ALIAS.set(definition.id, definition);

  for (const alias of definition.aliases) {
    LANGUAGE_BY_ALIAS.set(alias, definition);
  }
}

function normalizeLanguageKey(language: DocsCodeBlockLanguage): string {
  return language
    .trim()
    .toLowerCase()
    .replace(/^language-/, '')
    .replace(/^\./, '');
}

function formatUnknownLanguageLabel(languageKey: string): string {
  if (languageKey.length === 0) {
    return DEFAULT_LANGUAGE.displayName;
  }

  if (languageKey.length <= 4) {
    return languageKey.toUpperCase();
  }

  return languageKey
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function normalizeDocsCodeLanguage(language: DocsCodeBlockLanguage): NormalizedDocsCodeLanguage {
  const languageKey = normalizeLanguageKey(language);
  const definition = LANGUAGE_BY_ALIAS.get(languageKey);

  if (definition === undefined) {
    return {
      ...DEFAULT_LANGUAGE,
      id: languageKey || DEFAULT_LANGUAGE.id,
      displayName: formatUnknownLanguageLabel(languageKey),
    };
  }

  return {
    id: definition.id,
    displayName: definition.displayName,
    family: definition.family,
    lineCommentPrefixes: definition.lineCommentPrefixes ?? [],
    blockCommentPairs: definition.blockCommentPairs ?? [],
    propertyDelimiters: definition.propertyDelimiters ?? [],
  };
}

export function getDocsCodeLanguageLabel(language: DocsCodeBlockLanguage): string {
  return normalizeDocsCodeLanguage(language).displayName;
}
