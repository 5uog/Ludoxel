/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const DESCRIPTIONS = Object.freeze({
  package: {
    ja: 'package.json と主要設定の整合性を検査する。',
    en: 'Check package.json and core configuration consistency.',
  },
  docs: {
    ja: 'README / .github の旧経路・不適切な future tool 化を検査する。',
    en: 'Check README/.github for stale paths and invalid future tool surfaces.',
  },
  legal: {
    ja: 'LICENSE / NOTICE / third-party / SPDX を検査する。',
    en: 'Check LICENSE, NOTICE, third-party, and SPDX headers.',
  },
  resources: {
    ja: 'assets / configs / generated output の扱いを検査する。',
    en: 'Check assets, configs, and generated output policy.',
  },
  shaders: {
    ja: 'Ludoxel の renderer shader 契約を静的検査する。',
    en: 'Statically check Ludoxel renderer shader sources.',
  },
});

function text(value, language) {
  return value?.[language] || value?.ja || value?.en || '';
}

export function renderCheckHelp(checkName, language = 'ja') {
  const usageScript = checkName === 'legal' ? 'license:check' : checkName === 'shaders' ? 'shader:check' : `${checkName}:check`;

  return [
    `check_project: ${checkName}`,
    '',
    `Purpose: ${text(DESCRIPTIONS[checkName], language)}`,
    '',
    'Options:',
    '  --help, -h',
    '  --lang ja|en',
    '  --language ja|en',
    '  --locale ja|en',
    '',
    `Usage: npm run ${usageScript} -- [options]`,
    '',
  ].join('\n');
}

export function renderCheckErrors(errors, checkName, language = 'ja') {
  return [...errors.map((error) => `Error: ${error}`), '', renderCheckHelp(checkName, language)].join('\n');
}
