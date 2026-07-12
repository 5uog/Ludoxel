/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { PROJECT_ROOT } from '../config/path.config.mjs';
import { copyIfExists } from '../shared/file/path.file.mjs';

export function rootThirdPartyDir() {
  const path = resolve(PROJECT_ROOT, 'third-party');
  if (!existsSync(path)) {
    throw new Error(`Root third-party/ is missing: ${path}`);
  }
  return path;
}

export function listThirdPartyMaterialNames() {
  return readdirSync(rootThirdPartyDir(), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(rootThirdPartyDir(), entry.name, 'LICENSE.txt')))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export function collectThirdPartyResource(legalStagingDir) {
  const source = rootThirdPartyDir();
  const destination = resolve(legalStagingDir, 'third-party');
  if (!copyIfExists(source, destination)) {
    throw new Error(`Failed to collect third-party/ into installer embedded legal resources: ${source} -> ${destination}`);
  }
  return destination;
}
