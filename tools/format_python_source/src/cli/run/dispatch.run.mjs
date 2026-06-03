/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getPythonSourceQualityTask } from '../../config/task.config.mjs';
import { executePythonQualityCli } from './execute.run.mjs';

export async function runPythonQualityCli(taskName, argv = [], env = process.env) {
  const task = getPythonSourceQualityTask(taskName);
  return executePythonQualityCli(task, argv, env);
}
