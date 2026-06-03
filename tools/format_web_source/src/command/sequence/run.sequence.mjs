/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getWebSourceQualityTask } from '../../config/task.config.mjs';
import { runEslintCommand } from '../eslint/run.eslint.mjs';
import { runPrettierCommand } from '../prettier/run.prettier.mjs';
import { runStylelintCommand } from '../stylelint/run.stylelint.mjs';

async function runSingleTask(task, options) {
  if (task.kind === 'eslint') return runEslintCommand({ ...options, fix: task.fix });
  if (task.kind === 'stylelint') return runStylelintCommand({ ...options, fix: task.fix });
  if (task.kind === 'prettier') return runPrettierCommand({ ...options, check: task.check });

  throw new Error(`Unsupported Web source quality task kind: ${task.kind}`);
}

export async function runWebSourceQualitySequence(task, options = {}) {
  if (task.kind !== 'sequence') {
    return runSingleTask(task, options);
  }

  for (const childTaskName of task.sequence) {
    const childTask = getWebSourceQualityTask(childTaskName);
    const exitCode = await runWebSourceQualitySequence(childTask, options);

    if (exitCode !== 0) {
      return exitCode;
    }
  }

  return 0;
}
