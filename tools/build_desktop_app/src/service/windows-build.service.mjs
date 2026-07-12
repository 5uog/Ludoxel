/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildNativeExtensionsBeforeDesktop } from '../command/native/build-native.command.mjs';
import { buildWindowsPyinstallerCommand } from '../command/pyinstaller/build-command.pyinstaller.mjs';
import { APP_NAME, PYINSTALLER_CONFIG_ROOT, PYINSTALLER_SPEC_ROOT, PYINSTALLER_STAGING_ROOT, PYINSTALLER_WORK_ROOT, WINDOWS_ENTRY_SCRIPT, WINDOWS_PAYLOAD_DIR } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { ensureDirectory, removeIfExists } from '../shared/file/path.file.mjs';
import { resolvePythonExecutable } from '../shared/python/resolve.python.mjs';
import { runProcess } from '../shared/process/run.process.mjs';
import { generateLicenseTextModule } from './license-codegen.service.mjs';

function requireWindowsHost() {
  if (process.platform !== 'win32') {
    throw new Error('Windows executable build must run on Windows.');
  }
}

function requireWindowsEntryScript() {
  const entry = resolve(PROJECT_ROOT, WINDOWS_ENTRY_SCRIPT);

  if (!existsSync(entry)) {
    throw new Error(`Windows entry script is missing: ${WINDOWS_ENTRY_SCRIPT}`);
  }
}

function isFileLockError(error) {
  return error?.code === 'EPERM' || error?.code === 'EBUSY' || error?.code === 'EACCES';
}

function sleepMs(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.max(0, milliseconds));
}

function renameStagedPayload(pendingExe, payloadExe) {
  const maxAttempts = 20;
  const retryDelayMs = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      renameSync(pendingExe, payloadExe);
      return;
    } catch (error) {
      if (attempt < maxAttempts && isFileLockError(error)) {
        if (attempt === 1) {
          console.log(`[build_desktop_app] staged payload is busy; retrying replacement of ${payloadExe}`);
        }
        sleepMs(retryDelayMs);
        continue;
      }

      throw error;
    }
  }
}

function stageWindowsPayload(stagingDir) {
  const stagedExe = resolve(stagingDir, `${APP_NAME}.exe`);
  const payloadDir = resolve(PROJECT_ROOT, WINDOWS_PAYLOAD_DIR);
  const payloadExe = resolve(payloadDir, `${APP_NAME}.exe`);

  if (!existsSync(stagedExe)) {
    throw new Error(`PyInstaller did not produce staged executable: ${stagedExe}`);
  }

  ensureDirectory(payloadDir);

  const pendingExe = resolve(payloadDir, `${APP_NAME}.exe.pending-${randomUUID().replace(/-/g, '').slice(0, 12)}`);

  try {
    copyFileSync(stagedExe, pendingExe);
    renameStagedPayload(pendingExe, payloadExe);
    console.log(`[build_desktop_app] staged Windows application payload: ${payloadExe}`);
  } catch (error) {
    removeIfExists(pendingExe);

    if (isFileLockError(error)) {
      throw new Error(`Could not stage ${payloadExe}: the file is in use. Close any running ${APP_NAME}.exe (and any window previewing it), then run the build again.`, { cause: error });
    }

    throw error;
  }
}

export function runWindowsBuild(options = {}) {
  if (!options.dryRun) {
    requireWindowsHost();
  }
  requireWindowsEntryScript();

  if (!options.skipNativeBuild && !options.dryRun) {
    const nativeExitCode = buildNativeExtensionsBeforeDesktop(options);

    if (nativeExitCode !== 0) {
      return nativeExitCode;
    }
  }

  const pythonExecutable = process.platform === 'win32' ? resolvePythonExecutable(options.env) : 'python.exe';
  const token = randomUUID().replace(/-/g, '').slice(0, 12);
  const command = buildWindowsPyinstallerCommand({ pythonExecutable, token, developerConsole: options.developerConsole });

  console.log(`[build_desktop_app] ${command.displayCommand}`);

  if (options.dryRun) {
    console.log(`[build_desktop_app] generated PyInstaller spec (${command.specPath}):`);
    console.log(command.specText);
    for (const hookFile of command.hookFiles || []) {
      console.log(`[build_desktop_app] generated PyInstaller hook (${hookFile.path}):`);
      console.log(hookFile.text);
    }
    return 0;
  }

  generateLicenseTextModule();

  ensureDirectory(command.specDir);
  ensureDirectory(command.hookDir);
  writeFileSync(command.specPath, command.specText);
  for (const hookFile of command.hookFiles || []) {
    writeFileSync(hookFile.path, hookFile.text);
  }

  const pyinstallerConfigDir = resolve(PROJECT_ROOT, PYINSTALLER_CONFIG_ROOT);
  ensureDirectory(pyinstallerConfigDir);
  const pyinstallerEnv = {
    ...(options.env || process.env),
    PYINSTALLER_CONFIG_DIR: pyinstallerConfigDir,
  };

  const exitCode = runProcess(command.executable, command.args, { env: pyinstallerEnv });

  if (exitCode !== 0) {
    return exitCode;
  }

  stageWindowsPayload(command.stagingDir);

  if (!options.keepBuildCache) {
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token), { recursive: true, force: true });
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token), { recursive: true, force: true });
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token), { recursive: true, force: true });
  }

  return 0;
}
