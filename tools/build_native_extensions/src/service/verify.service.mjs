/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { compiledBinaryStateForSources } from '../collect/binary.collect.mjs';
import { collectNativeExtensionSources } from '../collect/source.collect.mjs';
import { displayPath } from '../shared/file/find.file.mjs';

export function verifyNativeExtensions(options = {}) {
  const sources = compiledBinaryStateForSources(collectNativeExtensionSources());
  const missingCompiled = sources.filter((source) => source.binaries.length === 0);

  for (const source of sources) {
    console.log(`native source: ${source.id}: ${source.moduleName} -> ${source.displayPath}`);

    if (source.binaries.length === 0) {
      console.log('  compiled extension: none; Python fallback source exists.');
      continue;
    }

    for (const binary of source.binaries) {
      console.log(`  compiled extension: ${displayPath(binary)}`);
    }
  }

  if (options.requireBuilt && missingCompiled.length > 0) {
    console.error('Native extension verification failed because --require-built was specified.');

    for (const source of missingCompiled) {
      console.error(`  - missing compiled extension for ${source.id}: ${source.moduleName}`);
    }

    return 1;
  }

  console.log('Native extension verification completed.');
  return 0;
}
