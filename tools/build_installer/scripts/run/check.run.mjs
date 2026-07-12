/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { checkMacosInstallerInputs, checkWindowsInstallerInputs } from '../../src/service/verify.service.mjs';

function formatScriptError(error) {
  return error?.stack || error?.message || String(error);
}

async function runAggregateCheck() {
  console.log('[build_installer] installer aggregate check: Windows');
  const windowsExitCode = await checkWindowsInstallerInputs();

  console.log('');
  console.log('[build_installer] installer aggregate check: macOS');
  const macosExitCode = await checkMacosInstallerInputs();

  return windowsExitCode === 0 && macosExitCode === 0 ? 0 : 1;
}

try {
  process.exitCode = await runAggregateCheck();
} catch (error) {
  console.error(formatScriptError(error));
  process.exitCode = 1;
}
