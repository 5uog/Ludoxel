/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getWebSourceQualityTask } from '../../config/task.config.mjs';
import { buildEslintCommand } from '../eslint/build.eslint.mjs';
import { buildPrettierCommand } from '../prettier/build.prettier.mjs';
import { buildStylelintCommand } from '../stylelint/build.stylelint.mjs';

function buildSingleCommand(task) {
  if (task.kind === 'eslint') return [buildEslintCommand({ fix: task.fix })];
  if (task.kind === 'stylelint') return [buildStylelintCommand({ fix: task.fix })];
  if (task.kind === 'prettier') return [buildPrettierCommand({ check: task.check })];

  throw new Error(`Task ${task.name} cannot be built as a single command.`);
}

export function buildWebSourceQualityCommandPlan(taskName, seen = []) {
  const task = getWebSourceQualityTask(taskName);

  if (seen.includes(task.name)) {
    throw new Error(`Circular Web source quality sequence: ${[...seen, task.name].join(' -> ')}`);
  }

  if (task.kind !== 'sequence') {
    return buildSingleCommand(task);
  }

  return task.sequence.flatMap((childTaskName) => buildWebSourceQualityCommandPlan(childTaskName, [...seen, task.name]));
}
