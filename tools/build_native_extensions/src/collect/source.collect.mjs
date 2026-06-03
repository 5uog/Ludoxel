/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { NATIVE_EXTENSION_MODULES } from '../config/native.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { displayPath } from '../shared/file/find.file.mjs';

export function collectNativeExtensionSources() {
  const sources = [];

  for (const target of NATIVE_EXTENSION_MODULES) {
    const absolutePath = resolve(PROJECT_ROOT, target.sourcePath);

    if (!existsSync(absolutePath)) {
      throw new Error(`Native extension source is missing for ${target.id}: ${target.sourcePath}`);
    }

    sources.push({
      id: target.id,
      moduleName: target.moduleName,
      sourcePath: absolutePath,
      sourceDirectory: dirname(absolutePath),
      displayPath: displayPath(absolutePath),
    });
  }

  return sources;
}
