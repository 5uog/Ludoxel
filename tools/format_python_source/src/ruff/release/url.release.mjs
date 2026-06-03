/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { RUFF_VERSION } from '../../config/ruff.config.mjs';
import { getRuffArchiveExtension } from './platform.release.mjs';

export function getRuffReleaseAssetName(targetTriple) {
  return `ruff-${targetTriple}.${getRuffArchiveExtension(targetTriple)}`;
}

export function getRuffReleaseUrl(targetTriple) {
  return `https://releases.astral.sh/github/ruff/releases/download/${RUFF_VERSION}/${getRuffReleaseAssetName(targetTriple)}`;
}
