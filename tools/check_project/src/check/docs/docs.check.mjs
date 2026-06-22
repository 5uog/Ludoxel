/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { printCheckResult } from '../../service/report.service.mjs';
import { displayPath } from '../../shared/file/text.file.mjs';
import { DOCS_PATHS } from './docs.policy.mjs';

export function checkDocs() {
  const failures = [];
  const licenseLabel = displayPath(DOCS_PATHS.license);

  if (!existsSync(DOCS_PATHS.license)) {
    failures.push(`${licenseLabel} is missing`);
  }

  return printCheckResult('docs', failures, [`checked ${licenseLabel}`]);
}
