/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { WEB_SOURCE_TARGET_GROUPS, getWebSourceTargetPaths } from '../../config/target.config.mjs';
import { runProcess } from '../../shared/node/process.node.mjs';
import { buildStylelintCommand } from './build.stylelint.mjs';

export async function runStylelintCommand(options = {}) {
  if (getWebSourceTargetPaths(WEB_SOURCE_TARGET_GROUPS.STYLELINT).length === 0) {
    console.log('[format_web_source] Stylelint skipped because no CSS files exist.');
    return 0;
  }

  const command = buildStylelintCommand(options);
  console.log(`[format_web_source] ${command.displayCommand}`);
  const exitCode = await runProcess(command, options);

  if (exitCode === 0) {
    console.log(`[format_web_source] Stylelint ${options.fix ? 'completed with --fix' : 'passed'}.`);
  } else {
    console.error(`[format_web_source] Stylelint failed. exitCode=${exitCode}`);
  }

  return exitCode;
}
