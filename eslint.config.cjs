/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', 'third-party/**', '.venv/**', '.venv_ludoxel/**', '__pycache__/**', 'tools/export_directory_markdown/output/**', 'tools/format_python_source/.cache/**', 'assets/**', 'configs/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      curly: 'off',
      eqeqeq: 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['eslint.config.cjs', 'stylelint.config.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
];
