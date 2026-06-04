# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import re
from pathlib import Path

_INCLUDE_RE = re.compile(r'^\s*#include\s+"([^"]+)"\s*$', re.MULTILINE)


def _shader_root() -> Path:
  return Path(__file__).resolve().parents[3] / "opengl" / "shaders"


def _expand_includes(path: Path, seen: tuple[Path, ...] = ()) -> str:
  src_path = Path(path).resolve()
  if src_path in seen:
    chain = " -> ".join(str(p.name) for p in (*seen, src_path))
    raise RuntimeError(f"Recursive shader include: {chain}")
  text = src_path.read_text(encoding="utf-8")

  def repl(match: re.Match[str]) -> str:
    include_path = src_path.parent / match.group(1)
    return _expand_includes(include_path, (*seen, src_path))

  return _INCLUDE_RE.sub(repl, text)


def _wgpu_glsl_source(filename: str) -> str:
  text = _expand_includes(_shader_root() / str(filename))
  text = _adapt_wgpu_glsl(str(filename), text)
  lines = text.splitlines()
  version_idx = next((i for i, line in enumerate(lines) if line.strip().startswith("#version")), None)
  if version_idx is None:
    raise RuntimeError(f"Shader is missing #version: {filename}")
  rest = lines[:version_idx] + lines[version_idx + 1 :]
  return "\n".join(("#version 450 core", *rest)) + "\n"


def _camera_uniform_block(name: str) -> str:
  if name == "first_person":
    return """layout(set = 0, binding = 0) uniform LudoxelFrameUniforms {
    mat4 ldx_viewProj;
    mat4 ldx_lightViewProj;
    vec4 ldx_sunDirTintMix;
    ivec4 ldx_faceSelMode;
    ivec4 ldx_selBlock;
};
"""
  if name == "selection":
    return """layout(set = 0, binding = 0) uniform LudoxelFrameUniforms {
    mat4 ldx_viewProj;
};
"""
  return """layout(set = 0, binding = 0) uniform LudoxelFrameUniforms {
    mat4 ldx_viewProj;
    mat4 ldx_lightViewProj;
    vec4 ldx_sunDirSelTint;
    ivec4 ldx_faceSelMode;
    ivec4 ldx_selBlock;
};
"""


def _replace_first_person_inverse(text: str) -> str:
  helper = """
mat3 inverse_transpose_mat3(mat3 m) {
    vec3 c0 = m[0];
    vec3 c1 = m[1];
    vec3 c2 = m[2];
    vec3 inv_t0 = cross(c1, c2);
    vec3 inv_t1 = cross(c2, c0);
    vec3 inv_t2 = cross(c0, c1);
    float det = dot(c0, inv_t0);
    if (abs(det) <= 0.000001) {
        return m;
    }
    float inv_det = 1.0 / det;
    return mat3(inv_t0 * inv_det, inv_t1 * inv_det, inv_t2 * inv_det);
}
"""
  return text.replace("\nvoid main() {\n", f"{helper}\nvoid main() {{\n").replace(
    "normalize(transpose(inverse(model_mat3())) * a_normal)", "normalize(inverse_transpose_mat3(model_mat3()) * a_normal)"
  )


