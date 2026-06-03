/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

export function readTextIfExists(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf8');
}

export function displayPath(path) {
  return relative(PROJECT_ROOT, path).replace(/\\/g, '/');
}
