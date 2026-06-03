/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from './path.config.mjs';

export const PYTHON_SOURCE_TARGETS = Object.freeze([
  {
    name: 'ludoxel_source',
    path: 'src',
    role: 'Ludoxel package source',
  },
  {
    name: 'ludoxel_tools',
    path: 'tools',
    role: 'repository tool source',
  },
]);

export function getPythonTargetPaths() {
  return PYTHON_SOURCE_TARGETS.map((target) => resolve(PROJECT_ROOT, target.path)).filter((targetPath) => existsSync(targetPath));
}

export function getPythonTargetDisplayPaths() {
  return PYTHON_SOURCE_TARGETS.filter((target) => existsSync(resolve(PROJECT_ROOT, target.path))).map((target) => `${target.path} (${target.role})`);
}
