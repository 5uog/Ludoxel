/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const APP_NAME = 'Ludoxel';
export const INSTALLER_ENTRY_SCRIPT = 'src/ludoxel_installer/__main__.py';
export const INSTALLER_SOURCE_DIR = 'src/ludoxel_installer';

export const WINDOWS_PAYLOAD_DIR = 'build/desktop-payloads/windows';
export const MACOS_PAYLOAD_DIR = 'build/desktop-payloads/macos';
export const WINDOWS_PAYLOAD_FILE_NAME = `${APP_NAME}.exe`;
export const MACOS_PAYLOAD_BUNDLE_NAME = `${APP_NAME}.app`;

export const INSTALLER_STAGING_ROOT = 'build/installer-staging';
export const WINDOWS_INSTALLER_STAGING_DIR = 'build/installer-staging/windows';
export const MACOS_INSTALLER_STAGING_DIR = 'build/installer-staging/macos';

export const MANIFEST_SCHEMA_VERSION = 1;
export const MANIFEST_FILE_NAME = 'manifest.json';

export const WINDOWS_PAYLOAD_FORMAT = 'windows-onefile-exe';
export const MACOS_PAYLOAD_FORMAT = 'macos-app-bundle-tar';
export const MACOS_PAYLOAD_ARCHIVE_NAME = `${APP_NAME}.app.tar`;

export const LEGAL_MATERIAL_PATHS = Object.freeze(['LICENSE', 'third-party']);

export const WINDOWS_ICON_CANDIDATE_PATHS = Object.freeze(['assets/app/icons/windows/app_icon_256x256.ico', 'assets/app/icons/windows/app_icon_128x128.ico', 'assets/app/icons/windows/app_icon_32x32.ico', 'assets/app/icons/windows/app_icon_16x16.ico']);
export const MACOS_ICON_CANDIDATE_PATHS = Object.freeze([
  'assets/app/icons/macos/app_icon_1024x1024.icns',
  'assets/app/icons/macos/app_icon_512x512.icns',
  'assets/app/icons/macos/app_icon_256x256.icns',
  'assets/app/icons/macos/app_icon_128x128.icns',
  'assets/app/icons/macos/app_icon_32x32.icns',
  'assets/app/icons/macos/app_icon_16x16.icns',
]);

export const WINDOWS_INSTALLER_APP_NAME = 'ludoxel_installer';
export const MACOS_INSTALLER_APP_NAME = 'Ludoxel Installer';
export const MACOS_INSTALLER_BUNDLE_IDENTIFIER = 'com.kentokonishi.ludoxel.installer';

export const WINDOWS_INSTALLER_PUBLISH_DIR = 'dist/windows';
export const MACOS_INSTALLER_PUBLISH_DIR = 'dist/macos';
export const WINDOWS_INSTALLER_ARTIFACT_NAME = `${WINDOWS_INSTALLER_APP_NAME}.exe`;
export const MACOS_INSTALLER_ARTIFACT_NAME = `${MACOS_INSTALLER_APP_NAME}.app`;
export const MACOS_INSTALLER_DMG_NAME = 'Ludoxel-Installer.dmg';

export const STALE_MACOS_DIRECT_ARTIFACT_NAME = `${APP_NAME}.app`;

export const PYINSTALLER_WORK_ROOT = 'build/pyinstaller-installer-runs';
export const PYINSTALLER_SPEC_ROOT = 'build/pyinstaller-installer-spec-runs';
export const PYINSTALLER_STAGING_ROOT = 'build/pyinstaller-installer-dist-runs';
export const PYINSTALLER_CONFIG_ROOT = 'build/pyinstaller-config';
