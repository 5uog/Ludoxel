/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { PROJECT_ROOT } from '../config/path.config.mjs';
import { runProcess } from '../shared/process/run.process.mjs';

function desktopBuildEntry(platform) {
  const script = platform === 'windows' ? 'windows.run.mjs' : 'macos.run.mjs';
  return resolve(PROJECT_ROOT, 'tools', 'build_desktop_app', 'scripts', 'run', script);
}

export function buildApplicationPayload(platform, options = {}) {
  const entry = desktopBuildEntry(platform);

  if (!existsSync(entry)) {
    throw new Error(`Application payload build entrypoint is missing: ${entry}`);
  }

  const args = [entry];
  if (options.skipNativeBuild) {
    args.push('--skip-native-build');
  }
  if (options.dryRun) {
    args.push('--dry-run');
  }

  console.log(`[build_installer] running application payload build: node ${args.join(' ')}`);
  return runProcess(process.execPath, args, { env: options.env });
}
