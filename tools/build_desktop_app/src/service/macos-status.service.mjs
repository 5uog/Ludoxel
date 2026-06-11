/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { LEGAL_MATERIAL_PATHS, MACOS_ENTRY_SCRIPT, MACOS_ICON_CANDIDATE_PATHS } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';

const MACOS_REQUIRED_FONT_ASSET_PATHS = Object.freeze([
  'assets/fonts/MinecraftRegular-Bmg3.otf',
  'assets/fonts/MinecraftBold-nMK1.otf',
  'assets/fonts/MinecraftItalic-R8Mo.otf',
  'assets/fonts/MinecraftBoldItalic-1y1e.otf',
  'assets/fonts/KaiseiOpti-Regular.ttf',
  'assets/fonts/KaiseiOpti-Medium.ttf',
  'assets/fonts/KaiseiOpti-Bold.ttf',
]);

const MACOS_REQUIRED_WGPU_SOURCE_PATHS = Object.freeze([
  'src/ludoxel/presentation/rendering/backends/wgpu/runtime/backend.py',
  'src/ludoxel/presentation/rendering/backends/wgpu/runtime/surface.py',
  'src/ludoxel/presentation/rendering/backends/wgpu/pipelines/factory.py',
  'src/ludoxel/presentation/rendering/backends/wgpu/textures/atlas.py',
  'src/ludoxel/presentation/rendering/backends/wgpu/shaders/sources/world.vert',
  'src/ludoxel/presentation/rendering/backends/wgpu/shaders/sources/world.frag',
  'src/ludoxel/presentation/interface/input/macos_cursor.py',
]);

const MACOS_REQUIRED_PROJECT_INPUTS = Object.freeze([
  { label: 'package metadata', path: 'package.json', type: 'file' },
  { label: 'Python package metadata', path: 'pyproject.toml', type: 'file' },
  { label: 'macOS entry script', path: MACOS_ENTRY_SCRIPT, type: 'file' },
  { label: 'bundled assets root', path: 'assets', type: 'directory' },
  { label: 'bundled source root', path: 'src', type: 'directory' },
  { label: 'default player skin asset', path: 'assets/minecraft/skins/alex.png', type: 'file' },
  ...LEGAL_MATERIAL_PATHS.map((path) => ({ label: `legal material ${path}`, path, type: 'any' })),
  ...MACOS_REQUIRED_FONT_ASSET_PATHS.map((path) => ({ label: `font asset ${path}`, path, type: 'file' })),
  ...MACOS_REQUIRED_WGPU_SOURCE_PATHS.map((path) => ({ label: `macOS WGPU source ${path}`, path, type: 'file' })),
]);

const MACOS_REQUIRED_PYPROJECT_DEPENDENCIES = Object.freeze([
  { label: 'Darwin-only wgpu dependency', dependency: 'wgpu' },
  { label: 'Darwin-only rendercanvas dependency', dependency: 'rendercanvas' },
]);

const MACOS_REQUIRED_BUILD_COMMAND_TERMS = Object.freeze([
  { label: 'wgpu-native hidden import', term: 'wgpu.backends.wgpu_native' },
  { label: 'rendercanvas Qt hidden import', term: 'rendercanvas.pyqt6' },
  { label: 'macOS cursor helper hidden import', term: 'ludoxel.presentation.interface.input.macos_cursor' },
]);

function projectPath(relativePath) {
  return resolve(PROJECT_ROOT, relativePath);
}

function readProjectText(relativePath) {
  return readFileSync(projectPath(relativePath), 'utf8');
}

function hasExpectedType(absolutePath, expectedType) {
  if (expectedType === 'any') {
    return true;
  }

  const stat = statSync(absolutePath);

  if (expectedType === 'file') {
    return stat.isFile();
  }

  if (expectedType === 'directory') {
    return stat.isDirectory();
  }

  return false;
}

function collectRequiredInputFailures() {
  const checkedPaths = [];
  const failures = [];

  for (const input of MACOS_REQUIRED_PROJECT_INPUTS) {
    checkedPaths.push(input.path);

    const absolutePath = projectPath(input.path);
    if (!existsSync(absolutePath)) {
      failures.push(`missing ${input.label}: ${input.path}`);
      continue;
    }

    if (!hasExpectedType(absolutePath, input.type)) {
      failures.push(`${input.label} is not a ${input.type}: ${input.path}`);
    }
  }

  return { checkedPaths, failures };
}

