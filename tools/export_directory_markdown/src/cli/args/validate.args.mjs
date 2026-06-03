/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { EXPORT_TARGETS } from '../../config/profile.config.mjs';

const FORMATS = new Set(['tree', 'code', 'both']);
const LANGUAGES = new Set(['ja', 'en']);

export function validateExportArgs(parsed) {
  const errors = [...parsed.errors];

  if (!Object.hasOwn(EXPORT_TARGETS, parsed.target)) {
    errors.push(`Unknown export target: ${parsed.target}`);
  }

  if (!FORMATS.has(parsed.format)) {
    errors.push(`Unknown export format: ${parsed.format}`);
  }

  if (!LANGUAGES.has(parsed.language)) {
    errors.push(`Unsupported language: ${parsed.language}`);
  }

  if (parsed.maxBytes !== 'unlimited' && !/^\d+$/u.test(String(parsed.maxBytes))) {
    errors.push(`--max-bytes must be a positive integer or unlimited: ${parsed.maxBytes}`);
  }

  return {
    ...parsed,
    language: LANGUAGES.has(parsed.language) ? parsed.language : 'ja',
    errors,
  };
}
