// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

in vec2 v_ndc;

uniform vec2 u_sunNdc;
uniform float u_strength;
uniform float u_aspect;

out vec4 fragColor;

float ldx_flare_ghost(vec2 p, vec2 c, float radius) {
    // Aspect-corrected radial disc so ghosts stay circular on wide viewports.
    float d = length((p - c) * vec2(u_aspect, 1.0));
    return 1.0 - smoothstep(radius * 0.35, radius, d);
}

void main() {
    if (u_strength <= 0.003) {
        discard;
    }

    vec2 p = v_ndc;
    vec2 sun = u_sunNdc;

    vec3 warm = vec3(1.00, 0.93, 0.82);
    vec3 cool = vec3(0.82, 0.90, 1.00);

    float acc = 0.0;
    vec3 col = vec3(0.0);

    float g0 = ldx_flare_ghost(p, sun * (1.0 - 0.30), 0.050);
    col += warm * g0 * 0.35;
    acc += g0 * 0.35;
    float g1 = ldx_flare_ghost(p, sun * (1.0 - 0.55), 0.090);
    col += mix(warm, cool, 0.5) * g1 * 0.20;
    acc += g1 * 0.20;
    float g2 = ldx_flare_ghost(p, sun * (1.0 - 0.80), 0.035);
    col += warm * g2 * 0.28;
    acc += g2 * 0.28;
    float g3 = ldx_flare_ghost(p, sun * (1.0 - 1.15), 0.150);
    col += cool * g3 * 0.10;
    acc += g3 * 0.10;
    float g4 = ldx_flare_ghost(p, sun * (1.0 - 1.45), 0.060);
    col += warm * g4 * 0.18;
    acc += g4 * 0.18;
    float g5 = ldx_flare_ghost(p, sun * (1.0 - 1.90), 0.180);
    col += cool * g5 * 0.07;
    acc += g5 * 0.07;

    float rd = length((p - sun) * vec2(u_aspect, 1.0));
    float halo = exp(-pow((rd - 0.34) * 5.5, 2.0)) * 0.12;
    col += warm * halo;
    acc += halo;

    float a = clamp(acc, 0.0, 1.0) * u_strength;
    if (a <= 0.003) {
        discard;
    }

    vec3 tint = col / max(acc, 0.0001);
    fragColor = vec4(tint, a);
}
