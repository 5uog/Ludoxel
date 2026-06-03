/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { extname } from 'node:path';
import { DEFAULT_BINARY_EXTENSIONS, DEFAULT_EXCLUDED_DIRECTORY_NAMES, DEFAULT_EXCLUDED_RELATIVE_PREFIXES } from '../config/profile.config.mjs';

export function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

export function shouldExcludeDirectory(entryName, relativePath, options) {
  if (!options.includeHidden && entryName.startsWith('.')) return true;
  if (DEFAULT_EXCLUDED_DIRECTORY_NAMES.includes(entryName)) return true;

  const normalized = normalizePath(relativePath);
  return DEFAULT_EXCLUDED_RELATIVE_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

export function isBinaryFile(path) {
  return DEFAULT_BINARY_EXTENSIONS.includes(extname(path).toLowerCase());
}
