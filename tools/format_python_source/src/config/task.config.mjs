/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { RUFF_MODES } from './ruff.config.mjs';

export const PYTHON_SOURCE_QUALITY_TASKS = Object.freeze({
  LINT: 'lint',
  FORMAT: 'format',
  FORMAT_CHECK: 'format-check',
});

const TASKS = Object.freeze([
  {
    name: PYTHON_SOURCE_QUALITY_TASKS.LINT,
    npmScript: 'lint:py',
    entryFile: 'lint.run.mjs',
    ruffMode: RUFF_MODES.CHECK,
    text: {
      ja: {
        label: 'lint',
        description: 'Ruff check を実行し、Python ソースを検査する。',
      },
      en: {
        label: 'lint',
        description: 'Run Ruff check for Python source files.',
      },
    },
  },
  {
    name: PYTHON_SOURCE_QUALITY_TASKS.FORMAT,
    npmScript: 'format:py',
    entryFile: 'format.run.mjs',
    ruffMode: RUFF_MODES.FORMAT,
    text: {
      ja: {
        label: 'format',
        description: 'Ruff format を実行し、Python ソースを整形する。',
      },
      en: {
        label: 'format',
        description: 'Run Ruff format for Python source files.',
      },
    },
  },
  {
    name: PYTHON_SOURCE_QUALITY_TASKS.FORMAT_CHECK,
    npmScript: 'format:py:check',
    entryFile: 'format-check.run.mjs',
    ruffMode: RUFF_MODES.FORMAT_CHECK,
    text: {
      ja: {
        label: 'format-check',
        description: 'Ruff format --check を実行し、Python ソースの整形状態を検査する。',
      },
      en: {
        label: 'format-check',
        description: 'Run Ruff format --check for Python source files.',
      },
    },
  },
]);

const TASK_MAP = new Map(TASKS.map((task) => [task.name, Object.freeze(task)]));

export function getPythonSourceQualityTask(taskName) {
  const task = TASK_MAP.get(String(taskName || ''));
  if (!task) {
    throw new Error(`Unknown Python source quality task: ${taskName}`);
  }
  return task;
}
