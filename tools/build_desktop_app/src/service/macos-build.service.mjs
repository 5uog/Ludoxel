/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { buildNativeExtensionsBeforeDesktop } from '../command/native/build-native.command.mjs';
import { buildMacosPyinstallerCommand } from '../command/pyinstaller/build-command.pyinstaller.mjs';
import { APP_NAME, MACOS_BUNDLE_IDENTIFIER, MACOS_ENTRY_SCRIPT, MACOS_ICON_CANDIDATE_PATHS, MACOS_PUBLISH_DIR, PYINSTALLER_CONFIG_ROOT, PYINSTALLER_SPEC_ROOT, PYINSTALLER_STAGING_ROOT, PYINSTALLER_WORK_ROOT } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { ensureDirectory } from '../shared/file/path.file.mjs';
import { resolvePythonExecutable } from '../shared/python/resolve.python.mjs';
import { runProcess } from '../shared/process/run.process.mjs';
import { copyLegalMaterial } from './legal-copy.service.mjs';

const MACOS_REQUIRED_BUNDLED_RESOURCE_PATHS = Object.freeze(['Contents/Frameworks/assets/ludoxel/skins/timo.png', 'Contents/Resources/assets/ludoxel/skins/timo.png']);
const MACOS_REQUIRED_FONT_ASSET_PATHS = Object.freeze([
  'assets/fonts/MinecraftRegular-Bmg3.otf',
  'assets/fonts/MinecraftBold-nMK1.otf',
  'assets/fonts/MinecraftItalic-R8Mo.otf',
  'assets/fonts/MinecraftBoldItalic-1y1e.otf',
  'assets/fonts/KaiseiOpti-Regular.ttf',
  'assets/fonts/KaiseiOpti-Medium.ttf',
  'assets/fonts/KaiseiOpti-Bold.ttf',
]);

const MACOS_APP_VERSION = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf8')).version;

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

