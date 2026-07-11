/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { buildRustNativeExtensions } from './rust.service.mjs';
import { verifyNativeExtensions } from './verify.service.mjs';

export function buildNativeExtensions(options = {}, context = {}) {
  const rustExitCode = buildRustNativeExtensions(options, context);
  if (rustExitCode !== 0) {
    return rustExitCode;
  }

  if (options.skipVerify) {
    return 0;
  }

  return verifyNativeExtensions(context);
}
