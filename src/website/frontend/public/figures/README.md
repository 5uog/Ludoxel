<!--
SPDX-FileCopyrightText: 2026 Kento Konishi
SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
-->

# Ludoxel Website Figure Sources

This directory contains the source-controlled figure-generation surface for the Ludoxel website. The `code/` directory contains Python sources that render documentation figures. The `photo/` and `videos/` directories contain selected website artifacts copied from those rendering runs. Manim cache output, temporary TeX files, intermediate movie fragments, and unselected render products are local generation material and stay outside the committed public asset tree.

The repository controls three separate contracts for this directory. `pyproject.toml` controls the Python version range and the `figures` extra used to install Manim. Each figure source controls its own temporary Manim output directory, selected final targets, and copy operation. The Git working tree controls overwrite safety because committed images and videos are ordinary tracked files after they have been copied into `photo/` or `videos/`.

## Dependency contract

Use a Python executable that satisfies the repository requirement declared in `pyproject.toml`. Depending on the shell and machine, that executable may be named `python`, `python3`, or `py`. The commands below use `<python>` as an executable placeholder; replace it with the interpreter that satisfies the repository requirement on the current system before running the command.

The repository-local virtual environment path is `.venv_ludoxel/`. The same path is used on macOS and Windows. The hyphenated form `.venv-ludoxel/` is outside the generated/local rule checked by the repository tools.

Manim is installed through the repository extra. The version literal belongs to `pyproject.toml`; this README invokes the declared extra. `pycairo`, `manimpango`, and `av` are installed in the same environment because the figure authoring surface uses Cairo-backed rendering, Pango-backed text shaping, and video encoding.

The editable project install writes metadata under `src/ludoxel.egg-info/`. On Windows, rerunning the editable install while that metadata path is locked or not writable can fail with `WinError 5` while updating `PKG-INFO`. That failure is a local filesystem state, not a missing Manim dependency. A successful existing install does not need to be repeated before every render.

## macOS environment

The macOS rendering environment has four executable surfaces: Homebrew native libraries, the repository virtual environment, the Manim-facing Python packages, and the TeX toolchain used by Manim for TeX-backed objects.

Homebrew supplies native libraries and discovery tools used when Python wheels are unavailable or when a package rebuilds locally. `cairo` and `pkg-config` serve the `pycairo` build path. `pango` and `pkg-config` serve the `manimpango` build path. `ffmpeg` supplies the external encoder path used when Manim writes video assets.

```bash
brew install cairo pango pkg-config ffmpeg
```

Create `.venv_ludoxel/` from an ordinary repository shell when the repository-local virtual environment is absent:

```bash
test -d .venv_ludoxel || <python> -m venv .venv_ludoxel
```

Activate the repository-local virtual environment:

```bash
source .venv_ludoxel/bin/activate
```

Install the figure-rendering package surface once, or rerun this command only when `pyproject.toml` or the figure dependency surface has changed:

```bash
python -m pip install --upgrade pip
python -m pip install -e ".[figures]" pycairo manimpango av
```

Verify the installed Python package surface before moving to TeX checks:

```bash
python -m pip show ludoxel manim pycairo manimpango av
python -m manim --version
```

Install a TeX distribution before rendering any figure source that instantiates `Tex`, `MathTex`, or another TeX-backed Manim object. MacTeX or a comparable TeX distribution supplies the `latex` and `dvisvgm` executable surface required by Manim's TeX conversion path.

Close and reopen the shell after installing the TeX distribution when the installer changes `PATH`. Then verify the executable surface from the activated `.venv_ludoxel/` environment:

```bash
latex --version
dvisvgm --version
python -m manim checkhealth
```

A TeX-capable macOS figure environment has crossed the rendering threshold only when `latex`, `dvisvgm`, and `python -m manim checkhealth` all resolve from the shell used for rendering.

## Windows environment

The Windows rendering environment has five executable surfaces: FFmpeg, MiKTeX, the repository virtual environment, the Manim-facing Python packages, and the process `PATH` that exposes MiKTeX executables to PowerShell.

FFmpeg supplies the external video encoder path. MiKTeX supplies the TeX toolchain used by Manim when a figure source creates `Tex`, `MathTex`, or another TeX-backed object. Package installation is the first threshold. Executable resolution is the controlling threshold: `latex.exe` and `dvisvgm.exe` must resolve in the same PowerShell process used for rendering.

Install FFmpeg and MiKTeX with the package manager or installer available on the machine:

```powershell
winget install Gyan.FFmpeg
winget install -e --id MiKTeX.MiKTeX
```

Create `.venv_ludoxel/` from an ordinary repository shell when the repository-local virtual environment is absent. Run the creation command outside an already activated `.venv_ludoxel/` session:

```powershell
if (-not (Test-Path ".\.venv_ludoxel")) {
  <python> -m venv .venv_ludoxel
}
```

Activate the repository-local virtual environment:

```powershell
.\.venv_ludoxel\Scripts\Activate.ps1
```

Install the figure-rendering package surface once, or rerun this command only when `pyproject.toml` or the figure dependency surface has changed:

```powershell
python -m pip install --upgrade pip
python -m pip install -e ".[figures]" pycairo manimpango av
```

Verify the installed Python package surface before moving to TeX checks:

```powershell
python -m pip show ludoxel manim pycairo manimpango av
python -m manim --version
```

If the editable install fails with `WinError 5` while writing `src\ludoxel.egg-info\PKG-INFO`, stop the install sequence and clear the local metadata lock before retrying. First close Python processes, terminals, editors, file explorers, and indexers that may be holding `src\ludoxel.egg-info`. Then remove the generated metadata directory from an ordinary repository shell and retry the editable install:

