/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

import { MACOS_PAYLOAD_ARCHIVE_NAME } from '../config/build.config.mjs';
import { ensureDirectory } from '../shared/file/path.file.mjs';
import { runProcess } from '../shared/process/run.process.mjs';

export function archiveMacosPayload(appBundlePath, destinationDir) {
  if (process.platform !== 'darwin') {
    throw new Error('Archiving the macOS application bundle must run on macOS (it shells out to the system tar to preserve symlinks and executable bits).');
  }

  ensureDirectory(destinationDir);
  const archivePath = resolve(destinationDir, MACOS_PAYLOAD_ARCHIVE_NAME);
  const bundleParent = dirname(appBundlePath);
  const bundleName = basename(appBundlePath);

  const exitCode = runProcess('tar', ['-cf', archivePath, '-C', bundleParent, bundleName]);
  if (exitCode !== 0 || !existsSync(archivePath)) {
    throw new Error(`Failed to archive the macOS application bundle into ${archivePath} (tar exit ${exitCode}).`);
  }

  return archivePath;
}
