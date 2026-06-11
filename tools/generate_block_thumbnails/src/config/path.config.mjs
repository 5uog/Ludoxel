/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TOOL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PROJECT_ROOT = resolve(TOOL_ROOT, '..', '..');
export const SOURCE_ROOT = resolve(PROJECT_ROOT, 'src');
