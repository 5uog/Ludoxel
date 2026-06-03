/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { printCheckResult } from '../../service/report.service.mjs';
import { REJECTED_PACKAGE_SCRIPT_TERMS, REQUIRED_PACKAGE_SCRIPTS } from './package.rules.mjs';

function readPackageJson() {
  const path = resolve(PROJECT_ROOT, 'package.json');
  if (!existsSync(path)) return null;

  return JSON.parse(readFileSync(path, 'utf8'));
}

function scriptPathExists(scriptCommand) {
  const match = String(scriptCommand).match(/^node\s+(\.\/)?(?<path>\S+)/u);
  if (!match?.groups?.path) return true;
  return existsSync(resolve(PROJECT_ROOT, match.groups.path));
}

export function checkPackage() {
  const failures = [];
  const packageJson = readPackageJson();

  if (!packageJson) {
    return printCheckResult('package', ['package.json is missing']);
  }

  if (packageJson.name !== 'ludoxel') failures.push('package.json name must be ludoxel');
  if (packageJson.license !== 'LicenseRef-All-Rights-Reserved') failures.push('package.json license must be LicenseRef-All-Rights-Reserved');

  const scripts = packageJson.scripts || {};

  for (const scriptName of REQUIRED_PACKAGE_SCRIPTS) {
    if (!Object.hasOwn(scripts, scriptName)) {
      failures.push(`package.json missing script: ${scriptName}`);
    }
  }

  for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
    if (scriptName.includes('future:ai-workbench')) {
      failures.push(`future AI workbench must not be a tool script: ${scriptName}`);
    }

    for (const rejectedTerm of REJECTED_PACKAGE_SCRIPT_TERMS) {
      if (String(scriptCommand).includes(rejectedTerm)) {
        failures.push(`script references rejected term ${rejectedTerm}: ${scriptName}`);
      }
    }

    if (!scriptPathExists(scriptCommand)) {
      failures.push(`script entry file does not exist: ${scriptName} -> ${scriptCommand}`);
    }
  }

  if (existsSync(resolve(PROJECT_ROOT, 'scripts'))) {
    failures.push('root scripts/ must not exist; Ludoxel tooling lives under tools/');
  }

  if (existsSync(resolve(PROJECT_ROOT, 'tools', 'future_ai_workbench'))) {
    failures.push('tools/future_ai_workbench must be removed; future AI workbench belongs in README or future design notes only');
  }

  return printCheckResult('package', failures);
}
