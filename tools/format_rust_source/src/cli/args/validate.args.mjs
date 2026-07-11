/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const SUPPORTED_LANGUAGES = new Set(['ja', 'en']);

export function validateRustSourceQualityArgs(parsed) {
  const errors = [...parsed.errors];

  if (!SUPPORTED_LANGUAGES.has(parsed.language)) {
    errors.push(`Unsupported language: ${parsed.language}`);
  }

  return {
    help: parsed.help,
    language: SUPPORTED_LANGUAGES.has(parsed.language) ? parsed.language : 'ja',
    errors,
  };
}
