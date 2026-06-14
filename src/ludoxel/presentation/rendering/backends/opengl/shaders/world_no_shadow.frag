// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

in vec3 v_normal;
in vec2 v_uv;
in vec4 v_uvRect;

in float v_shade;
in float v_sel;
in vec3 v_worldPos;

uniform sampler2D u_atlas;
uniform vec3 u_sunDir;
uniform int u_selMode;
uniform float u_selTint;
uniform vec3 u_fogCamPos;
uniform float u_fogStart;
uniform float u_fogEnd;
uniform vec3 u_fogColor;

out vec4 fragColor;

#include "common/distance_fog.glsl"

float fallback_lighting(vec3 normal, float ndl, float shade) {
    float up = max(normal.y, 0.0);
    float down = max(-normal.y, 0.0);

    float sky_fill = 0.56 + 0.18 * up - 0.14 * down;
    float sun_fill = 0.26 * ndl;

    return clamp((sky_fill + sun_fill) * shade, 0.0, 1.0);
}

void main() {
    vec2 uv = mix(v_uvRect.xy, v_uvRect.zw, v_uv);
    vec4 tex = texture(u_atlas, uv);

    if (tex.a < 0.01) {
        discard;
    }

    vec3 n = v_normal;
    vec3 l = u_sunDir;

    float ndl = max(dot(n, l), 0.0);
    float shade = clamp(v_shade, 0.0, 1.0);
    float lit = fallback_lighting(n, ndl, shade);

    vec3 base = tex.rgb;

    if (u_selMode == 2 && v_sel > 0.5) {
        float t = clamp(u_selTint, 0.0, 1.0);
        base = mix(base, vec3(1.0), t);
    }

    vec3 shaded = ldx_apply_geometry_distance_fog(base * lit, v_worldPos, u_fogCamPos, u_fogStart, u_fogEnd, u_fogColor);
    fragColor = vec4(shaded, tex.a);
}
