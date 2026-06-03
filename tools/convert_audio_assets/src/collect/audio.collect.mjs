/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { dirname, extname, resolve, basename } from 'node:path';
import { listOggFiles } from '../shared/file/audio.file.mjs';

function wavPathForOgg(oggPath) {
  const base = basename(oggPath, extname(oggPath));
  return resolve(dirname(oggPath), `${base}.wav`);
}

export function collectAudioConversionTargets() {
  return listOggFiles().map((oggPath) => {
    const wavPath = wavPathForOgg(oggPath);
    return {
      oggPath,
      wavPath,
      wavExists: existsSync(wavPath),
    };
  });
}
