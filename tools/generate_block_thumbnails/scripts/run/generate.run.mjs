/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runBlockThumbnailCli } from '../../src/cli/run/dispatch.run.mjs';

try {
  process.exitCode = await runBlockThumbnailCli(process.argv.slice(2), process.env, { command: 'generate' });
} catch (error) {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
