/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { EXPORT_TARGETS } from '../../config/profile.config.mjs';

const FORMATS = new Set(['tree', 'code', 'both']);
const LANGUAGES = new Set(['ja', 'en']);
const EXCLUDE_KINDS = new Set(['folder', 'ext', 'file']);

function normalizePathValue(value) {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//u, '')
    .replace(/\/+/g, '/')
    .replace(/\/$/u, '');
}

function normalizeExtensionValue(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  return normalized.startsWith('.') ? normalized : `.${normalized}`;
}

function parseExcludeRule(rawRule, errors) {
  const raw = String(rawRule || '');
  const separatorIndex = raw.indexOf(':');

  if (separatorIndex <= 0) {
    errors.push(`--exclude must use folder:<value>, ext:<value>, or file:<value>: ${raw}`);
    return null;
  }

  const kind = raw.slice(0, separatorIndex).trim();
  const rawValue = raw.slice(separatorIndex + 1).trim();

  if (!EXCLUDE_KINDS.has(kind)) {
    errors.push(`Unknown --exclude kind: ${kind}`);
    return null;
  }

  if (!rawValue) {
    errors.push(`--exclude ${kind}: value must not be empty.`);
    return null;
  }

  const value = kind === 'ext' ? normalizeExtensionValue(rawValue) : normalizePathValue(rawValue);

  if (!value) {
    errors.push(`--exclude ${kind}: value must not be empty.`);
    return null;
  }

  return Object.freeze({ kind, value, raw });
}

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

  if (parsed.maxBytes !== 'unlimited' && !/^[1-9]\d*$/u.test(String(parsed.maxBytes))) {
    errors.push(`--max-bytes must be a positive integer or unlimited: ${parsed.maxBytes}`);
  }

  const excludeRules = [];
  for (const rawRule of parsed.exclude) {
    const rule = parseExcludeRule(rawRule, errors);
    if (rule) excludeRules.push(rule);
  }

  return {
    ...parsed,
    language: LANGUAGES.has(parsed.language) ? parsed.language : 'ja',
    excludeRules,
    errors,
  };
}
