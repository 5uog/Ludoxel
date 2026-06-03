/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getPythonTargetPaths } from '../../config/target.config.mjs';
import { RUFF_MODES } from '../../config/ruff.config.mjs';
import { runRuffCommand } from '../../ruff/command/run.command.mjs';
import { resolveRuffBinary } from '../../ruff/release/resolve.release.mjs';

export async function runPythonSourceQuality(task, options = {}) {
  const targets = getPythonTargetPaths();

  if (targets.length === 0) {
    console.log('[format_python_source] no Python targets found.');
    return 0;
  }

  const ruffBinaryPath = await resolveRuffBinary();

  if (task.ruffMode === RUFF_MODES.FORMAT) {
    const importFixExitCode = await runRuffCommand({
      mode: RUFF_MODES.IMPORT_FIX,
      ruffBinaryPath,
      targets,
      env: options.env,
    });

    if (importFixExitCode !== 0) {
      return importFixExitCode;
    }
  }

  return runRuffCommand({
    mode: task.ruffMode,
    ruffBinaryPath,
    targets,
    env: options.env,
  });
}
