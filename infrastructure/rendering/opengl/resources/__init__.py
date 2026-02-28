# FILE: infrastructure/rendering/opengl/resources/__init__.py
"""
resources owns GPU asset construction utilities.
The responsibility of this package is to build textures and other long-lived GPU assets from disk
sources under an active GL context, keeping asset packing and lifetime distinct from rendering passes.
"""