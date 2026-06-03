/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const APP_NAME = 'Ludoxel';

export const WINDOWS_ENTRY_SCRIPT = 'src/ludoxel/__main__.py';
export const WINDOWS_ICON_PATH = 'assets/ui/app_icon.ico';
export const WINDOWS_PUBLISH_DIR = 'dist/windows';

export const MACOS_ENTRY_SCRIPT = 'src/ludoxel/__main__.py';
export const MACOS_ICON_CANDIDATES = Object.freeze(['assets/ui/app_icon.icns', 'assets/ui/app_icon.ico', 'assets/ui/app_icon.png']);
export const MACOS_PUBLISH_DIR = 'dist/macos';

export const PYINSTALLER_WORK_ROOT = 'build/pyinstaller-runs';
export const PYINSTALLER_SPEC_ROOT = 'build/pyinstaller-spec-runs';
export const PYINSTALLER_STAGING_ROOT = 'build/pyinstaller-dist-runs';

export const LEGAL_MATERIAL_PATHS = Object.freeze(['LICENSE', 'NOTICE', 'third-party']);

export const MACOS_REQUIRED_TERMS = Object.freeze(['macOS', 'OpenGL', 'GLSL', 'PyInstaller']);
export const MACOS_DOC_CANDIDATES = Object.freeze(['README.md']);
