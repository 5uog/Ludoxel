/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { delimiter } from 'node:path';
import { pythonPreviewArguments } from '../collect/blocks.collect.mjs';
import { PROJECT_ROOT, SOURCE_ROOT } from '../config/path.config.mjs';
import { runProcess } from '../shared/process/run.process.mjs';

function pythonEnvironment(env = {}) {
  return {
    ...env,
    PYTHONPATH: [SOURCE_ROOT, env.PYTHONPATH].filter(Boolean).join(delimiter),
  };
}

export function checkBlockThumbnails(options, context = {}) {
  const env = pythonEnvironment(context.env);
  return runProcess(env.PYTHON || 'python3', pythonPreviewArguments(options, 'check'), { cwd: PROJECT_ROOT, env });
}
