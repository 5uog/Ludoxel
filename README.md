# Ludoxel v3.6

Ludoxel is a PyQt6 desktop application for a persistent voxel sandbox, first-person and third-person interaction, a second persistent Othello play space, and platform-specific desktop renderers.

## Development workflow

Use the commands below for local source-tree setup and application launch. Python source uses 2-space indentation.

### Windows

```powershell
python -m venv .venv_ludoxel
.\.venv_ludoxel\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
python -m pip install -e .
python -m ludoxel
```

### macOS

```bash
python3.14 -m venv .venv_ludoxel
source .venv_ludoxel/bin/activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install -e .
python -m ludoxel
```

If `python3.14` is not installed on macOS, use `python3.13` for the virtual environment command. The declared package range is Python `>=3.13,<3.15`.

Install development extras when local packaging, native extension rebuilding, or the repository check surface is needed.

```bash
python -m pip install -e ".[dev]"
npm install
```

## Repository command surface

Development support is entered through `package.json` and `tools/`. There is no supported root-level `scripts/` directory.

```bash
npm run help
npm run check
npm run ci
npm run format
npm run format:check
npm run format:py
npm run format:py:check
npm run lint
npm run lint:js
npm run lint:css
npm run lint:py
npm run tools:export
npm run tools:test
npm run package:check
npm run docs:check
npm run license:check
npm run resources:check
npm run shader:check
npm run build:native
npm run build:native:check
npm run build:windows
npm run build:macos
npm run build:macos:check
npm run clean
npm run clean:check
npm run assets:audio:check
npm run assets:audio:convert
```

The active tool directories are:

```text
tools/help_commands
tools/check_project
tools/build_native_extensions
tools/build_desktop_app
tools/clean_build_artifacts
tools/export_directory_markdown
tools/format_python_source
tools/format_web_source
tools/convert_audio_assets
```

`tools:export` is the repository directory-export entry point. `lint:py` and `format:py` enforce the Python source policy, while the web formatting and linting commands cover JavaScript, CSS, and related tool code.

## Build and check commands

Run the full local verification surface through:

```bash
npm run check
```

Use the targeted checks when only one repository concern changed:

```bash
npm run package:check
npm run docs:check
npm run license:check
npm run resources:check
npm run shader:check
```

Use the desktop build commands only for local bundle verification:

```bash
npm run build:windows
npm run build:macos
npm run build:macos:check
```

Use the native extension commands when the narrow arithmetic hot-path modules must be rebuilt or verified:

```bash
npm run build:native
npm run build:native:check
```

## License

Ludoxel Original Materials are governed by `LicenseRef-All-Rights-Reserved` under the Ludoxel Independent License in `LICENSE`.

This repository is not open source and is not licensed under Apache-2.0, MIT, BSD, GPL, AGPL, LGPL, MPL, or any other open source license.

## Notice and third-party material

`NOTICE` records the relationship between Ludoxel Original Materials, third-party material, provenance-sensitive local assets, runtime user data, and distribution legal material.

Third-party license and notice texts are kept under `third-party/`. Third-party material remains subject to its own license terms and is not relicensed as Ludoxel Original Materials.

## Copyright

Copyright (c) 2026 Kento Konishi. All rights reserved.
