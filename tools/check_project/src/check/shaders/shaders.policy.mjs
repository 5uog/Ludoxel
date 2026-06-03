/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { extname } from 'node:path';

export const SHADER_SUFFIXES = Object.freeze(['.vert', '.frag', '.comp', '.glsl']);
export const SHADER_VERSION_RE = /^\s*#version\s+(\d+)/mu;
export const RAW_VERTEX_ID_RE = /\bgl_VertexID\b/u;

export function shaderStage(path) {
  const suffix = extname(path).toLowerCase();
  if (suffix === '.vert') return 'vertex';
  if (suffix === '.frag') return 'fragment';
  if (suffix === '.comp') return 'compute';
  return 'include';
}
