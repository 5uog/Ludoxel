/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { WEB_SOURCE_TARGET_GROUPS, getWebSourceTargetPaths } from '../../config/target.config.mjs';
import { ESLINT_CONFIG_PATH, WEB_SOURCE_TOOL_BINARIES, WEB_SOURCE_TOOLS } from '../../config/tool.config.mjs';
import { binaryPathFor, displayBinaryPath } from '../../shared/node/path.node.mjs';

export function buildEslintCommand(options = {}) {
  const binaryName = WEB_SOURCE_TOOL_BINARIES[WEB_SOURCE_TOOLS.ESLINT];
  const args = ['--config', ESLINT_CONFIG_PATH, ...getWebSourceTargetPaths(WEB_SOURCE_TARGET_GROUPS.ESLINT)];

  if (options.fix) {
    args.push('--fix');
  }

  return {
    tool: WEB_SOURCE_TOOLS.ESLINT,
    executable: binaryPathFor(binaryName, options.platform),
    args,
    cwd: PROJECT_ROOT,
    displayCommand: [displayBinaryPath(binaryName, options.platform), ...args].join(' '),
  };
}
