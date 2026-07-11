/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
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
  Object.freeze({
    id: 'othello_native',
    crateDirectory: 'native/ludoxel_othello',
    crateName: 'ludoxel_othello',
    moduleName: 'ludoxel.simulation.spaces.othello.engines._othello_native',
    artifactStem: '_othello_native',
    installDirectory: 'src/ludoxel/simulation/spaces/othello/engines',
    fallbackModuleName: 'ludoxel.simulation.spaces.othello.engines.search',
  }),
  Object.freeze({
    id: 'mathematics_native',
    crateDirectory: 'native/ludoxel_mathematics',
    crateName: 'ludoxel_mathematics',
    moduleName: 'ludoxel.foundations.mathematics._mathematics_native',
    artifactStem: '_mathematics_native',
    installDirectory: 'src/ludoxel/foundations/mathematics',
    fallbackModuleName: 'ludoxel.foundations.mathematics.geometry.ray_aabb',
  }),
]);
