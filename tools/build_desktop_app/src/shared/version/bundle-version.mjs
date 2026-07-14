/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function toMacosBundleVersion(rawVersion) {
  const text = String(rawVersion);
  const coreMatch = text.match(/^\d+\.\d+\.\d+/);
  const coreVersion = coreMatch ? coreMatch[0] : '0.0.0';
  const suffix = text.slice(coreVersion.length);
  const suffixDigitGroups = suffix.match(/\d+/g) || [];

  return suffixDigitGroups.length > 0 ? `${coreVersion}.${suffixDigitGroups.join('.')}` : coreVersion;
}
