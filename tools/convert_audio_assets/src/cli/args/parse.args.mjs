/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function parseAudioAssetArgs(argv = [], defaults = {}) {
  const parsed = {
    command: defaults.command || 'convert',
    help: false,
    dryRun: false,
    overwrite: false,
    requireFfmpeg: false,
    requireWav: false,
    language: 'ja',
    errors: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = String(argv[index] ?? '');

    if (arg === 'help' || arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === 'convert' || arg === 'check') {
      parsed.command = arg;
      continue;
    }

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (arg === '--overwrite') {
      parsed.overwrite = true;
      continue;
    }

    if (arg === '--require-ffmpeg') {
      parsed.requireFfmpeg = true;
      continue;
    }

    if (arg === '--require-wav') {
      parsed.requireWav = true;
      continue;
    }

    if (arg === '--lang' || arg === '--language' || arg === '--locale') {
      const value = argv[index + 1];
      if (!value || String(value).startsWith('-')) {
        parsed.errors.push(`${arg} requires ja or en.`);
        continue;
      }
      parsed.language = String(value);
      index += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      parsed.errors.push(`Unknown option: ${arg}`);
      continue;
    }

    parsed.errors.push(`Unknown audio asset command: ${arg}`);
  }

  return parsed;
}
