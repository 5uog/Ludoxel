/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parsePythonQualityArgs } from '../args/parse.args.mjs';
import { validatePythonQualityArgs } from '../args/validate.args.mjs';
import { renderPythonQualityArgumentErrors, renderPythonQualityHelp } from '../help/render.help.mjs';
import { runPythonSourceQualityTask } from '../../quality/service/task.service.mjs';

export async function executePythonQualityCli(task, argv = [], env = process.env) {
  const parsedArgs = parsePythonQualityArgs(argv);
  const options = validatePythonQualityArgs(parsedArgs);

  if (options.help) {
    console.log(renderPythonQualityHelp(task, options.language));
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderPythonQualityArgumentErrors(options.errors, task, options.language));
    return 2;
  }

  return runPythonSourceQualityTask(task.name, { env });
}
