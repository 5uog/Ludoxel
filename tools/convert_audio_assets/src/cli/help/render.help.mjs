/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { audioAssetHelpMessagesFor } from './message.help.mjs';

function lines(values) {
  return values.join('\n');
}

function option(flag, description) {
  return `  ${flag.padEnd(24)} ${description}`;
}

function renderIndentedLines(values) {
  return lines(values.map((value) => `  ${value}`));
}

function renderOptionRecords(records) {
  return lines(records.map((record) => option(record.flag, record.description)));
}

export function renderAudioAssetHelp(language = 'ja') {
  const messages = audioAssetHelpMessagesFor(language);

  return lines([
    messages.title,
    '',
    messages.labels.purpose,
    `  ${messages.purpose}`,
    '',
    messages.labels.synopsis,
    renderIndentedLines(messages.synopsis),
    '',
    messages.labels.options,
    renderOptionRecords(messages.options),
    '',
    messages.labels.defaultBehavior,
    renderIndentedLines(messages.defaultBehavior),
    '',
  ]);
}

export function renderAudioAssetErrors(errors, language = 'ja') {
  return lines([...errors.map((error) => `Error: ${error}`), '', renderAudioAssetHelp(language)]);
}
