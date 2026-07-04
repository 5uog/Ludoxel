// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

in vec2 v_uv;

uniform float u_ultra;

out vec4 fragColor;

vec4 ldx_simple_sun(vec2 uv) {
    float border = 0.08;

    float inX = step(border, uv.x) * step(uv.x, 1.0 - border);
    float inY = step(border, uv.y) * step(uv.y, 1.0 - border);
    float inner = inX * inY;

    float core = 1.0;
    float edge = clamp(core - inner, 0.0, 1.0);

    vec3 coreCol = vec3(1.00, 0.96, 0.78);
    vec3 edgeCol = vec3(1.00, 0.88, 0.55);

    float cx = abs(uv.x - 0.5) * 2.0;
    float cy = abs(uv.y - 0.5) * 2.0;
    float t = max(cx, cy);
    float center = 1.0 - smoothstep(0.0, 1.0, t);

    vec3 col = mix(coreCol, edgeCol, edge * 0.75);
    col += vec3(1.0, 0.9, 0.6) * (center * 0.06);

    return vec4(col, 1.0);
}

vec4 ldx_ultra_sun(vec2 uv) {
    vec2 p = uv * 2.0 - 1.0;
    float r = length(p);

    float disc = 1.0 - smoothstep(0.40, 0.46, r);
    float core = 1.0 - smoothstep(0.00, 0.28, r);
    float rim = smoothstep(0.30, 0.46, r) * (1.0 - smoothstep(0.46, 0.56, r));
    float halo = (1.0 - smoothstep(0.42, 1.02, r)) * 0.58;
    float farHalo = (1.0 - smoothstep(0.76, 1.34, r)) * 0.16;

    float alpha = clamp(disc + halo * 0.46 + farHalo, 0.0, 1.0);
    vec3 discCol = mix(vec3(1.00, 0.86, 0.30), vec3(1.00, 0.99, 0.82), core);
    vec3 haloCol = vec3(1.00, 0.68, 0.16);
    vec3 col = haloCol * (halo + farHalo * 0.65);
    col += discCol * (1.24 * disc + 0.32 * core);
    col += vec3(1.00, 0.92, 0.54) * rim * 0.22;

    return vec4(col, alpha);
}

void main() {
    if (u_ultra < 0.5) {
        fragColor = ldx_simple_sun(v_uv);
        return;
    }

    vec4 sun = ldx_ultra_sun(v_uv);
    if (sun.a < 0.01) {
        discard;
    }
    fragColor = sun;
}
