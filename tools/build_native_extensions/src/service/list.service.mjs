/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { compiledBinaryStateForSources } from '../collect/binary.collect.mjs';
import { collectNativeExtensionSources } from '../collect/source.collect.mjs';
import { displayPath } from '../shared/file/find.file.mjs';

export function listNativeExtensions() {
  const sources = compiledBinaryStateForSources(collectNativeExtensionSources());

  console.log('Native extension source targets:');

  for (const source of sources) {
    console.log(`  - ${source.id}: ${source.moduleName}`);
    console.log(`    source: ${source.displayPath}`);

    if (source.binaries.length === 0) {
      console.log('    compiled: none');
      continue;
    }

    for (const binary of source.binaries) {
      console.log(`    compiled: ${displayPath(binary)}`);
    }
  }

  return 0;
}
