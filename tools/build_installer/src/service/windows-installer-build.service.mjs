/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildWindowsInstallerPyinstallerCommand } from '../command/pyinstaller/build-command.pyinstaller.mjs';
import { INSTALLER_ENTRY_SCRIPT, PYINSTALLER_CONFIG_ROOT, PYINSTALLER_SPEC_ROOT, PYINSTALLER_STAGING_ROOT, PYINSTALLER_WORK_ROOT, WINDOWS_INSTALLER_ARTIFACT_NAME, WINDOWS_INSTALLER_PUBLISH_DIR, WINDOWS_INSTALLER_STAGING_DIR, WINDOWS_PAYLOAD_FILE_NAME, WINDOWS_PAYLOAD_FORMAT } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { atomicReplaceFile } from '../shared/file/atomic-replace.file.mjs';
import { ensureDirectory, removeIfExists } from '../shared/file/path.file.mjs';
import { resolvePythonExecutable } from '../shared/python/resolve.python.mjs';
import { runProcess } from '../shared/process/run.process.mjs';
import { collectLicenseResource } from './license-resource.service.mjs';
import { generateManifest } from './manifest.service.mjs';
import { discoverWindowsPayload } from './payload-discovery.service.mjs';
import { buildApplicationPayload } from './payload-build.service.mjs';
import { collectThirdPartyResource } from './third-party-resource.service.mjs';

function requireWindowsHost() {
  if (process.platform !== 'win32') {
    throw new Error('Windows installer build must run on Windows.');
  }
}

function requireInstallerEntryScript() {
  const entry = resolve(PROJECT_ROOT, INSTALLER_ENTRY_SCRIPT);
  if (!existsSync(entry)) {
    throw new Error(`Installer entry script is missing: ${INSTALLER_ENTRY_SCRIPT}`);
  }
}

async function stageWindowsInstallerInputs() {
  const stagingDir = resolve(PROJECT_ROOT, WINDOWS_INSTALLER_STAGING_DIR);
  removeIfExists(stagingDir);
  ensureDirectory(stagingDir);

  const payloadPath = discoverWindowsPayload();
  const payloadStagingDir = resolve(stagingDir, 'payload');
  ensureDirectory(payloadStagingDir);
  const stagedPayloadPath = resolve(payloadStagingDir, WINDOWS_PAYLOAD_FILE_NAME);
  copyFileSync(payloadPath, stagedPayloadPath);

  const legalStagingDir = resolve(stagingDir, 'legal');
  ensureDirectory(legalStagingDir);
  collectLicenseResource(legalStagingDir);
  collectThirdPartyResource(legalStagingDir);

  const { manifest } = await generateManifest({
    payloadRoot: payloadStagingDir,
    payloadPath: stagedPayloadPath,
    payloadFileName: WINDOWS_PAYLOAD_FILE_NAME,
    payloadFormat: WINDOWS_PAYLOAD_FORMAT,
    platform: 'windows',
  });

  return { stagingDir, manifest };
}

function publishWindowsInstaller(distDir) {
  const stagedInstallerExe = resolve(distDir, WINDOWS_INSTALLER_ARTIFACT_NAME);
  if (!existsSync(stagedInstallerExe)) {
    throw new Error(`PyInstaller did not produce the staged installer executable: ${stagedInstallerExe}`);
  }

  const publishDir = resolve(PROJECT_ROOT, WINDOWS_INSTALLER_PUBLISH_DIR);
  const publishedPath = atomicReplaceFile(stagedInstallerExe, publishDir, WINDOWS_INSTALLER_ARTIFACT_NAME);
  console.log(`[build_installer] published Windows installer: ${publishedPath}`);
  return publishedPath;
}

export async function runWindowsInstallerBuild(options = {}) {
  if (!options.dryRun) {
    requireWindowsHost();
  }
  requireInstallerEntryScript();

  if (!options.skipPayloadBuild) {
    const payloadExitCode = buildApplicationPayload('windows', { skipNativeBuild: options.skipNativeBuild, dryRun: options.dryRun, env: options.env });
    if (payloadExitCode !== 0) {
      return payloadExitCode;
    }
  }

  if (options.dryRun) {
    console.log('[build_installer] --dry-run: skipping installer staging and PyInstaller invocation.');
    return 0;
  }

  const { stagingDir } = await stageWindowsInstallerInputs();

  const pythonExecutable = process.platform === 'win32' ? resolvePythonExecutable(options.env) : 'python.exe';
  const token = randomUUID().replace(/-/g, '').slice(0, 12);
  const command = buildWindowsInstallerPyinstallerCommand({ pythonExecutable, token, stagingDir });

  console.log(`[build_installer] ${command.displayCommand}`);

  ensureDirectory(command.specDir);
  writeFileSync(command.specPath, command.specText);

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

  publishWindowsInstaller(command.distDir);

  if (!options.keepBuildCache) {
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token), { recursive: true, force: true });
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token), { recursive: true, force: true });
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token), { recursive: true, force: true });
  }

  return 0;
}
