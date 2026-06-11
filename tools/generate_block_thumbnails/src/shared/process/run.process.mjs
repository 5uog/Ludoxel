/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { spawnSync } from 'node:child_process';

export function runProcess(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd, env: options.env, stdio: 'inherit' });
  if (result.error) throw result.error;
  return Number(result.status ?? 1);
}
