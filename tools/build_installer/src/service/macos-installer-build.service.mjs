/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { randomUUID } from 'node:crypto';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildMacosInstallerPyinstallerCommand } from '../command/pyinstaller/build-command.pyinstaller.mjs';
import {
  INSTALLER_ENTRY_SCRIPT,
  MACOS_INSTALLER_ARTIFACT_NAME,
  MACOS_INSTALLER_DMG_NAME,
  MACOS_INSTALLER_STAGING_DIR,
  MACOS_PAYLOAD_ARCHIVE_NAME,
  MACOS_PAYLOAD_FORMAT,
  PYINSTALLER_CONFIG_ROOT,
  PYINSTALLER_SPEC_ROOT,
  PYINSTALLER_STAGING_ROOT,
  PYINSTALLER_WORK_ROOT,
  STALE_MACOS_DIRECT_ARTIFACT_NAME,
  MACOS_INSTALLER_PUBLISH_DIR,
} from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { ensureDirectory, removeIfExists } from '../shared/file/path.file.mjs';
import { resolvePythonExecutable } from '../shared/python/resolve.python.mjs';
import { runProcess } from '../shared/process/run.process.mjs';
import { archiveMacosPayload } from './macos-archive.service.mjs';
import { collectLicenseResource } from './license-resource.service.mjs';
import { generateManifest } from './manifest.service.mjs';
import { discoverMacosPayload } from './payload-discovery.service.mjs';
import { buildApplicationPayload } from './payload-build.service.mjs';
import { collectThirdPartyResource } from './third-party-resource.service.mjs';

function requireMacosHost() {
  if (process.platform !== 'darwin') {
    throw new Error('macOS installer build must run on macOS.');
  }
}

function requireInstallerEntryScript() {
  const entry = resolve(PROJECT_ROOT, INSTALLER_ENTRY_SCRIPT);
  if (!existsSync(entry)) {
    throw new Error(`Installer entry script is missing: ${INSTALLER_ENTRY_SCRIPT}`);
  }
}

function removeStaleDirectArtifact() {
  removeIfExists(resolve(PROJECT_ROOT, MACOS_INSTALLER_PUBLISH_DIR, STALE_MACOS_DIRECT_ARTIFACT_NAME));
}

async function stageMacosInstallerInputs() {
  const stagingDir = resolve(PROJECT_ROOT, MACOS_INSTALLER_STAGING_DIR);
  removeIfExists(stagingDir);
  ensureDirectory(stagingDir);

  const payloadAppPath = discoverMacosPayload();
  const payloadStagingDir = resolve(stagingDir, 'payload');
  const archivePath = archiveMacosPayload(payloadAppPath, payloadStagingDir);

  const legalStagingDir = resolve(stagingDir, 'legal');
  ensureDirectory(legalStagingDir);
  collectLicenseResource(legalStagingDir);
  collectThirdPartyResource(legalStagingDir);

  const { manifest } = await generateManifest({
    payloadRoot: payloadStagingDir,
    payloadPath: archivePath,
    payloadFileName: MACOS_PAYLOAD_ARCHIVE_NAME,
    payloadFormat: MACOS_PAYLOAD_FORMAT,
    platform: 'macos',
  });

  return { stagingDir, manifest };
}

function publishMacosInstaller(distDir) {
  const stagedInstallerApp = resolve(distDir, MACOS_INSTALLER_ARTIFACT_NAME);
  if (!existsSync(stagedInstallerApp)) {
    throw new Error(`PyInstaller did not produce the staged installer bundle: ${stagedInstallerApp}`);
  }

  removeStaleDirectArtifact();
  const publishDir = resolve(PROJECT_ROOT, MACOS_INSTALLER_PUBLISH_DIR);
  ensureDirectory(publishDir);
  const publishedApp = resolve(publishDir, MACOS_INSTALLER_ARTIFACT_NAME);
  removeIfExists(publishedApp);

  runProcess('cp', ['-R', stagedInstallerApp, publishedApp]);
  if (!existsSync(publishedApp)) {
    throw new Error(`Failed to publish the macOS installer bundle to ${publishedApp}`);
  }

  console.log(`[build_installer] published macOS installer: ${publishedApp}`);
  return publishedApp;
}

function buildOptionalDmg(publishedApp) {
  const dmgPath = resolve(PROJECT_ROOT, MACOS_INSTALLER_PUBLISH_DIR, MACOS_INSTALLER_DMG_NAME);
  removeIfExists(dmgPath);

  const exitCode = runProcess('hdiutil', ['create', '-volname', 'Ludoxel Installer', '-srcfolder', publishedApp, '-ov', '-format', 'UDZO', dmgPath]);
  if (exitCode !== 0 || !existsSync(dmgPath)) {
    console.log('[build_installer] optional .dmg generation did not succeed; the .app installer remains the primary artifact.');
    return null;
  }

  console.log(`[build_installer] published macOS installer disk image: ${dmgPath}`);
  return dmgPath;
}

export async function runMacosInstallerBuild(options = {}) {
  if (!options.dryRun) {
    requireMacosHost();
  }
  requireInstallerEntryScript();

  if (!options.skipPayloadBuild) {
    const payloadExitCode = buildApplicationPayload('macos', { skipNativeBuild: options.skipNativeBuild, dryRun: options.dryRun, env: options.env });
    if (payloadExitCode !== 0) {
      return payloadExitCode;
    }
  }

  if (options.dryRun) {
    console.log('[build_installer] --dry-run: skipping installer staging and PyInstaller invocation.');
    return 0;
  }

  const { stagingDir } = await stageMacosInstallerInputs();

  const pythonExecutable = resolvePythonExecutable(options.env);
  const token = randomUUID().replace(/-/g, '').slice(0, 12);
  const command = buildMacosInstallerPyinstallerCommand({ pythonExecutable, token, stagingDir });

  console.log(`[build_installer] ${command.displayCommand}`);

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

  const publishedApp = publishMacosInstaller(command.distDir);
  buildOptionalDmg(publishedApp);

  if (!options.keepBuildCache) {
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_WORK_ROOT, token), { recursive: true, force: true });
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_SPEC_ROOT, token), { recursive: true, force: true });
    rmSync(resolve(PROJECT_ROOT, PYINSTALLER_STAGING_ROOT, token), { recursive: true, force: true });
  }

  return 0;
}
