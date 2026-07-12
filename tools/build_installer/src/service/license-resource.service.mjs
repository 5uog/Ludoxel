/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { PROJECT_ROOT } from '../config/path.config.mjs';
import { copyIfExists } from '../shared/file/path.file.mjs';
import { sha256File } from '../shared/hash/sha256.file.mjs';

export function rootLicensePath() {
  const path = resolve(PROJECT_ROOT, 'LICENSE');
  if (!existsSync(path)) {
    throw new Error(`Root LICENSE is missing: ${path}`);
  }
  return path;
}

export async function rootLicenseSha256() {
  return sha256File(rootLicensePath());
}

export function collectLicenseResource(legalStagingDir) {
  const source = rootLicensePath();
  const destination = resolve(legalStagingDir, 'LICENSE');
  if (!copyIfExists(source, destination)) {
    throw new Error(`Failed to collect LICENSE into installer embedded legal resources: ${source} -> ${destination}`);
  }
  return destination;
}
