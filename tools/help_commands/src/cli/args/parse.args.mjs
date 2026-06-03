/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function parseHelpArgs(argv = []) {
  const parsed = {
    command: null,
    help: false,
    language: 'ja',
    errors: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--lang' || arg === '--language' || arg === '--locale') {
      const value = argv[index + 1];
      if (!value) {
        parsed.errors.push(`${arg} requires ja or en.`);
        continue;
      }
      parsed.language = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      parsed.errors.push(`Unknown option: ${arg}`);
      continue;
    }

    if (parsed.command) {
      parsed.errors.push(`Unexpected argument: ${arg}`);
      continue;
    }

    parsed.command = arg;
  }

  return parsed;
}
