/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runProcess } from '../../shared/node/process.node.mjs';
import { renderRustCommandFailure, renderRustCommandStart, renderRustCommandSuccess } from '../../result/render.result.mjs';
import { buildRustFormatCommand } from './build.command.mjs';

export function runRustFormatCommand(target, task, options = {}) {
  const command = buildRustFormatCommand(target, task, options.env);
  console.log(renderRustCommandStart(command));

  const result = runProcess(command, options);
  if (result.exitCode === 0) {
    console.log(renderRustCommandSuccess(command, task));
  } else {
    console.error(renderRustCommandFailure(command, result));
  }

  return result.exitCode;
}
