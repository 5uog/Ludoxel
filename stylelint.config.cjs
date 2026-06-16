/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
module.exports = {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    'third-party/**',
    '.venv/**',
    '.venv_ludoxel/**',
    'tools/export_directory_markdown/output/**',
    'assets/**',
    'configs/**',
    'src/website/dist/**',
    'src/website/.vite/**',
    'src/website/node_modules/**',
    'src/website/.vercel/**',
  ],
  rules: {
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'font-family-name-quotes': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'layer', 'screen', 'variants', 'responsive'],
      },
    ],
  },
};
