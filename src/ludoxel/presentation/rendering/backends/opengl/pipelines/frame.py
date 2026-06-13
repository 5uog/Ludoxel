# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass

from OpenGL.GL import GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_DEPTH_TEST, GL_LESS, glClear, glClearColor, glDepthFunc, glDepthMask, glEnable, glViewport

import ludoxel.foundations.mathematics.linear.mat4 as mat4
from ludoxel.application.sessions.pipelines.render_snapshot import BlockBreakParticleRenderSampleDTO, FallingBlockRenderSampleDTO
from ludoxel.foundations.mathematics.chunks.grid import chunk_key
from ludoxel.foundations.mathematics.linear.transform_matrices import rotate_z_deg_matrix
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import forward_from_yaw_pitch_deg
from ludoxel.presentation.rendering.backends.opengl.othello.render_pass import OthelloPass
from ludoxel.presentation.rendering.backends.opengl.passes.block_break_particle import BlockBreakParticlePass
from ludoxel.presentation.rendering.backends.opengl.passes.cloud import CloudPass
from ludoxel.presentation.rendering.backends.opengl.passes.falling_block import FallingBlockPass
from ludoxel.presentation.rendering.backends.opengl.passes.first_person_arm import FirstPersonArmPass
from ludoxel.presentation.rendering.backends.opengl.passes.held_block import HeldBlockPass
from ludoxel.presentation.rendering.backends.opengl.passes.player_model import PlayerModelPass
from ludoxel.presentation.rendering.backends.opengl.passes.shadow_map import ShadowMapPass
from ludoxel.presentation.rendering.backends.opengl.passes.special_item import SpecialItemPass
from ludoxel.presentation.rendering.backends.opengl.passes.sun import SunPass
from ludoxel.presentation.rendering.backends.opengl.passes.world import WorldDrawInputs, WorldPass
from ludoxel.presentation.rendering.backends.opengl.runtime.metrics import PassFrameMetrics, RendererFrameMetrics
from ludoxel.presentation.rendering.backends.opengl.runtime.selection import SelectionController
from ludoxel.presentation.rendering.contracts.config import BackendRendererParams
from ludoxel.presentation.rendering.contracts.state import BackendRendererRuntimeState
from ludoxel.presentation.rendering.visuals.othello.state import OthelloRenderState
from ludoxel.presentation.rendering.visuals.players.first_person_geometry import FIRST_PERSON_HAND_NEAR
from ludoxel.presentation.rendering.visuals.players.model_pose import build_player_model_pose
from ludoxel.presentation.rendering.visuals.players.render_state import PlayerRenderState
from ludoxel.presentation.rendering.visuals.worlds.light_space import compute_light_view_proj

_FIRST_PERSON_REFERENCE_FOV_DEG = 80.0
_FIRST_PERSON_HIGH_FOV_WEIGHT = 0.20
_THIRD_PERSON_WORLD_NEAR = 0.01


def _first_person_viewmodel_fov_deg(world_fov_deg: float) -> float:
  fov = float(world_fov_deg)
  if fov <= float(_FIRST_PERSON_REFERENCE_FOV_DEG):
    return fov
  return float(_FIRST_PERSON_REFERENCE_FOV_DEG) + (fov - float(_FIRST_PERSON_REFERENCE_FOV_DEG)) * float(_FIRST_PERSON_HIGH_FOV_WEIGHT)


