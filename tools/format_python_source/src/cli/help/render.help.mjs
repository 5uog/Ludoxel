/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getPythonTargetDisplayPaths } from '../../config/target.config.mjs';
import { helpMessagesFor } from './message.help.mjs';

function lines(values) {
  return values.join('\n');
}

function option(flag, description) {
  return `  ${flag.padEnd(28)} ${description}`;
}

function section(title, content) {
  return `${title}\n${content}`;
}

function taskText(task, language) {
  const text = task.text?.[language] || task.text?.ja || task.text?.en || {};
  return {
    label: text.label || task.name,
    description: text.description || task.name,
  };
}

export function renderPythonQualityHelp(task, language = 'ja') {
  const messages = helpMessagesFor(language);
  const text = taskText(task, language);
  const targets = getPythonTargetDisplayPaths();

  return lines([
    `${messages.title}: ${task.name}`,
    '',
    section(messages.purpose, `  ${text.description}`),
    '',
    section(messages.synopsis, lines([`  npm run ${task.npmScript} -- [options]`, `  node tools/format_python_source/scripts/run/${task.entryFile} [options]`])),
    '',
    section(messages.options, lines([option('--help, -h', messages.helpOption), option('--lang ja|en', messages.languageOption), option('--language ja|en', messages.languageOption), option('--locale ja|en', messages.languageOption)])),
    '',
    section(messages.targets, lines([`  ${messages.targetDescription}`, ...targets.map((targetPath) => `  - ${targetPath}`)])),
  ]);
}

export function renderPythonQualityArgumentErrors(errors, task, language = 'ja') {
  const messages = helpMessagesFor(language);
  return lines([...errors.map((error) => `Error: ${error}`), '', messages.unknownOptionHint, '', renderPythonQualityHelp(task, language)]);
}
