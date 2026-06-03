/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runHelpCli } from '../../src/cli/run/help.run.mjs';

function formatScriptError(error) {
  return error?.stack || error?.message || String(error);
}

try {
  process.exitCode = await runHelpCli(process.argv.slice(2), process.env);
} catch (error) {
  console.error(formatScriptError(error));
  process.exitCode = 1;
}
