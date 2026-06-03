/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
function insertPath(root, parts) {
  let cursor = root;

  for (const part of parts) {
    if (!cursor.children.has(part)) {
      cursor.children.set(part, { name: part, children: new Map(), file: false });
    }
    cursor = cursor.children.get(part);
  }

  cursor.file = true;
}

function renderNode(node, prefix = '') {
  const entries = [...node.children.values()].sort((first, second) => {
    const firstDir = first.children.size > 0;
    const secondDir = second.children.size > 0;
    if (firstDir && !secondDir) return -1;
    if (!firstDir && secondDir) return 1;
    return first.name.localeCompare(second.name);
  });

  const lines = [];

  entries.forEach((entry, index) => {
    const last = index === entries.length - 1;
    const connector = last ? '└── ' : '├── ';
    const childPrefix = `${prefix}${last ? '    ' : '│   '}`;
    lines.push(`${prefix}${connector}${entry.name}${entry.children.size > 0 ? '/' : ''}`);
    lines.push(...renderNode(entry, childPrefix));
  });

  return lines;
}

export function renderTree(files, targetDirectory) {
  const root = { name: targetDirectory, children: new Map(), file: false };

  for (const file of files) {
    insertPath(root, file.relativePath.split('/'));
  }

  return [`${targetDirectory}/`, ...renderNode(root)].join('\n');
}
