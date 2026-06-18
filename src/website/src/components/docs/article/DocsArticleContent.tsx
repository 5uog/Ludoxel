/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useMemo, useState } from 'react';

import { type DocsCodeBlock, type DocsPageContent } from '../../../data/docs/types';
import DocsArticleReferences from './DocsArticleReferences';

type InlineTextPart = string | React.JSX.Element;

type DocsArticleContentProps = {
  page: DocsPageContent;
};

type HighlightTokenKind = 'plain' | 'comment' | 'keyword' | 'string' | 'number' | 'function' | 'type' | 'property' | 'operator' | 'punctuation';

type HighlightToken = {
  kind: HighlightTokenKind;
  value: string;
};

const LANGUAGE_KEYWORDS: Partial<Record<DocsCodeBlock['language'], Set<string>>> = {
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
  sh: new Set([
    'case',
    'cd',
    'do',
    'done',
    'elif',
    'else',
    'esac',
    'exit',
    'export',
    'fi',
    'for',
    'function',
    'if',
    'in',
    'local',
    'read',
    'return',
    'set',
    'shift',
    'then',
    'while',
  ]),
  toml: new Set(['false', 'true']),
  qss: new Set([]),
  css: new Set([]),
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

const TOKEN_CLASS_NAMES: Record<HighlightTokenKind, string> = {
  plain: 'text-foreground',
  comment: 'text-muted-foreground',
  keyword: 'text-violet-300',
  string: 'text-amber-300',
  number: 'text-orange-300',
  function: 'text-sky-300',
  type: 'text-emerald-300',
  property: 'text-lime-300',
  operator: 'text-cyan-300',
  punctuation: 'text-cyan-300',
};

function renderInlineText(text: string): InlineTextPart[] {
  return text
    .split(/(`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        return (
          <code className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.92em] text-foreground" key={`${part}-${index}`}>
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
}

function getCommentStart(language: DocsCodeBlock['language']): string {
  if (language === 'py' || language === 'sh' || language === 'toml') {
    return '#';
  }

  return '//';
}

function tokenizeStringLiteral(line: string, startIndex: number): { value: string; nextIndex: number } {
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

function getTokenKindForIdentifier(language: DocsCodeBlock['language'], line: string, value: string, nextIndex: number): HighlightTokenKind {
  const keywords = LANGUAGE_KEYWORDS[language];

  if (keywords?.has(value)) {
    return 'keyword';
  }

  if (/^[A-Z][A-Za-z0-9_$]*$/.test(value)) {
    return 'type';
  }

  const nextNonSpace = line.slice(nextIndex).match(/^\s*(.)/)?.[1];

  if (nextNonSpace === '(') {
    return 'function';
  }

  if (nextNonSpace === ':' && (language === 'json' || language === 'toml')) {
    return 'property';
  }

  return 'plain';
}

function highlightCodeLine(line: string, language: DocsCodeBlock['language']): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const commentStart = getCommentStart(language);
  let index = 0;

  while (index < line.length) {
    const remainingLine = line.slice(index);

    if (remainingLine.startsWith(commentStart)) {
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
      const stringLiteral = tokenizeStringLiteral(line, index);

      tokens.push({ kind: 'string', value: stringLiteral.value });
      index = stringLiteral.nextIndex;
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
        kind: getTokenKindForIdentifier(language, line, identifier.value, identifier.nextIndex),
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

function HighlightedCode({ code, language }: { code: string; language: DocsCodeBlock['language'] }): React.JSX.Element {
  const highlightedLines = useMemo(
    () =>
      code.split('\n').map((line) => ({
        line,
        tokens: highlightCodeLine(line, language),
      })),
    [code, language],
  );

  return (
    <>
      {highlightedLines.map((line, lineIndex) => (
        <span className="table-row" key={lineIndex}>
          <span className="table-cell select-none pr-5 text-right text-muted-foreground/70">{lineIndex + 1}</span>
          <span className="table-cell min-w-full whitespace-pre">
            {line.tokens.map((token, tokenIndex) => (
              <span className={TOKEN_CLASS_NAMES[token.kind]} key={`${lineIndex}-${tokenIndex}`}>
                {token.value}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}

function DocsCodeBlockFigure({
  block,
  blockIndex,
  sectionId,
}: {
  block: DocsCodeBlock;
  blockIndex: number;
  sectionId: string;
}): React.JSX.Element {
  const [copyLabel, setCopyLabel] = useState('Copy');

  function copyCode(): void {
    void navigator.clipboard.writeText(block.code).then(
      () => {
        setCopyLabel('Copied');

        window.setTimeout(() => {
          setCopyLabel('Copy');
        }, 1600);
      },
      () => {
        setCopyLabel('Failed');

        window.setTimeout(() => {
          setCopyLabel('Copy');
        }, 1600);
      },
    );
  }

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background shadow-2xl" key={`${sectionId}-code-${blockIndex}`}>
      <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-2.5">
        {block.caption ? <figcaption className="min-w-0 text-sm text-muted-foreground">{renderInlineText(block.caption)}</figcaption> : <span />}

        <button
          className="ml-2 flex h-6 shrink-0 items-center justify-center rounded bg-secondary px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          onClick={copyCode}
          type="button"
        >
          {copyLabel}
        </button>
      </div>

      <pre className="overflow-x-auto bg-secondary/30 px-4 py-4 font-mono text-sm leading-7">
        <code className="table min-w-full">
          <HighlightedCode code={block.code} language={block.language} />
        </code>
      </pre>
    </figure>
  );
}

export default function DocsArticleContent({ page }: DocsArticleContentProps): React.JSX.Element {
  return (
    <div className="space-y-12">
      {page.sections.map((section, index) => (
        <section className={`scroll-mt-24 page-reveal page-reveal-delay-${Math.min(index + 1, 4)}`} id={section.id} key={section.id}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">{section.title}</h2>

          <div className="space-y-4 leading-relaxed text-muted-foreground">
            {section.body.map((paragraph, paragraphIndex) => (
              <p key={`${section.id}-paragraph-${paragraphIndex}`}>{renderInlineText(paragraph)}</p>
            ))}

            {section.items ? (
              <ul className="ml-2 mt-4 list-inside list-disc space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={`${section.id}-item-${itemIndex}`}>{renderInlineText(item)}</li>
                ))}
              </ul>
            ) : null}

            {section.codeBlocks?.map((block, blockIndex) => (
              <DocsCodeBlockFigure block={block} blockIndex={blockIndex} key={`${section.id}-code-${blockIndex}`} sectionId={section.id} />
            ))}
          </div>
        </section>
      ))}

      <DocsArticleReferences references={page.references} />
    </div>
  );
}
