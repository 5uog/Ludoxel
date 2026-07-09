/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { DEFAULT_PREVIEW_FIT_PADDING_PX, DEFAULT_PREVIEW_PITCH_DEGREES, DEFAULT_PREVIEW_ROLL_DEGREES, DEFAULT_PREVIEW_SCALE_FACTOR, DEFAULT_PREVIEW_YAW_DEGREES } from '../../config/preview.config.mjs';

const VALUE_OPTIONS = new Map([
  ['--texture-root', 'textureRoot'],
  ['--output-root', 'outputRoot'],
  ['--block', 'block'],
  ['--blocks', 'block'],
  ['--model-category', 'modelCategory'],
  ['--state', 'state'],
  ['--neighbor', 'neighbor'],
  ['--yaw', 'yaw'],
  ['--pitch', 'pitch'],
  ['--roll', 'roll'],
  ['--scale', 'scale'],
  ['--fit-padding', 'fitPadding'],
  ['--lang', 'language'],
  ['--language', 'language'],
  ['--locale', 'language'],
]);

export function parseBlockThumbnailArgs(argv = [], defaults = {}) {
  const parsed = {
    command: defaults.command || 'generate',
    help: Boolean(defaults.help),
    language: defaults.language || 'ja',
    textureRoot: '',
    outputRoot: '',
    blocks: [],
    all: true,
    modelCategory: '',
    states: [],
    neighbors: [],
    yaw: DEFAULT_PREVIEW_YAW_DEGREES,
    pitch: DEFAULT_PREVIEW_PITCH_DEGREES,
    roll: DEFAULT_PREVIEW_ROLL_DEGREES,
    scale: DEFAULT_PREVIEW_SCALE_FACTOR,
    fitPadding: DEFAULT_PREVIEW_FIT_PADDING_PX,
    dryRun: false,
    allowOverwrite: false,
    errors: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = String(argv[index] ?? '');

    if (arg === '--help' || arg === '-h' || arg === 'help') {
      parsed.help = true;
      continue;
    }

    if (arg === '--all') {
      parsed.all = true;
      continue;
    }

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (arg === '--allow-overwrite') {
      parsed.allowOverwrite = true;
      continue;
    }

    const target = VALUE_OPTIONS.get(arg);
    if (target) {
      const value = argv[index + 1];
      if (value === undefined || String(value).startsWith('--')) {
        parsed.errors.push(`${arg} requires a value.`);
        continue;
      }

      index += 1;
      if (target === 'block') {
        parsed.blocks.push(
          ...String(value)
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean),
        );
        parsed.all = false;
      } else if (target === 'state') {
        parsed.states.push(String(value));
      } else if (target === 'neighbor') {
        parsed.neighbors.push(String(value));
      } else if (target === 'language') {
        parsed.language = String(value).trim().toLowerCase();
      } else if (['yaw', 'pitch', 'roll', 'scale', 'fitPadding'].includes(target)) {
        parsed[target] = Number(value);
      } else {
        parsed[target] = String(value);
      }
      continue;
    }

    parsed.errors.push(`Unknown option: ${arg}`);
  }

  return parsed;
}
