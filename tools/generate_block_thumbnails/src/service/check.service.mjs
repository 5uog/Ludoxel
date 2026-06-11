/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { pythonThumbnailArguments } from '../collect/blocks.collect.mjs';
import { PROJECT_ROOT, PYTHON_HELPER } from '../config/path.config.mjs';
import { runProcess } from '../shared/process/run.process.mjs';

export function checkBlockThumbnails(options, context = {}) {
  return runProcess(context.env?.PYTHON || 'python3', [PYTHON_HELPER, ...pythonThumbnailArguments(options, 'check')], { cwd: PROJECT_ROOT, env: context.env });
}
