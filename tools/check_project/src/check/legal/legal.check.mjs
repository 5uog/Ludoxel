/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { printCheckResult } from '../../service/report.service.mjs';
import { displayPath } from '../../shared/file/text.file.mjs';
import { LEGAL_PATHS } from './legal.policy.mjs';

export function checkLegal() {
  const failures = [];
  const licenseLabel = displayPath(LEGAL_PATHS.license);

  if (!existsSync(LEGAL_PATHS.license)) {
    failures.push(`${licenseLabel} is missing`);
  }

  return printCheckResult('legal', failures, [`checked ${licenseLabel}`]);
}
