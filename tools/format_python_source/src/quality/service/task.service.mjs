/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getPythonSourceQualityTask, PYTHON_SOURCE_QUALITY_TASKS } from '../../config/task.config.mjs';
import { runPythonSourceQuality } from './source.service.mjs';

export { PYTHON_SOURCE_QUALITY_TASKS };

export async function runPythonSourceQualityTask(taskName, options = {}) {
  const task = getPythonSourceQualityTask(taskName);
  return runPythonSourceQuality(task, options);
}
