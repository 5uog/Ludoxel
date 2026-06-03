/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function createExportFile({ absolutePath, relativePath, sizeBytes, binary }) {
  return Object.freeze({
    absolutePath,
    relativePath,
    sizeBytes,
    binary,
  });
}
