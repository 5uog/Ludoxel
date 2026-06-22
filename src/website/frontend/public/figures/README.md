# Ludoxel documentation figures

This directory contains generated documentation figures used by the Ludoxel Website Docs.

Figure source code belongs under `code/`.
Generated videos belong under `videos/`.
Generated still images belong under `photo/`.

Figure generation uses the Python `figures` optional dependency group from the repository root `pyproject.toml`.

```bash
python -m pip install -e ".[figures]"
python src/website/frontend/public/figures/code/debug_hud_axis_crosshair.py
```

On macOS, Manim's Python dependencies may need native libraries and discovery tools before `pycairo` can build.
Python packaging cannot install those Homebrew packages through `pyproject.toml`.

```bash
brew install pkg-config cairo pango
```

If `pycairo` cannot find Cairo on Apple Silicon, expose Homebrew's pkg-config directories for the current shell.

```bash
export PKG_CONFIG_PATH="/opt/homebrew/lib/pkgconfig:/opt/homebrew/share/pkgconfig:$PKG_CONFIG_PATH"
python -m pip install -e ".[figures]"
```

Generated files are static Website assets.
The Website frontend does not depend on the npm package named `manim`, and `package.json` must not receive a Manim dependency for these figures.
