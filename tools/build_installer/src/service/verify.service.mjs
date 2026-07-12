/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { INSTALLER_ENTRY_SCRIPT, LEGAL_MATERIAL_PATHS, MACOS_ICON_CANDIDATE_PATHS, WINDOWS_ICON_CANDIDATE_PATHS } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { rootLicenseSha256 } from './license-resource.service.mjs';
import { listThirdPartyMaterialNames } from './third-party-resource.service.mjs';

function projectPath(relativePath) {
  return resolve(PROJECT_ROOT, relativePath);
}

const INSTALLER_FONT_FILES = Object.freeze(['assets/fonts/KaiseiOpti-Regular.ttf', 'assets/fonts/KaiseiOpti-Medium.ttf', 'assets/fonts/KaiseiOpti-Bold.ttf']);

function collectCommonFailures() {
  const checkedPaths = [INSTALLER_ENTRY_SCRIPT, ...LEGAL_MATERIAL_PATHS, ...INSTALLER_FONT_FILES, 'package.json', 'pyproject.toml'];
  const failures = [];

  if (!existsSync(projectPath(INSTALLER_ENTRY_SCRIPT))) {
    failures.push(`missing installer entry script: ${INSTALLER_ENTRY_SCRIPT}`);
  }

  for (const legalPath of LEGAL_MATERIAL_PATHS) {
    if (!existsSync(projectPath(legalPath))) {
      failures.push(`missing legal material: ${legalPath}`);
    }
  }

  for (const fontPath of INSTALLER_FONT_FILES) {
    if (!existsSync(projectPath(fontPath))) {
      failures.push(`missing installer font: ${fontPath}`);
    }
  }

  const packageJsonPath = projectPath('package.json');
  if (!existsSync(packageJsonPath)) {
    failures.push('missing package.json');
  } else {
    const version = JSON.parse(readFileSync(packageJsonPath, 'utf8')).version;
    if (!version || typeof version !== 'string') {
      failures.push('package.json has no usable version field');
    }
  }

  const pyprojectPath = projectPath('pyproject.toml');
  if (!existsSync(pyprojectPath)) {
    failures.push('missing pyproject.toml');
  } else if (!readFileSync(pyprojectPath, 'utf8').includes('PyInstaller')) {
    failures.push('missing PyInstaller development dependency in pyproject.toml');
  }

  return { checkedPaths, failures };
}

function collectIconFailures(candidatePaths, label, requiredExtension) {
  const checkedPaths = Array.from(candidatePaths);
  const existingIcon = checkedPaths.find((relativePath) => existsSync(projectPath(relativePath)));

  if (!existingIcon) {
    return { checkedPaths, failures: [`missing ${label} icon. Checked: ${checkedPaths.join(', ')}`] };
  }
  if (extname(existingIcon).toLowerCase() !== requiredExtension) {
    return { checkedPaths, failures: [`${label} icon must be a ${requiredExtension} file: ${existingIcon}`] };
  }
  return { checkedPaths, failures: [] };
}

async function collectLegalIntegrityFailures() {
  const checkedPaths = ['LICENSE', 'third-party'];
  const failures = [];

  if (existsSync(projectPath('LICENSE'))) {
    if (statSync(projectPath('LICENSE')).size === 0) {
      failures.push('LICENSE is present but empty');
    }
  }

  const materials = existsSync(projectPath('third-party')) ? listThirdPartyMaterialNames() : [];
  if (materials.length === 0) {
    failures.push('third-party/ has no subdirectory with a LICENSE.txt to collect');
  }

  return { checkedPaths, failures };
}

function unique(values) {
  return [...new Set(values)];
}

export async function checkWindowsInstallerInputs() {
  const common = collectCommonFailures();
  const icon = collectIconFailures(WINDOWS_ICON_CANDIDATE_PATHS, 'Windows installer', '.ico');
  const legal = await collectLegalIntegrityFailures();
  const checks = [common, icon, legal];
  const failures = checks.flatMap((check) => check.failures);
  const checkedPaths = unique(checks.flatMap((check) => check.checkedPaths));

  if (failures.length > 0) {
    console.error('Windows installer packaging check failed.');
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error(`  checked project paths: ${checkedPaths.join(', ')}`);
    return 1;
  }

  const licenseSha256 = await rootLicenseSha256();
  console.log('Windows installer packaging check passed.');
  console.log(`  checked project paths: ${checkedPaths.join(', ')}`);
  console.log(`  root LICENSE sha256: ${licenseSha256}`);
  return 0;
}

export async function checkMacosInstallerInputs() {
  const common = collectCommonFailures();
  const icon = collectIconFailures(MACOS_ICON_CANDIDATE_PATHS, 'macOS installer', '.icns');
  const legal = await collectLegalIntegrityFailures();
  const checks = [common, icon, legal];
  const failures = checks.flatMap((check) => check.failures);
  const checkedPaths = unique(checks.flatMap((check) => check.checkedPaths));

  if (process.platform !== 'darwin') {
    console.log('  note: this check inspects static project files only; the macOS installer build itself (and its symlink-preserving payload archive) must still run on macOS.');
  }

  if (failures.length > 0) {
    console.error('macOS installer packaging check failed.');
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error(`  checked project paths: ${checkedPaths.join(', ')}`);
    return 1;
  }

  const licenseSha256 = await rootLicenseSha256();
  console.log('macOS installer packaging check passed.');
  console.log(`  checked project paths: ${checkedPaths.join(', ')}`);
  console.log(`  root LICENSE sha256: ${licenseSha256}`);
  return 0;
}
