/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { printCheckResult } from '../../service/report.service.mjs';
import { GENERATED_IGNORE_TERMS, REQUIRED_RUNTIME_PATH_TERMS } from './resources.policy.mjs';

export function checkResources() {
  const failures = [];
  const notes = [];
  const gitignorePath = resolve(PROJECT_ROOT, '.gitignore');

  if (!existsSync(gitignorePath)) {
    failures.push('.gitignore is missing');
  } else {
    const text = readFileSync(gitignorePath, 'utf8');
    for (const term of GENERATED_IGNORE_TERMS) {
      if (!text.includes(term)) failures.push(`.gitignore missing generated/local rule: ${term}`);
    }
  }

  const pathsModule = resolve(PROJECT_ROOT, 'src', 'ludoxel', 'foundations', 'locations', 'roots.py');
  const integrityModule = resolve(PROJECT_ROOT, 'src', 'ludoxel', 'application', 'persistence', 'integrity', 'manifest.py');
  const visualAssetRootsModule = resolve(PROJECT_ROOT, 'src', 'ludoxel', 'presentation', 'resources', 'asset_roots.py');

  if (!existsSync(pathsModule)) {
    failures.push('runtime path module is missing');
  } else {
    const text = readFileSync(pathsModule, 'utf8');
    for (const term of REQUIRED_RUNTIME_PATH_TERMS) {
      if (!text.includes(term)) failures.push(`runtime path handling missing term: ${term}`);
    }
  }

  if (!existsSync(integrityModule)) failures.push('application persistence integrity manifest module is missing');
  if (!existsSync(visualAssetRootsModule)) {
    failures.push('shared visual asset root resolver is missing');
  } else {
    const text = readFileSync(visualAssetRootsModule, 'utf8');
    for (const term of ['assets/ludoxel', 'assets/minecraft', 'block_texture_dir', 'block_thumbnail_dir']) {
      if (!text.includes(term.split('/').at(-1)) && !text.includes(term)) failures.push(`visual asset root resolver missing term: ${term}`);
    }
  }

  if (existsSync(resolve(PROJECT_ROOT, 'assets'))) notes.push('assets/ exists and must stay ignored until provenance is reviewed');
  if (existsSync(resolve(PROJECT_ROOT, 'configs'))) notes.push('previous-format configs/ exists; runtime writes must use the app-managed data root and may migrate this only as previous-format input');
  if (existsSync(resolve(PROJECT_ROOT, 'tools', 'export_directory_markdown', 'output'))) {
    notes.push('tools/export_directory_markdown/output exists; it must stay ignored and generated');
  }

  return printCheckResult('resources', failures, notes);
}
