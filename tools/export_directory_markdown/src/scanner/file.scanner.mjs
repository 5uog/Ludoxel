/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { createExportFile } from '../model/export.model.mjs';
import { isBinaryFile, normalizePath, shouldExcludeDirectory } from './exclude.scanner.mjs';

export function scanExportFiles(root, targetDirectory, options) {
  const base = resolve(root, targetDirectory);
  const files = [];
  const stack = [base];

  while (stack.length > 0) {
    const current = stack.pop();
    let entries;

    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch (error) {
      if (options.failOnUnreadable) throw error;
      continue;
    }

    entries.sort((first, second) => {
      if (first.isDirectory() && !second.isDirectory()) return -1;
      if (!first.isDirectory() && second.isDirectory()) return 1;
      return first.name.localeCompare(second.name);
    });

    for (const entry of entries) {
      const absolutePath = resolve(current, entry.name);
      const relativePath = normalizePath(relative(root, absolutePath));

      if (entry.isDirectory()) {
        if (!shouldExcludeDirectory(entry.name, relativePath, options)) {
          stack.push(absolutePath);
        }
        continue;
      }

      if (!entry.isFile()) continue;
      if (!options.includeHidden && entry.name.startsWith('.')) continue;

      const stat = statSync(absolutePath);

      files.push(
        createExportFile({
          absolutePath,
          relativePath,
          sizeBytes: stat.size,
          binary: isBinaryFile(absolutePath),
        }),
      );
    }
  }

  return files.sort((first, second) => first.relativePath.localeCompare(second.relativePath));
}
