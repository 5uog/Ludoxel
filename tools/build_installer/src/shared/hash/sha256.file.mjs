/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { createHash } from 'node:crypto';
import { createReadStream, statSync } from 'node:fs';

export function sha256File(path) {
  return new Promise((resolvePromise, rejectPromise) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    stream.on('error', rejectPromise);
    hash.on('error', rejectPromise);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolvePromise(hash.digest('hex')));
  });
}

export function fileSizeBytes(path) {
  return statSync(path).size;
}
