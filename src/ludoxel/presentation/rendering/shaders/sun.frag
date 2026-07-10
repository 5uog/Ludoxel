// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

in vec2 v_uv;

uniform float u_ultra;
uniform float u_mode;
uniform float u_glare;

out vec4 fragColor;

// Shared radial disc for both quality tiers. The lit photospheric disc fills
// most of the billboard, a near-white hot core sits at the centre, and a thin
// warm corona rings the disc. Every radial term decays to zero before the quad
// border so the disc and its glow stay circular and the square billboard never
// shows a straight lit edge or a corner frame. The colour is dominated by the
// black-body white of the core and disc; the warm tint stays confined to the
// faint corona, leaving the rest of the disc yellow- and orange-free.
vec4 ldx_sun_body(vec2 uv, float outerGlow) {
    vec2 p = uv * 2.0 - 1.0;
    float r = length(p);

    float disc = 1.0 - smoothstep(0.52, 0.60, r);
    float core = 1.0 - smoothstep(0.00, 0.42, r);
    float halo = 1.0 - smoothstep(0.56, 0.86, r);
    float farHalo = 1.0 - smoothstep(0.70, 1.00, r);
    float edgeMask = 1.0 - smoothstep(0.92, 1.00, r);

    // Coverage alone shapes the sun. The emitted colour is not pre-attenuated
    // by the falloffs, so alpha blending over the sky never multiplies a dim
    // value twice and cannot leave a dark ring around the disc.
    float alpha = clamp(disc + halo * 0.30 + farHalo * outerGlow, 0.0, 1.0) * edgeMask;

    vec3 coreCol = vec3(1.00, 0.99, 0.97);
    vec3 discCol = vec3(1.00, 0.97, 0.92);
    vec3 haloCol = vec3(1.00, 0.90, 0.80);
    vec3 col = mix(haloCol, discCol, disc);
    col = mix(col, coreCol, core);

    return vec4(col, alpha);
}

vec4 ldx_simple_sun(vec2 uv) {
    // Lower tiers omit the wide outer glare but keep the same circular disc,
    // white core, and thin corona so no tier draws a rectangular sun.
    return ldx_sun_body(uv, 0.08);
}

vec4 ldx_ultra_sun(vec2 uv) {
    return ldx_sun_body(uv, 0.16);
}

vec4 ldx_sun_glare(vec2 uv, float strength) {
    vec2 p = uv * 2.0 - 1.0;
    float r = length(p);

    // A broad veil across the billboard plus a tighter bloom toward the sun
    // centre. The edge mask retires both before the border so the veil is a
    // radial haze, never a screen-space rectangle. The weights and the clamp
    // keep the core bright while holding the full-screen washout well below a
    // white-out when looking straight into the light.
    float edgeMask = 1.0 - smoothstep(0.70, 1.00, r);
    float broad = (1.0 - smoothstep(0.0, 1.0, r)) * 0.20;
    float bloom = exp(-r * r * 5.0) * 0.75;
    float veil = clamp(strength * (broad + bloom) * edgeMask, 0.0, 0.55);

    return vec4(vec3(1.00, 0.985, 0.96), veil);
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
