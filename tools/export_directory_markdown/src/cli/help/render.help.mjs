/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { EXPORT_TARGETS } from '../../config/profile.config.mjs';

export function renderExportHelp() {
  return [
    'export_directory_markdown',
    '',
    'Usage:',
    '  npm run tools:export -- [target] [options]',
    '  npm run tools:export -- --target <target> [options]',
    '  node tools/export_directory_markdown/scripts/run-export.mjs [target] [options]',
    '  node tools/export_directory_markdown/scripts/run-export.mjs --target <target> [options]',
    '',
    'Targets:',
    ...Object.values(EXPORT_TARGETS).map((target) => `  ${target.name.padEnd(8)} ${target.description}`),
    '',
    'Options:',
    '  --help, -h',
    '  --lang ja|en',
    '  --target root|src|tools|archive',
    '  --format tree|code|both',
    '  --output <path>',
    '  --overwrite',
    '  --include-hidden',
    '  --fail-on-unreadable',
    '  --max-bytes <number|unlimited>',
    '  --exclude folder:<name-or-relative-path>',
    '  --exclude ext:<extension>',
    '  --exclude file:<name-or-relative-path>',
    '',
    'Examples:',
    '  npm run tools:export:root',
    '  npm run tools:export:src',
    '  npm run tools:export -- root --format both --overwrite',
    '  npm run tools:export -- --target root --exclude "folder:assets" --exclude "ext:.so" --overwrite',
    '  npm run tools:export -- --target src --exclude "file:src/ludoxel.egg-info/SOURCES.txt" --format code --overwrite',
    '',
  ].join('\n');
}

export function renderExportErrors(errors) {
  return [...errors.map((error) => `Error: ${error}`), '', renderExportHelp()].join('\n');
}