function collectIconFailures() {
  const checkedPaths = Array.from(MACOS_ICON_CANDIDATE_PATHS);
  const existingIcon = checkedPaths.find((relativePath) => existsSync(projectPath(relativePath)));

  if (!existingIcon) {
    return {
      checkedPaths,
      failures: [`missing macOS .icns icon. Checked: ${checkedPaths.join(', ')}`],
    };
  }

  if (extname(existingIcon).toLowerCase() !== '.icns') {
    return {
      checkedPaths,
      failures: [`macOS icon must be an .icns file: ${existingIcon}`],
    };
  }

  return { checkedPaths, failures: [] };
}

function pyprojectHasDarwinDependency(text, dependencyName) {
  return text.split(/\r?\n/).some((line) => line.includes(`"${dependencyName}`) && line.includes("platform_system == 'Darwin'"));
}

function collectPyprojectFailures() {
  const checkedPaths = ['pyproject.toml'];
  const failures = [];

  if (!existsSync(projectPath('pyproject.toml'))) {
    return { checkedPaths, failures };
  }

  const pyprojectText = readProjectText('pyproject.toml');

  for (const check of MACOS_REQUIRED_PYPROJECT_DEPENDENCIES) {
    if (!pyprojectHasDarwinDependency(pyprojectText, check.dependency)) {
      failures.push(`missing ${check.label} in pyproject.toml`);
    }
  }

  if (!pyprojectText.includes('PyInstaller')) {
    failures.push('missing PyInstaller development dependency in pyproject.toml');
  }

  return { checkedPaths, failures };
}

function collectPyinstallerCommandFailures() {
  const checkedPaths = ['tools/build_desktop_app/src/command/pyinstaller/build-command.pyinstaller.mjs'];
  const failures = [];

  if (!existsSync(projectPath(checkedPaths[0]))) {
    failures.push(`missing PyInstaller macOS command source: ${checkedPaths[0]}`);
    return { checkedPaths, failures };
  }

  const commandText = readProjectText(checkedPaths[0]);

  for (const check of MACOS_REQUIRED_BUILD_COMMAND_TERMS) {
    if (!commandText.includes(check.term)) {
      failures.push(`missing ${check.label} in ${checkedPaths[0]}: ${check.term}`);
    }
  }

  return { checkedPaths, failures };
}

function unique(values) {
  return [...new Set(values)];
}

export function renderMacosStatus() {
  return [
    'Ludoxel macOS app bundle status',
    '',
    'Status:',
    '  .app bundle generation is implemented through PyInstaller for the macOS wgpu-native/Metal renderer path.',
    '',
    'Verified by the macOS build path:',
    '  - Verify the wgpu-native renderer contract against the macOS Metal path.',
    '  - Collect wgpu and rendercanvas only for the macOS bundle.',
    '  - Include the presentation-layer macOS cursor recenter helper used by gameplay mouse capture.',
    '  - Preserve bundled assets, fonts, legal material, and Python framework links.',
    '  - Verify .icns icon presence, Ludoxel Info.plist identity fields, and keyboard input monitoring usage text.',
    '  - Re-sign the .app after Info.plist patching and verify the final bundle signature.',
    '',
    'Release work outside this tool:',
    '  - Codesigning and notarization.',
    '',
  ].join('\n');
}

export function checkMacosPackagingInputs() {
  const checks = [collectRequiredInputFailures(), collectIconFailures(), collectPyprojectFailures(), collectPyinstallerCommandFailures()];
  const failures = checks.flatMap((check) => check.failures);
  const checkedPaths = unique(checks.flatMap((check) => check.checkedPaths));

  if (failures.length > 0) {
    console.error('macOS packaging check failed.');
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    console.error(`  checked project paths: ${checkedPaths.join(', ')}`);
    return 1;
  }

  console.log('macOS packaging check passed.');
  console.log(`  checked project paths: ${checkedPaths.join(', ')}`);
  return 0;
}
