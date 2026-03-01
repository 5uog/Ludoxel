// FILE: infrastructure/rendering/opengl/shaders/shadow.vert
#version 330 core

layout(location = 0) in vec3 a_pos;
layout(location = 3) in vec3 i_offset;

uniform mat4 u_lightViewProj;

void main() {
    vec3 worldPos = a_pos + i_offset;
    gl_Position = u_lightViewProj * vec4(worldPos, 1.0);
}