/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const DESKTOP_BUILD_HELP_MESSAGES = Object.freeze({
  ja: Object.freeze({
    titles: Object.freeze({
      desktop: 'desktop build',
      windows: 'desktop build: windows',
      macos: 'desktop build: macos',
    }),
    labels: Object.freeze({
      purpose: '目的',
      synopsis: '起動形式',
      commands: '主なコマンド',
      options: 'オプション',
    }),
    desktop: Object.freeze({
      purpose: 'Ludoxel desktop build tool の入口。Windows EXE build と macOS .app build/status/check を扱う。',
      synopsis: Object.freeze(['npm run build:desktop -- help', 'npm run build:desktop -- --help', 'npm run build:desktop -- windows', 'npm run build:desktop -- --windows', 'npm run build:desktop -- macos', 'npm run build:desktop -- --macos']),
      commands: Object.freeze([Object.freeze({ flag: 'windows, --windows', description: 'Windows onefile EXE build を実行する。' }), Object.freeze({ flag: 'macos, --macos', description: 'macOS .app build/status/check を実行する。' }), Object.freeze({ flag: 'help, --help, -h', description: 'ヘルプを表示する。' })]),
    }),
    windows: Object.freeze({
      purpose: 'Ludoxel の Windows onefile EXE を既存 OpenGL renderer 経路のまま PyInstaller で構築する。',
      synopsis: Object.freeze(['npm run build:desktop -- windows [options]', 'npm run build:desktop -- --windows [options]', 'npm run build:windows -- [options]', 'node tools/build_desktop_app/scripts/run/windows.run.mjs [options]']),
      options: Object.freeze([
        Object.freeze({ flag: 'help, --help, -h', description: 'このヘルプを表示して終了する。' }),
        Object.freeze({ flag: '--dry-run', description: 'PyInstaller コマンドを表示し、実行しない。' }),
        Object.freeze({ flag: '--developer-console', description: 'Windows onefile build を console 付き (--console) で構築する。既定は console を出さない --windowed build。' }),
        Object.freeze({ flag: '--skip-native-build', description: 'Windows build 前の native extension build を実行しない。' }),
        Object.freeze({ flag: '--keep-build-cache', description: 'PyInstaller の work/spec/staging directory を削除しない。' }),
        Object.freeze({ flag: '--lang ja|en', description: 'ヘルプ表示言語を指定する。' }),
      ]),
    }),
    macos: Object.freeze({
      purpose: 'Ludoxel の macOS .app bundle を PyInstaller で構築し、wgpu-native の Metal 経路、同梱 font、.icns、Info.plist、gameplay input monitoring 表記を検証する。',
      synopsis: Object.freeze(['npm run build:desktop -- macos [options]', 'npm run build:desktop -- --macos [options]', 'npm run build:macos -- [options]', 'npm run build:macos:help', 'npm run build:macos:check']),
      options: Object.freeze([
        Object.freeze({ flag: 'help, --help, -h', description: 'このヘルプを表示して終了する。' }),
        Object.freeze({ flag: '--dry-run', description: 'PyInstaller コマンドを表示し、実行しない。' }),
        Object.freeze({ flag: '--skip-native-build', description: 'macOS build 前の native extension build を実行しない。' }),
        Object.freeze({ flag: '--keep-build-cache', description: 'PyInstaller の work/spec/staging directory を削除しない。' }),
        Object.freeze({ flag: '--status', description: 'macOS app bundle の制約説明を表示する。' }),
        Object.freeze({ flag: '--check', description: 'macOS packaging に必要な実ファイル、依存関係、PyInstaller 設定を検査する。' }),
        Object.freeze({ flag: '--lang ja|en', description: 'ヘルプ表示言語を指定する。' }),
      ]),
    }),
  }),
  en: Object.freeze({
    titles: Object.freeze({
      desktop: 'desktop build',
      windows: 'desktop build: windows',
      macos: 'desktop build: macos',
    }),
    labels: Object.freeze({
      purpose: 'Purpose',
      synopsis: 'Synopsis',
      commands: 'Commands',
      options: 'Options',
    }),
    desktop: Object.freeze({
      purpose: 'Entry point for the Ludoxel desktop build tool. Dispatches Windows EXE builds and macOS .app build/status/check tasks.',
      synopsis: Object.freeze(['npm run build:desktop -- help', 'npm run build:desktop -- --help', 'npm run build:desktop -- windows', 'npm run build:desktop -- --windows', 'npm run build:desktop -- macos', 'npm run build:desktop -- --macos']),
      commands: Object.freeze([Object.freeze({ flag: 'windows, --windows', description: 'Run the Windows onefile EXE build.' }), Object.freeze({ flag: 'macos, --macos', description: 'Run the macOS .app build/status/check path.' }), Object.freeze({ flag: 'help, --help, -h', description: 'Print help.' })]),
    }),
    windows: Object.freeze({
      purpose: 'Build the Ludoxel Windows onefile EXE with PyInstaller while keeping the existing OpenGL renderer path.',
      synopsis: Object.freeze(['npm run build:desktop -- windows [options]', 'npm run build:desktop -- --windows [options]', 'npm run build:windows -- [options]', 'node tools/build_desktop_app/scripts/run/windows.run.mjs [options]']),
      options: Object.freeze([
        Object.freeze({ flag: 'help, --help, -h', description: 'Print this help and exit.' }),
        Object.freeze({ flag: '--dry-run', description: 'Print the PyInstaller command without running it.' }),
        Object.freeze({ flag: '--developer-console', description: 'Build the Windows onefile with a console (--console). The default is a --windowed build that shows no console.' }),
        Object.freeze({ flag: '--skip-native-build', description: 'Skip the native extension build before the Windows build.' }),
        Object.freeze({ flag: '--keep-build-cache', description: 'Keep the PyInstaller work/spec/staging directories.' }),
        Object.freeze({ flag: '--lang ja|en', description: 'Select help language.' }),
      ]),
    }),
    macos: Object.freeze({
      purpose: 'Build the Ludoxel macOS .app bundle with PyInstaller and check the wgpu-native Metal path, bundled fonts, .icns files, Info.plist, and gameplay input-monitoring text.',
      synopsis: Object.freeze(['npm run build:desktop -- macos [options]', 'npm run build:desktop -- --macos [options]', 'npm run build:macos -- [options]', 'npm run build:macos:help', 'npm run build:macos:check']),
      options: Object.freeze([
        Object.freeze({ flag: 'help, --help, -h', description: 'Print this help and exit.' }),
        Object.freeze({ flag: '--dry-run', description: 'Print the PyInstaller command without running it.' }),
        Object.freeze({ flag: '--skip-native-build', description: 'Skip the native extension build before the macOS build.' }),
        Object.freeze({ flag: '--keep-build-cache', description: 'Keep the PyInstaller work/spec/staging directories.' }),
        Object.freeze({ flag: '--status', description: 'Print the macOS app-bundle constraint summary.' }),
        Object.freeze({ flag: '--check', description: 'Check the real files, dependencies, and PyInstaller settings required for macOS packaging.' }),
        Object.freeze({ flag: '--lang ja|en', description: 'Select help language.' }),
      ]),
    }),
  }),
});

export function desktopBuildHelpMessagesFor(language) {
  return DESKTOP_BUILD_HELP_MESSAGES[language] || DESKTOP_BUILD_HELP_MESSAGES.ja;
}
