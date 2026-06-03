/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { spawnSync } from 'node:child_process';

export function runProcessCommand(executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    cwd: options.cwd,
    env: options.env || process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    windowsHide: true,
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    throw new Error(`${executable} failed with exit code ${result.status ?? 1}`);
  }

  return result.status ?? 0;
}
