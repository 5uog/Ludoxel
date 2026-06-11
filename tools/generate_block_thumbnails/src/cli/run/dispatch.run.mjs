/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseBlockThumbnailArgs } from '../args/parse.args.mjs';
import { validateBlockThumbnailArgs } from '../args/validate.args.mjs';
import { renderBlockThumbnailHelp } from '../help/render.help.mjs';
import { runBlockThumbnailTask } from '../../service/task.service.mjs';

export async function runBlockThumbnailCli(argv = [], env = process.env, defaults = {}) {
  const options = validateBlockThumbnailArgs(parseBlockThumbnailArgs(argv, defaults));
  if (options.help) {
    console.log(renderBlockThumbnailHelp(options.command));
    return 0;
  }
  if (options.errors.length > 0) {
    for (const error of options.errors) console.error(`Error: ${error}`);
    console.error('');
    console.error(renderBlockThumbnailHelp(options.command));
    return 2;
  }
  return runBlockThumbnailTask(options, { env });
}
