// FILE: src/maiming/infrastructure/rendering/opengl/_internal/shaders/shadow.vert
#version 150

in vec3 a_pos;
in vec3 i_offset;
in vec4 i_data;

uniform mat4 u_lightViewProj;

void main() {
    vec3 scale = i_data.xyz;
    vec3 worldPos = (a_pos * scale) + i_offset;
    gl_Position = u_lightViewProj * vec4(worldPos, 1.0);
}