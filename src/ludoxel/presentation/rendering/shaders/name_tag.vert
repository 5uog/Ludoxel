// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

layout(location = 0) in vec3 a_pos;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;
layout(location = 3) in vec4 i_row0;
layout(location = 4) in vec4 i_row1;
layout(location = 5) in vec4 i_row2;
layout(location = 6) in vec4 i_row3;
layout(location = 7) in vec4 i_uvRect;

uniform mat4 u_viewProj;

out vec2 v_uv;
out vec4 v_uvRect;

vec4 mul_row_major(vec4 p) {
    return vec4(
        dot(i_row0, p),
        dot(i_row1, p),
        dot(i_row2, p),
        dot(i_row3, p)
    );
}

void main() {
    gl_Position = u_viewProj * mul_row_major(vec4(a_pos, 1.0));
    v_uv = a_uv;
    v_uvRect = i_uvRect;
}
