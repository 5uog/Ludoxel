/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PROJECT_ROOT } from '../config/path.config.mjs';
import { HELP_COMMANDS } from '../config/task.config.mjs';

function printCheckResult(name, failures) {
  if (failures.length === 0) {
    console.log(`${name}: passed`);
  } else {
    console.error(`${name}: failed`);
  }

  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }

  return failures.length === 0 ? 0 : 1;
}

function readPackageScripts() {
  const path = resolve(PROJECT_ROOT, 'package.json');
  if (!existsSync(path)) return null;

  const packageJson = JSON.parse(readFileSync(path, 'utf8'));
  return packageJson.scripts || {};
}

export function checkHelpCompleteness() {
  const scripts = readPackageScripts();

  if (scripts === null) {
    return printCheckResult('help', ['package.json is missing']);
  }

  const knownNpmScripts = new Set(HELP_COMMANDS.map((command) => command.npmScript));
  const failures = [];

  for (const scriptName of Object.keys(scripts)) {
    if (!knownNpmScripts.has(scriptName)) {
      failures.push(`package.json script has no HELP_COMMANDS entry: ${scriptName}`);
    }
  }

  for (const command of HELP_COMMANDS) {
    if (!Object.hasOwn(scripts, command.npmScript)) {
      failures.push(`HELP_COMMANDS entry has no matching package.json script: ${command.npmScript}`);
    }
  }

  return printCheckResult('help', failures);
}
