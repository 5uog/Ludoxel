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
      'Treats the Windows one-file executable as the product of the build_desktop_app Windows path — the PyInstaller command builder, the host and entry gates, the publication function with its lock handling, and the legal-material copy — and keeps artifact construction separate from release authority.',
    sections: [
      {
        id: 'understanding-the-windows-executable-owner-files',
        title: 'Owner Files and Artifact Definition',
        content: [
          {
            kind: 'paragraph',
            text: 'The Windows desktop artifact is the one-file executable published as `dist/windows/Ludoxel.exe`. A binary with that name is not the same thing as the artifact. The artifact is whatever the Windows path of `tools/build_desktop_app` actually produces: the constants in `src/config/build.config.mjs`, the command builder `buildWindowsPyinstallerCommand` in `src/command/pyinstaller/build-command.pyinstaller.mjs`, the publication logic in `src/service/windows-build.service.mjs`, and the legal-material copy in `src/service/legal-copy.service.mjs`. A file that cannot be traced back to those four owners is a loose executable, not a recognized Ludoxel Windows distribution artifact.',
          },
          {
            kind: 'paragraph',
            text: 'The two entry points that produce it are the following, and both feed the same Windows service.',
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
            text: 'What a finished `Ludoxel.exe` proves is deliberately small. It proves that the publication function reached its success path on a Windows host. It does not prove that any party may distribute the file, that the file is an official release, or that the third-party material carried inside it has been cleared. Those are decided by the controlling License Text and by separate release authority, never by the mere existence of the executable.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'A produced `Ludoxel.exe` is an implementation result. It is not a release, not a permission, and not a third-party clearance. None of those follow from the file being on disk.',
            },
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-command-construction',
        title: 'PyInstaller Command Construction',
        content: [
          {
            kind: 'paragraph',
            text: '`buildWindowsPyinstallerCommand` turns the abstract instruction to package into one deterministic argument vector. It runs PyInstaller in `--onefile` mode under the application name `Ludoxel`, points `--distpath`, `--workpath`, and `--specpath` at tokenized roots, adds `src` to the import search path, and collects package data with `--collect-data ludoxel`. It then appends the application bootstrap hidden imports and the common data roots before the entry script `src/ludoxel/__main__.py`.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'addCommonOptionalDataArgs and addApplicationBootstrapHiddenImports in build-command.pyinstaller.mjs.',
            code: `function addCommonOptionalDataArgs(args, targetPlatform = process.platform) {
  addOptionalDataArg(args, 'assets', 'assets', targetPlatform);
  addOptionalDataArg(args, 'src', 'src', targetPlatform);
  addOptionalDataArg(args, 'LICENSE', 'LICENSE', targetPlatform);
  addOptionalDataArg(args, 'third-party', 'third-party', targetPlatform);
}

function addApplicationBootstrapHiddenImports(args) {
  args.push('--hidden-import', 'ludoxel.application.bootstrap');
  args.push('--hidden-import', 'ludoxel.application.bootstrap.run');
}`,
          },
          {
            kind: 'paragraph',
            text: 'Two details in this excerpt decide what the Windows executable actually contains. The data roots `assets`, `src`, `LICENSE`, and `third-party` are added through `addOptionalDataArg`, which silently skips any root that is absent; on Windows their absence does not abort the command, so a build can complete while quietly missing one of them. And the renderer backend is not collected here at all: `addRendererBackendArgs` returns immediately unless the target is `darwin`, so the Windows executable carries the OpenGL renderer path and never bundles `wgpu` or `rendercanvas`. A description that merges the Windows and macOS commands into one generic "the build packages the app" erases this divergence and misstates the contents of the file.',
          },
          {
            kind: 'paragraph',
            text: 'Because the command is built from named constants and an explicit data list, the executable is reconstructible and its inputs are auditable. That is the whole value of constructing the command instead of writing a spec file by hand: a reviewer can read the printed command and know whether the executable is the OpenGL-path Ludoxel build with its package data, rather than guessing from a binary that merely shares the name.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-publication',
        title: 'Publication and Lock Handling',
        content: [
          {
            kind: 'paragraph',
            text: 'After PyInstaller succeeds, the only function permitted to write the public-facing `dist/windows/Ludoxel.exe` is `publishWindowsExecutable`. Before it writes, `removeObsoleteOnedir` deletes any stale `dist/windows/Ludoxel` one-directory output, so an older directory package cannot sit beside the one-file executable and confuse a later inspection. The function then copies legal material into the staging directory, replaces the published executable, and copies legal material beside it.',
          },
          {
            kind: 'code',
            language: 'js',
            caption: 'publishWindowsExecutable in windows-build.service.mjs.',
            code: `function publishWindowsExecutable(stagingDir) {
  const stagedExe = resolve(stagingDir, \`\${APP_NAME}.exe\`);
  const publishDir = resolve(PROJECT_ROOT, WINDOWS_PUBLISH_DIR);
  const publishExe = resolve(publishDir, \`\${APP_NAME}.exe\`);

  if (!existsSync(stagedExe)) {
    throw new Error(\`PyInstaller did not produce staged executable: \${stagedExe}\`);
  }

  ensureDirectory(publishDir);
  copyLegalMaterial(stagingDir);

  try {
    if (existsSync(publishExe)) {
      unlinkSync(publishExe);
    }

    copyFileSync(stagedExe, publishExe);
    copyLegalMaterial(publishDir);
    console.log(\`[build_desktop_app] published Windows executable: \${publishExe}\`);
  } catch (error) {
    if (error?.code === 'EPERM' || error?.code === 'EBUSY' || error?.code === 'EACCES') {
      console.log(\`[build_desktop_app] published executable is locked; staged executable preserved: \${stagedExe}\`);
      return;
    }

    throw error;
  }
}`,
          },
          {
            kind: 'paragraph',
            text: 'The function refuses two situations in opposite ways. A missing staged executable throws, because there is nothing to publish. A locked publish target raising `EPERM`, `EBUSY`, or `EACCES` is treated as a recoverable condition: the staged executable is left in place and the log records that the published target was not replaced. That second branch is the one most often misread. The preserved staging file is a diagnostic remnant, not a published artifact, and treating the locked branch as a successful publication describes a public-facing file in `dist/windows` that was never actually written.',
          },
          {
            kind: 'paragraph',
            text: 'When the success line `published Windows executable` does appear, it means only that `copyFileSync` and the following legal copy completed. It says nothing about whether the binary launches on a clean host, whether the package data is complete, or whether anyone may circulate it. The legal copy inside this function keeps the controlling text next to the executable; keeping it there is not the same as being permitted to ship it.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-inspection-order',
        title: 'Inspection Order',
        content: [
          {
            kind: 'paragraph',
            text: 'A Windows artifact is read from the command surface inward, so that each fact is taken from the layer that produced it rather than inferred from the file alone.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Read the printed PyInstaller command and confirm `--onefile`, the application name, the tokenized roots, `--collect-data ludoxel`, the bootstrap hidden imports, and the entry script.',
              'Confirm the publication line. A `published Windows executable` line and a `published executable is locked` line are different outcomes and must never be conflated.',
              'Inspect `dist/windows` on disk for `Ludoxel.exe` and for the `LICENSE` and `third-party` material that `copyLegalMaterial` writes beside it.',
              'Read the repository checks as separate signals, not as one release verdict.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'A dry run exercises only the first step. It prints the constructed command and returns before host enforcement, native building, and publication, so it produces no `dist/windows/Ludoxel.exe` at all.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'A Windows dry run prints the command without producing the executable.',
            code: `npm run build:windows -- --dry-run`,
          },
          {
            kind: 'paragraph',
            text: 'A completed executable that lacks the copied legal material is still defective as a distribution artifact even if it launches locally, because the controlling text has been severed from the file it governs. The dry-run command and the real build therefore answer different questions, and the inspection must not borrow a conclusion from one to describe the other.',
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
              'This article fixes how to recognize and inspect the Windows executable. It does not grant permission to distribute it, does not declare it an official release, and does not clear the third-party material inside it. Whether the executable may be published as an official build is settled by the controlling ',
              { kind: 'link', label: 'License Text', href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text' },
              ', not by the build tool, which decides only what is constructed and where it is written.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The use of the Windows path is therefore evidentiary. It tells a reviewer what the artifact is, which command produced it, which surrounding files must travel with it, and which output lines must be read before the artifact is described to anyone. It never turns a successful local build into authorization.',
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
      'Treats the macOS .app bundle as the product of the build_desktop_app macOS path: the windowed PyInstaller command and its WGPU renderer inclusions, Info.plist patching, ad-hoc codesign and verification, bundled-resource tolerance, and the line between local construction and Apple release work.',
    sections: [
      {
        id: 'understanding-the-macos-application-bundle-owner-files',
        title: 'Owner Files and Bundle Definition',
        content: [
          {
            kind: 'paragraph',
            text: 'The macOS desktop artifact is a `Ludoxel.app` bundle published under `dist/macos`. It is owned by `buildMacosPyinstallerCommand` in `src/command/pyinstaller/build-command.pyinstaller.mjs`, by the verification and publication path in `src/service/macos-build.service.mjs`, and by the prerequisite inspector in `src/service/macos-status.service.mjs`. Unlike the Windows one-file executable, a bundle is a directory whose identity is spread across `Contents/MacOS`, `Contents/Resources`, `Contents/Frameworks`, `Info.plist`, bundled resources, the Python shared-library link, copied legal material, and the final signature state.',
          },
          {
            kind: 'paragraph',
            text: 'The macOS path exposes a build command and a prerequisite check, which answer different questions before any artifact exists.',
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
            text: 'Because the identity is spread across the container, a bare directory named `Ludoxel.app` is not yet the artifact. The macOS bundle counts as coherent only when its executable, renderer-runtime envelope, identity metadata, icon, resource locations, signature, and copied legal material are all present. That is a stricter standard than the Windows case, where a single file plus its neighboring legal material is the whole object.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-renderer-envelope',
        title: 'Renderer Runtime Envelope',
        content: [
          {
            kind: 'paragraph',
            text: 'The macOS command is built for the WGPU and Metal-oriented renderer route, not the OpenGL path. `addMacosRendererBackendArgs` collects `wgpu` and `rendercanvas` and adds hidden imports for `wgpu.backends.wgpu_native`, `rendercanvas.qt`, `rendercanvas.pyqt6`, and `ludoxel.presentation.interface.input.macos_cursor`. `addMacosRequiredDataArgs` adds `assets`, `src`, `LICENSE`, and `third-party` as required data and asserts the default Alex skin exists. On macOS these are required inputs, not optional ones, so their absence aborts the command instead of yielding a quietly incomplete bundle.',
          },
          {
            kind: 'paragraph',
            text: 'The prerequisite inspector enforces the same envelope before a build runs. `checkMacosPackagingInputs` requires the entry script, `package.json`, `pyproject.toml`, the bundled `assets` and `src` roots, the Alex skin, every legal-material path, every required font, and a specific set of WGPU renderer source files. It also confirms that `pyproject.toml` declares the Darwin-only `wgpu` and `rendercanvas` dependencies and a PyInstaller development dependency, and that the PyInstaller command source still contains the `wgpu.backends.wgpu_native`, `rendercanvas.pyqt6`, and `macos_cursor` terms. The fact worth documenting is not that PyInstaller ran; it is that a known renderer envelope was assembled for the path Ludoxel uses on macOS.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'A macOS bundle that exists but omits the WGPU and cursor-helper inclusions is materially incomplete. The renderer path or gameplay mouse capture can be broken while the `.app` directory looks present.',
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
            text: '`patchMacosInfoPlist` rewrites the bundle name, display name, the bundle identifier `com.kentokonishi.ludoxel`, the executable name, the short and bundle versions, the icon file, and the input-monitoring usage description so they match the Ludoxel package identity. `requireMacosInfoPlist` then verifies those fields and rejects a bundle whose `Info.plist` lacks any required pair, a `.icns` icon entry, or the `NSInputMonitoringUsageDescription` string that gameplay input capture depends on. These fields are the identity that macOS, diagnostic tools, and release operators read when deciding whether a directory is the intended application.',
          },
          {
            kind: 'paragraph',
            text: 'Signing is handed to the system `codesign` binary through one helper, and verification is a hard gate that stops the build on any nonzero status.',
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
            text: 'The signing is ad-hoc: `signMacosAppBundle` passes `--sign -`, and `verifyMacosCodeSignature` passes `--verify --deep --strict`. That establishes local bundle integrity, and nothing more. It is not Developer ID signing and it is not notarization; the status service says as much in its own text, listing codesigning with a real identity and notarization as release work outside the tool. A verified ad-hoc signature proves the bundle was internally consistent at verification time. It proves nothing about Apple distribution eligibility, and reading it as notarization is a category error.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-resource-tolerance',
        title: 'Resource Verification and Publication',
        content: [
          {
            kind: 'paragraph',
            text: '`verifyMacosAppBundle` rejects a bundle that exists but is missing required content: the `Contents/MacOS/Ludoxel` executable, the `Contents/Frameworks/Python` shared-library link, a `.icns` icon under `Contents/Resources`, the patched `Info.plist` fields, the default Alex skin, and each required font. Several of those are accepted under more than one container location, which is what `requireBundledResource` and `bundledAssetCandidates` express.',
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
            text: 'The tolerance is bounded, not lax. PyInstaller may place collected data under either `Contents/Frameworks` or `Contents/Resources`, so the verifier accepts either location for the Alex skin and the fonts, but `requireBundledResource` still throws when none of the candidates holds the file. The point is that the check survives a harmless variation in bundle layout while still failing a genuinely missing resource. Misreading the tolerance as optionality — assuming an asset need not be present because two paths are listed — inverts the rule.',
          },
          {
            kind: 'paragraph',
            text: 'Publication is the last step that writes `dist/macos`. `publishMacosApp` patches the plist, signs and verifies the staged bundle, removes any existing published bundle, copies the staged bundle in with symlinks preserved, then signs and verifies the published copy again before copying legal material beside it. The sign-and-verify is duplicated on both the staged and the published copy on purpose: copying a signed bundle can disturb its signature, so the published artifact is re-established and re-verified rather than assumed equal to the staged one.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'This article describes the local `.app` artifact and its verification path. It does not assert that the bundle is notarized, accepted by Apple, approved for public download, or distributable by any party whose authority is not established elsewhere. A locally signed bundle remains a locally produced bundle. Notarization, distribution-channel preparation, and public release authority are outside this tool path and outside this article.',
          },
          {
            kind: 'paragraph',
            text: 'The standard is plain: a macOS Ludoxel artifact must be a coherent `.app` bundle with the expected executable, renderer envelope, identity metadata, resources, verified signature, and copied legal material. Anything short of that is a failed, partial, or unverified build output, never a macOS release.',
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
      'Explains how build_native_extensions and the foundations Python fallbacks relate: the configured candidates, compiled-suffix detection, the generated build payload, the require-built verification gate, and the separation of source availability, compiled acceleration, verification policy, and release permission.',
    sections: [
      {
        id: 'understanding-native-extension-fallbacks-owner-files',
        title: 'Owner Files and Candidate Set',
        content: [
          {
            kind: 'paragraph',
            text: 'Native extension behavior is owned by `tools/build_native_extensions` and grounded in the Python sources under `src/ludoxel/foundations/mathematics`. The candidate set and the recognized compiled suffixes are declared in `src/config/native.config.mjs`. Each candidate names a Python module whose source stays an ordinary file; the compiled binary, when it exists, is an acceleration of that same module, not a separate feature.',
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
            text: 'There are exactly three candidates: ray and AABB intersection, voxel DDA traversal, and view-angle math. The Python source for each remains the reference implementation. The distribution question is never whether a compiled binary exists in the abstract; it is whether the produced desktop artifact and its build log record the native state accurately. The presence or absence of a `.pyd`, `.so`, or `.dylib` changes runtime speed, not the legal status of the project.',
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-suffix-detection',
        title: 'Compiled-Suffix Detection',
        content: [
          {
            kind: 'paragraph',
            text: '`compiledBinariesForSource` in `src/collect/binary.collect.mjs` is what decides whether a source is compiled or fallback-only. It derives the stem from the Python file name, lists the source directory, and keeps the files whose extension is a recognized compiled suffix and whose base name begins with that stem.',
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
            text: 'A source is fallback-only exactly when this function returns an empty list — when no file in the module directory both carries a recognized suffix and begins with the source stem. Computing the answer from the directory contents rather than from a build flag is what makes detection portable: it reports the same state whether or not a build was attempted in the current session, and on whichever platform the inspection runs. The cost of bypassing this function and assuming a compiled module is present is that a packaged artifact can quietly run on the Python fallback while its documentation claims native acceleration.',
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-build-and-verify',
        title: 'Build Payload and Verification Gate',
        content: [
          {
            kind: 'paragraph',
            text: '`buildNativeExtensions` in `src/service/build.service.mjs` collects the sources, writes a generated Python build script and a JSON payload under `build/native-extension-scripts`, resolves a Python executable, runs the script, and then verifies the result with the require-built policy enabled unless it was told to skip verification. The generated script uses Cython and setuptools to compile the extensions in place, and tells the operator to install the development dependencies if Cython or setuptools is missing. The generated script root is always removed in a `finally` block, so the payload is never left behind as a stale artifact. The two entry points are:',
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
            text: '`verifyNativeExtensions` prints each source, its module name, and the compiled files found, and turns a missing-binary condition into a failure only when the require-built policy is active.',
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
            text: 'Without the require-built policy, the verifier records `compiled extension: none; Python fallback source exists.` for each fallback-only source and still returns success, because a fallback is a valid runtime state. With it, a single fallback-only candidate fails the whole verification. This is the distinction the article exists to keep: source availability, compiled acceleration, verification policy, and release permission are four separate things. No compiled extension is not no implementation; a Python fallback is not a successful native build; a successful native build is not release permission. Collapsing these into one reassuring word is exactly the outcome the verifier is built to prevent.',
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-package-effect',
        title: 'Effect on the Desktop Package',
        content: [
          {
            kind: 'paragraph',
            text: 'In the desktop build, `buildNativeExtensionsBeforeDesktop` runs the native build before PyInstaller packaging unless the operator passes `--skip-native-build` or runs a dry run, and a nonzero native exit code stops the desktop build before packaging. The package effect is therefore not a single bit. A desktop artifact may run through the Python fallback when no compiled binary is present and still fail a require-built policy imposed for a particular distribution candidate; conversely it may satisfy native verification and still fail legal-material inclusion, shader validation, resource-root checks, or release-language constraints.',
          },
          {
            kind: 'paragraph',
            text: 'This article does not tell readers to evade native-build failures by leaning on the fallback, and it does not require every informal local run to contain compiled extensions. It keeps the four layers apart. A public description of the artifact must not imply that native binaries were built unless the build and verification output show that they were, and must not imply that fallback execution authorizes distribution. The native state is a technical property of the artifact and never a legal grant.',
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
      'Explains the legal-material copy path in build_desktop_app — the configured material set, the copy service and its existence-guarded operation, the Windows and macOS publish coordinates, and the repository legal check — and holds the line that inclusion is retention, not permission.',
    sections: [
      {
        id: 'including-license-text-owner-files',
        title: 'Owner Files and Retention Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'Including the License Text in a desktop artifact is an operations requirement owned by `LEGAL_MATERIAL_PATHS` in `src/config/build.config.mjs`, the copy service in `src/service/legal-copy.service.mjs`, and the existence-guarded helper `copyIfExists` in `src/shared/file/path.file.mjs`. The configured material set is `LICENSE` and `third-party`, and PyInstaller also lists both among its data arguments — optionally on Windows, as required inputs on macOS. The purpose is to keep the controlling and attribution material physically next to the artifact.',
          },
          {
            kind: 'paragraph',
            text: 'That retention means one narrow thing and nothing more. Including `LICENSE` does not create permission to distribute the package, does not turn a local build into an official release, does not make a recipient an authorized distributor, and does not relax any reservation in the controlling text. It only prevents the artifact from being separated from the legal text that governs it. Separation is a defect; attachment is not authority.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'A package that contains `LICENSE` may still be unauthorized. A package that lacks `LICENSE` is defective even if some repository surface can be opened in a browser. Presence and permission are independent questions.',
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
            text: '`copyLegalMaterial` moves the configured material into a target directory. It takes one target path, iterates the fixed `LEGAL_MATERIAL_PATHS` list, writes only into that directory, and logs each path as copied or skipped, so the build record states which legal material actually reached the target.',
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
            text: 'It delegates the actual move to `copyIfExists`, which refuses to invent material it cannot find and signals the absence by returning false instead of throwing.',
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
            text: 'Because the move is existence-guarded and returns a boolean, a missing `LICENSE` does not crash the build; it produces a visible `skipped` line. So the build record, not silence, is the evidence that legal material was retained. Ignoring those log lines is how a package comes to be called complete when the build itself reported that the controlling text was never copied.',
          },
        ],
      },
      {
        id: 'including-license-text-publish-coordinates',
        title: 'Publish Coordinates',
        content: [
          {
            kind: 'paragraph',
            text: 'The copy runs in platform-specific coordinates, and the place to inspect follows those coordinates. On Windows, `publishWindowsExecutable` calls the copy service for the staging directory and for `dist/windows`, so the target to inspect is the directory holding `Ludoxel.exe`. On macOS, `publishMacosApp` copies legal material into `dist/macos` after the bundle is published, and the macOS prerequisite check additionally treats each configured legal-material path as a required input before a build is accepted.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'For a Windows artifact, look in `dist/windows` for `LICENSE` and `third-party` beside `Ludoxel.exe`.',
              'For a macOS artifact, look in `dist/macos` around `Ludoxel.app`, not only inside the bundle, because the copy writes beside the bundle.',
              'After any later copy, compression, upload, or transfer, inspect the transferred artifact again, because a downstream step can strip what the build correctly produced.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'A review that looks only at the executable, or only at the bundle internals, while ignoring the surrounding publish directory is incomplete. The legal material lives in the publish coordinate system, and that is where its presence has to be confirmed.',
          },
        ],
      },
      {
        id: 'including-license-text-check-reading',
        title: 'What the Legal Check Proves',
        content: [
          {
            kind: 'paragraph',
            text: 'The repository legal check reads the root `LICENSE` and verifies the required terms `Ludoxel Independent License`, `LicenseRef-All-Rights-Reserved`, and `third-party/`; verifies that `third-party/` exists; checks the required third-party license file; and scans source-like files for the required SPDX identifier outside excluded asset, config, and third-party paths.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Repository legal-material and SPDX check from package.json.',
            code: `npm run license:check`,
          },
          {
            kind: 'paragraph',
            text: 'Its output is a statement about the repository at the time of the check, not a forensic audit of any generated directory. A passing legal check supports the claim that the repository carries the required legal text and SPDX discipline. It does not prove that a previously copied artifact still contains the legal material, that a modified artifact retained it, or that a third party may circulate it. A failure must be read by its named cause: a missing root `LICENSE` is a different defect from a missing SPDX header in a source file, and a missing third-party license is different again. Naming the failed evidence is what keeps a distribution report from collapsing every failure into the same vague "not ready".',
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
              'This article does not interpret the license grant, define the scope of Original Materials, decide whether Distribution Materials may be shared, or determine the effect of public repository visibility. Those questions belong to the controlling ',
              { kind: 'link', label: 'License Text', href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text' },
              ' and to the Legal category. Here the concern is operational: the required material, the service that copies it, the publish coordinates, the check that reads the repository, and the defects caused by omission.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The conclusion is severe and simple. A distribution artifact must not be detached from its controlling legal material; and attachment to that material is still not permission to distribute the artifact.',
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
      'Explains how third-party license text, in particular the Kaisei Opti font notice, is retained and checked: the legal policy constant, the required-terms checker, the macOS font requirements, and the boundary between notice retention and redistribution clearance.',
    sections: [
      {
        id: 'including-third-party-license-text-owner-files',
        title: 'Owner Files and Retention Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'Third-party license inclusion is about keeping the license texts of third-party material physically present in the repository and in any artifact that carries that material. It is owned by the policy constants in `tools/check_project/src/check/legal/legal.policy.mjs`, the required-terms checker in `legal.check.mjs`, and the configured `third-party` material path that `copyLegalMaterial` writes into each publish directory. The one third-party license the policy verifies in detail is the Kaisei Opti font notice.',
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
            text: 'This is not the same task as classifying every material in the repository. The policy proves that the Kaisei notice contains the expected identifying terms. It does not settle the provenance of every Minecraft-derived texture, every local asset, every generated thumbnail, or every provenance-sensitive material. One verified notice must not be inflated into a blanket clearance.',
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
            text: 'The same `checkRequiredTerms` helper that validates the root `LICENSE` validates the Kaisei notice. It takes a label, a path, and a term set; it fails on a missing file or a missing term; and it reports the defect with a message that names it.',
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
            text: 'The check is run as part of the repository legal check.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'The third-party notice is verified by the legal check.',
            code: `npm run license:check`,
          },
          {
            kind: 'paragraph',
            text: 'What it proves is exact. If `third-party/kaisei-opti/LICENSE.txt` is absent or lacks `Kaisei`, `SIL Open Font License`, or `Version 1.1`, the check reports the defect by the license label. It does not read the full obligations of the SIL Open Font License into a legal opinion, and it does not certify redistribution of any artifact that embeds the font. It confirms the presence of selected terms in a named notice file. A distribution article may state that a package process must keep this notice; it may not state that the check authorizes public distribution of the package.',
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
            text: 'The font asset path shows that the material can be bundled into the macOS application; the third-party license path carries the notice that must not be lost during packaging. They are not interchangeable. A bundle that contains `KaiseiOpti-Regular.ttf` but omits the corresponding notice is defective as a distribution artifact, while a repository that contains the notice but omits the font asset passes the legal check yet fails the macOS resource prerequisite. One question asks whether notice material exists; the other asks whether a platform-required runtime resource is present. Treating them as one misreports both.',
          },
        ],
      },
      {
        id: 'including-third-party-license-text-end-to-end',
        title: 'End-to-End Retention',
        content: [
          {
            kind: 'paragraph',
            text: 'Because `third-party` is a configured legal-material path, `copyLegalMaterial` copies it into each publish directory, so the notice should travel from the repository root into the artifact.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Confirm the notice exists at the repository root under `third-party/`.',
              'For a Windows artifact, confirm `third-party` is beside `Ludoxel.exe` after the legal-copy step.',
              'For a macOS artifact, confirm `third-party` is present in `dist/macos` after the bundle is published and verified.',
              'After any later copy, compression, or transfer, inspect the transferred artifact again, because PyInstaller internal data collection and the surrounding legal-copy step are distinct operations and a downstream step can strip the directory.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Third-party license inclusion is therefore an end-to-end retention requirement, not a single build-time event. The repository can be correct and the build output can be correct, and a later packaging step can still remove the directory.',
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
              'This article does not classify all third-party material, decide whether a specific third-party license permits a particular external redistribution act, or resolve provenance-sensitive assets. The full analysis of ',
              { kind: 'link', label: 'third-party material boundaries', href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-third-party-material-boundaries' },
              ' belongs to the Data and Legal categories. Here the concern is the operational retention of a named third-party notice and the defects that follow from omission.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The rule is narrow: if an artifact carries third-party material, the corresponding notice must stay attached in the artifact’s publish coordinates. That attachment is evidence of notice retention, never proof of general legal clearance.',
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
      'Documents the build_desktop_app command surface as an operational entry point for an already-authorized operator: parsing and validation, task dispatch, host gates, dry-run and check modes, native-build and cache ordering, and the separation of command availability from permission.',
    sections: [
      {
        id: 'running-a-desktop-build-with-permission-authority-premise',
        title: 'Authority Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'This article assumes the operator already holds authority to run the relevant local build under the controlling License Text or a separate competent written permission. A package script existing does not confer that authority. The Distribution question begins only after the premise is satisfied: which command runs, which target is selected, which host is required, which inputs are read, and which artifact paths are written.',
          },
          {
            kind: 'paragraph',
            text: 'That premise is what keeps this article out of Legal. Legal decides whether a person may perform an act; Distribution records how the build act is carried out when the authority is not in dispute. The build command is an operational entry point, not a permission surface.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Do not cite this article as permission to build, distribute, publish, mirror, or upload Ludoxel. It describes the technical path for an operator whose authority is established elsewhere.',
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
            text: '`parseDesktopBuildArgs` reads the command line. It recognizes the `windows` and `macos` targets, the flags `--dry-run`, `--skip-native-build`, `--keep-build-cache`, `--status`, and `--check`, and a language selection for help rendering; it records a conflict when two different targets are declared and rejects unknown options and commands. The targets and the diagnostic modes are reached through the package scripts:',
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
            text: '`validateDesktopBuildArgs` then resolves the default target and forbids contradictory diagnostic modes.',
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
            text: 'Two of these decisions matter downstream. When no target is supplied and help is not requested, the command defaults to `windows`, so a bare invocation selects the Windows path rather than failing open. And `--status` with `--check` is rejected, because the macOS status report and the macOS prerequisite check are distinct modes that cannot both be requested at once. The validation runs before any task: when the error list is non-empty, the dispatcher prints the errors and returns exit code 2 without building anything.',
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-dispatch',
        title: 'Task Dispatch and Host Gates',
        content: [
          {
            kind: 'paragraph',
            text: '`runDesktopBuildTask` routes a validated option set to a platform service, and encodes the macOS-only diagnostic modes inline so that `--check` and `--status` short-circuit before a real build.',
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
            text: 'The two platform services impose different host gates. `runWindowsBuild` requires a Windows host for a real build and checks that the Windows entry script exists, though a Windows dry run skips the host requirement because it does not execute. `runMacosBuild` requires a macOS host and additionally requires the entry script, the default Alex skin, a macOS `.icns` icon candidate, and every required font asset before PyInstaller runs. This is why the target must be identified before any artifact is discussed: the hosts, the renderer paths, and the artifact forms differ, and treating the two as one generic desktop build silently confuses all three.',
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
            text: 'After the native phase, the service constructs tokenized PyInstaller work, spec, and staging roots under `build/`, prints the command, runs it with the resolved Python executable, publishes the artifact, and removes the tokenized roots unless `--keep-build-cache` is supplied. Reading that order is how a reviewer reconstructs what happened.',
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
            text: 'The durable publish directories are `dist/windows` and `dist/macos`; the tokenized roots are implementation detail and part of the audit trail, not release locations. A staged artifact that survives because of a publication problem is not a published one.',
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'This article does not describe installer creation, update delivery, store submission, notarized public release, website download publication, or external redistribution, and it does not decide whether a given operator may run the command. Those are separate legal and release-management questions.',
          },
          {
            kind: 'paragraph',
            text: 'An authorized local desktop build is a target-specific task that validates inputs, may build native extensions, constructs a PyInstaller command, writes intermediate roots, publishes a platform artifact, and emits logs that have to be read before the artifact is described or transferred. That is the whole of what running the command establishes.',
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
      'Explains how to read build and check output as evidence at the exact granularity the tools emit it: the printed PyInstaller command, the report function pass and failure shape, native verification lines, and the platform publication results, none of which establish permission or release status.',
    sections: [
      {
        id: 'reading-build-output-evidentiary-function',
        title: 'Evidentiary Function',
        content: [
          {
            kind: 'paragraph',
            text: 'Build output records what a tool attempted, verified, skipped, and wrote. It is not a substitute for inspecting the artifact, and it is not a release verdict. A printed PyInstaller command shows command construction; a published-artifact line shows a publication function reached its success path; a `passed` line shows a named check returned zero. None of those lines on its own proves permission, official release status, or third-party clearance.',
          },
          {
            kind: 'paragraph',
            text: 'The reading follows a fixed order, so each line is taken for what it is.',
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
            text: 'Skipping those steps is how an optimistic transcript becomes a claim of a completed, authorized, transferable release.',
          },
        ],
      },
      {
        id: 'reading-build-output-command-display',
        title: 'Command Display',
        content: [
          {
            kind: 'paragraph',
            text: 'The desktop build service prints the PyInstaller command before execution, and on a dry run that printed command is the principal output because the service returns before PyInstaller runs. The line shows the Python executable, the PyInstaller module invocation, the clean and confirmation flags, the application name, the output roots, the source path, the collected package data, the hidden imports, the data arguments, the icon, and the entry script. The dry run is reached as:',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'A dry run prints the command and returns before building.',
            code: `npm run build:windows -- --dry-run`,
          },
          {
            kind: 'paragraph',
            text: 'A displayed command is an intended invocation, not a completed artifact. It is useful for checking that the target, entry script, icon, data roots, hidden imports, and staging paths are right. It cannot show that PyInstaller succeeded, that the output file exists, or that legal material was copied after publication. Reading a dry-run command print as a finished build is the most common error and a factual one.',
          },
        ],
      },
      {
        id: 'reading-build-output-pass-failure-notes',
        title: 'Pass, Failure, and Notes',
        content: [
          {
            kind: 'paragraph',
            text: 'Every repository check renders its result through one function, `printCheckResult`, and its shape dictates how the output is read.',
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
            text: 'Three severities live here and must not be merged. A `name: passed` line means that named check found no failures. A `note:` line is diagnostic context, not a failure — the resource check, for example, notes that `assets/` exists and must stay ignored until provenance is reviewed. A `- failure` line is a specific, named defect. The text after the check name controls the reading, because each check carries its own evidence set and its own boundary. A note is never a failure, and one failure line is never a verdict on the whole repository.',
          },
        ],
      },
      {
        id: 'reading-build-output-publication-results',
        title: 'Publication and Verification Results',
        content: [
          {
            kind: 'paragraph',
            text: 'Windows and macOS report publication differently because the artifacts differ. Windows prints `published Windows executable` when `dist/windows/Ludoxel.exe` is replaced, but it may instead print that the published executable is locked and that the staged executable was preserved. macOS prints a published app bundle only after Info.plist patching, ad-hoc signing, verification, copying, re-signing, re-verification, and legal-material copying. Native verification prints a line per source and an explicit fallback statement for any fallback-only source.',
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
            text: 'Each message carries its own meaning. A preserved staged Windows executable is not a replaced published executable. A `compiled extension: none` line is a fallback fact, not a build failure. An ad-hoc verified macOS bundle is not a notarized bundle. A copied-legal-material line is not a legal grant. The final description of the artifact has to be assembled from these specific facts, never inferred from one favorable line — and that assembly is the whole discipline of reading build output.',
          },
        ],
      },
      {
        id: 'reading-build-output-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'This article does not teach generic PyInstaller debugging, Python packaging theory, operating-system code-signing law, or license interpretation. It describes the Ludoxel-specific reading discipline for the build and check output the repository tools emit.',
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
      'Explains the check_project dispatcher and the package, legal, and documentation policies: named-check selection, the package identity and script-surface rules, and the rule that a passing check is evidence only for the policy that produced it.',
    sections: [
      {
        id: 'running-package-checks-with-permission-authority-premise',
        title: 'Authority Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'This article assumes the operator may run repository checks in the local working copy. The checks are executable repository tools, not public grants. Their value is evidentiary: they report whether selected repository invariants hold before a build is described as coherent or ready for a further authorized step.',
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
              content: 'A passing check is a repository signal. It is not a release approval, not legal permission, and not evidence that a later copied artifact still contains every required file.',
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
            text: 'The check harness is a closed dispatch table in `tools/check_project/src/service/check.service.mjs`. A check name supplied by a run script selects a single policy from the frozen `CHECKS` map, and an unknown name returns exit code 2 instead of running an arbitrary function.',
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
            text: 'Freezing the table is what gives the checks their granularity. Each name selects exactly one policy, and the composite `npm run check` runs them in sequence rather than as a single undifferentiated pass. So "the checks passed" is never one global guarantee; each name proves only the predicate set of the policy it selected. The evidence belongs to the individual dispatch entry, not to the aggregate run.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-package-policy',
        title: 'The Package Policy',
        content: [
          {
            kind: 'paragraph',
            text: '`checkPackage` reads `package.json` and verifies project identity and the declared script surface. It requires the name `ludoxel` and the license identifier `LicenseRef-All-Rights-Reserved`, requires the expected Ludoxel scripts to be present, rejects known obsolete or improper script terms, checks that node-based script entry files exist, rejects a root `scripts/` directory, and rejects the `future_ai_workbench` tooling directory.',
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
            text: 'This is a structural repository check. It does not build the desktop application, inspect `dist/windows` or `dist/macos`, run PyInstaller, validate renderer parity, or decide whether a generated artifact may be distributed. Its Distribution use is to show that the script surface and package metadata have not drifted from the expected tooling contract — a precondition for repository-to-artifact continuity, not a release authority.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-legal-and-docs',
        title: 'Legal and Documentation Policies',
        content: [
          {
            kind: 'paragraph',
            text: 'The legal check verifies the root License Text terms, the `third-party` root, the required third-party license text, and SPDX headers on source-like files outside excluded paths. The documentation check verifies that `README.md` exists and contains the required Ludoxel legal-information terms. Both are narrower than the documents they touch: they confirm that required terms and markers are present; they do not interpret the full legal text or certify that every public explanation is complete.',
          },
          {
            kind: 'paragraph',
            text: 'This is where a passing check is most often over-read. A green legal or documentation check confirms exactly the conditions that policy inspected and no others. It does not entail redistribution authority. In Distribution the checks still matter, because a package built from a repository that fails them should be treated as suspect even before the platform artifact is inspected; but the converse does not hold. Passing the checks does not prove that a generated archive, installer, upload, or copied directory preserved the relevant material.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-composite-reading',
        title: 'Composite Reading',
        content: [
          {
            kind: 'paragraph',
            text: 'Package readiness is composite only in the engineering sense. `package:check`, `license:check`, `docs:check`, `resources:check`, `shader:check`, and the platform build checks each inspect a different layer. A failure in any layer must be named by its layer, and a pass in one layer must not excuse missing evidence in another. The repository may pass `package:check` while macOS packaging prerequisites fail; the macOS packaging check may pass while a later PyInstaller run fails; the PyInstaller run may succeed while a copied artifact later loses third-party material.',
          },
          {
            kind: 'paragraph',
            text: 'This article does not replace continuous-integration policy, legal review, release approval, third-party provenance analysis, or manual artifact inspection, and it does not define the contents of the License Text. Package checks are necessary discipline for repository-to-artifact continuity. They are neither sufficient authority for distribution nor proof that a concrete artifact stays complete after it leaves the publish directory.',
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
      'Explains the resource and shader policies in check_project: the runtime-path, integrity, and asset-root invariants with their generated-material notes, and the shader source contract with its GLSL version bound and vertex-index macro rule, each held to exactly what it inspects.',
    sections: [
      {
        id: 'running-resource-and-shader-checks-with-permission-authority-premise',
        title: 'Authority Premise',
        content: [
          {
            kind: 'paragraph',
            text: 'This article assumes the operator may run repository checks and inspect the local working copy. The checks are not permission to redistribute resources, shaders, assets, or generated artifacts. They identify whether the repository still satisfies selected runtime and renderer invariants before a desktop artifact is called distribution-ready.',
          },
          {
            kind: 'paragraph',
            text: 'The two are grouped because both protect package behavior after the code is frozen into a desktop artifact. Resource failures tend to produce missing runtime data roots, lost assets, or broken persistence boundaries; shader failures tend to produce renderer compilation problems or backend contract drift. Neither check decides legal material scope or third-party rights.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-resource-policy',
        title: 'The Resource Policy',
        content: [
          {
            kind: 'paragraph',
            text: '`checkResources` reads `.gitignore` for generated and local exclusion terms, verifies the runtime path module, the persistence integrity manifest module, and the shared visual asset root resolver. The exact terms it requires are declared in `resources.policy.mjs`, and the check is reached through the package script.',
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
            text: 'The check expects the runtime path module to mention `default_runtime_data_root`, `state_manifest.json`, and `integrity_key.bin`, and expects the visual asset resolver to cover the `assets/ludoxel` and `assets/minecraft` roots together with the block texture and thumbnail directories. Its notes are part of the discipline rather than incidental commentary: it notes that `assets/` exists and must stay ignored until provenance is reviewed, that a previous-format `configs/` exists and that runtime writes must use the app-managed data root, and that the export-tool output exists and must remain generated and ignored. Each note marks a boundary between source, generated material, and provenance-sensitive assets.',
          },
          {
            kind: 'paragraph',
            text: 'In distribution terms, the resource check protects the runtime data boundary that a frozen desktop artifact depends on: it confirms the modules that resolve the user data root, the integrity manifest, and the asset roots are present and reference the expected names. It does not pack those resources into a bundle and does not certify their provenance; those belong to the build path and to the Data and Legal categories.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-shader-policy',
        title: 'The Shader Policy',
        content: [
          {
            kind: 'paragraph',
            text: '`checkShaders` scans the OpenGL shader root and the WGPU shader source root, filters by the accepted suffixes `.vert`, `.frag`, `.comp`, and `.glsl`, and validates each non-include file against a stage-aware contract. `checkShader` is the predicate that produces the failures, and it is reached through the package script.',
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
            text: 'A non-include shader must declare a `#version`, and the declared version is accepted only when it is at least 140 and at most 430; anything below the floor or above the ceiling is a failure named with the file and the offending version. A vertex shader that references raw `gl_VertexID` without the `LUDOXEL_VERTEX_INDEX` compatibility macro fails as well. The distribution significance is that renderer source is packaged into a desktop artifact and can fail at runtime on a target platform, so this contract is enforced before the artifact is treated as coherent. What the check does not do is equally clear: it does not prove visual equivalence between the OpenGL and WGPU backends, does not render frames, and does not validate driver behavior. It validates shader source text.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-platform-effect',
        title: 'Platform Effect',
        content: [
          {
            kind: 'paragraph',
            text: 'The platform effect differs by target. Windows keeps the OpenGL renderer path and packages common data roots into a one-file executable. macOS uses the WGPU and Metal-oriented path and requires WGPU source, `rendercanvas`, the `wgpu_native` import, the cursor helper, fonts, and bundled resource locations to survive the bundle process. Resource and shader checks inform, but do not replace, the platform-specific packaging checks.',
          },
          {
            kind: 'paragraph',
            text: 'A resource check can pass while macOS still fails to bundle a font or the Alex skin in an accepted bundle location, and a shader check can pass while a platform dependency is missing from the macOS build environment. A distribution statement has to name the exact level it verified: repository resource invariants, the shader-source contract, platform packaging prerequisites, or final artifact inspection. Each is a separate layer of evidence.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-authority-boundary',
        title: 'Authority Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'This article does not classify asset provenance, license third-party textures, authorize generated thumbnails, certify visual parity, or provide general renderer debugging. It reads two repository checks whose output bears on distribution readiness because desktop packages carry resources and shader source into a frozen runtime context.',
          },
          {
            kind: 'paragraph',
            text: 'Resource and shader checks are necessary technical evidence for package integrity, and their success stays attached to what they actually inspect. They cannot be turned into a legal conclusion, a release approval, or a promise that every runtime path in every transferred artifact remains intact.',
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
      'Explains why release wording is part of artifact handling: the tool’s own publish coordinates and its explicit statement that codesigning and notarization are outside the tool, and the rule that an artifact label is never an authority label.',
    sections: [
      {
        id: 'avoiding-unofficial-release-claims-identification-boundary',
        title: 'Identification Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'An unofficial release claim is what happens when a technical artifact is described with institutional force it does not have. A locally built executable, a locally built `.app` bundle, a preserved staging file, a CI artifact, a Vercel preview, a copied folder, a compressed archive, or a screenshot of a passing check can all be genuine evidence of technical activity. None of them, on its own, establishes that the artifact is an official Ludoxel release or that any third party may circulate it.',
          },
          {
            kind: 'paragraph',
            text: 'Wording is part of artifact handling because a label carries inference with it. A release label invites the reader to assume approval, authority, support, or redistribution permission. When the only evidence is local generation or technical access, the label has to stay local, diagnostic, or unofficial. That is the wording the Distribution category controls.',
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
            text: 'The build tool does not claim to produce a release, and it says so in plain text. `renderMacosStatus` in `macos-status.service.mjs` lists what the build path performs and then separates the real release work as outside the tool. The status text is reached with the status flag:',
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
            text: 'This is the tool’s own boundary statement. The macOS path performs ad-hoc signing and verification to establish local bundle integrity, but Developer ID codesigning and notarization are named as release work outside the tool. So even the most complete local macOS build, with a verified signature, has not crossed into Apple-distributable status. Treating the ad-hoc verification as notarization is exactly the false inference this article suppresses.',
          },
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-label-versus-authority',
        title: 'Artifact Label Versus Authority Label',
        content: [
          {
            kind: 'paragraph',
            text: 'The publish coordinates make the same point. The artifact is named `Ludoxel.exe` or `Ludoxel.app` and is written under `dist/windows` or `dist/macos`, and those are declared constants in the build configuration.',
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
            text: 'The name `Ludoxel` and the path `dist` are construction labels chosen by the build configuration, not authority labels. A file called `Ludoxel.exe` in `dist/windows` is the deterministic output of `publishWindowsExecutable`; the name says what the tool built, not who may distribute it. Mistaking that artifact label for an authority label is the precise error this article forbids: an output named like a product is still only an output. Safe description names the technical source and refuses any surplus authority.',
          },
          {
            kind: 'list',
            items: [
              'Acceptable: a local Windows build, a local macOS bundle, a PyInstaller output, a package candidate, a staged executable preserved after a locked publish target, or a repository check result.',
              'Unsafe: official release, authorized public download, redistribution-ready package, legally cleared build, approved mirror, endorsed upload, or final release artifact, when the only evidence is local build output or tool success.',
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
            text: 'A stronger release claim needs stronger evidence than an artifact path. At minimum it has to be tied to the controlling release decision, the exact artifact or build identifier, the platform target, the included legal and third-party material, the relevant check results, and the public surface on which the release is intentionally presented. If any of those is absent, the statement stays a local or candidate description.',
          },
          {
            kind: 'paragraph',
            text: 'The absence of evidence must not be patched over with vague language such as appears to be official, should be fine, effectively released, probably cleared, or generated by the official repo. Distribution prose has to be exact even when the answer is inconvenient: a package can be technically generated and still lack release status.',
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
              'This article does not decide who may grant official release status, how legal permission is created, whether a particular artifact is licensed for distribution, or how official releases are announced. Under the controlling License Text, only the Licensor publishes an ',
              { kind: 'link', label: 'Official Distribution', href: '/docs/legal/license-authority-and-materials/material-scope/understanding-distribution-materials' },
              '; here the concern is the narrower problem of not attaching false release language to a technical artifact.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Distribution documentation speaks with evidentiary restraint. A build artifact may be named, inspected, diagnosed, and compared against the expected package structure. It may not be promoted into an official or authorized release by rhetorical force.',
          },
        ],
      },
    ],
    relatedTitles: ['Reading Build Output', 'Running Package Checks with Permission', 'Understanding Repository Visibility', 'Understanding Redistribution Restrictions'],
  }),
];
