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

// Rust native targets are separate from the Cython targets above: the source
// is a Rust crate under native/, the artifact is a cdylib renamed to the
// Python extension module name, and the Python fallback lives in a separate
// module that the import owner selects when the compiled module is absent.
export const RUST_NATIVE_MODULES = Object.freeze([
  Object.freeze({
    id: 'terrain_native',
    crateDirectory: 'native/ludoxel_terrain',
    crateName: 'ludoxel_terrain',
    moduleName: 'ludoxel.simulation.worlds.generation._terrain_native',
    artifactStem: '_terrain_native',
    installDirectory: 'src/ludoxel/simulation/worlds/generation',
    fallbackModuleName: 'ludoxel.simulation.worlds.generation.fallback',
  }),
]);
