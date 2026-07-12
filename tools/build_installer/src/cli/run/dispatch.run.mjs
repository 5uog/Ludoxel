/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseInstallerBuildArgs } from '../args/parse.args.mjs';
import { validateInstallerBuildArgs } from '../args/validate.args.mjs';
import { renderInstallerBuildErrors, renderInstallerBuildHelp } from '../help/render.help.mjs';
import { runInstallerBuildTask } from '../../service/task.service.mjs';

export async function runInstallerBuildCli(argv = [], env = process.env) {
  const options = validateInstallerBuildArgs(parseInstallerBuildArgs(argv));

  if (options.help) {
    console.log(renderInstallerBuildHelp(options.command, options.language));
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderInstallerBuildErrors(options.errors, options.command, options.language));
    return 2;
  }

  return runInstallerBuildTask(options, { env });
}
