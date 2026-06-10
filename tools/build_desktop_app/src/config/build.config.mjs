/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const APP_NAME = 'Ludoxel';

export const WINDOWS_ENTRY_SCRIPT = 'src/ludoxel/__main__.py';
export const WINDOWS_ICON_PATH = 'assets/app/icons/windows/app_icon.ico';
export const WINDOWS_PUBLISH_DIR = 'dist/windows';

export const MACOS_ENTRY_SCRIPT = 'src/ludoxel/__main__.py';
export const MACOS_ICON_PATH = 'assets/app/icons/macos/app_icon.icns';
export const MACOS_PUBLISH_DIR = 'dist/macos';
export const MACOS_BUNDLE_IDENTIFIER = 'com.kentokonishi.ludoxel';

export const PYINSTALLER_WORK_ROOT = 'build/pyinstaller-runs';
export const PYINSTALLER_SPEC_ROOT = 'build/pyinstaller-spec-runs';
export const PYINSTALLER_STAGING_ROOT = 'build/pyinstaller-dist-runs';
export const PYINSTALLER_CONFIG_ROOT = 'build/pyinstaller-config';

export const LEGAL_MATERIAL_PATHS = Object.freeze(['LICENSE', 'NOTICE', 'third-party']);

export const MACOS_REQUIRED_TERMS = Object.freeze(['macOS', 'Metal', 'wgpu-native', 'PyInstaller', 'font', '.icns']);
export const MACOS_DOC_CANDIDATES = Object.freeze(['README.md']);
