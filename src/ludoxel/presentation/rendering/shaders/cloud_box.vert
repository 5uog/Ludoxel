// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

layout(location = 0) in vec3 a_pos;
layout(location = 1) in vec3 a_normal;
layout(location = 3) in vec3 i_offset; // cell centre (pattern space)
layout(location = 4) in vec4 i_data;   // x,y,z = cell size (cellW, thickness, cellD), w = alphaMul
layout(location = 5) in float i_speedMultiplier;
layout(location = 6) in vec3 i_turb;   // x = sway amplitude (blocks), y = angular frequency (rad/s), z = phase

uniform mat4 u_viewProj;
uniform vec3 u_shift; // smooth translation (world space)
uniform float u_time;
uniform vec2 u_flowDirXZ;

out vec3 v_normal;
out float v_alphaMul;
out vec3 v_worldPos;

void main() {
    vec3 scale = max(i_data.xyz, vec3(0.0001));
    vec3 worldPos = (a_pos * scale) + i_offset + u_shift * i_speedMultiplier;

    float sway = i_turb.x * sin(i_turb.y * u_time + i_turb.z);
    worldPos.xz += u_flowDirXZ * sway;

    gl_Position = u_viewProj * vec4(worldPos, 1.0);
    v_normal = a_normal;
    v_alphaMul = i_data.w;
    v_worldPos = worldPos;
}
