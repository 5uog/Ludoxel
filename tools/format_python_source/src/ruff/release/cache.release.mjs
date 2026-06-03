/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { chmod, cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { RUFF_BINARY_CACHE_ROOT } from '../../config/path.config.mjs';
import { RUFF_VERSION } from '../../config/ruff.config.mjs';
import { findFileRecursive } from '../../shared/node/file.node.mjs';
import { getRuffBinaryName } from './platform.release.mjs';

export function getRuffInstallRoot(targetTriple) {
  return resolve(RUFF_BINARY_CACHE_ROOT, RUFF_VERSION, targetTriple);
}

export async function findCachedRuffBinary(targetTriple) {
  const cachedBinary = await findFileRecursive(getRuffInstallRoot(targetTriple), getRuffBinaryName());

  if (!cachedBinary) return null;

  await ensureRuffBinaryExecutable(cachedBinary);
  return cachedBinary;
}

export async function installRuffBinaryFromExtractedArchive({ extractedRoot, targetTriple }) {
  const installRoot = getRuffInstallRoot(targetTriple);

  await rm(installRoot, { recursive: true, force: true });
  await mkdir(installRoot, { recursive: true });
  await cp(extractedRoot, installRoot, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
  });

  const installedBinary = await findFileRecursive(installRoot, getRuffBinaryName());
  if (!installedBinary) {
    throw new Error(`Could not install ${getRuffBinaryName()} into cache.`);
  }

  await ensureRuffBinaryExecutable(installedBinary);
  return installedBinary;
}

export async function ensureRuffBinaryExecutable(binaryPath) {
  if (process.platform !== 'win32') {
    await chmod(binaryPath, 0o755);
  }
}
