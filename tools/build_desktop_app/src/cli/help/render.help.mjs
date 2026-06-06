/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
function lines(values) {
  return values.join('\n');
}

function section(title, content) {
  return `${title}\n${content}`;
}

function option(flag, description) {
  return `  ${flag.padEnd(30)} ${description}`;
}

export function renderDesktopBuildHelp(command = null) {
  if (command === 'windows') {
    return lines([
      'desktop build: windows',
      '',
      section('目的', '  Ludoxel の Windows onefile EXE を既存 OpenGL renderer 経路のまま PyInstaller で構築する。'),
      '',
      section(
        '起動形式',
        lines([
          '  npm run build:desktop -- windows [options]',
          '  npm run build:desktop -- --windows [options]',
          '  npm run build:windows -- [options]',
          '  node tools/build_desktop_app/scripts/run/windows.run.mjs [options]',
        ]),
      ),
      '',
      section(
        'オプション',
        lines([
          option('help, --help, -h', 'このヘルプを表示して終了する。'),
          option('--dry-run', 'PyInstaller コマンドを表示し、実行しない。'),
          option('--skip-native-build', 'Windows build 前の native extension build を実行しない。'),
          option('--keep-build-cache', 'PyInstaller の work/spec/staging directory を削除しない。'),
          option('--lang ja|en', 'ヘルプ表示言語を指定する。'),
        ]),
      ),
      '',
    ]);
  }

  if (command === 'macos') {
    return lines([
      'desktop build: macos',
      '',
      section('目的', '  Ludoxel の macOS .app bundle を PyInstaller で構築し、wgpu-native の Metal 経路、同梱 font、.icns、Info.plist、gameplay input monitoring 表記を検証する。'),
      '',
      section(
        '起動形式',
        lines([
          '  npm run build:desktop -- macos [options]',
          '  npm run build:desktop -- --macos [options]',
          '  npm run build:macos -- [options]',
          '  npm run build:macos:help',
          '  npm run build:macos:check',
        ]),
      ),
      '',
      section(
        'オプション',
        lines([
          option('help, --help, -h', 'このヘルプを表示して終了する。'),
          option('--dry-run', 'PyInstaller コマンドを表示し、実行しない。'),
          option('--skip-native-build', 'macOS build 前の native extension build を実行しない。'),
          option('--keep-build-cache', 'PyInstaller の work/spec/staging directory を削除しない。'),
          option('--status', 'macOS app bundle の制約説明を表示する。'),
          option('--check', 'README/docs に macOS packaging 制約が記載されているか検査する。'),
          option('--lang ja|en', 'ヘルプ表示言語を指定する。'),
        ]),
      ),
      '',
    ]);
  }

  return lines([
    'desktop build',
    '',
    section('目的', '  Ludoxel desktop build tool の入口。Windows EXE build と macOS .app build/status/check を扱う。'),
    '',
    section(
      '起動形式',
      lines([
        '  npm run build:desktop -- help',
        '  npm run build:desktop -- --help',
        '  npm run build:desktop -- windows',
        '  npm run build:desktop -- --windows',
        '  npm run build:desktop -- macos',
        '  npm run build:desktop -- --macos',
      ]),
    ),
    '',
    section(
      '主なコマンド',
      lines([
        '  windows, --windows      Windows onefile EXE build を実行する。',
        '  macos, --macos          macOS .app build/status/check を実行する。',
        '  help, --help, -h        ヘルプを表示する。',
      ]),
    ),
    '',
  ]);
}

export function renderDesktopBuildErrors(errors, command = null) {
  return [...errors.map((error) => `Error: ${error}`), '', renderDesktopBuildHelp(command)].join('\n');
}
