/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GENERATED_SCRIPT_ROOT, PROJECT_ROOT } from '../config/path.config.mjs';

export function writeGeneratedPythonScript(name, content) {
  mkdirSync(GENERATED_SCRIPT_ROOT, { recursive: true });
  const path = resolve(GENERATED_SCRIPT_ROOT, name);
  writeFileSync(path, content, 'utf8');
  return path;
}

export function writeGeneratedJson(name, value) {
  mkdirSync(GENERATED_SCRIPT_ROOT, { recursive: true });
  const path = resolve(GENERATED_SCRIPT_ROOT, name);
  writeFileSync(path, JSON.stringify(value, null, 2), 'utf8');
  return path;
}

export function removeGeneratedNativeScriptRoot() {
  rmSync(GENERATED_SCRIPT_ROOT, { recursive: true, force: true });
}
