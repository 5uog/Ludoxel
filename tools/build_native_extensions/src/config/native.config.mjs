/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const NATIVE_EXTENSION_MODULES = Object.freeze([
  Object.freeze({
    id: 'ray_aabb',
    moduleName: 'ludoxel.foundations.mathematics.geometry.ray_aabb',
    sourcePath: 'src/ludoxel/foundations/mathematics/geometry/ray_aabb.py',
  }),
  Object.freeze({
    id: 'voxel_dda',
    moduleName: 'ludoxel.foundations.mathematics.voxels.dda',
    sourcePath: 'src/ludoxel/foundations/mathematics/voxels/dda.py',
  }),
  Object.freeze({
    id: 'view_angles',
    moduleName: 'ludoxel.foundations.mathematics.linear.view_angles',
    sourcePath: 'src/ludoxel/foundations/mathematics/linear/view_angles.py',
  }),
]);

export const COMPILED_EXTENSION_SUFFIXES = Object.freeze(['.pyd', '.so', '.dylib']);
