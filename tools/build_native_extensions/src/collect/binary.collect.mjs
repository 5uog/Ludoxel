/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { extname, join, basename } from 'node:path';
import { COMPILED_EXTENSION_SUFFIXES } from '../config/native.config.mjs';
import { listFiles } from '../shared/file/find.file.mjs';

export function compiledBinariesForSource(source) {
  const stem = basename(source.sourcePath, '.py');

  return listFiles(source.sourceDirectory).filter((path) => {
    const extension = extname(path);
    if (!COMPILED_EXTENSION_SUFFIXES.includes(extension)) return false;
    return basename(path).startsWith(stem);
  });
}

export function compiledBinaryStateForSources(sources) {
  return sources.map((source) => ({
    ...source,
    binaries: compiledBinariesForSource(source),
  }));
}
