/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const HELP_MESSAGES = Object.freeze({
  ja: {
    title: 'Rust Source Quality CLI Help',
    purpose: '目的',
    synopsis: '実行形式',
    options: 'オプション',
    targets: '対象',
    commandPlan: '実行コマンド',
    helpOption: 'ヘルプを表示して終了する。',
    languageOption: 'ヘルプ表示言語を指定する。',
    unknownOptionHint: '--help で利用可能なオプションを確認してください。',
    noTargets: 'native/ 配下に Rust crate 又は Cargo workspace が見つからない。',
  },
  en: {
    title: 'Rust Source Quality CLI Help',
    purpose: 'Purpose',
    synopsis: 'Synopsis',
    options: 'Options',
    targets: 'Targets',
    commandPlan: 'Command plan',
    helpOption: 'Print this help and exit.',
    languageOption: 'Select help language.',
    unknownOptionHint: 'Use --help to display available options.',
    noTargets: 'No Rust crate or Cargo workspace was found under native/.',
  },
});

export function helpMessagesFor(language) {
  return HELP_MESSAGES[language] || HELP_MESSAGES.ja;
}
