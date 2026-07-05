// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

float ldx_geometry_fog_factor(vec3 worldPos, vec3 camPos, float fogStart, float fogEnd) {
    if (fogEnd <= fogStart) {
        return 0.0;
    }

    float d = length(worldPos - camPos);
    return clamp((d - fogStart) / max(fogEnd - fogStart, 1e-3), 0.0, 1.0);
}

vec3 ldx_apply_geometry_distance_fog(vec3 color, vec3 worldPos, vec3 camPos, float fogStart, float fogEnd, vec3 fogColor) {
    float f = ldx_geometry_fog_factor(worldPos, camPos, fogStart, fogEnd);
    return mix(color, fogColor, f);
}

float ldx_cloud_fog_factor(vec3 worldPos, vec2 camXZ, float fogStart, float fogEnd) {
    if (fogEnd <= fogStart) {
        return 0.0;
    }

    float d = length(worldPos.xz - camXZ);
    return clamp((d - fogStart) / max(fogEnd - fogStart, 1e-3), 0.0, 1.0);
}

// Sun-direction fog modulation. Distant geometry whose view ray runs toward the
// sun gains warm in-scattered light, so crepuscular shafts appear only where
// the scene is both far enough to sit in the fog band and aligned with the sun.
// A near surface has no fog weight and a surface away from the sun has no
// alignment, so the term is driven by real scene depth and view direction.
vec3 ldx_apply_sun_shafts(vec3 color, vec3 worldPos, vec3 camPos, vec3 sunDir, float fogStart, float fogEnd) {
    float fogAmt = ldx_geometry_fog_factor(worldPos, camPos, fogStart, fogEnd);
    if (fogAmt <= 0.0) {
        return color;
    }

    vec3 viewVec = worldPos - camPos;
    vec3 viewDir = viewVec / max(length(viewVec), 1e-4);
    float sunAlign = max(dot(viewDir, normalize(sunDir)), 0.0);
    float shaft = pow(sunAlign, 6.0) * fogAmt;

    vec3 shaftColor = vec3(1.00, 0.86, 0.62);
    return color + shaftColor * shaft * 0.55;
}
