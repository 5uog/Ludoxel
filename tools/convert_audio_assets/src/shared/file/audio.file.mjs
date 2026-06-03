/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { AUDIO_ROOT, PROJECT_ROOT } from '../../config/path.config.mjs';

export function displayPath(path) {
  return relative(PROJECT_ROOT, path).replace(/\\/g, '/');
}

export function listOggFiles() {
  if (!existsSync(AUDIO_ROOT)) {
    return [];
  }

  const files = [];
  const stack = [AUDIO_ROOT];

  while (stack.length > 0) {
    const current = stack.pop();
    let entries;

    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = resolve(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.ogg')) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}
