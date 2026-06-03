/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { resolve } from 'node:path';
import { NODE_MODULES_BIN } from '../../config/path.config.mjs';

export function normalizePathSeparators(value) {
  return String(value || '').replace(/\\/g, '/');
}

export function binaryPathFor(binaryName, platform = process.platform) {
  const executableName = platform === 'win32' ? `${binaryName}.cmd` : binaryName;
  return resolve(NODE_MODULES_BIN, executableName);
}

export function displayBinaryPath(binaryName, platform = process.platform) {
  return normalizePathSeparators(`node_modules/.bin/${binaryName}${platform === 'win32' ? '.cmd' : ''}`);
}
