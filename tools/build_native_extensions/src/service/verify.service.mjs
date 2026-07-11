/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { verifyRustNativeExtensions } from './rust.service.mjs';

export function verifyNativeExtensions(context = {}) {
  // Every Rust target always requires the compiled extension: a fallback
  // import never passes this check.
  const rustExitCode = verifyRustNativeExtensions(context);
  if (rustExitCode !== 0) {
    return rustExitCode;
  }

  console.log('Native extension verification completed.');
  return 0;
}
