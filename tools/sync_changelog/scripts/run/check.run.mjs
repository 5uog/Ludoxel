/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { checkDesktopChangelog } from '../../src/service/sync.service.mjs';

const result = checkDesktopChangelog();
if (!result.ok) {
  console.error(`changelog sync check failed: ${result.reason}`);
  console.error('Run: npm run changelog:generate');
  process.exit(1);
}
console.log('changelog sync check passed');
