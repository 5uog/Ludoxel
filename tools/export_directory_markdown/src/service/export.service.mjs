/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { resolve } from 'node:path';
import { EXPORT_TARGETS } from '../config/profile.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { renderDirectoryMarkdown } from '../renderer/export.renderer.mjs';
import { scanExportFiles } from '../scanner/file.scanner.mjs';
import { writeExportOutput } from './output.service.mjs';

export async function runDirectoryMarkdownExport(options) {
  const target = EXPORT_TARGETS[options.target];
  const targetDirectory = resolve(PROJECT_ROOT, target.directory);
  const files = scanExportFiles(PROJECT_ROOT, targetDirectory, options);
  const content = renderDirectoryMarkdown({ target, files, options: { ...options, target } });

  await writeExportOutput(options.output, content, { ...options, target });

  return 0;
}
