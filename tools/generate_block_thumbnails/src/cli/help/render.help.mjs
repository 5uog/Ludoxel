/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { BLOCK_THUMBNAIL_HELP_MESSAGES } from './message.help.mjs';

function selectLanguage(language) {
  return Object.hasOwn(BLOCK_THUMBNAIL_HELP_MESSAGES, language) ? language : 'ja';
}

export function renderBlockThumbnailHelp(command = 'generate', language = 'ja') {
  const messages = BLOCK_THUMBNAIL_HELP_MESSAGES[selectLanguage(language)];
  const normalizedCommand = Object.hasOwn(messages.title, command) ? command : 'generate';
  const lines = [messages.title[normalizedCommand], ''];

  lines.push('Purpose');
  for (const line of messages.purpose) lines.push(`  ${line}`);
  lines.push('');

  for (const section of messages.sections) {
    lines.push(section.heading);
    for (const line of section.lines) lines.push(`  ${line}`);
    lines.push('');
  }

  return lines.join('\n');
}
