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
export const TOOL_CACHE_ROOT = resolve(TOOL_ROOT, '.cache');
export const RUFF_CONFIG_PATH = resolve(TOOL_ROOT, 'ruff.toml');
export const RUFF_BINARY_CACHE_ROOT = resolve(TOOL_CACHE_ROOT, 'ruff-bin');
export const RUFF_RUNTIME_CACHE = resolve(TOOL_CACHE_ROOT, 'ruff-runtime');
