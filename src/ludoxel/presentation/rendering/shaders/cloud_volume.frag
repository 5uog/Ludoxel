// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

in vec3 v_worldPos;
flat in vec3 v_center;
flat in vec3 v_halfSize;
flat in float v_seed;
flat in float v_alphaMul;
flat in float v_bitmask;
flat in float v_dims;

uniform vec3 u_color;
uniform float u_alpha;
uniform vec3 u_sunDir;
uniform vec3 u_eyePos;
uniform float u_time;
uniform float u_cellSize;
uniform vec2 u_fogCamXZ;
uniform float u_fogStart;
uniform float u_fogEnd;

out vec4 fragColor;

#include "common/distance_fog.glsl"

// A cloud is one translucent volume. The fragment stage marches the view
// ray through the cloud's bounding box and integrates a soft density from
// animated value-noise fbm, masked by the cloud's cell occupancy so the
// volume follows the cluster footprint rather than a plain oval. The noise
// domain scrolls with time, so the whole cloud keeps churning in place,
// which is what reads as the billowing motion; nothing has a hard
// silhouette and the accumulated alpha stays below one, so the cloud is
// see-through like water vapour.

float ldx_hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

float ldx_vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = ldx_hash13(i + vec3(0.0, 0.0, 0.0));
    float n100 = ldx_hash13(i + vec3(1.0, 0.0, 0.0));
    float n010 = ldx_hash13(i + vec3(0.0, 1.0, 0.0));
    float n110 = ldx_hash13(i + vec3(1.0, 1.0, 0.0));
    float n001 = ldx_hash13(i + vec3(0.0, 0.0, 1.0));
    float n101 = ldx_hash13(i + vec3(1.0, 0.0, 1.0));
    float n011 = ldx_hash13(i + vec3(0.0, 1.0, 1.0));
    float n111 = ldx_hash13(i + vec3(1.0, 1.0, 1.0));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
}

float ldx_fbm(vec3 p) {
    float amp = 0.5;
    float sum = 0.0;
    for (int i = 0; i < 4; i++) {
        sum += amp * ldx_vnoise(p);
        p = p * 2.02 + vec3(11.3, 17.1, 5.7);
        amp *= 0.5;
    }
    return sum;
}

// Soft cell-occupancy coverage: 1 deep inside an occupied cell, fading to 0
// across a one-block band at the footprint boundary so the mask is not a
// hard staircase.
float ldx_cloud_coverage(vec3 p) {
    float gw = mod(v_dims, 8.0);
    float gd = floor(v_dims / 8.0);
    if (gw < 0.5 || gd < 0.5) {
        return 0.0;
    }
    vec3 rel = p - (v_center - v_halfSize);
    float fx = rel.x / u_cellSize;
    float fz = rel.z / u_cellSize;
    float ci = floor(fx);
    float cj = floor(fz);
    if (ci < 0.0 || ci >= gw || cj < 0.0 || cj >= gd) {
        return 0.0;
    }
    float idx = cj * gw + ci;
    float bit = mod(floor(v_bitmask / exp2(idx)), 2.0);
    if (bit < 0.5) {
        return 0.0;
    }
    // Distance to the nearest cell-interior boundary, in cells, softened.
    vec2 inCell = vec2(fract(fx), fract(fz));
    vec2 edge = min(inCell, 1.0 - inCell) * u_cellSize; // blocks to cell edge
    float soft = clamp(min(edge.x, edge.y) / 3.0 + 0.35, 0.0, 1.0);
    return soft;
}

float ldx_cloud_density(vec3 p) {
    float coverage = ldx_cloud_coverage(p);
    if (coverage <= 0.0) {
        return 0.0;
    }
    float qy = (p.y - v_center.y) / max(v_halfSize.y, 0.001);
    float vert = 1.0 - smoothstep(0.1, 1.0, abs(qy));
    float base = coverage * vert;
    if (base <= 0.0) {
        return 0.0;
    }
    vec3 np = p * 0.06 + vec3(u_time * 0.05, u_time * 0.02, u_time * 0.035) + v_seed;
    float n = ldx_fbm(np);
    return clamp(smoothstep(0.28, 0.8, n * base + base * 0.4) * base, 0.0, 1.0);
}

void main() {
    vec3 ro = u_eyePos;
    vec3 rd = normalize(v_worldPos - u_eyePos);
    vec3 bmin = v_center - v_halfSize;
    vec3 bmax = v_center + v_halfSize;
    vec3 inv = 1.0 / rd;
    vec3 ta = (bmin - ro) * inv;
    vec3 tb = (bmax - ro) * inv;
    vec3 tmn = min(ta, tb);
    vec3 tmx = max(ta, tb);
    float t0 = max(max(tmn.x, tmn.y), tmn.z);
    float t1 = min(min(tmx.x, tmx.y), tmx.z);
    if (t1 <= max(t0, 0.0)) {
        discard;
    }
    t0 = max(t0, 0.0);

    const int STEPS = 16;
    float dt = (t1 - t0) / float(STEPS);
    float t = t0 + dt * 0.5;
    float acc = 0.0;
    float bright = 0.0;
    for (int i = 0; i < STEPS; i++) {
        vec3 p = ro + rd * t;
        float d = ldx_cloud_density(p);
        if (d > 0.002) {
            float ld = ldx_cloud_density(p + u_sunDir * 3.5);
            float light = clamp(0.72 + (d - ld) * 1.1, 0.45, 1.15);
            float da = d * 0.5;
            acc += (1.0 - acc) * da;
            bright += (1.0 - bright) * da * light;
        }
        t += dt;
        if (acc > 0.985) {
            break;
        }
    }
    if (acc < 0.01) {
        discard;
    }

    float fog = ldx_cloud_fog_factor(v_worldPos, u_fogCamXZ, u_fogStart, u_fogEnd);
    float a = clamp(acc * u_alpha * v_alphaMul, 0.0, 1.0) * (1.0 - fog);
    vec3 col = u_color * clamp(bright / max(acc, 0.001), 0.45, 1.15);
    fragColor = vec4(col, a);
}
