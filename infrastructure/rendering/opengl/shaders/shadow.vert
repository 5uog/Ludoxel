// FILE: infrastructure/rendering/opengl/shaders/shadow.vert
#version 330 core

// Shadow caster vertex shader for a directional light. The responsibility of this shader is to 
// transform a unit cube mesh into light clip space using a single instanced translation attribute. 
// Keeping the payload minimal reduces bandwidth and improves determinism of the shadow map. 

// A unit cube centered at origin matches MeshBuffer's cube convention, and i_offset is the world-space 
// center translation. This aligns shadow caster geometry with the world's instanced cube placement.

layout(location = 0) in vec3 a_pos;
layout(location = 3) in vec3 i_offset;

uniform mat4 u_lightViewProj;

void main() {
    vec3 worldPos = a_pos + i_offset;
    gl_Position = u_lightViewProj * vec4(worldPos, 1.0);
}