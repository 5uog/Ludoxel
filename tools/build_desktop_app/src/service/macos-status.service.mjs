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
    '  .app bundle generation is not implemented by this tool.',
    '',
    'Required work before claiming macOS packaging support:',
    '  - Document and resolve macOS OpenGL / GLSL constraints.',
    '  - Verify the renderer contract against macOS system OpenGL limits.',
    '  - Define PyInstaller .app data collection, icon, Info.plist, bundle identifier, codesign, and notarization handling.',
    '  - Verify frozen resource lookup and runtime config write locations in an actual .app bundle.',
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
