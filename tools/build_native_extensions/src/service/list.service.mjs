/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { displayPath } from '../shared/file/find.file.mjs';
import { rustCrateStates } from './rust.service.mjs';

export function listNativeExtensions() {
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
