// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

in vec3 v_normal;
in float v_alphaMul;
in vec3 v_worldPos;

uniform vec3 u_color;
uniform float u_alpha;
uniform vec3 u_sunDir;
uniform vec2 u_fogCamXZ;
uniform float u_fogStart;
uniform float u_fogEnd;

out vec4 fragColor;

#include "common/distance_fog.glsl"

void main() {
    vec3 n = v_normal;
    vec3 l = u_sunDir;

    float ndl = max(dot(n, l), 0.0);
    float ambient = 0.90;
    float lit = ambient + ndl * (1.0 - ambient) * 0.35;
    float fog = ldx_distance_fog_factor(v_worldPos, u_fogCamXZ, u_fogStart, u_fogEnd);
    float a = clamp(u_alpha * v_alphaMul, 0.0, 1.0) * (1.0 - fog);

    fragColor = vec4(u_color * lit, a);
}
