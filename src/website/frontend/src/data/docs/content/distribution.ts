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
      'Delimits the evidentiary conditions under which a Windows binary counts as the repository-produced Ludoxel artifact: the PyInstaller command builder, the host and entry gates, the publication function that institutes the staged/published distinction, lock handling, and the legal-material copy — and refuses to convert a published file into release authority.',
    sections: [
      {
        id: 'understanding-the-windows-executable-owner-files',
        title: 'Owner Files and Artifact Definition',
        content: [
          {
            kind: 'paragraph',
            text: '`dist/windows/Ludoxel.exe` is the publication coordinate written by the Windows path of `tools/build_desktop_app`. `src/config/build.config.mjs` fixes the path constants, `buildWindowsPyinstallerCommand` builds the PyInstaller invocation, `windows-build.service.mjs` stages and publishes the executable, and `legal-copy.service.mjs` copies the configured notice paths beside it. A file occupying that path gains repository build provenance only through that service sequence.',
          },
          {
            kind: 'paragraph',
            text: '`runWindowsBuild` enforces the sequence in `tools/build_desktop_app/src/service/windows-build.service.mjs`: host and entry-script gates run before optional native compilation, a random token separates the PyInstaller work, spec, and staging roots, `runProcess` executes the constructed command, and `publishWindowsExecutable` copies the staged executable only after a zero exit code. `EPERM`, `EBUSY`, and `EACCES` retain the staged executable when the published target is locked. That branch records a local publication failure without rewriting the staged build result.',
          },
          {
            kind: 'paragraph',
            text: 'The Windows artifact path begins outside the service at the package-script command surface, narrows through the desktop-build parser and dispatch path, and enters `runWindowsBuild` only after the platform task and validated options have been selected. `buildWindowsPyinstallerCommand` materializes the subprocess argument vector; the service assigns tokenized work, spec, and staging directories; `runProcess` returns the subprocess outcome; `publishWindowsExecutable` mutates `dist/windows` after successful staging; and `copyLegalMaterial` repeats the notice copy beside each retained artifact. Tool output can establish which local branch completed and which file path was written. The root `LICENSE` remains the independent source for circulation authority after the tool has finished its own construction work.',
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
            text: 'What a completed `Ludoxel.exe` certifies is deliberately narrow: that `publishWindowsExecutable` reached its success path on a Windows host. It certifies nothing about whether any party may distribute the file, whether the file is an official release, or whether the third-party material carried beside it has been cleared. The build path is not competent to confer any of those; they are reserved to the controlling License Text and to separate release authority.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'A completed `Ludoxel.exe` is an implementation result. The repository does not, by producing it, grant distribution permission, declare an official release, or clear third-party material; none of those follow from the file existing on disk.',
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
            text: "The spec fixes the one-file build under the application name `Ludoxel`. It declares the data roots `assets`, `src/ludoxel`, and `third-party` — each included only when present — appends `collect_data_files('ludoxel')`, places `src` on the import search path, points `hookspath` at the generated hook directory, names the bootstrap hidden imports `ludoxel.application.bootstrap` and `ludoxel.application.bootstrap.run`, sets the Windows icon when one resolves, and points the analysis at the entry script `src/ludoxel/__main__.py`. `LICENSE` is deliberately absent from the bundled data: the application does not read it at runtime, a root-level one-file data entry named `LICENSE` fails extraction by the bootloader, and the controlling text is retained beside the executable by the publish-time legal copy rather than packed into the bundle.",
          },
          {
            kind: 'paragraph',
            text: "The spec's `console` field fixes the console policy of the packaged executable. It is `False` by default, so the published `Ludoxel.exe` launches with no developer console or terminal log window; it is `True` only when the Windows build is invoked with `--developer-console`. A single ternary in the generator selects one value, so the spec never declares both, and the option is confined to the Windows one-file build — a console-bearing executable is an explicit opt-in, never the default artifact.",
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The generated OpenGL hook and post-Analysis DLL guard used by the Windows spec.',
            code: `from PyInstaller.compat import is_darwin, is_win
from PyInstaller.utils.hooks import collect_submodules

if is_win:
    hiddenimports = ['OpenGL.platform.win32']
elif is_darwin:
    hiddenimports = ['OpenGL.platform.darwin']
else:
    hiddenimports = ['OpenGL.platform.glx']

hiddenimports += collect_submodules('OpenGL.arrays')
datas = []
binaries = []


def _keep_pyinstaller_entry(dest):
    dest = str(dest)
    base = os.path.basename(dest).lower()
    if base in {'msvcr90.dll', 'msvcr100.dll'}:
        return False
    if os.path.basename(os.path.dirname(dest)).lower() == 'dlls' and 'opengl' in dest.lower():
        return False
    return True


a.binaries = [entry for entry in a.binaries if _keep_pyinstaller_entry(entry[0])]
a.datas = [entry for entry in a.datas if _keep_pyinstaller_entry(entry[0])]`,
          },
          {
            kind: 'paragraph',
            text: 'The generated hook keeps PyOpenGL platform and array hidden imports while setting hook `datas` and `binaries` empty, so the upstream `OpenGL/DLLS` GLUT and GLE runtime directory is absent before dependency analysis. Ludoxel drives windowing through Qt and uses only the OpenGL core, which loads the system `opengl32.dll`; the unused `OpenGL/DLLS` runtime has no load path in the application. The post-Analysis predicate still drops any cached `OpenGL/DLLS`, `MSVCR90.dll`, or `MSVCR100.dll` entry if one appears, leaving `OpenGL.GL`, `OpenGL.error`, and `OpenGL.platform` in the bundle. The Windows path adds none of the macOS `--collect-binaries wgpu`, `--collect-data wgpu`, or wgpu and rendercanvas imports, consistent with the repository statement that Windows retains the OpenGL renderer path.',
          },
          {
            kind: 'paragraph',
            text: 'The generated spec and local hook are the reviewable build specification. A reviewer reads them to confirm the one-file mode, the console policy, the declared data roots and hidden imports, the import search path, the OpenGL hook path, the DLL guard, and the entry script, and a dry run prints both without writing or building them. What the dry-run output proves is scoped to what it declares and filters, not to whatever a later inspection of the produced binary reveals.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-publication',
        title: 'Publication and Lock Handling',
        content: [
          {
            kind: 'paragraph',
            text: '`publishWindowsExecutable` institutes the distinction between a staged output and a published artifact, and it is the only writer permitted to touch the public-facing `dist/windows/Ludoxel.exe`. Before it writes, `removeObsoleteOnedir` deletes any stale `dist/windows/Ludoxel` one-directory tree, so an older directory package cannot coexist with the one-file executable and contaminate a later inspection. It then copies legal material into the staging directory, copies the staged executable to a temporary name in the publish directory and renames that file atomically over the published path, and copies legal material beside it. The rename is the publication step: it makes the replacement indivisible, so a concurrent launch reads either the previous executable or the complete new one, never a partially written archive that would fail at startup with a bootloader extraction error.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'publishWindowsExecutable in windows-build.service.mjs.',
            code: `function renamePublishedExecutable(pendingExe, publishExe) {
  const maxAttempts = 20;
  const retryDelayMs = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      renameSync(pendingExe, publishExe);
      return;
    } catch (error) {
      if (attempt < maxAttempts && isFileLockError(error)) {
        sleepMs(retryDelayMs);
        continue;
      }

      throw error;
    }
  }
}

function publishWindowsExecutable(stagingDir) {
  // ... staged/publish paths, the staged-output gate, and the legal copy ...
  const pendingExe = resolve(publishDir, \`\${APP_NAME}.exe.pending-\${randomUUID().replace(/-/g, '').slice(0, 12)}\`);

  try {
    copyFileSync(stagedExe, pendingExe);
    renamePublishedExecutable(pendingExe, publishExe);
    copyLegalMaterial(publishDir);
    console.log(\`[build_desktop_app] published Windows executable: \${publishExe}\`);
  } catch (error) {
    removeIfExists(pendingExe);

    if (isFileLockError(error)) {
      throw new Error(
        \`Could not publish \${publishExe}: the file is in use. Close any running \${APP_NAME}.exe (and any window previewing it), then run the build again.\`,
        { cause: error },
      );
    }

    throw error;
  }
}`,
          },
          {
            kind: 'paragraph',
            text: 'The function refuses two conditions in opposite registers. A missing staged executable throws, because there is no output to publish. A busy publish target raising `EPERM`, `EBUSY`, or `EACCES` is retried through `renamePublishedExecutable`, because antivirus or the shell can hold a freshly written executable for a moment; a target still locked after every retry — a genuinely running instance — raises a hard error rather than leaving the previous executable in place. A rebuild therefore cannot exit successfully while `dist/windows/Ludoxel.exe` still holds the prior build, so a stale executable can never be mistaken for the rebuilt one.',
          },
          {
            kind: 'paragraph',
            text: 'When the `published Windows executable` line is emitted, it certifies only that the copy, the retried rename, and the trailing legal copy completed. It does not establish that the binary launches on a clean host, that the package data is complete, or that anyone may circulate it. The legal copy inside the function keeps the controlling text adjacent to the executable; adjacency is retention, not authorization.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-inspection-order',
        title: 'Inspection Order',
        content: [
          {
            kind: 'paragraph',
            text: 'A Windows artifact is adjudicated from the command surface inward. Each fact comes from the layer that produced it.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              "Read the printed PyInstaller command, generated spec, and generated hook, and confirm one-file mode, the `console` policy (`False`, or `True` only under `--developer-console`), the declared data roots, the `collect_data_files('ludoxel')` collection, the bootstrap hidden imports, the OpenGL hook path, the DLL guard, and the entry script.",
              'Confirm the publication line. A `published Windows executable` line and a `published executable is locked` line are different outcomes and must never be conflated.',
              'Inspect `dist/windows` on disk for `Ludoxel.exe` and for the `LICENSE` and `third-party` material that `copyLegalMaterial` writes beside it.',
              'Read the repository checks as separate predicates, not as one release verdict.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'A dry run exercises only the first item: it prints the constructed command and the generated spec, then returns before host enforcement, native building, spec writing, and publication, producing no `dist/windows/Ludoxel.exe`.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'A Windows dry run prints the command without producing the executable.',
            code: `npm run build:windows -- --dry-run`,
          },
          {
            kind: 'paragraph',
            text: 'A completed executable that lacks the copied legal material is defective as a distribution artifact even when it launches locally, because the controlling text has been severed from the file it governs. The dry-run command and the real build answer different questions; an inspection that borrows a conclusion from one to characterize the other is invalid.',
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
              '`windows-build.service.mjs` creates a staged executable, checks its presence, copies the configured legal material, and then publishes `Ludoxel.exe` into `dist/windows`. Distribution permission, Official Distribution status, and third-party clearance remain fixed by their controlling legal sources. Whether the executable may be published as an official build is fixed by the controlling ',
              { kind: 'link', label: 'License Text', href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text' },
              ', not by the build tool, whose competence ends at what is constructed and where it is written.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The Windows path yields evidence, not authority. It identifies what the artifact is, which command produced it, which adjacent files must travel with it, and which output lines must be read before the artifact is described to anyone; it does not convert a successful local build into a permission.',
          },
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Reading Build Output', 'Including License Text', 'Understanding Distribution Materials'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Platform Packages',
    title: 'Understanding the macOS Application Bundle',
    description:
      'Delimits the threshold at which a directory becomes the repository-produced macOS .app artifact: the windowed PyInstaller command and its WGPU renderer envelope, Info.plist identity, ad-hoc codesign and verification, bounded bundled-resource tolerance, and the exclusion of Apple release work from the tool path.',
    sections: [
      {
        id: 'understanding-the-macos-application-bundle-owner-files',
        title: 'Owner Files and Bundle Definition',
        content: [
          {
            kind: 'paragraph',
            text: 'The macOS artifact threshold is not satisfied by a directory name. `Ludoxel.app` under `dist/macos` is the artifact only when the repository-defined bundle identity, executable payload, renderer envelope, required resources, copied legal material, and local signature verification all survive the publication path; anything short of that is an incomplete or unverified output, not a macOS release candidate. The owners are `buildMacosPyinstallerCommand` in `src/command/pyinstaller/build-command.pyinstaller.mjs`, the verification and publication path in `src/service/macos-build.service.mjs`, and the prerequisite inspector in `src/service/macos-status.service.mjs`.',
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
            text: 'Where the Windows artifact is a single file plus adjacent legal material, the macOS artifact is a container whose identity is distributed across `Contents/MacOS`, `Contents/Resources`, `Contents/Frameworks`, `Info.plist`, bundled resources, the Python shared-library link, copied legal material, and the final signature state. The evidentiary threshold is correspondingly higher: each of those must be present for the container to count as the artifact, and a directory carrying the name supplies none of them on its own.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-renderer-envelope',
        title: 'Renderer Runtime Envelope',
        content: [
          {
            kind: 'paragraph',
            text: 'The macOS command targets the WGPU and Metal-oriented route. `addMacosRendererBackendArgs` collects the `wgpu` native binaries and package data with `--collect-binaries wgpu` and `--collect-data wgpu`, and adds hidden imports for `wgpu.backends.wgpu_native`, `rendercanvas.qt`, `rendercanvas.pyqt6`, and `ludoxel.presentation.interface.input.macos_cursor`, so the wgpu-native Metal runtime and the rendercanvas Qt backend are bundled while optional wgpu submodules such as the imgui demo integration are left uncollected; `addMacosRequiredDataArgs` adds `assets`, `src`, and `third-party` as required data and asserts the default Alex skin, while `LICENSE` is retained beside the bundle by the publish-time legal copy rather than bundled as internal data. macOS packaging requires those inputs; their absence aborts the command.',
          },
          {
            kind: 'paragraph',
            text: '`checkMacosPackagingInputs` enforces the same envelope before a build runs, requiring the entry script, `package.json`, `pyproject.toml`, the bundled `assets` and `src` roots, the Alex skin, every legal-material path, every required font, and a fixed set of WGPU renderer sources, and confirming that `pyproject.toml` declares the Darwin-only `wgpu` and `rendercanvas` dependencies and a PyInstaller development dependency and that the command source still carries the `wgpu.backends.wgpu_native`, `rendercanvas.pyqt6`, and `macos_cursor` terms. The check establishes assembly of the repository-defined macOS renderer envelope. A build that omits it produces a different object from the repository specification.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'A macOS bundle that omits the WGPU and cursor-helper inclusions is materially incomplete regardless of the directory’s presence. The renderer path or gameplay mouse capture can be broken while `Ludoxel.app` appears to exist.',
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
        title: 'Resource Verification and Publication',
        content: [
          {
            kind: 'paragraph',
            text: '`verifyMacosAppBundle` refuses a bundle that exists but lacks required content: the `Contents/MacOS/Ludoxel` executable, the `Contents/Frameworks/Python` shared-library link, a `.icns` icon under `Contents/Resources`, the patched `Info.plist` fields, the default Alex skin, and each required font. Several of those are admitted under more than one container location, which `requireBundledResource` and `bundledAssetCandidates` encode.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'bundledAssetCandidates and requireBundledResource in macos-build.service.mjs.',
            code: `function bundledAssetCandidates(relativeAssetPath) {
  return Object.freeze([\`Contents/Frameworks/\${relativeAssetPath}\`, \`Contents/Resources/\${relativeAssetPath}\`]);
}

function requireBundledResource(appPath, label, relativePaths) {
  const matchedPath = relativePaths.find((relativePath) => bundledResourceExists(appPath, relativePath));

  if (!matchedPath) {
    throw new Error(\`macOS app bundle is missing \${label}. Checked: \${relativePaths.join(', ')}\`);
  }

  return matchedPath;
}`,
          },
          {
            kind: 'paragraph',
            text: 'The tolerance is bounded, not permissive. PyInstaller may deposit collected data under either `Contents/Frameworks` or `Contents/Resources`, so the verifier accepts either location for the Alex skin and the fonts, but `requireBundledResource` throws when none of the candidates holds the file. The check therefore survives a benign layout variation while still refusing a genuinely absent resource; to read the two-location allowance as optionality is to invert a presence requirement into a permission to omit.',
          },
          {
            kind: 'paragraph',
            text: '`publishMacosApp` is the final writer of `dist/macos`. It patches the plist, signs and verifies the staged bundle, removes any existing published bundle, copies the staged bundle in with symlinks preserved, then signs and verifies the published copy before copying legal material beside it. Copying a signed bundle can disturb its signature. The published artifact therefore receives a fresh signature and verification pass.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`publishMacosApp` in `tools/build_desktop_app/src/service/macos-build.service.mjs` patches `Info.plist`, signs and verifies the staged `.app`, copies it to the configured publish directory, signs and verifies the published copy, and copies legal material beside the bundle. The resulting local bundle has evidence of that service path. Notarization, distribution-channel preparation, and public release authority require their separate platform and legal sources.',
          },
          {
            kind: 'paragraph',
            text: 'The macOS artifact threshold is satisfied only when the repository-defined bundle identity, executable payload, renderer envelope, required resources, copied legal material, and local signature verification all survive the publication path. Anything short of that is an incomplete or unverified output, never a macOS release.',
          },
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Reading Build Output', 'Running Resource and Shader Checks with Permission', 'Understanding Distribution Materials'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Native and Runtime Materials',
    title: 'Understanding Native Extension Fallbacks',
    description:
      'Separates source availability, compiled acceleration, verification policy, and release permission in build_native_extensions and the foundations Python fallbacks: the configured candidates, compiled-suffix detection, the generated build payload, and the require-built gate — and refuses to read a native success as runtime superiority or distribution permission.',
    sections: [
      {
        id: 'understanding-native-extension-fallbacks-owner-files',
        title: 'Owner Files and Candidate Set',
        content: [
          {
            kind: 'paragraph',
            text: 'Native extension handling is fixed by `tools/build_native_extensions` against the Python sources under `src/ludoxel/foundations/mathematics`, and the candidate set and recognized compiled suffixes are declared in `tools/build_native_extensions/src/config/native.config.mjs`. Each candidate names a Python module whose source remains the reference implementation; a compiled binary, where it exists, is an acceleration of that module and not a distinct feature.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'NATIVE_EXTENSION_MODULES and COMPILED_EXTENSION_SUFFIXES in native.config.mjs.',
            code: `export const NATIVE_EXTENSION_MODULES = Object.freeze([
  Object.freeze({
    id: 'ray_aabb',
    moduleName: 'ludoxel.foundations.mathematics.geometry.ray_aabb',
    sourcePath: 'src/ludoxel/foundations/mathematics/geometry/ray_aabb.py',
  }),
  Object.freeze({
    id: 'voxel_dda',
    moduleName: 'ludoxel.foundations.mathematics.voxels.dda',
    sourcePath: 'src/ludoxel/foundations/mathematics/voxels/dda.py',
  }),
  Object.freeze({
    id: 'view_angles',
    moduleName: 'ludoxel.foundations.mathematics.linear.view_angles',
    sourcePath: 'src/ludoxel/foundations/mathematics/linear/view_angles.py',
  }),
]);

export const COMPILED_EXTENSION_SUFFIXES = Object.freeze(['.pyd', '.so', '.dylib']);`,
          },
          {
            kind: 'paragraph',
            text: 'There are exactly three candidates — ray and AABB intersection, voxel DDA traversal, and view-angle math — and the Python source for each is authoritative. The distribution question is never whether a compiled binary exists in the abstract but whether the produced artifact and its build log record the native state accurately. The presence or absence of a `.pyd`, `.so`, or `.dylib` alters runtime speed; it does not alter the project’s legal status, and a description must not let the former imply the latter.',
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-suffix-detection',
        title: 'Compiled-Suffix Detection',
        content: [
          {
            kind: 'paragraph',
            text: '`compiledBinariesForSource` in `src/collect/binary.collect.mjs` classifies a source as compiled or fallback-only. It derives the stem from the Python file name, lists the source directory, and admits only files whose extension is a recognized compiled suffix and whose base name begins with that stem.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'compiledBinariesForSource in binary.collect.mjs.',
            code: `export function compiledBinariesForSource(source) {
  const stem = basename(source.sourcePath, '.py');

  return listFiles(source.sourceDirectory).filter((path) => {
    const extension = extname(path);
    if (!COMPILED_EXTENSION_SUFFIXES.includes(extension)) return false;
    return basename(path).startsWith(stem);
  });
}`,
          },
          {
            kind: 'paragraph',
            text: 'A source is fallback-only exactly when this function returns an empty list: no file in the module directory carries both a recognized suffix and the shared stem. Directory contents supply the classification, giving every platform and session the same evidence source. A packaged artifact can execute the Python fallback when a description presumes a compiled module; the classifier prevents that unsupported native-acceleration claim.',
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-build-and-verify',
        title: 'Build Payload and Verification Gate',
        content: [
          {
            kind: 'paragraph',
            text: '`buildNativeExtensions` in `src/service/build.service.mjs` collects the sources, writes a generated Python build script and a JSON payload under `build/native-extension-scripts`, resolves a Python executable, runs the script, and then verifies with the require-built policy enabled unless verification was skipped. The generated script compiles the extensions in place through Cython and setuptools and instructs the operator to install the development dependencies when they are absent; the generated script root is always removed in a `finally` block, so no payload is left as a stale artifact. The two entry points are:',
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
            text: '`verifyNativeExtensions` prints each source, its module name, and the compiled files found, and elevates a missing-binary condition to a failure only under the require-built policy.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'The require-built gate in verify.service.mjs.',
            code: `if (options.requireBuilt && missingCompiled.length > 0) {
  console.error('Native extension verification failed because --require-built was specified.');

  for (const source of missingCompiled) {
    console.error(\`  - missing compiled extension for \${source.id}: \${source.moduleName}\`);
  }

  return 1;
}`,
          },
          {
            kind: 'paragraph',
            text: 'Without the require-built policy, the verifier records `compiled extension: none; Python fallback source exists.` for each fallback-only source and returns success because a fallback is a valid runtime state; with it, a single fallback-only candidate fails the entire verification. Four conditions move independently. Source availability belongs to the `.py` reference implementation. Compiled acceleration belongs to the module directory and requires `compiledBinariesForSource` to find a suffix-matched binary. Verification policy belongs to the run and is selected by `--require-built`. Release permission belongs to the controlling License Text. A fallback-only directory retains a working implementation, and a passing native build establishes neither runtime superiority nor distribution permission.',
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-package-effect',
        title: 'Effect on the Desktop Package',
        content: [
          {
            kind: 'paragraph',
            text: 'In the desktop build, `buildNativeExtensionsBeforeDesktop` runs the native build before PyInstaller packaging unless `--skip-native-build` or a dry run is in effect, and a nonzero native exit code stops the desktop build before packaging. The package effect is not a single bit: an artifact may run through the Python fallback with no compiled binary and still fail a require-built policy imposed for a particular distribution candidate, and it may satisfy native verification and still fail legal-material inclusion, shader validation, resource-root checks, or release-language constraints.',
          },
          {
            kind: 'paragraph',
            text: '`compiledBinariesForSource` in `tools/build_native_extensions/src/collect/binary.collect.mjs` classifies compiled state from suffix-matched files beside each Python source, while `verifyNativeExtensions` reports the Python fallback and applies `--require-built` only when requested. Build output establishes the selected technical state of that source. Distribution authority continues to arise from the controlling License Text.',
          },
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Reading Build Output', 'Running Package Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Legal Material Inclusion',
    title: 'Including License Text',
    description:
      'Defines legal-material inclusion as a retention requirement in build_desktop_app, not as permission: the configured material set, the copy service and its existence-guarded operation that turns omission into a recorded artifact defect, the Windows and macOS publish coordinates, and the repository legal check.',
    sections: [
      {
        id: 'including-license-text-owner-files',
        title: 'Owner Files and Retention Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'Including the License Text in a desktop artifact is a retention requirement, fixed by `LEGAL_MATERIAL_PATHS` in `src/config/build.config.mjs`, the copy service in `src/service/legal-copy.service.mjs`, and the existence-guarded helper `copyIfExists` in `src/shared/file/path.file.mjs`. The configured copy set is `LICENSE` and `third-party`. PyInstaller bundles `third-party` among its data arguments — optionally on Windows, as a required input on macOS — while `LICENSE` is retained for the artifact only by the publish-time copy, because the application does not read it at runtime and a root-level one-file `LICENSE` data entry fails extraction by the bootloader. The requirement keeps the controlling and attribution material physically adjacent to the artifact.',
          },
          {
            kind: 'paragraph',
            text: 'The reach of that retention is exactly one proposition: the controlling text travels physically with the artifact it governs. Distribution permission, official-release status, a recipient’s standing as an authorized distributor, and every reservation in the controlling text are fixed by the License Text, and the copy step reaches none of them — it places `LICENSE` and `third-party` beside the artifact and stops there. Severance of that material is an artifact defect, while its adjacency is retention, and retention is not authority.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'A package containing `LICENSE` may still be unauthorized; a package lacking `LICENSE` is defective even where a repository surface can be opened in a browser. Presence of the text and permission to distribute are independent and must not be inferred from one another.',
            },
          },
        ],
      },
      {
        id: 'including-license-text-copy-service',
        title: 'The Copy Service',
        content: [
          {
            kind: 'paragraph',
            text: '`copyLegalMaterial` writes the configured material into a single target directory. It iterates the fixed `LEGAL_MATERIAL_PATHS` list, mutates that directory, and logs each path as copied or skipped. The build record therefore identifies the material that reached the target.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'copyLegalMaterial in legal-copy.service.mjs.',
            code: `export function copyLegalMaterial(targetDir) {
  for (const relativePath of LEGAL_MATERIAL_PATHS) {
    const copied = copyIfExists(resolve(PROJECT_ROOT, relativePath), resolve(targetDir, relativePath));
    if (copied) {
      console.log(\`[build_desktop_app] copied legal material: \${relativePath}\`);
    } else {
      console.log(\`[build_desktop_app] legal material not found, skipped: \${relativePath}\`);
    }
  }
}`,
          },
          {
            kind: 'paragraph',
            text: 'It delegates the move to `copyIfExists`, which signals an absent source with `false` and leaves no fabricated target material.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'copyIfExists in path.file.mjs.',
            code: `export function copyIfExists(source, destination) {
  if (!existsSync(source)) return false;
  ensureDirectory(dirname(destination));
  cpSync(source, destination, { recursive: true, force: true });
  return true;
}`,
          },
          {
            kind: 'paragraph',
            text: 'Because the move is existence-guarded and returns a boolean, a missing `LICENSE` does not abort the build; it produces a recorded `skipped` line. The build record, not silence, is therefore the evidence that legal material was retained, and a `skipped` line is the precise point at which the artifact becomes defective. A reviewer who ignores those lines certifies a complete package while the build itself reported that the controlling text was never copied.',
          },
        ],
      },
      {
        id: 'including-license-text-publish-coordinates',
        title: 'Publish Coordinates',
        content: [
          {
            kind: 'paragraph',
            text: 'The copy executes in platform-specific coordinates, and the inspection target follows them. On Windows, `publishWindowsExecutable` calls the copy service for the staging directory and for `dist/windows`, so the target is the directory holding `Ludoxel.exe`. On macOS, `publishMacosApp` writes legal material into `dist/macos` after the bundle is published, and the macOS prerequisite check additionally treats each configured legal-material path as a required input before a build is accepted.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'For a Windows artifact, examine `dist/windows` for `LICENSE` and `third-party` beside `Ludoxel.exe`.',
              'For a macOS artifact, examine the `dist/macos` directory that contains `Ludoxel.app`, because the copy writes beside the bundle.',
              'After any later copy, compression, upload, or transfer, examine the transferred artifact again, because a downstream step can strip what the build correctly produced.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'An inspection that examines only the executable, or only the bundle internals, while ignoring the surrounding publish directory is incomplete. The legal material resides in the publish coordinate system, and presence must be confirmed there.',
          },
        ],
      },
      {
        id: 'including-license-text-check-reading',
        title: 'What the Legal Check Proves',
        content: [
          {
            kind: 'paragraph',
            text: 'The repository legal check reads the root `LICENSE`, requires the terms `Ludoxel Independent License`, `LicenseRef-All-Rights-Reserved`, and `third-party/`, requires `third-party/` to exist, checks the required third-party license file, and scans source-like files for the required SPDX identifier outside excluded asset, config, and third-party paths.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Repository legal-material and SPDX check from package.json.',
            code: `npm run license:check`,
          },
          {
            kind: 'paragraph',
            text: 'Its output is a statement about the repository at the moment of the check, not a forensic audit of any generated directory. A passing legal check supports only the proposition that the repository carries the required text and SPDX discipline; it does not establish that a previously copied artifact still contains the material, that a modified artifact retained it, or that a third party may circulate it. A failure must be read by its named cause — a missing root `LICENSE`, a missing SPDX header, a missing third-party license are distinct defects — because collapsing them into an undifferentiated statement that the package is not ready discards the evidence the check produced.',
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
              '`copyLegalMaterial` iterates `LEGAL_MATERIAL_PATHS` and calls `copyIfExists` for each target path, recording copied and skipped material. License grants, Original Materials, Distribution Materials, and repository visibility remain fixed by the controlling ',
              { kind: 'link', label: 'License Text', href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text' },
              ' and the Legal category. Its scope is operational: the required material, the service that copies it, the publish coordinates, the check that reads the repository, and the defects produced by omission.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The conclusion is unconditional. A distribution artifact must not be detached from its controlling legal material, and attachment to that material is still not permission to distribute the artifact.',
          },
        ],
      },
    ],
    relatedTitles: ['Including Third Party License Text', 'Running Package Checks with Permission', 'Understanding License Authority', 'Understanding Controlling Text'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Runtime Inclusions',
    group: 'Legal Material Inclusion',
    title: 'Including Third Party License Text',
    description:
      'Separates third-party notice retention from redistribution clearance, centered on the Kaisei Opti font: the legal policy constant, the required-terms checker, the macOS font requirements, and the refusal to read one verified notice as blanket provenance clearance.',
    sections: [
      {
        id: 'including-third-party-license-text-owner-files',
        title: 'Owner Files and Retention Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'Third-party license inclusion keeps the license texts of third-party material present in the repository and in any artifact that carries that material. It is fixed by the policy constants in `tools/check_project/src/check/legal/legal.policy.mjs`, the required-terms checker in `legal.check.mjs`, and the configured `third-party` path that `copyLegalMaterial` writes into each publish directory. The one third-party license the policy verifies in detail is the Kaisei Opti font notice.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'REQUIRED_THIRD_PARTY_LICENSES in legal.policy.mjs.',
            code: `export const REQUIRED_THIRD_PARTY_LICENSES = Object.freeze([
  Object.freeze({
    label: 'third-party/kaisei-opti/LICENSE.txt',
    path: LEGAL_PATHS.kaiseiLicense,
    terms: Object.freeze(['Kaisei', 'SIL Open Font License', 'Version 1.1']),
  }),
]);`,
          },
          {
            kind: 'paragraph',
            text: 'The policy’s reach stops at this one notice. It establishes that the Kaisei notice carries the expected identifying terms and nothing more, and it leaves the provenance of any Minecraft-derived texture, local asset, generated thumbnail, or provenance-sensitive material unsettled. One verified notice must not be inflated into a blanket clearance.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Third-party license inclusion is a notice-retention problem. It is not a provenance certificate for every asset that appears in the repository, a build output, or a rendered scene.',
            },
          },
        ],
      },
      {
        id: 'including-third-party-license-text-checker',
        title: 'The Required-Terms Checker',
        content: [
          {
            kind: 'paragraph',
            text: 'The `checkRequiredTerms` helper that validates the root `LICENSE` also validates the Kaisei notice. It accepts a label, a path, and a term set, fails on a missing file or a missing term, and reports the defect under the license label.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'checkRequiredTerms in legal.check.mjs.',
            code: `function checkRequiredTerms({ failures, label, path, terms }) {
  if (!existsSync(path)) {
    failures.push(\`\${label} is missing\`);
    return null;
  }

  const text = readFileSync(path, 'utf8');
  for (const term of terms) {
    if (!text.includes(term)) failures.push(\`\${label} missing term: \${term}\`);
  }

  return text;
}`,
          },
          {
            kind: 'paragraph',
            text: 'It is run as part of the repository legal check.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'The third-party notice is verified by the legal check.',
            code: `npm run license:check`,
          },
          {
            kind: 'paragraph',
            text: 'Its reach is exact. If `third-party/kaisei-opti/LICENSE.txt` is absent or lacks `Kaisei`, `SIL Open Font License`, or `Version 1.1`, the check reports the defect by the license label. The predicate confirms selected terms in a named notice. License interpretation and distribution authority remain with the controlling legal texts; a package process must retain this notice.',
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
            text: 'Because `third-party` is a configured legal-material path, `copyLegalMaterial` writes it into each publish directory, so the notice travels from the repository root into the artifact.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Confirm the notice exists at the repository root under `third-party/`.',
              'For a Windows artifact, confirm `third-party` is beside `Ludoxel.exe` after the legal-copy step.',
              'For a macOS artifact, confirm `third-party` is present in `dist/macos` after the bundle is published and verified.',
              'After any later copy, compression, or transfer, examine the transferred artifact again, because PyInstaller internal data collection and the surrounding legal-copy step are distinct operations and a downstream step can strip the directory.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Third-party license inclusion is therefore an end-to-end retention requirement, not a single build-time event. The repository can be correct and the build output can be correct, and a later packaging step can still strip the directory; only inspection of the transferred artifact confirms that retention survived.',
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
              '`third-party/kaisei-opti/LICENSE.txt` retains the SIL Open Font License text for Kaisei Opti. The artifact copy path preserves that notice; third-party redistribution terms and provenance-sensitive assets remain governed by their applicable legal sources. The full analysis of ',
              { kind: 'link', label: 'third-party material boundaries', href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-third-party-material-boundaries' },
              ' is fixed by the Data and Legal categories. Its scope is the operational retention of a named notice and the defects produced by omission.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The rule is narrow. If an artifact carries third-party material, the corresponding notice must remain attached in the artifact’s publish coordinates. Attachment is evidence of notice retention; it is not proof of general legal clearance.',
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
              content:
                'The build path records validation, dispatch, subprocess construction, staging, publication, and status. Permission to build, distribute, publish, mirror, or upload Ludoxel remains with the License Text and any later competent written instrument.',
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
            text: 'The two services impose different host gates, and the gates are why the target must be fixed before any artifact is discussed. `runWindowsBuild` requires a Windows host for a real build and checks the Windows entry script, though a Windows dry run forgoes the host requirement because it does not execute. `runMacosBuild` requires a macOS host and, before PyInstaller runs, the entry script, the default Alex skin, a macOS `.icns` icon candidate, and every required font asset. The hosts, renderer paths, and artifact forms differ; treating the two targets as one generic desktop build collapses three distinct containment boundaries at once.',
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
            code: `if (!options.skipNativeBuild && !options.dryRun) {
  const nativeExitCode = buildNativeExtensionsBeforeDesktop(options);

  if (nativeExitCode !== 0) {
    return nativeExitCode;
  }
}`,
          },
          {
            kind: 'paragraph',
            text: 'After the native phase, the service constructs tokenized PyInstaller work, spec, and staging roots under `build/`, prints the command, runs it with the resolved Python executable, publishes the artifact, and removes the tokenized roots unless `--keep-build-cache` is supplied. The order is the audit trail.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Validate the target, host, and required inputs.',
              'Build native extensions unless `--skip-native-build` or a dry run, and stop on a nonzero native result.',
              'Construct and print the PyInstaller command.',
              'Execute PyInstaller into tokenized staging roots under `build/`.',
              'Publish the artifact into `dist/windows` or `dist/macos` and copy legal material.',
              'Remove tokenized build roots unless `--keep-build-cache` is supplied.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The durable publish directories are `dist/windows` and `dist/macos`; the tokenized roots are implementation detail and part of the audit trail, not release locations. A staged artifact that survives a publication problem is not a published one, and the distinction must hold in any report.',
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
    description:
      'Defines the evidentiary granularity of build and check output and forbids the inference from a favorable line to a release conclusion: the printed PyInstaller command, the report function pass/note/failure hierarchy, native verification lines, and the platform publication results.',
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
            text: 'Three severities are encoded and may not be merged. A `name: passed` line establishes that the named check found no failures. A `note:` line is diagnostic context, not a failure — the resource check, for instance, notes that `assets/` exists and must stay ignored until provenance is reviewed, which is a non-clearance, not a defect. A `- failure` line is a specific, named defect. The text after the check name governs the reading, because each check owns its own evidence set and its own boundary; a note is never a failure, and one failure line is never a verdict on the repository.',
          },
        ],
      },
      {
        id: 'reading-build-output-publication-results',
        title: 'Publication and Verification Results',
        content: [
          {
            kind: 'paragraph',
            text: 'Windows and macOS report publication differently because the artifacts differ. Windows prints `published Windows executable` when `dist/windows/Ludoxel.exe` is replaced, and prints instead that the published executable is locked and the staged executable preserved when it is not. macOS prints a published app bundle only after Info.plist patching, ad-hoc signing, verification, copying, re-signing, re-verification, and legal-material copying. Native verification prints a line per source and an explicit fallback statement for any fallback-only source.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'Per-source output and the fallback statement in verify.service.mjs.',
            code: `console.log(\`native source: \${source.id}: \${source.moduleName} -> \${source.displayPath}\`);

if (source.binaries.length === 0) {
  console.log('  compiled extension: none; Python fallback source exists.');
  continue;
}`,
          },
          {
            kind: 'paragraph',
            text: 'Each message carries its own meaning and no more. A preserved staged Windows executable is diagnostic residue from a locked publish target, and only the `published Windows executable` line marks the replaced `dist/windows/Ludoxel.exe`. A `compiled extension: none` line records a valid fallback runtime state, which `verifyNativeExtensions` passes when `--require-built` is absent. An ad-hoc verified macOS bundle records local signature integrity, while Developer ID signing and notarization stay outside the tool by its own status text. A copied-legal-material line records retention in the publish coordinate. The description of the artifact is assembled from these specific facts, and drawing it from a single favorable line is the inference the granularity of the output exists to refuse.',
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
    subcategory: 'Verification',
    group: 'Package Inspection',
    title: 'Running Package Checks with Permission',
    description:
      'Defines the repository verification surface as the decomposition of policy into named predicates with bounded evidentiary reach: the frozen check dispatch table, the package identity and script-surface contract, the legal and documentation predicates, and the suppression of green-check overreading.',
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
              content:
                'A passing check is a repository signal bounded to one policy. It is not a release approval, not legal permission, not package completeness, and not evidence that a later copied artifact still contains every required file.',
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
            text: '`checkPackage` constrains package identity and the declared script surface to a fixed contract: the name `ludoxel`, the license identifier `LicenseRef-All-Rights-Reserved`, the presence of the expected Ludoxel scripts, the rejection of known obsolete or improper script terms, the existence of node-based script entry files, and the absence of a root `scripts/` directory and the `future_ai_workbench` tooling directory.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'Identity and required-script verification in package.check.mjs.',
            code: `if (packageJson.name !== 'ludoxel') failures.push('package.json name must be ludoxel');
if (packageJson.license !== 'LicenseRef-All-Rights-Reserved') failures.push('package.json license must be LicenseRef-All-Rights-Reserved');

const scripts = packageJson.scripts || {};

for (const scriptName of REQUIRED_PACKAGE_SCRIPTS) {
  if (!Object.hasOwn(scripts, scriptName)) {
    failures.push(\`package.json missing script: \${scriptName}\`);
  }
}`,
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
            text: 'The legal predicate verifies the root License Text terms, the `third-party` root, the required third-party license text, and SPDX headers on source-like files outside excluded paths; the documentation predicate verifies that `README.md` exists and carries the required Ludoxel legal-information terms. Both are narrower than the documents they touch: they confirm that required terms and markers are present, and they neither interpret the full legal text nor certify that any public explanation is complete.',
          },
          {
            kind: 'paragraph',
            text: 'These two predicates are the most frequently over-read signals in the surface. A green legal or documentation check certifies the inspected terms and markers and no further proposition. It leaves the meaning of the License Text to the Legal category, the completeness of any public explanation unjudged, and redistribution authority to the controlling text. The implication runs one direction only. A repository that fails these predicates yields a package that must be treated as suspect before the platform artifact is examined; a repository that passes them has established nothing about whether a later archive, installer, upload, or copied directory retained the material.',
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
            text: 'The predicate’s refusals are as load-bearing as its admissions. A `.gitignore` missing `dist/`, `build/`, or the export-output path fails because an un-ignored generated tree corrupts the source/output boundary required by a frozen package. The runtime path module must name `default_runtime_data_root`, `state_manifest.json`, and `integrity_key.bin`, and the asset resolver must cover the `assets/ludoxel` and `assets/minecraft` roots with the block texture and thumbnail directories. The notes classify `assets/` as ignored pending provenance review, identify the previous-format `configs/` as outside the runtime write target, and record the export-tool output as generated and ignored.',
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
            text: 'A resource check can pass while macOS still fails to bundle a font or the Alex skin in an accepted location, and a shader check can pass while a platform dependency is absent from the macOS build environment. A distribution statement must name the exact level it verified — repository resource invariants, the shader-source contract, platform packaging prerequisites, or final artifact inspection — because each is a separate layer of evidence and none stands in for another.',
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
              content:
                'Do not call a local build, preview deployment, copied artifact, preserved staging file, or check result an official release unless separate release authority and release-status evidence actually exist.',
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
            text: 'The publish coordinates make the same separation concrete. The artifact is named `Ludoxel.exe` or `Ludoxel.app` and is written under `dist/windows` or `dist/macos`, all declared constants in the build configuration.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'Artifact name and publish directories declared in build.config.mjs.',
            code: `export const APP_NAME = 'Ludoxel';
export const WINDOWS_PUBLISH_DIR = 'dist/windows';
export const MACOS_PUBLISH_DIR = 'dist/macos';`,
          },
          {
            kind: 'paragraph',
            text: 'The name `Ludoxel` and the directory `dist` are construction labels emitted by the build configuration; they carry no grant. A file named `Ludoxel.exe` in `dist/windows` is the deterministic output of `publishWindowsExecutable`, and the name states what the tool built, not who may distribute it. To present that file as a release is to launder an artifact label into an authority label — to assert that the repository elevated the output into an official distribution when the publication function did nothing of the kind. A description that names the technical source and refuses any surplus authority is the only admissible form.',
          },
          {
            kind: 'list',
            items: [
              'Admissible: a local Windows build, a local macOS bundle, a PyInstaller output, a package candidate, a staged executable preserved after a locked publish target, or a repository check result.',
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
              '`APP_NAME`, `WINDOWS_PUBLISH_DIR`, `MACOS_PUBLISH_DIR`, and the platform status renderers name local artifact outputs. Official release status, distribution licensing, and publication authority remain with the Licensor under the controlling License Text, which defines an ',
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
];
