// FILE: src/maiming/infrastructure/rendering/opengl/_internal/shaders/shadow.vert
#version 330 core

layout(location = 2) in vec2 a_uv;

layout(location = 3) in vec3 i_mn;
layout(location = 4) in vec3 i_mx;

uniform mat4 u_lightViewProj;
uniform int  u_face;

void main() {
    vec2 uv = a_uv;
    vec3 mn = i_mn;
    vec3 mx = i_mx;

    vec3 worldPos;

    if (u_face == 0) {
        worldPos = vec3(mx.x, mix(mn.y, mx.y, uv.y), mix(mn.z, mx.z, uv.x));
    } else if (u_face == 1) {
        worldPos = vec3(mn.x, mix(mn.y, mx.y, uv.y), mix(mx.z, mn.z, uv.x));
    } else if (u_face == 2) {
        worldPos = vec3(mix(mn.x, mx.x, uv.x), mx.y, mix(mn.z, mx.z, uv.y));
    } else if (u_face == 3) {
        worldPos = vec3(mix(mn.x, mx.x, uv.x), mn.y, mix(mx.z, mn.z, uv.y));
    } else if (u_face == 4) {
        worldPos = vec3(mix(mx.x, mn.x, uv.x), mix(mn.y, mx.y, uv.y), mx.z);
    } else {
        worldPos = vec3(mix(mn.x, mx.x, uv.x), mix(mn.y, mx.y, uv.y), mn.z);
    }

    gl_Position = u_lightViewProj * vec4(worldPos, 1.0);
}