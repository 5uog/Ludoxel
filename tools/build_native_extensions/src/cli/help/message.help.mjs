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
    purpose: 'Ludoxel の native hot-path (Cython target と Rust crate target) を探索、一覧、ビルド、検証する。Rust target の検証は compiled extension の import を要求し、Python fallback では合格しない。',
    synopsis: Object.freeze(['npm run build:native -- help', 'npm run build:native -- list', 'npm run build:native -- build', 'npm run build:native -- build --skip-verify', 'npm run build:native:check', 'npm run build:native:check -- --require-built']),
    options: Object.freeze([
      Object.freeze({ flag: 'help, --help, -h', description: 'このヘルプを表示して終了する。' }),
      Object.freeze({ flag: '--skip-verify', description: 'build 後の検証を省略する。' }),
      Object.freeze({ flag: '--require-built', description: 'verify 時、compiled extension がない場合に失敗させる。' }),
      Object.freeze({ flag: '--lang ja|en', description: 'ヘルプ表示言語を指定する。' }),
    ]),
    discoveryHints: Object.freeze(['ray_aabb', 'voxel_dda', 'view_angles', 'terrain_native (native/ludoxel_terrain)']),
  }),
  en: Object.freeze({
    title: 'native extension build',
    labels: Object.freeze({
      purpose: 'Purpose',
      synopsis: 'Synopsis',
      options: 'Options',
      discoveryHints: 'Discovery hints',
    }),
    purpose: 'Discover, list, build, and verify Ludoxel native hot paths (Cython targets and the Rust crate target). Rust verification requires the compiled extension import; the Python fallback does not pass.',
    synopsis: Object.freeze(['npm run build:native -- help', 'npm run build:native -- list', 'npm run build:native -- build', 'npm run build:native -- build --skip-verify', 'npm run build:native:check', 'npm run build:native:check -- --require-built']),
    options: Object.freeze([
      Object.freeze({ flag: 'help, --help, -h', description: 'Print this help and exit.' }),
      Object.freeze({ flag: '--skip-verify', description: 'Skip verification after build.' }),
      Object.freeze({ flag: '--require-built', description: 'Fail verification when compiled extensions are missing.' }),
      Object.freeze({ flag: '--lang ja|en', description: 'Select help language.' }),
    ]),
    discoveryHints: Object.freeze(['ray_aabb', 'voxel_dda', 'view_angles', 'terrain_native (native/ludoxel_terrain)']),
  }),
});

export function nativeExtensionHelpMessagesFor(language) {
  return NATIVE_EXTENSION_HELP_MESSAGES[language] || NATIVE_EXTENSION_HELP_MESSAGES.ja;
}
