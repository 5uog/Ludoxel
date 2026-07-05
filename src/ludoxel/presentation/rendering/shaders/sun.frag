// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

in vec2 v_uv;

uniform float u_ultra;
uniform float u_mode;
uniform float u_glare;

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

    // Every radial term decays to zero well inside the inscribed circle so the
    // square billboard never clips a lit texel along its straight edges.
    float disc = 1.0 - smoothstep(0.34, 0.40, r);
    float core = 1.0 - smoothstep(0.00, 0.22, r);
    float halo = 1.0 - smoothstep(0.36, 0.82, r);
    float farHalo = 1.0 - smoothstep(0.55, 0.98, r);

    // Force coverage to zero before the quad border in every direction, which
    // keeps the disc and its glow circular instead of leaving a box edge.
    float edgeMask = 1.0 - smoothstep(0.90, 1.00, r);

    // Coverage alone shapes the sun. The emitted color is not pre-attenuated by
    // the falloffs, so alpha blending over the sky never multiplies a dim value
    // twice and cannot leave a dark ring around the disc.
    float alpha = clamp(disc + halo * 0.42 + farHalo * 0.20, 0.0, 1.0) * edgeMask;

    vec3 coreCol = vec3(1.00, 0.99, 0.94);
    vec3 discCol = vec3(1.00, 0.92, 0.72);
    vec3 haloCol = vec3(1.00, 0.86, 0.66);
    vec3 col = mix(haloCol, discCol, disc);
    col = mix(col, coreCol, core);

    return vec4(col, alpha);
}

vec4 ldx_sun_glare(vec2 uv, float strength) {
    vec2 p = uv * 2.0 - 1.0;
    float r = length(p);

    // A broad veil across the billboard plus a tighter bloom toward the sun
    // center. The edge mask retires both before the border so the veil is a
    // radial haze, never a screen-space rectangle.
    float edgeMask = 1.0 - smoothstep(0.70, 1.00, r);
    float broad = (1.0 - smoothstep(0.0, 1.0, r)) * 0.35;
    float bloom = exp(-r * r * 5.0);
    float veil = clamp(strength * (broad + bloom) * edgeMask, 0.0, 0.85);

    return vec4(vec3(1.00, 0.98, 0.94), veil);
}

void main() {
    if (u_mode > 0.5) {
        vec4 glare = ldx_sun_glare(v_uv, u_glare);
        if (glare.a < 0.003) {
            discard;
        }
        fragColor = glare;
        return;
    }

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
