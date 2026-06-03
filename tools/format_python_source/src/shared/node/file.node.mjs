/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function findFileRecursive(root, fileName) {
  let entries;

  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    const entryPath = join(root, entry.name);

    if (entry.isFile() && entry.name === fileName) {
      return entryPath;
    }

    if (entry.isDirectory()) {
      const found = await findFileRecursive(entryPath, fileName);
      if (found) return found;
    }
  }

  return null;
}
