/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { WEB_SOURCE_TARGET_GROUPS, getWebSourceTargetPaths } from '../../config/target.config.mjs';
import { STYLELINT_CONFIG_PATH, WEB_SOURCE_TOOL_BINARIES, WEB_SOURCE_TOOLS } from '../../config/tool.config.mjs';
import { binaryPathFor, displayBinaryPath } from '../../shared/node/path.node.mjs';

export function buildStylelintCommand(options = {}) {
  const binaryName = WEB_SOURCE_TOOL_BINARIES[WEB_SOURCE_TOOLS.STYLELINT];
  const args = ['--config', STYLELINT_CONFIG_PATH, ...getWebSourceTargetPaths(WEB_SOURCE_TARGET_GROUPS.STYLELINT)];

  if (options.fix) {
    args.push('--fix');
  }

  return {
    tool: WEB_SOURCE_TOOLS.STYLELINT,
    executable: binaryPathFor(binaryName, options.platform),
    args,
    cwd: PROJECT_ROOT,
    displayCommand: [displayBinaryPath(binaryName, options.platform), ...args].join(' '),
  };
}
