/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { randomUUID } from 'node:crypto';
import { copyFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';

import { ensureDirectory, removeIfExists } from './path.file.mjs';

function isFileLockError(error) {
  return error?.code === 'EPERM' || error?.code === 'EBUSY' || error?.code === 'EACCES';
}

function sleepMs(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.max(0, milliseconds));
}

export function atomicReplaceFile(stagedPath, publishDir, fileName, { maxAttempts = 60, retryDelayMs = 2000 } = {}) {
  if (maxAttempts < 1) {
    throw new Error(`maxAttempts must be at least 1 (got ${maxAttempts})`);
  }

  ensureDirectory(publishDir);
  const publishPath = resolve(publishDir, fileName);
  const pendingPath = resolve(publishDir, `${fileName}.pending-${randomUUID().replace(/-/g, '').slice(0, 12)}`);

  try {
    copyFileSync(stagedPath, pendingPath);
  } catch (error) {
    removeIfExists(pendingPath);
    throw error;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      renameSync(pendingPath, publishPath);
      return publishPath;
    } catch (error) {
      if (attempt < maxAttempts && isFileLockError(error)) {
        if (attempt === 1) {
          console.log(`[build_installer] ${publishPath} is locked (often antivirus scanning newly built files); retrying for up to ${Math.round((maxAttempts * retryDelayMs) / 1000)}s...`);
        }
        sleepMs(retryDelayMs);
        continue;
      }

      removeIfExists(pendingPath);
      if (isFileLockError(error)) {
        throw new Error(`Could not publish ${publishPath}: it is still in use after ${Math.round((maxAttempts * retryDelayMs) / 1000)}s of retrying. Close any running copy of it, check whether antivirus software is holding it, then run the build again.`, { cause: error });
      }

      throw error;
    }
  }

  return publishPath;
}
