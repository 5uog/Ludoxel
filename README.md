# Ludoxel v3.6

Ludoxel is a PyQt6 desktop application for a persistent voxel sandbox,
first-person and third-person interaction, a persistent Othello play
space, and platform-specific desktop rendering.

Ludoxel is developed as a personal desktop software project by Kento
Konishi. The repository contains original source code and documentation,
third-party legal material, local assets whose rights status must be
reviewed separately, Python packaging metadata, Node-based repository
tooling, and desktop distribution support.

The current source tree is organized under `src/ludoxel/` as four
principal layers: `foundations`, `application`, `simulation`, and
`presentation`.

The `foundations` layer provides low-level identity, path, diagnostic,
numeric, geometry, voxel, matrix, frustum, and chunk contracts. The
`application` layer connects bootstrap, preferences, persistence,
session construction, runtime state, save scheduling, and application
orchestration. The `simulation` layer owns world state, block
definitions, block models, actors, movement, collision, gravity,
picking, placement, interaction, inventories, My World, and Othello
domain logic. The `presentation` layer owns the desktop interface,
input adapters, viewport lifecycle, HUD, overlays, settings surfaces,
audio playback, renderer contracts, OpenGL rendering, and wgpu
rendering.

The repository also contains local assets under `assets/`, third-party
legal records under `third-party/`, Python package metadata in
`pyproject.toml`, source-distribution inclusion rules in `MANIFEST.in`,
Node-based tools under `tools/`, and distribution legal material at the
repository root.

## Execution

Use a project-local Python environment. The application entry point is
the installed `ludoxel` command or the module entry point below.

```bash
python -m ludoxel
```

Repository validation is driven by npm scripts. The aggregate check runs
formatting, linting, tool tests, package checks, documentation checks,
license checks, resource checks, and shader checks according to the
current `package.json`.

```bash
npm run check
```

Platform packaging is handled by repository tooling. Windows and macOS
builds use different renderer and packaging paths. A successful result
on one platform must not be described as verification of the other
platform.

```bash
npm run build:windows
npm run build:macos
```

## Repository status

This repository is not open source and is not free software. Public
visibility, private sharing, browsing, downloading, cloning, forking,
archiving, diff viewing, issue viewing, pull request viewing, release
access, package metadata, or ordinary code-hosting functionality does
not grant permission to reuse Ludoxel Original Materials outside the
scope stated in `LICENSE`.

`LicenseRef-All-Rights-Reserved` is a repository-local SPDX custom
license reference for the Ludoxel Independent License. It is used by
source headers and package metadata to identify the controlling license
text in `LICENSE`. It does not identify an OSI-approved license, and it
does not make the repository open source.

## License

Ludoxel Original Materials are governed by the Ludoxel Independent
License in `LICENSE`. The current license version is Version 1.0.3.

`LICENSE` is the controlling license text for Ludoxel Original
Materials. If README text, NOTICE text, package metadata, SPDX headers,
About-page text, generated-file notices, issue text, pull request text,
release notes, summaries, translations, or UI descriptions conflict
with `LICENSE`, the English text of `LICENSE` controls for Ludoxel
Original Materials.

This repository is not licensed under Apache-2.0, MIT, BSD, GPL, AGPL,
LGPL, MPL, or any other open-source license.

`NOTICE` records explanatory legal, provenance, third-party,
distribution, runtime-data, and maintenance information. It does not
grant permissions that are absent from `LICENSE`.

The Ludoxel Independent License is governed by the laws of Japan to the
maximum extent permitted by applicable law. GitHub service terms,
including any service permission to view or fork repository content
through GitHub functionality, govern the separate relationship between
GitHub and its users. Those service terms do not expand the independent
license granted by Kento Konishi for Ludoxel Original Materials.

## Third-party materials

Third-party materials remain subject to their own licenses and notices.
The repository records known third-party legal material under
`third-party/`.

The presence of third-party license texts, third-party notices,
external packages, runtime components, SDKs, build tools, fonts, images,
sounds, textures, icons, or vendor materials does not relicense Ludoxel
Original Materials under those third-party terms.

Known supplemental third-party records include:

```text
third-party/kaisei-opti/LICENSE.txt
third-party/kaisei-opti/NOTICE.txt
third-party/python-runtime/NOTICE.txt
```

Kaisei Opti font files are treated as third-party font material governed
by the SIL Open Font License 1.1. The Ludoxel Independent License does
not relicense Kaisei Opti, and the SIL Open Font License 1.1 does not
relicense Ludoxel Original Materials.

## Provenance-sensitive local assets

Some local assets require separate provenance, rights, license,
trademark, redistribution, and transformation review. Their presence in
the repository does not represent that they are Ludoxel Original
Materials, public-domain materials, open-source materials, free assets,
or freely redistributable materials.

At minimum, Minecraft-named local assets under `assets/minecraft/` and
Minecraft-named font files under `assets/fonts/` must be treated as
provenance-sensitive local assets unless their status is established by
separate records.

A desktop distribution process must not assume that every file under
`assets/` may be redistributed merely because the application can load
or display that file.

## Runtime user data and application output

Runtime user data is separate from immutable package resources and from
Ludoxel Original Materials. Runtime user data includes player settings,
window state, key bindings, custom crosshair data, imported player
skins, save data, world edits, Othello settings, generated cache data,
and other user-specific records created or supplied during ordinary
application use.

User materials and ordinary application output do not become Ludoxel
Original Materials merely because Ludoxel creates, loads, displays,
stores, converts, or exports them. If those materials contain Ludoxel
Original Materials or third-party materials, the included protected
material remains subject to its applicable license or restriction.

## Distribution legal material

An authorized desktop distribution, installer, archive, application
bundle, executable package, wheel, source distribution, or release
artifact must include the legal material required for the exact artifact
being distributed. At minimum, Ludoxel distribution material must include:

```text
LICENSE
NOTICE
third-party/
```

Including these legal materials does not itself grant permission to
distribute Ludoxel. Distribution permission must come from `LICENSE` or
from a separate written agreement signed by Kento Konishi.

Copyright (c) 2026 Kento Konishi.
