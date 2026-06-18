/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsCodeBlockLanguage } from '../../../data/docs/types';

export type DocsHighlightTokenKind = 'plain' | 'comment' | 'keyword' | 'string' | 'number' | 'function' | 'type' | 'property' | 'operator' | 'punctuation';

export type DocsHighlightToken = {
  kind: DocsHighlightTokenKind;
  value: string;
};

const C_STYLE_LANGUAGES = new Set<DocsCodeBlockLanguage>(['ts', 'tsx', 'glsl', 'vert', 'frag', 'comp', 'wgsl']);

const HASH_COMMENT_LANGUAGES = new Set<DocsCodeBlockLanguage>(['py', 'sh', 'toml']);

const LANGUAGE_KEYWORDS: Partial<Record<DocsCodeBlockLanguage, Set<string>>> = {
  py: new Set([
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'False',
    'finally',
    'for',
    'from',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'None',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'True',
    'try',
    'with',
    'yield',
  ]),
  ts: new Set([
    'as',
    'async',
    'await',
    'break',
    'case',
    'catch',
    'const',
    'continue',
    'default',
    'else',
    'export',
    'false',
    'finally',
    'for',
    'from',
    'function',
    'if',
    'import',
    'in',
    'interface',
    'let',
    'new',
    'null',
    'of',
    'return',
    'satisfies',
    'switch',
    'throw',
    'true',
    'try',
    'type',
    'undefined',
  ]),
  tsx: new Set([
    'as',
    'async',
    'await',
    'break',
    'case',
    'catch',
    'const',
    'continue',
    'default',
    'else',
    'export',
    'false',
    'finally',
    'for',
    'from',
    'function',
    'if',
    'import',
    'in',
    'interface',
    'let',
    'new',
    'null',
    'of',
    'return',
    'satisfies',
    'switch',
    'throw',
    'true',
    'try',
    'type',
    'undefined',
  ]),
  json: new Set(['false', 'null', 'true']),
  sh: new Set(['case', 'cd', 'do', 'done', 'elif', 'else', 'esac', 'exit', 'export', 'fi', 'for', 'function', 'if', 'in', 'local', 'read', 'return', 'set', 'shift', 'then', 'while']),
  toml: new Set(['false', 'true']),
  glsl: new Set([
    'bool',
    'break',
    'const',
    'continue',
    'discard',
    'else',
    'false',
    'float',
    'for',
    'if',
    'in',
    'inout',
    'int',
    'layout',
    'mat3',
    'mat4',
    'out',
    'return',
    'sampler2D',
    'struct',
    'true',
    'uniform',
    'vec2',
    'vec3',
    'vec4',
    'void',
  ]),
  vert: new Set([
    'bool',
    'break',
    'const',
    'continue',
    'discard',
    'else',
    'false',
    'float',
    'for',
    'if',
    'in',
    'inout',
    'int',
    'layout',
    'mat3',
    'mat4',
    'out',
    'return',
    'sampler2D',
    'struct',
    'true',
    'uniform',
    'vec2',
    'vec3',
    'vec4',
    'void',
  ]),
  frag: new Set([
    'bool',
    'break',
    'const',
    'continue',
    'discard',
    'else',
    'false',
    'float',
    'for',
    'if',
    'in',
    'inout',
    'int',
    'layout',
    'mat3',
    'mat4',
    'out',
    'return',
    'sampler2D',
    'struct',
    'true',
    'uniform',
    'vec2',
    'vec3',
    'vec4',
    'void',
  ]),
  comp: new Set([
    'bool',
    'break',
    'const',
    'continue',
    'discard',
    'else',
    'false',
    'float',
    'for',
    'if',
    'in',
    'inout',
    'int',
    'layout',
    'mat3',
    'mat4',
    'out',
    'return',
    'sampler2D',
    'struct',
    'true',
    'uniform',
    'vec2',
    'vec3',
    'vec4',
    'void',
  ]),
  wgsl: new Set([
    'array',
    'binding',
    'break',
    'case',
    'continue',
    'default',
    'else',
    'false',
    'fn',
    'for',
    'fragment',
    'if',
    'let',
    'loop',
    'override',
    'private',
    'return',
    'struct',
    'switch',
    'true',
    'uniform',
    'var',
    'vec2',
    'vec3',
    'vec4',
    'vertex',
    'while',
    'workgroup',
  ]),
};

function commentPrefixForLanguage(language: DocsCodeBlockLanguage): '#' | '//' | null {
  if (HASH_COMMENT_LANGUAGES.has(language)) {
    return '#';
  }

  if (C_STYLE_LANGUAGES.has(language)) {
    return '//';
  }

  return null;
}

