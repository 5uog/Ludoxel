/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runProcess } from '../../shared/node/process.node.mjs';
import { buildPrettierCommand } from './build.prettier.mjs';

export async function runPrettierCommand(options = {}) {
  const command = buildPrettierCommand(options);
  console.log(`[format_web_source] ${command.displayCommand}`);
  return runProcess(command, options);
}
