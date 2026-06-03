/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { RUFF_MODE_ARGS } from '../../config/ruff.config.mjs';

export function getRuffModeArgs(mode) {
  if (!Object.hasOwn(RUFF_MODE_ARGS, mode)) {
    throw new Error(`Unknown Ruff mode: ${mode}`);
  }

  return RUFF_MODE_ARGS[mode];
}
