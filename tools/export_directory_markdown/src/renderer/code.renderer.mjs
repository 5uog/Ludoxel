/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { readFileSync } from 'node:fs';

function fenceFor(path) {
  if (path.endsWith('.js') || path.endsWith('.mjs') || path.endsWith('.cjs')) return 'js';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.py')) return 'python';
  if (path.endsWith('.md')) return 'md';
  if (path.endsWith('.toml')) return 'toml';
  if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.qss')) return 'css';
  if (path.endsWith('.vert') || path.endsWith('.frag') || path.endsWith('.comp') || path.endsWith('.glsl')) return 'glsl';
  return 'text';
}

export function renderCodeFiles(files, options) {
  const blocks = [];

  for (const file of files) {
    blocks.push(`\`FILE: ${file.relativePath}\``);

    if (file.binary) {
      blocks.push('');
      blocks.push(`Binary file omitted. Size: ${file.sizeBytes} bytes.`);
      blocks.push('');
      continue;
    }

    if (options.maxBytes !== 'unlimited' && file.sizeBytes > Number(options.maxBytes)) {
      blocks.push('');
      blocks.push(`File omitted because size ${file.sizeBytes} exceeds max bytes ${options.maxBytes}.`);
      blocks.push('');
      continue;
    }

    const text = readFileSync(file.absolutePath, 'utf8');
    blocks.push(`\`\`\`${fenceFor(file.relativePath)}`);
    blocks.push(text.replace(/\s+$/u, ''));
    blocks.push('```');
    blocks.push('');
  }

  return blocks.join('\n');
}
