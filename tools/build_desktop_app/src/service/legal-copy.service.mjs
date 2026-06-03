/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { resolve } from 'node:path';
import { LEGAL_MATERIAL_PATHS } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { copyIfExists } from '../shared/file/path.file.mjs';

export function copyLegalMaterial(targetDir) {
  for (const relativePath of LEGAL_MATERIAL_PATHS) {
    const copied = copyIfExists(resolve(PROJECT_ROOT, relativePath), resolve(targetDir, relativePath));
    if (copied) {
      console.log(`[build_desktop_app] copied legal material: ${relativePath}`);
    } else {
      console.log(`[build_desktop_app] legal material not found, skipped: ${relativePath}`);
    }
  }
}
