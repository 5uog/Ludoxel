/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { collectAudioConversionTargets } from '../collect/audio.collect.mjs';
import { displayPath } from '../shared/file/audio.file.mjs';
import { commandExists } from '../shared/process/run.process.mjs';

export function checkAudioAssets(options = {}, context = {}) {
  const targets = collectAudioConversionTargets();

  if (targets.length === 0) {
    console.log('[convert_audio_assets] no .ogg audio assets found.');
    if (options.requireFfmpeg && !commandExists('ffmpeg', context.env)) {
      console.error('[convert_audio_assets] ffmpeg is required but was not found.');
      return 1;
    }
    return 0;
  }

  const missing = targets.filter((target) => !target.wavExists);

  for (const target of targets) {
    const state = target.wavExists ? 'ok' : 'missing wav';
    console.log(`[convert_audio_assets] ${state}: ${displayPath(target.oggPath)} -> ${displayPath(target.wavPath)}`);
  }

  if (options.requireFfmpeg && !commandExists('ffmpeg', context.env)) {
    console.error('[convert_audio_assets] ffmpeg is required but was not found.');
    return 1;
  }

  if (missing.length > 0) {
    console.warn(`[convert_audio_assets] warning: ${missing.length} .ogg files do not have corresponding generated .wav files.`);
    console.warn('[convert_audio_assets] run `npm run assets:audio:convert` after installing ffmpeg when generated .wav derivatives are required.');
    if (options.requireWav) {
      return 1;
    }
  }

  return 0;
}
