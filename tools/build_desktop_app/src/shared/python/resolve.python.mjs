/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function resolvePythonExecutable(env = process.env) {
  if (env.PYTHON) {
    return env.PYTHON;
  }

  if (env.VIRTUAL_ENV) {
    const candidate = process.platform === 'win32' ? resolve(env.VIRTUAL_ENV, 'Scripts', 'python.exe') : resolve(env.VIRTUAL_ENV, 'bin', 'python');

    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return process.platform === 'win32' ? 'python.exe' : 'python3';
}
