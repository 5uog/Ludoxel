// FILE: infrastructure/rendering/opengl/shaders/cloudBox.vert
#version 330 core

// This vertex shader transforms a static unit cube mesh into many translucent boxes via instancing.
// The responsibility of this shader is to apply per-instance scaling and translation with minimal ALU,
// keeping the fragment stage as the primary cost driver.

// The attribute layout is intentionally aligned with MeshBuffer.create_cube_instanced() so the VAO 
// can be reused across passes. i_data is interpreted here as (scale.xyz, alphaMul) because clouds 
// require size variation and density modulation but do not require per-instance UV rectangles.

layout(location = 0) in vec3 a_pos;
layout(location = 1) in vec3 a_normal;

// Instance layout matches MeshBuffer:
// loc=3: i_offset(vec3)
// loc=4: i_uvRect(vec4) -> reused as i_data

layout(location = 3) in vec3 i_offset; // box center (pattern space)
layout(location = 4) in vec4 i_data;   // x,y,z = scale (box size), w = alphaMul

uniform mat4 u_viewProj;
uniform vec3 u_shift; // smooth translation (world space)

out vec3 v_normal;
out float v_alphaMul;

void main() {
    vec3 scale = i_data.xyz;
    vec3 worldPos = (a_pos * scale) + i_offset + u_shift;
    gl_Position = u_viewProj * vec4(worldPos, 1.0);

    v_normal = a_normal;
    v_alphaMul = i_data.w;
}