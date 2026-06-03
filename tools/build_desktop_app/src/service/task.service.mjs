/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runMacosBuild } from './macos-build.service.mjs';
import { checkMacosPackagingDocs, renderMacosStatus } from './macos-status.service.mjs';
import { runWindowsBuild } from './windows-build.service.mjs';

export function runDesktopBuildTask(options, context = {}) {
  if (options.command === 'windows') {
    return runWindowsBuild({ ...options, env: context.env });
  }

  if (options.command === 'macos') {
    if (options.check) {
      return checkMacosPackagingDocs();
    }

    if (options.status) {
      console.log(renderMacosStatus());
      return 0;
    }

    return runMacosBuild({ ...options, env: context.env });
  }

  console.error(`Unknown desktop build command: ${options.command}`);
  return 2;
}
