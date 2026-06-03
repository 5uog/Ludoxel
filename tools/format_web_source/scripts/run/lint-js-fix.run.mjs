/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runWebSourceQualityCli } from '../../src/cli/run/dispatch.run.mjs';

function formatScriptError(error) {
  return error?.stack || error?.message || String(error);
}

try {
  process.exitCode = await runWebSourceQualityCli('lint:js:fix', process.argv.slice(2), process.env);
} catch (error) {
  console.error(formatScriptError(error));
  process.exitCode = 1;
}