@dataclass(frozen=True)
class FramePipeline:
  cfg: BackendRendererParams
  state: BackendRendererRuntimeState
  shadow_pass: ShadowMapPass
  world_pass: WorldPass
  falling_block_pass: FallingBlockPass
  block_break_particle_pass: BlockBreakParticlePass
  player_pass: PlayerModelPass
  first_person_arm_pass: FirstPersonArmPass
  held_block_pass: HeldBlockPass
  special_item_pass: SpecialItemPass
  sun_pass: SunPass
  cloud_pass: CloudPass
  othello_pass: OthelloPass
  selection: SelectionController
  sel_tint_strength: float = 0.55

  def shadow_info(self) -> tuple[bool, int]:
    if not bool(self.state.shadow_enabled or self.state.debug_shadow):
      return (False, 0)

    info = self.shadow_pass.info()
    ok = bool(self.cfg.shadow.enabled and info.ok and int(info.tex_id) != 0 and int(info.inst_count) > 0)
    return (ok, int(info.size) if ok else 0)

  def render(
    self,
    *,
    w: int,
    h: int,
    eye: Vec3,
    yaw_deg: float,
    pitch_deg: float,
    roll_deg: float,
    fov_deg: float,
    render_distance_chunks: int,
    player_state: PlayerRenderState | None,
    extra_player_states: tuple[PlayerRenderState, ...],
    othello_state: OthelloRenderState | None,
    falling_blocks: tuple[FallingBlockRenderSampleDTO, ...],
    block_break_particles: tuple[BlockBreakParticleRenderSampleDTO, ...],
  ) -> RendererFrameMetrics:
    bx = int(math.floor(float(eye.x)))
    by = int(math.floor(float(eye.y)))
    bz = int(math.floor(float(eye.z)))
    cam_ck = chunk_key(bx, by, bz)

    use_light_space = bool(self.state.shadow_enabled or self.state.debug_shadow)
    if bool(use_light_space):
      shadow_info_pre = self.shadow_pass.info()
      light_vp = compute_light_view_proj(center=eye, sun_dir=self.state.sun_dir, sun=self.cfg.sun, shadow=self.cfg.shadow, shadow_size=int(max(1, int(shadow_info_pre.size))))
    else:
      light_vp = mat4.identity()

    all_player_states = tuple([player_state, *tuple(extra_player_states)])
    player_poses = tuple(build_player_model_pose(state) for state in all_player_states)

    shadow_metrics = PassFrameMetrics()
    if bool(self.state.shadow_enabled or self.state.debug_shadow):
      othello_shadow_key = None if othello_state is None else (bool(othello_state.enabled), othello_state.board, othello_state.animations)

      def _draw_shadow_extra(vp):
        player_draw_calls = 0
        player_instances = 0
        for pose in player_poses:
          draw_calls, instances = self.player_pass.draw_shadow(pose=pose, light_view_proj=vp)
          player_draw_calls += int(draw_calls)
          player_instances += int(instances)
        othello_result = self.othello_pass.draw_shadow(render_state=othello_state, light_view_proj=vp)
        return (int(player_draw_calls + int(othello_result[0])), int(player_instances + int(othello_result[1])))

      shadow_metrics = self.shadow_pass.render(
        light_vp, camera_chunk=cam_ck, render_distance_chunks=int(render_distance_chunks), extra_draw=_draw_shadow_extra, extra_cache_key=(tuple(all_player_states), othello_shadow_key)
      )

    forward = forward_from_yaw_pitch_deg(yaw_deg, pitch_deg)

    view = mat4.look_dir(eye, forward)
    if abs(float(roll_deg)) > 1e-6:
      view = mat4.mul(rotate_z_deg_matrix(float(roll_deg)), view)
    world_near = float(self.cfg.camera.z_near)
    if player_state is not None and not bool(player_state.is_first_person):
      world_near = min(float(world_near), float(_THIRD_PERSON_WORLD_NEAR))
    proj = mat4.perspective(fov_deg, (w / max(h, 1)), float(world_near), float(self.cfg.camera.z_far))
    vp = mat4.mul(proj, view)

    glViewport(0, 0, w, h)
    cc = self.cfg.sky.clear_color
    glClearColor(float(cc.x), float(cc.y), float(cc.z), 1.0)
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)

    self.sun_pass.draw(eye=eye, view_proj=vp, sun_dir=self.state.sun_dir)

    glEnable(GL_DEPTH_TEST)
    glDepthMask(True)
    glDepthFunc(GL_LESS)

    shadow_info = self.shadow_pass.info()

    sel_mode, sx, sy, sz = self.selection.world_inputs()

    world_metrics = self.world_pass.draw(
      WorldDrawInputs(
        view_proj=vp,
        light_view_proj=light_vp,
        sun_dir=self.state.sun_dir,
        debug_shadow=bool(self.state.debug_shadow),
        shadow_enabled=bool(self.state.shadow_enabled),
        world_wireframe=bool(self.state.world_wireframe),
        shadow=self.cfg.shadow,
        shadow_info=shadow_info,
        camera_chunk=cam_ck,
        render_distance_chunks=int(render_distance_chunks),
        sel_mode=int(sel_mode),
        sel_x=int(sx),
        sel_y=int(sy),
        sel_z=int(sz),
        sel_tint=float(self.sel_tint_strength),
      )
    )

    falling_dc, falling_inst = self.falling_block_pass.draw(samples=falling_blocks, view_proj=vp, sun_dir=self.state.sun_dir)
    world_metrics = PassFrameMetrics(
      cpu_ms=float(world_metrics.cpu_ms),
      draw_calls=int(world_metrics.draw_calls + falling_dc),
      instances=int(world_metrics.instances + falling_inst),
      rendered=bool(world_metrics.rendered or (falling_dc > 0)),
    )

    particle_dc, particle_inst = self.block_break_particle_pass.draw(samples=block_break_particles, view_proj=vp, sun_dir=self.state.sun_dir, camera_forward=forward)
    world_metrics = PassFrameMetrics(
      cpu_ms=float(world_metrics.cpu_ms),
      draw_calls=int(world_metrics.draw_calls + particle_dc),
      instances=int(world_metrics.instances + particle_inst),
      rendered=bool(world_metrics.rendered or (particle_dc > 0)),
    )

    player_dc = 0
    player_inst = 0
    for pose in player_poses:
      draw_calls, instances = self.player_pass.draw_world(
        pose=pose,
        view_proj=vp,
        light_view_proj=light_vp,
        sun_dir=self.state.sun_dir,
        debug_shadow=bool(self.state.debug_shadow),
        shadow_enabled=bool(self.state.shadow_enabled),
        shadow=self.cfg.shadow,
        shadow_info=shadow_info,
      )
      player_dc += int(draw_calls)
      player_inst += int(instances)

    world_metrics = PassFrameMetrics(
      cpu_ms=float(world_metrics.cpu_ms),
      draw_calls=int(world_metrics.draw_calls + player_dc),
      instances=int(world_metrics.instances + player_inst),
      rendered=bool(world_metrics.rendered or (player_dc > 0)),
    )

    othello_metrics = self.othello_pass.draw(
      render_state=othello_state,
      view_proj=vp,
      light_view_proj=light_vp,
      sun_dir=self.state.sun_dir,
      debug_shadow=bool(self.state.debug_shadow),
      shadow_enabled=bool(self.state.shadow_enabled),
      shadow=self.cfg.shadow,
      shadow_info=shadow_info,
    )

    world_metrics = PassFrameMetrics(
      cpu_ms=float(world_metrics.cpu_ms),
      draw_calls=int(world_metrics.draw_calls + othello_metrics.draw_calls),
      instances=int(world_metrics.instances + othello_metrics.instances),
      rendered=bool(world_metrics.rendered or othello_metrics.rendered),
    )

    self.cloud_pass.draw(eye=eye, view_proj=vp, forward=forward, fov_deg=float(fov_deg), aspect=float(w) / max(float(h), 1.0), sun_dir=self.state.sun_dir)

    self.selection.draw(view_proj=vp)

    first_person = None if player_state is None else player_state.first_person
    if (
      first_person is not None
      and bool(first_person.show_view_model)
      and (bool(first_person.show_arm) or first_person.visible_block_id is not None or first_person.visible_special_item_icon is not None)
    ):
      glClear(GL_DEPTH_BUFFER_BIT)
      hand_fov_deg = _first_person_viewmodel_fov_deg(float(fov_deg))
      hand_vp = mat4.perspective(hand_fov_deg, (w / max(h, 1)), float(FIRST_PERSON_HAND_NEAR), float(self.cfg.camera.z_far))
      if first_person.visible_special_item_icon is not None:
        self.special_item_pass.draw(first_person=first_person, view_proj=hand_vp, sun_dir=self.state.sun_dir)
      elif first_person.visible_block_id is not None:
        self.held_block_pass.draw(first_person=first_person, view_proj=hand_vp, sun_dir=self.state.sun_dir)
      else:
        self.first_person_arm_pass.draw(
          first_person=first_person, view_proj=hand_vp, sun_dir=self.state.sun_dir, hurt_tint_strength=float(0.0 if player_state is None else player_state.hurt_tint_strength)
        )

    return RendererFrameMetrics(world=world_metrics, shadow=shadow_metrics)
