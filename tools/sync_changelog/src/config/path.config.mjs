// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(currentDir, '..', '..', '..', '..');
export const canonicalChangelogPath = path.join(repoRoot, 'src', 'website', 'frontend', 'src', 'data', 'changelog.data.json');
export const desktopChangelogPath = path.join(repoRoot, 'assets', 'ui', 'menu', 'changelog.json');
