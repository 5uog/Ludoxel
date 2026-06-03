/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);

export const TOOL_ROOT = resolve(directory, '..', '..');
export const PROJECT_ROOT = resolve(TOOL_ROOT, '..', '..');
export const NODE_MODULES_BIN = resolve(PROJECT_ROOT, 'node_modules', '.bin');
