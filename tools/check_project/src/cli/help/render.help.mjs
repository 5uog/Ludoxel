/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { checkHelpMessagesFor } from './message.help.mjs';

function lines(values) {
  return values.join('\n');
}

function section(title, content) {
  return `${title}\n${content}`;
}

function renderIndentedLines(values) {
  return lines(values.map((value) => `  ${value}`));
}

function usageScriptFor(checkName) {
  if (checkName === 'legal') return 'license:check';
  if (checkName === 'shaders') return 'shader:check';
  return `${checkName}:check`;
}

export function renderCheckHelp(checkName, language = 'ja') {
  const messages = checkHelpMessagesFor(language);
  const description = messages.descriptions[checkName] || checkName;

  return lines([`${messages.titlePrefix}: ${checkName}`, '', section(messages.labels.purpose, `  ${description}`), '', section(messages.labels.options, renderIndentedLines(messages.options)), '', section(messages.labels.synopsis, `  npm run ${usageScriptFor(checkName)} -- [options]`), '']);
}

export function renderCheckErrors(errors, checkName, language = 'ja') {
  return lines([...errors.map((error) => `Error: ${error}`), '', renderCheckHelp(checkName, language)]);
}
