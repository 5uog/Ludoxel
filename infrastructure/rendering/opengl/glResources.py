# FILE: infrastructure/rendering/opengl/glResources.py
from __future__ import annotations

"""
GLResources centralizes GPU object creation and destruction under a valid OpenGL context. The primary
responsibility of this file is to make GL lifetime ownership explicit, which is essential because OpenGL
objects are context-bound and cannot be safely created or destroyed from arbitrary threads or times.

This module compiles shader programs from files to preserve debuggability during iteration. It also
constructs static meshes and a texture atlas once, then hands them to passes that treat them as immutable
resources. The result is a clean split: passes own rendering behavior and transient state, while this
module owns heavyweight GL objects with long lifetimes.
"""

from dataclasses import dataclass
from pathlib import Path

from OpenGL.GL import (
    glGenVertexArrays, glDeleteVertexArrays,
)

from .gl.shaderProgram import ShaderProgram
from .gl.meshBuffer import MeshBuffer
from .resources.textureAtlas import TextureAtlas

@dataclass
class GLResources:
    world_prog: ShaderProgram
    shadow_prog: ShaderProgram
    sun_prog: ShaderProgram
    cloud_prog: ShaderProgram

    world_meshes: list[MeshBuffer]
    cloud_mesh: MeshBuffer
    shadow_cube_mesh: MeshBuffer

    atlas: TextureAtlas
    empty_vao: int

    @staticmethod
    def load(assets_dir: Path) -> "GLResources":
        shader_dir = Path(__file__).resolve().parent / "shaders"

        # Compiling from files keeps shader sources visible to external tooling and makes iteration cheap.
        world_prog = ShaderProgram.from_files(shader_dir / "world.vert", shader_dir / "world.frag")
        shadow_prog = ShaderProgram.from_files(shader_dir / "shadow.vert", shader_dir / "shadow.frag")
        sun_prog = ShaderProgram.from_files(shader_dir / "sun.vert", shader_dir / "sun.frag")
        cloud_prog = ShaderProgram.from_files(shader_dir / "cloudBox.vert", shader_dir / "cloudBox.frag")

        # Face-specific world meshes are an intentional performance structure.
        # They avoid per-vertex branching for orientation and keep per-instance payload minimal.
        world_meshes = [MeshBuffer.create_quad_instanced(i) for i in range(6)]

        # cloud_mesh and shadow_cube_mesh share the same cube vertex layout for maximum reuse.
        cloud_mesh = MeshBuffer.create_cube_instanced()
        shadow_cube_mesh = MeshBuffer.create_cube_instanced()

        # The atlas packs all block textures into a single GL texture to minimize binds per frame.
        # The tile size is fixed to keep UV rectangles stable and predictable.
        atlas = TextureAtlas.build_from_dir(assets_dir / "blocks", tile_size=64)

        # Core profile requires a VAO even when the shader synthesizes geometry from gl_VertexID.
        empty_vao = int(glGenVertexArrays(1))

        return GLResources(
            world_prog=world_prog,
            shadow_prog=shadow_prog,
            sun_prog=sun_prog,
            cloud_prog=cloud_prog,
            world_meshes=world_meshes,
            cloud_mesh=cloud_mesh,
            shadow_cube_mesh=shadow_cube_mesh,
            atlas=atlas,
            empty_vao=empty_vao,
        )

    def destroy(self) -> None:
        # Destruction must be performed with a current GL context; otherwise GL deletes are undefined.
        for m in self.world_meshes:
            m.destroy()
        self.cloud_mesh.destroy()
        self.shadow_cube_mesh.destroy()

        self.atlas.destroy()

        self.world_prog.destroy()
        self.shadow_prog.destroy()
        self.sun_prog.destroy()
        self.cloud_prog.destroy()

        if int(self.empty_vao) != 0:
            glDeleteVertexArrays(1, [int(self.empty_vao)])
            self.empty_vao = 0