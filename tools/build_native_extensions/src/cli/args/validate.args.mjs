/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const LANGUAGES = new Set(['ja', 'en']);

export function validateNativeExtensionArgs(parsed) {
  const errors = [...parsed.errors];

  if (!LANGUAGES.has(parsed.language)) {
    errors.push(`Unsupported language: ${parsed.language}`);
  }

  if (parsed.command !== 'build' && parsed.skipVerify) {
    errors.push('--skip-verify is only valid for build.');
  }

  if (parsed.command !== 'verify' && parsed.requireBuilt) {
    errors.push('--require-built is only valid for verify.');
  }

  return {
    ...parsed,
    language: LANGUAGES.has(parsed.language) ? parsed.language : 'ja',
    errors,
  };
}
