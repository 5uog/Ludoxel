/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function pythonThumbnailArguments(options, mode) {
  const args = [
    '--mode',
    mode,
    '--texture-root',
    options.textureRoot,
    '--output-root',
    options.outputRoot,
    '--yaw',
    String(options.yaw),
    '--pitch',
    String(options.pitch),
    '--roll',
    String(options.roll),
    '--scale',
    String(options.scale),
    '--fit-padding',
    String(options.fitPadding),
    '--connectivity-axis',
    options.connectivityAxis,
  ];
  for (const block of options.blocks) args.push('--block', block);
  if (options.all) args.push('--all');
  if (options.modelCategory) args.push('--model-category', options.modelCategory);
  for (const state of options.states) args.push('--state', state);
  for (const direction of ['north', 'east', 'south', 'west']) {
    if (options[direction] === true) args.push(`--${direction}`);
    if (options[direction] === false) args.push(`--no-${direction}`);
  }
  if (options.dryRun) args.push('--dry-run');
  if (options.allowOverwrite) args.push('--allow-overwrite');
  return args;
}