def _adapt_wgpu_glsl(filename: str, text: str) -> str:
  name = str(filename)

  if name == "world.vert":
    text = text.replace("uniform mat4 u_viewProj;\nuniform mat4 u_lightViewProj;\nuniform int u_face;\nuniform int u_selMode;\nuniform ivec3 u_selBlock;\n", _camera_uniform_block("world"))
    text = text.replace(
      "out vec3 v_normal;\nout vec2 v_uv;\nout vec4 v_uvRect;\nout vec4 v_lightPos;\nout float v_shade;\nout float v_sel;",
      "layout(location = 0) out vec3 v_normal;\nlayout(location = 1) out vec2 v_uv;\nlayout(location = 2) out vec4 v_uvRect;\nlayout(location = 3) out vec4 v_lightPos;\nlayout(location = 4) out float v_shade;\nlayout(location = 5) out float v_sel;",
    )
    text = text.replace("u_viewProj", "ldx_viewProj")
    text = text.replace("u_lightViewProj", "ldx_lightViewProj")
    text = text.replace("int(u_face)", "int(ldx_faceSelMode.x)")
    text = text.replace("u_selMode", "ldx_faceSelMode.y")
    text = text.replace("u_selBlock", "ldx_selBlock.xyz")
    return text

  if name == "shadow.vert":
    text = text.replace("uniform mat4 u_lightViewProj;\nuniform int u_face;\n", _camera_uniform_block("world"))
    text = text.replace("u_lightViewProj", "ldx_lightViewProj")
    text = text.replace("int(u_face)", "int(ldx_faceSelMode.x)")
    return text

  if name == "world.frag":
    text = text.replace(
      "in vec3 v_normal;\nin vec2 v_uv;\nin vec4 v_uvRect;\nin vec4 v_lightPos;\n\nin float v_shade;\nin float v_sel;",
      "layout(location = 0) in vec3 v_normal;\nlayout(location = 1) in vec2 v_uv;\nlayout(location = 2) in vec4 v_uvRect;\nlayout(location = 3) in vec4 v_lightPos;\n\nlayout(location = 4) in float v_shade;\nlayout(location = 5) in float v_sel;",
    )
    text = text.replace(
      "uniform sampler2D u_atlas;\nuniform sampler2DShadow u_shadowMap;\nuniform int u_shadowEnabled;\nuniform vec2 u_shadowTexel;\nuniform float u_shadowDarkMul;\nuniform float u_shadowBiasMin;\nuniform float u_shadowBiasSlope;\nuniform vec3 u_sunDir;\nuniform int u_debugShadow;\nuniform int u_selMode;\nuniform float u_selTint;\n",
      _camera_uniform_block("world")
      + "\nlayout(set = 1, binding = 0) uniform texture2D ldx_atlasTexture;\nlayout(set = 1, binding = 1) uniform sampler ldx_atlasSampler;\nlayout(set = 2, binding = 0) uniform texture2D ldx_shadowTexture;\nlayout(set = 2, binding = 1) uniform samplerShadow ldx_shadowSampler;\n",
    )
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("texture(u_shadowMap, vec3(uvz.xy, z))", "texture(sampler2DShadow(ldx_shadowTexture, ldx_shadowSampler), vec3(uvz.xy, z))")
    text = text.replace("texture(u_atlas, uv)", "texture(sampler2D(ldx_atlasTexture, ldx_atlasSampler), uv)")
    text = text.replace("u_shadowEnabled", "ldx_faceSelMode.z")
    text = text.replace("u_shadowTexel", "vec2(1.0 / 2048.0, 1.0 / 2048.0)")
    text = text.replace("u_shadowDarkMul", "0.20")
    text = text.replace("u_shadowBiasMin", "0.00005")
    text = text.replace("u_shadowBiasSlope", "0.00050")
    text = text.replace("u_sunDir", "ldx_sunDirSelTint.xyz")
    text = text.replace("u_debugShadow", "ldx_faceSelMode.w")
    text = text.replace("u_selMode", "ldx_faceSelMode.y")
    text = text.replace("u_selTint", "ldx_sunDirSelTint.w")
    return text

  if name == "world_no_shadow.frag":
    text = text.replace(
      "in vec3 v_normal;\nin vec2 v_uv;\nin vec4 v_uvRect;\n\nin float v_shade;\nin float v_sel;",
      "layout(location = 0) in vec3 v_normal;\nlayout(location = 1) in vec2 v_uv;\nlayout(location = 2) in vec4 v_uvRect;\n\nlayout(location = 4) in float v_shade;\nlayout(location = 5) in float v_sel;",
    )
    text = text.replace(
      "uniform sampler2D u_atlas;\nuniform vec3 u_sunDir;\nuniform int u_selMode;\nuniform float u_selTint;\n",
      _camera_uniform_block("world") + "\nlayout(set = 1, binding = 0) uniform texture2D ldx_atlasTexture;\nlayout(set = 1, binding = 1) uniform sampler ldx_atlasSampler;\n",
    )
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("texture(u_atlas, uv)", "texture(sampler2D(ldx_atlasTexture, ldx_atlasSampler), uv)")
    text = text.replace("u_sunDir", "ldx_sunDirSelTint.xyz")
    text = text.replace("u_selMode", "ldx_faceSelMode.y")
    text = text.replace("u_selTint", "ldx_sunDirSelTint.w")
    return text

  if name == "selection_line.vert":
    return text.replace("uniform mat4 u_viewProj;\n", _camera_uniform_block("selection")).replace("u_viewProj", "ldx_viewProj")

  if name == "selection_line.frag":
    return text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")

  if name == "first_person_face.vert":
    text = text.replace("uniform mat4 u_viewProj;\n", _camera_uniform_block("first_person"))
    text = text.replace(
      "out vec3 v_normal;\nout vec2 v_uv;\nout vec4 v_uvRect;", "layout(location = 0) out vec3 v_normal;\nlayout(location = 1) out vec2 v_uv;\nlayout(location = 2) out vec4 v_uvRect;"
    )
    text = text.replace("u_viewProj", "ldx_viewProj")
    return _replace_first_person_inverse(text)

  if name == "first_person_face.frag":
    text = text.replace("in vec3 v_normal;\nin vec2 v_uv;\nin vec4 v_uvRect;", "layout(location = 0) in vec3 v_normal;\nlayout(location = 1) in vec2 v_uv;\nlayout(location = 2) in vec4 v_uvRect;")
    text = text.replace(
      "uniform sampler2D u_texture;\nuniform vec3 u_sunDir;\nuniform vec3 u_tintColor;\nuniform float u_tintMix;\n",
      _camera_uniform_block("first_person") + "\nlayout(set = 1, binding = 0) uniform texture2D ldx_texture;\nlayout(set = 1, binding = 1) uniform sampler ldx_sampler;\n",
    )
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("texture(u_texture, uv)", "texture(sampler2D(ldx_texture, ldx_sampler), uv)")
    text = text.replace("u_sunDir", "ldx_sunDirTintMix.xyz")
    text = text.replace("u_tintColor", "vec3(1.0, 0.32, 0.32)")
    text = text.replace("u_tintMix", "ldx_sunDirTintMix.w")
    return text

  return text


