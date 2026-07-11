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

const float LDX_CLOUD_HASH_SCALE = 0.1031;
const float LDX_CLOUD_HASH_OFFSET = 33.33;
const int LDX_CLOUD_FBM_OCTAVE_COUNT = 4;
const float LDX_CLOUD_FBM_LACUNARITY = 2.02;
const float LDX_CLOUD_GRID_DIM_STRIDE = 8.0;
const float LDX_CLOUD_OCCUPANCY_THRESHOLD = 0.5;
const float LDX_CLOUD_DISTANCE_SENTINEL = 65535.0;
const float LDX_CLOUD_DISTANCE_SENTINEL_THRESHOLD = 64000.0;
const float LDX_CLOUD_PROXY_PAD_FACTOR = 0.72;
const int LDX_CLOUD_FOOTPRINT_SCAN_CELLS = 5;
const float LDX_CLOUD_MIN_FEATHER_BLOCKS = 3.5;
const float LDX_CLOUD_CELL_FEATHER_FACTOR = 0.18;
const int LDX_CLOUD_MAX_MARCH_STEPS = 48;
const float LDX_CLOUD_BASE_MARCH_STEPS = 16.0;
const float LDX_CLOUD_MIN_REF_STEP_BLOCKS = 2.0;
const float LDX_CLOUD_CELL_REF_STEP_FACTOR = 0.16;
const float LDX_CLOUD_DENSITY_SAMPLE_THRESHOLD = 0.002;
const float LDX_CLOUD_LIGHT_SAMPLE_OFFSET_BLOCKS = 3.5;
const float LDX_CLOUD_ALPHA_STOP_THRESHOLD = 0.985;
const float LDX_CLOUD_ALPHA_DISCARD_THRESHOLD = 0.01;
const float LDX_CLOUD_HEIGHT_DENOMINATOR_MIN = 0.001;
const float LDX_CLOUD_VERTICAL_LOWER_START = -1.0;
const float LDX_CLOUD_VERTICAL_LOWER_END = -0.55;
const float LDX_CLOUD_VERTICAL_UPPER_START = 0.32;
const float LDX_CLOUD_VERTICAL_UPPER_END = 1.0;
const float LDX_CLOUD_VERTICAL_MIDDLE_START = 0.72;
const float LDX_CLOUD_VERTICAL_MIDDLE_END = 1.04;
const float LDX_CLOUD_VERTICAL_MIDDLE_MIN_MIX = 0.72;
const float LDX_CLOUD_NOISE_WORLD_SCALE = 0.045;
const float LDX_CLOUD_NOISE_TIME_X_SPEED = 0.035;
const float LDX_CLOUD_NOISE_TIME_Y_SPEED = 0.018;
const float LDX_CLOUD_NOISE_TIME_Z_SPEED = 0.028;
const float LDX_CLOUD_DETAIL_NOISE_SCALE = 3.1;
const float LDX_CLOUD_NOISE_CENTER = 0.5;
const float LDX_CLOUD_LARGE_NOISE_EDGE_WEIGHT = 0.22;
const float LDX_CLOUD_DETAIL_NOISE_EDGE_WEIGHT = 0.10;
const float LDX_CLOUD_FEATHER_START = 0.08;
const float LDX_CLOUD_FEATHER_END = 0.96;
const float LDX_CLOUD_EROSION_START = 0.20;
const float LDX_CLOUD_EROSION_END = 0.88;
const float LDX_CLOUD_EROSION_LARGE_WEIGHT = 0.74;
const float LDX_CLOUD_EROSION_DETAIL_WEIGHT = 0.24;
const float LDX_CLOUD_EROSION_COVERAGE_WEIGHT = 0.20;
const float LDX_CLOUD_WISP_START = 0.30;
const float LDX_CLOUD_WISP_END = 0.88;
const float LDX_CLOUD_WISP_DETAIL_WEIGHT = 0.20;
const float LDX_CLOUD_RIM_THIN_START = 0.04;
const float LDX_CLOUD_RIM_THIN_END = 0.72;
const float LDX_CLOUD_WISP_DENSITY_BASE = 0.70;
const float LDX_CLOUD_WISP_DENSITY_WEIGHT = 0.42;
const float LDX_CLOUD_DETAIL_DENSITY_BASE = 0.82;
const float LDX_CLOUD_DETAIL_DENSITY_WEIGHT = 0.18;
const float LDX_CLOUD_LIGHT_BASE = 0.70;
const float LDX_CLOUD_LIGHT_SHADOW_WEIGHT = 1.45;
const float LDX_CLOUD_LIGHT_FACING_WEIGHT = 0.10;
const float LDX_CLOUD_LIGHT_MIN = 0.42;
const float LDX_CLOUD_LIGHT_MAX = 1.28;
const float LDX_CLOUD_STEP_DENSITY_ALPHA = 0.56;
const float LDX_CLOUD_STEP_ALPHA_MAX = 0.98;
const float LDX_CLOUD_BRIGHTNESS_ACC_MIN = 0.001;
const float LDX_CLOUD_COLOR_BRIGHTNESS_MIN = 0.45;
const float LDX_CLOUD_COLOR_BRIGHTNESS_MAX = 1.15;
const vec3 LDX_CLOUD_WARM_HIGHLIGHT_TINT = vec3(1.04, 0.99, 0.90);
const float LDX_CLOUD_WARM_HIGHLIGHT_START = 0.70;
const float LDX_CLOUD_WARM_HIGHLIGHT_FACTOR = 0.35;

