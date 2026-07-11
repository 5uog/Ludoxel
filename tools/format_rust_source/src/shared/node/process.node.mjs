/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { spawnSync } from 'node:child_process';

export function runProcess(command, options = {}) {
  const result = spawnSync(command.executable, command.args, {
    cwd: command.cwd,
    env: options.env || process.env,
    shell: false,
    stdio: 'inherit',
    windowsHide: true,
  });

  if (result.error) {
    return {
      exitCode: 1,
      error: result.error,
      signal: result.signal ?? null,
    };
  }

  return {
    exitCode: result.status ?? 1,
    error: null,
    signal: result.signal ?? null,
  };
}
