/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { PROJECT_ROOT } from '../config/path.config.mjs';
import { ensureDirectory } from '../shared/file/path.file.mjs';

export const GENERATED_LICENSE_MODULE_RELATIVE_PATH = 'src/ludoxel/presentation/documentation/legal/_generated_license_text.py';

function buildPythonModuleSource(licenseText) {
  const literal = JSON.stringify(licenseText);

  return `from __future__ import annotations

LICENSE_TEXT: str = ${literal}
`;
}

export function generateLicenseTextModule() {
  const licensePath = resolve(PROJECT_ROOT, 'LICENSE');
  if (!existsSync(licensePath)) {
    throw new Error(`Root LICENSE is missing: ${licensePath}`);
  }

  const licenseText = readFileSync(licensePath, 'utf8');
  const outputPath = resolve(PROJECT_ROOT, GENERATED_LICENSE_MODULE_RELATIVE_PATH);
  ensureDirectory(dirname(outputPath));
  writeFileSync(outputPath, buildPythonModuleSource(licenseText));

  return outputPath;
}
