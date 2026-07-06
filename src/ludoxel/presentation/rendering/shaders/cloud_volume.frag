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
// ray through an expanded proxy box, masks density by the packed occupancy
// footprint, and feathers only the union boundary between occupied and
// empty space.

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

float ldx_cloud_grid_w() {
    return mod(v_dims, 8.0);
}

float ldx_cloud_grid_d() {
    return floor(v_dims / 8.0);
}

float ldx_cloud_occupied(float ci, float cj, float gw, float gd) {
    if (ci < 0.0 || ci >= gw || cj < 0.0 || cj >= gd) {
        return 0.0;
    }
    float idx = cj * gw + ci;
    return mod(floor(v_bitmask / exp2(idx)), 2.0);
}

float ldx_cloud_exterior_edge_distance(float ci, float cj, vec2 inCell, float gw, float gd) {
    float farDistance = 65535.0;
    float d = farDistance;
    if (ldx_cloud_occupied(ci - 1.0, cj, gw, gd) < 0.5) {
        d = min(d, inCell.x * u_cellSize);
    }
    if (ldx_cloud_occupied(ci + 1.0, cj, gw, gd) < 0.5) {
        d = min(d, (1.0 - inCell.x) * u_cellSize);
    }
    if (ldx_cloud_occupied(ci, cj - 1.0, gw, gd) < 0.5) {
        d = min(d, inCell.y * u_cellSize);
    }
    if (ldx_cloud_occupied(ci, cj + 1.0, gw, gd) < 0.5) {
        d = min(d, (1.0 - inCell.y) * u_cellSize);
    }
    return d;
}

float ldx_cloud_proxy_pad() {
    return max(u_cellSize, 1.0) * 0.72;
}

float ldx_cloud_nearest_occupied_distance(vec2 gridPos, float gw, float gd) {
    // The packed footprint spans at most five cells per axis (a three-cell
    // core plus one edge bump on each side), so the scan must cover indices
    // zero through four. The former four-by-four scan skipped the fifth
    // column or row, so an empty fragment beyond a five-wide footprint found
    // no occupied cell and lost its exterior feather, leaving that side of
    // the cloud a hard rectangular edge while narrower clouds stayed soft.
    float nearest = 65535.0;
    for (int j = 0; j < 5; j++) {
        for (int i = 0; i < 5; i++) {
            float fi = float(i);
            float fj = float(j);
            if (fi >= gw || fj >= gd) {
                continue;
            }
            if (ldx_cloud_occupied(fi, fj, gw, gd) < 0.5) {
                continue;
            }

            vec2 lo = vec2(fi, fj);
            vec2 hi = lo + vec2(1.0, 1.0);
            vec2 outside = max(max(lo - gridPos, gridPos - hi), vec2(0.0, 0.0));
            nearest = min(nearest, length(outside) * u_cellSize);
        }
    }
    return nearest;
}

float ldx_cloud_coverage(vec3 p) {
    float gw = ldx_cloud_grid_w();
    float gd = ldx_cloud_grid_d();
    if (gw < 0.5 || gd < 0.5) {
        return 0.0;
    }

    vec3 rel = p - (v_center - v_halfSize);
    float fx = rel.x / u_cellSize;
    float fz = rel.z / u_cellSize;
    float ci = floor(fx);
    float cj = floor(fz);
    vec2 gridPos = vec2(fx, fz);
    float signedDistance = 0.0;
    if (ldx_cloud_occupied(ci, cj, gw, gd) > 0.5) {
        vec2 inCell = vec2(fract(fx), fract(fz));
        float exteriorDistance = ldx_cloud_exterior_edge_distance(ci, cj, inCell, gw, gd);
        signedDistance = exteriorDistance > 64000.0 ? ldx_cloud_proxy_pad() : exteriorDistance;
    } else {
        float nearest = ldx_cloud_nearest_occupied_distance(gridPos, gw, gd);
        if (nearest > 64000.0) {
            return 0.0;
        }
        signedDistance = -nearest;
    }

    return smoothstep(-ldx_cloud_proxy_pad(), max(3.5, u_cellSize * 0.18), signedDistance);
}

