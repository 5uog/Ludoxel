/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const CHECK_HELP_MESSAGES = Object.freeze({
  ja: Object.freeze({
    titlePrefix: 'check_project',
    labels: Object.freeze({
      purpose: '目的',
      options: 'オプション',
      synopsis: '起動形式',
    }),
    descriptions: Object.freeze({
      package: 'package.json と主要設定の整合性を検査する。',
      docs: 'README / .github の旧経路・不適切な future tool 化を検査する。',
      legal: 'LICENSE / third-party / SPDX を検査する。',
      resources: 'assets / configs / generated output の扱いを検査する。',
      shaders: 'Ludoxel の renderer shader 契約を静的検査する。',
    }),
    options: Object.freeze(['--help, -h', '--lang ja|en', '--language ja|en', '--locale ja|en']),
  }),
  en: Object.freeze({
    titlePrefix: 'check_project',
    labels: Object.freeze({
      purpose: 'Purpose',
      options: 'Options',
      synopsis: 'Synopsis',
    }),
    descriptions: Object.freeze({
      package: 'Check package.json and core configuration consistency.',
      docs: 'Check README/.github for stale paths and invalid future tool surfaces.',
      legal: 'Check LICENSE, third-party, and SPDX headers.',
      resources: 'Check assets, configs, and generated output policy.',
      shaders: 'Statically check Ludoxel renderer shader sources.',
    }),
    options: Object.freeze(['--help, -h', '--lang ja|en', '--language ja|en', '--locale ja|en']),
  }),
});

export function checkHelpMessagesFor(language) {
  return CHECK_HELP_MESSAGES[language] || CHECK_HELP_MESSAGES.ja;
}
