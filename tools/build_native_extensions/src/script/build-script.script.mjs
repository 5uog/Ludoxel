/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function renderNativeBuildPythonScript() {
  return String.raw`
from __future__ import annotations

import json
from pathlib import Path
import sys

payload_path = Path(sys.argv[1])
payload = json.loads(payload_path.read_text(encoding="utf-8"))
project_root = Path(payload["projectRoot"]).resolve()
sources = payload["sources"]

try:
  from Cython.Build import cythonize
  from setuptools import Extension
  from setuptools.dist import Distribution
except ImportError as exc:
  raise SystemExit('Install native build dependencies first: python -m pip install -e ".[dev]"') from exc

extensions = [
  Extension(item["moduleName"], [item["sourcePath"]])
  for item in sources
]

ext_modules = cythonize(
  extensions,
  compiler_directives={"language_level": "3"},
  build_dir=str(project_root / "build" / "cython"),
)

dist = Distribution({
  "name": "ludoxel-native-hotpaths",
  "ext_modules": ext_modules,
  "script_name": "build_ext",
  "package_dir": {"": "src"},
})

command = dist.get_command_obj("build_ext")
command.inplace = True
command.build_lib = str(project_root / "build" / "lib")
command.build_temp = str(project_root / "build" / "temp")
dist.run_command("build_ext")
`;
}
