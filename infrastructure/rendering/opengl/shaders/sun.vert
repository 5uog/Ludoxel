// FILE: infrastructure/rendering/opengl/shaders/sun.vert
#version 330 core

// Sun billboard vertex shader.
// The responsibility of this shader is to synthesize a quad procedurally with gl_VertexID and place 
// it in world space as a billboard orthogonal to the view. Avoiding a VBO removes CPU-side geometry 
// setup and ensures the billboard is always exactly two triangles.
// The generated quad uses corners in [-1,+1] so that u_halfSize directly scales world-space extent.

uniform mat4 u_viewProj;
uniform vec3 u_center;
uniform vec3 u_u;
uniform vec3 u_v;
uniform float u_halfSize;

out vec2 v_uv;

vec2 corner(int id) {
    // Two triangles:
    // (0,1,2) and (3,4,5)
    if (id == 0) return vec2(-1.0, -1.0);
    if (id == 1) return vec2( 1.0, -1.0);
    if (id == 2) return vec2( 1.0,  1.0);
    if (id == 3) return vec2(-1.0, -1.0);
    if (id == 4) return vec2( 1.0,  1.0);
    return vec2(-1.0,  1.0);
}

void main() {
    vec2 c = corner(gl_VertexID);
    vec3 worldPos = u_center + u_u * (c.x * u_halfSize) + u_v * (c.y * u_halfSize);
    gl_Position = u_viewProj * vec4(worldPos, 1.0);
    v_uv = c * 0.5 + 0.5;
}