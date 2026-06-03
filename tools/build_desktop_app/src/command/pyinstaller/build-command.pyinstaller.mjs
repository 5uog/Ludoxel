/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  APP_NAME,
  MACOS_ENTRY_SCRIPT,
  MACOS_ICON_CANDIDATES,
  PYINSTALLER_SPEC_ROOT,
  PYINSTALLER_STAGING_ROOT,
  PYINSTALLER_WORK_ROOT,
  WINDOWS_ENTRY_SCRIPT,
  WINDOWS_ICON_PATH,
} from '../../config/build.config.mjs';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

function pyinstallerDataSeparator() {
  return process.platform === 'win32' ? ';' : ':';
}

function addDataArg(sourceRelativePath, destinationPath) {
  return `${resolve(PROJECT_ROOT, sourceRelativePath)}${pyinstallerDataSeparator()}${destinationPath}`;
}

function addCommonDataArgs(args) {
  if (existsSync(resolve(PROJECT_ROOT, 'assets'))) {
    args.push('--add-data', addDataArg('assets', 'assets'));
  }

  if (existsSync(resolve(PROJECT_ROOT, 'src'))) {
    args.push('--add-data', addDataArg('src', 'src'));
  }

  if (existsSync(resolve(PROJECT_ROOT, 'LICENSE'))) {
    args.push('--add-data', addDataArg('LICENSE', 'LICENSE'));
  }

  if (existsSync(resolve(PROJECT_ROOT, 'NOTICE'))) {
    args.push('--add-data', addDataArg('NOTICE', 'NOTICE'));
  }

  if (existsSync(resolve(PROJECT_ROOT, 'third-party'))) {
    args.push('--add-data', addDataArg('third-party', 'third-party'));
  }
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

  addCommonDataArgs(args);

  if (existsSync(resolve(PROJECT_ROOT, WINDOWS_ICON_PATH))) {
    args.push('--icon', resolve(PROJECT_ROOT, WINDOWS_ICON_PATH));
  }

  args.push(resolve(PROJECT_ROOT, WINDOWS_ENTRY_SCRIPT));

  return {
    executable: pythonExecutable,
    args,
    workDir,
    specDir,
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

  addCommonDataArgs(args);

  for (const iconCandidate of MACOS_ICON_CANDIDATES) {
    const iconPath = resolve(PROJECT_ROOT, iconCandidate);

    if (existsSync(iconPath)) {
      args.push('--icon', iconPath);
      break;
    }
  }

  args.push(resolve(PROJECT_ROOT, MACOS_ENTRY_SCRIPT));

  return {
    executable: pythonExecutable,
    args,
    workDir,
    specDir,
    stagingDir,
    displayCommand: [pythonExecutable, ...args].join(' '),
  };
}
