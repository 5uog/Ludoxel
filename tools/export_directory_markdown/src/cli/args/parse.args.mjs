/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { DEFAULT_TARGET } from '../../config/profile.config.mjs';

export function parseExportArgs(argv = []) {
  const parsed = {
    target: DEFAULT_TARGET,
    format: 'both',
    output: null,
    overwrite: false,
    includeHidden: false,
    failOnUnreadable: false,
    maxBytes: 'unlimited',
    help: false,
    language: 'ja',
    errors: [],
  };

  let positionalUsed = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--format') {
      parsed.format = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg === '--output') {
      parsed.output = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg === '--overwrite') {
      parsed.overwrite = true;
      continue;
    }

    if (arg === '--include-hidden') {
      parsed.includeHidden = true;
      continue;
    }

    if (arg === '--fail-on-unreadable') {
      parsed.failOnUnreadable = true;
      continue;
    }

    if (arg === '--max-bytes') {
      parsed.maxBytes = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg === '--lang' || arg === '--language' || arg === '--locale') {
      parsed.language = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      parsed.errors.push(`Unknown option: ${arg}`);
      continue;
    }

    if (positionalUsed) {
      parsed.errors.push(`Unexpected argument: ${arg}`);
      continue;
    }

    parsed.target = arg;
    positionalUsed = true;
  }

  return parsed;
}