float ldx_cloud_density(vec3 p) {
    float coverage = ldx_cloud_coverage(p);
    if (coverage <= 0.0) {
        return 0.0;
    }

    float qy = (p.y - v_center.y) / max(v_halfSize.y, 0.001);
    float lower = smoothstep(-1.0, -0.55, qy);
    float upper = 1.0 - smoothstep(0.32, 1.0, qy);
    float middle = 1.0 - smoothstep(0.72, 1.04, abs(qy));
    float vertical = clamp(lower * upper * mix(0.72, 1.0, middle), 0.0, 1.0);

    vec3 np = p * 0.045 + vec3(u_time * 0.035, u_time * 0.018, u_time * 0.028) + v_seed;
    float large = ldx_fbm(np);
    float detail = ldx_vnoise(np * 3.1 + vec3(17.0, 9.0, 23.0));
    float edgeNoise = (large - 0.5) * 0.22 + (detail - 0.5) * 0.10;
    float feather = smoothstep(0.08, 0.96, coverage + edgeNoise);
    float base = feather * vertical;
    if (base <= 0.0) {
        return 0.0;
    }

    float eroded = smoothstep(0.20, 0.88, large * 0.74 + detail * 0.24 + coverage * 0.20);
    float wisps = smoothstep(0.30, 0.88, large + (detail - 0.5) * 0.20);
    float rimThin = smoothstep(0.04, 0.72, coverage);
    float density = base * eroded * rimThin * (0.70 + 0.42 * wisps) * (0.82 + 0.18 * detail);
    return clamp(density, 0.0, 1.0);
}

void main() {
    vec3 ro = u_eyePos;
    vec3 rd = normalize(v_worldPos - u_eyePos);
    vec3 proxyPad = vec3(ldx_cloud_proxy_pad(), 0.0, ldx_cloud_proxy_pad());
    vec3 bmin = v_center - v_halfSize - proxyPad;
    vec3 bmax = v_center + v_halfSize + proxyPad;
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

    // A fixed sixteen-step march aliased the per-cell coverage and the
    // density noise into visible horizontal slabs on clouds whose view ray
    // crossed a long span of the proxy box: wide footprints and grazing
    // angles produced a large step, so a handful of samples painted the
    // cloud as stacked plates. The step count now scales with the traversed
    // span so the world-space step stays near refStep, and the per-step
    // absorption is raised to the power sixteen over steps so the opacity
    // accumulated across a uniform span equals the former sixteen-step
    // result exactly. A cloud already resolved at sixteen steps keeps
    // steps == 16 and stepScale == 1.0 and renders identically.
    const int MAX_STEPS = 48;
    float refStep = max(u_cellSize * 0.16, 2.0);
    int steps = int(clamp(ceil((t1 - t0) / refStep), 16.0, float(MAX_STEPS)));
    float dt = (t1 - t0) / float(steps);
    float stepScale = 16.0 / float(steps);
    float t = t0 + dt * 0.5;
    float acc = 0.0;
    float bright = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= steps) {
            break;
        }
        vec3 p = ro + rd * t;
        float d = ldx_cloud_density(p);
        if (d > 0.002) {
            float ld = ldx_cloud_density(p + u_sunDir * 3.5);
            float facing = max(dot(rd, u_sunDir), 0.0);
            float light = clamp(0.70 + (d - ld) * 1.45 + facing * 0.10, 0.42, 1.28);
            float da = 1.0 - pow(1.0 - clamp(d * 0.56, 0.0, 0.98), stepScale);
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
    col = mix(col, col * vec3(1.04, 0.99, 0.90), clamp(bright / max(acc, 0.001) - 0.70, 0.0, 1.0) * 0.35);
    fragColor = vec4(col, a);
}
