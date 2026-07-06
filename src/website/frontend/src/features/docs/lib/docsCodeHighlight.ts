/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsCodeBlockLanguage } from '../../../data/docs/types';
import { getDocsKeywordTokenKind } from './docsCodeKeywordCatalog';
import { normalizeDocsCodeLanguage, type NormalizedDocsCodeLanguage } from './docsCodeLanguages';
import { type DocsHighlightToken, type DocsHighlightTokenKind } from '../types/docsCodeHighlight.types';

type ReadResult = {
  value: string;
  nextIndex: number;
};

const OPENING_BRACKET_CHARACTERS = new Set(['(', '[', '{', '=', ':', ',', ';', '!', '?', '&', '|', '+', '-', '*', '/', '%', '^', '~', '<', '>']);

function pushToken(tokens: DocsHighlightToken[], kind: DocsHighlightTokenKind, value: string): void {
  if (value.length === 0) {
    return;
  }

  const previousToken = tokens[tokens.length - 1];

  if (previousToken?.kind === kind) {
    previousToken.value += value;
    return;
  }

  tokens.push({ kind, value });
}

function readUntil(line: string, startIndex: number, endValue: string): ReadResult {
  const endIndex = line.indexOf(endValue, startIndex + endValue.length);

  if (endIndex === -1) {
    return {
      value: line.slice(startIndex),
      nextIndex: line.length,
    };
  }

  return {
    value: line.slice(startIndex, endIndex + endValue.length),
    nextIndex: endIndex + endValue.length,
  };
}

