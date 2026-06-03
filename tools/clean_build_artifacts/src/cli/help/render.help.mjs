/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
function lines(values) {
  return values.join('\n');
}

function option(flag, description) {
  return `  ${flag.padEnd(22)} ${description}`;
}

export function renderCleanHelp() {
  return lines([
    'clean build artifacts',
    '',
    '目的',
    '  Ludoxel の生成物、cache、build artifact を実在確認したうえで削除または列挙する。',
    '',
    '起動形式',
    '  npm run clean -- help',
    '  npm run clean -- --help',
    '  npm run clean -- --dry-run',
    '  npm run clean -- --all --dry-run',
    '  npm run clean:check',
    '  npm run clean:check -- --all',
    '',
    'オプション',
    option('help, --help, -h', 'このヘルプを表示して終了する。'),
    option('--dry-run', '削除せず、対象だけを表示する。'),
    option('--all', 'dist、export output、native compiled binaries も対象に含める。'),
    option('--lang ja|en', 'ヘルプ表示言語を指定する。'),
    '',
  ]);
}

export function renderCleanErrors(errors) {
  return [...errors.map((error) => `Error: ${error}`), '', renderCleanHelp()].join('\n');
}
