/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const RUFF_VERSION = '0.15.11';

export const RUFF_MODES = Object.freeze({
  CHECK: 'check',
  IMPORT_FIX: 'import-fix',
  FORMAT: 'format',
  FORMAT_CHECK: 'format-check',
});

export const RUFF_MODE_ARGS = Object.freeze({
  [RUFF_MODES.CHECK]: ['check'],
  [RUFF_MODES.IMPORT_FIX]: ['check', '--select', 'I', '--fix'],
  [RUFF_MODES.FORMAT]: ['format'],
  [RUFF_MODES.FORMAT_CHECK]: ['format', '--check'],
});
