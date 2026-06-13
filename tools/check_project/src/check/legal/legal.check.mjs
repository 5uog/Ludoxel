/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync } from 'node:fs';
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { printCheckResult } from '../../service/report.service.mjs';
import { listFiles } from '../../shared/file/find.file.mjs';
import { displayPath } from '../../shared/file/text.file.mjs';
import { JAPANESE_NOTICE_PATHS, LEGAL_PATHS, LEGAL_SOURCE_SUFFIXES, REQUIRED_LICENSE_TERMS, REQUIRED_NOTICE_TERM_GROUPS, REQUIRED_NOTICE_TERMS } from './legal.policy.mjs';

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

function checkRequiredTermGroups({ failures, label, text, groups }) {
  if (text === null) return;

  for (const group of groups) {
    if (!group.terms.some((term) => text.includes(term))) {
      failures.push(`${label} missing term group: ${group.label} (${group.terms.join(' or ')})`);
    }
  }
}

function documentVersion(text, pattern) {
  const match = text?.match(pattern);
  return match?.[1] ?? null;
}

function checkRelatedNoticeVersion({ failures, rootNoticeText, path, label }) {
  const rootVersion = documentVersion(rootNoticeText, /^版:\s*(\S+)\s*$/mu);
  if (rootVersion === null) {
    failures.push('NOTICE version record is missing');
    return;
  }

  if (!existsSync(path)) return;
  const relatedText = readFileSync(path, 'utf8');
  const relatedVersion = documentVersion(relatedText, /^関連するルート NOTICE の版:\s*(\S+)\s*$/mu);
  if (relatedVersion === null) {
    failures.push(`${label} related root NOTICE version record is missing`);
    return;
  }
  if (relatedVersion !== rootVersion) {
    failures.push(`${label} references root NOTICE ${relatedVersion}, expected ${rootVersion}`);
  }
}

function checkJapaneseNoticeFormatting({ failures, path }) {
  if (!existsSync(path)) return;
  const label = displayPath(path);
  const lines = readFileSync(path, 'utf8').split(/\r?\n/u);
  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    const columns = [...line].length;
    if (columns > 60) failures.push(`${label}:${lineNumber} exceeds source column 60 (${columns})`);
  }
}

export function checkLegal() {
  const failures = [];

  checkRequiredTerms({
    failures,
    label: 'LICENSE',
    path: LEGAL_PATHS.license,
    terms: REQUIRED_LICENSE_TERMS,
  });

  const noticeText = checkRequiredTerms({
    failures,
    label: 'NOTICE',
    path: LEGAL_PATHS.notice,
    terms: REQUIRED_NOTICE_TERMS,
  });

  checkRequiredTermGroups({
    failures,
    label: 'NOTICE',
    text: noticeText,
    groups: REQUIRED_NOTICE_TERM_GROUPS,
  });

  if (!existsSync(LEGAL_PATHS.thirdParty)) failures.push('third-party/ is missing');
  if (!existsSync(LEGAL_PATHS.kaiseiLicense)) failures.push('third-party/kaisei-opti/LICENSE.txt is missing');
  if (!existsSync(LEGAL_PATHS.kaiseiNotice)) failures.push('third-party/kaisei-opti/NOTICE.txt is missing');
  if (!existsSync(LEGAL_PATHS.pythonRuntimeNotice)) failures.push('third-party/python-runtime/NOTICE.txt is missing');

  checkRelatedNoticeVersion({
    failures,
    rootNoticeText: noticeText,
    path: LEGAL_PATHS.kaiseiNotice,
    label: 'third-party/kaisei-opti/NOTICE.txt',
  });
  checkRelatedNoticeVersion({
    failures,
    rootNoticeText: noticeText,
    path: LEGAL_PATHS.pythonRuntimeNotice,
    label: 'third-party/python-runtime/NOTICE.txt',
  });

  for (const path of JAPANESE_NOTICE_PATHS) checkJapaneseNoticeFormatting({ failures, path });

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
