/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { MACOS_PAYLOAD_BUNDLE_NAME, MACOS_PAYLOAD_DIR, WINDOWS_PAYLOAD_DIR, WINDOWS_PAYLOAD_FILE_NAME } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';

export function discoverWindowsPayload() {
  const path = resolve(PROJECT_ROOT, WINDOWS_PAYLOAD_DIR, WINDOWS_PAYLOAD_FILE_NAME);
  if (!existsSync(path)) {
    throw new Error(`Windows application payload was not found: ${path}. Run the application payload build first (see tools/build_desktop_app), or omit --skip-payload-build.`);
  }
  return path;
}

export function discoverMacosPayload() {
  const path = resolve(PROJECT_ROOT, MACOS_PAYLOAD_DIR, MACOS_PAYLOAD_BUNDLE_NAME);
  if (!existsSync(path)) {
    throw new Error(`macOS application payload was not found: ${path}. Run the application payload build first (see tools/build_desktop_app), or omit --skip-payload-build.`);
  }
  return path;
}
