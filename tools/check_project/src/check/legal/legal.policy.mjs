/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

export const LEGAL_PATHS = Object.freeze({
  license: resolve(PROJECT_ROOT, 'LICENSE'),
  thirdParty: resolve(PROJECT_ROOT, 'third-party'),
  kaiseiLicense: resolve(PROJECT_ROOT, 'third-party', 'kaisei-opti', 'LICENSE.txt'),
});

export const REQUIRED_LICENSE_TERMS = Object.freeze(['Ludoxel Independent License', 'LicenseRef-All-Rights-Reserved', 'third-party/']);

export const REQUIRED_THIRD_PARTY_LICENSES = Object.freeze([
  Object.freeze({
    label: 'third-party/kaisei-opti/LICENSE.txt',
    path: LEGAL_PATHS.kaiseiLicense,
    terms: Object.freeze(['Kaisei', 'SIL Open Font License', 'Version 1.1']),
  }),
]);

export const LEGAL_SOURCE_SUFFIXES = Object.freeze(['.py', '.js', '.mjs', '.cjs', '.css', '.qss', '.vert', '.frag', '.comp', '.glsl']);