def create_world_pipeline(*, device, target_format, depth_format, camera_bind_group_layout, atlas_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-world.vert", code=_wgpu_glsl_source("world.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-world.frag", code=_wgpu_glsl_source("world_no_shadow.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-world-layout", bind_group_layouts=[camera_bind_group_layout, atlas_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-world-pipeline",
    layout=layout,
    vertex={
      "module": vertex_shader,
      "entry_point": "main",
      "buffers": [
        {
          "array_stride": 8 * 4,
          "step_mode": "vertex",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0},
            {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1},
            {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2},
          ],
        },
        {
          "array_stride": 12 * 4,
          "step_mode": "instance",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 3},
            {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 4},
            {"format": wgpu.VertexFormat.float32x4, "offset": 6 * 4, "shader_location": 5},
            {"format": wgpu.VertexFormat.float32, "offset": 10 * 4, "shader_location": 6},
            {"format": wgpu.VertexFormat.float32, "offset": 11 * 4, "shader_location": 7},
          ],
        },
      ],
    },
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format}]},
  )


def create_world_shadowed_pipeline(*, device, target_format, depth_format, camera_bind_group_layout, atlas_bind_group_layout, shadow_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-world-shadowed.vert", code=_wgpu_glsl_source("world.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-world-shadowed.frag", code=_wgpu_glsl_source("world.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-world-shadowed-layout", bind_group_layouts=[camera_bind_group_layout, atlas_bind_group_layout, shadow_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-world-shadowed-pipeline",
    layout=layout,
    vertex={
      "module": vertex_shader,
      "entry_point": "main",
      "buffers": [
        {
          "array_stride": 8 * 4,
          "step_mode": "vertex",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0},
            {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1},
            {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2},
          ],
        },
        {
          "array_stride": 12 * 4,
          "step_mode": "instance",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 3},
            {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 4},
            {"format": wgpu.VertexFormat.float32x4, "offset": 6 * 4, "shader_location": 5},
            {"format": wgpu.VertexFormat.float32, "offset": 10 * 4, "shader_location": 6},
            {"format": wgpu.VertexFormat.float32, "offset": 11 * 4, "shader_location": 7},
          ],
        },
      ],
    },
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format}]},
  )


