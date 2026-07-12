/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { MANIFEST_FILE_NAME, MANIFEST_SCHEMA_VERSION } from '../config/build.config.mjs';
import { PROJECT_ROOT } from '../config/path.config.mjs';
import { fileSizeBytes, sha256File } from '../shared/hash/sha256.file.mjs';
import { rootLicenseSha256 } from './license-resource.service.mjs';

function applicationVersion() {
  const packageJsonPath = resolve(PROJECT_ROOT, 'package.json');
  return JSON.parse(readFileSync(packageJsonPath, 'utf8')).version;
}

function normalizedArchitecture() {
  if (process.arch === 'x64') return 'x86_64';
  if (process.arch === 'arm64') return 'arm64';
  return process.arch;
}

export async function generateManifest({ payloadRoot, payloadPath, payloadFileName, payloadFormat, platform }) {
  const payloadSizeBytes = fileSizeBytes(payloadPath);
  const payloadSha256 = await sha256File(payloadPath);
  const licenseTextSha256 = await rootLicenseSha256();

  const manifest = {
    schema_version: MANIFEST_SCHEMA_VERSION,
    application_version: applicationVersion(),
    platform,
    architecture: normalizedArchitecture(),
    payload_file_name: payloadFileName,
    payload_format: payloadFormat,
    payload_size_bytes: payloadSizeBytes,
    payload_sha256: payloadSha256,
    license_text_sha256: licenseTextSha256,
    created_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  };

  const manifestPath = resolve(payloadRoot, MANIFEST_FILE_NAME);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return { manifest, manifestPath };
}

export function readManifest(payloadRoot) {
  const manifestPath = resolve(payloadRoot, MANIFEST_FILE_NAME);
  if (!existsSync(manifestPath)) {
    throw new Error(`Payload manifest is missing: ${manifestPath}`);
  }
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}
