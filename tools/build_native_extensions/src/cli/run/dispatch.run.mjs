/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseNativeExtensionArgs } from '../args/parse.args.mjs';
import { validateNativeExtensionArgs } from '../args/validate.args.mjs';
import { renderNativeExtensionErrors, renderNativeExtensionHelp } from '../help/render.help.mjs';
import { runNativeExtensionTask } from '../../service/task.service.mjs';

export async function runNativeExtensionCli(argv = [], env = process.env, defaults = {}) {
  const options = validateNativeExtensionArgs(parseNativeExtensionArgs(argv, defaults));

  if (options.help) {
    console.log(renderNativeExtensionHelp());
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderNativeExtensionErrors(options.errors));
    return 2;
  }

  return runNativeExtensionTask(options, { env });
}
