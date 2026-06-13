/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { EXPORT_TARGETS } from '../../config/profile.config.mjs';
import { exportHelpMessagesFor } from './message.help.mjs';

function targetDescription(target, messages) {
  return messages.targetDescriptions[target.name] || target.description;
}

function renderIndentedLines(values) {
  return values.map((value) => `  ${value}`);
}

export function renderExportHelp(language = 'ja') {
  const messages = exportHelpMessagesFor(language);

  return [
    messages.title,
    '',
    messages.labels.usage,
    ...renderIndentedLines(messages.usage),
    '',
    messages.labels.targets,
    ...Object.values(EXPORT_TARGETS).map((target) => `  ${target.name.padEnd(8)} ${targetDescription(target, messages)}`),
    '',
    messages.labels.options,
    ...renderIndentedLines(messages.options),
    '',
    messages.labels.examples,
    ...renderIndentedLines(messages.examples),
    '',
  ].join('\n');
}

export function renderExportErrors(errors, language = 'ja') {
  return [...errors.map((error) => `Error: ${error}`), '', renderExportHelp(language)].join('\n');
}
