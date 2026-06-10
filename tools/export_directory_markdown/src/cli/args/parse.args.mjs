/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { DEFAULT_TARGET } from '../../config/profile.config.mjs';

function readOptionValue(argv, index, optionName, parsed) {
  const value = argv[index + 1];

  if (!value || value === '--') {
    parsed.errors.push(`Missing value for ${optionName}`);
    return { value: '', nextIndex: index };
  }

  return { value, nextIndex: index + 1 };
}

function readInlineOrNextValue(argv, index, optionName, parsed) {
  const arg = argv[index];
  const inlinePrefix = `${optionName}=`;

  if (arg.startsWith(inlinePrefix)) {
    const value = arg.slice(inlinePrefix.length);
    if (!value) parsed.errors.push(`Missing value for ${optionName}`);
    return { value, nextIndex: index };
  }

  return readOptionValue(argv, index, optionName, parsed);
}

export function parseExportArgs(argv = []) {
  const parsed = {
    target: DEFAULT_TARGET,
    format: 'both',
    output: null,
    overwrite: false,
    includeHidden: false,
    failOnUnreadable: false,
    maxBytes: 'unlimited',
    exclude: [],
    include: [],
    help: false,
    language: 'ja',
    errors: [],
  };

  let targetWasSpecified = false;

  function setTarget(value, source) {
    if (!value) {
      parsed.errors.push(`Missing value for ${source}`);
      return;
    }

    if (targetWasSpecified) {
      parsed.errors.push('target was specified more than once.');
      return;
    }

    parsed.target = value;
    targetWasSpecified = true;
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--target' || arg.startsWith('--target=')) {
      const result = readInlineOrNextValue(argv, index, '--target', parsed);
      setTarget(result.value, '--target');
      index = result.nextIndex;
      continue;
    }

    if (arg === '--exclude' || arg.startsWith('--exclude=')) {
      const result = readInlineOrNextValue(argv, index, '--exclude', parsed);
      if (result.value) parsed.exclude.push(result.value);
      index = result.nextIndex;
      continue;
    }

    if (arg === '--include' || arg.startsWith('--include=')) {
      const result = readInlineOrNextValue(argv, index, '--include', parsed);
      if (result.value) parsed.include.push(result.value);
      index = result.nextIndex;
      continue;
    }

    if (arg === '--format' || arg.startsWith('--format=')) {
      const result = readInlineOrNextValue(argv, index, '--format', parsed);
      parsed.format = result.value;
      index = result.nextIndex;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const result = readInlineOrNextValue(argv, index, '--output', parsed);
      parsed.output = result.value;
      index = result.nextIndex;
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

    if (arg === '--max-bytes' || arg.startsWith('--max-bytes=')) {
      const result = readInlineOrNextValue(argv, index, '--max-bytes', parsed);
      parsed.maxBytes = result.value;
      index = result.nextIndex;
      continue;
    }

    if (arg === '--lang' || arg === '--language' || arg === '--locale') {
      const result = readOptionValue(argv, index, arg, parsed);
      parsed.language = result.value;
      index = result.nextIndex;
      continue;
    }

    if (arg.startsWith('--lang=') || arg.startsWith('--language=') || arg.startsWith('--locale=')) {
      const optionName = arg.slice(0, arg.indexOf('='));
      const result = readInlineOrNextValue(argv, index, optionName, parsed);
      parsed.language = result.value;
      continue;
    }

    if (arg.startsWith('-')) {
      parsed.errors.push(`Unknown option: ${arg}`);
      continue;
    }

    setTarget(arg, 'target');
  }

  return parsed;
}
