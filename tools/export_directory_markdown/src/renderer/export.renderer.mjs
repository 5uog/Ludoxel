/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { renderCodeFiles } from './code.renderer.mjs';
import { renderTree } from './tree.renderer.mjs';

function formatExcludeRules(options) {
  const rules = options.excludeRules || [];
  if (rules.length === 0) return 'none';
  return rules.map((rule) => rule.raw).join(', ');
}

export function renderDirectoryMarkdown({ target, files, options }) {
  const sections = ['# directory export', '', `Target directory: \`${target.directory}\``, `Total files: ${files.length}`, `Output format: \`${options.format}\``, `Max bytes per file: \`${options.maxBytes}\``, `Include hidden: \`${options.includeHidden}\``, `Exclude rules: \`${formatExcludeRules(options)}\``, ''];

  if (options.format === 'tree' || options.format === 'both') {
    sections.push('## Tree', '', '```text', renderTree(files, target.directory), '```', '');
  }

  if (options.format === 'code' || options.format === 'both') {
    sections.push('## Files', '', renderCodeFiles(files, options));
  }

  return sections.join('\n').replace(/\n+$/u, '\n');
}
