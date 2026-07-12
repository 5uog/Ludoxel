/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runMacosInstallerBuild } from './macos-installer-build.service.mjs';
import { checkMacosInstallerInputs, checkWindowsInstallerInputs } from './verify.service.mjs';
import { runWindowsInstallerBuild } from './windows-installer-build.service.mjs';

export async function runInstallerBuildTask(options, context = {}) {
  if (options.command === 'windows') {
    if (options.check) {
      return checkWindowsInstallerInputs();
    }
    return runWindowsInstallerBuild({ ...options, env: context.env });
  }

  if (options.command === 'macos') {
    if (options.check) {
      return checkMacosInstallerInputs();
    }
    return runMacosInstallerBuild({ ...options, env: context.env });
  }

  console.error(`Unknown installer build command: ${options.command}`);
  return 2;
}