```powershell
deactivate 2>$null
Remove-Item -Recurse -Force .\src\ludoxel.egg-info
.\.venv_ludoxel\Scripts\Activate.ps1
python -m pip install -e ".[figures]" pycairo manimpango av
```

### Windows MiKTeX PATH bootstrap

Do not treat MiKTeX installation or User PATH persistence as proof that `latex.exe` and `dvisvgm.exe` are visible to the active PowerShell process. Windows Terminal can keep an older environment in its parent process, and new tabs or panes can inherit that older environment. A render session must therefore bootstrap the MiKTeX `bin\x64` path in the same PowerShell process that will execute Manim whenever `latex` or `dvisvgm` is unresolved.

Run this block after `.venv_ludoxel/` activation and before `python -m manim checkhealth`. The block discovers a real MiKTeX `bin\x64` directory, rejects an empty `$miktexBin`, prepends that directory to the current process `PATH`, and verifies the two TeX executables.

```powershell
$miktexBins = @(
  "$env:LOCALAPPDATA\Programs\MiKTeX\miktex\bin\x64",
  "$env:ProgramFiles\MiKTeX\miktex\bin\x64",
  "${env:ProgramFiles(x86)}\MiKTeX\miktex\bin\x64"
)

$miktexBin = $miktexBins | Where-Object {
  (Test-Path (Join-Path $_ "latex.exe")) -and
  (Test-Path (Join-Path $_ "dvisvgm.exe"))
} | Select-Object -First 1

if ([string]::IsNullOrWhiteSpace($miktexBin)) {
  throw "MiKTeX bin directory with latex.exe and dvisvgm.exe was not found."
}

$env:Path = "$miktexBin;$env:Path"

latex --version
dvisvgm --version
```

Persisting the discovered path is optional and does not replace the process bootstrap for the current render session. Store the path only after the process-level bootstrap has succeeded:

```powershell
if ([string]::IsNullOrWhiteSpace($miktexBin)) {
  throw '$miktexBin is empty. Run the MiKTeX discovery block before persisting PATH.'
}

if (-not (Test-Path (Join-Path $miktexBin "latex.exe"))) {
  throw "latex.exe was not found under $miktexBin"
}

if (-not (Test-Path (Join-Path $miktexBin "dvisvgm.exe"))) {
  throw "dvisvgm.exe was not found under $miktexBin"
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($userPath -notlike "*$miktexBin*") {
  [Environment]::SetEnvironmentVariable("Path", "$miktexBin;$userPath", "User")
}
```

A PowerShell process that is already open retains its existing process environment. A new tab or pane inside an already running Windows Terminal may inherit that retained environment. To test the persisted User PATH, close every Windows Terminal window, start a new terminal process from the shell launcher, activate `.venv_ludoxel/`, and run `latex --version`. If it still fails, run the process bootstrap in that render session and proceed; the process bootstrap is the authoritative path for the current render run.

Run the health check only after the Python package surface and the TeX executable surface both resolve in the same process:

```powershell
latex --version
dvisvgm --version
python -m manim checkhealth
```

A `No module named manim` result means the active interpreter is missing the figure-rendering Python packages. A `latex is available ... FAILED` result means the TeX executable surface is absent from the active process `PATH`. An `Unable to copy ... venvlauncher.exe` message means the virtual environment creation command was run against an existing or active `.venv_ludoxel/` directory; activate the existing environment and install packages inside it. A scene that reaches its first `Tex` or `MathTex` object while `latex` is unresolved fails when Manim tries to compile the generated `.tex` file.

## Output and overwrite contract

A repository figure source must keep Manim's working media directory outside the repository root. A script that relies on Manim's default `media/` directory from the project root creates local generation material in the wrong place. A conforming source wraps rendering in `tempconfig({"media_dir": str(temp_dir), ...})`, where `temp_dir` is a temporary directory created for that render run.

The current Debug HUD axis-crosshair source follows that media-directory rule. It computes `FIGURES_ROOT` from the script path, declares `PHOTO_OUTPUT` under `photo/`, declares `VIDEO_OUTPUT` under `videos/`, renders through a temporary Manim directory, and copies the selected output files into the public asset tree.

Before rendering, confirm that the committed figure asset tree has no unrelated local changes:

```bash
git status --short -- src/website/frontend/public/figures
git diff --exit-code -- src/website/frontend/public/figures/photo src/website/frontend/public/figures/videos
```

The current copy path replaces the declared target files with `shutil.copy2`. That operation is acceptable only when the render is intended to refresh those exact website artifacts. Keep a clean working tree before rendering, inspect the resulting diff after rendering, and commit only the intended media updates.

Run an existing repository figure source only after the environment checks and clean-tree checks have passed:

```bash
python src/website/frontend/public/figures/code/debug_hud_axis_crosshair.py
```

Successful execution prints the selected output paths written by the source script:

```text
wrote src/website/frontend/public/figures/photo/debug-hud-axis-crosshair-projection.png
wrote src/website/frontend/public/figures/videos/debug-hud-axis-crosshair-camera.mp4
```

A future figure source must declare its selected output paths, confine Manim's working directory to a temporary location, and document any intentional replacement of committed media. A source that cannot identify its selected final artifacts belongs outside this public figure surface until that output contract is added.

## Rendering contract

A figure source may generate a still image, a video, or both. The script is responsible for creating its temporary render directory, configuring Manim output state, rendering the scene, and copying selected output into `photo/` or `videos/`. Committed media in this directory is the selected website artifact produced by the corresponding source script. Temporary cache output remains outside the committed asset boundary.

A successful render updates only the committed public media that the source script explicitly copies into this directory. Generated Manim cache directories, intermediate TeX files, and temporary movie fragments remain local build material and stay outside the website asset contract.
