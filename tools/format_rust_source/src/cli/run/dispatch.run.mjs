/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getRustSourceQualityTask } from '../../config/task.config.mjs';
import { executeRustSourceQualityCli } from './execute.run.mjs';

export async function runRustSourceQualityCli(taskName, argv = [], env = process.env) {
  const task = getRustSourceQualityTask(taskName);
  return executeRustSourceQualityCli(task, argv, env);
}
