/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { checkDocs } from '../check/docs/docs.check.mjs';
import { checkLegal } from '../check/legal/legal.check.mjs';
import { checkPackage } from '../check/package/package.check.mjs';
import { checkResources } from '../check/resources/resources.check.mjs';
import { checkShaders } from '../check/shaders/shaders.check.mjs';

const CHECKS = Object.freeze({
  package: checkPackage,
  docs: checkDocs,
  legal: checkLegal,
  resources: checkResources,
  shaders: checkShaders,
});

export async function runProjectCheck(checkName, options = {}) {
  const check = CHECKS[checkName];

  if (!check) {
    console.error(`Unknown check: ${checkName}`);
    return 2;
  }

  return check(options);
}
