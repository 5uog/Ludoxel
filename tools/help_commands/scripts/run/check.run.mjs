/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { checkHelpCompleteness } from '../../src/check/completeness.check.mjs';

function formatScriptError(error) {
  return error?.stack || error?.message || String(error);
}

try {
  process.exitCode = checkHelpCompleteness();
} catch (error) {
  console.error(formatScriptError(error));
  process.exitCode = 1;
}
