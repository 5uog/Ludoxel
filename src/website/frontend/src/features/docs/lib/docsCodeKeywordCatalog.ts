/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsHighlightTokenKind } from '../types/docsCodeHighlight.types';
import { type DocsCodeLanguageFamily } from './docsCodeLanguages';

export type DocsKeywordMatch = {
  kind: DocsHighlightTokenKind;
  words: ReadonlySet<string>;
};

function words(values: readonly string[]): ReadonlySet<string> {
  return new Set(values);
}

const JAVASCRIPT_CONTROL = words(['break', 'case', 'catch', 'continue', 'default', 'do', 'else', 'finally', 'for', 'if', 'in', 'of', 'return', 'switch', 'throw', 'try', 'while', 'with', 'yield']);

const JAVASCRIPT_KEYWORDS = words([
  'abstract',
  'as',
  'async',
  'await',
  'class',
  'const',
  'constructor',
  'debugger',
  'declare',
  'delete',
  'enum',
  'export',
  'extends',
  'from',
  'function',
  'get',
  'implements',
  'import',
  'infer',
  'instanceof',
  'interface',
  'is',
  'keyof',
  'let',
  'module',
  'namespace',
  'new',
  'private',
  'protected',
  'public',
  'readonly',
  'satisfies',
  'set',
  'static',
  'super',
  'this',
  'type',
  'typeof',
  'var',
]);

const JAVASCRIPT_TYPES = words(['any', 'bigint', 'boolean', 'never', 'number', 'object', 'string', 'symbol', 'unknown', 'void']);

const JAVASCRIPT_CONSTANTS = words(['false', 'Infinity', 'NaN', 'null', 'true', 'undefined']);

const PYTHON_CONTROL = words(['break', 'continue', 'elif', 'else', 'except', 'finally', 'for', 'if', 'raise', 'return', 'try', 'while', 'with', 'yield']);

