/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const HELP_FLAGS = new Set(['--help', '-h']);
const WINDOWS_FLAGS = new Set(['--windows']);
const MACOS_FLAGS = new Set(['--macos']);
const BOOLEAN_FLAGS = new Set(['--dry-run', '--skip-payload-build', '--skip-native-build', '--keep-build-cache', '--check']);

export function parseInstallerBuildArgs(argv = []) {
  const parsed = {
    command: null,
    help: false,
    dryRun: false,
    skipPayloadBuild: false,
    skipNativeBuild: false,
    keepBuildCache: false,
    check: false,
    language: 'ja',
    errors: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = String(argv[index] ?? '');

    if (arg === 'help' || HELP_FLAGS.has(arg)) {
      parsed.help = true;
      continue;
    }

    if (arg === 'windows' || WINDOWS_FLAGS.has(arg)) {
      if (parsed.command && parsed.command !== 'windows') {
        parsed.errors.push(`Conflicting installer build target: ${parsed.command} and windows.`);
      }
      parsed.command = 'windows';
      continue;
    }

    if (arg === 'macos' || MACOS_FLAGS.has(arg)) {
      if (parsed.command && parsed.command !== 'macos') {
        parsed.errors.push(`Conflicting installer build target: ${parsed.command} and macos.`);
      }
      parsed.command = 'macos';
      continue;
    }

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (arg === '--skip-payload-build') {
      parsed.skipPayloadBuild = true;
      continue;
    }

    if (arg === '--skip-native-build') {
      parsed.skipNativeBuild = true;
      continue;
    }

    if (arg === '--keep-build-cache') {
      parsed.keepBuildCache = true;
      continue;
    }

    if (arg === '--check') {
      parsed.check = true;
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

    parsed.errors.push(`Unknown installer build command: ${arg}`);
  }

  return parsed;
}

export function installerBuildBooleanFlags() {
  return [...BOOLEAN_FLAGS];
}
