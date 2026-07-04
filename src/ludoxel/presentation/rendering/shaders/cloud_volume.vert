// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

layout(location = 0) in vec3 a_pos;
layout(location = 1) in vec3 a_normal;
layout(location = 3) in vec3 i_center; // cloud volume centre (pattern space)
layout(location = 4) in vec4 i_size;   // xyz = volume size, w = alphaMul
layout(location = 5) in float i_speed; // wind multiplier
layout(location = 6) in vec3 i_extra;  // x = noise seed, y = occupancy bitmask, z = gridW + gridD*8

uniform mat4 u_viewProj;
uniform vec3 u_shift; // wind translation (world space)

out vec3 v_worldPos;
flat out vec3 v_center;
flat out vec3 v_halfSize;
flat out float v_seed;
flat out float v_alphaMul;
flat out float v_bitmask;
flat out float v_dims;

void main() {
    vec3 center = i_center + u_shift * i_speed;
    vec3 worldPos = (a_pos * max(i_size.xyz, vec3(0.001))) + center;

    gl_Position = u_viewProj * vec4(worldPos, 1.0);
    v_worldPos = worldPos;
    v_center = center;
    v_halfSize = max(i_size.xyz, vec3(0.001)) * 0.5;
    v_seed = i_extra.x;
    v_alphaMul = i_size.w;
    v_bitmask = i_extra.y;
    v_dims = i_extra.z;
}
