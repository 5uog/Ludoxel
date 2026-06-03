/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { PROJECT_ROOT, RUFF_CONFIG_PATH, RUFF_RUNTIME_CACHE } from '../../config/path.config.mjs';
import { getRuffModeArgs } from './mode.command.mjs';

export async function runRuffCommand({ mode, ruffBinaryPath, targets, env = process.env }) {
  await mkdir(RUFF_RUNTIME_CACHE, { recursive: true });

  const command = {
    executable: ruffBinaryPath,
    args: [...getRuffModeArgs(mode), '--config', RUFF_CONFIG_PATH, ...targets],
    cwd: PROJECT_ROOT,
  };

  console.log(`[format_python_source] ${command.executable} ${command.args.join(' ')}`);

  const result = spawnSync(command.executable, command.args, {
    cwd: command.cwd,
    stdio: 'inherit',
    shell: false,
    env: {
      ...env,
      RUFF_CACHE_DIR: RUFF_RUNTIME_CACHE,
    },
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}
