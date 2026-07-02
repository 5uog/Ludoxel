/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { collectNativeExtensionSources } from '../collect/source.collect.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { renderNativeBuildPythonScript } from '../script/build-script.script.mjs';
import { removeGeneratedNativeScriptRoot, writeGeneratedJson, writeGeneratedPythonScript } from '../script/temp-script.service.mjs';
import { runProcess } from '../shared/process/run.process.mjs';
import { resolvePythonExecutable } from '../shared/python/resolve.python.mjs';
import { buildRustNativeExtensions } from './rust.service.mjs';
import { verifyNativeExtensions } from './verify.service.mjs';

export function buildNativeExtensions(options = {}, context = {}) {
  const sources = collectNativeExtensionSources();

  if (sources.length === 0) {
    console.error('Native extension build failed: no candidates found. Searched for: ray_aabb, voxel_dda, view_angles.');
    return 1;
  }

  console.log('Cython native build targets:');
  for (const source of sources) {
    console.log(`  - ${source.moduleName} (${source.displayPath})`);
  }

  removeGeneratedNativeScriptRoot();

  const scriptPath = writeGeneratedPythonScript('build_native_extensions.py', renderNativeBuildPythonScript());
  const payloadPath = writeGeneratedJson('build_native_extensions.payload.json', {
    projectRoot: PROJECT_ROOT,
    sources: sources.map((source) => ({
      moduleName: source.moduleName,
      sourcePath: source.sourcePath,
    })),
  });

  try {
    const python = resolvePythonExecutable(context.env);
    const buildExitCode = runProcess(python, [scriptPath, payloadPath], { env: context.env });

    if (buildExitCode !== 0) {
      return buildExitCode;
    }

    const rustExitCode = buildRustNativeExtensions(options, context);
    if (rustExitCode !== 0) {
      return rustExitCode;
    }

    if (options.skipVerify) {
      return 0;
    }

    return verifyNativeExtensions({ requireBuilt: true }, context);
  } finally {
    removeGeneratedNativeScriptRoot();
  }
}
