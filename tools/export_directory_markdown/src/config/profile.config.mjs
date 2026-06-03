/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const EXPORT_TARGETS = Object.freeze({
  root: Object.freeze({
    name: 'root',
    directory: '.',
    outputBaseName: 'root_export',
    description: 'repository root, excluding generated artifacts and local runtime data',
  }),
  src: Object.freeze({
    name: 'src',
    directory: 'src',
    outputBaseName: 'src_export',
    description: 'Ludoxel source tree',
  }),
  tools: Object.freeze({
    name: 'tools',
    directory: 'tools',
    outputBaseName: 'tools_export',
    description: 'repository tools',
  }),
  archive: Object.freeze({
    name: 'archive',
    directory: '.',
    outputBaseName: 'archive_export',
    description: 'repository archive-oriented export with strict generated exclusions',
  }),
});

export const DEFAULT_TARGET = 'root';

export const DEFAULT_EXCLUDED_DIRECTORY_NAMES = Object.freeze([
  '.git',
  '.artifacts',
  '.venv',
  '.venv_ludoxel',
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache',
  '.ruff_cache',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'Sudoku',
  'third-party',
]);

export const DEFAULT_EXCLUDED_RELATIVE_PREFIXES = Object.freeze(['tools/export_directory_markdown/output', 'tools/format_python_source/.cache', 'assets', 'configs']);

export const DEFAULT_BINARY_EXTENSIONS = Object.freeze([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.bmp',
  '.ico',
  '.gif',
  '.wav',
  '.ogg',
  '.mp3',
  '.flac',
  '.pyd',
  '.so',
  '.dylib',
  '.dll',
  '.exe',
  '.zip',
  '.tar',
  '.gz',
  '.7z',
  '.bin',
  '.pyc',
]);
