# FILE: infrastructure/rendering/opengl/pipeline/__init__.py
"""
pipeline hosts cross-pass math utilities.
The responsibility of this package is to isolate camera/light transform policy from GL draw submission
so that it can be tuned and reasoned about independently from pass wiring.
"""