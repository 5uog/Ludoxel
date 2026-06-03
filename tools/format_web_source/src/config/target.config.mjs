/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from './path.config.mjs';

export const WEB_SOURCE_TARGET_GROUPS = Object.freeze({
  ESLINT: 'eslint',
  STYLELINT: 'stylelint',
  PRETTIER: 'prettier',
  PRETTIER_CHECK: 'prettier-check',
});

const PRETTIER_TARGETS = Object.freeze([
  Object.freeze({
    path: '*.{html,css,js,cjs,mjs,json,jsonc,webmanifest,md,yml,yaml}',
    role: 'root web, Node, JSON, Markdown, and YAML files',
  }),
  Object.freeze({
    path: '.github/**/*.{md,yml,yaml}',
    role: 'GitHub governance and workflow files',
  }),
  Object.freeze({
    path: '.vscode/*.{json,jsonc}',
    role: 'workspace editor and task configuration',
  }),
  Object.freeze({
    path: 'tools/**/*.{html,css,js,cjs,mjs,json,jsonc,webmanifest,md,yml,yaml}',
    role: 'repository tool source and configuration',
  }),
  Object.freeze({
    path: 'src/**/*.{html,css,js,cjs,mjs,json,jsonc,webmanifest,md,yml,yaml}',
    role: 'package-adjacent web or configuration files',
  }),
  Object.freeze({
    path: '.prettierrc.json',
    role: 'root Prettier configuration',
  }),
]);

export const WEB_SOURCE_TARGETS = Object.freeze({
  [WEB_SOURCE_TARGET_GROUPS.ESLINT]: Object.freeze([
    Object.freeze({
      path: '*.{js,cjs,mjs}',
      role: 'root JavaScript, MJS, and CJS configuration files',
    }),
    Object.freeze({
      path: 'tools/**/*.{js,cjs,mjs}',
      role: 'repository tool JavaScript, MJS, and CJS source files',
    }),
  ]),
  [WEB_SOURCE_TARGET_GROUPS.STYLELINT]: Object.freeze([
    Object.freeze({
      path: '**/*.css',
      role: 'CSS files selected by stylelint.config.cjs',
    }),
  ]),
  [WEB_SOURCE_TARGET_GROUPS.PRETTIER]: PRETTIER_TARGETS,
  [WEB_SOURCE_TARGET_GROUPS.PRETTIER_CHECK]: PRETTIER_TARGETS,
});

function hasExtension(root, extensions, ignoredParts = new Set(['node_modules', 'dist', 'build', '.venv', '.venv_ludoxel', '.artifacts', 'assets', 'configs'])) {
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    let entries;

    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (ignoredParts.has(entry.name)) continue;

      const fullPath = resolve(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))) {
        return true;
      }
    }
  }

  return false;
}

export function hasCssTargets() {
  return hasExtension(PROJECT_ROOT, ['.css']);
}

export function getWebSourceTargets(group) {
  if (group === WEB_SOURCE_TARGET_GROUPS.STYLELINT && !hasCssTargets()) {
    return [];
  }

  return WEB_SOURCE_TARGETS[group] || [];
}

export function getWebSourceTargetPaths(group) {
  return getWebSourceTargets(group).map((target) => target.path);
}

export function getWebSourceTargetDisplayPaths(group) {
  return getWebSourceTargets(group).map((target) => ({ ...target }));
}

export function configFileExists(relativePath) {
  return existsSync(resolve(PROJECT_ROOT, relativePath));
}
