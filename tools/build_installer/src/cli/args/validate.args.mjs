/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const SUPPORTED_LANGUAGES = new Set(['ja', 'en']);

export function validateInstallerBuildArgs(parsed) {
  const errors = [...parsed.errors];
  const command = parsed.command || (parsed.help ? null : 'windows');

  if (!SUPPORTED_LANGUAGES.has(parsed.language)) {
    errors.push(`Unsupported language: ${parsed.language}`);
  }

  return {
    ...parsed,
    command,
    language: SUPPORTED_LANGUAGES.has(parsed.language) ? parsed.language : 'ja',
    errors,
  };
}
