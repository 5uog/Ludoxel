// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
import fs from 'node:fs';
import path from 'node:path';

import { canonicalChangelogPath, desktopChangelogPath } from '../config/path.config.mjs';

function buildDesktopPayload() {
  const raw = fs.readFileSync(canonicalChangelogPath, 'utf8');
  const data = JSON.parse(raw);
  const entries = Array.isArray(data.entries) ? data.entries : [];
  return `${JSON.stringify({ version: 1, entries }, null, 2)}\n`;
}

export function generateDesktopChangelog() {
  const payload = buildDesktopPayload();
  fs.mkdirSync(path.dirname(desktopChangelogPath), { recursive: true });
  fs.writeFileSync(desktopChangelogPath, payload);
  return payload;
}

export function checkDesktopChangelog() {
  const expected = buildDesktopPayload();
  let actual;
  try {
    actual = fs.readFileSync(desktopChangelogPath, 'utf8');
  } catch {
    actual = null;
  }
  if (actual === null) {
    return { ok: false, reason: 'desktop changelog resource is missing' };
  }
  if (actual !== expected) {
    return { ok: false, reason: 'desktop changelog resource is out of sync with the website changelog data' };
  }
  return { ok: true };
}
