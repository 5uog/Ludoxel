/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { printCheckResult } from '../../service/report.service.mjs';
import { listFiles } from '../../shared/file/find.file.mjs';
import { displayPath, readTextIfExists } from '../../shared/file/text.file.mjs';
import { REJECTED_DOCUMENTATION_TERMS, REQUIRED_README_TERMS } from './docs.policy.mjs';

export function checkDocs() {
  const failures = [];
  const docsFiles = listFiles(PROJECT_ROOT).filter((path) => ['.md', '.txt'].some((extension) => path.endsWith(extension)));
  const readmePath = resolve(PROJECT_ROOT, 'README.md');
  const readme = readTextIfExists(readmePath);

  if (!readme) {
    failures.push('README.md is missing');
  } else {
    for (const term of REQUIRED_README_TERMS) {
      if (!readme.includes(term)) {
        failures.push(`README.md missing required term: ${term}`);
      }
    }
  }

  for (const path of docsFiles) {
    const text = readTextIfExists(path) || '';

    for (const term of REJECTED_DOCUMENTATION_TERMS) {
      if (text.includes(term)) {
        failures.push(`${displayPath(path)} contains rejected term: ${term}`);
      }
    }
  }

  return printCheckResult('docs', failures, [`checked ${docsFiles.length} text files`]);
}
