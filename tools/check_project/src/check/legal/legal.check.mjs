/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync } from 'node:fs';
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { printCheckResult } from '../../service/report.service.mjs';
import { listFiles } from '../../shared/file/find.file.mjs';
import { displayPath } from '../../shared/file/text.file.mjs';
import { LEGAL_PATHS, LEGAL_SOURCE_SUFFIXES, REQUIRED_LICENSE_TERMS, REQUIRED_THIRD_PARTY_LICENSES } from './legal.policy.mjs';

function hasSourceSuffix(path) {
  return LEGAL_SOURCE_SUFFIXES.some((suffix) => path.endsWith(suffix));
}

function checkRequiredTerms({ failures, label, path, terms }) {
  if (!existsSync(path)) {
    failures.push(`${label} is missing`);
    return null;
  }

  const text = readFileSync(path, 'utf8');
  for (const term of terms) {
    if (!text.includes(term)) failures.push(`${label} missing term: ${term}`);
  }

  return text;
}

export function checkLegal() {
  const failures = [];

  checkRequiredTerms({
    failures,
    label: 'LICENSE',
    path: LEGAL_PATHS.license,
    terms: REQUIRED_LICENSE_TERMS,
  });

  if (!existsSync(LEGAL_PATHS.thirdParty)) failures.push('third-party/ is missing');

  for (const thirdPartyLicense of REQUIRED_THIRD_PARTY_LICENSES) {
    checkRequiredTerms({
      failures,
      label: thirdPartyLicense.label,
      path: thirdPartyLicense.path,
      terms: thirdPartyLicense.terms,
    });
  }

  const sourceFiles = listFiles(PROJECT_ROOT).filter(hasSourceSuffix);

  for (const path of sourceFiles) {
    const normalized = displayPath(path);
    if (normalized.startsWith('assets/') || normalized.startsWith('configs/') || normalized.startsWith('third-party/')) continue;

    const head = readFileSync(path, 'utf8').split(/\r?\n/u).slice(0, 8).join('\n');
    if (!head.includes('SPDX-License-Identifier: LicenseRef-All-Rights-Reserved')) {
      failures.push(`missing SPDX header: ${normalized}`);
    }
  }

  return printCheckResult('legal', failures, [`checked ${sourceFiles.length} source files`]);
}
