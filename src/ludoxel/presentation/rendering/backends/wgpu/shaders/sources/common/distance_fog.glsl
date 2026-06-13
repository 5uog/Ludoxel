// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

float ldx_distance_fog_factor(vec3 worldPos, vec2 camXZ, float fogStart, float fogEnd) {
    if (fogEnd <= fogStart) {
        return 0.0;
    }

    float d = length(worldPos.xz - camXZ);
    return clamp((d - fogStart) / max(fogEnd - fogStart, 1e-3), 0.0, 1.0);
}

vec3 ldx_apply_distance_fog(vec3 color, vec3 worldPos, vec2 camXZ, float fogStart, float fogEnd, vec3 fogColor) {
    float f = ldx_distance_fog_factor(worldPos, camXZ, fogStart, fogEnd);
    return mix(color, fogColor, f);
}
