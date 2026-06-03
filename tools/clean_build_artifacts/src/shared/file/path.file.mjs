/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readdirSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

const IGNORED_NAMES = new Set(['node_modules', '.git', 'dist', 'build', '.venv', '.venv_ludoxel']);

export function projectPath(relativePath) {
  return resolve(PROJECT_ROOT, relativePath);
}

export function displayPath(path) {
  return relative(PROJECT_ROOT, path).replace(/\\/g, '/');
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

export function pathExists(path) {
  return existsSync(path);
}

export function hasSuffix(path, suffixes) {
  return suffixes.includes(extname(path).toLowerCase());
}
