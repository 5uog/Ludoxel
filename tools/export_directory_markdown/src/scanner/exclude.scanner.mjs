/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { basename, extname } from 'node:path';
import { DEFAULT_BINARY_EXTENSIONS, DEFAULT_EXCLUDED_DIRECTORY_NAMES, DEFAULT_EXCLUDED_RELATIVE_PREFIXES } from '../config/profile.config.mjs';

export function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//u, '').replace(/\/+/g, '/').replace(/\/$/u, '');
}

function pathMatchesNameOrRelativePath({ name, relativePath, ruleValue }) {
  const normalizedPath = normalizePath(relativePath);
  const normalizedRule = normalizePath(ruleValue);

  if (!normalizedRule.includes('/')) return name === normalizedRule;
  return normalizedPath === normalizedRule;
}

function matchesDefaultRelativePrefix(relativePath) {
  const normalized = normalizePath(relativePath);
  return DEFAULT_EXCLUDED_RELATIVE_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

function shouldExcludeByFolderRule(entryName, relativePath, rules) {
  return rules.some((rule) => rule.kind === 'folder' && pathMatchesNameOrRelativePath({ name: entryName, relativePath, ruleValue: rule.value }));
}

function shouldExcludeByFileRule(entryName, relativePath, rules) {
  return rules.some((rule) => rule.kind === 'file' && pathMatchesNameOrRelativePath({ name: entryName, relativePath, ruleValue: rule.value }));
}

function shouldExcludeByExtensionRule(relativePath, rules) {
  const extension = extname(relativePath).toLowerCase();
  return rules.some((rule) => rule.kind === 'ext' && extension === rule.value);
}

export function shouldExcludeDirectory(entryName, relativePath, options) {
  if (!options.includeHidden && entryName.startsWith('.')) return true;
  if (DEFAULT_EXCLUDED_DIRECTORY_NAMES.includes(entryName)) return true;
  if (matchesDefaultRelativePrefix(relativePath)) return true;

  return shouldExcludeByFolderRule(entryName, relativePath, options.excludeRules || []);
}

export function shouldExcludeFile(entryName, relativePath, options) {
  if (!options.includeHidden && entryName.startsWith('.')) return true;

  const rules = options.excludeRules || [];
  if (shouldExcludeByFileRule(entryName, relativePath, rules)) return true;
  if (shouldExcludeByExtensionRule(relativePath, rules)) return true;

  return shouldExcludeByFileRule(basename(relativePath), relativePath, rules);
}

export function isBinaryFile(path) {
  return DEFAULT_BINARY_EXTENSIONS.includes(extname(path).toLowerCase());
}
