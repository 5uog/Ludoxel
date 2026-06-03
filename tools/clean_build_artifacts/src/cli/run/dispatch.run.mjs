/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseCleanArgs } from '../args/parse.args.mjs';
import { validateCleanArgs } from '../args/validate.args.mjs';
import { renderCleanErrors, renderCleanHelp } from '../help/render.help.mjs';
import { runCleanTask } from '../../service/task.service.mjs';

export async function runCleanBuildArtifactsCli(argv = [], env = process.env, defaults = {}) {
  const options = validateCleanArgs(parseCleanArgs(argv));

  if (options.help) {
    console.log(renderCleanHelp());
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderCleanErrors(options.errors));
    return 2;
  }

  return runCleanTask({ ...options, checkOnly: Boolean(defaults.checkOnly) }, { env });
}
