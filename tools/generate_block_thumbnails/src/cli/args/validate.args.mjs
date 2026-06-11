/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const CATEGORIES = new Set(['', 'cube', 'full', 'full_block', 'slab', 'stairs', 'fence', 'fence_gate', 'wall']);

export function validateBlockThumbnailArgs(options) {
  const parsed = { ...options, errors: [...options.errors] };
  if (!parsed.textureRoot.trim()) parsed.errors.push('--texture-root must not be empty.');
  if (!parsed.outputRoot.trim()) parsed.errors.push('--output-root must not be empty.');
  if (!CATEGORIES.has(String(parsed.modelCategory).toLowerCase())) parsed.errors.push(`Unsupported --model-category: ${parsed.modelCategory}`);
  if (!Number.isFinite(parsed.yaw) || !Number.isFinite(parsed.pitch) || !Number.isFinite(parsed.roll)) parsed.errors.push('yaw, pitch, and roll must be finite numbers.');
  if (!Number.isFinite(parsed.scale) || parsed.scale <= 0) parsed.errors.push('--scale must be greater than zero.');
  if (!Number.isFinite(parsed.fitPadding) || parsed.fitPadding < 0 || parsed.fitPadding >= 150) parsed.errors.push('--fit-padding must be in the range 0..149.');
  if (!['north-south', 'east-west', 'none'].includes(parsed.connectivityAxis)) parsed.errors.push('--connectivity-axis must be north-south, east-west, or none.');
  for (const state of parsed.states) {
    if (!String(state).includes('=')) parsed.errors.push(`--state must use key=value: ${state}`);
  }
  return parsed;
}
