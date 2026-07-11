/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseRustSourceQualityArgs } from '../args/parse.args.mjs';
import { validateRustSourceQualityArgs } from '../args/validate.args.mjs';
import { renderRustSourceQualityArgumentErrors, renderRustSourceQualityHelp } from '../help/render.help.mjs';
import { runRustSourceQualityTask } from '../../quality/service/task.service.mjs';

export async function executeRustSourceQualityCli(task, argv = [], env = process.env) {
  const parsedArgs = parseRustSourceQualityArgs(argv);
  const options = validateRustSourceQualityArgs(parsedArgs);

  if (options.help) {
    console.log(renderRustSourceQualityHelp(task, options.language, env));
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderRustSourceQualityArgumentErrors(options.errors, task, options.language, env));
    return 2;
  }

  return runRustSourceQualityTask(task.name, { env });
}
