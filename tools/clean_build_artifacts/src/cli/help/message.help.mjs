/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const CLEAN_HELP_MESSAGES = Object.freeze({
  ja: Object.freeze({
    title: 'clean build artifacts',
    labels: Object.freeze({
      purpose: '目的',
      synopsis: '起動形式',
      options: 'オプション',
    }),
    purpose: 'Ludoxel の生成物、cache、build artifact を実在確認したうえで削除または列挙する。',
    synopsis: Object.freeze(['npm run clean -- help', 'npm run clean -- --help', 'npm run clean -- --dry-run', 'npm run clean -- --all --dry-run', 'npm run clean:check', 'npm run clean:check -- --all']),
    options: Object.freeze([
      Object.freeze({ flag: 'help, --help, -h', description: 'このヘルプを表示して終了する。' }),
      Object.freeze({ flag: '--dry-run', description: '削除せず、対象だけを表示する。' }),
      Object.freeze({ flag: '--all', description: 'dist、export output、native compiled binaries も対象に含める。' }),
      Object.freeze({ flag: '--lang ja|en', description: 'ヘルプ表示言語を指定する。' }),
    ]),
  }),
  en: Object.freeze({
    title: 'clean build artifacts',
    labels: Object.freeze({
      purpose: 'Purpose',
      synopsis: 'Synopsis',
      options: 'Options',
    }),
    purpose: 'Delete or list Ludoxel generated files, caches, and build artifacts after resolving real targets.',
    synopsis: Object.freeze(['npm run clean -- help', 'npm run clean -- --help', 'npm run clean -- --dry-run', 'npm run clean -- --all --dry-run', 'npm run clean:check', 'npm run clean:check -- --all']),
    options: Object.freeze([
      Object.freeze({ flag: 'help, --help, -h', description: 'Print this help and exit.' }),
      Object.freeze({ flag: '--dry-run', description: 'List targets without deleting them.' }),
      Object.freeze({ flag: '--all', description: 'Also include dist, export output, and native compiled binaries.' }),
      Object.freeze({ flag: '--lang ja|en', description: 'Select help language.' }),
    ]),
  }),
});

export function cleanHelpMessagesFor(language) {
  return CLEAN_HELP_MESSAGES[language] || CLEAN_HELP_MESSAGES.ja;
}
