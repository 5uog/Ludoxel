/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { runProcess } from '../../shared/process/run.process.mjs';

export function buildNativeExtensionsBeforeDesktop(options = {}) {
  const entry = resolve(PROJECT_ROOT, 'tools', 'build_native_extensions', 'scripts', 'run', 'build.run.mjs');

  if (!existsSync(entry)) {
    throw new Error(`Native build entrypoint is missing: ${entry}`);
  }

  if (options.dryRun) {
    console.log(`[build_desktop_app] would run native build: node ${entry}`);
    return 0;
  }

  console.log('[build_desktop_app] running native extension build before desktop package.');
  return runProcess(process.execPath, [entry], { env: options.env });
}
