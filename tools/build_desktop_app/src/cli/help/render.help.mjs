/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { desktopBuildHelpMessagesFor } from './message.help.mjs';

function lines(values) {
  return values.join('\n');
}

function section(title, content) {
  return `${title}\n${content}`;
}

function option(flag, description) {
  return `  ${flag.padEnd(30)} ${description}`;
}

function renderLineRecords(records) {
  return lines(records.map((record) => option(record.flag, record.description)));
}

function renderIndentedLines(values) {
  return lines(values.map((value) => `  ${value}`));
}

function helpKeyForCommand(command) {
  if (command === 'windows') return 'windows';
  if (command === 'macos') return 'macos';
  return 'desktop';
}

export function renderDesktopBuildHelp(command = null, language = 'ja') {
  const messages = desktopBuildHelpMessagesFor(language);
  const key = helpKeyForCommand(command);
  const help = messages[key];

  if (key === 'desktop') {
    return lines([
      messages.titles.desktop,
      '',
      section(messages.labels.purpose, `  ${help.purpose}`),
      '',
      section(messages.labels.synopsis, renderIndentedLines(help.synopsis)),
      '',
      section(messages.labels.commands, renderLineRecords(help.commands)),
      '',
    ]);
  }

  return lines([
    messages.titles[key],
    '',
    section(messages.labels.purpose, `  ${help.purpose}`),
    '',
    section(messages.labels.synopsis, renderIndentedLines(help.synopsis)),
    '',
    section(messages.labels.options, renderLineRecords(help.options)),
    '',
  ]);
}

export function renderDesktopBuildErrors(errors, command = null, language = 'ja') {
  return lines([...errors.map((error) => `Error: ${error}`), '', renderDesktopBuildHelp(command, language)]);
}
