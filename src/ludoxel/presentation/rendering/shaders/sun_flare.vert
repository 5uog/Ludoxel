// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
#version 330 core

out vec2 v_ndc;

#ifdef LUDOXEL_VULKAN
#define LUDOXEL_VERTEX_INDEX gl_VertexIndex
#else
#define LUDOXEL_VERTEX_INDEX gl_VertexID
#endif

void main() {
    // Fullscreen triangle: vertices (-1,-1), (3,-1), (-1,3) cover the whole
    // clip rectangle. v_ndc carries the fragment's clip x/y so the fragment
    // stage can measure each pixel against the sun's screen position. Both
    // backends emit clip coordinates the same way in x and y, so the flare
    // geometry lands identically on OpenGL and WGPU.
    int id = int(LUDOXEL_VERTEX_INDEX);
    vec2 p = vec2(id == 1 ? 3.0 : -1.0, id == 2 ? 3.0 : -1.0);
    v_ndc = p;
    gl_Position = vec4(p, 0.0, 1.0);
}
