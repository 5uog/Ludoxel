/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { relative } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

export function normalizePath(path) {
  return path.replace(/\\/g, '/');
}

export function displayPath(path) {
  return normalizePath(relative(PROJECT_ROOT, path));
}
