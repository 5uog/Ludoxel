/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

export function projectPath(relativePath) {
  return resolve(PROJECT_ROOT, relativePath);
}

export function displayPath(path) {
  return relative(PROJECT_ROOT, path).replace(/\\/g, '/');
}

export function ensureDirectory(path) {
  mkdirSync(path, { recursive: true });
}

export function removeIfExists(path) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

export function copyIfExists(source, destination) {
  if (!existsSync(source)) return false;
  ensureDirectory(dirname(destination));
  cpSync(source, destination, { recursive: true, force: true });
  return true;
}

export function fileExists(relativePath) {
  return existsSync(projectPath(relativePath));
}
