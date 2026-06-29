/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import {
  APP_NAME,
  MACOS_BUNDLE_IDENTIFIER,
  MACOS_ENTRY_SCRIPT,
  MACOS_ICON_CANDIDATE_PATHS,
  PYINSTALLER_SPEC_ROOT,
  PYINSTALLER_STAGING_ROOT,
  PYINSTALLER_WORK_ROOT,
  WINDOWS_ENTRY_SCRIPT,
  WINDOWS_ICON_CANDIDATE_PATHS,
} from '../../config/build.config.mjs';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

function pyinstallerDataSeparator(targetPlatform = process.platform) {
  return targetPlatform === 'win32' ? ';' : ':';
}

function projectPath(relativePath) {
  return resolve(PROJECT_ROOT, relativePath);
}

function addDataArg(sourceRelativePath, destinationPath, targetPlatform = process.platform) {
  return `${projectPath(sourceRelativePath)}${pyinstallerDataSeparator(targetPlatform)}${destinationPath}`;
}

function requireProjectPath(relativePath) {
  const absolutePath = projectPath(relativePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Required desktop bundle input is missing: ${relativePath} (${absolutePath})`);
  }

  return absolutePath;
}

function addRequiredDataArg(args, sourceRelativePath, destinationPath = sourceRelativePath, targetPlatform = process.platform) {
  requireProjectPath(sourceRelativePath);
  args.push('--add-data', addDataArg(sourceRelativePath, destinationPath, targetPlatform));
}

function windowsBundleDataEntries() {
  // Optional data roots bundled into the Windows onefile, included only when
  // present. LICENSE is intentionally absent: it is not read at runtime and is
  // published beside the artifact by copyLegalMaterial, and a root-level onefile
  // data entry named LICENSE fails the bootloader extraction.
  const candidates = [
    ['assets', 'assets'],
    ['src/ludoxel', 'src/ludoxel'],
    ['third-party', 'third-party'],
  ];

  return candidates.filter(([sourceRelativePath]) => existsSync(projectPath(sourceRelativePath))).map(([sourceRelativePath, destinationPath]) => [projectPath(sourceRelativePath), destinationPath]);
}

function toSpecPath(absolutePath) {
  return absolutePath.replace(/\\/g, '/');
}

function addApplicationBootstrapHiddenImports(args) {
  args.push('--hidden-import', 'ludoxel.application.bootstrap');
  args.push('--hidden-import', 'ludoxel.application.bootstrap.run');
}

function addMacosRendererBackendArgs(args) {
  args.push('--collect-binaries', 'wgpu');
  args.push('--collect-data', 'wgpu');
  args.push('--hidden-import', 'wgpu.backends.wgpu_native');
  args.push('--hidden-import', 'rendercanvas.qt');
  args.push('--hidden-import', 'rendercanvas.pyqt6');
  args.push('--hidden-import', 'ludoxel.presentation.interface.input.macos_cursor');
}

function addRendererBackendArgs(args, targetPlatform = process.platform) {
  if (targetPlatform !== 'darwin') {
    return;
  }

  addMacosRendererBackendArgs(args);
}

function addMacosRequiredDataArgs(args) {
  requireProjectPath('assets/minecraft/skins/alex.png');

  addRequiredDataArg(args, 'assets', 'assets', 'darwin');
  addRequiredDataArg(args, 'src', 'src', 'darwin');
  // LICENSE is published beside the bundle by copyLegalMaterial and is not read
  // at runtime, so it is not bundled as internal data; third-party notices stay
  // bundled because they are nested and extract without conflict.
  addRequiredDataArg(args, 'third-party', 'third-party', 'darwin');
}

function resolveFirstExistingProjectPath(candidateRelativePaths, label, requiredExtension, { required = true } = {}) {
  const checkedRelativePaths = Array.from(candidateRelativePaths);

  for (const relativePath of checkedRelativePaths) {
    const absolutePath = projectPath(relativePath);

    if (!existsSync(absolutePath)) {
      continue;
    }

    if (extname(absolutePath).toLowerCase() !== requiredExtension) {
      throw new Error(`${label} must use ${requiredExtension} files only: ${relativePath}`);
    }

    return {
      relativePath,
      absolutePath,
    };
  }

  if (required) {
    throw new Error(`Required ${label} is missing. Checked: ${checkedRelativePaths.join(', ')}`);
  }

  return null;
}

function addMacosIconArg(args) {
  const resolvedIcon = resolveFirstExistingProjectPath(MACOS_ICON_CANDIDATE_PATHS, 'macOS app icon', '.icns');
  args.push('--icon', resolvedIcon.absolutePath);
}

function resolveWindowsIconPath() {
  const resolvedIcon = resolveFirstExistingProjectPath(WINDOWS_ICON_CANDIDATE_PATHS, 'Windows app icon', '.ico', { required: false });

  return resolvedIcon === null ? null : resolvedIcon.absolutePath;
}

function buildWindowsSpecText({ developerConsole }) {
  const dataEntries = windowsBundleDataEntries();
  const datasLiteral = dataEntries.map(([absoluteSource, destinationPath]) => `    (r'${toSpecPath(absoluteSource)}', '${destinationPath}'),`).join('\n');
  const iconPath = resolveWindowsIconPath();
  const iconLine = iconPath === null ? '' : `\n    icon=[r'${toSpecPath(iconPath)}'],`;
  const consoleFlag = developerConsole ? 'True' : 'False';
  const entryPath = toSpecPath(projectPath(WINDOWS_ENTRY_SCRIPT));
  const srcPath = toSpecPath(resolve(PROJECT_ROOT, 'src'));

  return `# -*- mode: python ; coding: utf-8 -*-
# Generated by tools/build_desktop_app for the Ludoxel Windows onefile build.
# PyInstaller is run with this spec rather than bare CLI flags so the
# post-Analysis filter below can drop unused PyOpenGL GLUT/GLE runtime DLLs.
import os

from PyInstaller.utils.hooks import collect_data_files

# PyOpenGL ships the GLUT/GLE runtime under OpenGL/DLLS. Ludoxel drives
# windowing through Qt and uses only the OpenGL core, so nothing under
# OpenGL/DLLS is ever loaded. Those GLUT/GLE DLLs additionally pull MSVCR100.dll
# into the bundle, and dropping the whole OpenGL/DLLS folder plus that legacy
# runtime shrinks the one-file payload that the bootloader must extract.
# OpenGL.GL, OpenGL.error, and OpenGL.platform remain in the bundle.


def _keep_pyinstaller_entry(dest):
    dest = str(dest)
    base = os.path.basename(dest).lower()
    if base == 'msvcr100.dll':
        return False
    if os.path.basename(os.path.dirname(dest)).lower() == 'dlls' and 'opengl' in dest.lower():
        return False
    return True


datas = [
${datasLiteral}
]
datas += collect_data_files('ludoxel')

a = Analysis(
    [r'${entryPath}'],
    pathex=[r'${srcPath}'],
    binaries=[],
    datas=datas,
    hiddenimports=['ludoxel.application.bootstrap', 'ludoxel.application.bootstrap.run'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

a.binaries = [entry for entry in a.binaries if _keep_pyinstaller_entry(entry[0])]
a.datas = [entry for entry in a.datas if _keep_pyinstaller_entry(entry[0])]

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='${APP_NAME}',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=${consoleFlag},
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,${iconLine}
)
`;
}

export function buildWindowsPyinstallerCommand({ pythonExecutable, token, developerConsole = false }) {
  const workDir = resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token);
  const specDir = resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token);
  const stagingDir = resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token);
  const specPath = resolve(specDir, `${APP_NAME}.spec`);
  const specText = buildWindowsSpecText({ developerConsole });
  const args = ['-m', 'PyInstaller', '--noconfirm', '--clean', '--distpath', stagingDir, '--workpath', workDir, specPath];

  return {
    executable: pythonExecutable,
    args,
    stagingDir,
    specDir,
    specPath,
    specText,
    displayCommand: [pythonExecutable, ...args].join(' '),
  };
}

export function buildMacosPyinstallerCommand({ pythonExecutable, token }) {
  const workDir = resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token);
  const specDir = resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token);
  const stagingDir = resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token);
  const args = [
    '-m',
    'PyInstaller',
    '--noconfirm',
    '--clean',
    '--windowed',
    '--name',
    APP_NAME,
    '--osx-bundle-identifier',
    MACOS_BUNDLE_IDENTIFIER,
    '--distpath',
    stagingDir,
    '--workpath',
    workDir,
    '--specpath',
    specDir,
    '--paths',
    resolve(PROJECT_ROOT, 'src'),
    '--collect-data',
    'ludoxel',
  ];

  addApplicationBootstrapHiddenImports(args);
  addRendererBackendArgs(args, 'darwin');
  addMacosRequiredDataArgs(args);
  addMacosIconArg(args);
  args.push(projectPath(MACOS_ENTRY_SCRIPT));

  return {
    executable: pythonExecutable,
    args,
    stagingDir,
    displayCommand: [pythonExecutable, ...args].join(' '),
  };
}
