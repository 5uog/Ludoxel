/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getRustSourceQualityTask, RUST_SOURCE_QUALITY_TASKS } from '../../config/task.config.mjs';
import { renderNoRustTargets } from '../../result/render.result.mjs';
import { runRustFormatCommand } from '../../rust/command/run.command.mjs';
import { discoverRustTargets } from '../../rust/target/discover.target.mjs';

export { RUST_SOURCE_QUALITY_TASKS };

export function runRustSourceQualityTask(taskName, options = {}) {
  const task = getRustSourceQualityTask(taskName);
  const targets = discoverRustTargets();

  if (targets.length === 0) {
    console.error(renderNoRustTargets());
    return 1;
  }

  for (const target of targets) {
    const exitCode = runRustFormatCommand(target, task, options);
    if (exitCode !== 0) {
      return exitCode;
    }
  }

  return 0;
}
