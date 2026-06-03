/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { spawnSync } from 'node:child_process';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

export function runProcess(executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    cwd: options.cwd || PROJECT_ROOT,
    env: options.env || process.env,
    stdio: options.stdio || 'inherit',
    shell: false,
    windowsHide: true,
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

export function commandExists(command, env = process.env) {
  const result = spawnSync(command, ['-version'], {
    env,
    stdio: 'ignore',
    shell: false,
    windowsHide: true,
  });

  return !result.error && result.status === 0;
}
