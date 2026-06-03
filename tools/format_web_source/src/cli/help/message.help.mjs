/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const HELP_MESSAGES = Object.freeze({
  ja: {
    title: 'Web Source Quality CLI Help',
    purpose: '目的',
    synopsis: '実行形式',
    options: 'オプション',
    targets: '対象',
    sequence: '実行順序',
    commandPlan: '実行コマンド',
    helpOption: 'ヘルプを表示して終了する。',
    languageOption: 'ヘルプ表示言語を指定する。',
    unknownOptionHint: '--help で利用可能なオプションを確認してください。',
    noSequence: '単一タスクのため、子タスクはない。',
  },
  en: {
    title: 'Web Source Quality CLI Help',
    purpose: 'Purpose',
    synopsis: 'Synopsis',
    options: 'Options',
    targets: 'Targets',
    sequence: 'Sequence',
    commandPlan: 'Command plan',
    helpOption: 'Print this help and exit.',
    languageOption: 'Select help language.',
    unknownOptionHint: 'Use --help to display available options.',
    noSequence: 'This is a single task and has no child task.',
  },
});

export function helpMessagesFor(language) {
  return HELP_MESSAGES[language] || HELP_MESSAGES.ja;
}
