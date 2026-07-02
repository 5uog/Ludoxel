/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { compiledBinaryStateForSources } from '../collect/binary.collect.mjs';
import { collectNativeExtensionSources } from '../collect/source.collect.mjs';
import { displayPath } from '../shared/file/find.file.mjs';
import { rustCrateStates } from './rust.service.mjs';

export function listNativeExtensions() {
  const sources = compiledBinaryStateForSources(collectNativeExtensionSources());

  console.log('Cython native extension source targets:');

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

  console.log('Rust native extension crate targets:');

  for (const state of rustCrateStates()) {
    console.log(`  - ${state.id}: ${state.moduleName}`);
    console.log(`    crate: ${displayPath(state.crateRoot)}`);
    console.log(`    fallback: ${state.fallbackModuleName}`);

    if (!state.installedExists) {
      console.log('    compiled: none');
      continue;
    }

    console.log(`    compiled: ${displayPath(state.installedArtifactPath)}${state.stale ? ' (stale; crate sources are newer)' : ''}`);
  }

  return 0;
}
