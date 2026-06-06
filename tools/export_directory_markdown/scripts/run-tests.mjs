/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../src/config/path.config.mjs';
import { runExportDirectoryMarkdownCli } from '../src/cli/run/export.run.mjs';

async function runCase(name, argv) {
  const exitCode = await runExportDirectoryMarkdownCli(argv, process.env);
  if (exitCode !== 0) {
    throw new Error(`${name} failed with exit code ${exitCode}`);
  }
}

async function runErrorCase(name, argv) {
  const exitCode = await runExportDirectoryMarkdownCli(argv, process.env);
  if (exitCode === 0) {
    throw new Error(`${name} unexpectedly succeeded`);
  }
}

function readProjectFile(relativePath) {
  return readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function assertContains({ name, text, expected }) {
  if (!text.includes(expected)) {
    throw new Error(`${name} did not contain expected text: ${expected}`);
  }
}

function assertNotContains({ name, text, rejected }) {
  if (text.includes(rejected)) {
    throw new Error(`${name} contained rejected text: ${rejected}`);
  }
}

await runCase('help', ['--help', '--lang', 'en']);

await runCase('root tree export', ['root', '--format', 'tree', '--output', 'tools/export_directory_markdown/output/export_test_root_tree.md', '--overwrite', '--max-bytes', '1']);

const rootTree = readProjectFile('tools/export_directory_markdown/output/export_test_root_tree.md');
assertContains({ name: 'root tree export', text: rootTree, expected: 'README.md' });
assertContains({ name: 'root tree export', text: rootTree, expected: 'tools/' });
assertNotContains({ name: 'root tree export', text: rootTree, rejected: 'Sudoku/' });
assertNotContains({ name: 'root tree export', text: rootTree, rejected: 'configs/' });
assertNotContains({ name: 'root tree export', text: rootTree, rejected: 'third-party/' });
assertNotContains({ name: 'root tree export', text: rootTree, rejected: 'tools/export_directory_markdown/output' });

await runCase('src code export', ['src', '--format', 'code', '--output', 'tools/export_directory_markdown/output/export_test_src_code.md', '--overwrite', '--max-bytes', '256']);

const srcCode = readProjectFile('tools/export_directory_markdown/output/export_test_src_code.md');
assertContains({ name: 'src code export', text: srcCode, expected: 'src/ludoxel/__main__.py' });
assertContains({ name: 'src code export', text: srcCode, expected: '## Files' });

await runCase('root target option with excludes', [
  '--target',
  'root',
  '--format',
  'tree',
  '--output',
  'tools/export_directory_markdown/output/export_test_root_exclude_tree.md',
  '--overwrite',
  '--exclude',
  'folder:tools',
  '--exclude',
  'file:README.md',
  '--exclude',
  'ext:.toml',
]);

const excludedRootTree = readProjectFile('tools/export_directory_markdown/output/export_test_root_exclude_tree.md');
assertContains({ name: 'root target option with excludes', text: excludedRootTree, expected: 'src/' });
assertNotContains({ name: 'root target option with excludes', text: excludedRootTree, rejected: 'tools/' });
assertNotContains({ name: 'root target option with excludes', text: excludedRootTree, rejected: '├── README.md' });
assertNotContains({ name: 'root target option with excludes', text: excludedRootTree, rejected: 'pyproject.toml' });

await runCase('root target option with comma-separated excludes', [
  '--target',
  'root',
  '--format',
  'code',
  '--output',
  'tools/export_directory_markdown/output/export_test_root_comma_exclude_code.md',
  '--overwrite',
  '--max-bytes',
  '256',
  '--exclude',
  'folder:ludoxel.egg-info,format_web_source,format_python_source,export_directory_markdown',
  '--exclude',
  'file:MANIFEST.in',
  '--exclude',
  'ext:toml',
]);

const commaExcludedRootCode = readProjectFile('tools/export_directory_markdown/output/export_test_root_comma_exclude_code.md');
assertContains({ name: 'root target option with comma-separated excludes', text: commaExcludedRootCode, expected: 'FILE: package.json' });
assertContains({ name: 'root target option with comma-separated excludes', text: commaExcludedRootCode, expected: 'Exclude rules: `folder:ludoxel.egg-info, folder:format_web_source' });
assertNotContains({ name: 'root target option with comma-separated excludes', text: commaExcludedRootCode, rejected: 'FILE: src/ludoxel.egg-info' });
assertNotContains({ name: 'root target option with comma-separated excludes', text: commaExcludedRootCode, rejected: 'FILE: tools/format_web_source' });
assertNotContains({ name: 'root target option with comma-separated excludes', text: commaExcludedRootCode, rejected: 'FILE: tools/format_python_source' });
assertNotContains({ name: 'root target option with comma-separated excludes', text: commaExcludedRootCode, rejected: 'FILE: tools/export_directory_markdown' });
assertNotContains({ name: 'root target option with comma-separated excludes', text: commaExcludedRootCode, rejected: 'FILE: MANIFEST.in' });
assertNotContains({ name: 'root target option with comma-separated excludes', text: commaExcludedRootCode, rejected: 'FILE: pyproject.toml' });

await runErrorCase('duplicate target', ['root', '--target', 'src']);
await runErrorCase('invalid exclude kind', ['root', '--exclude', 'path:src']);
await runErrorCase('empty comma-separated exclude item', ['root', '--exclude', 'folder:tools,,src']);

console.log('[export_directory_markdown] tests passed.');
