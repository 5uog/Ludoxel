/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, sep } from 'node:path';

import { RUST_NATIVE_MODULES } from '../config/native.config.mjs';
import { PROJECT_ROOT, SRC_ROOT } from '../config/path.config.mjs';
import { displayPath } from '../shared/file/find.file.mjs';
import { runProcess } from '../shared/process/run.process.mjs';
import { resolvePythonExecutable } from '../shared/python/resolve.python.mjs';

const DARWIN_PYO3_EXTENSION_RUSTFLAGS = Object.freeze(['-C', 'link-arg=-undefined', '-C', 'link-arg=dynamic_lookup']);

function installedArtifactSuffix() {
  return process.platform === 'win32' ? '.pyd' : '.so';
}

function builtCdylibName(crateName) {
  if (process.platform === 'win32') {
    return `${crateName}.dll`;
  }
  if (process.platform === 'darwin') {
    return `lib${crateName}.dylib`;
  }
  return `lib${crateName}.so`;
}

function flagSequenceExists(flags, sequence) {
  if (sequence.length === 0) {
    return true;
  }

  for (let index = 0; index <= flags.length - sequence.length; index += 1) {
    let matched = true;

    for (let offset = 0; offset < sequence.length; offset += 1) {
      if (flags[index + offset] !== sequence[offset]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return true;
    }
  }

  return false;
}

function appendRustFlagSequence(existingFlags, sequence) {
  const flags = String(existingFlags || '').trim().length > 0 ? String(existingFlags).trim().split(/\s+/) : [];

  if (!flagSequenceExists(flags, sequence)) {
    flags.push(...sequence);
  }

  return flags.join(' ');
}

function rustNativeBuildEnv(baseEnv) {
  const env = { ...baseEnv };

  if (!env.PYO3_PYTHON) {
    env.PYO3_PYTHON = resolvePythonExecutable(env);
  }

  if (process.platform === 'darwin') {
    env.RUSTFLAGS = appendRustFlagSequence(env.RUSTFLAGS, DARWIN_PYO3_EXTENSION_RUSTFLAGS);
  }

  return env;
}

export function resolveCargoExecutable(env = process.env) {
  if (env.CARGO) {
    return env.CARGO;
  }

  const cargoName = process.platform === 'win32' ? 'cargo.exe' : 'cargo';
  const homeCargo = resolve(env.CARGO_HOME || resolve(homedir(), '.cargo'), 'bin', cargoName);
  const probe = spawnSync(cargoName, ['--version'], { stdio: 'ignore', shell: false, windowsHide: true });

  if (probe.error === undefined && probe.status === 0) {
    return cargoName;
  }

  if (existsSync(homeCargo)) {
    return homeCargo;
  }

  return null;
}

function crateSourceMtime(crateRoot) {
  let latest = 0;
  const manifest = resolve(crateRoot, 'Cargo.toml');
  if (existsSync(manifest)) {
    latest = Math.max(latest, statSync(manifest).mtimeMs);
  }
  const sourceDirectory = resolve(crateRoot, 'src');
  if (existsSync(sourceDirectory)) {
    for (const entry of readdirSync(sourceDirectory)) {
      if (!entry.endsWith('.rs')) continue;
      latest = Math.max(latest, statSync(resolve(sourceDirectory, entry)).mtimeMs);
    }
  }
  return latest;
}

export function rustCrateStates() {
  return RUST_NATIVE_MODULES.map((target) => {
    const crateRoot = resolve(PROJECT_ROOT, target.crateDirectory);
    const manifestPath = resolve(crateRoot, 'Cargo.toml');
    const builtArtifactPath = resolve(crateRoot, 'target', 'release', builtCdylibName(target.crateName));
    const installedArtifactPath = resolve(PROJECT_ROOT, target.installDirectory, `${target.artifactStem}${installedArtifactSuffix()}`);
    const installedExists = existsSync(installedArtifactPath);
    const sourceMtime = crateSourceMtime(crateRoot);
    const stale = installedExists && sourceMtime > statSync(installedArtifactPath).mtimeMs;

    return {
      ...target,
      crateRoot,
      manifestPath,
      manifestExists: existsSync(manifestPath),
      builtArtifactPath,
      installedArtifactPath,
      installedExists,
      stale,
    };
  });
}

export function buildRustNativeExtensions(options = {}, context = {}) {
  const states = rustCrateStates();
  if (states.length === 0) {
    return 0;
  }

  const cargo = resolveCargoExecutable(context.env || process.env);
  if (cargo === null) {
    console.error('Rust native build failed: cargo was not found. Install the Rust toolchain (rustup) or set CARGO to the cargo executable.');
    return 1;
  }

  const env = rustNativeBuildEnv(context.env || process.env);

  console.log('Rust native build targets:');
  for (const state of states) {
    console.log(`  - ${state.id}: ${state.moduleName} (${displayPath(state.manifestPath)})`);
  }

  for (const state of states) {
    if (!state.manifestExists) {
      console.error(`Rust native build failed: crate manifest is missing for ${state.id}: ${displayPath(state.manifestPath)}`);
      return 1;
    }

    if (options.dryRun) {
      console.log(`[build_native_extensions] would run: ${cargo} build --release --manifest-path ${state.manifestPath}`);
      continue;
    }

    const exitCode = runProcess(cargo, ['build', '--release', '--manifest-path', state.manifestPath], { env });
    if (exitCode !== 0) {
      console.error(`Rust native build failed for ${state.id} (cargo exit ${exitCode}).`);
      return exitCode;
    }

    if (!existsSync(state.builtArtifactPath)) {
      console.error(`Rust native build produced no cdylib for ${state.id}: ${displayPath(state.builtArtifactPath)}`);
      return 1;
    }

    copyFileSync(state.builtArtifactPath, state.installedArtifactPath);
    console.log(`  rust artifact installed: ${displayPath(state.installedArtifactPath)}`);
  }

  return 0;
}

function importedModuleFile(pythonExecutable, moduleName, env) {
  const script = ['import importlib', `module = importlib.import_module(${JSON.stringify(moduleName)})`, 'print(getattr(module, "__file__", ""))'].join('\n');
  const mergedEnv = { ...env };
  const existingPythonPath = String(mergedEnv.PYTHONPATH || '').trim();
  mergedEnv.PYTHONPATH = existingPythonPath ? `${SRC_ROOT}${process.platform === 'win32' ? ';' : ':'}${existingPythonPath}` : SRC_ROOT;

  const result = spawnSync(pythonExecutable, ['-c', script], {
    cwd: PROJECT_ROOT,
    env: mergedEnv,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });

  if (result.error || result.status !== 0) {
    return { ok: false, detail: String(result.stderr || result.error || '').trim() };
  }

  return { ok: true, file: String(result.stdout || '').trim() };
}

export function verifyRustNativeExtensions(context = {}) {
  const states = rustCrateStates();
  if (states.length === 0) {
    return 0;
  }

  const env = context.env || process.env;
  const python = resolvePythonExecutable(env);
  const expectedSuffix = installedArtifactSuffix();
  const srcLudoxelRoot = resolve(SRC_ROOT, 'ludoxel') + sep;
  let failed = false;

  for (const state of states) {
    console.log(`rust native target: ${state.id}: ${state.moduleName} -> ${displayPath(state.crateRoot)}`);

    if (!state.installedExists) {
      console.error(
        `  compiled extension: missing (${displayPath(state.installedArtifactPath)}). The Python fallback (${state.fallbackModuleName}) is not accepted by this check; run: npm run build:native`,
      );
      failed = true;
      continue;
    }

    const imported = importedModuleFile(python, state.moduleName, env);
    if (!imported.ok) {
      console.error(`  compiled extension import failed for ${state.moduleName}: ${imported.detail}`);
      failed = true;
      continue;
    }

    const importedFile = resolve(imported.file);
    if (!importedFile.startsWith(srcLudoxelRoot)) {
      console.error(`  imported module resolves outside the repository source tree: ${importedFile}`);
      failed = true;
      continue;
    }
    if (!importedFile.endsWith(expectedSuffix)) {
      console.error(`  imported module is not a compiled ${expectedSuffix} extension: ${importedFile}`);
      failed = true;
      continue;
    }

    console.log(`  compiled extension: ${displayPath(importedFile)}`);
    if (state.stale) {
      console.log('  note: crate sources are newer than the installed artifact; rebuild with: npm run build:native');
    }
  }

  if (failed) {
    console.error('Rust native verification failed: the compiled extension must import from src/ludoxel; the Python fallback does not pass this check.');
    return 1;
  }

  return 0;
}
