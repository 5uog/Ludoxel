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

function addOptionalDataArg(args, sourceRelativePath, destinationPath = sourceRelativePath, targetPlatform = process.platform) {
  if (existsSync(projectPath(sourceRelativePath))) {
    args.push('--add-data', addDataArg(sourceRelativePath, destinationPath, targetPlatform));
  }
}

function addRequiredDataArg(args, sourceRelativePath, destinationPath = sourceRelativePath, targetPlatform = process.platform) {
  requireProjectPath(sourceRelativePath);
  args.push('--add-data', addDataArg(sourceRelativePath, destinationPath, targetPlatform));
}

function addCommonOptionalDataArgs(args, targetPlatform = process.platform) {
  addOptionalDataArg(args, 'assets', 'assets', targetPlatform);
  addOptionalDataArg(args, 'src', 'src', targetPlatform);
  addOptionalDataArg(args, 'LICENSE', 'LICENSE', targetPlatform);
  addOptionalDataArg(args, 'NOTICE', 'NOTICE', targetPlatform);
  addOptionalDataArg(args, 'third-party', 'third-party', targetPlatform);
}

function addApplicationBootstrapHiddenImports(args) {
  args.push('--hidden-import', 'ludoxel.application.bootstrap');
  args.push('--hidden-import', 'ludoxel.application.bootstrap.run');
}

function addMacosRendererBackendArgs(args) {
  args.push('--collect-all', 'wgpu');
  args.push('--collect-all', 'rendercanvas');
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
  addRequiredDataArg(args, 'LICENSE', 'LICENSE', 'darwin');
  addRequiredDataArg(args, 'NOTICE', 'NOTICE', 'darwin');
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

function addWindowsIconArg(args) {
  const resolvedIcon = resolveFirstExistingProjectPath(WINDOWS_ICON_CANDIDATE_PATHS, 'Windows app icon', '.ico', { required: false });

  if (resolvedIcon === null) {
    return;
  }

  args.push('--icon', resolvedIcon.absolutePath);
}

export function buildWindowsPyinstallerCommand({ pythonExecutable, token }) {
  const workDir = resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token);
  const specDir = resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token);
  const stagingDir = resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token);
  const args = [
    '-m',
    'PyInstaller',
    '--noconfirm',
    '--clean',
    '--onefile',
    '--name',
    APP_NAME,
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
  addRendererBackendArgs(args, 'win32');
  addCommonOptionalDataArgs(args, 'win32');
  addWindowsIconArg(args);
  args.push(projectPath(WINDOWS_ENTRY_SCRIPT));

  return {
    executable: pythonExecutable,
    args,
    stagingDir,
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
