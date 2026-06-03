/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseCheckArgs } from '../args/parse.args.mjs';
import { validateCheckArgs } from '../args/validate.args.mjs';
import { renderCheckHelp, renderCheckErrors } from '../help/render.help.mjs';
import { runProjectCheck } from '../../service/check.service.mjs';

export async function runProjectCheckCli(checkName, argv = [], env = process.env) {
  const options = validateCheckArgs(parseCheckArgs(argv));

  if (options.help) {
    console.log(renderCheckHelp(checkName, options.language));
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderCheckErrors(options.errors, checkName, options.language));
    return 2;
  }

  return runProjectCheck(checkName, { env });
}
