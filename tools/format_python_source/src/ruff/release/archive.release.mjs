/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { mkdir } from 'node:fs/promises';
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { runProcessCommand } from '../../shared/node/process.node.mjs';

function quotePowerShellSingleQuotedString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export async function extractRuffArchive(archivePath, destinationDir) {
  await mkdir(destinationDir, { recursive: true });

  if (archivePath.endsWith('.zip')) {
    const command = ["$ErrorActionPreference = 'Stop'", `Expand-Archive -LiteralPath ${quotePowerShellSingleQuotedString(archivePath)} -DestinationPath ${quotePowerShellSingleQuotedString(destinationDir)} -Force`].join('; ');

    runProcessCommand('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command], {
      cwd: PROJECT_ROOT,
    });
    return;
  }

  runProcessCommand('tar', ['-xzf', archivePath, '-C', destinationDir], {
    cwd: PROJECT_ROOT,
  });
}
