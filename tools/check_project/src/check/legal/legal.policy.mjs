/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';

export const LEGAL_PATHS = Object.freeze({
  license: resolve(PROJECT_ROOT, 'LICENSE'),
  notice: resolve(PROJECT_ROOT, 'NOTICE'),
  thirdParty: resolve(PROJECT_ROOT, 'third-party'),
  kaiseiLicense: resolve(PROJECT_ROOT, 'third-party', 'kaisei-opti', 'LICENSE.txt'),
  kaiseiNotice: resolve(PROJECT_ROOT, 'third-party', 'kaisei-opti', 'NOTICE.txt'),
});

export const REQUIRED_LICENSE_TERMS = Object.freeze(['Ludoxel Independent License', 'LicenseRef-All-Rights-Reserved', 'not open source', 'third-party/']);

export const REQUIRED_NOTICE_TERMS = Object.freeze(['日本語', 'LicenseRef-All-Rights-Reserved', 'Kaisei', 'OFL', 'Minecraft', 'third-party/']);

export const LEGAL_SOURCE_SUFFIXES = Object.freeze(['.py', '.js', '.mjs', '.cjs', '.css', '.qss', '.vert', '.frag', '.comp', '.glsl']);
