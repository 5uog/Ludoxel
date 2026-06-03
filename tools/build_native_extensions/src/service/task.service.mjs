/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { buildNativeExtensions } from './build.service.mjs';
import { listNativeExtensions } from './list.service.mjs';
import { verifyNativeExtensions } from './verify.service.mjs';

export function runNativeExtensionTask(options, context = {}) {
  if (options.command === 'list') {
    return listNativeExtensions();
  }

  if (options.command === 'build') {
    return buildNativeExtensions(options, context);
  }

  if (options.command === 'verify') {
    return verifyNativeExtensions({ requireBuilt: options.requireBuilt });
  }

  console.error(`Unknown native extension command: ${options.command}`);
  return 2;
}