const PYTHON_KEYWORDS = words(['and', 'as', 'assert', 'async', 'await', 'class', 'def', 'del', 'from', 'global', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass']);

const PYTHON_CONSTANTS = words(['False', 'None', 'True', 'Ellipsis', 'NotImplemented']);

const C_LIKE_CONTROL = words(['break', 'case', 'continue', 'default', 'do', 'else', 'for', 'goto', 'if', 'return', 'switch', 'while']);

const C_LIKE_KEYWORDS = words([
  'asm',
  'auto',
  'catch',
  'class',
  'const',
  'constexpr',
  'delete',
  'enum',
  'explicit',
  'export',
  'extern',
  'friend',
  'inline',
  'mutable',
  'namespace',
  'new',
  'noexcept',
  'operator',
  'private',
  'protected',
  'public',
  'register',
  'requires',
  'sizeof',
  'static',
  'static_assert',
  'template',
  'this',
  'throw',
  'try',
  'typedef',
  'typename',
  'using',
  'virtual',
  'volatile',
]);

const C_LIKE_TYPES = words([
  'bool',
  'char',
  'char16_t',
  'char32_t',
  'char8_t',
  'double',
  'float',
  'int',
  'int16_t',
  'int32_t',
  'int64_t',
  'int8_t',
  'long',
  'short',
  'signed',
  'size_t',
  'ssize_t',
  'uint16_t',
  'uint32_t',
  'uint64_t',
  'uint8_t',
  'unsigned',
  'void',
  'wchar_t',
]);

const C_LIKE_CONSTANTS = words(['false', 'NULL', 'nullptr', 'true']);

const RUST_CONTROL = words(['break', 'continue', 'else', 'for', 'if', 'loop', 'match', 'return', 'while']);

const RUST_KEYWORDS = words([
  'as',
  'async',
  'await',
  'const',
  'crate',
  'dyn',
  'enum',
  'extern',
  'fn',
  'impl',
  'in',
  'let',
  'mod',
  'move',
  'mut',
  'pub',
  'ref',
  'self',
  'Self',
  'static',
  'struct',
  'super',
  'trait',
  'type',
  'unsafe',
  'use',
  'where',
]);

const RUST_TYPES = words(['bool', 'char', 'f32', 'f64', 'i128', 'i16', 'i32', 'i64', 'i8', 'isize', 'str', 'u128', 'u16', 'u32', 'u64', 'u8', 'usize']);

const RUST_CONSTANTS = words(['false', 'None', 'Ok', 'Some', 'true']);

const SHADER_CONTROL = words(['break', 'case', 'continue', 'default', 'discard', 'do', 'else', 'for', 'if', 'return', 'switch', 'while']);

const SHADER_KEYWORDS = words([
  'attribute',
  'binding',
  'buffer',
  'const',
  'flat',
  'in',
  'inout',
  'layout',
  'location',
  'out',
  'precision',
  'readonly',
  'restrict',
  'shared',
  'storage',
  'struct',
  'uniform',
  'varying',
  'writeonly',
]);

const SHADER_TYPES = words(['atomic', 'bool', 'double', 'float', 'image2D', 'int', 'mat2', 'mat3', 'mat4', 'sampler2D', 'samplerCube', 'uint', 'vec2', 'vec3', 'vec4']);

const SHADER_CONSTANTS = words(['false', 'true']);

const WGSL_CONTROL = words(['break', 'case', 'continuing', 'continue', 'default', 'discard', 'else', 'for', 'if', 'loop', 'return', 'switch', 'while']);

const WGSL_KEYWORDS = words(['alias', 'const', 'diagnostic', 'enable', 'fn', 'let', 'override', 'private', 'requires', 'struct', 'var', 'workgroup']);

const WGSL_TYPES = words([
  'array',
  'atomic',
  'bool',
  'f16',
  'f32',
  'i32',
  'mat2x2',
  'mat2x3',
  'mat2x4',
  'mat3x2',
  'mat3x3',
  'mat3x4',
  'mat4x2',
  'mat4x3',
  'mat4x4',
  'sampler',
  'sampler_comparison',
  'texture_2d',
  'texture_cube',
  'u32',
  'vec2',
  'vec3',
  'vec4',
]);

const WGSL_CONSTANTS = words(['false', 'true']);

const JAVA_CONTROL = words(['break', 'case', 'catch', 'continue', 'default', 'do', 'else', 'finally', 'for', 'if', 'return', 'switch', 'throw', 'try', 'while']);

const JAVA_KEYWORDS = words([
  'abstract',
  'assert',
  'class',
  'enum',
  'extends',
  'final',
  'implements',
  'import',
  'instanceof',
  'interface',
  'native',
  'new',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'strictfp',
  'super',
  'synchronized',
  'this',
  'throws',
  'transient',
  'volatile',
]);

const JAVA_TYPES = words(['boolean', 'byte', 'char', 'double', 'float', 'int', 'long', 'short', 'void']);

const JAVA_CONSTANTS = words(['false', 'null', 'true']);

const CSHARP_KEYWORDS = words([
  'abstract',
  'as',
  'async',
  'await',
  'base',
  'checked',
  'class',
  'const',
  'delegate',
  'enum',
  'event',
  'explicit',
  'extern',
  'fixed',
  'implicit',
  'in',
  'interface',
  'internal',
  'is',
  'lock',
  'namespace',
  'new',
  'operator',
  'out',
  'override',
  'params',
  'private',
  'protected',
  'public',
  'readonly',
  'record',
  'ref',
  'sealed',
  'sizeof',
  'stackalloc',
  'static',
  'this',
  'typeof',
  'unchecked',
  'unsafe',
  'using',
  'virtual',
  'volatile',
]);

const CSHARP_TYPES = words(['bool', 'byte', 'char', 'decimal', 'double', 'float', 'int', 'long', 'object', 'sbyte', 'short', 'string', 'uint', 'ulong', 'ushort', 'void']);

const GO_CONTROL = words(['break', 'case', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for', 'goto', 'if', 'range', 'return', 'select', 'switch']);

const GO_KEYWORDS = words(['chan', 'const', 'func', 'go', 'import', 'interface', 'map', 'package', 'struct', 'type', 'var']);

const GO_TYPES = words([
  'any',
  'bool',
  'byte',
  'complex128',
  'complex64',
  'error',
  'float32',
  'float64',
  'int',
  'int16',
  'int32',
  'int64',
  'int8',
  'rune',
  'string',
  'uint',
  'uint16',
  'uint32',
  'uint64',
  'uint8',
  'uintptr',
]);

const SWIFT_CONTROL = words([
  'break',
  'case',
  'catch',
  'continue',
  'default',
  'defer',
  'do',
  'else',
  'fallthrough',
  'for',
  'guard',
  'if',
  'repeat',
  'return',
  'switch',
  'throw',
  'try',
  'where',
  'while',
]);

const SWIFT_KEYWORDS = words([
  'actor',
  'as',
  'associatedtype',
  'async',
  'await',
  'class',
  'deinit',
  'enum',
  'extension',
  'func',
  'import',
  'in',
  'init',
  'inout',
  'is',
  'let',
  'nil',
  'operator',
  'private',
  'protocol',
  'public',
  'self',
  'Self',
  'static',
  'struct',
  'subscript',
  'super',
  'typealias',
  'var',
]);

const KOTLIN_CONTROL = words(['break', 'catch', 'continue', 'do', 'else', 'finally', 'for', 'if', 'return', 'throw', 'try', 'when', 'while']);

const KOTLIN_KEYWORDS = words([
  'as',
  'class',
  'companion',
  'constructor',
  'crossinline',
  'data',
  'dynamic',
  'enum',
  'expect',
  'external',
  'fun',
  'import',
  'in',
  'inline',
  'interface',
  'internal',
  'is',
  'lateinit',
  'object',
  'operator',
  'out',
  'override',
  'package',
  'private',
  'protected',
  'public',
  'reified',
  'sealed',
  'suspend',
  'this',
  'typealias',
  'val',
  'var',
]);

const PHP_KEYWORDS = words([
  'abstract',
  'array',
  'as',
  'callable',
  'class',
  'clone',
  'const',
  'declare',
  'echo',
  'extends',
  'final',
  'function',
  'global',
  'implements',
  'include',
  'include_once',
  'instanceof',
  'interface',
  'namespace',
  'new',
  'private',
  'protected',
  'public',
  'readonly',
  'require',
  'require_once',
  'static',
  'trait',
  'use',
  'var',
  'yield',
]);

const RUBY_CONTROL = words([
  'begin',
  'break',
  'case',
  'do',
  'else',
  'elsif',
  'end',
  'ensure',
  'for',
  'if',
  'next',
  'redo',
  'rescue',
  'retry',
  'return',
  'then',
  'unless',
  'until',
  'when',
  'while',
  'yield',
]);

const RUBY_KEYWORDS = words(['alias', 'and', 'class', 'def', 'defined?', 'module', 'not', 'or', 'self', 'super', 'undef']);

const LUA_CONTROL = words(['break', 'do', 'else', 'elseif', 'end', 'for', 'function', 'if', 'in', 'repeat', 'return', 'then', 'until', 'while']);

const LUA_KEYWORDS = words(['and', 'local', 'nil', 'not', 'or']);

const R_CONTROL = words(['break', 'else', 'for', 'if', 'in', 'next', 'repeat', 'return', 'while']);

const R_CONSTANTS = words(['FALSE', 'Inf', 'NA', 'NaN', 'NULL', 'TRUE']);

const SQL_CONTROL = words(['begin', 'case', 'else', 'end', 'except', 'for', 'if', 'intersect', 'return', 'then', 'union', 'when', 'while']);

const SQL_KEYWORDS = words([
  'alter',
  'and',
  'as',
  'asc',
  'between',
  'by',
  'create',
  'delete',
  'desc',
  'distinct',
  'drop',
  'exists',
  'from',
  'group',
  'having',
  'in',
  'insert',
  'into',
  'is',
  'join',
  'like',
  'limit',
  'not',
  'null',
  'on',
  'or',
  'order',
  'select',
  'set',
  'table',
  'update',
  'values',
  'where',
]);

const SHELL_CONTROL = words(['case', 'do', 'done', 'elif', 'else', 'esac', 'fi', 'for', 'function', 'if', 'in', 'select', 'then', 'until', 'while']);

const SHELL_KEYWORDS = words(['alias', 'cd', 'declare', 'echo', 'eval', 'exec', 'exit', 'export', 'local', 'printf', 'read', 'readonly', 'return', 'set', 'shift', 'source', 'test', 'trap', 'unset']);

const POWERSHELL_CONTROL = words([
  'begin',
  'break',
  'catch',
  'continue',
  'do',
  'dynamicparam',
  'else',
  'elseif',
  'end',
  'finally',
  'for',
  'foreach',
  'if',
  'process',
  'return',
  'switch',
  'throw',
  'trap',
  'try',
  'until',
  'while',
]);

const POWERSHELL_KEYWORDS = words(['class', 'configuration', 'data', 'enum', 'filter', 'from', 'function', 'in', 'param', 'using', 'var', 'workflow']);

const YAML_CONSTANTS = words(['false', 'False', 'FALSE', 'null', 'Null', 'NULL', 'true', 'True', 'TRUE', 'yes', 'Yes', 'YES', 'no', 'No', 'NO', 'on', 'On', 'ON', 'off', 'Off', 'OFF']);

const TOML_CONSTANTS = words(['false', 'true']);

const DOCKERFILE_KEYWORDS = words([
  'add',
  'arg',
  'cmd',
  'copy',
  'entrypoint',
  'env',
  'expose',
  'from',
  'healthcheck',
  'label',
  'maintainer',
  'onbuild',
  'run',
  'shell',
  'stopsignal',
  'user',
  'volume',
  'workdir',
]);

const KEYWORD_MATCHES_BY_FAMILY: Partial<Record<DocsCodeLanguageFamily, readonly DocsKeywordMatch[]>> = {
  batch: [
    { kind: 'control', words: words(['do', 'else', 'for', 'goto', 'if', 'in']) },
    { kind: 'keyword', words: words(['call', 'echo', 'endlocal', 'exit', 'pause', 'rem', 'set', 'setlocal', 'shift']) },
  ],
  c: [
    { kind: 'control', words: C_LIKE_CONTROL },
    { kind: 'keyword', words: C_LIKE_KEYWORDS },
    { kind: 'type', words: C_LIKE_TYPES },
    { kind: 'constant', words: C_LIKE_CONSTANTS },
  ],
  cpp: [
    { kind: 'control', words: C_LIKE_CONTROL },
    { kind: 'keyword', words: C_LIKE_KEYWORDS },
    { kind: 'type', words: C_LIKE_TYPES },
    { kind: 'constant', words: C_LIKE_CONSTANTS },
  ],
  csharp: [
    { kind: 'control', words: JAVA_CONTROL },
    { kind: 'keyword', words: CSHARP_KEYWORDS },
    { kind: 'type', words: CSHARP_TYPES },
    { kind: 'constant', words: JAVA_CONSTANTS },
  ],
  css: [
    { kind: 'keyword', words: words(['and', 'from', 'important', 'not', 'only', 'or', 'screen', 'to']) },
    { kind: 'constant', words: words(['auto', 'block', 'border-box', 'content-box', 'flex', 'grid', 'inherit', 'initial', 'inline', 'inline-block', 'none', 'relative', 'transparent', 'unset']) },
  ],
  dockerfile: [{ kind: 'keyword', words: DOCKERFILE_KEYWORDS }],
  go: [
    { kind: 'control', words: GO_CONTROL },
    { kind: 'keyword', words: GO_KEYWORDS },
    { kind: 'type', words: GO_TYPES },
    { kind: 'constant', words: words(['false', 'iota', 'nil', 'true']) },
  ],
  graphql: [
    { kind: 'keyword', words: words(['directive', 'enum', 'extend', 'fragment', 'implements', 'input', 'interface', 'mutation', 'on', 'query', 'scalar', 'schema', 'subscription', 'type', 'union']) },
    { kind: 'type', words: words(['Boolean', 'Float', 'ID', 'Int', 'String']) },
    { kind: 'constant', words: words(['false', 'null', 'true']) },
  ],
  java: [
    { kind: 'control', words: JAVA_CONTROL },
    { kind: 'keyword', words: JAVA_KEYWORDS },
    { kind: 'type', words: JAVA_TYPES },
    { kind: 'constant', words: JAVA_CONSTANTS },
  ],
  javascript: [
    { kind: 'control', words: JAVASCRIPT_CONTROL },
    { kind: 'keyword', words: JAVASCRIPT_KEYWORDS },
    { kind: 'type', words: JAVASCRIPT_TYPES },
    { kind: 'constant', words: JAVASCRIPT_CONSTANTS },
  ],
  json: [{ kind: 'constant', words: words(['false', 'null', 'true']) }],
  kotlin: [
    { kind: 'control', words: KOTLIN_CONTROL },
    { kind: 'keyword', words: KOTLIN_KEYWORDS },
    { kind: 'type', words: words(['Any', 'Boolean', 'Byte', 'Char', 'Double', 'Float', 'Int', 'Long', 'Nothing', 'Short', 'String', 'Unit']) },
    { kind: 'constant', words: words(['false', 'null', 'true']) },
  ],
  lua: [
    { kind: 'control', words: LUA_CONTROL },
    { kind: 'keyword', words: LUA_KEYWORDS },
    { kind: 'constant', words: words(['false', 'true']) },
  ],
  makefile: [{ kind: 'keyword', words: words(['define', 'else', 'endef', 'endif', 'export', 'ifneq', 'ifeq', 'include', 'override', 'private', 'undefine', 'unexport', 'vpath']) }],
  markdown: [{ kind: 'keyword', words: words(['TODO', 'NOTE', 'WARNING', 'IMPORTANT']) }],
  php: [
    { kind: 'control', words: RUBY_CONTROL },
    { kind: 'keyword', words: PHP_KEYWORDS },
    { kind: 'constant', words: words(['false', 'null', 'true']) },
  ],
  powershell: [
    { kind: 'control', words: POWERSHELL_CONTROL },
    { kind: 'keyword', words: POWERSHELL_KEYWORDS },
    { kind: 'constant', words: words(['$false', '$null', '$true']) },
  ],
  python: [
    { kind: 'control', words: PYTHON_CONTROL },
    { kind: 'keyword', words: PYTHON_KEYWORDS },
    { kind: 'constant', words: PYTHON_CONSTANTS },
  ],
  r: [
    { kind: 'control', words: R_CONTROL },
    { kind: 'keyword', words: words(['function', 'library', 'require']) },
    { kind: 'constant', words: R_CONSTANTS },
  ],
  ruby: [
    { kind: 'control', words: RUBY_CONTROL },
    { kind: 'keyword', words: RUBY_KEYWORDS },
    { kind: 'constant', words: words(['false', 'nil', 'true']) },
  ],
  rust: [
    { kind: 'control', words: RUST_CONTROL },
    { kind: 'keyword', words: RUST_KEYWORDS },
    { kind: 'type', words: RUST_TYPES },
    { kind: 'constant', words: RUST_CONSTANTS },
  ],
  shader: [
    { kind: 'control', words: SHADER_CONTROL },
    { kind: 'keyword', words: SHADER_KEYWORDS },
    { kind: 'type', words: SHADER_TYPES },
    { kind: 'constant', words: SHADER_CONSTANTS },
  ],
  shell: [
    { kind: 'control', words: SHELL_CONTROL },
    { kind: 'keyword', words: SHELL_KEYWORDS },
  ],
  sql: [
    { kind: 'control', words: SQL_CONTROL },
    { kind: 'keyword', words: SQL_KEYWORDS },
    {
      kind: 'type',
      words: words(['bigint', 'binary', 'bit', 'boolean', 'char', 'date', 'datetime', 'decimal', 'float', 'int', 'integer', 'numeric', 'real', 'smallint', 'text', 'time', 'timestamp', 'varchar']),
    },
  ],
  swift: [
    { kind: 'control', words: SWIFT_CONTROL },
    { kind: 'keyword', words: SWIFT_KEYWORDS },
    { kind: 'type', words: words(['Any', 'Bool', 'Character', 'Double', 'Float', 'Int', 'Never', 'String', 'UInt', 'Void']) },
    { kind: 'constant', words: words(['false', 'nil', 'true']) },
  ],
  toml: [{ kind: 'constant', words: TOML_CONSTANTS }],
  wgsl: [
    { kind: 'control', words: WGSL_CONTROL },
    { kind: 'keyword', words: WGSL_KEYWORDS },
    { kind: 'type', words: WGSL_TYPES },
    { kind: 'constant', words: WGSL_CONSTANTS },
  ],
  yaml: [{ kind: 'constant', words: YAML_CONSTANTS }],
};

export function getDocsKeywordTokenKind(family: DocsCodeLanguageFamily, value: string): DocsHighlightTokenKind | null {
  const matches = KEYWORD_MATCHES_BY_FAMILY[family];

  if (matches === undefined) {
    return null;
  }

  const normalizedValue = family === 'dockerfile' || family === 'sql' ? value.toLowerCase() : value;

  for (const match of matches) {
    if (match.words.has(normalizedValue) || match.words.has(value)) {
      return match.kind;
    }
  }

  return null;
}
