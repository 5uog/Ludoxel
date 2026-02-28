# FILE: infrastructure/rendering/opengl/scene/__init__.py
"""
scene is the CPU-side instance generation layer for the renderer.
The responsibility of this package is to translate high-level world descriptions into deterministic,
GPU-ready instance payloads. It must not own GL object creation nor pass-level state; it is purely the
"what to draw" side of the pipeline.
"""