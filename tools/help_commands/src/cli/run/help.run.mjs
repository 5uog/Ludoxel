/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseHelpArgs } from '../args/parse.args.mjs';
import { validateHelpArgs } from '../args/validate.args.mjs';
import { renderHelpDetail, renderHelpErrors, renderHelpIndex } from '../help/render.help.mjs';
import { findHelpCommand } from '../../config/task.config.mjs';

export async function runHelpCli(argv = []) {
  const options = validateHelpArgs(parseHelpArgs(argv));

  if (options.errors.length > 0) {
    console.error(renderHelpErrors(options.errors, options.language));
    return 2;
  }

  if (!options.command || options.help) {
    console.log(renderHelpIndex(options.language));
    return 0;
  }

  const command = findHelpCommand(options.command);

  if (!command) {
    console.error(renderHelpErrors([`Unknown command: ${options.command}`], options.language));
    console.log(renderHelpIndex(options.language));
    return 2;
  }

  console.log(renderHelpDetail(command, options.language));
  return 0;
}
