/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function printCheckResult(name, failures, notes = []) {
  if (failures.length === 0) {
    console.log(`${name}: passed`);
  } else {
    console.error(`${name}: failed`);
  }

  for (const note of notes) {
    console.log(`  note: ${note}`);
  }

  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }

  return failures.length === 0 ? 0 : 1;
}