float ldx_hash13(vec3 p) {
    p = fract(p * LDX_CLOUD_HASH_SCALE);
    p += dot(p, p.yzx + LDX_CLOUD_HASH_OFFSET);
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
    for (int i = 0; i < LDX_CLOUD_FBM_OCTAVE_COUNT; i++) {
        sum += amp * ldx_vnoise(p);
        p = p * LDX_CLOUD_FBM_LACUNARITY + vec3(11.3, 17.1, 5.7);
        amp *= 0.5;
    }
    return sum;
}

float ldx_cloud_grid_w() {
    return mod(v_dims, LDX_CLOUD_GRID_DIM_STRIDE);
}

float ldx_cloud_grid_d() {
    return floor(v_dims / LDX_CLOUD_GRID_DIM_STRIDE);
}

float ldx_cloud_occupied(float ci, float cj, float gw, float gd) {
    if (ci < 0.0 || ci >= gw || cj < 0.0 || cj >= gd) {
        return 0.0;
    }
    float idx = cj * gw + ci;
    return mod(floor(v_bitmask / exp2(idx)), 2.0);
}

float ldx_cloud_exterior_edge_distance(float ci, float cj, vec2 inCell, float gw, float gd) {
    float farDistance = LDX_CLOUD_DISTANCE_SENTINEL;
    float d = farDistance;
    if (ldx_cloud_occupied(ci - 1.0, cj, gw, gd) < LDX_CLOUD_OCCUPANCY_THRESHOLD) {
        d = min(d, inCell.x * u_cellSize);
    }
    if (ldx_cloud_occupied(ci + 1.0, cj, gw, gd) < LDX_CLOUD_OCCUPANCY_THRESHOLD) {
        d = min(d, (1.0 - inCell.x) * u_cellSize);
    }
    if (ldx_cloud_occupied(ci, cj - 1.0, gw, gd) < LDX_CLOUD_OCCUPANCY_THRESHOLD) {
        d = min(d, inCell.y * u_cellSize);
    }
    if (ldx_cloud_occupied(ci, cj + 1.0, gw, gd) < LDX_CLOUD_OCCUPANCY_THRESHOLD) {
        d = min(d, (1.0 - inCell.y) * u_cellSize);
    }
    return d;
}

float ldx_cloud_proxy_pad() {
    return max(u_cellSize, 1.0) * LDX_CLOUD_PROXY_PAD_FACTOR;
}

