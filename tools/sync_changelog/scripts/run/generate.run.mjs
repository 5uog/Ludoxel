// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
import { desktopChangelogPath } from '../../src/config/path.config.mjs';
import { generateDesktopChangelog } from '../../src/service/sync.service.mjs';

generateDesktopChangelog();
console.log(`Generated desktop changelog resource: ${desktopChangelogPath}`);
