// FILE: infrastructure/rendering/opengl/shaders/shadow.frag
#version 330 core

// Depth-only shadow caster fragment shader.
// The responsibility of this stage is to participate in depth rasterization while emitting no color.
// Color writes are disabled on the FBO, so an empty main is both correct and optimal.

void main() { }