/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { collectAudioConversionTargets } from '../collect/audio.collect.mjs';
import { displayPath } from '../shared/file/audio.file.mjs';
import { commandExists, runProcess } from '../shared/process/run.process.mjs';

export function convertAudioAssets(options = {}, context = {}) {
  const targets = collectAudioConversionTargets();

  if (targets.length === 0) {
    console.log('[convert_audio_assets] no .ogg audio assets found.');
    return 0;
  }

  const pending = options.overwrite ? targets : targets.filter((target) => !target.wavExists);

  if (pending.length === 0) {
    console.log('[convert_audio_assets] all .ogg assets already have corresponding .wav files.');
    return 0;
  }

  if (options.dryRun) {
    for (const target of pending) {
      console.log(`[convert_audio_assets] would convert: ${displayPath(target.oggPath)} -> ${displayPath(target.wavPath)}`);
    }
    return 0;
  }

  if (!commandExists('ffmpeg', context.env)) {
    console.error('[convert_audio_assets] ffmpeg was not found. Install ffmpeg or run with --dry-run.');
    return 1;
  }

  for (const target of pending) {
    console.log(`[convert_audio_assets] convert: ${displayPath(target.oggPath)} -> ${displayPath(target.wavPath)}`);
    const args = [options.overwrite ? '-y' : '-n', '-i', target.oggPath, target.wavPath];
    const exitCode = runProcess('ffmpeg', args, { env: context.env });
    if (exitCode !== 0) {
      return exitCode;
    }
  }

  return 0;
}
