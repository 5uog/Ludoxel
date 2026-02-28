# FILE: infrastructure/rendering/opengl/gl/__init__.py
"""
gl is the low-level OpenGL mechanics layer.
The responsibility of this package is to provide small, reusable building blocks that encapsulate GL
object lifetime and state management. Higher-level modules (passes, renderer orchestration, and scene
instance builders) must treat this layer as the only place that knows "how OpenGL works" in detail.
"""