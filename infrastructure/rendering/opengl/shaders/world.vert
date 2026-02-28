// FILE: infrastructure/rendering/opengl/shaders/world.vert
#version 330 core

// World vertex shader.
// The responsibility of this shader is to transform instanced voxel faces into clip space and provide
// the fragment shader with per-fragment normal, atlas UV mapping, and light-space position for shadowing.

// Per-face static meshes provide correct normals and base UVs, while per-instance data supplies only
// translation and atlas UV rectangle. This keeps the instance payload compact and reduces vertex ALU.
// v_lightPos is computed per-vertex in light clip space. Using the same worldPos for both camera and
// light transforms ensures shadow sampling remains spatially coherent with the rendered geometry.

layout(location = 0) in vec3 a_pos;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;

layout(location = 3) in vec3 i_offset;
layout(location = 4) in vec4 i_uvRect;
layout(location = 5) in float i_shade;

uniform mat4 u_viewProj;
uniform mat4 u_lightViewProj;

out vec3 v_normal;
out vec2 v_uv;
out vec4 v_uvRect;
out vec4 v_lightPos;
out float v_shade;

void main() {
    vec3 worldPos = a_pos + i_offset;
    gl_Position = u_viewProj * vec4(worldPos, 1.0);
    v_normal = a_normal;
    v_uv = a_uv;
    v_uvRect = i_uvRect;
    v_lightPos = u_lightViewProj * vec4(worldPos, 1.0);
    v_shade = i_shade;
}