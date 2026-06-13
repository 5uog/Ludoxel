/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseDesktopBuildArgs } from '../args/parse.args.mjs';
import { validateDesktopBuildArgs } from '../args/validate.args.mjs';
import { renderDesktopBuildErrors, renderDesktopBuildHelp } from '../help/render.help.mjs';
import { runDesktopBuildTask } from '../../service/task.service.mjs';

export async function runDesktopBuildCli(argv = [], env = process.env) {
  const options = validateDesktopBuildArgs(parseDesktopBuildArgs(argv));

  if (options.help) {
    console.log(renderDesktopBuildHelp(options.command, options.language));
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderDesktopBuildErrors(options.errors, options.command, options.language));
    return 2;
  }

  return runDesktopBuildTask(options, { env });
}
