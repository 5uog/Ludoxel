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
export const GENERATED_SCRIPT_ROOT = resolve(PROJECT_ROOT, 'build', 'native-extension-scripts');
export const SRC_ROOT = resolve(PROJECT_ROOT, 'src');
