/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { INSTALLER_ENTRY_SCRIPT, MACOS_ICON_CANDIDATE_PATHS, MACOS_INSTALLER_APP_NAME, MACOS_INSTALLER_BUNDLE_IDENTIFIER, PYINSTALLER_SPEC_ROOT, PYINSTALLER_STAGING_ROOT, PYINSTALLER_WORK_ROOT, WINDOWS_ICON_CANDIDATE_PATHS, WINDOWS_INSTALLER_APP_NAME } from '../../config/build.config.mjs';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

function projectPath(relativePath) {
  return resolve(PROJECT_ROOT, relativePath);
}

function resolveFirstExistingProjectPath(candidateRelativePaths, label, requiredExtension) {
  for (const relativePath of candidateRelativePaths) {
    const absolutePath = projectPath(relativePath);
    if (!existsSync(absolutePath)) continue;
    if (extname(absolutePath).toLowerCase() !== requiredExtension) {
      throw new Error(`${label} must use ${requiredExtension} files only: ${relativePath}`);
    }
    return absolutePath;
  }
  return null;
}

function addDataArg(sourcePath, destinationPath, targetPlatform) {
  const separator = targetPlatform === 'win32' ? ';' : ':';
  return `${sourcePath}${separator}${destinationPath}`;
}

function requireStagingSubdir(stagingDir, name) {
  const path = resolve(stagingDir, name);
  if (!existsSync(path)) {
    throw new Error(`Required installer staging input is missing: ${path}`);
  }
  return path;
}

function requireFontsDir() {
  const path = projectPath('assets/fonts');
  if (!existsSync(path)) {
    throw new Error(`Required installer font source is missing: ${path}`);
  }
  return path;
}

function toSpecPath(absolutePath) {
  return absolutePath.replace(/\\/g, '/');
}

function buildWindowsInstallerDataEntries(stagingDir) {
  const payloadDir = requireStagingSubdir(stagingDir, 'payload');
  const legalDir = requireStagingSubdir(stagingDir, 'legal');
  const fontsDir = requireFontsDir();

  return [
    [payloadDir, 'payload'],
    [legalDir, 'legal'],
    [fontsDir, 'fonts'],
  ];
}

function buildWindowsInstallerSpecText({ stagingDir, iconPath }) {
  const dataEntries = buildWindowsInstallerDataEntries(stagingDir);
  const datasLiteral = dataEntries.map(([absoluteSource, destinationPath]) => `    (r'${toSpecPath(absoluteSource)}', '${destinationPath}'),`).join('\n');
  const iconLine = iconPath === null ? '' : `\n    icon=[r'${toSpecPath(iconPath)}'],`;
  const entryPath = toSpecPath(projectPath(INSTALLER_ENTRY_SCRIPT));
  const srcPath = toSpecPath(resolve(PROJECT_ROOT, 'src'));

  return `import os

from PyInstaller.utils.hooks import collect_data_files


def _keep_pyinstaller_entry(dest):
    dest = str(dest)
    base = os.path.basename(dest).lower()
    if base in {'msvcr90.dll', 'msvcr100.dll'}:
        return False
    return True


datas = [
${datasLiteral}
]
datas += collect_data_files('ludoxel_installer')

a = Analysis(
    [r'${entryPath}'],
    pathex=[r'${srcPath}'],
    binaries=[],
    datas=datas,
    hiddenimports=[],
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
    name='${WINDOWS_INSTALLER_APP_NAME}',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,${iconLine}
)
`;
}

export function buildWindowsInstallerPyinstallerCommand({ pythonExecutable, token, stagingDir }) {
  const workDir = resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token);
  const specDir = resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token);
  const distDir = resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token);
  const iconPath = resolveFirstExistingProjectPath(WINDOWS_ICON_CANDIDATE_PATHS, 'Windows installer icon', '.ico');
  const specPath = resolve(specDir, `${WINDOWS_INSTALLER_APP_NAME}.spec`);
  const specText = buildWindowsInstallerSpecText({ stagingDir, iconPath });
  const args = ['-m', 'PyInstaller', '--noconfirm', '--clean', '--distpath', distDir, '--workpath', workDir, specPath];

  return {
    executable: pythonExecutable,
    args,
    distDir,
    specDir,
    specPath,
    specText,
    displayCommand: [pythonExecutable, ...args].join(' '),
  };
}

export function buildMacosInstallerPyinstallerCommand({ pythonExecutable, token, stagingDir }) {
  const workDir = resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token);
  const specDir = resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token);
  const distDir = resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token);
  const iconPath = resolveFirstExistingProjectPath(MACOS_ICON_CANDIDATE_PATHS, 'macOS installer icon', '.icns');
  const payloadDir = requireStagingSubdir(stagingDir, 'payload');
  const legalDir = requireStagingSubdir(stagingDir, 'legal');
  const fontsDir = requireFontsDir();

  const args = [
    '-m',
    'PyInstaller',
    '--noconfirm',
    '--clean',
    '--windowed',
    '--name',
    MACOS_INSTALLER_APP_NAME,
    '--osx-bundle-identifier',
    MACOS_INSTALLER_BUNDLE_IDENTIFIER,
    '--distpath',
    distDir,
    '--workpath',
    workDir,
    '--specpath',
    specDir,
    '--paths',
    projectPath('src'),
    '--collect-data',
    'ludoxel_installer',
    '--add-data',
    addDataArg(payloadDir, 'payload', 'darwin'),
    '--add-data',
    addDataArg(legalDir, 'legal', 'darwin'),
    '--add-data',
    addDataArg(fontsDir, 'fonts', 'darwin'),
  ];

  if (iconPath !== null) {
    args.push('--icon', iconPath);
  }

  args.push(projectPath(INSTALLER_ENTRY_SCRIPT));

  return {
    executable: pythonExecutable,
    args,
    distDir,
    displayCommand: [pythonExecutable, ...args].join(' '),
  };
}
