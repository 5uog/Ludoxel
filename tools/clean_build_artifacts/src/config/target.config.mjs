/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const STANDARD_CLEAN_TARGETS = Object.freeze(['build', '.ruff_cache', '.pytest_cache', '.mypy_cache', 'src/ludoxel.egg-info', 'tools/format_python_source/.cache']);

export const ALL_OPTION_CLEAN_TARGETS = Object.freeze(['dist', 'tools/export_directory_markdown/output']);

export const NATIVE_BINARY_SUFFIXES = Object.freeze(['.pyd', '.so', '.dylib']);
