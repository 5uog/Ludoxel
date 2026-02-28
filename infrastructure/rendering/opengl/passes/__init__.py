# FILE: infrastructure/rendering/opengl/passes/__init__.py
"""
passes define isolated rendering stages.
The responsibility of this package is to keep each pass' GL state boundary explicit and prevent state
coupling. Passes must not own heavyweight resource creation; they consume resources created elsewhere.
"""