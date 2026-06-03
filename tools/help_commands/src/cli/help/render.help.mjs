/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { HELP_COMMANDS } from '../../config/task.config.mjs';

function text(value, language) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.ja || value.en || '';
}

function lines(values) {
  return values.join('\n');
}

function section(title, content) {
  return `${title}\n${content}`;
}

function optionLine(value) {
  return `  ${value}`;
}

export function renderHelpIndex(language = 'ja') {
  const title = language === 'en' ? 'Ludoxel repository tools' : 'Ludoxel repository tools';
  const usageTitle = language === 'en' ? 'Usage:' : '使い方:';
  const commandsTitle = language === 'en' ? 'Commands:' : 'コマンド:';
  const width = Math.max(...HELP_COMMANDS.map((command) => command.npmScript.length));

  return lines([
    title,
    '',
    usageTitle,
    '  npm run help',
    '  npm run help -- <command>',
    '  npm run <command> -- --help',
    '',
    commandsTitle,
    ...HELP_COMMANDS.map((command) => `  ${command.npmScript.padEnd(width)}  ${text(command.description, language)}`),
    '',
  ]);
}

export function renderHelpDetail(command, language = 'ja') {
  const labels = {
    purpose: language === 'en' ? 'Purpose' : '目的',
    synopsis: language === 'en' ? 'Synopsis' : '実行形式',
    options: language === 'en' ? 'Options' : 'オプション',
    examples: language === 'en' ? 'Examples' : '例',
  };

  return lines([
    command.npmScript,
    '',
    section(labels.purpose, `  ${text(command.description, language)}`),
    '',
    section(labels.synopsis, `  ${command.usage}`),
    '',
    section(labels.options, command.options.map(optionLine).join('\n')),
    '',
    section(labels.examples, command.examples.map((example) => `  ${example}`).join('\n')),
    '',
  ]);
}

export function renderHelpErrors(errors, language = 'ja') {
  const hint = language === 'en' ? 'Use --help to display help.' : '--help でヘルプを表示できます。';
  return lines([...errors.map((error) => `Error: ${error}`), '', hint, '']);
}
