/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { checkAudioAssets } from './check.service.mjs';
import { convertAudioAssets } from './convert.service.mjs';

export function runAudioAssetTask(options, context = {}) {
  if (options.command === 'check') {
    return checkAudioAssets(options, context);
  }

  if (options.command === 'convert') {
    return convertAudioAssets(options, context);
  }

  console.error(`Unknown audio asset command: ${options.command}`);
  return 2;
}
