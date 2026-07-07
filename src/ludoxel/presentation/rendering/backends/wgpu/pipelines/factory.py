# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.presentation.rendering.shaders.source import load_shader_source


def _wgpu_glsl_source(filename: str) -> str:
  name = str(filename)
  text = load_shader_source(name, collapse_blank_before_include=True)
  text = _adapt_wgpu_glsl(name, text)
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
    vec4 ldx_fogCamPosStart;
    vec4 ldx_fogColorEnd;
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
    vec4 ldx_fogCamPosStart;
    vec4 ldx_fogColorEnd;
    vec4 ldx_shadowParams;
    vec4 ldx_shadowParams2;
};
"""


def _replace_inverse_transpose_calls(text: str) -> str:
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
  text = text.replace("\nvoid main() {\n", f"{helper}\nvoid main() {{\n")
  text = text.replace("normalize(transpose(inverse(model_mat3())) * a_normal)", "normalize(inverse_transpose_mat3(model_mat3()) * a_normal)")
  text = text.replace("normalize(transpose(inverse(m)) * a_normal)", "normalize(inverse_transpose_mat3(m) * a_normal)")
  return text


def _cloud_uniform_block() -> str:
  return """layout(set = 0, binding = 0) uniform LudoxelCloudUniforms {
    mat4 ldx_viewProj;
    vec4 ldx_cloudShiftAlpha;
    vec4 ldx_cloudColor;
    vec4 ldx_cloudSunDir;
    vec4 ldx_cloudFogParams;
    vec4 ldx_cloudEyeTime;
    vec4 ldx_cloudFlowDir;
};
"""


def _sun_uniform_block() -> str:
  return """layout(set = 0, binding = 0) uniform LudoxelSunUniforms {
    mat4 ldx_viewProj;
    vec4 ldx_centerHalf;
    vec4 ldx_u;
    vec4 ldx_v;
    vec4 ldx_sunMode;
};
"""


def _sun_flare_uniform_block() -> str:
  return """layout(set = 0, binding = 0) uniform LudoxelSunFlareUniforms {
    vec4 ldx_flareSunStrengthAspect;
};
"""


def _adapt_wgpu_glsl(filename: str, text: str) -> str:
  name = str(filename)

  if name == "world.vert":
    text = text.replace("out vec3 v_worldPos;", "layout(location = 6) out vec3 v_worldPos;")
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
    text = text.replace("in vec3 v_worldPos;", "layout(location = 6) in vec3 v_worldPos;")
    text = text.replace("uniform vec3 u_fogCamPos;\nuniform float u_fogStart;\nuniform float u_fogEnd;\nuniform vec3 u_fogColor;\n", "")
    text = text.replace(
      "in vec3 v_normal;\nin vec2 v_uv;\nin vec4 v_uvRect;\nin vec4 v_lightPos;\n\nin float v_shade;\nin float v_sel;",
      "layout(location = 0) in vec3 v_normal;\nlayout(location = 1) in vec2 v_uv;\nlayout(location = 2) in vec4 v_uvRect;\nlayout(location = 3) in vec4 v_lightPos;\n\nlayout(location = 4) in float v_shade;\nlayout(location = 5) in float v_sel;",
    )
    text = text.replace(
      "uniform sampler2D u_atlas;\nuniform sampler2DShadow u_shadowMap;\nuniform int u_shadowEnabled;\nuniform vec2 u_shadowTexel;\nuniform float u_shadowDarkMul;\nuniform float u_shadowBiasMin;\nuniform float u_shadowBiasSlope;\nuniform float u_shadowPcfRadius;\nuniform vec3 u_sunDir;\nuniform int u_debugShadow;\nuniform int u_selMode;\nuniform float u_selTint;\n",
      _camera_uniform_block("world") + "\nlayout(set = 1, binding = 0) uniform texture2D ldx_atlasTexture;\nlayout(set = 1, binding = 1) uniform sampler ldx_atlasSampler;\nlayout(set = 2, binding = 0) uniform texture2D ldx_shadowTexture;\nlayout(set = 2, binding = 1) uniform samplerShadow ldx_shadowSampler;\n",
    )
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("vec3 uvz = ndc * 0.5 + 0.5;", "vec3 uvz = vec3(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5, ndc.z);")
    text = text.replace("texture(u_shadowMap, vec3(uvz.xy, z))", "texture(sampler2DShadow(ldx_shadowTexture, ldx_shadowSampler), vec3(uvz.xy, z))")
    text = text.replace("texture(u_atlas, uv)", "texture(sampler2D(ldx_atlasTexture, ldx_atlasSampler), uv)")
    text = text.replace("u_shadowEnabled", "ldx_faceSelMode.z")
    text = text.replace("u_shadowTexel", "vec2(ldx_shadowParams.x, ldx_shadowParams.x)")
    text = text.replace("u_shadowDarkMul", "ldx_shadowParams.y")
    text = text.replace("u_shadowBiasMin", "ldx_shadowParams.z")
    text = text.replace("u_shadowBiasSlope", "ldx_shadowParams.w")
    text = text.replace("u_shadowPcfRadius", "ldx_shadowParams2.x")
    text = text.replace("u_sunDir", "ldx_sunDirSelTint.xyz")
    text = text.replace("u_debugShadow", "ldx_faceSelMode.w")
    text = text.replace("u_selMode", "ldx_faceSelMode.y")
    text = text.replace("u_selTint", "ldx_sunDirSelTint.w")
    text = text.replace("u_fogCamPos", "ldx_fogCamPosStart.xyz")
    text = text.replace("u_fogStart", "ldx_fogCamPosStart.w")
    text = text.replace("u_fogEnd", "ldx_fogColorEnd.w")
    text = text.replace("u_fogColor", "ldx_fogColorEnd.rgb")
    text = text.replace("uniform float u_ultra;\n", "")
    text = text.replace("u_ultra", "ldx_shadowParams2.y")
    return text

  if name == "world_no_shadow.frag":
    text = text.replace("in vec3 v_worldPos;", "layout(location = 6) in vec3 v_worldPos;")
    text = text.replace("uniform vec3 u_fogCamPos;\nuniform float u_fogStart;\nuniform float u_fogEnd;\nuniform vec3 u_fogColor;\n", "")
    text = text.replace("in vec3 v_normal;\nin vec2 v_uv;\nin vec4 v_uvRect;\n\nin float v_shade;\nin float v_sel;", "layout(location = 0) in vec3 v_normal;\nlayout(location = 1) in vec2 v_uv;\nlayout(location = 2) in vec4 v_uvRect;\n\nlayout(location = 4) in float v_shade;\nlayout(location = 5) in float v_sel;")
    text = text.replace("uniform sampler2D u_atlas;\nuniform vec3 u_sunDir;\nuniform int u_selMode;\nuniform float u_selTint;\n", _camera_uniform_block("world") + "\nlayout(set = 1, binding = 0) uniform texture2D ldx_atlasTexture;\nlayout(set = 1, binding = 1) uniform sampler ldx_atlasSampler;\n")
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("texture(u_atlas, uv)", "texture(sampler2D(ldx_atlasTexture, ldx_atlasSampler), uv)")
    text = text.replace("u_sunDir", "ldx_sunDirSelTint.xyz")
    text = text.replace("u_selMode", "ldx_faceSelMode.y")
    text = text.replace("u_selTint", "ldx_sunDirSelTint.w")
    text = text.replace("u_fogCamPos", "ldx_fogCamPosStart.xyz")
    text = text.replace("u_fogStart", "ldx_fogCamPosStart.w")
    text = text.replace("u_fogEnd", "ldx_fogColorEnd.w")
    text = text.replace("u_fogColor", "ldx_fogColorEnd.rgb")
    text = text.replace("uniform float u_ultra;\n", "")
    text = text.replace("u_ultra", "ldx_shadowParams2.y")
    return text

  if name == "selection_line.vert":
    return text.replace("uniform mat4 u_viewProj;\n", _camera_uniform_block("selection")).replace("u_viewProj", "ldx_viewProj")

  if name == "selection_line.frag":
    return text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")

  if name == "cloud_box.vert":
    text = text.replace("out vec3 v_worldPos;", "layout(location = 2) out vec3 v_worldPos;")
    text = text.replace("uniform mat4 u_viewProj;\nuniform vec3 u_shift; // smooth translation (world space)\nuniform float u_time;\nuniform vec2 u_flowDirXZ;\n", _cloud_uniform_block())
    text = text.replace("out vec3 v_normal;\nout float v_alphaMul;", "layout(location = 0) out vec3 v_normal;\nlayout(location = 1) out float v_alphaMul;")
    text = text.replace("u_viewProj", "ldx_viewProj")
    text = text.replace("u_shift", "ldx_cloudShiftAlpha.xyz")
    text = text.replace("u_time", "ldx_cloudEyeTime.w")
    text = text.replace("u_flowDirXZ", "ldx_cloudFlowDir.xy")
    return text

  if name == "cloud_box.frag":
    text = text.replace("in vec3 v_worldPos;", "layout(location = 2) in vec3 v_worldPos;")
    text = text.replace("uniform vec2 u_fogCamXZ;\nuniform float u_fogStart;\nuniform float u_fogEnd;\n", "")
    text = text.replace("in vec3 v_normal;\nin float v_alphaMul;", "layout(location = 0) in vec3 v_normal;\nlayout(location = 1) in float v_alphaMul;")
    text = text.replace("uniform vec3 u_color;\nuniform float u_alpha;\nuniform vec3 u_sunDir;\n", _cloud_uniform_block())
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("u_color", "ldx_cloudColor.rgb")
    text = text.replace("u_alpha", "ldx_cloudColor.a")
    text = text.replace("u_sunDir", "ldx_cloudSunDir.xyz")
    text = text.replace("u_fogCamXZ", "ldx_cloudFogParams.xy")
    text = text.replace("u_fogStart", "ldx_cloudFogParams.z")
    text = text.replace("u_fogEnd", "ldx_cloudFogParams.w")
    return text

  if name == "cloud_volume.vert":
    text = text.replace("out vec3 v_worldPos;", "layout(location = 0) out vec3 v_worldPos;")
    text = text.replace("flat out vec3 v_center;", "layout(location = 1) flat out vec3 v_center;")
    text = text.replace("flat out vec3 v_halfSize;", "layout(location = 2) flat out vec3 v_halfSize;")
    text = text.replace("flat out float v_seed;", "layout(location = 3) flat out float v_seed;")
    text = text.replace("flat out float v_alphaMul;", "layout(location = 4) flat out float v_alphaMul;")
    text = text.replace("flat out float v_bitmask;", "layout(location = 5) flat out float v_bitmask;")
    text = text.replace("flat out float v_dims;", "layout(location = 6) flat out float v_dims;")
    text = text.replace("uniform mat4 u_viewProj;\nuniform vec3 u_shift; // wind translation (world space)\nuniform float u_cellSize;\n", _cloud_uniform_block())
    text = text.replace("u_viewProj", "ldx_viewProj")
    text = text.replace("u_shift", "ldx_cloudShiftAlpha.xyz")
    text = text.replace("u_cellSize", "ldx_cloudFlowDir.z")
    return text

  if name == "cloud_volume.frag":
    text = text.replace("in vec3 v_worldPos;", "layout(location = 0) in vec3 v_worldPos;")
    text = text.replace("flat in vec3 v_center;", "layout(location = 1) flat in vec3 v_center;")
    text = text.replace("flat in vec3 v_halfSize;", "layout(location = 2) flat in vec3 v_halfSize;")
    text = text.replace("flat in float v_seed;", "layout(location = 3) flat in float v_seed;")
    text = text.replace("flat in float v_alphaMul;", "layout(location = 4) flat in float v_alphaMul;")
    text = text.replace("flat in float v_bitmask;", "layout(location = 5) flat in float v_bitmask;")
    text = text.replace("flat in float v_dims;", "layout(location = 6) flat in float v_dims;")
    text = text.replace("uniform vec2 u_fogCamXZ;\nuniform float u_fogStart;\nuniform float u_fogEnd;\n", "")
    text = text.replace("uniform vec3 u_color;\nuniform float u_alpha;\nuniform vec3 u_sunDir;\nuniform vec3 u_eyePos;\nuniform float u_time;\nuniform float u_cellSize;\n", _cloud_uniform_block())
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("u_color", "ldx_cloudColor.rgb")
    text = text.replace("u_alpha", "ldx_cloudColor.a")
    text = text.replace("u_sunDir", "ldx_cloudSunDir.xyz")
    text = text.replace("u_eyePos", "ldx_cloudEyeTime.xyz")
    text = text.replace("u_time", "ldx_cloudEyeTime.w")
    text = text.replace("u_cellSize", "ldx_cloudFlowDir.z")
    text = text.replace("u_fogCamXZ", "ldx_cloudFogParams.xy")
    text = text.replace("u_fogStart", "ldx_cloudFogParams.z")
    text = text.replace("u_fogEnd", "ldx_cloudFogParams.w")
    return text

  if name == "sun.vert":
    text = text.replace("uniform mat4 u_viewProj;\nuniform vec3 u_center;\nuniform vec3 u_u;\nuniform vec3 u_v;\nuniform float u_halfSize;\n", _sun_uniform_block())
    text = text.replace("out vec2 v_uv;", "layout(location = 0) out vec2 v_uv;")
    text = text.replace("u_viewProj", "ldx_viewProj")
    text = text.replace("u_center", "ldx_centerHalf.xyz")
    text = text.replace("u_u", "ldx_u.xyz")
    text = text.replace("u_v", "ldx_v.xyz")
    text = text.replace("u_halfSize", "ldx_centerHalf.w")
    return text

  if name == "sun.frag":
    text = text.replace("in vec2 v_uv;", "layout(location = 0) in vec2 v_uv;")
    text = text.replace("uniform float u_ultra;\nuniform float u_mode;\nuniform float u_glare;\n", _sun_uniform_block())
    text = text.replace("u_ultra", "ldx_sunMode.x")
    text = text.replace("u_mode", "ldx_sunMode.y")
    text = text.replace("u_glare", "ldx_sunMode.z")
    return text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")

  if name == "sun_flare.vert":
    return text.replace("out vec2 v_ndc;", "layout(location = 0) out vec2 v_ndc;")

  if name == "sun_flare.frag":
    text = text.replace("in vec2 v_ndc;", "layout(location = 0) in vec2 v_ndc;")
    text = text.replace("uniform vec2 u_sunNdc;\nuniform float u_strength;\nuniform float u_aspect;\n", _sun_flare_uniform_block())
    text = text.replace("u_sunNdc", "ldx_flareSunStrengthAspect.xy")
    text = text.replace("u_strength", "ldx_flareSunStrengthAspect.z")
    text = text.replace("u_aspect", "ldx_flareSunStrengthAspect.w")
    return text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")

  if name == "first_person_face.vert":
    text = text.replace("out vec3 v_worldPos;", "layout(location = 3) out vec3 v_worldPos;")
    text = text.replace("uniform mat4 u_viewProj;\n", _camera_uniform_block("first_person"))
    text = text.replace("out vec3 v_normal;\nout vec2 v_uv;\nout vec4 v_uvRect;", "layout(location = 0) out vec3 v_normal;\nlayout(location = 1) out vec2 v_uv;\nlayout(location = 2) out vec4 v_uvRect;")
    text = text.replace("u_viewProj", "ldx_viewProj")
    return _replace_inverse_transpose_calls(text)

  if name == "first_person_face.frag":
    text = text.replace("in vec3 v_worldPos;", "layout(location = 3) in vec3 v_worldPos;")
    text = text.replace("uniform vec3 u_fogCamPos;\nuniform float u_fogStart;\nuniform float u_fogEnd;\nuniform vec3 u_fogColor;\n", "")
    text = text.replace("in vec3 v_normal;\nin vec2 v_uv;\nin vec4 v_uvRect;", "layout(location = 0) in vec3 v_normal;\nlayout(location = 1) in vec2 v_uv;\nlayout(location = 2) in vec4 v_uvRect;")
    text = text.replace("uniform sampler2D u_texture;\nuniform vec3 u_sunDir;\nuniform vec3 u_tintColor;\nuniform float u_tintMix;\n", _camera_uniform_block("first_person") + "\nlayout(set = 1, binding = 0) uniform texture2D ldx_texture;\nlayout(set = 1, binding = 1) uniform sampler ldx_sampler;\n")
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("texture(u_texture, uv)", "texture(sampler2D(ldx_texture, ldx_sampler), uv)")
    text = text.replace("u_sunDir", "ldx_sunDirTintMix.xyz")
    text = text.replace("u_tintColor", "vec3(1.0, 0.32, 0.32)")
    text = text.replace("u_tintMix", "ldx_sunDirTintMix.w")
    text = text.replace("u_fogCamPos", "ldx_fogCamPosStart.xyz")
    text = text.replace("u_fogStart", "ldx_fogCamPosStart.w")
    text = text.replace("u_fogEnd", "ldx_fogColorEnd.w")
    text = text.replace("u_fogColor", "ldx_fogColorEnd.rgb")
    return text

  if name == "othello.vert":
    text = text.replace("out vec3 v_worldPos;", "layout(location = 4) out vec3 v_worldPos;")
    text = text.replace("uniform mat4 u_viewProj;\nuniform mat4 u_lightViewProj;\n", _camera_uniform_block("world"))
    text = text.replace("out vec3 v_normal;\nout vec3 v_color;\n\nout float v_alpha;\n\nout vec4 v_lightPos;", "layout(location = 0) out vec3 v_normal;\nlayout(location = 1) out vec3 v_color;\n\nlayout(location = 2) out float v_alpha;\n\nlayout(location = 3) out vec4 v_lightPos;")
    text = text.replace("u_viewProj", "ldx_viewProj")
    text = text.replace("u_lightViewProj", "ldx_lightViewProj")
    return _replace_inverse_transpose_calls(text)

  if name == "othello.frag":
    text = text.replace("in vec3 v_worldPos;", "layout(location = 4) in vec3 v_worldPos;")
    text = text.replace("uniform vec3 u_fogCamPos;\nuniform float u_fogStart;\nuniform float u_fogEnd;\nuniform vec3 u_fogColor;\n\n", "")
    text = text.replace(
      "uniform vec3 u_sunDir;\n\nuniform sampler2DShadow u_shadowMap;\n\nuniform int u_shadowEnabled;\n\nuniform vec2 u_shadowTexel;\n\nuniform float u_shadowDarkMul;\nuniform float u_shadowBiasMin;\nuniform float u_shadowBiasSlope;\nuniform float u_shadowPcfRadius;\n\nuniform int u_debugShadow;\n",
      _camera_uniform_block("world") + "\nlayout(set = 1, binding = 0) uniform texture2D ldx_shadowTexture;\nlayout(set = 1, binding = 1) uniform samplerShadow ldx_shadowSampler;\n",
    )
    text = text.replace("in vec3 v_normal;\nin vec3 v_color;\n\nin float v_alpha;\n\nin vec4 v_lightPos;", "layout(location = 0) in vec3 v_normal;\nlayout(location = 1) in vec3 v_color;\n\nlayout(location = 2) in float v_alpha;\n\nlayout(location = 3) in vec4 v_lightPos;")
    text = text.replace("out vec4 fragColor;", "layout(location = 0) out vec4 fragColor;")
    text = text.replace("vec3 uvz = ndc * 0.5 + 0.5;", "vec3 uvz = vec3(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5, ndc.z);")
    text = text.replace("texture(u_shadowMap, vec3(uvz.xy, z))", "texture(sampler2DShadow(ldx_shadowTexture, ldx_shadowSampler), vec3(uvz.xy, z))")
    text = text.replace("u_shadowEnabled", "ldx_faceSelMode.z")
    text = text.replace("u_shadowTexel", "vec2(ldx_shadowParams.x, ldx_shadowParams.x)")
    text = text.replace("u_shadowDarkMul", "ldx_shadowParams.y")
    text = text.replace("u_shadowBiasMin", "ldx_shadowParams.z")
    text = text.replace("u_shadowBiasSlope", "ldx_shadowParams.w")
    text = text.replace("u_shadowPcfRadius", "ldx_shadowParams2.x")
    text = text.replace("u_sunDir", "ldx_sunDirSelTint.xyz")
    text = text.replace("u_debugShadow", "ldx_faceSelMode.w")
    text = text.replace("u_fogCamPos", "ldx_fogCamPosStart.xyz")
    text = text.replace("u_fogStart", "ldx_fogCamPosStart.w")
    text = text.replace("u_fogEnd", "ldx_fogColorEnd.w")
    text = text.replace("u_fogColor", "ldx_fogColorEnd.rgb")
    return text

  if name == "othello_shadow.vert":
    text = text.replace("uniform mat4 u_lightViewProj;\n", _camera_uniform_block("world"))
    text = text.replace("u_lightViewProj", "ldx_lightViewProj")
    return text

  if name == "player_model_shadow.vert":
    text = text.replace("uniform mat4 u_lightViewProj;\n", _camera_uniform_block("world"))
    text = text.replace("u_lightViewProj", "ldx_lightViewProj")
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
        {"array_stride": 8 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}, {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1}, {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2}]},
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
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "front_face": wgpu.FrontFace.ccw, "cull_mode": wgpu.CullMode.back},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format}]},
  )


def create_world_wireframe_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-world-wireframe.vert", code=_wgpu_glsl_source("world.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-world-wireframe.frag", code=_wgpu_glsl_source("selection_line.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-world-wireframe-layout", bind_group_layouts=[camera_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-world-wireframe-pipeline",
    layout=layout,
    vertex={
      "module": vertex_shader,
      "entry_point": "main",
      "buffers": [
        {"array_stride": 8 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}, {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1}, {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2}]},
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
    primitive={"topology": wgpu.PrimitiveTopology.line_list, "front_face": wgpu.FrontFace.ccw, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": False, "depth_compare": wgpu.CompareFunction.less_equal},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format}]},
  )


def create_sun_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-sun.vert", code=_wgpu_glsl_source("sun.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-sun.frag", code=_wgpu_glsl_source("sun.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-sun-layout", bind_group_layouts=[camera_bind_group_layout])
  blend = {"color": {"src_factor": wgpu.BlendFactor.src_alpha, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}, "alpha": {"src_factor": wgpu.BlendFactor.one, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}}
  return device.create_render_pipeline(
    label="ludoxel-sun-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": []},
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": False, "depth_compare": wgpu.CompareFunction.always},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format, "blend": blend}]},
  )


def create_sun_glare_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  # The veiling glare reuses the sun shader and is drawn as background before the world pass, like the sun disc.
  # The billboard is a flat card at one world depth, so depth-testing it against the world buffer carved its iso-depth contour into a hard line across
  # the fogged terrain and framed the veil against the sky. Drawing it before the world with an `always` comparison and no depth write lets the opaque
  # world overdraw it, so foreground geometry occludes the glow at the terrain silhouette and the falloff stays continuous.
  vertex_shader = device.create_shader_module(label="ludoxel-sun-glare.vert", code=_wgpu_glsl_source("sun.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-sun-glare.frag", code=_wgpu_glsl_source("sun.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-sun-glare-layout", bind_group_layouts=[camera_bind_group_layout])
  blend = {"color": {"src_factor": wgpu.BlendFactor.src_alpha, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}, "alpha": {"src_factor": wgpu.BlendFactor.one, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}}
  return device.create_render_pipeline(
    label="ludoxel-sun-glare-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": []},
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": False, "depth_compare": wgpu.CompareFunction.always},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format, "blend": blend}]},
  )


def create_sun_flare_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  # Screen-space lens flare. A fullscreen triangle emitted from the vertex index needs no vertex buffer; the fragment stage places ghost discs from
  # the sun's screen position. It writes no depth and blends over the composed frame as a final overlay, matching the OpenGL flare path.
  vertex_shader = device.create_shader_module(label="ludoxel-sun-flare.vert", code=_wgpu_glsl_source("sun_flare.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-sun-flare.frag", code=_wgpu_glsl_source("sun_flare.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-sun-flare-layout", bind_group_layouts=[camera_bind_group_layout])
  blend = {"color": {"src_factor": wgpu.BlendFactor.src_alpha, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}, "alpha": {"src_factor": wgpu.BlendFactor.one, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}}
  return device.create_render_pipeline(
    label="ludoxel-sun-flare-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": []},
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": False, "depth_compare": wgpu.CompareFunction.always},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format, "blend": blend}]},
  )


def _cloud_instance_buffer_layout(*, wgpu):
  # 11-float cloud instance row shared with the OpenGL path: center, scale + alphaMul, speedMultiplier, turbulence amp/freq/phase.
  return {
    "array_stride": 11 * 4,
    "step_mode": "instance",
    "attributes": [
      {"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 3},
      {"format": wgpu.VertexFormat.float32x4, "offset": 3 * 4, "shader_location": 4},
      {"format": wgpu.VertexFormat.float32, "offset": 7 * 4, "shader_location": 5},
      {"format": wgpu.VertexFormat.float32x3, "offset": 8 * 4, "shader_location": 6},
    ],
  }


def _cloud_vertex_buffer_layout(*, wgpu):
  return {"array_stride": 8 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}, {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1}]}


def create_cloud_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-cloud_box.vert", code=_wgpu_glsl_source("cloud_box.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-cloud_box.frag", code=_wgpu_glsl_source("cloud_box.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-cloud-layout", bind_group_layouts=[camera_bind_group_layout])
  blend = {"color": {"src_factor": wgpu.BlendFactor.src_alpha, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}, "alpha": {"src_factor": wgpu.BlendFactor.one, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}}
  return device.create_render_pipeline(
    label="ludoxel-cloud-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": [_cloud_vertex_buffer_layout(wgpu=wgpu), _cloud_instance_buffer_layout(wgpu=wgpu)]},
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "front_face": wgpu.FrontFace.ccw, "cull_mode": wgpu.CullMode.back},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format, "blend": blend}]},
  )


def create_cloud_volume_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-cloud-volume.vert", code=_wgpu_glsl_source("cloud_volume.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-cloud_volume.frag", code=_wgpu_glsl_source("cloud_volume.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-cloud-volume-layout", bind_group_layouts=[camera_bind_group_layout])
  blend = {"color": {"src_factor": wgpu.BlendFactor.src_alpha, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}, "alpha": {"src_factor": wgpu.BlendFactor.one, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}}
  return device.create_render_pipeline(
    label="ludoxel-cloud-volume-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": [_cloud_vertex_buffer_layout(wgpu=wgpu), _cloud_instance_buffer_layout(wgpu=wgpu)]},
    # Draw the box back faces so the raymarch proxy is rasterized from any side, including inside the volume; the translucent result never writes
    # depth so distant clouds stay visible through nearer ones.
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "front_face": wgpu.FrontFace.ccw, "cull_mode": wgpu.CullMode.front},
    depth_stencil={"format": depth_format, "depth_write_enabled": False, "depth_compare": wgpu.CompareFunction.less},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format, "blend": blend}]},
  )


def create_cloud_wireframe_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-cloud-wireframe.vert", code=_wgpu_glsl_source("cloud_box.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-cloud-wireframe.frag", code=_wgpu_glsl_source("selection_line.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-cloud-wireframe-layout", bind_group_layouts=[camera_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-cloud-wireframe-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": [_cloud_vertex_buffer_layout(wgpu=wgpu), _cloud_instance_buffer_layout(wgpu=wgpu)]},
    primitive={"topology": wgpu.PrimitiveTopology.line_list, "front_face": wgpu.FrontFace.ccw, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": False, "depth_compare": wgpu.CompareFunction.less_equal},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format}]},
  )


def _othello_vertex_buffers(*, wgpu, shadow: bool = False):
  vertex_attrs = [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}]
  if not bool(shadow):
    vertex_attrs.extend(({"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1}, {"format": wgpu.VertexFormat.float32x3, "offset": 6 * 4, "shader_location": 2}))
  instance_attrs = [
    {"format": wgpu.VertexFormat.float32x4, "offset": 0, "shader_location": 3},
    {"format": wgpu.VertexFormat.float32x4, "offset": 4 * 4, "shader_location": 4},
    {"format": wgpu.VertexFormat.float32x4, "offset": 8 * 4, "shader_location": 5},
    {"format": wgpu.VertexFormat.float32x4, "offset": 12 * 4, "shader_location": 6},
  ]
  if not bool(shadow):
    instance_attrs.append({"format": wgpu.VertexFormat.float32x4, "offset": 16 * 4, "shader_location": 7})
  return [{"array_stride": 9 * 4, "step_mode": "vertex", "attributes": vertex_attrs}, {"array_stride": 20 * 4, "step_mode": "instance", "attributes": instance_attrs}]


def create_othello_pipeline(*, device, target_format, depth_format, camera_bind_group_layout, shadow_bind_group_layout, overlay: bool = False):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-othello.vert", code=_wgpu_glsl_source("othello.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-othello.frag", code=_wgpu_glsl_source("othello.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-othello-layout", bind_group_layouts=[camera_bind_group_layout, shadow_bind_group_layout])
  blend = {"color": {"src_factor": wgpu.BlendFactor.src_alpha, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}, "alpha": {"src_factor": wgpu.BlendFactor.one, "dst_factor": wgpu.BlendFactor.one_minus_src_alpha, "operation": wgpu.BlendOperation.add}}
  return device.create_render_pipeline(
    label="ludoxel-othello-overlay-pipeline" if bool(overlay) else "ludoxel-othello-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": _othello_vertex_buffers(wgpu=wgpu)},
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": not bool(overlay), "depth_compare": wgpu.CompareFunction.less_equal},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format, "blend": blend}]},
  )


def create_othello_shadow_pipeline(*, device, depth_format, camera_bind_group_layout, depth_bias: int = 0, depth_bias_slope_scale: float = 0.0):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-othello_shadow.vert", code=_wgpu_glsl_source("othello_shadow.vert"))
  layout = device.create_pipeline_layout(label="ludoxel-othello-shadow-layout", bind_group_layouts=[camera_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-othello-shadow-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": _othello_vertex_buffers(wgpu=wgpu, shadow=True)},
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less, "depth_bias": int(depth_bias), "depth_bias_slope_scale": float(depth_bias_slope_scale)},
  )


def create_transform_shadow_pipeline(*, device, depth_format, camera_bind_group_layout, depth_bias: int = 0, depth_bias_slope_scale: float = 0.0):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-transform-shadow.vert", code=_wgpu_glsl_source("player_model_shadow.vert"))
  layout = device.create_pipeline_layout(label="ludoxel-transform-shadow-layout", bind_group_layouts=[camera_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-transform-shadow-pipeline",
    layout=layout,
    vertex={
      "module": vertex_shader,
      "entry_point": "main",
      "buffers": [
        {"array_stride": 8 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}]},
        {
          "array_stride": 16 * 4,
          "step_mode": "instance",
          "attributes": [
            {"format": wgpu.VertexFormat.float32x4, "offset": 0, "shader_location": 3},
            {"format": wgpu.VertexFormat.float32x4, "offset": 4 * 4, "shader_location": 4},
            {"format": wgpu.VertexFormat.float32x4, "offset": 8 * 4, "shader_location": 5},
            {"format": wgpu.VertexFormat.float32x4, "offset": 12 * 4, "shader_location": 6},
          ],
        },
      ],
    },
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "cull_mode": wgpu.CullMode.none},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less, "depth_bias": int(depth_bias), "depth_bias_slope_scale": float(depth_bias_slope_scale)},
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
        {"array_stride": 8 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}, {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1}, {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2}]},
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
    primitive={"topology": wgpu.PrimitiveTopology.triangle_list, "front_face": wgpu.FrontFace.ccw, "cull_mode": wgpu.CullMode.back},
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less},
    fragment={"module": fragment_shader, "entry_point": "main", "targets": [{"format": target_format}]},
  )


def create_shadow_depth_pipeline(*, device, depth_format, camera_bind_group_layout, depth_bias: int = 0, depth_bias_slope_scale: float = 0.0):
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
        {"array_stride": 8 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}, {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1}, {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2}]},
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
    depth_stencil={"format": depth_format, "depth_write_enabled": True, "depth_compare": wgpu.CompareFunction.less, "depth_bias": int(depth_bias), "depth_bias_slope_scale": float(depth_bias_slope_scale)},
  )


def create_selection_pipeline(*, device, target_format, depth_format, camera_bind_group_layout):
  import wgpu

  vertex_shader = device.create_shader_module(label="ludoxel-selection.vert", code=_wgpu_glsl_source("selection_line.vert"))
  fragment_shader = device.create_shader_module(label="ludoxel-selection.frag", code=_wgpu_glsl_source("selection_line.frag"))
  layout = device.create_pipeline_layout(label="ludoxel-selection-layout", bind_group_layouts=[camera_bind_group_layout])
  return device.create_render_pipeline(
    label="ludoxel-selection-pipeline",
    layout=layout,
    vertex={"module": vertex_shader, "entry_point": "main", "buffers": [{"array_stride": 3 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}]}]},
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
        {"array_stride": 8 * 4, "step_mode": "vertex", "attributes": [{"format": wgpu.VertexFormat.float32x3, "offset": 0, "shader_location": 0}, {"format": wgpu.VertexFormat.float32x3, "offset": 3 * 4, "shader_location": 1}, {"format": wgpu.VertexFormat.float32x2, "offset": 6 * 4, "shader_location": 2}]},
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