function readQuotedLiteral(line: string, startIndex: number): ReadResult {
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

function readIdentifier(line: string, startIndex: number): ReadResult {
  let index = startIndex;

  while (index < line.length && /[A-Za-z0-9_$-]/.test(line[index])) {
    index += 1;
  }

  return {
    value: line.slice(startIndex, index),
    nextIndex: index,
  };
}

function readShellVariable(line: string, startIndex: number): ReadResult {
  let index = startIndex + 1;

  if (line[index] === '{') {
    const closeIndex = line.indexOf('}', index + 1);

    return {
      value: closeIndex === -1 ? line.slice(startIndex) : line.slice(startIndex, closeIndex + 1),
      nextIndex: closeIndex === -1 ? line.length : closeIndex + 1,
    };
  }

  while (index < line.length && /[A-Za-z0-9_:?-]/.test(line[index])) {
    index += 1;
  }

  return {
    value: line.slice(startIndex, index),
    nextIndex: index,
  };
}

function readNumber(line: string, startIndex: number): ReadResult {
  let index = startIndex;

  while (index < line.length && /[0-9A-Fa-f_.$xXoObBeE+-]/.test(line[index])) {
    const previous = line[index - 1];

    if ((line[index] === '+' || line[index] === '-') && previous !== 'e' && previous !== 'E') {
      break;
    }

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

function nextNonSpaceIndex(line: string, startIndex: number): number {
  let index = startIndex;

  while (index < line.length && /\s/.test(line[index])) {
    index += 1;
  }

  return index;
}

function previousNonSpaceCharacter(line: string, startIndex: number): string | undefined {
  for (let index = startIndex - 1; index >= 0; index -= 1) {
    if (!/\s/.test(line[index])) {
      return line[index];
    }
  }

  return undefined;
}

function startsWithLineComment(line: string, index: number, language: NormalizedDocsCodeLanguage): string | null {
  const remainingLine = line.slice(index);

  for (const prefix of language.lineCommentPrefixes) {
    if (prefix.trim() === 'rem') {
      if (remainingLine.toLowerCase().startsWith(prefix)) {
        return prefix;
      }

      continue;
    }

    if (remainingLine.startsWith(prefix)) {
      return prefix;
    }
  }

  return null;
}

function readBlockComment(line: string, index: number, language: NormalizedDocsCodeLanguage): ReadResult | null {
  const remainingLine = line.slice(index);

  for (const pair of language.blockCommentPairs) {
    if (remainingLine.startsWith(pair.open)) {
      return readUntil(line, index, pair.close);
    }
  }

  return null;
}

function hasPropertyDelimiterAfter(line: string, startIndex: number, language: NormalizedDocsCodeLanguage): boolean {
  const index = nextNonSpaceIndex(line, startIndex);

  return language.propertyDelimiters.includes(line[index]);
}

function isLikelyTypeIdentifier(value: string): boolean {
  return /^[A-Z][A-Za-z0-9_$]*$/.test(value);
}

function isLikelyConstantIdentifier(value: string): boolean {
  return /^[A-Z][A-Z0-9_]{2,}$/.test(value);
}

function isFunctionCall(line: string, nextIndex: number): boolean {
  return nextNonSpaceCharacter(line, nextIndex) === '(';
}

function tokenKindForIdentifier(language: NormalizedDocsCodeLanguage, line: string, value: string, nextIndex: number): DocsHighlightTokenKind {
  const keywordKind = getDocsKeywordTokenKind(language.family, value);

  if (keywordKind !== null) {
    return keywordKind;
  }

  if (language.family === 'css' && value.startsWith('--')) {
    return 'variable';
  }

  if (language.family === 'shell' && /^[A-Z_][A-Z0-9_]*$/.test(value)) {
    return 'variable';
  }

  if (hasPropertyDelimiterAfter(line, nextIndex, language)) {
    return 'property';
  }

  if (isFunctionCall(line, nextIndex)) {
    return 'function';
  }

  if (isLikelyConstantIdentifier(value)) {
    return 'constant';
  }

  if (isLikelyTypeIdentifier(value)) {
    return 'type';
  }

  return 'plain';
}

function tokenKindForQuotedLiteral(language: NormalizedDocsCodeLanguage, line: string, nextIndex: number): DocsHighlightTokenKind {
  if (hasPropertyDelimiterAfter(line, nextIndex, language)) {
    return 'property';
  }

  if (language.family === 'markdown') {
    return 'string';
  }

  return 'string';
}

function readMarkdownInlineCode(line: string, startIndex: number): ReadResult {
  const closeIndex = line.indexOf('`', startIndex + 1);

  if (closeIndex === -1) {
    return {
      value: line.slice(startIndex),
      nextIndex: line.length,
    };
  }

  return {
    value: line.slice(startIndex, closeIndex + 1),
    nextIndex: closeIndex + 1,
  };
}

function highlightMarkdownLine(line: string): DocsHighlightToken[] {
  const tokens: DocsHighlightToken[] = [];

  if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
    pushToken(tokens, 'meta', line);
    return tokens;
  }

  const heading = line.match(/^(\s{0,3}#{1,6})(\s+.*)?$/);

  if (heading !== null) {
    pushToken(tokens, 'keyword', heading[1]);
    pushToken(tokens, 'plain', heading[2] ?? '');
    return tokens;
  }

  const blockQuote = line.match(/^(\s*>+)(\s?.*)$/);

  if (blockQuote !== null) {
    pushToken(tokens, 'punctuation', blockQuote[1]);
    pushToken(tokens, 'plain', blockQuote[2]);
    return tokens;
  }

  const listMarker = line.match(/^(\s*(?:[-*+]|\d+\.|\[[ xX]\])\s+)(.*)$/);

  if (listMarker !== null) {
    pushToken(tokens, 'punctuation', listMarker[1]);
    line = listMarker[2];
  }

  let index = 0;

  while (index < line.length) {
    if (line[index] === '`') {
      const inlineCode = readMarkdownInlineCode(line, index);

      pushToken(tokens, 'string', inlineCode.value);
      index = inlineCode.nextIndex;
      continue;
    }

    if (line[index] === '[') {
      const labelEnd = line.indexOf(']', index + 1);
      const hrefOpen = labelEnd === -1 ? -1 : line.indexOf('(', labelEnd + 1);
      const hrefClose = hrefOpen === -1 ? -1 : line.indexOf(')', hrefOpen + 1);

      if (labelEnd !== -1 && hrefOpen === labelEnd + 1 && hrefClose !== -1) {
        pushToken(tokens, 'punctuation', line.slice(index, index + 1));
        pushToken(tokens, 'property', line.slice(index + 1, labelEnd));
        pushToken(tokens, 'punctuation', '](');
        pushToken(tokens, 'string', line.slice(hrefOpen + 1, hrefClose));
        pushToken(tokens, 'punctuation', ')');
        index = hrefClose + 1;
        continue;
      }
    }

    if (line[index] === '*' || line[index] === '_' || line[index] === '~') {
      pushToken(tokens, 'punctuation', line[index]);
      index += 1;
      continue;
    }

    pushToken(tokens, 'plain', line[index]);
    index += 1;
  }

  return tokens;
}

function highlightDiffLine(line: string): DocsHighlightToken[] {
  if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('@@')) {
    return [{ kind: 'meta', value: line }];
  }

  if (line.startsWith('+')) {
    return [{ kind: 'inserted', value: line }];
  }

  if (line.startsWith('-')) {
    return [{ kind: 'deleted', value: line }];
  }

  return [{ kind: 'plain', value: line }];
}

function readMarkupTag(line: string, startIndex: number): ReadResult {
  const closeIndex = line.indexOf('>', startIndex + 1);

  return {
    value: closeIndex === -1 ? line.slice(startIndex) : line.slice(startIndex, closeIndex + 1),
    nextIndex: closeIndex === -1 ? line.length : closeIndex + 1,
  };
}

function tokenizeMarkupTag(tag: string, tokens: DocsHighlightToken[]): void {
  let index = 0;

  while (index < tag.length) {
    const character = tag[index];

    if (character === '<' || character === '>' || character === '/' || character === '=') {
      pushToken(tokens, 'punctuation', character);
      index += 1;
      continue;
    }

    if (character === '"' || character === "'") {
      const literal = readQuotedLiteral(tag, index);

      pushToken(tokens, 'string', literal.value);
      index = literal.nextIndex;
      continue;
    }

    if (/[A-Za-z_:]/.test(character)) {
      const identifier = readIdentifier(tag, index);
      const previousCharacter = previousNonSpaceCharacter(tag, index);
      const nextCharacter = nextNonSpaceCharacter(tag, identifier.nextIndex);

      pushToken(tokens, previousCharacter === '<' || previousCharacter === '/' ? 'tag' : nextCharacter === '=' ? 'attribute' : 'plain', identifier.value);
      index = identifier.nextIndex;
      continue;
    }

    pushToken(tokens, 'plain', character);
    index += 1;
  }
}

function highlightMarkupLine(line: string, language: NormalizedDocsCodeLanguage): DocsHighlightToken[] {
  const tokens: DocsHighlightToken[] = [];
  let index = 0;

  while (index < line.length) {
    const blockComment = readBlockComment(line, index, language);

    if (blockComment !== null) {
      pushToken(tokens, 'comment', blockComment.value);
      index = blockComment.nextIndex;
      continue;
    }

    if (line[index] === '<') {
      const tag = readMarkupTag(line, index);

      tokenizeMarkupTag(tag.value, tokens);
      index = tag.nextIndex;
      continue;
    }

    pushToken(tokens, 'plain', line[index]);
    index += 1;
  }

  return tokens;
}

function readOptionToken(line: string, startIndex: number): ReadResult {
  let index = startIndex;

  while (index < line.length && /[A-Za-z0-9_.:=/-]/.test(line[index])) {
    index += 1;
  }

  return {
    value: line.slice(startIndex, index),
    nextIndex: index,
  };
}

function isRegexStart(line: string, index: number, language: NormalizedDocsCodeLanguage): boolean {
  if (language.family !== 'javascript' && language.family !== 'php' && language.family !== 'ruby') {
    return false;
  }

  const previous = previousNonSpaceCharacter(line, index);

  return previous === undefined || OPENING_BRACKET_CHARACTERS.has(previous);
}

function readRegexLiteral(line: string, startIndex: number): ReadResult {
  let index = startIndex + 1;
  let inCharacterClass = false;
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

    if (character === '[') {
      inCharacterClass = true;
      index += 1;
      continue;
    }

    if (character === ']') {
      inCharacterClass = false;
      index += 1;
      continue;
    }

    if (character === '/' && !inCharacterClass) {
      index += 1;

      while (index < line.length && /[a-z]/i.test(line[index])) {
        index += 1;
      }

      break;
    }

    index += 1;
  }

  return {
    value: line.slice(startIndex, index),
    nextIndex: index,
  };
}

function highlightGenericLine(line: string, language: NormalizedDocsCodeLanguage): DocsHighlightToken[] {
  const tokens: DocsHighlightToken[] = [];
  let index = 0;

  while (index < line.length) {
    const blockComment = readBlockComment(line, index, language);

    if (blockComment !== null) {
      pushToken(tokens, 'comment', blockComment.value);
      index = blockComment.nextIndex;
      continue;
    }

    const lineCommentPrefix = startsWithLineComment(line, index, language);

    if (lineCommentPrefix !== null) {
      pushToken(tokens, 'comment', line.slice(index));
      break;
    }

    const character = line[index];

    if ((language.family === 'shell' || language.family === 'powershell' || language.family === 'makefile') && character === '$') {
      const variable = readShellVariable(line, index);

      pushToken(tokens, 'variable', variable.value);
      index = variable.nextIndex;
      continue;
    }

    if ((language.family === 'rust' || language.family === 'ruby') && character === "'" && /[A-Za-z_]/.test(line[index + 1] ?? '')) {
      const identifier = readIdentifier(line, index + 1);
      const value = `'${identifier.value}`;

      if (line[identifier.nextIndex] !== "'") {
        pushToken(tokens, 'variable', value);
        index = identifier.nextIndex;
        continue;
      }
    }

    if ((character === '-' && line[index + 1] === '-') || (character === '/' && line[index + 1] === '/')) {
      if (isRegexStart(line, index, language)) {
        const regexLiteral = readRegexLiteral(line, index);

        pushToken(tokens, 'regex', regexLiteral.value);
        index = regexLiteral.nextIndex;
        continue;
      }
    }

    if (character === '"' || character === "'" || character === '`') {
      const quotedLiteral = readQuotedLiteral(line, index);

      pushToken(tokens, tokenKindForQuotedLiteral(language, line, quotedLiteral.nextIndex), quotedLiteral.value);
      index = quotedLiteral.nextIndex;
      continue;
    }

    if (isRegexStart(line, index, language) && character === '/') {
      const regexLiteral = readRegexLiteral(line, index);

      pushToken(tokens, 'regex', regexLiteral.value);
      index = regexLiteral.nextIndex;
      continue;
    }

    if (/[0-9]/.test(character)) {
      const numberLiteral = readNumber(line, index);

      pushToken(tokens, 'number', numberLiteral.value);
      index = numberLiteral.nextIndex;
      continue;
    }

    if ((language.family === 'css' || language.family === 'shader' || language.family === 'wgsl') && character === '@') {
      const identifier = readIdentifier(line, index + 1);

      pushToken(tokens, 'keyword', `@${identifier.value}`);
      index = identifier.nextIndex;
      continue;
    }

    if ((language.family === 'shell' || language.family === 'powershell') && character === '-' && /[-A-Za-z]/.test(line[index + 1] ?? '')) {
      const option = readOptionToken(line, index);

      pushToken(tokens, 'property', option.value);
      index = option.nextIndex;
      continue;
    }

    if (/[A-Za-z_$]/.test(character)) {
      const identifier = readIdentifier(line, index);

      pushToken(tokens, tokenKindForIdentifier(language, line, identifier.value, identifier.nextIndex), identifier.value);
      index = identifier.nextIndex;
      continue;
    }

    if (/[{}()[\],.;:]/.test(character)) {
      pushToken(tokens, 'punctuation', character);
      index += 1;
      continue;
    }

    if (/[+\-*/%=!<>|&^~?]/.test(character)) {
      pushToken(tokens, 'operator', character);
      index += 1;
      continue;
    }

    pushToken(tokens, 'plain', character);
    index += 1;
  }

  return tokens;
}

export function highlightDocsCodeLine(line: string, language: DocsCodeBlockLanguage): DocsHighlightToken[] {
  const normalizedLanguage = normalizeDocsCodeLanguage(language);

  if (line.length === 0) {
    return [{ kind: 'plain', value: '' }];
  }

  if (normalizedLanguage.family === 'diff') {
    return highlightDiffLine(line);
  }

  if (normalizedLanguage.family === 'markdown') {
    return highlightMarkdownLine(line);
  }

  if (normalizedLanguage.family === 'html' || normalizedLanguage.family === 'xml') {
    return highlightMarkupLine(line, normalizedLanguage);
  }

  return highlightGenericLine(line, normalizedLanguage);
}
