/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { PROJECT_ROOT } from '../../config/path.config.mjs';

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

  const localVenvPython = process.platform === 'win32' ? resolve(PROJECT_ROOT, '.venv_ludoxel', 'Scripts', 'python.exe') : resolve(PROJECT_ROOT, '.venv_ludoxel', 'bin', 'python');

  if (existsSync(localVenvPython)) {
    return localVenvPython;
  }

  return process.platform === 'win32' ? 'python.exe' : 'python3';
}
