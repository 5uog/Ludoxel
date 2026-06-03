/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_OPTION_CLEAN_TARGETS, NATIVE_BINARY_SUFFIXES, STANDARD_CLEAN_TARGETS } from '../config/target.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { hasSuffix, listFiles } from '../shared/file/path.file.mjs';

function collectExistingRelativeTargets(relativeTargets) {
  return relativeTargets.map((relativePath) => resolve(PROJECT_ROOT, relativePath)).filter((path) => existsSync(path));
}

function collectNativeBinaries() {
  const srcRoot = resolve(PROJECT_ROOT, 'src');
  if (!existsSync(srcRoot)) {
    return [];
  }

  return listFiles(srcRoot).filter((path) => hasSuffix(path, NATIVE_BINARY_SUFFIXES));
}

export function collectCleanTargets(options = {}) {
  const targets = [...collectExistingRelativeTargets(STANDARD_CLEAN_TARGETS)];

  if (options.all) {
    targets.push(...collectExistingRelativeTargets(ALL_OPTION_CLEAN_TARGETS));
    targets.push(...collectNativeBinaries());
  }

  return [...new Set(targets)].sort();
}
