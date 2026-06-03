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
    '  node tools/export_directory_markdown/scripts/run-export.mjs [target] [options]',
    '',
    'Targets:',
    ...Object.values(EXPORT_TARGETS).map((target) => `  ${target.name.padEnd(8)} ${target.description}`),
    '',
    'Options:',
    '  --help, -h',
    '  --lang ja|en',
    '  --format tree|code|both',
    '  --output <path>',
    '  --overwrite',
    '  --include-hidden',
    '  --fail-on-unreadable',
    '  --max-bytes <number|unlimited>',
    '',
    'Examples:',
    '  npm run tools:export:root',
    '  npm run tools:export:src',
    '  npm run tools:export -- root -- --format both --overwrite',
    '',
  ].join('\n');
}

export function renderExportErrors(errors) {
  return [...errors.map((error) => `Error: ${error}`), '', renderExportHelp()].join('\n');
}
