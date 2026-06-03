/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const COMMANDS = new Set(['help', 'list', 'build', 'verify']);

export function parseNativeExtensionArgs(argv = [], defaults = {}) {
  const parsed = {
    command: defaults.defaultCommand || 'build',
    help: false,
    skipVerify: false,
    requireBuilt: false,
    language: 'ja',
    errors: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = String(argv[index] ?? '');

    if (arg === 'help' || arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (COMMANDS.has(arg)) {
      if (arg === 'help') {
        parsed.help = true;
        continue;
      }
      parsed.command = arg;
      continue;
    }

    if (arg === '--skip-verify') {
      parsed.skipVerify = true;
      continue;
    }

    if (arg === '--require-built') {
      parsed.requireBuilt = true;
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

    parsed.errors.push(`Unknown native extension command: ${arg}`);
  }

  return parsed;
}
