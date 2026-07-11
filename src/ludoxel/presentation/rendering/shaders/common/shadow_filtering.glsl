// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

const int LDX_SHADOW_ULTRA_TAP_COUNT = 16;

const vec2 LDX_SHADOW_ULTRA_DISK[16] = vec2[](
    vec2(0.17677670, 0.00000000),
    vec2(-0.22577219, 0.20682582),
    vec2(0.03455805, -0.39377118),
    vec2(0.28457122, 0.37117276),
    vec2(-0.52222319, -0.09237393),
    vec2(0.49469539, -0.31468471),
    vec2(-0.16546593, 0.61552500),
    vec2(-0.31556147, -0.60759440),
    vec2(0.68464216, 0.25003022),
    vec2(-0.71225609, 0.29400896),
    vec2(0.34335450, -0.73372862),
    vec2(0.25373024, 0.80893199),
    vec2(-0.76474589, -0.44318588),
    vec2(0.89713398, -0.19723239),
    vec2(-0.54750690, 0.77877223),
    vec2(-0.12648677, -0.97608970)
);

float ldx_shadow_ultra_angle(vec2 fragCoord) {
    return fract(52.98291893 * fract(dot(fragCoord, vec2(0.06711056, 0.00583715)))) * 6.28318530718;
}

vec2 ldx_shadow_ultra_tap(int index, float angle) {
    vec2 v = LDX_SHADOW_ULTRA_DISK[index];
    float s = sin(angle);
    float c = cos(angle);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}
