/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { closeSync, openSync, readSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { createExportFile } from '../model/export.model.mjs';
import { isBinaryFile, normalizePath, shouldExcludeDirectory, shouldExcludeFile } from './exclude.scanner.mjs';

const BINARY_SAMPLE_SIZE_BYTES = 8192;
const CONTROL_BYTE_RATIO_THRESHOLD = 0.3;

function hasBinaryContentSignature(absolutePath, sizeBytes) {
  if (Number(sizeBytes) <= 0) return false;

  const sampleSize = Math.min(Number(sizeBytes), BINARY_SAMPLE_SIZE_BYTES);
  const buffer = Buffer.allocUnsafe(sampleSize);
  let descriptor = null;

  try {
    descriptor = openSync(absolutePath, 'r');
    const bytesRead = readSync(descriptor, buffer, 0, sampleSize, 0);
    if (bytesRead <= 0) return false;

    let controlByteCount = 0;

    for (let index = 0; index < bytesRead; index += 1) {
      const byte = buffer[index];

      if (byte === 0) {
        return true;
      }

      const allowedWhitespace = byte === 9 || byte === 10 || byte === 12 || byte === 13;
      if ((byte < 32 && !allowedWhitespace) || byte === 127) {
        controlByteCount += 1;
      }
    }

    return controlByteCount / bytesRead >= CONTROL_BYTE_RATIO_THRESHOLD;
  } catch {
    return false;
  } finally {
    if (descriptor !== null) {
      try {
        closeSync(descriptor);
      } catch {}
    }
  }
}

function shouldRenderAsBinaryFile(absolutePath, sizeBytes) {
  if (isBinaryFile(absolutePath)) return true;
  return hasBinaryContentSignature(absolutePath, sizeBytes);
}

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
      if (shouldExcludeFile(entry.name, relativePath, options)) continue;

      const stat = statSync(absolutePath);

      files.push(
        createExportFile({
          absolutePath,
          relativePath,
          sizeBytes: stat.size,
          binary: shouldRenderAsBinaryFile(absolutePath, stat.size),
        }),
      );
    }
  }

  return files.sort((first, second) => first.relativePath.localeCompare(second.relativePath));
}