def create_shadow_depth_pipeline(*, device, depth_format, camera_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-shadow.vert", code=_wgpu_glsl_source("shadow.vert"))
  layout = device.create_pipeline_layout(label="ludoxel-shadow-layout", bind_group_layouts=[camera_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-shadow-pipeline",
    layout=layout,
    vertex={
      "module": vertex_shader,
      "entry_point": "main",
      "buffers": [
        {
          "array_stride": 8 * 4,
          "step_mode": "vertex",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0},
            {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1},
            {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2},
          ],
        },
        {
          "array_stride": 12 * 4,
          "step_mode": "instance",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 3},
            {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 4},
            {"format": wgpu.VertexFormat.float32x4, "offset": 6 * 4, "shader_location": 5},
            {"format": wgpu.VertexFormat.float32, "offset": 10 * 4, "shader_location": 6},
            {"format": wgpu.VertexFormat.float32, "offset": 11 * 4, "shader_location": 7},
          ],
        },
      ],
    },
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less},
  )


def create_selection_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-selection.vert", code=_wgpu_glsl_source("selection_line.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-selection.frag", code=_wgpu_glsl_source("selection_line.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-selection-layout", bind_group_layouts=[camera_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-selection-pipeline",
    layout=layout,
    vertex={
      "module": vertex_shader,
      "entry_point": "main",
      "buffers": [{"array_stride": 3 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}]}],
    },
    primitive={"topology": wgpu.PrimitiveTopology.line_list},
    depth_stencil={"format": depth_format, "depth_write_enabled": False, "depth_compare": wgpu.CompareFunction.less_equal},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format}]},
  )


def create_textured_face_pipeline(*, device, target_format, depth_format, camera_bind_group_layout, texture_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-first-person-face.vert", code=_wgpu_glsl_source("first_person_face.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-first-person-face.frag", code=_wgpu_glsl_source("first_person_face.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-textured-face-layout", bind_group_layouts=[camera_bind_group_layout, texture_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-textured-face-pipeline",
    layout=layout,
    vertex={
      "module": vertex_shader,
      "entry_point": "main",
      "buffers": [
        {
          "array_stride": 8 * 4,
          "step_mode": "vertex",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0},
            {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1},
            {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2},
          ],
        },
        {
          "array_stride": 20 * 4,
          "step_mode": "instance",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x4, "offset": 0, "shader_location": 3},
            {"format": wgpu.VertexFormat.float32x4, "offset": 4 * 4, "shader_location": 4},
            {"format": wgpu.VertexFormat.float32x4, "offset": 8 * 4, "shader_location": 5},
            {"format": wgpu.VertexFormat.float32x4, "offset": 12 * 4, "shader_location": 6},
            {"format": wgpu.VertexFormat.float32x4, "offset": 16 * 4, "shader_location": 7},
          ],
        },
      ],
    },
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format}]},
  )
