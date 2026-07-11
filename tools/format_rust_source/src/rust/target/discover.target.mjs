/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { NATIVE_ROOT, PROJECT_ROOT } from '../../config/path.config.mjs';

const IGNORED_DIRECTORIES = new Set(['target']);

function findCargoManifests(root) {
  if (!existsSync(root)) return [];

  const manifests = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = resolve(current, entry.name);

      if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
        stack.push(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name === 'Cargo.toml') {
        manifests.push(entryPath);
      }
    }
  }

  return manifests.sort((left, right) => left.localeCompare(right));
}

function hasTomlSection(manifestPath, sectionName) {
  const sectionPattern = new RegExp(`^\\s*\\[${sectionName.replace('.', '\\.')}(?:\\.[^\\]]+)?\\]\\s*(?:#.*)?$`, 'm');
  return sectionPattern.test(readFileSync(manifestPath, 'utf8'));
}

function isInsideDirectory(filePath, directoryPath) {
  const relativePath = relative(directoryPath, filePath);
  return relativePath === '' || (!relativePath.startsWith(`..${sep}`) && relativePath !== '..');
}

function displayManifestPath(manifestPath) {
  return relative(PROJECT_ROOT, manifestPath).replaceAll('\\', '/');
}

export function discoverRustTargets() {
  const manifests = findCargoManifests(NATIVE_ROOT);
  const workspaceManifests = manifests.filter((manifestPath) => hasTomlSection(manifestPath, 'workspace'));
  const workspaceRoots = workspaceManifests.map(dirname);
  const packageManifests = manifests.filter((manifestPath) => hasTomlSection(manifestPath, 'package'));
  const standalonePackages = packageManifests.filter((manifestPath) => !workspaceRoots.some((workspaceRoot) => isInsideDirectory(manifestPath, workspaceRoot)));

  return [...workspaceManifests.map((manifestPath) => ({ kind: 'workspace', manifestPath, displayPath: displayManifestPath(manifestPath) })), ...standalonePackages.map((manifestPath) => ({ kind: 'crate', manifestPath, displayPath: displayManifestPath(manifestPath) }))].sort((left, right) =>
    left.displayPath.localeCompare(right.displayPath),
  );
}
