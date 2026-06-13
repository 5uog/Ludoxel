/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseAudioAssetArgs } from '../args/parse.args.mjs';
import { validateAudioAssetArgs } from '../args/validate.args.mjs';
import { renderAudioAssetErrors, renderAudioAssetHelp } from '../help/render.help.mjs';
import { runAudioAssetTask } from '../../service/task.service.mjs';

export async function runAudioAssetCli(argv = [], env = process.env, defaults = {}) {
  const options = validateAudioAssetArgs(parseAudioAssetArgs(argv, defaults));

  if (options.help) {
    console.log(renderAudioAssetHelp(options.language));
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderAudioAssetErrors(options.errors, options.language));
    return 2;
  }

  return runAudioAssetTask(options, { env });
}
