/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const distributionPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Platform Packages',
    title: 'Understanding the Windows Executable',
    description:
      'Delimits the evidentiary conditions under which a Windows binary counts as the repository-produced Ludoxel application payload: the PyInstaller command builder, the host and entry gates, the staging function that institutes the staged/payload distinction, lock handling, and the generated License Text module — and refuses to convert a staged payload into release authority.',
    sections: [
      {
        id: 'understanding-the-windows-executable-owner-files',
        title: 'Owner Files and Artifact Definition',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`build/desktop-payloads/windows/Ludoxel.exe` is the staging coordinate written by the Windows path of `tools/build_desktop_app`. `tools/build_desktop_app/src/config/build.config.mjs` fixes `WINDOWS_PAYLOAD_DIR`, `buildWindowsPyinstallerCommand` builds the PyInstaller invocation, and `tools/build_desktop_app/src/service/windows-build.service.mjs` stages the executable there. The staged executable is an application payload, not a public download coordinate: ',
              { kind: 'link', label: 'Understanding the Windows Installer', href: '/docs/distribution/desktop-artifacts/platform-packages/understanding-the-windows-installer' },
              ' owns the offline installer that embeds this payload and writes the artifact a Licensee actually receives, `dist/windows/ludoxel_installer.exe`.',
            ],
          },
          {
            kind: 'paragraph',
            text: '`runWindowsBuild` enforces the sequence in `tools/build_desktop_app/src/service/windows-build.service.mjs`: host and entry-script gates run before optional native compilation, a random token separates the PyInstaller work, spec, and staging roots, `runProcess` executes the constructed command, `generateLicenseTextModule` writes the generated License Text module before the PyInstaller spec is written to disk, and `stageWindowsPayload` copies the staged executable into `WINDOWS_PAYLOAD_DIR` only after a zero exit code. `EPERM`, `EBUSY`, and `EACCES` retry the staging rename through `renameStagedPayload`; a target still locked after every retry raises a hard error and leaves the previous staged payload untouched.',
          },
          {
            kind: 'paragraph',
            text: 'The Windows artifact path begins outside the service at the package-script command surface, narrows through the desktop-build parser and dispatch path, and enters `runWindowsBuild` only after the platform task and validated options have been selected. `buildWindowsPyinstallerCommand` materializes the subprocess argument vector; the service assigns tokenized work, spec, and staging directories; `runProcess` returns the subprocess outcome; and `stageWindowsPayload` writes the payload into `build/desktop-payloads/windows` after successful staging. Tool output can establish which local branch completed and which file path was written. The root `LICENSE` remains the independent source for circulation authority after the tool has finished its own construction work.',
          },
          {
            kind: 'paragraph',
            text: 'Two entry points feed the same Windows service.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Windows build entry points from package.json.',
            code: `npm run build:windows
npm run build:desktop -- windows`,
          },
          {
            kind: 'paragraph',
            text: [
              'What a completed `Ludoxel.exe` certifies is deliberately narrow: that `stageWindowsPayload` reached its success path on a Windows host. It certifies nothing about whether any party may distribute the file, whether the file is an official release, or whether the third-party material governing it has been cleared. The build path is not competent to confer any of those; they are reserved to the controlling License Text and to separate release authority. Assembling that payload into the artifact a Licensee installs is the responsibility ',
              { kind: 'link', label: 'Running an Installer Build with Permission', href: '/docs/distribution/build-operation/local-build-procedure/running-an-installer-build-with-permission' },
              ' describes.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'A completed `Ludoxel.exe` is an implementation result. The repository does not, by producing it, grant distribution permission, declare an official release, or clear third-party material; none of those follow from the file existing on disk.',
            },
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-command-construction',
        title: 'PyInstaller Spec Construction',
        content: [
          {
            kind: 'paragraph',
            text: '`buildWindowsPyinstallerCommand` generates a PyInstaller spec and returns a command that runs PyInstaller against that spec with `--noconfirm`, `--clean`, and the tokenized `--distpath` and `--workpath` roots. `runWindowsBuild` writes the spec text and generated `hook-OpenGL.py` into the tokenized spec root before the subprocess runs. The spec points `hookspath` at that generated hook before analysis starts, and it still exposes the post-Analysis `a.binaries` and `a.datas` lists as a guard against cached unused PyOpenGL runtime DLL entries.',
          },
          {
            kind: 'paragraph',
            text: [
              "The spec fixes the one-file build under the application name `Ludoxel`. It declares the data roots `assets`, `src/ludoxel`, and `third-party` through `directoryLegalMaterialPaths`, which admits only directory sources — each included only when present — appends `collect_data_files('ludoxel')`, places `src` on the import search path, points `hookspath` at the generated hook directory, names the bootstrap hidden imports `ludoxel.application.bootstrap` and `ludoxel.application.bootstrap.run`, sets the Windows icon when one resolves, and points the analysis at the entry script `src/ludoxel/__main__.py`. `LICENSE` is a single file, not a directory, so `directoryLegalMaterialPaths` never admits it as a `--add-data` source: a one-file PyInstaller build nests a file source one directory level deeper than its declared destination, which previously produced an unopenable `LICENSE\\LICENSE` entry inside the bundle. `generateLicenseTextModule` avoids that failure mode entirely by writing the License Text into a generated Python module the spec's own package collection carries through the PYZ archive instead of through `--add-data`; ",
              { kind: 'link', label: 'Including License Text', href: '/docs/distribution/runtime-inclusions/legal-material-inclusion/including-license-text' },
              ' owns that mechanism.',
            ],
          },
          {
            kind: 'paragraph',
            text: "The spec's `console` field fixes the console policy of the packaged executable. It is `False` by default, so the published `Ludoxel.exe` launches with no developer console or terminal log window; it is `True` only when the Windows build is invoked with `--developer-console`. A single ternary in the generator selects one value, so the spec never declares both, and the option is confined to the Windows one-file build — a console-bearing executable is an explicit opt-in, never the default artifact.",
          },
          {
            kind: 'paragraph',
            text: 'The generated hook keeps PyOpenGL platform and array hidden imports while setting hook `datas` and `binaries` empty, so the upstream `OpenGL/DLLS` GLUT and GLE runtime directory is absent before dependency analysis. Ludoxel drives windowing through Qt and uses only the OpenGL core, which loads the system `opengl32.dll`; the unused `OpenGL/DLLS` runtime has no load path in the application. The post-Analysis predicate still drops any cached `OpenGL/DLLS`, `MSVCR90.dll`, or `MSVCR100.dll` entry if one appears, leaving `OpenGL.GL`, `OpenGL.error`, and `OpenGL.platform` in the bundle. The Windows path adds none of the macOS `--collect-binaries wgpu`, `--collect-data wgpu`, or wgpu and rendercanvas imports, consistent with the repository statement that Windows retains the OpenGL renderer path.',
          },
          {
            kind: 'paragraph',
            text: 'The generated spec and local hook are the reviewable build specification. A dry run prints both without writing or building them, and those texts expose the one-file mode, the console policy, the declared data roots and hidden imports, the import search path, the OpenGL hook path, the DLL guard, and the entry script. The dry-run output proves only the declarations and filters it prints; binary inspection has a separate evidentiary source.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-publication',
        title: 'Publication and Lock Handling',
        content: [
          {
            kind: 'paragraph',
            text: '`stageWindowsPayload` institutes the distinction between a PyInstaller staging output and a durable application payload, and it is the only writer permitted to touch `build/desktop-payloads/windows/Ludoxel.exe`. It copies the staged executable to a temporary name inside `WINDOWS_PAYLOAD_DIR` and renames that file atomically over the payload path. The rename is the staging step: it makes the replacement indivisible, so a concurrent reader sees either the previous payload or the complete new one, never a partially written file.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'renameStagedPayload and stageWindowsPayload in windows-build.service.mjs.',
            code: `function renameStagedPayload(pendingExe, payloadExe) {
  const maxAttempts = 20;
  const retryDelayMs = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      renameSync(pendingExe, payloadExe);
      return;
    } catch (error) {
      if (attempt < maxAttempts && isFileLockError(error)) {
        if (attempt === 1) {
          console.log(\`[build_desktop_app] staged payload is busy; retrying replacement of \${payloadExe}\`);
        }
        sleepMs(retryDelayMs);
        continue;
      }

      throw error;
    }
  }
}

function stageWindowsPayload(stagingDir) {
  const stagedExe = resolve(stagingDir, \`\${APP_NAME}.exe\`);
  const payloadDir = resolve(PROJECT_ROOT, WINDOWS_PAYLOAD_DIR);
  const payloadExe = resolve(payloadDir, \`\${APP_NAME}.exe\`);

  if (!existsSync(stagedExe)) {
    throw new Error(\`PyInstaller did not produce staged executable: \${stagedExe}\`);
  }

  ensureDirectory(payloadDir);

  const pendingExe = resolve(payloadDir, \`\${APP_NAME}.exe.pending-\${randomUUID().replace(/-/g, '').slice(0, 12)}\`);

  try {
    copyFileSync(stagedExe, pendingExe);
    renameStagedPayload(pendingExe, payloadExe);
    console.log(\`[build_desktop_app] staged Windows application payload: \${payloadExe}\`);
  } catch (error) {
    removeIfExists(pendingExe);

    if (isFileLockError(error)) {
      throw new Error(\`Could not stage \${payloadExe}: the file is in use. Close any running \${APP_NAME}.exe (and any window previewing it), then run the build again.\`, { cause: error });
    }

    throw error;
  }
}`,
          },
          {
            kind: 'paragraph',
            text: 'The function refuses one condition and retries another. A missing staged executable throws, because there is no output to stage. A busy staging target raising `EPERM`, `EBUSY`, or `EACCES` is retried through `renameStagedPayload`, because antivirus or the shell can hold a freshly written executable for a moment; a target still locked after every retry — a genuinely running instance — raises a hard error and leaves the previous staged payload untouched. A build therefore cannot exit successfully while `build/desktop-payloads/windows/Ludoxel.exe` still holds the prior build under a lock the retries could not clear, so a stale payload can never be mistaken for the rebuilt one.',
          },
          {
            kind: 'paragraph',
            text: 'When the `staged Windows application payload` line is emitted, it certifies only that the copy and the retried rename completed. It does not establish that the binary launches on a clean host, that the package data is complete, or that anyone may circulate it, and it does not by itself place anything inside `dist/windows`: turning this payload into the artifact a Licensee installs is a separate step the installer build owns.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-inspection-order',
        title: 'Inspection Order',
        content: [
          {
            kind: 'paragraph',
            text: 'A Windows payload is adjudicated from the command surface inward. Each fact comes from the layer that produced it.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              "Read the printed PyInstaller command, generated spec, and generated hook, and confirm one-file mode, the `console` policy (`False`, or `True` only under `--developer-console`), the declared data roots, the `collect_data_files('ludoxel')` collection, the bootstrap hidden imports, the OpenGL hook path, the DLL guard, and the entry script.",
              'Confirm the staging line. A `staged Windows application payload` line and a `staged payload is busy` line are different outcomes and must never be conflated.',
              'Inspect `build/desktop-payloads/windows` on disk for `Ludoxel.exe`, and confirm the License Text module `generateLicenseTextModule` wrote before the PyInstaller command ran.',
              'Read the repository checks as separate predicates, not as one release verdict.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'A dry run exercises only the first item: it prints the constructed command and the generated spec, then returns before host enforcement, native building, spec writing, and staging, producing no `build/desktop-payloads/windows/Ludoxel.exe`.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'A Windows dry run prints the command without producing the executable.',
            code: `npm run build:windows -- --dry-run`,
          },
          {
            kind: 'paragraph',
            text: 'A staged payload never reaches a Licensee by itself; it is an installer build input, and the installer build is where the License Text gate, payload manifest, and final publication are evidenced. The dry-run command and the real build answer different questions; an inspection that borrows a conclusion from one to characterize the other is invalid.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`windows-build.service.mjs` creates a staged executable, checks its presence, and stages `Ludoxel.exe` into `build/desktop-payloads/windows`. Distribution permission, Official Distribution status, and third-party clearance remain fixed by their controlling legal sources. Whether the payload may reach a Licensee inside an installer build is fixed by the controlling ',
              { kind: 'link', label: 'License Text', href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text' },
              ', not by the build tool, whose competence ends at what is constructed and where it is written.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The Windows path yields evidence, not authority. It identifies what the payload is, which command produced it, which downstream build consumes it, and which output lines must be read before the artifact is described to anyone; it does not convert a successful local build into a permission.',
          },
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Reading Build Output', 'Including License Text', 'Understanding Distribution Materials', 'Understanding the Windows Installer', 'Running an Installer Build with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Platform Packages',
    title: 'Understanding the macOS Application Bundle',
    description:
      'Delimits the threshold at which a directory becomes the repository-produced macOS .app application payload: the windowed PyInstaller command and its WGPU renderer envelope, Info.plist identity, ad-hoc codesign and verification, bounded bundled-resource tolerance, and the exclusion of Apple release work from the tool path.',
    sections: [
      {
        id: 'understanding-the-macos-application-bundle-owner-files',
        title: 'Owner Files and Bundle Definition',
        content: [
          {
            kind: 'paragraph',
            text: [
              'The macOS artifact threshold is not satisfied by a directory name. `Ludoxel.app` under `build/desktop-payloads/macos` is an application payload only when the repository-defined bundle identity, executable payload, renderer envelope, required resources, and local signature verification all survive the staging path; anything short of that is an incomplete or unverified output, not a usable payload. The owners are `buildMacosPyinstallerCommand` in `tools/build_desktop_app/src/command/pyinstaller/build-command.pyinstaller.mjs`, the verification and staging path in `tools/build_desktop_app/src/service/macos-build.service.mjs`, and the prerequisite inspector in `tools/build_desktop_app/src/service/macos-status.service.mjs`. This payload is not the artifact a Licensee receives: ',
              { kind: 'link', label: 'Running an Installer Build with Permission', href: '/docs/distribution/build-operation/local-build-procedure/running-an-installer-build-with-permission' },
              ' owns the offline installer build that embeds it and writes `dist/macos/Ludoxel Installer.app`.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The macOS path exposes a build and a prerequisite check, which interrogate different states before any artifact exists.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'macOS build and packaging-check entry points from package.json.',
            code: `npm run build:macos
npm run build:macos:check`,
          },
          {
            kind: 'paragraph',
            text: 'Where the Windows payload is a single file, the macOS payload is a container whose identity is distributed across `Contents/MacOS`, `Contents/Resources`, `Contents/Frameworks`, `Info.plist`, bundled resources, the Python shared-library link, and the final signature state. The evidentiary threshold is correspondingly higher: each of those must be present for the container to count as the payload, and a directory carrying the name supplies none of them on its own.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-renderer-envelope',
        title: 'Renderer Runtime Envelope',
        content: [
          {
            kind: 'paragraph',
            text: [
              'The macOS command targets the WGPU and Metal-oriented route. `addMacosRendererBackendArgs` collects the `wgpu` native binaries and package data with `--collect-binaries wgpu` and `--collect-data wgpu`, and adds hidden imports for `wgpu.backends.wgpu_native`, `rendercanvas.qt`, `rendercanvas.pyqt6`, and `ludoxel.presentation.interface.input.macos_cursor`, so the wgpu-native Metal runtime and the rendercanvas Qt backend are bundled while optional wgpu submodules such as the imgui demo integration are left uncollected; `addMacosRequiredDataArgs` adds `assets` and `src` as required data and asserts the default Timo skin, and adds `third-party` through `directoryLegalMaterialPaths`, which admits only directory sources so a single-file `LICENSE` is never passed as an `--add-data` source. `generateLicenseTextModule` writes the License Text into a generated Python module the spec carries through the PYZ archive instead, the same mechanism ',
              { kind: 'link', label: 'Including License Text', href: '/docs/distribution/runtime-inclusions/legal-material-inclusion/including-license-text' },
              ' describes for Windows. macOS packaging requires the `assets`, `src`, and `third-party` inputs; their absence aborts the command.',
            ],
          },
          {
            kind: 'paragraph',
            text: '`checkMacosPackagingInputs` enforces the same envelope before a build runs, requiring the entry script, `package.json`, `pyproject.toml`, the bundled `assets` and `src` roots, the Timo skin, every legal-material path, every required font, and a fixed set of WGPU renderer sources, and confirming that `pyproject.toml` declares the Darwin-only `wgpu` and `rendercanvas` dependencies and a PyInstaller development dependency and that the command source still carries the `wgpu.backends.wgpu_native`, `rendercanvas.pyqt6`, and `macos_cursor` terms. The check establishes assembly of the repository-defined macOS renderer envelope. A build that omits it produces a different object from the repository specification.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'A macOS bundle that omits the WGPU and cursor-helper inclusions is materially incomplete regardless of the directory’s presence. The renderer path or gameplay mouse capture can be broken while `Ludoxel.app` appears to exist.',
            },
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-identity-and-signature',
        title: 'Identity Patching and Signature Verification',
        content: [
          {
            kind: 'paragraph',
            text: '`patchMacosInfoPlist` fixes the bundle name, display name, the identifier `com.kentokonishi.ludoxel`, the executable name, the short and bundle versions, the icon file, and the input-monitoring usage description to the Ludoxel package identity, and `requireMacosInfoPlist` refuses a bundle whose `Info.plist` lacks any required pair, a `.icns` icon entry, or the `NSInputMonitoringUsageDescription` string on which gameplay input capture depends. These fields constitute the identity that macOS, diagnostic tooling, and release operators read to decide whether a directory is the intended application.',
          },
          {
            kind: 'paragraph',
            text: 'Signing is delegated to the system `codesign` binary through one helper, and verification is a hard gate that aborts the build on any nonzero status.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'runCodesign, signMacosAppBundle, and verifyMacosCodeSignature in macos-build.service.mjs.',
            code: `function runCodesign(args, label) {
  const result = spawnSync('codesign', args, {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    const stderr = String(result.stderr || '').trim();
    const stdout = String(result.stdout || '').trim();
    const detail = stderr || stdout || \`exit \${result.status}\`;
    throw new Error(\`\${label} failed: \${detail}\`);
  }
}

function signMacosAppBundle(appPath) {
  runCodesign(['--force', '--deep', '--sign', '-', appPath], \`macOS app bundle ad-hoc signing (\${appPath})\`);
}

function verifyMacosCodeSignature(appPath) {
  runCodesign(['--verify', '--deep', '--strict', appPath], \`macOS app bundle signature verification (\${appPath})\`);
}`,
          },
          {
            kind: 'paragraph',
            text: 'The signing is ad-hoc: `signMacosAppBundle` passes `--sign -`, `verifyMacosCodeSignature` passes `--verify --deep --strict`, and a nonzero status throws. Its reach ends at local bundle integrity. It is neither Developer ID signing nor notarization, and `renderMacosStatus` states as much in the tool’s own words by enumerating codesigning with a real identity and notarization as release work outside the tool. A verified ad-hoc signature certifies that the bundle was internally consistent at verification time and certifies nothing about Apple distribution eligibility; reading it as notarization asserts an authority the tool explicitly disclaims.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-resource-tolerance',
        title: 'Resource Verification and Staging',
        content: [
          {
            kind: 'paragraph',
            text: '`verifyMacosAppBundle` refuses a bundle that exists but lacks required content: the `Contents/MacOS/Ludoxel` executable, the `Contents/Frameworks/Python` shared-library link, a `.icns` icon under `Contents/Resources`, the patched `Info.plist` fields, the default Timo skin, and each required font. Several of those are admitted under more than one container location, which `requireBundledResource` and `bundledAssetCandidates` encode.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'requireBundledResource and bundledAssetCandidates in macos-build.service.mjs.',
            code: `function requireBundledResource(appPath, label, relativePaths) {
  const matchedPath = relativePaths.find((relativePath) => bundledResourceExists(appPath, relativePath));

  if (!matchedPath) {
    throw new Error(\`macOS app bundle is missing \${label}. Checked: \${relativePaths.join(', ')}\`);
  }

  return matchedPath;
}

function bundledAssetCandidates(relativeAssetPath) {
  return Object.freeze([\`Contents/Frameworks/\${relativeAssetPath}\`, \`Contents/Resources/\${relativeAssetPath}\`]);
}`,
          },
          {
            kind: 'paragraph',
            text: 'The tolerance is bounded, not permissive. PyInstaller may deposit collected data under either `Contents/Frameworks` or `Contents/Resources`, so the verifier accepts either location for the Timo skin and the fonts, but `requireBundledResource` throws when none of the candidates holds the file. The check therefore survives a benign layout variation while still refusing a genuinely absent resource; to read the two-location allowance as optionality is to invert a presence requirement into a permission to omit.',
          },
          {
            kind: 'paragraph',
            text: '`stageMacosPayload` is the final writer of `build/desktop-payloads/macos`. It patches the plist, signs and verifies the staged bundle, removes any existing payload, copies the staged bundle in with symlinks preserved, then signs and verifies the copy. Copying a signed bundle can disturb its signature. The staged payload therefore receives a fresh signature and verification pass after the copy, not only before it.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`stageMacosPayload` in `tools/build_desktop_app/src/service/macos-build.service.mjs` patches `Info.plist`, signs and verifies the staged `.app`, copies it to `MACOS_PAYLOAD_DIR`, and signs and verifies the copy. The resulting local payload has evidence of that service path. Notarization, distribution-channel preparation, and public release authority require their separate platform and legal sources.',
          },
          {
            kind: 'paragraph',
            text: 'The macOS payload threshold is satisfied only when the repository-defined bundle identity, executable payload, renderer envelope, required resources, and local signature verification all survive the staging path. Anything short of that is an incomplete or unverified output, never a usable payload, and reaching a Licensee is a separate question the installer build answers.',
          },
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Reading Build Output', 'Running Resource and Shader Checks with Permission', 'Understanding Distribution Materials', 'Understanding the macOS Installer', 'Running an Installer Build with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Platform Packages',
    title: 'Understanding the Windows Installer',
    description:
      'Delimits the evidentiary conditions under which a Windows binary counts as the repository-produced Ludoxel installer: the embedded application payload and manifest, SHA-256 verification against that manifest before any extraction, the License Text scroll-and-consent gate, per-user installation without an elevation prompt, Installed Apps registration, and upgrade/downgrade handling.',
    sections: [
      {
        id: 'understanding-the-windows-installer-owner-files',
        title: 'Owner Files and Artifact Definition',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`dist/windows/ludoxel_installer.exe` is the artifact a Licensee downloads and runs; `tools/build_installer` publishes it as a single file, with no adjacent support directory. The owners are `src/ludoxel_installer/`, a Python package independent of `src/ludoxel/`’s four layers, and `tools/build_installer/`, the Node build tool that embeds a payload staged by `tools/build_desktop_app` (',
              { kind: 'link', label: 'Understanding the Windows Executable', href: '/docs/distribution/desktop-artifacts/platform-packages/understanding-the-windows-executable' },
              ') into a PyInstaller onefile build of `src/ludoxel_installer/__main__.py`.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'PyInstaller onefile mode extracts its full contents into a temporary directory on every launch, and that self-extraction step has twice produced a repository-tracked defect on this codebase: a single-file `--add-data` destination equal to its source name once nested a file one directory level deeper than declared, and a plain command-line-argument onefile build of the installer later failed mid-launch while extracting a PyQt6-bundled runtime DLL. `buildWindowsInstallerPyinstallerCommand` in `tools/build_installer/src/command/pyinstaller/build-command.pyinstaller.mjs` generates a dedicated PyInstaller spec for the installer: a single `Analysis`/`EXE()` build with binary filtering and no `COLLECT()` step, the same structure `tools/build_desktop_app` already uses for `Ludoxel.exe`. The command-line-argument invocation responsible for the second defect had neither that spec nor that filtering.',
          },
          {
            kind: 'paragraph',
            text: 'The installer and the payload it embeds are both onefile builds, built from separate PyInstaller spec generators: `buildWindowsInstallerPyinstallerCommand` for `ludoxel_installer.exe`, and `tools/build_desktop_app`’s own spec builder for `Ludoxel.exe`. Windows Installed Apps runs `Uninstall Ludoxel.exe`, a copy of the installer executable placed in the install directory, as the uninstall entry point. A running executable cannot delete the directory containing itself. `remove_installed_files` in `src/ludoxel_installer/platforms/windows/uninstall.py` detects that condition and writes a temporary batch script to `%TEMP%` that retries `rmdir /s /q` against the install directory up to sixty times, two seconds apart, deleting itself once the directory is gone; `subprocess.Popen` launches that script detached, and the uninstaller reports completion once the script is scheduled, before the retry loop runs.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-installer-manifest-and-verification',
        title: 'Payload Manifest and Verification',
        content: [
          {
            kind: 'paragraph',
            text: '`generateManifest` in `tools/build_installer/src/service/manifest.service.mjs` records the schema version, the application version read from `package.json`, the target platform and normalized processor architecture, the payload file name and format, the payload size, the payload SHA-256, and the SHA-256 of the root `LICENSE` the manifest was generated against, and writes that record beside the staged payload before PyInstaller runs.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'verify_payload in src/ludoxel_installer/domain/payload/verification.py.',
            code: `def verify_payload(payload_root: Path, current_platform: PlatformInfo) -> VerifiedPayload:
  manifest = load_manifest(payload_root)

  if manifest.platform != current_platform.platform_id:
    raise PayloadVerificationError(
      "This installer's embedded payload does not match the current operating system.",
      detail=f"manifest.platform={manifest.platform!r}, running on {current_platform.platform_id!r}",
    )

  if manifest.architecture != current_platform.architecture:
    raise PayloadVerificationError(
      "This installer's embedded payload does not match the current processor architecture.",
      detail=f"manifest.architecture={manifest.architecture!r}, running on {current_platform.architecture!r}",
    )

  expected_format = expected_payload_format(current_platform.platform_id)
  if manifest.payload_format != expected_format:
    raise PayloadVerificationError(
      "This installer's embedded payload is not in the expected format.",
      detail=f"manifest.payload_format={manifest.payload_format!r}, expected {expected_format!r}",
    )

  payload_path = Path(payload_root) / manifest.payload_file_name
  if not payload_path.is_file():
    raise PayloadVerificationError("This installer's embedded payload file is missing.", detail=f"missing {payload_path}")

  actual_size = payload_path.stat().st_size
  if actual_size != manifest.payload_size_bytes:
    raise PayloadVerificationError(
      "This installer's embedded payload size does not match its manifest.",
      detail=f"expected {manifest.payload_size_bytes} bytes, found {actual_size} bytes at {payload_path}",
    )

  actual_sha256 = _sha256_file(payload_path)
  if actual_sha256 != manifest.payload_sha256:
    raise PayloadVerificationError(
      "This installer's embedded payload failed integrity verification.",
      detail=f"expected sha256={manifest.payload_sha256}, computed {actual_sha256} for {payload_path}",
    )

  license_identity = verify_license_identity(manifest.license_text_sha256)
  if not license_identity.matches:
    raise PayloadVerificationError(
      "This installer's License Text does not match the License Text its payload manifest was built against.",
      detail=f"installer license sha256={license_identity.installer_license_sha256}, manifest license sha256={license_identity.manifest_license_sha256}",
    )

  return VerifiedPayload(manifest=manifest, payload_path=payload_path)`,
          },
          {
            kind: 'paragraph',
            text: [
              'Six conditions must hold before extraction begins: platform match, architecture match, payload-format match, payload presence, payload size and SHA-256 match, and the installer’s own embedded License Text hashing to the same value the manifest was built against. The last check binds the installer’s License Text presentation to the payload it is about to install; a manifest built against a different License Text — or an installer whose embedded License Text was altered after the manifest was generated — fails verification before any file is written. `load_manifest` and `expected_payload_format` are owned by ',
              { kind: 'link', label: 'Understanding Distribution Materials', href: '/docs/legal/license-authority-and-materials/material-scope/understanding-distribution-materials' },
              '’s sibling implementation files `domain/payload/manifest.py` and `foundations/platform_info.py`; no installer network request participates in any of these checks.',
            ],
          },
        ],
      },
      {
        id: 'understanding-the-windows-installer-license-gate',
        title: 'License Text Presentation and Consent Gate',
        content: [
          {
            kind: 'paragraph',
            text: 'The installer presents the full License Text before any installation step runs, and the gate is enforced by two independent conditions rather than by dialog sequencing alone. `LicenseScrollState` in `domain/license_scroll_state.py` tracks the License Text view’s scrollbar value against its maximum and latches once the view has reached the end, invalidating the latch only if the content range itself changes; `ConsentState` in `domain/consent_state.py` requires both that latch and the checked "I have read and agree to the Ludoxel Independent License." checkbox before `can_proceed` is true. The "Agree and Install" button’s enabled state is bound directly to `can_proceed`.',
          },
          {
            kind: 'paragraph',
            text: 'A "Third-Party Licenses" button opens a separate viewer listing each bundled third-party material next to its license text, reached from the same License screen without leaving the installer.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-installer-installation-and-registration',
        title: 'Per-User Installation and Registration',
        content: [
          {
            kind: 'paragraph',
            text: 'Once verification passes and consent is given, `_install_windows` in `application/controller.py` extracts the payload, checks that no `Ludoxel.exe` process is currently running, evaluates `plan_installation` against any existing install receipt, and refuses to proceed if the installed version is newer than the payload’s version. `atomic_replace_executable` in `platforms/windows/install.py` then writes the payload to `%LOCALAPPDATA%\\Programs\\Ludoxel` under the current user’s own permissions, through a pending-file-plus-rename sequence retried against `EPERM`, `EBUSY`, and `EACCES` locks, and `write_install_receipt` records the installed version and timestamp for the next install or uninstall to read.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'register_uninstall_entry in src/ludoxel_installer/platforms/windows/registration.py.',
            code: `def register_uninstall_entry(*, install_dir: Path, application_version: str, executable_path: Path, uninstaller_path: Path) -> None:
  quoted_uninstaller = f'"{uninstaller_path}"'
  values: dict[str, tuple[int, object]] = {
    "DisplayName": (winreg.REG_SZ, DISPLAY_NAME),
    "DisplayVersion": (winreg.REG_SZ, str(application_version)),
    "Publisher": (winreg.REG_SZ, PUBLISHER),
    "InstallLocation": (winreg.REG_SZ, str(install_dir)),
    "DisplayIcon": (winreg.REG_SZ, str(executable_path)),
    "UninstallString": (winreg.REG_SZ, f"{quoted_uninstaller} --uninstall"),
    "QuietUninstallString": (winreg.REG_SZ, f"{quoted_uninstaller} --uninstall --quiet"),
    "NoModify": (winreg.REG_DWORD, 1),
    "NoRepair": (winreg.REG_DWORD, 1),
  }

  try:
    with winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER, UNINSTALL_REGISTRY_SUBKEY, 0, winreg.KEY_WRITE) as key:
      for name, (value_type, value) in values.items():
        winreg.SetValueEx(key, name, 0, value_type, value)
  except OSError as error:
    raise RegistrationError("Ludoxel Installer could not register Ludoxel in Installed apps.", detail=str(error)) from error`,
          },
          {
            kind: 'paragraph',
            text: 'Registration writes to `HKEY_CURRENT_USER`, not `HKEY_LOCAL_MACHINE`, consistent with the per-user install location and the absence of an administrator-privileges prompt anywhere in the Windows install or registration path. `create_start_menu_shortcut` places a `.lnk` under the current user’s Start Menu through a generated PowerShell `WScript.Shell` script, avoiding a `pywin32` dependency for that single operation.',
          },
          {
            kind: 'paragraph',
            text: 'Uninstallation reverses registration before it removes files. `unregister_installation` in `platforms/windows/uninstall.py` removes the Start Menu shortcut and the Installed Apps registry key, and `remove_installed_files` then deletes the install directory; a running installed `Ludoxel.exe` copying its own executable cannot delete its own backing file, so `relaunch_outside_install_dir_if_needed` copies the uninstaller to a temporary directory and relaunches it there before either step runs. User runtime data lives at `%LOCALAPPDATA%\\Ludoxel`, a sibling of the install directory rather than a path inside it, so `remove_installed_files` never reaches it.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-installer-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: [
              'A completed installation certifies that payload verification, extraction, per-user file placement, and Installed Apps registration each reached their success path on this host. It certifies nothing about whether any party may distribute the installer or its embedded payload, whether the installation is an official release, or whether the third-party material it carries has been cleared. Those questions remain fixed by the controlling ',
              { kind: 'link', label: 'License Text', href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text' },
              ', not by a passing install or uninstall.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Understanding the Windows Executable', 'Running an Installer Build with Permission', 'Including License Text', 'Including Third Party License Text', 'Understanding the macOS Installer', 'Installing Ludoxel', 'Uninstalling Ludoxel'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Platform Packages',
    title: 'Understanding the macOS Installer',
    description:
      'Delimits the evidentiary conditions under which a macOS .app bundle counts as the repository-produced Ludoxel installer: the same embedded manifest and SHA-256 verification the Windows installer performs, native macOS authorization for writing to /Applications, LaunchServices registration, and the boundary between local bundle handling and Apple release work.',
    sections: [
      {
        id: 'understanding-the-macos-installer-owner-files',
        title: 'Owner Files and Artifact Definition',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`dist/macos/Ludoxel Installer.app`, and the optional `Ludoxel-Installer.dmg` disk image beside it, is the artifact a Licensee downloads and runs. `tools/build_installer/src/service/macos-installer-build.service.mjs` embeds a payload staged by `tools/build_desktop_app` (',
              { kind: 'link', label: 'Understanding the macOS Application Bundle', href: '/docs/distribution/desktop-artifacts/platform-packages/understanding-the-macos-application-bundle' },
              ') into a PyInstaller `--windowed` build of `src/ludoxel_installer/__main__.py`. Because a directory-based `.app` payload cannot be embedded through `--add-data` as a single opaque file, `archiveMacosPayload` first archives it with `tar`, preserving symlinks by omitting dereference, and the manifest records that archive as a `macos-app-bundle-tar` payload.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The `.dmg` is optional and non-blocking. `buildOptionalDmg` invokes `hdiutil create` against the published `.app`; if that step fails, the build logs the failure and continues, and the `.app` remains the artifact of record.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-installer-shared-verification',
        title: 'Shared Manifest and Verification Contract',
        content: [
          {
            kind: 'paragraph',
            text: [
              'The macOS installer verifies its embedded payload through the same `verify_payload` function, the same manifest schema, and the same License Text SHA-256 binding that ',
              { kind: 'link', label: 'Understanding the Windows Installer', href: '/docs/distribution/desktop-artifacts/platform-packages/understanding-the-windows-installer' },
              ' describes; `src/ludoxel_installer/domain/` and `src/ludoxel_installer/foundations/` are shared across both platforms, and only `src/ludoxel_installer/platforms/` branches by operating system. `expected_payload_format` resolves `macos-app-bundle-tar` for the Darwin platform, so a Windows-built payload archive fails the format check before extraction on macOS, and vice versa.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Extraction on macOS opens the tar archive with `filter="data"`, which preserves symbolic links and executable permission bits without granting the extracted members ownership or setuid bits beyond what the archive itself carries, into a temporary directory `create_temp_root` owns for the duration of the install.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-installer-authorization-and-registration',
        title: 'Applications Installation and Launch Services Registration',
        content: [
          {
            kind: 'paragraph',
            text: 'Installation targets `/Applications/Ludoxel.app` directly; there is no per-user install location on macOS. `stage_and_replace` in `platforms/macos/bundle_replace.py` moves any existing bundle to a backup path, records a rollback step to restore it, moves the newly extracted bundle into place, and records a rollback step to remove it, then confirms the installed bundle’s `Contents/MacOS/Ludoxel` executable exists before discarding the backup.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: '_privileged_shell and _move in src/ludoxel_installer/platforms/macos/bundle_replace.py.',
            code: `def _privileged_shell(command: str) -> None:
  escaped = command.replace("\\\\", "\\\\\\\\").replace('"', '\\\\"')
  script = f'do shell script "{escaped}" with administrator privileges'
  completed = subprocess.run(["osascript", "-e", script], capture_output=True, text=True, check=False, timeout=120)
  if completed.returncode != 0:
    raise InstallationError("Ludoxel Installer could not obtain permission to write to /Applications.", detail=completed.stderr.strip() or completed.stdout.strip())


def _move(source: Path, destination: Path) -> None:
  try:
    shutil.move(str(source), str(destination))
  except PermissionError:
    _privileged_shell(f"mv {_quote(source)} {_quote(destination)}")`,
          },
          {
            kind: 'paragraph',
            text: 'The installer moves and removes bundle paths directly first, and only falls back to `osascript … with administrator privileges` when that direct operation raises `PermissionError`. The authorization prompt this produces is the native macOS one; the installer never collects a password or credential itself, and nothing in `bundle_replace.py` requests elevation unconditionally. After installation, `register_with_launch_services` invokes the system `lsregister` tool against the installed bundle path so Spotlight and Launchpad recognize it without a reboot or manual re-registration; a failure from that call is silently tolerated, because macOS ordinarily discovers a bundle under `/Applications` through its own periodic scans regardless.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-installer-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: [
              'A completed installation certifies that payload verification, archive extraction, bundle replacement, and Launch Services registration each reached their success path on this host. It certifies nothing about Apple notarization, Gatekeeper acceptance, whether any party may distribute the installer or its embedded payload, or whether the installation is an official release. Those questions remain fixed by the controlling ',
              { kind: 'link', label: 'License Text', href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text' },
              ' and, for Apple’s own distribution requirements, by platform and legal sources this tool does not reach.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Understanding the macOS Application Bundle', 'Running an Installer Build with Permission', 'Including License Text', 'Including Third Party License Text', 'Understanding the Windows Installer', 'Installing Ludoxel'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Native and Runtime Materials',
    title: 'Understanding Native Extension Fallbacks',
    description:
      'Separates source availability, compiled acceleration, verification policy, and release permission in build_native_extensions and the foundations Python fallbacks: the RUST_NATIVE_MODULES registry, the compiled-import verification gate, the guarded-import fallback pattern each selector module shares, and the desktop-package effect — and refuses to read a native success as runtime superiority or distribution permission.',
    sections: [
      {
        id: 'understanding-native-extension-fallbacks-owner-files',
        title: 'Owner Files and the Rust Crate Registry',
        content: [
          {
            kind: 'paragraph',
            text: 'Native extension handling is fixed by `tools/build_native_extensions` against three Rust crates under `native/`, declared in `RUST_NATIVE_MODULES` in `tools/build_native_extensions/src/config/native.config.mjs`. There is no separate Cython build path: the tool formerly carried a distinct candidate set, a compiled-suffix classifier, and a require-built verification policy for three Cython sources under `src/ludoxel/foundations/mathematics`, and that path, its collection and build-script services, and its generated-payload build directory no longer exist in the repository. Every native target the tool builds or verifies is a Rust crate reached through this one registry.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'RUST_NATIVE_MODULES in native.config.mjs.',
            code: `export const RUST_NATIVE_MODULES = Object.freeze([
  Object.freeze({
    id: 'terrain_native',
    crateDirectory: 'native/ludoxel_terrain',
    crateName: 'ludoxel_terrain',
    moduleName: 'ludoxel.simulation.worlds.generation._terrain_native',
    artifactStem: '_terrain_native',
    installDirectory: 'src/ludoxel/simulation/worlds/generation',
    fallbackModuleName: 'ludoxel.simulation.worlds.generation.fallback',
  }),
  Object.freeze({
    id: 'othello_native',
    crateDirectory: 'native/ludoxel_othello',
    crateName: 'ludoxel_othello',
    moduleName: 'ludoxel.simulation.spaces.othello.engines._othello_native',
    artifactStem: '_othello_native',
    installDirectory: 'src/ludoxel/simulation/spaces/othello/engines',
    fallbackModuleName: 'ludoxel.simulation.spaces.othello.engines.search',
  }),
  Object.freeze({
    id: 'mathematics_native',
    crateDirectory: 'native/ludoxel_mathematics',
    crateName: 'ludoxel_mathematics',
    moduleName: 'ludoxel.foundations.mathematics._mathematics_native',
    artifactStem: '_mathematics_native',
    installDirectory: 'src/ludoxel/foundations/mathematics',
    fallbackModuleName: 'ludoxel.foundations.mathematics.geometry.ray_aabb',
  }),
]);`,
          },
          {
            kind: 'paragraph',
            text: [
              'The three registered crates are the ',
              {
                kind: 'link',
                label: 'terrain engine',
                href: '/docs/distribution/runtime-inclusions/native-and-runtime-materials/building-the-rust-terrain-extension',
              },
              ', the ',
              {
                kind: 'link',
                label: 'Othello search engine',
                href: '/docs/distribution/runtime-inclusions/native-and-runtime-materials/building-the-rust-othello-engine-extension',
              },
              ', and the ',
              {
                kind: 'link',
                label: 'foundations-mathematics engine',
                href: '/docs/distribution/runtime-inclusions/native-and-runtime-materials/building-the-rust-mathematics-extension',
              },
              '. `fallbackModuleName` names one representative Python module for registry reporting; the mathematics entry’s actual fallback set spans four selector modules and their matching pure-Python bodies, which the mathematics-crate article develops in full. Each record’s Python source remains the reference implementation for its crate: a compiled binary, where it exists, accelerates that reference and is not a distinct feature with its own behavior.',
            ],
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-guarded-import',
        title: 'The Guarded-Import Fallback Pattern',
        content: [
          {
            kind: 'paragraph',
            text: 'Every crate’s Python import owner selects between the compiled module and the pure-Python fallback with the same shape: one module-level `try`/`except ImportError` that binds a compiled-module name or `None`, evaluated once at import time. `ludoxel.foundations.mathematics._native` is representative of the pattern every crate’s owner module repeats.',
          },
          {
            kind: 'paragraph',
            text: 'Nothing in a source tree without a Rust build raises past this point: an absent compiled module produces `native_module = None`, and every call site checks that value before deciding which implementation runs, rather than letting the import failure propagate. This is the entire startup native check for a crate — a single guarded import, not a build, a self-test, or a bulk computation — so application startup cost does not grow with the number of registered crates.',
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-verify',
        title: 'Compiled-Import Verification',
        content: [
          {
            kind: 'paragraph',
            text: '`verifyRustNativeExtensions` runs inside every `npm run build:native:check` invocation and inside the post-build verification of `npm run build:native`. For each registered crate it imports the compiled module name in a subprocess whose `PYTHONPATH` is pinned to the repository `src` tree, reads the imported module’s `__file__`, and accepts the target only when that file resolves under `src/ludoxel` and carries the platform’s compiled suffix.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Native build and verification entry points from package.json.',
            code: `npm run build:native
npm run build:native:check`,
          },
          {
            kind: 'paragraph',
            text: [
              'A missing artifact, an import that resolves outside the repository source tree, or an import that resolves to a Python source file each fails the check for that crate; the Python fallback never passes this verification, because the gate exists to prove the compiled extension is the module the interpreter actually loads, not merely that some working implementation is reachable. `rustCrateStates` separately derives, from the same registry, the manifest path, the built cdylib path under `target/release`, the installed artifact path, and a staleness flag comparing crate source modification times against the installed artifact; a stale artifact is reported with a rebuild instruction, and the tool never rebuilds implicitly during verification. Four conditions move independently for every registered crate: source availability belongs to the Rust crate and its Python fallback module, compiled acceleration belongs to whether the configured artifact path holds a file the interpreter resolves the module name to, verification result belongs to this import gate, and release permission belongs to the controlling ',
              {
                kind: 'link',
                label: 'License Text',
                href: '/docs/legal',
              },
              '. A fallback-only crate retains a working implementation, and a passing native build establishes neither runtime superiority nor distribution permission.',
            ],
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-package-effect',
        title: 'Effect on the Desktop Package',
        content: [
          {
            kind: 'paragraph',
            text: 'In the desktop build, `buildNativeExtensionsBeforeDesktop` runs the native build before PyInstaller packaging unless `--skip-native-build` or a dry run is in effect, and a nonzero native exit code stops the desktop build before packaging. The package effect is not a single bit: an artifact may run entirely through Python fallbacks with no compiled crate present and still be a working, if slower, build, and it may satisfy every native-crate verification and still fail legal-material inclusion, shader validation, resource-root checks, or release-language constraints checked elsewhere in the same pipeline.',
          },
          {
            kind: 'paragraph',
            text: '`verifyRustNativeExtensions` in `tools/build_native_extensions/src/service/rust.service.mjs` is the one classifier the desktop preflight and a source-tree check both consult for native state; there is no separate Cython-era classifier left to consult, and a description that cites `compiledBinariesForSource` or a `--require-built` flag as current build behavior is describing a removed path. Build output establishes the selected technical state of each registered crate. Distribution authority continues to arise from the controlling License Text.',
          },
        ],
      },
    ],
    relatedTitles: ['Building the Rust Terrain Extension', 'Building the Rust Mathematics Extension', 'Running a Desktop Build with Permission', 'Reading Build Output'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Legal Material Inclusion',
    title: 'Including License Text',
    description:
      'Defines how the application payload carries its own License Text and Third-Party License Text at runtime: the directory-only PyInstaller data embedding third-party keeps, the generated-source embedding License Text now uses instead, the Legal Information settings surface that reads both, and the boundary between that embedding and the Installer’s own separately collected copy.',
    sections: [
      {
        id: 'including-license-text-owner-files',
        title: 'Owner Files and Embedding Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'Every desktop application payload carries the material `LEGAL_MATERIAL_PATHS` in `tools/build_desktop_app/src/config/build.config.mjs` names, `LICENSE` and `third-party`, but the two travel through different mechanisms into the same running process. `third-party` is a directory; `directoryLegalMaterialPaths` in `tools/build_desktop_app/src/command/pyinstaller/build-command.pyinstaller.mjs` filters `LEGAL_MATERIAL_PATHS` down to directory sources and PyInstaller copies its contents into a same-named data folder, the same treatment `assets` and `src/ludoxel` already receive. `LICENSE` is a single file, and PyInstaller’s onefile data destination is always a target *folder*: a file source placed under a destination equal to its own name lands nested one level below where the running application looks for it, not at that path. `license-codegen.service.mjs` avoids that nesting entirely by not routing `LICENSE` through `--add-data` at all.',
          },
          {
            kind: 'paragraph',
            text: '`generateLicenseTextModule` in `tools/build_desktop_app/src/service/license-codegen.service.mjs` reads the root `LICENSE` file and writes its exact text into a generated Python source module as a string literal, so the License Text ships inside the PYZ bytecode archive PyInstaller already builds from the application’s own Python source, the same archive that carries every other module the entry script imports. `runWindowsBuild` and `runMacosBuild` call this generator immediately before the PyInstaller subprocess runs. The generated module is not committed: `.gitignore` excludes `src/ludoxel/presentation/documentation/legal/_generated_license_text.py`, and a source-tree run that has never executed the generator has no such file to import.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'A payload’s License Text and Third-Party License Text presence do not by themselves establish distribution permission, official-release status, or a recipient’s standing as an authorized distributor. Those remain fixed by the controlling License Text; embedding is retention, not authority.',
            },
          },
        ],
      },
      {
        id: 'including-license-text-generated-module',
        title: 'The Generated License Module',
        content: [
          {
            kind: 'paragraph',
            text: 'JSON string escaping and a Python double-quoted string literal agree on every sequence `JSON.stringify` can produce — `\\"`, `\\\\`, `\\n`, `\\r`, `\\t`, and `\\uXXXX` — so `generateLicenseTextModule` reuses `JSON.stringify` as its Python-string escaper instead of writing a bespoke one.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'buildPythonModuleSource and generateLicenseTextModule in license-codegen.service.mjs.',
            code: `function buildPythonModuleSource(licenseText) {
  const literal = JSON.stringify(licenseText);

  return \`from __future__ import annotations

LICENSE_TEXT: str = \${literal}
\`;
}

export function generateLicenseTextModule() {
  const licensePath = resolve(PROJECT_ROOT, 'LICENSE');
  if (!existsSync(licensePath)) {
    throw new Error(\`Root LICENSE is missing: \${licensePath}\`);
  }

  const licenseText = readFileSync(licensePath, 'utf8');
  const outputPath = resolve(PROJECT_ROOT, GENERATED_LICENSE_MODULE_RELATIVE_PATH);
  ensureDirectory(dirname(outputPath));
  writeFileSync(outputPath, buildPythonModuleSource(licenseText));

  return outputPath;
}`,
          },
          {
            kind: 'paragraph',
            text: 'On the reading side, `ludoxel.presentation.documentation.legal.model.load_license_text` imports `LICENSE_TEXT` from that generated module and returns it; an `ImportError` — the module never having been generated, which is the ordinary state of an unbuilt source tree — falls back to `_dev_tree_license_text`, which walks upward from the package directory for a directory holding both `LICENSE` and `third-party` and reads the real root `LICENSE` file directly. A frozen build always has the generated module; a source-tree run always has the real file; neither path depends on a PyInstaller data-extraction step for this specific text.',
          },
        ],
      },
      {
        id: 'including-license-text-legal-information-surface',
        title: 'The Legal Information Settings Surface',
        content: [
          {
            kind: 'paragraph',
            text: '`build_legal_tab` in `src/ludoxel/presentation/interface/settings/legal/page.py` is the reader for both halves of this embedding. It calls `load_license_text` for the License Text and `list_third_party_materials` in the same `model.py` for the Third-Party License Text, the latter still reading `resource_root / "third-party"` because that directory continues to arrive through PyInstaller’s ordinary data embedding rather than generated source. The tab is a sibling of the existing About tab in `SettingsOverlay`, added at sidebar index 6 with the same lazy-build-on-first-visit pattern About already used, not a section appended to About: About keeps sole ownership of the creator bio and etymology, and Legal Information keeps sole ownership of License Text and Third-Party License Text display.',
          },
          {
            kind: 'paragraph',
            text: 'Selecting an entry in the tab’s material list swaps the displayed text between the Ludoxel License Text and each detected third-party material; the list is populated from the same directory scan as the installer’s own Third-Party Licenses viewer, one entry per `third-party/` subdirectory holding a `LICENSE.txt`, so a repository that adds a new third-party material directory needs no code change here to surface it.',
          },
        ],
      },
      {
        id: 'including-license-text-installer-boundary',
        title: 'Installer Boundary',
        content: [
          {
            kind: 'paragraph',
            text: [
              'The application payload’s embedded License Text is not the same evidence as the ',
              { kind: 'link', label: 'Installer', href: '/docs/distribution/desktop-artifacts/platform-packages/building-the-ludoxel-installer' },
              '’s own copy. `tools/build_installer` collects `LICENSE` and `third-party` independently, into its own installer-staging `legal/` directory, for its License screen and Third-Party Licenses viewer; that collection runs whether or not an application payload has been built in the same session, and its correctness is the Installer article’s subject, not this one’s.',
            ],
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'To inspect the application payload’s own copy, read the generated `_generated_license_text.py` after a build, or trust the source-tree fallback and read root `LICENSE` directly.',
              'To inspect the Installer’s copy, open its License screen or its Third-Party Licenses viewer, or read `build/installer-staging/<platform>/legal/` after `tools/build_installer` stages it.',
              'After any later copy, compression, or transfer of either artifact, examine the transferred artifact again, because a downstream step can strip what the build correctly produced.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'An inspection that treats one embedding as evidence for the other is incomplete. The application payload and the Installer are separate PyInstaller builds with separate legal-material collection, and presence must be confirmed in each independently.',
          },
        ],
      },
      {
        id: 'including-license-text-check-reading',
        title: 'What the Legal Check Proves',
        content: [
          {
            kind: 'paragraph',
            text: 'The repository legal check resolves the root `LICENSE` through `LEGAL_PATHS.license` and fails when that file is absent. A passing result records the displayed path that was checked.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Repository root-license existence check from package.json.',
            code: `npm run license:check`,
          },
          {
            kind: 'paragraph',
            text: 'The result establishes only the presence of the root `LICENSE` in the Current Repository at check time. It says nothing about whether `generateLicenseTextModule` has run for a given build, whether the generated module’s content still matches that root file, or whether the Installer’s independently collected copy is current; those are established by rebuilding and by inspecting the resulting artifact, not by this check. Third-party notice coverage and distribution authority follow their own source texts and artifact evidence.',
          },
        ],
      },
      {
        id: 'including-license-text-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`generateLicenseTextModule`, `directoryLegalMaterialPaths`, and `build_legal_tab` place License Text and Third-Party License Text where the running application, and separately the Installer, can display them. License grants, Original Materials, Distribution Materials, and repository visibility remain fixed by the controlling ',
              { kind: 'link', label: 'License Text', href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text' },
              ' and the Legal category. Their scope is operational: which mechanism carries which material into which running process, and the defects produced by an omission in either.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The conclusion is unconditional. A distribution artifact must not be detached from its controlling legal material, and attachment to that material is still not permission to distribute the artifact.',
          },
        ],
      },
    ],
    relatedTitles: ['Including Third Party License Text', 'Building the Ludoxel Installer', 'Running Package Checks with Permission', 'Understanding License Authority', 'Understanding Controlling Text'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Legal Material Inclusion',
    title: 'Including Third Party License Text',
    description: 'Explains third-party notice retention for the Kaisei Opti font through the repository notice, the directory-only PyInstaller data embedding that carries it into each platform payload, and macOS font-resource requirements.',
    sections: [
      {
        id: 'including-third-party-license-text-owner-files',
        title: 'Owner Files and Retention Scope',
        content: [
          {
            kind: 'paragraph',
            text: '`third-party/kaisei-opti/LICENSE.txt` carries the Kaisei Opti notice in the repository. `LEGAL_MATERIAL_PATHS` includes `third-party`, and `directoryLegalMaterialPaths` in `tools/build_desktop_app/src/command/pyinstaller/build-command.pyinstaller.mjs` admits it as a directory source, so PyInstaller embeds the whole `third-party` tree into each platform payload as ordinary application data, the same treatment `assets` and `src/ludoxel` receive.',
          },
          {
            kind: 'paragraph',
            text: 'The notice supplies terms for the named font material. Other assets retain their own provenance and governing terms.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'Third-party license inclusion is a notice-retention problem. It is not a provenance certificate for every asset that appears in the repository, a build output, or a rendered scene.',
            },
          },
        ],
      },
      {
        id: 'including-third-party-license-text-checker',
        title: 'Repository Legal Check Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`checkLegal` resolves the root `LICENSE` through `LEGAL_PATHS.license`, fails when that file is absent, and records the displayed path when it exists. Third-party notice retention is established through the repository notice, the directory-only PyInstaller data embedding, and inspection of the built payload.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'checkLegal in legal.check.mjs.',
            code: `export function checkLegal() {
  const failures = [];
  const licenseLabel = displayPath(LEGAL_PATHS.license);

  if (!existsSync(LEGAL_PATHS.license)) {
    failures.push(\`\${licenseLabel} is missing\`);
  }

  return printCheckResult('legal', failures, [\`checked \${licenseLabel}\`]);
}`,
          },
          {
            kind: 'paragraph',
            text: 'The repository legal command invokes this existence check directly.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'The repository root-license existence check.',
            code: `npm run license:check`,
          },
          {
            kind: 'paragraph',
            text: 'This command reports the root-license existence result. The Kaisei notice is inspected at `third-party/kaisei-opti/LICENSE.txt`, and packaged retention is inspected inside the built application payload, either through a runtime inspection tool for the packaged PyInstaller archive or through the running application’s own Legal Information settings tab, which reads the same embedded `third-party` directory.',
          },
        ],
      },
      {
        id: 'including-third-party-license-text-notice-versus-resource',
        title: 'Notice Versus Runtime Resource',
        content: [
          {
            kind: 'paragraph',
            text: 'The Kaisei notice text and the Kaisei font files answer different questions, and the macOS path treats the font files as runtime resources alongside the Minecraft interface fonts.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'MACOS_REQUIRED_FONT_ASSET_PATHS in macos-build.service.mjs.',
            code: `const MACOS_REQUIRED_FONT_ASSET_PATHS = Object.freeze([
  'assets/fonts/MinecraftRegular-Bmg3.otf',
  'assets/fonts/MinecraftBold-nMK1.otf',
  'assets/fonts/MinecraftItalic-R8Mo.otf',
  'assets/fonts/MinecraftBoldItalic-1y1e.otf',
  'assets/fonts/KaiseiOpti-Regular.ttf',
  'assets/fonts/KaiseiOpti-Medium.ttf',
  'assets/fonts/KaiseiOpti-Bold.ttf',
]);`,
          },
          {
            kind: 'paragraph',
            text: 'The font asset path establishes that the material can be bundled into the macOS application; the notice path carries the text that must survive packaging. They are not interchangeable. A bundle containing `KaiseiOpti-Regular.ttf` but omitting the notice is defective as a distribution artifact, while a repository containing the notice but omitting the font asset passes the legal check and fails the macOS resource prerequisite. One question asks whether notice material exists; the other asks whether a platform-required runtime resource is present; treating them as one misreports both states.',
          },
        ],
      },
      {
        id: 'including-third-party-license-text-end-to-end',
        title: 'End-to-End Retention',
        content: [
          {
            kind: 'paragraph',
            text: 'Because `third-party` is a configured legal-material path admitted as a directory source, PyInstaller embeds it directly into each platform payload during packaging; no separate copy step runs after the payload is built, so the notice travels from the repository root into the artifact in one operation.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Confirm the notice exists at the repository root under `third-party/`.',
              'For a Windows payload, confirm `third-party` is embedded by inspecting the running application’s Legal Information tab, or by unpacking the built onefile archive with a PyInstaller-aware extraction tool.',
              'For a macOS payload, confirm `third-party` is present under `Contents/Frameworks` or `Contents/Resources` inside the built `.app`, matching the two-location tolerance the macOS build already applies to other bundled resources.',
              'After any later copy, compression, or transfer of the artifact, examine the transferred artifact again, because a downstream step can still strip data PyInstaller embedded correctly.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Third-party license inclusion is therefore an end-to-end retention requirement, not a single build-time event. The repository can be correct and the build output can be correct, and a later transfer step can still strip the directory; only inspection of the transferred artifact confirms that retention survived.',
          },
        ],
      },
      {
        id: 'including-third-party-license-text-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`third-party/kaisei-opti/LICENSE.txt` retains the SIL Open Font License text for Kaisei Opti. The payload’s embedded data preserves that notice; third-party redistribution terms and provenance-sensitive assets remain governed by their applicable legal sources. The full analysis of ',
              { kind: 'link', label: 'third-party material boundaries', href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-third-party-material-boundaries' },
              ' is fixed by the Data and Legal categories. Its scope is the operational retention of a named notice and the defects produced by omission.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The rule is narrow. If an artifact carries third-party material, the corresponding notice must remain embedded in that artifact. Embedding is evidence of notice retention; it is not proof of general legal clearance.',
          },
        ],
      },
    ],
    relatedTitles: ['Including License Text', 'Running Resource and Shader Checks with Permission', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build Operation',
    group: 'Local Build Procedure',
    title: 'Running a Desktop Build with Permission',
    description:
      'Defines the command surface of build_desktop_app as a containment device for an already-authorized operator: parsing and validation as command-surface containment, task dispatch into platform-specific service execution, host gates, dry-run and check modes, native-build and cache ordering — and the refusal to read command availability as execution authority.',
    sections: [
      {
        id: 'running-a-desktop-build-with-permission-authority-premise',
        title: 'Authority Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'Running the local build presupposes that the operator already holds authority under the controlling License Text or a separate competent written permission. A package script existing is not that authority. The Distribution question opens only after the premise holds: which command runs, which target is selected, which host is required, which inputs are read, and which artifact paths are written.',
          },
          {
            kind: 'paragraph',
            text: 'The build command is a containment device. `parse.args.mjs`, `validate.args.mjs`, `dispatch.run.mjs`, and `task.service.mjs` narrow a terminal request into a configured platform task, service call, and subprocess payload. The License Text separately determines whether an operator holds authority for the resulting act.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'The build path records validation, dispatch, subprocess construction, staging, publication, and status. Permission to build, distribute, publish, mirror, or upload Ludoxel remains with the License Text and any later competent written instrument.',
            },
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-parse-validate',
        title: 'Parsing and Validation',
        content: [
          {
            kind: 'paragraph',
            text: '`parseDesktopBuildArgs` reads the command line, recognizing the `windows` and `macos` targets, the flags `--dry-run`, `--developer-console`, `--skip-native-build`, `--keep-build-cache`, `--status`, and `--check`, and a help-language selection; it records a conflict when two targets are declared and refuses unknown options and commands. The targets and diagnostic modes are reached through the package scripts:',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Targeted desktop build invocations from package.json.',
            code: `npm run build:desktop -- windows
npm run build:desktop -- macos
npm run build:macos:check
npm run build:macos -- --status`,
          },
          {
            kind: 'paragraph',
            text: '`validateDesktopBuildArgs` then narrows the parsed state: it resolves the default target and refuses contradictory diagnostic modes.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'validateDesktopBuildArgs in cli/args/validate.args.mjs.',
            code: `export function validateDesktopBuildArgs(parsed) {
  const errors = [...parsed.errors];
  const command = parsed.command || (parsed.help ? null : 'windows');

  if (!SUPPORTED_LANGUAGES.has(parsed.language)) {
    errors.push(\`Unsupported language: \${parsed.language}\`);
  }

  if (parsed.status && parsed.check) {
    errors.push('--status and --check cannot be used together.');
  }

  if (parsed.developerConsole && command === 'macos') {
    errors.push('--developer-console is only valid for the Windows onefile build.');
  }

  return {
    ...parsed,
    command,
    language: SUPPORTED_LANGUAGES.has(parsed.language) ? parsed.language : 'ja',
    errors,
  };
}`,
          },
          {
            kind: 'paragraph',
            text: 'Three decisions govern downstream behavior. A command with no target and no help request resolves to `windows`. `--status` with `--check` is refused because the macOS status report and the macOS prerequisite check are separate modes, and `--developer-console` is refused on the macOS target because the console policy belongs to the Windows onefile build alone. Validation precedes every task: a non-empty error list causes the dispatcher to print the errors and return exit code 2 before a platform service receives the request.',
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-dispatch',
        title: 'Task Dispatch and Host Gates',
        content: [
          {
            kind: 'paragraph',
            text: '`runDesktopBuildTask` narrows a validated option set to a single platform-specific service execution and encodes the macOS-only diagnostic modes inline, so `--check` and `--status` short-circuit before a real build.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'runDesktopBuildTask in service/task.service.mjs.',
            code: `export function runDesktopBuildTask(options, context = {}) {
  if (options.command === 'windows') {
    return runWindowsBuild({ ...options, env: context.env });
  }

  if (options.command === 'macos') {
    if (options.check) {
      return checkMacosPackagingInputs();
    }

    if (options.status) {
      console.log(renderMacosStatus());
      return 0;
    }

    return runMacosBuild({ ...options, env: context.env });
  }

  console.error(\`Unknown desktop build command: \${options.command}\`);
  return 2;
}`,
          },
          {
            kind: 'paragraph',
            text: 'The two services impose different host gates, and the gates are why the target must be fixed before any artifact is discussed. `runWindowsBuild` requires a Windows host for a real build and checks the Windows entry script, though a Windows dry run forgoes the host requirement because it does not execute. `runMacosBuild` requires a macOS host and, before PyInstaller runs, the entry script, the default Timo skin, a macOS `.icns` icon candidate, and every required font asset. The hosts, renderer paths, and artifact forms differ; treating the two targets as one generic desktop build collapses three distinct containment boundaries at once.',
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-native-and-cache',
        title: 'Native Build and Cache Ordering',
        content: [
          {
            kind: 'paragraph',
            text: 'Unless explicitly skipped, native extensions are built before packaging, and a nonzero native result stops the desktop build.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'Native-build ordering gate in windows-build.service.mjs.',
            code: `  if (!options.skipNativeBuild && !options.dryRun) {
    const nativeExitCode = buildNativeExtensionsBeforeDesktop(options);

    if (nativeExitCode !== 0) {
      return nativeExitCode;
    }
  }`,
          },
          {
            kind: 'paragraph',
            text: 'After the native phase, the service constructs tokenized PyInstaller work, spec, and staging roots under `build/`, prints the command, runs it with the resolved Python executable, generates the License Text module, stages the application payload, and removes the tokenized roots unless `--keep-build-cache` is supplied. The order is the audit trail.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Validate the target, host, and required inputs.',
              'Build native extensions unless `--skip-native-build` or a dry run, and stop on a nonzero native result.',
              'Construct and print the PyInstaller command.',
              'Generate the License Text module and execute PyInstaller into tokenized staging roots under `build/`.',
              'Stage the application payload into `build/desktop-payloads/windows` or `build/desktop-payloads/macos`.',
              'Remove tokenized build roots unless `--keep-build-cache` is supplied.',
            ],
          },
          {
            kind: 'paragraph',
            text: [
              'The durable payload directories are `build/desktop-payloads/windows` and `build/desktop-payloads/macos`; the tokenized roots are implementation detail and part of the audit trail, not artifact locations. A staged output that survives a staging problem is not the payload the installer build consumes, and the distinction must hold in any report. Turning a payload into the artifact a Licensee installs is a separate operation ',
              { kind: 'link', label: 'Running an Installer Build with Permission', href: '/docs/distribution/build-operation/local-build-procedure/running-an-installer-build-with-permission' },
              ' describes.',
            ],
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`renderMacosStatus` and `checkMacosPackagingInputs` inspect the configured macOS input set: WGPU sources, cursor helper, fonts, icon candidates, legal material, PyInstaller command terms, and Darwin dependencies. Installer creation, update delivery, store submission, notarized public release, website download publication, external redistribution, and operator authority require separate service or legal sources.',
          },
          {
            kind: 'paragraph',
            text: 'An authorized local desktop build is a target-specific task that validates inputs, may build native extensions, constructs a PyInstaller command, writes intermediate roots, publishes a platform artifact, and emits logs that must be read before the artifact is described or transferred. Command availability is the containment surface for that task; it is not, and does not become, execution authority over distribution.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding the Windows Executable', 'Understanding the macOS Application Bundle', 'Understanding Native Extension Fallbacks', 'Reading Build Output'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build Operation',
    group: 'Local Build Procedure',
    title: 'Reading Build Output',
    description: 'Defines the evidentiary granularity of build and check output and forbids the inference from a favorable line to a release conclusion: the printed PyInstaller command, the report function pass/note/failure hierarchy, native verification lines, and the platform publication results.',
    sections: [
      {
        id: 'reading-build-output-evidentiary-function',
        title: 'Evidentiary Function',
        content: [
          {
            kind: 'paragraph',
            text: 'Build output records what a tool attempted, verified, skipped, and wrote. Artifact inspection supplies artifact evidence, while release authority comes from its controlling source. A printed PyInstaller command establishes command construction; a published-artifact line establishes that a publication function reached its success path; a `passed` line establishes that a named check returned zero. Permission, official-release status, and third-party clearance require their governing evidence.',
          },
          {
            kind: 'paragraph',
            text: 'The output is read in a fixed order, so each line is taken at its own granularity.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Identify the tool and target that produced the line.',
              'Determine whether the run was diagnostic (dry run, status, or check) or productive (a real build).',
              'Read named failures and notes without generalizing them beyond the check that emitted them.',
              'Compare the reported output path against the file system.',
            ],
          },
          {
            kind: 'paragraph',
            text: '`printCheckResult` records pass or failure for one named policy, while `CHECKS` in `tools/check_project/src/service/check.service.mjs` selects that policy by name. A favorable line therefore establishes the evaluated predicate. Artifact transferability, release status, and distribution authority require their independent evidence and controlling legal source.',
          },
        ],
      },
      {
        id: 'reading-build-output-command-display',
        title: 'Command Display',
        content: [
          {
            kind: 'paragraph',
            text: "The desktop build service prints the PyInstaller command before execution, and on a Windows dry run it additionally prints the generated spec and generated OpenGL hook, which are the principal outputs because the service returns before PyInstaller runs. The command line carries the Python executable, the module invocation, the clean and confirmation flags, the tokenized output roots, and the generated spec path; the printed spec declares the one-file EXE, the console policy, the data roots and `collect_data_files('ludoxel')` collection, the bootstrap hidden imports, the import search path, the OpenGL hook path, the DLL guard, the icon, and the entry script. The printed hook shows PyOpenGL platform and array hidden imports while leaving OpenGL DLL data collection empty. The dry run is reached as:",
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'A dry run prints the command and returns before building.',
            code: `npm run build:windows -- --dry-run`,
          },
          {
            kind: 'paragraph',
            text: 'A displayed command is an intended invocation, and its evidentiary reach stops there. It establishes whether the target, entry script, icon, data roots, hidden imports, and staging paths were constructed correctly; it does not establish that PyInstaller succeeded, that the output file exists, or that legal material was copied after publication. To read a dry-run command print as a finished build is a factual error, not a stylistic one.',
          },
        ],
      },
      {
        id: 'reading-build-output-pass-failure-notes',
        title: 'Pass, Failure, and Notes',
        content: [
          {
            kind: 'paragraph',
            text: 'Every repository check renders its result through one function, `printCheckResult`, and that function fixes the evidentiary hierarchy of the output.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'printCheckResult in tools/check_project/src/service/report.service.mjs.',
            code: `export function printCheckResult(name, failures, notes = []) {
  if (failures.length === 0) {
    console.log(\`\${name}: passed\`);
  } else {
    console.error(\`\${name}: failed\`);
  }

  for (const note of notes) {
    console.log(\`  note: \${note}\`);
  }

  for (const failure of failures) {
    console.error(\`  - \${failure}\`);
  }

  return failures.length === 0 ? 0 : 1;
}`,
          },
          {
            kind: 'paragraph',
            text: 'Three severities are encoded and may not be merged. A `name: passed` line establishes that the named check found no failures. A `note:` line is diagnostic context; the resource check, for instance, records that `assets/` exists and must stay ignored until provenance is reviewed, which is a non-clearance signal. A `- failure` line is a specific, named defect. The text after the check name governs the reading, because each check owns its own evidence set and its own boundary; note lines and failure lines therefore stay within their named check boundary.',
          },
        ],
      },
      {
        id: 'reading-build-output-publication-results',
        title: 'Staging and Verification Results',
        content: [
          {
            kind: 'paragraph',
            text: 'Windows and macOS report payload staging differently because the artifacts differ. Windows prints `staged Windows application payload` when `build/desktop-payloads/windows/Ludoxel.exe` is replaced, and reports a busy staging target when the payload path remains locked. macOS prints a staged application payload after Info.plist patching, ad-hoc signing, verification, copying, re-signing, and re-verification. Rust native verification prints each configured target and then requires its installed compiled artifact and imported compiled suffix; the Python fallback is an explicit failure state for this check.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'Per-target output and compiled-artifact gates in rust.service.mjs.',
            code: `    console.log(\`rust native target: \${state.id}: \${state.moduleName} -> \${displayPath(state.crateRoot)}\`);

    if (!state.installedExists) {
      console.error(\`  compiled extension: missing (\${displayPath(state.installedArtifactPath)}). The Python fallback (\${state.fallbackModuleName}) is not accepted by this check; run: npm run build:native\`);
      failed = true;
      continue;
    }

    const imported = importedModuleFile(python, state.moduleName, env);
    if (!imported.ok) {
      console.error(\`  compiled extension import failed for \${state.moduleName}: \${imported.detail}\`);
      failed = true;
      continue;
    }

    const importedFile = resolve(imported.file);
    if (!importedFile.startsWith(srcLudoxelRoot)) {
      console.error(\`  imported module resolves outside the repository source tree: \${importedFile}\`);
      failed = true;
      continue;
    }
    if (!importedFile.endsWith(expectedSuffix)) {
      console.error(\`  imported module is not a compiled \${expectedSuffix} extension: \${importedFile}\`);
      failed = true;
      continue;
    }

    console.log(\`  compiled extension: \${displayPath(importedFile)}\`);`,
          },
          {
            kind: 'paragraph',
            text: 'Each message carries its own bounded result. A busy Windows staging target records a locked payload path, and only the `staged Windows application payload` line marks replacement of `build/desktop-payloads/windows/Ludoxel.exe`. Rust native verification accepts a target after the installed artifact exists, the configured module imports from the repository source tree, and the imported file ends in the platform extension suffix. An ad-hoc verified macOS bundle records local signature integrity, while Developer ID signing and notarization remain outside the tool. Artifact descriptions derive from these individual results.',
          },
        ],
      },
      {
        id: 'reading-build-output-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`runWindowsBuild` and `runMacosBuild` construct Ludoxel-specific PyInstaller commands, require configured entry scripts and assets, call platform services, and clean tokenized work, spec, and staging paths. The emitted status lines describe those repository operations; code-signing law and license interpretation remain under their external or controlling legal texts.',
          },
          {
            kind: 'paragraph',
            text: 'Build output is admissible technical evidence only at the granularity at which the tool emitted it. A line about a command, a note, a failure, a staged artifact, or a published artifact cannot be promoted into a legal or release-status conclusion.',
          },
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Understanding the Windows Executable', 'Understanding the macOS Application Bundle', 'Running Package Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build Operation',
    group: 'Local Build Procedure',
    title: 'Running an Installer Build with Permission',
    description:
      'Defines the command surface of build_installer as a containment device layered above build_desktop_app: parsing and validation, task dispatch into per-platform staging and PyInstaller construction, payload delegation to the desktop build, manifest generation, and atomic publication into dist — and the refusal to read a passing installer check as release authority.',
    sections: [
      {
        id: 'running-an-installer-build-with-permission-authority-premise',
        title: 'Authority Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'Running the local installer build presupposes the same authority premise as running the desktop build: the operator already holds authority under the controlling License Text or a separate competent written permission, and a package script existing is not that authority. `tools/build_installer` is a second containment layer above `tools/build_desktop_app`, not a competing one. `parseInstallerBuildArgs`, `validateInstallerBuildArgs`, and `runInstallerBuildTask` narrow a terminal request into a configured platform task, staging sequence, and PyInstaller invocation, exactly as the desktop build tool does for the application payload it consumes.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'The installer build path records validation, dispatch, payload delegation, manifest generation, subprocess construction, staging, and publication. Permission to build, distribute, publish, mirror, or upload the installer or the Ludoxel application it embeds remains with the License Text and any later competent written instrument.',
            },
          },
        ],
      },
      {
        id: 'running-an-installer-build-with-permission-parse-validate',
        title: 'Parsing and Validation',
        content: [
          {
            kind: 'paragraph',
            text: '`parseInstallerBuildArgs` reads the command line, recognizing the `windows` and `macos` targets, the flags `--dry-run`, `--skip-payload-build`, `--skip-native-build`, `--keep-build-cache`, and `--check`, and a help-language selection; it records a conflict when two targets are declared and refuses unknown options and commands. `validateInstallerBuildArgs` then resolves the default target to `windows` when none is given and no help was requested, and rejects an unsupported language. The targets and diagnostic modes are reached through the package scripts:',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Installer build invocations from package.json.',
            code: `npm run build:installer:windows
npm run build:installer:windows:check
npm run build:installer:macos
npm run build:installer:macos:check
npm run build:installer:check`,
          },
        ],
      },
      {
        id: 'running-an-installer-build-with-permission-dispatch',
        title: 'Task Dispatch and Payload Delegation',
        content: [
          {
            kind: 'paragraph',
            text: '`runInstallerBuildTask` narrows a validated option set to a single platform-specific service execution, and `--check` short-circuits into the platform packaging-input check before any PyInstaller invocation runs.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'runInstallerBuildTask in service/task.service.mjs.',
            code: `export async function runInstallerBuildTask(options, context = {}) {
  if (options.command === 'windows') {
    if (options.check) {
      return checkWindowsInstallerInputs();
    }
    return runWindowsInstallerBuild({ ...options, env: context.env });
  }

  if (options.command === 'macos') {
    if (options.check) {
      return checkMacosInstallerInputs();
    }
    return runMacosInstallerBuild({ ...options, env: context.env });
  }

  console.error(\`Unknown installer build command: \${options.command}\`);
  return 2;
}`,
          },
          {
            kind: 'paragraph',
            text: [
              'Unless `--skip-payload-build` is given, `runWindowsInstallerBuild` and `runMacosInstallerBuild` first invoke `buildApplicationPayload`, which runs `tools/build_desktop_app`’s own Windows or macOS build as a subprocess. The installer build never constructs the application payload itself; ',
              { kind: 'link', label: 'Running a Desktop Build with Permission', href: '/docs/distribution/build-operation/local-build-procedure/running-a-desktop-build-with-permission' },
              ' owns that step, and a nonzero exit from it stops the installer build before any staging occurs. A dry run stops even earlier, printing that staging and the PyInstaller invocation are skipped.',
            ],
          },
        ],
      },
      {
        id: 'running-an-installer-build-with-permission-staging-and-manifest',
        title: 'Staging, Manifest Generation, and Publication',
        content: [
          {
            kind: 'paragraph',
            text: "After the payload build succeeds, the service stages installer inputs into `build/installer-staging/windows` or `build/installer-staging/macos`: the discovered application payload, the collected License Text and third-party materials, and a generated manifest recording schema version, application version, platform, architecture, payload file name, payload format, payload size, the payload SHA-256, and the License Text SHA-256. `buildWindowsInstallerPyinstallerCommand` generates a PyInstaller spec that embeds that staging directory directly in its `datas` list and collects the installer package’s own data through `collect_data_files('ludoxel_installer')`; `buildMacosInstallerPyinstallerCommand` instead constructs a command-line invocation that embeds the same staging directory through `--add-data` and `--collect-data ludoxel_installer`.",
          },
          {
            kind: 'paragraph',
            text: 'Publication differs by platform because the two build tools do not share one publish routine. On Windows, `atomicReplaceFile` stages the freshly built `ludoxel_installer.exe` beside the existing one under a pending name and renames it into place, retrying past transient locks, so a concurrent reader never observes a half-written installer. On macOS, `publishMacosInstaller` removes any existing published `.app`, copies the staged bundle in with `cp -R`, and `buildOptionalDmg` attempts an additional `.dmg` through `hdiutil`; a failed `.dmg` step is logged and does not fail the build, because the `.app` remains the primary artifact.',
          },
        ],
      },
      {
        id: 'running-an-installer-build-with-permission-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'A passing installer build or a passing `--check` establishes only that the named local steps completed: payload delegation succeeded, staging inputs were collected, the manifest was generated, PyInstaller exited zero, and the artifact was published to `dist/windows` or `dist/macos`. It does not establish that any party may distribute the installer, that the embedded payload is an official release, or that the third-party material it carries has been cleared. Those questions remain with the controlling License Text and separate release authority, exactly as they do for the application payload the installer embeds.',
          },
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Understanding the Windows Installer', 'Understanding the macOS Installer', 'Including License Text', 'Including Third Party License Text'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Verification',
    group: 'Package Inspection',
    title: 'Running Package Checks with Permission',
    description: 'Defines the repository verification surface as the decomposition of policy into named predicates with bounded evidentiary reach: the frozen check dispatch table, the package identity and script-surface contract, the legal and documentation predicates, and the suppression of green-check overreading.',
    sections: [
      {
        id: 'running-package-checks-with-permission-authority-premise',
        title: 'Authority Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'Running a repository check exercises local authority to inspect the working copy. Public permission remains with the governing legal source. The harness decomposes repository policy into named predicates and fixes the evidentiary reach of each passing result.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Package-adjacent checks from package.json.',
            code: `npm run package:check
npm run docs:check
npm run license:check
npm run check`,
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'A passing check is a repository signal bounded to one policy. Release approval, legal permission, package completeness, and later artifact retention each require their own controlling evidence.',
            },
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-dispatcher',
        title: 'The Named-Check Dispatcher',
        content: [
          {
            kind: 'paragraph',
            text: 'The harness is a closed dispatch table in `tools/check_project/src/service/check.service.mjs`. A check name supplied by a run script selects exactly one policy from the frozen `CHECKS` map. An unrecognized name terminates with exit code 2.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'The CHECKS table and runProjectCheck in check.service.mjs.',
            code: `const CHECKS = Object.freeze({
  package: checkPackage,
  docs: checkDocs,
  legal: checkLegal,
  resources: checkResources,
  shaders: checkShaders,
});

export async function runProjectCheck(checkName, options = {}) {
  const check = CHECKS[checkName];

  if (!check) {
    console.error(\`Unknown check: \${checkName}\`);
    return 2;
  }

  return check(options);
}`,
          },
          {
            kind: 'paragraph',
            text: 'Freezing the table converts repository verification into a finite set of named predicates, each with a fixed evidentiary reach. `npm run check` sequentially evaluates those predicates. Evidence attaches to the individual dispatch entry, and every broader claim requires evidence outside the harness.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-package-policy',
        title: 'The Package Policy',
        content: [
          {
            kind: 'paragraph',
            text: '`checkPackage` constrains package identity and the declared script surface to a fixed contract: the name `ludoxel`, the license identifier `LicenseRef-All-Rights-Reserved`, the presence of the expected Ludoxel scripts, the rejection of known obsolete or improper script terms, the existence of node-based script entry files, and the absence of a root `scripts` directory and the `future_ai_workbench` tooling directory.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'Identity and required-script verification in package.check.mjs.',
            code: `export function checkPackage() {
  const failures = [];
  const packageJson = readPackageJson();

  if (!packageJson) {
    return printCheckResult('package', ['package.json is missing']);
  }

  if (packageJson.name !== 'ludoxel') failures.push('package.json name must be ludoxel');
  if (packageJson.license !== 'LicenseRef-All-Rights-Reserved') failures.push('package.json license must be LicenseRef-All-Rights-Reserved');

  const scripts = packageJson.scripts || {};

  for (const scriptName of REQUIRED_PACKAGE_SCRIPTS) {
    if (!Object.hasOwn(scripts, scriptName)) {
      failures.push(\`package.json missing script: \${scriptName}\`);
    }
  }
`,
          },
          {
            kind: 'paragraph',
            text: 'A green `package:check` certifies that contract and nothing adjacent to it. It does not build the application, inspect `dist/windows` or `dist/macos`, run PyInstaller, adjudicate renderer parity, or decide whether a generated artifact may be distributed. It is a precondition for repository-to-artifact continuity — evidence that the tooling contract has not drifted — and is neither evidence of an artifact nor authority over one.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-legal-and-docs',
        title: 'Legal and Documentation Policies',
        content: [
          {
            kind: 'paragraph',
            text: 'The legal and documentation predicates each resolve the root `LICENSE` through their own path configuration and fail when that file is absent. Their passing output records the checked path.',
          },
          {
            kind: 'paragraph',
            text: 'A green legal or documentation check establishes root-license presence at check time. Package contents, copied legal material, public explanations, and distribution authority require their corresponding artifact and governing evidence.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-composite-reading',
        title: 'Composite Reading',
        content: [
          {
            kind: 'paragraph',
            text: 'Package readiness is composite solely in the engineering sense. `package:check`, `license:check`, `docs:check`, `resources:check`, `shader:check`, and the platform build checks each inspect a distinct layer and certify only that layer. A failure in any layer must be named by its layer, and a pass in one layer must not be spent to excuse missing evidence in another: the repository may pass `package:check` while macOS packaging prerequisites fail, the macOS packaging check may pass while a later PyInstaller run fails, and the PyInstaller run may succeed while a copied artifact later loses third-party material.',
          },
          {
            kind: 'paragraph',
            text: '`CHECKS` dispatches package, docs, legal, resources, and shader policies through `runProjectCheck`. Those predicates establish repository-to-artifact continuity for their named inputs. Continuous integration, legal review, release approval, third-party provenance, manual artifact inspection, and post-publication integrity retain their own evidence paths.',
          },
        ],
      },
    ],
    relatedTitles: ['Including License Text', 'Including Third Party License Text', 'Reading Build Output', 'Running Resource and Shader Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Verification',
    group: 'Package Inspection',
    title: 'Running Resource and Shader Checks with Permission',
    description:
      'Defines the resource and shader checks as preconditions of runtime package integrity, controlled by what they refuse as much as what they admit: the .gitignore, runtime-path, integrity-manifest, and asset-root invariants, and the shader version floor and ceiling and the vertex-index macro contract — with resource clearance and visual parity outside their reach.',
    sections: [
      {
        id: 'running-resource-and-shader-checks-with-permission-authority-premise',
        title: 'Authority Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'Running these checks presupposes local authority to inspect the working copy; they are not permission to redistribute resources, shaders, assets, or generated artifacts. They fix whether the repository still satisfies selected runtime and renderer invariants before an artifact is described as distribution-ready.',
          },
          {
            kind: 'paragraph',
            text: 'They are grouped because both are preconditions of runtime package integrity once code is frozen into an artifact. A resource failure surfaces as a missing runtime data root, a lost asset, or a broken persistence boundary; a shader failure surfaces as a renderer compilation problem or backend contract drift. Neither check decides legal material scope or third-party rights.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-resource-policy',
        title: 'The Resource Policy',
        content: [
          {
            kind: 'paragraph',
            text: '`checkResources` admits a repository only when `.gitignore` carries the generated and local exclusion terms, the runtime path module exists and names the expected keys, the persistence integrity manifest module exists, and the shared visual asset root resolver exists and covers the expected roots. The required terms are declared in `resources.policy.mjs`, and the check is reached through the package script.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Runtime-path, generated-material, and asset-root check from package.json.',
            code: `npm run resources:check`,
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'GENERATED_IGNORE_TERMS and REQUIRED_RUNTIME_PATH_TERMS in resources.policy.mjs.',
            code: `export const GENERATED_IGNORE_TERMS = Object.freeze(['node_modules/', 'dist/', 'build/', '__pycache__/', '.venv_ludoxel/', 'tools/export_directory_markdown/output/']);

export const REQUIRED_RUNTIME_PATH_TERMS = Object.freeze(['default_runtime_data_root', 'state_manifest.json', 'integrity_key.bin']);`,
          },
          {
            kind: 'paragraph',
            text: 'The predicate’s refusals are as load-bearing as its admissions. A `.gitignore` missing `dist/`, `build/`, or the export-output path fails because an un-ignored generated tree corrupts the source/output boundary required by a frozen package. The runtime path module must name `default_runtime_data_root`, `state_manifest.json`, and `integrity_key.bin`, and the asset resolver must cover the first-party `assets/ludoxel` root plus the computed fallback family with the block texture and thumbnail directories. The notes classify `assets/` as ignored pending provenance review, identify the previous-format `configs/` as outside the runtime write target, and record the export-tool output as generated and ignored.',
          },
          {
            kind: 'paragraph',
            text: 'The resource check is a precondition of runtime package integrity, not a provenance clearance. It confirms that the modules resolving the user data root, the integrity manifest, and the asset roots exist and name the expected keys; it certifies nothing about the rights status of the assets those modules resolve, and a passing result must not be read as clearing any material under `assets/`.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-shader-policy',
        title: 'The Shader Policy',
        content: [
          {
            kind: 'paragraph',
            text: '`checkShaders` scans the OpenGL shader root and the WGPU shader source root, filters by `.vert`, `.frag`, `.comp`, and `.glsl`, and validates each non-include file against a stage-aware contract through `checkShader`. The check is reached through the package script.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Renderer shader source-contract check from package.json.',
            code: `npm run shader:check`,
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'checkShader in shaders.check.mjs.',
            code: `function checkShader(path) {
  const failures = [];
  const text = readFileSync(path, 'utf8');
  const display = displayPath(path);
  const version = text.match(SHADER_VERSION_RE);
  const stage = shaderStage(path);

  if (stage !== 'include') {
    if (!version) {
      failures.push(\`\${display}: missing #version\`);
    } else if (Number(version[1]) > 430) {
      failures.push(\`\${display}: #version \${version[1]} exceeds Ludoxel renderer shader contract\`);
    } else if (Number(version[1]) < 140) {
      failures.push(\`\${display}: #version \${version[1]} is lower than the minimum accepted GLSL version for tool validation\`);
    }
  }

  if (stage === 'vertex' && RAW_VERTEX_ID_RE.test(text) && !text.includes('LUDOXEL_VERTEX_INDEX')) {
    failures.push(\`\${display}: use the LUDOXEL_VERTEX_INDEX compatibility macro instead of raw gl_VertexID\`);
  }

  return failures;
}`,
          },
          {
            kind: 'paragraph',
            text: '`checkShader` is a source-text predicate, and its evidentiary reach ends at the source text. A non-include shader is admitted when it declares a `#version` from 140 through 430; a declaration below the floor or above the ceiling is refused with the file and offending version named. A vertex shader that reaches for raw `gl_VertexID` without the `LUDOXEL_VERTEX_INDEX` macro is refused. Frame rendering, OpenGL/WGPU visual equivalence, and target-driver behavior require runtime evidence. A passing shader check establishes compliance with the version and macro contract.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-platform-effect',
        title: 'Platform Effect',
        content: [
          {
            kind: 'paragraph',
            text: 'The platform effect differs by target. Windows retains the OpenGL renderer path and packages the common data roots into a one-file executable; macOS uses the WGPU and Metal-oriented path and requires WGPU source, `rendercanvas`, the `wgpu_native` import, the cursor helper, fonts, and bundled resource locations to survive the bundle process. The resource and shader checks inform the platform-specific packaging checks; they do not replace them.',
          },
          {
            kind: 'paragraph',
            text: 'A resource check can pass while macOS still fails to bundle a font or the Timo skin in an accepted location, and a shader check can pass while a platform dependency is absent from the macOS build environment. A distribution statement must name the exact level it verified — repository resource invariants, the shader-source contract, platform packaging prerequisites, or final artifact inspection — because each is a separate layer of evidence and none stands in for another.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`checkResources` and `checkShaders` inspect configured runtime paths, ignored generated trees, shader version declarations, and the `LUDOXEL_VERTEX_INDEX` macro rule. Desktop packages carry those inputs into a frozen runtime context. Asset provenance, third-party texture licensing, thumbnail authority, visual parity, and renderer debugging remain separate technical or legal analyses.',
          },
          {
            kind: 'paragraph',
            text: 'The resource and shader checks are necessary technical evidence for package integrity, and their reach is bounded to what they inspect. They cannot be converted into a legal conclusion, a release approval, or a guarantee that every runtime path in every transferred artifact remains intact.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding the macOS Application Bundle', 'Understanding the Windows Executable', 'Reading Build Output', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Verification',
    group: 'Generated Assets',
    title: 'Generating Block Thumbnails',
    description: 'Documents the repository block-thumbnail generator as a package-script surface over the default block registry, the visual asset resolver, and the runtime thumbnail directory consumed by inventory and hotbar item photos.',
    sections: [
      {
        id: 'generating-block-thumbnails-command-surface',
        title: 'Command Surface and Tool Directory',
        content: [
          {
            kind: 'paragraph',
            text: 'The root package exposes the block-thumbnail tool through `assets:block-thumbnails:help`, `assets:block-thumbnails:generate`, and `assets:block-thumbnails:check`. Each script enters `tools/generate_block_thumbnails/scripts/run/`, which dispatches to the shared CLI service. The tool directory is `tools/generate_block_thumbnails`, and the package script surface resolves to that single directory.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'package.json',
            code: `    "assets:block-thumbnails:generate": "node ./tools/generate_block_thumbnails/scripts/run/generate.run.mjs",
    "assets:block-thumbnails:check": "node ./tools/generate_block_thumbnails/scripts/run/check.run.mjs",`,
          },
          {
            kind: 'paragraph',
            text: '`generate.service.mjs` and `check.service.mjs` both call `generateBlockThumbnails`; the Python interpreter comes from `PYTHON` when that environment variable is set, otherwise the service asks for `python3`. The Node layer supplies `PYTHONPATH` for `src`, then runs `tools/generate_block_thumbnails/src/service/render_thumbnail.py` with the selected mode.',
          },
        ],
      },
      {
        id: 'generating-block-thumbnails-selection-and-roots',
        title: 'Selection, Texture Root, and Output Root',
        content: [
          {
            kind: 'paragraph',
            text: 'The argument parser defaults `all` to true, so the generator selects every block from `create_default_registry()` unless the caller supplies a narrower block or category selection. `render_thumbnail.py` resolves the requested texture root to its `block` child and validates that every selected block texture can be resolved. The generated PNG path is the selected output root plus the block id basename.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Full-registry regeneration with the Ludoxel texture family.',
            code: `npm run assets:block-thumbnails:generate -- --all --texture-root assets/ludoxel/textures --output-root assets/ludoxel/thumbnails/blocks --allow-overwrite`,
          },
          {
            kind: 'paragraph',
            text: '`--allow-overwrite` is required when an output PNG already exists. Without that flag, generate mode reports each existing output as a validation failure. Check mode validates the same roots and selected blocks, reports the selected and existing counts, and exits before writing files. The Node parser reads `DEFAULT_PREVIEW_FIT_PADDING_PX` from `tools/generate_block_thumbnails/src/config/preview.config.mjs`; direct Python execution uses `DEFAULT_PREVIEW_FIT_PADDING_PX` from `src/ludoxel/presentation/rendering/faces/preview.py`, so both entry points keep the same transparent padding default.',
          },
        ],
      },
      {
        id: 'generating-block-thumbnails-rendering-contract',
        title: 'Preview Rendering Contract',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/presentation/rendering/faces/preview.py` projects the visible faces from `iter_visible_faces`, fits their projected alpha footprint into the `PREVIEW_CANVAS_SIZE` square canvas, and recenters the final visible alpha bounds after downsampling. Texture sampling treats `v=0` as the lower texture row, matching the runtime atlas preparation that mirrors block texture images before OpenGL and WGPU upload. `_project_faces` resolves each face texture through `resolve_oriented_texture_name`, so a pillar block rendered with a state that sets the `axis` property shows its top and side textures the same way the world renderer does; the projection carries no world coordinate, so it never calls the coordinate-driven variant or rotation resolution that world rendering layers on top of that same call, and a generated thumbnail or inventory icon always shows one texture per face regardless of where the block is later placed.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/faces/preview.py',
            code: `  x = int(round(uu * float(texture.width - 1)))
  y = int(round((1.0 - vv) * float(texture.height - 1)))`,
          },
          {
            kind: 'paragraph',
            text: '`render_thumbnail.py` supplies representative state before rendering. Slabs, stairs, and fence gates receive their ordinary inventory-facing state, fences receive same-block north and south neighbor context when no explicit neighbor is supplied, and walls receive `north=low`, `south=low`, `east=none`, `west=none`, and `up=true` so a center post and two straight arms are rendered from the wall model.',
          },
        ],
      },
      {
        id: 'generating-block-thumbnails-runtime-consumption',
        title: 'Runtime Consumption',
        content: [
          {
            kind: 'paragraph',
            text: '`write_block_preview_png` renders each selected block preview to a square RGBA PNG whose dimensions come from `PREVIEW_CANVAS_SIZE`. `ItemPhotoProvider.pixmap_for_item` later resolves the visual asset family through `resolve_visual_asset_roots`, checks the selected family thumbnail directory for `<block>.gif` and then `<block>.png`, and only then falls back to item textures. Inventory cells and hotbar slots consume the resulting pixmaps through that provider.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/common/item_photo_provider.py',
            code: `    gif_path = self._paths.thumbs_dir() / f"{name}.gif"
    if gif_path.exists():
      return self._ensure_movie_pixmap(str(bid), gif_path)

    p = self._paths.thumbs_dir() / f"{name}.png"
    if not p.exists():
      p = self._paths.item_dir() / f"{name}.png"`,
          },
          {
            kind: 'paragraph',
            text: 'The output directory belongs to repository-controlled generated assets. Runtime loading still follows the asset-family resolver, whose selected family depends on the required block textures present under `assets/ludoxel/textures/block` or the fallback family.',
          },
        ],
      },
    ],
    relatedTitles: ['Running Resource and Shader Checks with Permission', 'Separating Original Materials from Output', 'Using the Hotbar', 'Understanding Block Shapes', 'Understanding Block Face Texture Selection'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Release Language',
    group: 'Public Identification',
    title: 'Avoiding Unofficial Release Claims',
    description:
      'Controls release wording as artifact handling and treats false release language as a public-language defect: the build configuration’s artifact-name and publish-directory constants, the renderMacosStatus statement that codesigning and notarization are release work outside the tool, and the separation of artifact label from authority label.',
    sections: [
      {
        id: 'avoiding-unofficial-release-claims-identification-boundary',
        title: 'Identification Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'A release label attached to a technical artifact is itself an act of artifact handling, because the label travels with inferential force the artifact has not earned. A locally built executable, a locally built `.app` bundle, a preserved staging file, a CI artifact, a Vercel preview, a copied folder, a compressed archive, or a screenshot of a passing check is genuine evidence of technical activity and of nothing else. None of them establishes that the artifact is an official Ludoxel release or that any third party may circulate it.',
          },
          {
            kind: 'paragraph',
            text: 'A description that attaches release status to a locally generated artifact without separate release authority imposes a false authority claim on a technical output that the repository has not elevated into an official distribution; the defect lives in the public language, past any question of mere imprecision. When the available evidence is local generation or technical access, the admissible label is local, diagnostic, or unofficial, and the Distribution category governs that wording for that reason.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'Do not call a local build, preview deployment, copied artifact, preserved staging file, or check result an official release unless separate release authority and release-status evidence actually exist.',
            },
          },
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-tool-self-limitation',
        title: 'The Tool Limits Itself',
        content: [
          {
            kind: 'paragraph',
            text: 'The build tool does not claim to produce a release, and it records the limit in its own status text. `renderMacosStatus` in `macos-status.service.mjs` enumerates what the build path performs and then separates the release work it does not perform. The status text is reached with the status flag:',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'The macOS status text is printed by the build command with --status.',
            code: `npm run build:macos -- --status`,
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'Closing lines of renderMacosStatus in macos-status.service.mjs.',
            code: `    'Release work outside this tool:',
    '  - Codesigning and notarization.',
    '',
  ].join('\\n');`,
          },
          {
            kind: 'paragraph',
            text: '`renderMacosStatus` supplies the tool’s boundary statement. The macOS path performs ad-hoc signing and verification to establish local bundle integrity, then names Developer ID codesigning and notarization as release work outside the tool. The most complete local macOS build, with a verified ad-hoc signature, remains short of Apple-distributable status; ad-hoc verification and notarization arise from different service paths and authorities.',
          },
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-label-versus-authority',
        title: 'Artifact Label Versus Authority Label',
        content: [
          {
            kind: 'paragraph',
            text: [
              'The publish coordinates make the same separation concrete, and the layer that owns them has moved. `tools/build_desktop_app` no longer writes into `dist/`; it stages `Ludoxel.exe` and `Ludoxel.app` as application payloads under `build/desktop-payloads/`, which ',
              { kind: 'link', label: 'Running an Installer Build with Permission', href: '/docs/distribution/build-operation/local-build-procedure/running-an-installer-build-with-permission' },
              ' consumes. The public artifact is named `ludoxel_installer.exe` or `Ludoxel Installer.app` and is written under `dist/windows` or `dist/macos`, all declared constants in `tools/build_installer/src/config/build.config.mjs`.',
            ],
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'Installer artifact names and publish directories declared in build.config.mjs.',
            code: `export const WINDOWS_INSTALLER_APP_NAME = 'ludoxel_installer';
export const MACOS_INSTALLER_APP_NAME = 'Ludoxel Installer';
export const MACOS_INSTALLER_BUNDLE_IDENTIFIER = 'com.kentokonishi.ludoxel.installer';

export const WINDOWS_INSTALLER_PUBLISH_DIR = 'dist/windows';
export const MACOS_INSTALLER_PUBLISH_DIR = 'dist/macos';
export const WINDOWS_INSTALLER_ARTIFACT_NAME = \`\${WINDOWS_INSTALLER_APP_NAME}.exe\`;
export const MACOS_INSTALLER_ARTIFACT_NAME = \`\${MACOS_INSTALLER_APP_NAME}.app\`;
export const MACOS_INSTALLER_DMG_NAME = 'Ludoxel-Installer.dmg';`,
          },
          {
            kind: 'paragraph',
            text: 'The names `ludoxel_installer` and `Ludoxel Installer`, and the directory `dist`, are construction labels emitted by the build configuration; they carry no grant. A file named `ludoxel_installer.exe` in `dist/windows` is the deterministic output of `publishWindowsInstaller` in `tools/build_installer/src/service/windows-installer-build.service.mjs`, and the name states what the tool built, not who may distribute it. To present that file as a release is to launder an artifact label into an authority label — to assert that the repository elevated the output into an official distribution when the publication function did nothing of the kind. A description that names the technical source and refuses any surplus authority is the only admissible form.',
          },
          {
            kind: 'list',
            items: [
              'Admissible: a local Windows build, a local macOS bundle, a PyInstaller output, a package candidate, a staged application payload, a locally built installer, or a repository check result.',
              'Inadmissible: official release, authorized public download, redistribution-ready package, legally cleared build, approved mirror, endorsed upload, or final release artifact, when the only evidence is local build output or tool success.',
            ],
          },
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-evidence-required',
        title: 'Evidence Required for Stronger Claims',
        content: [
          {
            kind: 'paragraph',
            text: 'A stronger release claim requires evidence beyond an artifact path. At minimum it must be tied to the controlling release decision, the exact artifact or build identifier, the platform target, the included legal and third-party material, the relevant check results, and the public surface on which the release is intentionally presented. Absent any of those, the statement remains a local or candidate description.',
          },
          {
            kind: 'paragraph',
            text: 'The absence of evidence must not be patched with language such as appears to be official, would be acceptable, effectively released, probably cleared, or generated by the official repo. Distribution prose remains exact even when the exact answer is inconvenient: a package can be technically generated and still lack release status, and the technical fact does not supply the missing authority.',
          },
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`APP_NAME`, `WINDOWS_INSTALLER_PUBLISH_DIR`, `MACOS_INSTALLER_PUBLISH_DIR`, and the platform status renderers name local artifact outputs. Official release status, distribution licensing, and publication authority remain with the Licensor under the controlling License Text, which defines an ',
              { kind: 'link', label: 'Official Distribution', href: '/docs/legal/license-authority-and-materials/material-scope/understanding-distribution-materials' },
              '. Its scope is the narrower problem of not attaching false release language to a technical artifact.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Distribution documentation speaks with evidentiary restraint. A build artifact may be named, inspected, diagnosed, and compared against the expected package structure; it may not be promoted into an official or authorized release by rhetorical force, because rhetoric is not one of the evidentiary conditions the repository recognizes.',
          },
        ],
      },
    ],
    relatedTitles: ['Reading Build Output', 'Running Package Checks with Permission', 'Understanding Repository Visibility', 'Understanding Redistribution Restrictions'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Native and Runtime Materials',
    title: 'Building the Rust Terrain Extension',
    description: 'Defines the Rust terrain crate, its cargo build and artifact placement through build_native_extensions, the compiled-import verification that refuses the Python fallback, the fallback runtime boundary, and the desktop-package inclusion path.',
    sections: [
      {
        id: 'building-the-rust-terrain-extension-crate-and-contract',
        title: 'Crate Source and Shared Contract',
        content: [
          {
            kind: 'paragraph',
            text: 'The Rust terrain engine lives in the repository as `native/ludoxel_terrain`, a cargo crate whose `Cargo.toml` declares a `cdylib` built against PyO3 with the stable-ABI feature set. The crate is split by responsibility: `native/ludoxel_terrain/src/noise.rs` owns the deterministic hashing and value-noise sampling, `native/ludoxel_terrain/src/height.rs` owns the surface-height octaves, the ravine carving, and the generation-mode selectors, and `native/ludoxel_terrain/src/material.rs` owns the per-cell material and ore selection. `native/ludoxel_terrain/src/lib.rs` holds only the PyO3 binding surface: it exposes `surface_heights`, `terrain_materials`, and `native_build_info` as Python functions and names the module `_terrain_native`. The compiled artifact is imported as `ludoxel.simulation.worlds.generation._terrain_native`; the pure Python implementation of the same formulas is `ludoxel.simulation.worlds.generation.fallback` backed by `terrain_math.py`, and the import owner `native.py` selects between them at import time. Both implementations return the same bytes-level contract: `surface_heights` yields little-endian `int32` values in C order with shape `(nx, nz)`, and `terrain_materials` yields `uint8` material codes in C order with shape `(nx, ny, nz)`, where code zero is air and non-zero codes index the registered block ids in `materials.py`.',
          },
          {
            kind: 'paragraph',
            text: 'The crate is a bulk numerical engine and nothing else. It receives a seed, a generation version, a mode code, a flat ground level, and box coordinates, and it returns arrays; the meaning of a seed, the ownership of edit deltas, block-registry membership, persistence schemas, and renderer contracts remain with the Python simulation and application layers. The Rust source returns registered material codes only; when a code is outside the Python material table, the Python side raises, making registry mismatch a hard error and silent replacement unreachable.',
          },
        ],
      },
      {
        id: 'building-the-rust-terrain-extension-build-and-placement',
        title: 'Cargo Build and Artifact Placement',
        content: [
          {
            kind: 'paragraph',
            text: '`buildRustNativeExtensions` in `tools/build_native_extensions/src/service/rust.service.mjs` owns the build. It resolves a cargo executable from `CARGO`, the process path, or the per-user `.cargo/bin` directory, sets `PYO3_PYTHON` to the resolved project Python when unset, runs `cargo build --release --manifest-path` against the crate manifest, and copies the produced cdylib into the import location. On Windows the installed artifact is `src/ludoxel/simulation/worlds/generation/_terrain_native.pyd`; on other platforms the suffix is `.so`. A missing cargo executable, a missing crate manifest, a nonzero cargo exit, or a missing cdylib each terminates the build with a distinct error line, so the desktop preflight that runs this build stops before packaging with a distinct native-state failure.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'RUST_NATIVE_MODULES in tools/build_native_extensions/src/config/native.config.mjs.',
            code: `export const RUST_NATIVE_MODULES = Object.freeze([
  Object.freeze({
    id: 'terrain_native',
    crateDirectory: 'native/ludoxel_terrain',
    crateName: 'ludoxel_terrain',
    moduleName: 'ludoxel.simulation.worlds.generation._terrain_native',
    artifactStem: '_terrain_native',
    installDirectory: 'src/ludoxel/simulation/worlds/generation',
    fallbackModuleName: 'ludoxel.simulation.worlds.generation.fallback',
  }),
  Object.freeze({
    id: 'othello_native',
    crateDirectory: 'native/ludoxel_othello',
    crateName: 'ludoxel_othello',
    moduleName: 'ludoxel.simulation.spaces.othello.engines._othello_native',
    artifactStem: '_othello_native',
    installDirectory: 'src/ludoxel/simulation/spaces/othello/engines',
    fallbackModuleName: 'ludoxel.simulation.spaces.othello.engines.search',
  }),
  Object.freeze({
    id: 'mathematics_native',
    crateDirectory: 'native/ludoxel_mathematics',
    crateName: 'ludoxel_mathematics',
    moduleName: 'ludoxel.foundations.mathematics._mathematics_native',
    artifactStem: '_mathematics_native',
    installDirectory: 'src/ludoxel/foundations/mathematics',
    fallbackModuleName: 'ludoxel.foundations.mathematics.geometry.ray_aabb',
  }),
]);`,
          },
          {
            kind: 'paragraph',
            text: [
              'Each configured module record separates the crate directory, the compiled module name, the installed artifact stem, and the fallback module; the registry carries the terrain crate, the ',
              {
                kind: 'link',
                label: 'Othello engine crate',
                href: '/docs/distribution/runtime-inclusions/native-and-runtime-materials/building-the-rust-othello-engine-extension',
              },
              ', and the ',
              {
                kind: 'link',
                label: 'foundations-mathematics crate',
                href: '/docs/distribution/runtime-inclusions/native-and-runtime-materials/building-the-rust-mathematics-extension',
              },
              ', and the build and verification services iterate every entry. `rustCrateStates` derives from each record the manifest path, the built cdylib path under `target/release`, the installed artifact path, and a staleness flag comparing crate source modification times against the installed artifact. A stale artifact is reported with a rebuild instruction; the tool does not rebuild implicitly during verification, and application startup never runs cargo.',
            ],
          },
        ],
      },
      {
        id: 'building-the-rust-terrain-extension-verification',
        title: 'Import Verification Refuses the Fallback',
        content: [
          {
            kind: 'paragraph',
            text: '`verifyRustNativeExtensions` runs inside every `npm run build:native:check` invocation and inside the post-build verification of `npm run build:native`. It imports the compiled module name in a subprocess whose `PYTHONPATH` is pinned to the repository `src` tree, reads the imported module’s `__file__`, and accepts the target only when that file resolves under `src/ludoxel` and carries the platform’s compiled suffix. A missing artifact, an import that resolves outside the repository source tree, or an import that resolves to a Python source file each fails the check. The Python fallback therefore never passes this verification: it exists for runtime survival, and the check exists to prove that the compiled extension is the module the interpreter actually loads.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'The compiled-import gate in rust.service.mjs.',
            code: `    const importedFile = resolve(imported.file);
    if (!importedFile.startsWith(srcLudoxelRoot)) {
      console.error(\`  imported module resolves outside the repository source tree: \${importedFile}\`);
      failed = true;
      continue;
    }
    if (!importedFile.endsWith(expectedSuffix)) {
      console.error(\`  imported module is not a compiled \${expectedSuffix} extension: \${importedFile}\`);
      failed = true;
      continue;
    }`,
          },
          {
            kind: 'paragraph',
            text: 'A passing check proves exactly the inspected conditions: a compiled extension file exists at the configured location, the interpreter resolves the module name to that file, and the file has the compiled extension suffix under `src/ludoxel`. Numerical parity, packaging completeness, cross-platform support, and release permission require their own controlling sources: the parity contract in the terrain sources, the desktop packaging path, and the controlling License Text.',
          },
        ],
      },
      {
        id: 'building-the-rust-terrain-extension-runtime-and-package',
        title: 'Runtime Fallback and Package Inclusion',
        content: [
          {
            kind: 'paragraph',
            text: 'At runtime, `native.py` performs one guarded import of `_terrain_native` at module import time; that import is the entire startup native check, and no build, self-test, or bulk generation runs during application startup. When the compiled module is absent, `native_terrain_status` reports `fallback:python` and every bulk query routes to the pure Python implementation, so a source tree without a cargo toolchain still starts and generates terrain, only slower. When the compiled module is present, the same functions return the compiled results, and the two paths are held to identical outputs for identical inputs by the shared formula contract in `terrain_math.py` and the crate `noise.rs`, `height.rs`, and `material.rs` modules.',
          },
          {
            kind: 'paragraph',
            text: 'The desktop build reaches this target through the existing native preflight: `buildNativeExtensionsBeforeDesktop` runs `npm run build:native`, which now fails when the Rust build fails, and the PyInstaller command declares `ludoxel.simulation.worlds.generation._terrain_native` as a hidden import so the compiled extension is collected into the Windows executable and the macOS bundle. The wheel package data in `pyproject.toml` admits the installed `_terrain_native` artifact, and `MANIFEST.in` carries the crate source while pruning its `target` build output. A packaged application imports the bundled extension or, absent it, the bundled fallback; it never requires cargo, Node.js, or a source-tree rebuild at startup.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Native Extension Fallbacks', 'Building the Rust Othello Engine Extension', 'Building the Rust Mathematics Extension', 'Running a Desktop Build with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Native and Runtime Materials',
    title: 'Building the Rust Othello Engine Extension',
    description: 'Defines the Rust Othello search crate, the parity contract it shares with the pure Python engine, the per-cache native search session and its TimeoutError boundary, and the build, verification, and desktop-package inclusion path it shares with the terrain crate.',
    sections: [
      {
        id: 'building-the-rust-othello-engine-extension-crate-and-contract',
        title: 'Crate Source and Shared Contract',
        content: [
          {
            kind: 'paragraph',
            text: 'The Rust Othello engine lives in the repository as `native/ludoxel_othello`, a cargo crate whose `Cargo.toml` declares a `cdylib` built against PyO3 with the stable-ABI feature set, matching the terrain crate. The crate is split by responsibility: `native/ludoxel_othello/src/bitboard.rs` owns the board representation and move generation — the bitboard shifts and the legal-move and flip resolution; `native/ludoxel_othello/src/evaluation.rs` owns the positional, corner-closeness, frontier, mobility, corner, parity, and disc evaluation terms, the sacrifice-level weight profile, and the classic evaluation; and `native/ludoxel_othello/src/search.rs` owns move ordering, the negamax search, the exact endgame solver, and the transposition tables. `native/ludoxel_othello/src/lib.rs` holds only the PyO3 binding surface: it exposes `legal_moves_bitboard`, `apply_move_bits`, `evaluate_position`, `terminal_score`, `native_build_info`, and the `InsaneSearch` class, and names the module `_othello_native`. The compiled artifact is imported as `ludoxel.simulation.spaces.othello.engines._othello_native`; the pure Python implementation of the same search is owned by `search.py` with `bitboards.py`, `evaluation.py`, `ordering.py`, and `transposition.py`, and the import owner `src/ludoxel/simulation/spaces/othello/engines/native.py` selects between them at import time.',
          },
          {
            kind: 'paragraph',
            text: 'Parity is a value-level contract. Every rounded evaluation term uses round-ties-to-even because Python `round` does, position weights and ordering bonuses are the same constants, the transposition tables follow the same soft-limit clear-all policy derived from the hash level, and the exact-solver threshold of fourteen empties is shared. For identical positions, levels, and depths, bitboard primitives, evaluations, fixed-depth searches, and exact endgame solves return bit-identical values across the two implementations; searches under a wall-clock budget may truncate at different depths because elapsed time is not part of the contract.',
          },
        ],
      },
      {
        id: 'building-the-rust-othello-engine-extension-session-routing',
        title: 'The Native Session and Its Timeout Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'The search below each root move runs in one native session per `InsaneSearchCache`. `ensure_native_search` constructs an `InsaneSearch` pinned to the cache’s hash and sacrifice levels; a settings change through `prepare` discards the old session and constructs a new one on demand. `_root_move_evaluations` in `insane.py` passes each root child into the compiled `negamax` or `solve_exact` with the remaining wall-clock budget, reading the root ordering hint from `root_best_move`. The session owns its transposition tables in process memory and persists no table state; worker processes construct their own caches, so compiled objects remain process-local.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/engines/native.py',
            code: `def create_native_insane_search(*, hash_level: int, sacrifice_level: int):
  if _native_module is None:
    return None
  return _native_module.InsaneSearch(int(hash_level), int(sacrifice_level))`,
          },
          {
            kind: 'paragraph',
            text: 'The deadline boundary is the builtin `TimeoutError`. The compiled search converts its remaining budget into a monotonic deadline, checks it at every node entry exactly where the Python `check_deadline` does, releases the interpreter lock for the duration of the search, and raises `TimeoutError` on overrun, so `analyze_insane_position` truncates iterative deepening through the same exception path on both implementations. Match state, clocks, the opening and learning books, board persistence, and the presentation worker remain Python-owned; the crate receives two 64-bit bitboards and integer levels and returns scores.',
          },
        ],
      },
      {
        id: 'building-the-rust-othello-engine-extension-build-and-package',
        title: 'Build, Verification, and Package Inclusion',
        content: [
          {
            kind: 'paragraph',
            text: [
              'The crate is the second entry of `RUST_NATIVE_MODULES` in `tools/build_native_extensions/src/config/native.config.mjs`, so `npm run build:native` runs `cargo build --release` against its manifest and installs the cdylib as `_othello_native.pyd` or `.so` beside the engine sources, and `npm run build:native:check` applies the same compiled-import gate the ',
              {
                kind: 'link',
                label: 'terrain crate',
                href: '/docs/distribution/runtime-inclusions/native-and-runtime-materials/building-the-rust-terrain-extension',
              },
              ' passes through: the module must import from `src/ludoxel` with the platform’s compiled suffix, and the Python fallback never satisfies that check.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The desktop build declares `ludoxel.simulation.spaces.othello.engines._othello_native` as a PyInstaller hidden import on both platform paths, the wheel package data in `pyproject.toml` admits the installed artifact, and `MANIFEST.in` carries the crate source while pruning its `target` output. Application startup performs only the guarded import in `src/ludoxel/simulation/spaces/othello/engines/native.py`; a source tree without a cargo toolchain plays every Othello difficulty through the pure Python engine, and a passing build or check records the inspected compiled-import conditions without conferring release status on any artifact.',
          },
        ],
      },
    ],
    relatedTitles: ['Building the Rust Terrain Extension', 'Building the Rust Mathematics Extension', 'Understanding Native Extension Fallbacks', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Native and Runtime Materials',
    title: 'Building the Rust Mathematics Extension',
    description:
      'Defines the Rust foundations-mathematics crate that replaced the Cython build path and absorbed the former standalone frustum crate: its per-function byte contracts, the build and artifact placement it shares with the terrain and Othello crates, the compiled-import verification, and the desktop-package inclusion path.',
    sections: [
      {
        id: 'building-the-rust-mathematics-extension-crate-and-contract',
        title: 'Crate Source and Merged Contract',
        content: [
          {
            kind: 'paragraph',
            text: 'The Rust foundations-mathematics engine lives in the repository as `native/ludoxel_mathematics`, a cargo crate whose `Cargo.toml` declares a `cdylib` built against PyO3 0.29 with the stable-ABI feature set, matching the terrain and Othello crates. It replaces the former Cython build path for ray-AABB intersection, voxel DDA traversal, and view-angle conversion, and it absorbs the former standalone `native/ludoxel_frustum` crate: `chunks_intersect_clip_volume_batch`, the chunk-visibility batch test, is now one function among several this crate exposes rather than the sole reason for a separate crate. `native/ludoxel_mathematics/src/lib.rs` holds the PyO3 binding surface over five source modules — `ray_aabb.rs`, `dda.rs`, `view_angles.rs`, `frustum.rs`, and `mat4.rs` — and names its compiled module `_mathematics_native`, imported as `ludoxel.foundations.mathematics._mathematics_native`.',
          },
          {
            kind: 'code',
            language: 'toml',
            caption: 'native/ludoxel_mathematics/Cargo.toml',
            code: `[lib]
name = "ludoxel_mathematics"
crate-type = ["cdylib"]

[dependencies]
pyo3 = { version = "0.29", features = ["extension-module", "abi3-py311", "generate-import-lib"] }`,
          },
          {
            kind: 'paragraph',
            text: 'The crate does not port every function `foundations/mathematics` defines. Per-scalar numeric conversion, smoothing, and dynamic-typing coercion helpers stay Python-only because a PyO3 round trip per call would cost more than the pure-Python body it replaces; chunk-grid hashing and the single-AABB and single-vector helpers stay Python-only for the same reason, reachable instead through the batched entry points below where a caller needs volume. `ludoxel.foundations.mathematics._native` is the one loader every selector module imports: it resolves `_mathematics_native` once at import time inside a `try`/`except ImportError` block and exposes `native_mathematics_available`, `native_mathematics_module_file`, and `native_mathematics_status` so a caller can report which state a running session is in without importing the compiled module directly.',
          },
          {
            kind: 'paragraph',
            text: 'Four selector modules call through that loader and fall back to their matching pure-Python module when `native_module` is `None`: `geometry/native.py` wraps `ray_aabb_face` against the `geometry.ray_aabb` fallback, `voxels/native.py` wraps a batched `dda_grid_traverse_batch` against the `voxels.dda` fallback, `linear/native.py` wraps the view-angle conversions and every `mat4`/`transform_matrices` builder against those two fallback modules, and `frustums/native.py` wraps `chunks_intersect_clip_volume_batch` against `frustums.clip`, unchanged in contract from the crate `ludoxel_frustum` used to provide. Every caller across picking, player and AI movement, camera composition, the OpenGL and WGPU backends, and the HUD crosshair axis now imports from these four `.native` modules rather than importing a Cython-candidate or fallback module directly.',
          },
        ],
      },
      {
        id: 'building-the-rust-mathematics-extension-per-function-contracts',
        title: 'Per-Function Byte Contracts',
        content: [
          {
            kind: 'paragraph',
            text: '`ray_aabb_face` takes a ray origin and direction and an AABB min and max as twelve `f64` arguments and returns `Option<(f64, f64, f64, f64, i32)>` — entry `t`, hit point, and hit face — directly as a PyO3 tuple, matching `RayHitFace` in `geometry/ray_aabb.py` field for field. `dda_grid_traverse_batch` releases the GIL through `py.detach()` while it walks the full ray, then packs every traversed cell as one `<qqqdi>` record — three little-endian `int64` cell coordinates, one little-endian `float64` parametric `t`, one little-endian `int32` entered face — and returns the concatenated bytes; `voxels/native.py` unpacks each record with `struct.unpack_from` and yields a `DDAHit` per record, so a caller sees the same generator interface the pure-Python `dda_grid_traverse` returns.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The DDA batch record format in voxels/native.py.',
            code: `_RECORD_FORMAT = "<qqqdi"
_RECORD_SIZE = struct.calcsize(_RECORD_FORMAT)


def dda_grid_traverse(origin: Vec3, direction: Vec3, t_max: float, cell_size: float = 1.0) -> Iterator[DDAHit]:
  if native_module is None:
    yield from _fallback.dda_grid_traverse(origin, direction, t_max, cell_size)
    return

  raw = native_module.dda_grid_traverse_batch(origin.x, origin.y, origin.z, direction.x, direction.y, direction.z, float(t_max), float(cell_size))
  for offset in range(0, len(raw), _RECORD_SIZE):
    cell_x, cell_y, cell_z, t, enter_face = struct.unpack_from(_RECORD_FORMAT, raw, offset)`,
          },
          {
            kind: 'paragraph',
            text: '`chunks_intersect_clip_volume_batch` keeps the exact contract the former `ludoxel_frustum` crate defined: `keys_xyz`, little-endian `int64` bytes in C order with shape `(count, 3)`, one normalized chunk-grid key per row; `matrix`, sixteen little-endian `float32` bytes in C order forming a row-major 4x4 matrix; and `count`. It returns one `uint8` byte per input row, `1` where the chunk’s eight world-space corners intersect the clip volume and `0` where every corner lies outside the same single clip plane, and `frustums/native.py` reinterprets that buffer directly as `numpy.bool_` without an extra copy step. Every `mat4_*` function — `identity`, `perspective`, `ortho`, `look_dir`, `mul`, `translate`, `scale`, the three axis rotations, and `compose` — returns sixteen little-endian `float32` bytes in row-major order, and `linear/native.py`’s `_matrix_from_bytes` reshapes that buffer into the same `(4, 4)` float32 numpy layout the pure-Python `mat4.py` and `transform_matrices.py` already returned, so a caller cannot observe which implementation produced a given matrix from its shape or dtype alone.',
          },
        ],
      },
      {
        id: 'building-the-rust-mathematics-extension-build-and-placement',
        title: 'Cargo Build and Artifact Placement',
        content: [
          {
            kind: 'paragraph',
            text: 'The crate is the third entry of `RUST_NATIVE_MODULES` in `tools/build_native_extensions/src/config/native.config.mjs`, alongside the terrain and Othello crates.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'The mathematics entry in RUST_NATIVE_MODULES.',
            code: `  Object.freeze({
    id: 'mathematics_native',
    crateDirectory: 'native/ludoxel_mathematics',
    crateName: 'ludoxel_mathematics',
    moduleName: 'ludoxel.foundations.mathematics._mathematics_native',
    artifactStem: '_mathematics_native',
    installDirectory: 'src/ludoxel/foundations/mathematics',
    fallbackModuleName: 'ludoxel.foundations.mathematics.geometry.ray_aabb',
  }),`,
          },
          {
            kind: 'paragraph',
            text: [
              '`buildRustNativeExtensions` builds every entry the same way regardless of position in the array: it resolves cargo, runs `cargo build --release --manifest-path` against `native/ludoxel_mathematics/Cargo.toml`, and copies the produced cdylib to `src/ludoxel/foundations/mathematics/_mathematics_native.pyd` on Windows or the `.so` suffix elsewhere, matching the placement and failure handling the ',
              {
                kind: 'link',
                label: 'terrain crate',
                href: '/docs/distribution/runtime-inclusions/native-and-runtime-materials/building-the-rust-terrain-extension',
              },
              ' article describes in full. `npm run build:native` runs this build for all three crates in one invocation; `native/ludoxel_mathematics/target` is pruned from the source distribution by `MANIFEST.in`, and the former `native/ludoxel_frustum` directory and its `MANIFEST.in` prune entry no longer exist in the repository.',
            ],
          },
        ],
      },
      {
        id: 'building-the-rust-mathematics-extension-verification',
        title: 'Import Verification Refuses the Fallback',
        content: [
          {
            kind: 'paragraph',
            text: '`verifyRustNativeExtensions` applies the identical compiled-import gate to this crate that it applies to the terrain and Othello crates: it imports `ludoxel.foundations.mathematics._mathematics_native` in a subprocess pinned to the repository `src` tree, reads the imported module’s `__file__`, and accepts the target only when that file resolves under `src/ludoxel` and carries the platform’s compiled suffix. `npm run build:native:check` runs this gate for all three registered crates; a fallback-only source tree fails the mathematics entry exactly as it fails the other two, and the check names that specific failure in its output. This is the only native-extension verification path in the repository: `build_native_extensions` no longer carries a separate Cython candidate set, a compiled-suffix classifier, or a require-built policy distinct from this gate.',
          },
        ],
      },
      {
        id: 'building-the-rust-mathematics-extension-runtime-and-package',
        title: 'Runtime Fallback and Package Inclusion',
        content: [
          {
            kind: 'paragraph',
            text: 'At runtime, `_native.py` performs one guarded import of `_mathematics_native` at module import time; that import is the entire startup native check for this crate, and no build, self-test, or bulk computation runs during application startup. When the compiled module is absent, every one of the four selector modules routes to its pure-Python fallback, so a source tree without a Rust build still starts, picks blocks, moves players and AI actors, and renders frustum-culled chunks, only slower. `select_visible_chunks` in `src/ludoxel/presentation/rendering/visuals/selections/chunk.py` still imports `chunks_intersect_clip_volume_batch` from `frustums/native.py`, so both the world pass and the shadow pass reach the compiled extension, when it is present, on every drawn frame, exactly as they did when the function lived in `ludoxel_frustum`.',
          },
          {
            kind: 'paragraph',
            text: 'The desktop build declares `ludoxel.foundations.mathematics._mathematics_native` as a PyInstaller hidden import on both platform paths in `tools/build_desktop_app`, replacing the former `ludoxel.foundations.mathematics.frustums._frustum_native` entry. The wheel package data in `pyproject.toml` admits the installed `_mathematics_native` artifact in place of the removed `_frustum_native` entry, and `MANIFEST.in` carries the crate source while pruning its `target` output, mirroring the terrain and Othello inclusion paths exactly.',
          },
        ],
      },
    ],
    relatedTitles: ['Building the Rust Terrain Extension', 'Building the Rust Othello Engine Extension', 'Understanding Native Extension Fallbacks', 'Understanding Render Distance Fog and Shadows'],
  }),
];
