/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseExportArgs } from '../args/parse.args.mjs';
import { validateExportArgs } from '../args/validate.args.mjs';
import { renderExportErrors, renderExportHelp } from '../help/render.help.mjs';
import { runDirectoryMarkdownExport } from '../../service/export.service.mjs';

export async function runExportDirectoryMarkdownCli(argv = [], env = process.env) {
  const options = validateExportArgs(parseExportArgs(argv));

  if (options.help) {
    console.log(renderExportHelp(options.language));
    return 0;
  }

  if (options.errors.length > 0) {
    console.error(renderExportErrors(options.errors, options.language));
    return 2;
  }

  return runDirectoryMarkdownExport(options, { env });
}
