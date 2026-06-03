/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { RUFF_BINARY_CACHE_ROOT } from '../../config/path.config.mjs';
import { extractRuffArchive } from './archive.release.mjs';
import { findCachedRuffBinary, installRuffBinaryFromExtractedArchive } from './cache.release.mjs';
import { downloadFile } from './download.release.mjs';
import { detectRuffTargetTriple } from './platform.release.mjs';
import { getRuffReleaseAssetName, getRuffReleaseUrl } from './url.release.mjs';

export async function resolveRuffBinary() {
  if (process.env.RUFF) {
    return process.env.RUFF;
  }

  const targetTriple = detectRuffTargetTriple();
  const cachedBinary = await findCachedRuffBinary(targetTriple);

  if (cachedBinary) {
    return cachedBinary;
  }

  await mkdir(RUFF_BINARY_CACHE_ROOT, { recursive: true });

  const workRoot = await mkdtemp(resolve(tmpdir(), 'ruff-download-'));
  const archivePath = resolve(workRoot, getRuffReleaseAssetName(targetTriple));
  const extractRoot = resolve(workRoot, 'extract');

  try {
    await downloadFile(getRuffReleaseUrl(targetTriple), archivePath);
    await extractRuffArchive(archivePath, extractRoot);

    return await installRuffBinaryFromExtractedArchive({
      extractedRoot: extractRoot,
      targetTriple,
    });
  } finally {
    await rm(workRoot, { recursive: true, force: true });
  }
}
