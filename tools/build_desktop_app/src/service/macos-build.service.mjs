/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { randomUUID } from 'node:crypto';
import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildNativeExtensionsBeforeDesktop } from '../command/native/build-native.command.mjs';
import { buildMacosPyinstallerCommand } from '../command/pyinstaller/build-command.pyinstaller.mjs';
import { APP_NAME, MACOS_ENTRY_SCRIPT, MACOS_PUBLISH_DIR, PYINSTALLER_SPEC_ROOT, PYINSTALLER_STAGING_ROOT, PYINSTALLER_WORK_ROOT } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { ensureDirectory } from '../shared/file/path.file.mjs';
import { resolvePythonExecutable } from '../shared/python/resolve.python.mjs';
import { runProcess } from '../shared/process/run.process.mjs';
import { copyLegalMaterial } from './legal-copy.service.mjs';

function requireMacosHost() {
  if (process.platform !== 'darwin') {
    throw new Error('macOS app bundle build must run on macOS.');
  }
}

function requireMacosEntryScript() {
  const entry = resolve(PROJECT_ROOT, MACOS_ENTRY_SCRIPT);

  if (!existsSync(entry)) {
    throw new Error(`macOS entry script is missing: ${MACOS_ENTRY_SCRIPT}`);
  }
}

function publishMacosApp(stagingDir) {
  const stagedApp = resolve(stagingDir, `${APP_NAME}.app`);
  const publishDir = resolve(PROJECT_ROOT, MACOS_PUBLISH_DIR);
  const publishApp = resolve(publishDir, `${APP_NAME}.app`);

  if (!existsSync(stagedApp)) {
    throw new Error(`PyInstaller did not produce staged app bundle: ${stagedApp}`);
  }

  ensureDirectory(publishDir);
  rmSync(publishApp, { recursive: true, force: true });
  cpSync(stagedApp, publishApp, { recursive: true, force: true });
  copyLegalMaterial(publishDir);

  console.log(`[build_desktop_app] published macOS app bundle: ${publishApp}`);
}

export function runMacosBuild(options = {}) {
  requireMacosHost();
  requireMacosEntryScript();

  if (!options.skipNativeBuild) {
    const nativeExitCode = buildNativeExtensionsBeforeDesktop(options);

    if (nativeExitCode !== 0) {
      return nativeExitCode;
    }
  }

  const pythonExecutable = resolvePythonExecutable(options.env);
  const token = randomUUID().replace(/-/g, '').slice(0, 12);
  const command = buildMacosPyinstallerCommand({ pythonExecutable, token });

  console.log(`[build_desktop_app] ${command.displayCommand}`);

  if (options.dryRun) {
    return 0;
  }

  const exitCode = runProcess(command.executable, command.args, { env: options.env });

  if (exitCode !== 0) {
    return exitCode;
  }

  publishMacosApp(command.stagingDir);

  if (!options.keepBuildCache) {
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token), { recursive: true, force: true });
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token), { recursive: true, force: true });
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token), { recursive: true, force: true });
  }

  return 0;
}
