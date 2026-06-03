/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseWebSourceQualityArgs } from '../args/parse.args.mjs';
import { validateWebSourceQualityArgs } from '../args/validate.args.mjs';
import { renderWebSourceQualityArgumentErrors, renderWebSourceQualityHelp } from '../help/render.help.mjs';
import { runWebSourceQualitySequence } from '../../command/sequence/run.sequence.mjs';

export async function executeWebSourceQualityCli(task, argv = [], env = process.env) {
  const parsedArgs = parseWebSourceQualityArgs(argv);
  const options = validateWebSourceQualityArgs(parsedArgs);

  if (options.help) {
    console.log(renderWebSourceQualityHelp(task, options.language));
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderWebSourceQualityArgumentErrors(options.errors, task, options.language));
    return 2;
  }

  return runWebSourceQualitySequence(task, { env });
}
