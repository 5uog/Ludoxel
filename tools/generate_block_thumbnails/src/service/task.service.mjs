/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { checkBlockThumbnails } from './check.service.mjs';
import { generateBlockThumbnails } from './generate.service.mjs';

export function runBlockThumbnailTask(options, context = {}) {
  return options.command === 'check' ? checkBlockThumbnails(options, context) : generateBlockThumbnails(options, context);
}
