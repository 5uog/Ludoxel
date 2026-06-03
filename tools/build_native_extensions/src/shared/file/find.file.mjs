/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

const IGNORED_NAMES = new Set(['__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache', 'build', 'dist', 'node_modules']);

export function normalizePath(path) {
  return path.replace(/\\/g, '/');
}

export function displayPath(path) {
  return normalizePath(relative(PROJECT_ROOT, path));
}

export function listFiles(root) {
  const files = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    let entries;

    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (IGNORED_NAMES.has(entry.name)) continue;
      const fullPath = resolve(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}
