// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

in vec2 v_uv;
in vec4 v_uvRect;

uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
    vec2 uv = mix(v_uvRect.xy, v_uvRect.zw, v_uv);
    vec4 tex = texture(u_texture, uv);
    if (tex.a < 0.01) {
        discard;
    }
    fragColor = tex;
}
