/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
function lines(values) {
  return values.join('\n');
}

function option(flag, description) {
  return `  ${flag.padEnd(28)} ${description}`;
}

export function renderNativeExtensionHelp() {
  return lines([
    'native extension build',
    '',
    '目的',
    '  Ludoxel の native hot-path Python extension を探索、一覧、ビルド、検証する。',
    '',
    '起動形式',
    '  npm run build:native -- help',
    '  npm run build:native -- list',
    '  npm run build:native -- build',
    '  npm run build:native -- build --skip-verify',
    '  npm run build:native:check',
    '  npm run build:native:check -- --require-built',
    '',
    'オプション',
    option('help, --help, -h', 'このヘルプを表示して終了する。'),
    option('--skip-verify', 'build 後の検証を省略する。'),
    option('--require-built', 'verify 時、compiled extension がない場合に失敗させる。'),
    option('--lang ja|en', 'ヘルプ表示言語を指定する。'),
    '',
    '探索ヒント',
    '  ray_aabb',
    '  voxel_dda',
    '  view_angles',
    '',
  ]);
}

export function renderNativeExtensionErrors(errors) {
  return [...errors.map((error) => `Error: ${error}`), '', renderNativeExtensionHelp()].join('\n');
}
