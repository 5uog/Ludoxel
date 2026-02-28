// FILE: infrastructure/rendering/opengl/shaders/cloudBox.frag
#version 330 core

// This shader implements a stylized translucent "volume hint" rather than physical volumetric 
// scattering. The responsibility of this fragment shader is to produce a stable, low-cost shading 
// signal for instanced boxes that reads as soft clouds under a directional light.

// The numeric choices here intentionally bias toward ambient lighting. A high ambient term reduces 
// the visibility of incorrect ordering artifacts that are unavoidable when drawing many translucent 
// boxes without sorting. The direct term is kept mild so that normals provide shape cues without 
// turning the cloud field into hard-lit geometry.

in vec3 v_normal;
in float v_alphaMul;

uniform vec3  u_color;
uniform float u_alpha;
uniform vec3  u_sunDir;

out vec4 fragColor;

void main() {
    vec3 n = normalize(v_normal);
    vec3 l = normalize(u_sunDir);

    float ndl = max(dot(n, l), 0.0);

    float ambient = 0.90;
    float lit = ambient + ndl * (1.0 - ambient) * 0.35;

    float a = clamp(u_alpha * v_alphaMul, 0.0, 1.0);
    fragColor = vec4(u_color * lit, a);
}