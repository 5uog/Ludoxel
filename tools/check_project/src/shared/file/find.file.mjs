/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_IGNORES = new Set(['node_modules', '.git', 'dist', 'build', '.venv', '.venv_ludoxel', '__pycache__', '.artifacts', 'Sudoku', 'output']);

export function listFiles(root, options = {}) {
  const ignored = new Set([...(options.ignoredNames || DEFAULT_IGNORES)]);
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

    entries.sort((first, second) => first.name.localeCompare(second.name));

    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;

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
