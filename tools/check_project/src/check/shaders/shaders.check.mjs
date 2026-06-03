/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { PROJECT_ROOT } from '../../config/path.config.mjs';
import { printCheckResult } from '../../service/report.service.mjs';
import { listFiles } from '../../shared/file/find.file.mjs';
import { displayPath } from '../../shared/file/text.file.mjs';
import { RAW_VERTEX_ID_RE, SHADER_SUFFIXES, SHADER_VERSION_RE, shaderStage } from './shaders.policy.mjs';

function checkShader(path) {
  const failures = [];
  const text = readFileSync(path, 'utf8');
  const display = displayPath(path);
  const version = text.match(SHADER_VERSION_RE);
  const stage = shaderStage(path);

  if (stage !== 'include') {
    if (!version) {
      failures.push(`${display}: missing #version`);
    } else if (Number(version[1]) > 430) {
      failures.push(`${display}: #version ${version[1]} exceeds Ludoxel OpenGL 4.3 contract`);
    } else if (Number(version[1]) < 140) {
      failures.push(`${display}: #version ${version[1]} is lower than the minimum accepted GLSL version for tool validation`);
    }
  }

  if (stage === 'vertex' && RAW_VERTEX_ID_RE.test(text) && !text.includes('LUDOXEL_VERTEX_INDEX')) {
    failures.push(`${display}: use the LUDOXEL_VERTEX_INDEX compatibility macro instead of raw gl_VertexID`);
  }

  return failures;
}

export function checkShaders() {
  const shaderFiles = listFiles(PROJECT_ROOT).filter((path) => SHADER_SUFFIXES.includes(extname(path).toLowerCase()));
  const failures = shaderFiles.flatMap(checkShader);

  return printCheckResult('shaders', failures, [
    `checked ${shaderFiles.length} shader files`,
    'default shader check validates Ludoxel OpenGL 4.3 source; Vulkan SPIR-V is not the active renderer target',
  ]);
}
