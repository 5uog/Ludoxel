/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MACOS_DOC_CANDIDATES, MACOS_REQUIRED_TERMS } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';

export function renderMacosStatus() {
  return [
    'Ludoxel macOS app bundle status',
    '',
    'Status:',
    '  .app bundle generation is implemented through PyInstaller for the macOS wgpu-native/Metal renderer path.',
    '',
    'Verified by the macOS build path:',
    '  - Verify the wgpu-native renderer contract against the macOS Metal path.',
    '  - Collect wgpu and rendercanvas only for the macOS bundle.',
    '  - Include the presentation-layer macOS cursor recenter helper used by gameplay mouse capture.',
    '  - Preserve bundled assets, fonts, legal material, and Python framework links.',
    '  - Verify .icns icon presence, Ludoxel Info.plist identity fields, and keyboard input monitoring usage text.',
    '  - Re-sign the .app after Info.plist patching and verify the final bundle signature.',
    '',
    'Release work outside this tool:',
    '  - Codesigning and notarization.',
    '',
  ].join('\n');
}

export function checkMacosPackagingDocs() {
  const checkedFiles = [];
  const combined = [];

  for (const relativePath of MACOS_DOC_CANDIDATES) {
    const absolutePath = resolve(PROJECT_ROOT, relativePath);
    if (!existsSync(absolutePath)) continue;
    checkedFiles.push(relativePath);
    combined.push(readFileSync(absolutePath, 'utf8'));
  }

  if (checkedFiles.length === 0) {
    console.error('macOS packaging check failed: README.md does not exist.');
    return 1;
  }

  const text = combined.join('\n');
  const failures = MACOS_REQUIRED_TERMS.filter((term) => !text.includes(term));

  if (failures.length > 0) {
    console.error('macOS packaging check failed.');
    for (const term of failures) {
      console.error(`  - missing term in README.md: ${term}`);
    }
    console.error(`  checked files: ${checkedFiles.join(', ')}`);
    return 1;
  }

  console.log(`macOS packaging check passed. checked files: ${checkedFiles.join(', ')}`);
  return 0;
}
