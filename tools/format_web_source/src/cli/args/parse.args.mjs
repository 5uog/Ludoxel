/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function parseWebSourceQualityArgs(argv = []) {
  const parsed = {
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

    parsed.errors.push(`Unknown option: ${arg}`);
  }

  return parsed;
}