function requireProjectAsset(relativePath) {
  const absolutePath = resolve(PROJECT_ROOT, relativePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Required macOS bundle asset is missing: ${relativePath} (${absolutePath})`);
  }
}

function requireFirstProjectAsset(candidateRelativePaths, label) {
  const checkedRelativePaths = Array.from(candidateRelativePaths);

  for (const relativePath of checkedRelativePaths) {
    const absolutePath = resolve(PROJECT_ROOT, relativePath);

    if (existsSync(absolutePath)) {
      return {
        relativePath,
        absolutePath,
      };
    }
  }

  throw new Error(`Required ${label} is missing. Checked: ${checkedRelativePaths.join(', ')}`);
}

function macosAppPath(rootDir) {
  return resolve(rootDir, `${APP_NAME}.app`);
}

function bundledResourceExists(appPath, relativePath) {
  return existsSync(resolve(appPath, relativePath));
}

function requireBundledResource(appPath, label, relativePaths) {
  const matchedPath = relativePaths.find((relativePath) => bundledResourceExists(appPath, relativePath));

  if (!matchedPath) {
    throw new Error(`macOS app bundle is missing ${label}. Checked: ${relativePaths.join(', ')}`);
  }

  return matchedPath;
}

function bundledAssetCandidates(relativeAssetPath) {
  return Object.freeze([`Contents/Frameworks/${relativeAssetPath}`, `Contents/Resources/${relativeAssetPath}`]);
}

function walkFiles(rootPath) {
  const entries = [];

  for (const entry of readdirSync(rootPath, { withFileTypes: true })) {
    const absolutePath = resolve(rootPath, entry.name);

    if (entry.isDirectory()) {
      entries.push(...walkFiles(absolutePath));
      continue;
    }

    if (entry.isFile()) {
      entries.push(absolutePath);
    }
  }

  return entries;
}

function upsertPlistString(plistText, key, value) {
  const escapedValue = String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const existing = new RegExp(`(<key>${key}</key>\\s*)<string>[^<]*</string>`);

  if (existing.test(plistText)) {
    return plistText.replace(existing, `$1<string>${escapedValue}</string>`);
  }

  return plistText.replace('</dict>', `\t<key>${key}</key>\n\t<string>${escapedValue}</string>\n</dict>`);
}

function patchMacosInfoPlist(appPath) {
  const plistPath = resolve(appPath, 'Contents', 'Info.plist');

  if (!existsSync(plistPath)) {
    throw new Error(`macOS app bundle is missing Info.plist: ${plistPath}`);
  }

  let plistText = readFileSync(plistPath, 'utf8');
  const resourcesPath = resolve(appPath, 'Contents', 'Resources');
  const bundledIcons = existsSync(resourcesPath) ? walkFiles(resourcesPath).filter((path) => path.toLowerCase().endsWith('.icns')) : [];
  const bundledIconName = bundledIcons.length > 0 ? basename(bundledIcons[0]) : basename(MACOS_ICON_CANDIDATE_PATHS[0]);

  plistText = upsertPlistString(plistText, 'CFBundleName', APP_NAME);
  plistText = upsertPlistString(plistText, 'CFBundleDisplayName', APP_NAME);
  plistText = upsertPlistString(plistText, 'CFBundleIdentifier', MACOS_BUNDLE_IDENTIFIER);
  plistText = upsertPlistString(plistText, 'CFBundleExecutable', APP_NAME);
  plistText = upsertPlistString(plistText, 'CFBundleShortVersionString', MACOS_APP_VERSION);
  plistText = upsertPlistString(plistText, 'CFBundleVersion', MACOS_APP_VERSION);
  plistText = upsertPlistString(plistText, 'CFBundleIconFile', bundledIconName);
  plistText = upsertPlistString(plistText, 'NSInputMonitoringUsageDescription', 'Ludoxel uses keyboard input monitoring while gameplay mouse capture is active so macOS and global app shortcuts do not steal game controls.');

  writeFileSync(plistPath, plistText);
}

function runCodesign(args, label) {
  const result = spawnSync('codesign', args, {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    const stderr = String(result.stderr || '').trim();
    const stdout = String(result.stdout || '').trim();
    const detail = stderr || stdout || `exit ${result.status}`;
    throw new Error(`${label} failed: ${detail}`);
  }
}

function signMacosAppBundle(appPath) {
  runCodesign(['--force', '--deep', '--sign', '-', appPath], `macOS app bundle ad-hoc signing (${appPath})`);
}

function verifyMacosCodeSignature(appPath) {
  runCodesign(['--verify', '--deep', '--strict', appPath], `macOS app bundle signature verification (${appPath})`);
}

function requireMacosInfoPlist(appPath) {
  const plistPath = resolve(appPath, 'Contents', 'Info.plist');
  const plistText = readFileSync(plistPath, 'utf8');
  const requiredPairs = [
    ['CFBundleName', APP_NAME],
    ['CFBundleDisplayName', APP_NAME],
    ['CFBundleIdentifier', MACOS_BUNDLE_IDENTIFIER],
    ['CFBundleExecutable', APP_NAME],
    ['CFBundleShortVersionString', MACOS_APP_VERSION],
    ['CFBundleVersion', MACOS_APP_VERSION],
  ];

  for (const [key, expectedValue] of requiredPairs) {
    if (!plistText.includes(`<key>${key}</key>`) || !plistText.includes(`<string>${expectedValue}</string>`)) {
      throw new Error(`macOS Info.plist is missing ${key}=${expectedValue}: ${plistPath}`);
    }
  }

  if (!plistText.includes('<key>CFBundleIconFile</key>') || !plistText.includes('.icns</string>')) {
    throw new Error(`macOS Info.plist is missing a .icns CFBundleIconFile entry: ${plistPath}`);
  }

  if (!plistText.includes('<key>NSInputMonitoringUsageDescription</key>')) {
    throw new Error(`macOS Info.plist is missing NSInputMonitoringUsageDescription for gameplay input capture: ${plistPath}`);
  }
}

function requireMacosIcon(appPath) {
  const resolvedProjectIcon = requireFirstProjectAsset(MACOS_ICON_CANDIDATE_PATHS, 'macOS project icon');

  const resourcesPath = resolve(appPath, 'Contents', 'Resources');
  const bundledIcons = existsSync(resourcesPath) ? walkFiles(resourcesPath).filter((path) => path.toLowerCase().endsWith('.icns')) : [];

  if (bundledIcons.length < 1) {
    throw new Error(`macOS app bundle is missing a bundled .icns icon under Contents/Resources: ${appPath}`);
  }

  console.log(`[build_desktop_app] verified macOS project icon: ${resolvedProjectIcon.relativePath}`);
  console.log(`[build_desktop_app] verified macOS bundled icon: ${bundledIcons[0]}`);
}

function requirePythonFrameworkLink(appPath) {
  const pythonLinkPath = resolve(appPath, 'Contents', 'Frameworks', 'Python');

  if (!existsSync(pythonLinkPath)) {
    throw new Error(`macOS app bundle is missing Python shared library link: ${pythonLinkPath}`);
  }

  const stat = lstatSync(pythonLinkPath);

  if (!stat.isSymbolicLink() && !stat.isFile()) {
    throw new Error(`macOS app bundle has invalid Python shared library entry: ${pythonLinkPath}`);
  }
}

function verifyMacosAppBundle(appPath) {
  const executablePath = resolve(appPath, 'Contents', 'MacOS', APP_NAME);

  if (!existsSync(appPath)) {
    throw new Error(`PyInstaller did not produce macOS app bundle: ${appPath}`);
  }

  if (!existsSync(executablePath)) {
    throw new Error(`macOS app bundle is missing executable: ${executablePath}`);
  }

  requirePythonFrameworkLink(appPath);
  requireMacosInfoPlist(appPath);
  requireMacosIcon(appPath);
  verifyMacosCodeSignature(appPath);

  const timoSkinPath = requireBundledResource(appPath, 'bundled Timo skin texture', MACOS_REQUIRED_BUNDLED_RESOURCE_PATHS);
  console.log(`[build_desktop_app] verified macOS bundled asset: ${timoSkinPath}`);

  for (const fontAssetPath of MACOS_REQUIRED_FONT_ASSET_PATHS) {
    const bundledFontPath = requireBundledResource(appPath, `bundled font asset ${fontAssetPath}`, bundledAssetCandidates(fontAssetPath));
    console.log(`[build_desktop_app] verified macOS bundled font: ${bundledFontPath}`);
  }
}

function publishMacosApp(stagingDir) {
  const stagedApp = macosAppPath(stagingDir);
  const publishDir = resolve(PROJECT_ROOT, MACOS_PUBLISH_DIR);
  const publishApp = macosAppPath(publishDir);

  patchMacosInfoPlist(stagedApp);
  signMacosAppBundle(stagedApp);
  verifyMacosAppBundle(stagedApp);

  ensureDirectory(publishDir);
  rmSync(publishApp, { recursive: true, force: true });

  cpSync(stagedApp, publishApp, {
    recursive: true,
    force: true,
    verbatimSymlinks: true,
  });

  signMacosAppBundle(publishApp);
  verifyMacosAppBundle(publishApp);
  copyLegalMaterial(publishDir);

  console.log(`[build_desktop_app] published macOS app bundle: ${publishApp}`);
}

export function runMacosBuild(options = {}) {
  requireMacosHost();
  requireMacosEntryScript();
  requireProjectAsset('assets/ludoxel/skins/timo.png');
  requireFirstProjectAsset(MACOS_ICON_CANDIDATE_PATHS, 'macOS project icon');

  for (const fontAssetPath of MACOS_REQUIRED_FONT_ASSET_PATHS) {
    requireProjectAsset(fontAssetPath);
  }

  if (!options.skipNativeBuild) {
    const nativeExitCode = buildNativeExtensionsBeforeDesktop(options);

    if (nativeExitCode !== 0) {
      return nativeExitCode;
    }
  }

  const pythonExecutable = resolvePythonExecutable(options.env);
  const token = randomUUID().replace(/-/g, '').slice(0, 12);
  const command = buildMacosPyinstallerCommand({ pythonExecutable, token });
  const pyinstallerConfigDir = resolve(PROJECT_ROOT, PYINSTALLER_CONFIG_ROOT);

  ensureDirectory(pyinstallerConfigDir);

  const pyinstallerEnv = {
    ...(options.env || process.env),
    PYINSTALLER_CONFIG_DIR: pyinstallerConfigDir,
  };

  console.log(`[build_desktop_app] ${command.displayCommand}`);

  if (options.dryRun) {
    return 0;
  }

  const exitCode = runProcess(command.executable, command.args, { env: pyinstallerEnv });

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
