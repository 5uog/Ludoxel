// FILE: infrastructure/rendering/opengl/shaders/sun.frag
#version 330 core

// Stylized sun fragment shader.
// The responsibility of this shader is to render a crisp, resolution-independent square sun with a
// subtle inner border. The analytic shape avoids textures and ensures consistent results under scaling.

// The border width is a small fraction of UV space. 
// 0.08 is chosen to be visible but not dominant, producing a readable outline at typical screen 
// resolutions without aliasing-heavy thin lines.

in vec2 v_uv;
out vec4 fragColor;

void main() {
    // Minecraft-like square sun:
    // crisp with subtle inner border
    float border = 0.08;

    float inX = step(border, v_uv.x) * step(v_uv.x, 1.0 - border);
    float inY = step(border, v_uv.y) * step(v_uv.y, 1.0 - border);
    float inner = inX * inY;

    float core = 1.0;
    float edge = clamp(core - inner, 0.0, 1.0);

    vec3 coreCol = vec3(1.00, 0.96, 0.78);
    vec3 edgeCol = vec3(1.00, 0.88, 0.55);

    // Very mild center brightening
    float cx = abs(v_uv.x - 0.5) * 2.0;
    float cy = abs(v_uv.y - 0.5) * 2.0;
    float t = max(cx, cy);
    float center = 1.0 - smoothstep(0.0, 1.0, t);

    vec3 col = mix(coreCol, edgeCol, edge * 0.75);
    col += vec3(1.0, 0.9, 0.6) * (center * 0.06);

    fragColor = vec4(col, 1.0);
}