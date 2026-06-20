# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING

from ludoxel.presentation.rendering.visuals.worlds.block_break_particles import spawn_block_break_particles

if TYPE_CHECKING:
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget


def spawn_break_effect(viewport: "RendererViewportWidget", *, block_state: str | None, position: tuple[int, int, int] | None) -> None:
  if block_state is None or position is None:
    return
  tools = viewport._renderer.world_build_tools()
  if tools is None:
    return
  uv_lookup, def_lookup = tools
  particles = spawn_block_break_particles(
    state_str=str(block_state),
    cell=(int(position[0]), int(position[1]), int(position[2])),
    uv_lookup=uv_lookup,
    def_lookup=def_lookup,
    spawn_rate=float(viewport._state.block_break_particle_spawn_rate),
    speed_scale=float(viewport._state.block_break_particle_speed_scale),
  )
  viewport._append_block_break_particles(particles)
