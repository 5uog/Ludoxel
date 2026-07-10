/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const NATIVE_EXTENSION_HELP_MESSAGES = Object.freeze({
  ja: Object.freeze({
    title: 'native extension build',
    labels: Object.freeze({
      purpose: '目的',
      synopsis: '起動形式',
      options: 'オプション',
      discoveryHints: '探索ヒント',
    }),
    purpose: 'Ludoxel の native hot-path (Rust crate target) を探索、一覧、ビルド、検証する。検証は compiled extension の import を要求し、Python fallback では合格しない。',
    synopsis: Object.freeze(['npm run build:native -- help', 'npm run build:native -- list', 'npm run build:native -- build', 'npm run build:native -- build --skip-verify', 'npm run build:native:check']),
    options: Object.freeze([Object.freeze({ flag: 'help, --help, -h', description: 'このヘルプを表示して終了する。' }), Object.freeze({ flag: '--skip-verify', description: 'build 後の検証を省略する。' }), Object.freeze({ flag: '--lang ja|en', description: 'ヘルプ表示言語を指定する。' })]),
    discoveryHints: Object.freeze(['terrain_native (native/ludoxel_terrain)', 'othello_native (native/ludoxel_othello)', 'frustum_native (native/ludoxel_frustum)', 'mathematics_native (native/ludoxel_mathematics)']),
  }),
  en: Object.freeze({
    title: 'native extension build',
    labels: Object.freeze({
      purpose: 'Purpose',
      synopsis: 'Synopsis',
      options: 'Options',
      discoveryHints: 'Discovery hints',
    }),
    purpose: 'Discover, list, build, and verify Ludoxel native hot paths (Rust crate targets). Verification requires the compiled extension import; the Python fallback does not pass.',
    synopsis: Object.freeze(['npm run build:native -- help', 'npm run build:native -- list', 'npm run build:native -- build', 'npm run build:native -- build --skip-verify', 'npm run build:native:check']),
    options: Object.freeze([Object.freeze({ flag: 'help, --help, -h', description: 'Print this help and exit.' }), Object.freeze({ flag: '--skip-verify', description: 'Skip verification after build.' }), Object.freeze({ flag: '--lang ja|en', description: 'Select help language.' })]),
    discoveryHints: Object.freeze(['terrain_native (native/ludoxel_terrain)', 'othello_native (native/ludoxel_othello)', 'frustum_native (native/ludoxel_frustum)', 'mathematics_native (native/ludoxel_mathematics)']),
  }),
});

export function nativeExtensionHelpMessagesFor(language) {
  return NATIVE_EXTENSION_HELP_MESSAGES[language] || NATIVE_EXTENSION_HELP_MESSAGES.ja;
}