float ldx_cloud_nearest_occupied_distance(vec2 gridPos, float gw, float gd) {
    float nearest = LDX_CLOUD_DISTANCE_SENTINEL;
    for (int j = 0; j < LDX_CLOUD_FOOTPRINT_SCAN_CELLS; j++) {
        for (int i = 0; i < LDX_CLOUD_FOOTPRINT_SCAN_CELLS; i++) {
            float fi = float(i);
            float fj = float(j);
            if (fi >= gw || fj >= gd) {
                continue;
            }
            if (ldx_cloud_occupied(fi, fj, gw, gd) < LDX_CLOUD_OCCUPANCY_THRESHOLD) {
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
    if (gw < LDX_CLOUD_OCCUPANCY_THRESHOLD || gd < LDX_CLOUD_OCCUPANCY_THRESHOLD) {
        return 0.0;
    }

    vec3 rel = p - (v_center - v_halfSize);
    float fx = rel.x / u_cellSize;
    float fz = rel.z / u_cellSize;
    float ci = floor(fx);
    float cj = floor(fz);
    vec2 gridPos = vec2(fx, fz);
    float signedDistance = 0.0;
    if (ldx_cloud_occupied(ci, cj, gw, gd) > LDX_CLOUD_OCCUPANCY_THRESHOLD) {
        vec2 inCell = vec2(fract(fx), fract(fz));
        float exteriorDistance = ldx_cloud_exterior_edge_distance(ci, cj, inCell, gw, gd);
        signedDistance = exteriorDistance > LDX_CLOUD_DISTANCE_SENTINEL_THRESHOLD ? ldx_cloud_proxy_pad() : exteriorDistance;
    } else {
        float nearest = ldx_cloud_nearest_occupied_distance(gridPos, gw, gd);
        if (nearest > LDX_CLOUD_DISTANCE_SENTINEL_THRESHOLD) {
            return 0.0;
        }
        signedDistance = -nearest;
    }

    return smoothstep(-ldx_cloud_proxy_pad(), max(LDX_CLOUD_MIN_FEATHER_BLOCKS, u_cellSize * LDX_CLOUD_CELL_FEATHER_FACTOR), signedDistance);
}

float ldx_cloud_density(vec3 p) {
    float coverage = ldx_cloud_coverage(p);
    if (coverage <= 0.0) {
        return 0.0;
    }

    float qy = (p.y - v_center.y) / max(v_halfSize.y, LDX_CLOUD_HEIGHT_DENOMINATOR_MIN);
    float lower = smoothstep(LDX_CLOUD_VERTICAL_LOWER_START, LDX_CLOUD_VERTICAL_LOWER_END, qy);
    float upper = 1.0 - smoothstep(LDX_CLOUD_VERTICAL_UPPER_START, LDX_CLOUD_VERTICAL_UPPER_END, qy);
    float middle = 1.0 - smoothstep(LDX_CLOUD_VERTICAL_MIDDLE_START, LDX_CLOUD_VERTICAL_MIDDLE_END, abs(qy));
    float vertical = clamp(lower * upper * mix(LDX_CLOUD_VERTICAL_MIDDLE_MIN_MIX, 1.0, middle), 0.0, 1.0);

    vec3 np = p * LDX_CLOUD_NOISE_WORLD_SCALE + vec3(u_time * LDX_CLOUD_NOISE_TIME_X_SPEED, u_time * LDX_CLOUD_NOISE_TIME_Y_SPEED, u_time * LDX_CLOUD_NOISE_TIME_Z_SPEED) + v_seed;
    float large = ldx_fbm(np);
    float detail = ldx_vnoise(np * LDX_CLOUD_DETAIL_NOISE_SCALE + vec3(17.0, 9.0, 23.0));
    float edgeNoise = (large - LDX_CLOUD_NOISE_CENTER) * LDX_CLOUD_LARGE_NOISE_EDGE_WEIGHT + (detail - LDX_CLOUD_NOISE_CENTER) * LDX_CLOUD_DETAIL_NOISE_EDGE_WEIGHT;
    float feather = smoothstep(LDX_CLOUD_FEATHER_START, LDX_CLOUD_FEATHER_END, coverage + edgeNoise);
    float base = feather * vertical;
    if (base <= 0.0) {
        return 0.0;
    }

    float eroded = smoothstep(LDX_CLOUD_EROSION_START, LDX_CLOUD_EROSION_END, large * LDX_CLOUD_EROSION_LARGE_WEIGHT + detail * LDX_CLOUD_EROSION_DETAIL_WEIGHT + coverage * LDX_CLOUD_EROSION_COVERAGE_WEIGHT);
    float wisps = smoothstep(LDX_CLOUD_WISP_START, LDX_CLOUD_WISP_END, large + (detail - LDX_CLOUD_NOISE_CENTER) * LDX_CLOUD_WISP_DETAIL_WEIGHT);
    float rimThin = smoothstep(LDX_CLOUD_RIM_THIN_START, LDX_CLOUD_RIM_THIN_END, coverage);
    float density = base * eroded * rimThin * (LDX_CLOUD_WISP_DENSITY_BASE + LDX_CLOUD_WISP_DENSITY_WEIGHT * wisps) * (LDX_CLOUD_DETAIL_DENSITY_BASE + LDX_CLOUD_DETAIL_DENSITY_WEIGHT * detail);
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

    float refStep = max(u_cellSize * LDX_CLOUD_CELL_REF_STEP_FACTOR, LDX_CLOUD_MIN_REF_STEP_BLOCKS);
    int steps = int(clamp(ceil((t1 - t0) / refStep), LDX_CLOUD_BASE_MARCH_STEPS, float(LDX_CLOUD_MAX_MARCH_STEPS)));
    float dt = (t1 - t0) / float(steps);
    float stepScale = LDX_CLOUD_BASE_MARCH_STEPS / float(steps);
    float t = t0 + dt * 0.5;
    float acc = 0.0;
    float bright = 0.0;
    for (int i = 0; i < LDX_CLOUD_MAX_MARCH_STEPS; i++) {
        if (i >= steps) {
            break;
        }
        vec3 p = ro + rd * t;
        float d = ldx_cloud_density(p);
        if (d > LDX_CLOUD_DENSITY_SAMPLE_THRESHOLD) {
            float ld = ldx_cloud_density(p + u_sunDir * LDX_CLOUD_LIGHT_SAMPLE_OFFSET_BLOCKS);
            float facing = max(dot(rd, u_sunDir), 0.0);
            float light = clamp(LDX_CLOUD_LIGHT_BASE + (d - ld) * LDX_CLOUD_LIGHT_SHADOW_WEIGHT + facing * LDX_CLOUD_LIGHT_FACING_WEIGHT, LDX_CLOUD_LIGHT_MIN, LDX_CLOUD_LIGHT_MAX);
            float da = 1.0 - pow(1.0 - clamp(d * LDX_CLOUD_STEP_DENSITY_ALPHA, 0.0, LDX_CLOUD_STEP_ALPHA_MAX), stepScale);
            acc += (1.0 - acc) * da;
            bright += (1.0 - bright) * da * light;
        }
        t += dt;
        if (acc > LDX_CLOUD_ALPHA_STOP_THRESHOLD) {
            break;
        }
    }
    if (acc < LDX_CLOUD_ALPHA_DISCARD_THRESHOLD) {
        discard;
    }

    float fog = ldx_cloud_fog_factor(v_worldPos, u_fogCamXZ, u_fogStart, u_fogEnd);
    float a = clamp(acc * u_alpha * v_alphaMul, 0.0, 1.0) * (1.0 - fog);
    vec3 col = u_color * clamp(bright / max(acc, LDX_CLOUD_BRIGHTNESS_ACC_MIN), LDX_CLOUD_COLOR_BRIGHTNESS_MIN, LDX_CLOUD_COLOR_BRIGHTNESS_MAX);
    col = mix(col, col * LDX_CLOUD_WARM_HIGHLIGHT_TINT, clamp(bright / max(acc, LDX_CLOUD_BRIGHTNESS_ACC_MIN) - LDX_CLOUD_WARM_HIGHLIGHT_START, 0.0, 1.0) * LDX_CLOUD_WARM_HIGHLIGHT_FACTOR);
    fragColor = vec4(col, a);
}
