/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const ESLINT_CONFIG_PATH = 'eslint.config.cjs';
export const STYLELINT_CONFIG_PATH = 'stylelint.config.cjs';
export const PRETTIER_CONFIG_PATH = '.prettierrc.json';
export const PRETTIER_IGNORE_PATH = '.prettierignore';

export const WEB_SOURCE_TOOLS = Object.freeze({
  ESLINT: 'ESLint',
  STYLELINT: 'Stylelint',
  PRETTIER: 'Prettier',
});

export const WEB_SOURCE_TOOL_BINARIES = Object.freeze({
  [WEB_SOURCE_TOOLS.ESLINT]: 'eslint',
  [WEB_SOURCE_TOOLS.STYLELINT]: 'stylelint',
  [WEB_SOURCE_TOOLS.PRETTIER]: 'prettier',
});
