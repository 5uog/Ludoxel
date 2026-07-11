/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { PROJECT_ROOT } from '../../config/path.config.mjs';

function quoteDisplayArg(value) {
  return /\s/.test(value) ? JSON.stringify(value) : value;
}

export function buildRustFormatCommand(target, task, env = process.env) {
  const executable = String(env.CARGO || 'cargo');
  const args = ['fmt', '--manifest-path', target.manifestPath];

  if (target.kind === 'workspace') {
    args.push('--all');
  }

  if (task.check) {
    args.push('--', '--check');
  }

  return {
    executable,
    args,
    cwd: PROJECT_ROOT,
    displayCommand: [executable, ...args].map(quoteDisplayArg).join(' '),
    target,
  };
}
