/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const EXPORT_HELP_MESSAGES = Object.freeze({
  ja: Object.freeze({
    title: 'export_directory_markdown',
    labels: Object.freeze({
      usage: 'Usage:',
      targets: 'Targets:',
      options: 'Options:',
      examples: 'Examples:',
    }),
    usage: Object.freeze([
      'npm run tools:export -- [target] [options]',
      'npm run tools:export -- --target <target> [options]',
      'node tools/export_directory_markdown/scripts/run-export.mjs [target] [options]',
      'node tools/export_directory_markdown/scripts/run-export.mjs --target <target> [options]',
    ]),
    targetDescriptions: Object.freeze({
      root: 'repository root。生成物と local runtime data を除外する。',
      src: 'Ludoxel source tree。',
      tools: 'repository tools。',
      archive: 'archive-oriented export。生成物除外を強く適用する。',
    }),
    options: Object.freeze([
      '--help, -h',
      '--lang ja|en',
      '--target root|src|tools|archive',
      '--format tree|code|both',
      '--output <path>',
      '--overwrite',
      '--include-hidden',
      '--fail-on-unreadable',
      '--max-bytes <number|unlimited>',
      '--exclude folder:<name-or-relative-path>[,<name-or-relative-path>...]',
      '--exclude ext:<extension>[,<extension>...]',
      '--exclude file:<name-or-relative-path>[,<name-or-relative-path>...]',
    ]),
    examples: Object.freeze([
      'npm run tools:export:root',
      'npm run tools:export:src',
      'npm run tools:export -- root --format both --overwrite',
      'npm run tools:export -- --target root --exclude "folder:ludoxel.egg-info" --exclude "ext:.so,.pyd" --overwrite',
      'npm run tools:export -- --target src --exclude "file:src/ludoxel.egg-info/SOURCES.txt,src/ludoxel.egg-info/PKG-INFO" --format code --overwrite',
    ]),
  }),
  en: Object.freeze({
    title: 'export_directory_markdown',
    labels: Object.freeze({
      usage: 'Usage:',
      targets: 'Targets:',
      options: 'Options:',
      examples: 'Examples:',
    }),
    usage: Object.freeze([
      'npm run tools:export -- [target] [options]',
      'npm run tools:export -- --target <target> [options]',
      'node tools/export_directory_markdown/scripts/run-export.mjs [target] [options]',
      'node tools/export_directory_markdown/scripts/run-export.mjs --target <target> [options]',
    ]),
    targetDescriptions: Object.freeze({
      root: 'repository root, excluding generated artifacts and local runtime data',
      src: 'Ludoxel source tree',
      tools: 'repository tools',
      archive: 'repository archive-oriented export with strict generated exclusions',
    }),
    options: Object.freeze([
      '--help, -h',
      '--lang ja|en',
      '--target root|src|tools|archive',
      '--format tree|code|both',
      '--output <path>',
      '--overwrite',
      '--include-hidden',
      '--fail-on-unreadable',
      '--max-bytes <number|unlimited>',
      '--exclude folder:<name-or-relative-path>[,<name-or-relative-path>...]',
      '--exclude ext:<extension>[,<extension>...]',
      '--exclude file:<name-or-relative-path>[,<name-or-relative-path>...]',
    ]),
    examples: Object.freeze([
      'npm run tools:export:root',
      'npm run tools:export:src',
      'npm run tools:export -- root --format both --overwrite',
      'npm run tools:export -- --target root --exclude "folder:ludoxel.egg-info" --exclude "ext:.so,.pyd" --overwrite',
      'npm run tools:export -- --target src --exclude "file:src/ludoxel.egg-info/SOURCES.txt,src/ludoxel.egg-info/PKG-INFO" --format code --overwrite',
    ]),
  }),
});

export function exportHelpMessagesFor(language) {
  return EXPORT_HELP_MESSAGES[language] || EXPORT_HELP_MESSAGES.ja;
}
