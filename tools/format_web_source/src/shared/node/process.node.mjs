/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { spawn } from 'node:child_process';

export function runProcess(command, options = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(command.executable, command.args, {
      cwd: command.cwd,
      env: options.env || process.env,
      shell: options.platform === 'win32' || process.platform === 'win32',
      stdio: 'inherit',
      windowsHide: true,
    });

    child.on('error', (error) => {
      console.error(error?.message || String(error));
      resolvePromise(1);
    });

    child.on('close', (code, signal) => {
      if (signal) {
        console.error(`Process terminated by signal: ${signal}`);
        resolvePromise(1);
        return;
      }

      resolvePromise(Number.isInteger(code) ? code : 1);
    });
  });
}
