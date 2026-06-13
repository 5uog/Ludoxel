/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function pythonPreviewArguments(options, mode) {
  const args = ['tools/generate_block_thumbnails/src/service/render_thumbnail.py', '--mode', mode, '--project-root', '.'];

  if (options.textureRoot) args.push('--texture-root', options.textureRoot);
  if (options.outputRoot) args.push('--output-root', options.outputRoot);

  for (const block of options.blocks) args.push('--block', block);
  if (options.all) args.push('--all');
  if (options.modelCategory) args.push('--model-category', options.modelCategory);

  for (const state of options.states) args.push('--state', state);
  for (const neighbor of options.neighbors) args.push('--neighbor', neighbor);

  args.push('--yaw', String(options.yaw));
  args.push('--pitch', String(options.pitch));
  args.push('--roll', String(options.roll));
  args.push('--scale', String(options.scale));
  args.push('--fit-padding', String(options.fitPadding));

  if (options.dryRun) args.push('--dry-run');
  if (options.allowOverwrite) args.push('--allow-overwrite');

  return args;
}
