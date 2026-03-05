// FILE: src/maiming/infrastructure/rendering/opengl/_internal/shaders/cloud_box.vert
#version 150

in vec3 a_pos;
in vec3 a_normal;

in vec3 i_offset;
in vec4 i_data;

uniform mat4 u_viewProj;
uniform vec3 u_shift;

out vec3 v_normal;
out float v_alphaMul;

void main() {
    vec3 scale = i_data.xyz;
    vec3 worldPos = (a_pos * scale) + i_offset + u_shift;
    gl_Position = u_viewProj * vec4(worldPos, 1.0);

    v_normal = a_normal;
    v_alphaMul = i_data.w;
}