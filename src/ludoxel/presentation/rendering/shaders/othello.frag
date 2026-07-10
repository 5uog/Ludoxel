// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

uniform vec3 u_sunDir;

uniform sampler2DShadow u_shadowMap;

uniform int u_shadowEnabled;

uniform vec2 u_shadowTexel;

uniform float u_shadowDarkMul;
uniform float u_shadowBiasMin;
uniform float u_shadowBiasSlope;
uniform float u_shadowPcfRadius;
uniform float u_shadowUltra;

uniform int u_debugShadow;

uniform vec3 u_fogCamPos;
uniform float u_fogStart;
uniform float u_fogEnd;
uniform vec3 u_fogColor;

in vec3 v_normal;
in vec3 v_color;

in float v_alpha;

in vec4 v_lightPos;
in vec3 v_worldPos;
out vec4 fragColor;

#include "common/distance_fog.glsl"
#include "common/shadow_filtering.glsl"

float shadow_sample(vec3 uvz, float bias) {
    float z = uvz.z - bias;
    return texture(u_shadowMap, vec3(uvz.xy, z));
}

float shadow_pcf(vec3 uvz, float bias) {
    vec2 t = u_shadowTexel * max(u_shadowPcfRadius, 0.0);

    if (u_shadowUltra > 0.5) {
        float angle = ldx_shadow_ultra_angle(gl_FragCoord.xy);
        float sum = 0.0;
        for (int k = 0; k < LDX_SHADOW_ULTRA_TAP_COUNT; ++k) {
            vec2 offset = ldx_shadow_ultra_tap(k, angle) * t;
            sum += shadow_sample(vec3(uvz.xy + offset, uvz.z), bias);
        }
        return sum * (1.0 / float(LDX_SHADOW_ULTRA_TAP_COUNT));
    }

    float sum = 0.0;
    for (int j = -1; j <= 1; ++j) {
        for (int i = -1; i <= 1; ++i) {
            sum += shadow_sample(vec3(uvz.xy + vec2(float(i), float(j)) * t, uvz.z), bias);
        }
    }
    return sum * (1.0 / 9.0);
}

float shadow_factor(float ndl) {
    if (u_shadowEnabled == 0) {
        return 1.0;
    }

    vec3 ndc = v_lightPos.xyz / max(v_lightPos.w, 1e-6);
    vec3 uvz = ndc * 0.5 + 0.5;

    if (uvz.x < 0.0 || uvz.x > 1.0 || uvz.y < 0.0 || uvz.y > 1.0) return 1.0;
    if (uvz.z < 0.0 || uvz.z > 1.0) return 1.0;

    float tex = max(u_shadowTexel.x, u_shadowTexel.y);
    float bias = max(u_shadowBiasMin, u_shadowBiasSlope * (1.0 - ndl));

    bias += 0.35 * tex;
    float lit = shadow_pcf(uvz, bias);
    return mix(u_shadowDarkMul, 1.0, lit);
}

void main() {
    vec3 n = normalize(v_normal);
    vec3 light_dir = normalize(u_sunDir);

    float debug_lambert = max(abs(dot(n, light_dir)), 1e-3);
    float debug_sh = shadow_factor(debug_lambert);
    float lambert = max(dot(n, light_dir), 0.0);
    float sh = (lambert > 1e-6) ? shadow_factor(lambert) : 1.0;

    if (u_debugShadow != 0) {
        fragColor = vec4(debug_sh, debug_sh, debug_sh, v_alpha);
        return;
    }

    float ambient = 0.28;
    float lighting = ambient + ((1.0 - ambient) * lambert) * sh;
    vec3 shaded = ldx_apply_geometry_distance_fog(v_color * lighting, v_worldPos, u_fogCamPos, u_fogStart, u_fogEnd, u_fogColor);
    fragColor = vec4(shaded, v_alpha);
}
