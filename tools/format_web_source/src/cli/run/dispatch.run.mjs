/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getWebSourceQualityTask } from '../../config/task.config.mjs';
import { executeWebSourceQualityCli } from './execute.run.mjs';

export async function runWebSourceQualityCli(taskName, argv = [], env = process.env) {
  const task = getWebSourceQualityTask(taskName);
  return executeWebSourceQualityCli(task, argv, env);
}
