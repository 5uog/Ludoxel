/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runProcess } from '../../shared/node/process.node.mjs';
import { buildEslintCommand } from './build.eslint.mjs';

export async function runEslintCommand(options = {}) {
  const command = buildEslintCommand(options);
  console.log(`[format_web_source] ${command.displayCommand}`);
  const exitCode = await runProcess(command, options);
  if (exitCode === 0) {
    console.log(`[format_web_source] ESLint ${options.fix ? 'completed with --fix' : 'passed'}.`);
  } else {
    console.error(`[format_web_source] ESLint failed. exitCode=${exitCode}`);
  }
  return exitCode;
}
