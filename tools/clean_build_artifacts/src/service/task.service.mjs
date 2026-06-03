/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { rmSync } from 'node:fs';
import { collectCleanTargets } from '../collect/target.collect.mjs';
import { displayPath } from '../shared/file/path.file.mjs';

export function runCleanTask(options = {}) {
  const targets = collectCleanTargets(options);

  if (targets.length === 0) {
    console.log('[clean_build_artifacts] no build artifacts found.');
    return 0;
  }

  for (const target of targets) {
    const label = options.checkOnly || options.dryRun ? 'would remove' : 'remove';
    console.log(`[clean_build_artifacts] ${label}: ${displayPath(target)}`);

    if (!options.checkOnly && !options.dryRun) {
      rmSync(target, { recursive: true, force: true });
    }
  }

  return 0;
}