function readQuotedLiteral(line: string, startIndex: number): { value: string; nextIndex: number } {
  const quote = line[startIndex];
  let index = startIndex + 1;
  let escaped = false;

  while (index < line.length) {
    const character = line[index];

    if (escaped) {
      escaped = false;
      index += 1;
      continue;
    }

    if (character === '\\') {
      escaped = true;
      index += 1;
      continue;
    }

    if (character === quote) {
      index += 1;
      break;
    }

    index += 1;
  }

  return {
    value: line.slice(startIndex, index),
    nextIndex: index,
  };
}

function readIdentifier(line: string, startIndex: number): { value: string; nextIndex: number } {
  let index = startIndex;

  while (index < line.length && /[A-Za-z0-9_$-]/.test(line[index])) {
    index += 1;
  }

  return {
    value: line.slice(startIndex, index),
    nextIndex: index,
  };
}

function readNumber(line: string, startIndex: number): { value: string; nextIndex: number } {
  let index = startIndex;

  while (index < line.length && /[0-9A-Fa-f_xX.]/.test(line[index])) {
    index += 1;
  }

  return {
    value: line.slice(startIndex, index),
    nextIndex: index,
  };
}

function nextNonSpaceCharacter(line: string, startIndex: number): string | undefined {
  return line.slice(startIndex).match(/^\s*(.)/)?.[1];
}

function tokenKindForIdentifier(language: DocsCodeBlockLanguage, line: string, value: string, nextIndex: number): DocsHighlightTokenKind {
  const keywords = LANGUAGE_KEYWORDS[language];

  if (keywords?.has(value)) {
    return 'keyword';
  }

  if (/^[A-Z][A-Za-z0-9_$]*$/.test(value)) {
    return 'type';
  }

  if (nextNonSpaceCharacter(line, nextIndex) === '(') {
    return 'function';
  }

  if (language === 'toml' && nextNonSpaceCharacter(line, nextIndex) === '=') {
    return 'property';
  }

  return 'plain';
}

function tokenKindForQuotedLiteral(language: DocsCodeBlockLanguage, line: string, nextIndex: number): DocsHighlightTokenKind {
  if (language === 'json' && nextNonSpaceCharacter(line, nextIndex) === ':') {
    return 'property';
  }

  return 'string';
}

export function highlightDocsCodeLine(line: string, language: DocsCodeBlockLanguage): DocsHighlightToken[] {
  const tokens: DocsHighlightToken[] = [];
  const lineCommentPrefix = commentPrefixForLanguage(language);
  let index = 0;

  while (index < line.length) {
    const remainingLine = line.slice(index);

    if (lineCommentPrefix !== null && remainingLine.startsWith(lineCommentPrefix)) {
      tokens.push({ kind: 'comment', value: remainingLine });
      break;
    }

    if (remainingLine.startsWith('/*')) {
      const closeIndex = line.indexOf('*/', index + 2);

      if (closeIndex === -1) {
        tokens.push({ kind: 'comment', value: remainingLine });
        break;
      }

      tokens.push({ kind: 'comment', value: line.slice(index, closeIndex + 2) });
      index = closeIndex + 2;
      continue;
    }

    const character = line[index];

    if (character === '"' || character === "'" || character === '`') {
      const quotedLiteral = readQuotedLiteral(line, index);

      tokens.push({
        kind: tokenKindForQuotedLiteral(language, line, quotedLiteral.nextIndex),
        value: quotedLiteral.value,
      });
      index = quotedLiteral.nextIndex;
      continue;
    }

    if (/[0-9]/.test(character)) {
      const numberLiteral = readNumber(line, index);

      tokens.push({ kind: 'number', value: numberLiteral.value });
      index = numberLiteral.nextIndex;
      continue;
    }

    if (/[A-Za-z_$]/.test(character)) {
      const identifier = readIdentifier(line, index);

      tokens.push({
        kind: tokenKindForIdentifier(language, line, identifier.value, identifier.nextIndex),
        value: identifier.value,
      });
      index = identifier.nextIndex;
      continue;
    }

    if (/[{}()[\],.;:]/.test(character)) {
      tokens.push({ kind: 'punctuation', value: character });
      index += 1;
      continue;
    }

    if (/[+\-*/%=!<>|&^~?]/.test(character)) {
      tokens.push({ kind: 'operator', value: character });
      index += 1;
      continue;
    }

    tokens.push({ kind: 'plain', value: character });
    index += 1;
  }

  return tokens;
}
