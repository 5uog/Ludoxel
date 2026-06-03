/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const LANGUAGES = new Set(['ja', 'en']);

export function validateAudioAssetArgs(parsed) {
  const errors = [...parsed.errors];

  if (!LANGUAGES.has(parsed.language)) {
    errors.push(`Unsupported language: ${parsed.language}`);
  }

  if (parsed.command === 'check' && parsed.dryRun) {
    errors.push('audio check does not accept --dry-run.');
  }

  if (parsed.command === 'check' && parsed.overwrite) {
    errors.push('audio check does not accept --overwrite.');
  }

  return {
    ...parsed,
    language: LANGUAGES.has(parsed.language) ? parsed.language : 'ja',
    errors,
  };
}
