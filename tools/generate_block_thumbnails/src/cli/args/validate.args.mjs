/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
const CATEGORIES = new Set(['', 'cube', 'full', 'full_block', 'slab', 'stairs', 'fence', 'fence_gate', 'wall']);
const NEIGHBOR_DIRECTIONS = new Set(['north', 'east', 'south', 'west', 'up', 'down']);
const LANGUAGES = new Set(['ja', 'en']);

function validateNeighborSpec(spec, errors) {
  const text = String(spec).trim();
  if (!text.includes('=')) {
    errors.push(`--neighbor must use direction=state: ${text}`);
    return;
  }

  const [direction, ...stateParts] = text.split('=');
  const normalizedDirection = String(direction).trim().toLowerCase();
  const state = stateParts.join('=').trim();

  if (!NEIGHBOR_DIRECTIONS.has(normalizedDirection)) {
    errors.push(`--neighbor direction must be north, east, south, west, up, or down: ${normalizedDirection}`);
  }

  if (!state) {
    errors.push(`--neighbor state must not be empty: ${text}`);
  }
}

export function validateBlockThumbnailArgs(options) {
  const parsed = { ...options, errors: [...options.errors] };

  if (!LANGUAGES.has(String(parsed.language))) parsed.errors.push('--lang must be ja or en.');
  if (!['help', 'generate', 'check'].includes(String(parsed.command))) parsed.errors.push(`Unsupported command: ${parsed.command}`);
  if (!CATEGORIES.has(String(parsed.modelCategory).toLowerCase())) parsed.errors.push(`Unsupported --model-category: ${parsed.modelCategory}`);

  if (!Number.isFinite(parsed.yaw) || !Number.isFinite(parsed.pitch) || !Number.isFinite(parsed.roll)) parsed.errors.push('yaw, pitch, and roll must be finite numbers.');
  if (!Number.isFinite(parsed.scale) || parsed.scale <= 0) parsed.errors.push('--scale must be greater than zero.');
  if (!Number.isFinite(parsed.fitPadding) || parsed.fitPadding < 0 || parsed.fitPadding >= 150) parsed.errors.push('--fit-padding must be in the range 0..149.');

  for (const state of parsed.states) {
    const text = String(state).trim();
    if (!text.includes('=')) parsed.errors.push(`--state must use key=value: ${text}`);
  }

  for (const neighbor of parsed.neighbors) validateNeighborSpec(neighbor, parsed.errors);

  return parsed;
}
