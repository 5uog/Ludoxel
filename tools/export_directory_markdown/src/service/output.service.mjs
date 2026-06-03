/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { OUTPUT_ROOT, PROJECT_ROOT } from '../config/path.config.mjs';

export function defaultOutputPath(target, format) {
  return resolve(OUTPUT_ROOT, `${target.outputBaseName}_${format}.md`);
}

export async function writeExportOutput(outputPath, content, options) {
  const resolved = resolve(PROJECT_ROOT, outputPath || defaultOutputPath(options.target, options.format));

  if (existsSync(resolved) && !options.overwrite) {
    throw new Error(`Output already exists: ${resolved}. Use --overwrite.`);
  }

  await mkdir(dirname(resolved), { recursive: true });
  await writeFile(resolved, content, 'utf8');
  console.log(`export written: ${resolved}`);
}
