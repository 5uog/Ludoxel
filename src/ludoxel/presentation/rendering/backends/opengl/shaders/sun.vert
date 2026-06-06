// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

uniform mat4 u_viewProj;
uniform vec3 u_center;
uniform vec3 u_u;
uniform vec3 u_v;
uniform float u_halfSize;

out vec2 v_uv;

#ifdef LUDOXEL_VULKAN
#define LUDOXEL_VERTEX_INDEX gl_VertexIndex
#else
#define LUDOXEL_VERTEX_INDEX gl_VertexID
#endif

vec2 corner(int id) {
    if (id == 0) return vec2(-1.0, -1.0);
    if (id == 1) return vec2( 1.0, -1.0);
    if (id == 2) return vec2( 1.0,  1.0);
    if (id == 3) return vec2(-1.0, -1.0);
    if (id == 4) return vec2( 1.0,  1.0);
    return vec2(-1.0,  1.0);
}

void main() {
    vec2 c = corner(int(LUDOXEL_VERTEX_INDEX));
    vec3 worldPos = u_center + u_u * (c.x * u_halfSize) + u_v * (c.y * u_halfSize);

    gl_Position = u_viewProj * vec4(worldPos, 1.0);
    v_uv = c * 0.5 + 0.5;
}
