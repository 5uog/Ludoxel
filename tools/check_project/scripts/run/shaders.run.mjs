/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { runProjectCheckCli } from '../../src/cli/run/check.run.mjs';

process.exitCode = await runProjectCheckCli('shaders', process.argv.slice(2), process.env);
