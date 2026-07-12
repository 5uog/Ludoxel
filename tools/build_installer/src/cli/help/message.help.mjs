/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const INSTALLER_BUILD_HELP_MESSAGES = Object.freeze({
  ja: Object.freeze({
    titles: Object.freeze({
      installer: 'build installer',
      windows: 'build installer: windows',
      macos: 'build installer: macos',
    }),
    labels: Object.freeze({
      purpose: '目的',
      synopsis: '起動形式',
      commands: '主なコマンド',
      options: 'オプション',
    }),
    installer: Object.freeze({
      purpose: 'Ludoxel offline installer build tool の入口。Windows installer build と macOS installer build/check を扱う。',
      synopsis: Object.freeze(['npm run build:installer -- help', 'npm run build:installer -- --help', 'npm run build:installer -- windows', 'npm run build:installer -- --windows', 'npm run build:installer -- macos', 'npm run build:installer -- --macos']),
      commands: Object.freeze([
        Object.freeze({ flag: 'windows, --windows', description: 'Windows installer (ludoxel_installer.exe) の build を実行する。' }),
        Object.freeze({ flag: 'macos, --macos', description: 'macOS installer (Ludoxel Installer.app) の build/check を実行する。' }),
        Object.freeze({ flag: 'help, --help, -h', description: 'ヘルプを表示する。' }),
      ]),
    }),
    windows: Object.freeze({
      purpose: 'application payload build (tools/build_desktop_app) を前提として、License Text 同意済み利用者にのみ展開・検証・インストールを許す Windows offline installer (dist/windows/ludoxel_installer.exe) を PyInstaller で構築する。',
      synopsis: Object.freeze(['npm run build:installer -- windows [options]', 'npm run build:installer -- --windows [options]', 'npm run build:installer:windows -- [options]', 'npm run build:installer:windows:check']),
      options: Object.freeze([
        Object.freeze({ flag: 'help, --help, -h', description: 'このヘルプを表示して終了する。' }),
        Object.freeze({ flag: '--dry-run', description: 'PyInstaller コマンドを表示し、実行しない。' }),
        Object.freeze({ flag: '--skip-payload-build', description: 'tools/build_desktop_app による application payload build を実行せず、既存の staged payload を使用する。' }),
        Object.freeze({ flag: '--skip-native-build', description: 'payload build 内の Rust native extension build を実行しない (--skip-payload-build 未指定時のみ有効)。' }),
        Object.freeze({ flag: '--keep-build-cache', description: 'PyInstaller の work/spec/staging directory を削除しない。' }),
        Object.freeze({ flag: '--check', description: 'Windows installer packaging に必要な実ファイルと設定を検査する (build は実行しない)。' }),
        Object.freeze({ flag: '--lang ja|en', description: 'ヘルプ表示言語を指定する。' }),
      ]),
    }),
    macos: Object.freeze({
      purpose: 'application payload build (tools/build_desktop_app) を前提として、License Text 同意済み利用者にのみ展開・検証・インストールを許す macOS offline installer (dist/macos/Ludoxel Installer.app) を PyInstaller で構築する。',
      synopsis: Object.freeze(['npm run build:installer -- macos [options]', 'npm run build:installer -- --macos [options]', 'npm run build:installer:macos -- [options]', 'npm run build:installer:macos:check']),
      options: Object.freeze([
        Object.freeze({ flag: 'help, --help, -h', description: 'このヘルプを表示して終了する。' }),
        Object.freeze({ flag: '--dry-run', description: 'PyInstaller コマンドを表示し、実行しない。' }),
        Object.freeze({ flag: '--skip-payload-build', description: 'tools/build_desktop_app による application payload build を実行せず、既存の staged payload を使用する。' }),
        Object.freeze({ flag: '--skip-native-build', description: 'payload build 内の Rust native extension build を実行しない (--skip-payload-build 未指定時のみ有効)。' }),
        Object.freeze({ flag: '--keep-build-cache', description: 'PyInstaller の work/spec/staging directory を削除しない。' }),
        Object.freeze({ flag: '--check', description: 'macOS installer packaging に必要な実ファイルと設定を検査する (build は実行しない)。' }),
        Object.freeze({ flag: '--lang ja|en', description: 'ヘルプ表示言語を指定する。' }),
      ]),
    }),
  }),
  en: Object.freeze({
    titles: Object.freeze({
      installer: 'build installer',
      windows: 'build installer: windows',
      macos: 'build installer: macos',
    }),
    labels: Object.freeze({
      purpose: 'Purpose',
      synopsis: 'Synopsis',
      commands: 'Commands',
      options: 'Options',
    }),
    installer: Object.freeze({
      purpose: 'Entry point for the Ludoxel offline installer build tool. Dispatches the Windows installer build and the macOS installer build/check tasks.',
      synopsis: Object.freeze(['npm run build:installer -- help', 'npm run build:installer -- --help', 'npm run build:installer -- windows', 'npm run build:installer -- --windows', 'npm run build:installer -- macos', 'npm run build:installer -- --macos']),
      commands: Object.freeze([
        Object.freeze({ flag: 'windows, --windows', description: 'Build the Windows installer (ludoxel_installer.exe).' }),
        Object.freeze({ flag: 'macos, --macos', description: 'Build or check the macOS installer (Ludoxel Installer.app).' }),
        Object.freeze({ flag: 'help, --help, -h', description: 'Print help.' }),
      ]),
    }),
    windows: Object.freeze({
      purpose: 'Build the Windows offline installer (dist/windows/ludoxel_installer.exe) with PyInstaller on top of the application payload tools/build_desktop_app produces, so extraction, verification, and installation stay locked to a user who has accepted the License Text.',
      synopsis: Object.freeze(['npm run build:installer -- windows [options]', 'npm run build:installer -- --windows [options]', 'npm run build:installer:windows -- [options]', 'npm run build:installer:windows:check']),
      options: Object.freeze([
        Object.freeze({ flag: 'help, --help, -h', description: 'Print this help and exit.' }),
        Object.freeze({ flag: '--dry-run', description: 'Print the PyInstaller command without running it.' }),
        Object.freeze({ flag: '--skip-payload-build', description: 'Skip the tools/build_desktop_app application payload build and reuse the payload already staged.' }),
        Object.freeze({ flag: '--skip-native-build', description: 'Skip the Rust native extension build inside the payload build (only applies when --skip-payload-build is not set).' }),
        Object.freeze({ flag: '--keep-build-cache', description: 'Keep the PyInstaller work/spec/staging directories.' }),
        Object.freeze({ flag: '--check', description: 'Check the real files and settings required for Windows installer packaging, without building.' }),
        Object.freeze({ flag: '--lang ja|en', description: 'Select help language.' }),
      ]),
    }),
    macos: Object.freeze({
      purpose: 'Build the macOS offline installer (dist/macos/Ludoxel Installer.app) with PyInstaller on top of the application payload tools/build_desktop_app produces, so extraction, verification, and installation stay locked to a user who has accepted the License Text.',
      synopsis: Object.freeze(['npm run build:installer -- macos [options]', 'npm run build:installer -- --macos [options]', 'npm run build:installer:macos -- [options]', 'npm run build:installer:macos:check']),
      options: Object.freeze([
        Object.freeze({ flag: 'help, --help, -h', description: 'Print this help and exit.' }),
        Object.freeze({ flag: '--dry-run', description: 'Print the PyInstaller command without running it.' }),
        Object.freeze({ flag: '--skip-payload-build', description: 'Skip the tools/build_desktop_app application payload build and reuse the payload already staged.' }),
        Object.freeze({ flag: '--skip-native-build', description: 'Skip the Rust native extension build inside the payload build (only applies when --skip-payload-build is not set).' }),
        Object.freeze({ flag: '--keep-build-cache', description: 'Keep the PyInstaller work/spec/staging directories.' }),
        Object.freeze({ flag: '--check', description: 'Check the real files and settings required for macOS installer packaging, without building.' }),
        Object.freeze({ flag: '--lang ja|en', description: 'Select help language.' }),
      ]),
    }),
  }),
});

export function installerBuildHelpMessagesFor(language) {
  return INSTALLER_BUILD_HELP_MESSAGES[language] || INSTALLER_BUILD_HELP_MESSAGES.ja;
}
