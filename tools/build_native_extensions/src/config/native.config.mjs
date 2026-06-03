/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const NATIVE_EXTENSION_MODULES = Object.freeze([
  Object.freeze({
    id: 'ray_aabb',
    moduleName: 'ludoxel.shared.math.geometry.geometry_ray_aabb',
    sourcePath: 'src/ludoxel/shared/math/geometry/geometry_ray_aabb.py',
  }),
  Object.freeze({
    id: 'voxel_dda',
    moduleName: 'ludoxel.shared.math.voxel.voxel_dda',
    sourcePath: 'src/ludoxel/shared/math/voxel/voxel_dda.py',
  }),
  Object.freeze({
    id: 'view_angles',
    moduleName: 'ludoxel.shared.math.math_view_angles',
    sourcePath: 'src/ludoxel/shared/math/math_view_angles.py',
  }),
]);

export const COMPILED_EXTENSION_SUFFIXES = Object.freeze(['.pyd', '.so', '.dylib']);
