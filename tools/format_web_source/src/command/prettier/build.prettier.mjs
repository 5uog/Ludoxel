/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { WEB_SOURCE_TARGET_GROUPS, getWebSourceTargetPaths } from '../../config/target.config.mjs';
import { PRETTIER_CONFIG_PATH, PRETTIER_IGNORE_PATH, WEB_SOURCE_TOOL_BINARIES, WEB_SOURCE_TOOLS } from '../../config/tool.config.mjs';
import { binaryPathFor, displayBinaryPath } from '../../shared/node/path.node.mjs';

export function buildPrettierCommand(options = {}) {
  const targetGroup = options.check ? WEB_SOURCE_TARGET_GROUPS.PRETTIER_CHECK : WEB_SOURCE_TARGET_GROUPS.PRETTIER;
  const binaryName = WEB_SOURCE_TOOL_BINARIES[WEB_SOURCE_TOOLS.PRETTIER];
  const args = ['--config', PRETTIER_CONFIG_PATH, '--ignore-path', PRETTIER_IGNORE_PATH, ...getWebSourceTargetPaths(targetGroup), options.check ? '--check' : '--write'];

  return {
    tool: WEB_SOURCE_TOOLS.PRETTIER,
    executable: binaryPathFor(binaryName, options.platform),
    args,
    cwd: PROJECT_ROOT,
    displayCommand: [displayBinaryPath(binaryName, options.platform), ...args].join(' '),
  };
}
