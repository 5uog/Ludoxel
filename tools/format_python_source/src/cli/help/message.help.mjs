/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const HELP_MESSAGES = Object.freeze({
  ja: {
    title: 'Python Source Quality CLI Help',
    purpose: '目的',
    synopsis: '実行形式',
    options: 'オプション',
    targets: '対象',
    helpOption: 'ヘルプを表示して終了する。',
    languageOption: 'ヘルプ表示言語を指定する。',
    unknownOptionHint: '--help で利用可能なオプションを確認してください。',
    targetDescription: 'Ruff の対象範囲は target.config.mjs と ruff.toml に従う。',
  },
  en: {
    title: 'Python Source Quality CLI Help',
    purpose: 'Purpose',
    synopsis: 'Synopsis',
    options: 'Options',
    targets: 'Targets',
    helpOption: 'Print this help and exit.',
    languageOption: 'Select help language.',
    unknownOptionHint: 'Use --help to display available options.',
    targetDescription: 'Ruff target paths are defined by target.config.mjs and ruff.toml.',
  },
});

export function helpMessagesFor(language) {
  return HELP_MESSAGES[language] || HELP_MESSAGES.ja;
}
