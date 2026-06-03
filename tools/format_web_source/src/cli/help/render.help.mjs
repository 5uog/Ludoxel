/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { buildWebSourceQualityCommandPlan } from '../../command/sequence/build.sequence.mjs';
import { WEB_SOURCE_TARGET_GROUPS, getWebSourceTargetDisplayPaths } from '../../config/target.config.mjs';
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
    targetScope: text.targetScope || '',
  };
}

function targetGroupForTask(task) {
  if (task.kind === 'eslint') return WEB_SOURCE_TARGET_GROUPS.ESLINT;
  if (task.kind === 'stylelint') return WEB_SOURCE_TARGET_GROUPS.STYLELINT;
  if (task.kind === 'prettier' && task.check) return WEB_SOURCE_TARGET_GROUPS.PRETTIER_CHECK;
  if (task.kind === 'prettier') return WEB_SOURCE_TARGET_GROUPS.PRETTIER;
  return null;
}

function renderTargets(task, language) {
  if (task.kind === 'sequence') {
    return [`  ${taskText(task, language).targetScope}`];
  }

  const group = targetGroupForTask(task);
  const targets = group ? getWebSourceTargetDisplayPaths(group) : [];
  return targets.map((target) => `  - ${target.path} (${target.role})`);
}

function renderCommandPlan(task) {
  return buildWebSourceQualityCommandPlan(task.name).map((command) => `  - ${command.displayCommand}`);
}

function renderSequence(task, language) {
  const messages = helpMessagesFor(language);

  if (task.kind !== 'sequence') {
    return [`  ${messages.noSequence}`];
  }

  return task.sequence.map((step, index) => `  ${index + 1}. ${step}`);
}

export function renderWebSourceQualityHelp(task, language = 'ja') {
  const messages = helpMessagesFor(language);
  const text = taskText(task, language);

  return lines([
    `${messages.title}: ${task.name}`,
    '',
    section(messages.purpose, `  ${text.description}`),
    '',
    section(messages.synopsis, lines([`  npm run ${task.npmScript} -- [options]`, `  node tools/format_web_source/scripts/run/${task.entryFile} [options]`])),
    '',
    section(
      messages.options,
      lines([
        option('--help, -h', messages.helpOption),
        option('--lang ja|en', messages.languageOption),
        option('--language ja|en', messages.languageOption),
        option('--locale ja|en', messages.languageOption),
      ]),
    ),
    '',
    section(messages.targets, lines(renderTargets(task, language))),
    '',
    section(messages.sequence, lines(renderSequence(task, language))),
    '',
    section(messages.commandPlan, lines(renderCommandPlan(task))),
  ]);
}

export function renderWebSourceQualityArgumentErrors(errors, task, language = 'ja') {
  const messages = helpMessagesFor(language);
  return lines([...errors.map((error) => `Error: ${error}`), '', messages.unknownOptionHint, '', renderWebSourceQualityHelp(task, language)]);
}
