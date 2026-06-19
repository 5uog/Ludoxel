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
      'Explains the Windows one-file desktop artifact as a PyInstaller output, identifies the concrete files and build stages that constitute the artifact, and separates artifact inspection from any legal conclusion about permission, release status, or endorsement.',
    sections: [
      {
        id: 'understanding-the-windows-executable-artifact-boundary',
        title: 'Windows Executable Artifact Boundary',
        body: [
          'The Windows desktop artifact is the one-file PyInstaller executable published as dist/windows/Ludoxel.exe. That file is the operational package produced from the Ludoxel Python entry point, the collected package data, the bundled application resources, the selected Windows icon candidate, and the hidden bootstrap imports required by the application startup path. It is not an installer, not a store package, not a repository archive, and not an official-release declaration by its physical form alone.',
          'This article treats the executable as a build artifact. The relevant questions are whether the file was produced by the intended Windows build path, whether the expected project inputs were present, whether legal and third-party material was copied beside the published executable, whether stale onedir output was removed, and whether the build log gives a coherent account of the generated file. Those questions are technical and evidentiary; they do not decide whether a party may distribute the file.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run build:desktop -- windows\nnpm run build:windows',
            caption: 'Windows build entry points exposed by package scripts.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-pyinstaller-inputs',
        title: 'Windows PyInstaller Inputs',
        body: [
          'The Windows command is built around src/ludoxel/__main__.py, adds the project src directory to the Python path, collects Ludoxel package data, and uses PyInstaller one-file mode under the application name Ludoxel. Common optional data arguments include assets, src, LICENSE, and third-party. The Windows icon is selected from the configured .ico candidates when a candidate exists, and the application bootstrap modules are added as hidden imports so the packaged entry point can resolve the startup path consistently.',
          'The Windows package therefore depends on more than the top-level executable byte stream. A coherent artifact must be traceable back to the configured entry script, the source and package-data collection rules, the resource roots that the runtime expects, and the legal material copy step. A copied executable with no corresponding build log, no retained legal material, or no evidence of the configured PyInstaller path is only a loose binary, not a confirmed Ludoxel Windows distribution artifact.',
        ],
        codeBlocks: [
          {
            language: 'yaml',
            code: 'entry: src/ludoxel/__main__.py\npublish directory: dist/windows\npublished executable: dist/windows/Ludoxel.exe\ncommon data roots: assets, src, LICENSE, third-party',
            caption: 'Material Windows artifact coordinates.',
          },
        ],
      },
      {
        id: 'understanding-the-windows-executable-publication-step',
        title: 'Publication Step and Lock Handling',
        body: [
          'The Windows service publishes from a tokenized PyInstaller staging directory into dist/windows. Before publication, obsolete dist/windows/Ludoxel onedir output is removed so an older directory package does not coexist with the one-file executable and mislead a later inspection. The publication step then copies legal material into the staging directory, copies the staged executable to dist/windows/Ludoxel.exe, and copies legal material into the published directory as well.',
          'A locked published executable is handled as a technical file-system condition, not as a successful replacement. If Windows reports EPERM, EBUSY, or EACCES while replacing the published executable, the staged executable is preserved and the log identifies the locked publish target. The retained staging file may be useful for diagnosis, but the presence of a staged executable does not prove that the intended public-facing artifact was replaced in dist/windows.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-inspection-method',
        title: 'Inspection Method',
        body: [
          'A Windows artifact should be inspected from the outside inward. The first layer is the command log: it should show the PyInstaller invocation, the tokenized work, spec, and staging roots, and the final publication line for dist/windows/Ludoxel.exe. The second layer is the file system: dist/windows should contain the executable and the copied legal material. The third layer is the repository-state evidence: package, legal, resource, and shader checks should be read as separate signals, not collapsed into a single release verdict.',
          'A dry-run command can confirm the intended PyInstaller command without producing or replacing the artifact. That is useful when reviewing path construction, icon selection, and data arguments, but it is not a substitute for a completed build. Conversely, a completed executable without the expected copied legal material remains defective as a distribution artifact even if the binary launches locally.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not grant permission to distribute the executable, does not declare the executable to be an official release, does not clear third-party material, and does not decide whether a recipient may mirror, upload, redistribute, or repackage it. Those conclusions belong to the controlling License Text or to a later competent written instrument. The Distribution function here is narrower: it gives the technical criteria for recognizing and inspecting the Windows executable artifact after authority has already been settled elsewhere.',
          'The correct use of this article is therefore evidentiary. It tells the reader what a Windows artifact is, how the build path constructs it, which surrounding files matter, and which build-output facts must be read before anyone describes the artifact publicly. It does not turn successful local execution into authorization.',
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
      'Explains the macOS .app bundle as the platform-specific PyInstaller output for Ludoxel, including bundle identity, WGPU and Metal-oriented runtime inclusion, resource verification, ad-hoc signing, and the line between local packaging and release work.',
    sections: [
      {
        id: 'understanding-the-macos-application-bundle-artifact-boundary',
        title: 'macOS Bundle Artifact Boundary',
        body: [
          'The macOS desktop artifact is a Ludoxel.app bundle published under dist/macos. It is generated through PyInstaller windowed mode, named Ludoxel, and configured with the bundle identifier com.kentokonishi.ludoxel. The artifact is not a bare executable: its technical identity is distributed across Contents/MacOS, Contents/Resources, Contents/Frameworks, Info.plist, bundled resources, copied legal material, the Python shared-library link, and the final signature state of the bundle.',
          'That structure gives the macOS article a different subject from the Windows executable article. Windows inspection can focus on a one-file executable and its neighboring legal material. macOS inspection must treat the bundle as a directory-shaped application container whose executable, metadata, icon, Python runtime linkage, renderer dependencies, resource locations, and signature verification all participate in the artifact.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run build:desktop -- macos\nnpm run build:macos\nnpm run build:macos:check',
            caption: 'macOS build and packaging-check entry points.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-renderer-path',
        title: 'Renderer and Runtime Path',
        body: [
          'The macOS build path is specific to the WGPU and Metal-oriented renderer route. The PyInstaller command collects wgpu and rendercanvas, adds hidden imports for wgpu.backends.wgpu_native, rendercanvas.qt, rendercanvas.pyqt6, and the macOS cursor helper, and requires the Darwin-only runtime dependencies to be present in the project configuration. This is not an ornamental packaging detail: without those inputs, the packaged application may exist while the renderer path or gameplay mouse-capture helper is materially incomplete.',
          'The bundle check also verifies macOS-specific project inputs before build execution. It requires the entry script, package metadata, pyproject metadata, bundled source and assets roots, the default Alex skin, legal material, font assets, and WGPU source paths. The resulting documentable fact is not merely that PyInstaller ran; the fact is that a known macOS runtime envelope was constructed for the renderer path that Ludoxel expects on macOS.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-plist-signature',
        title: 'Info.plist and Signature Verification',
        body: [
          'After PyInstaller produces the staged bundle, the macOS service patches Info.plist so the bundle name, display name, bundle identifier, executable name, short version, bundle version, icon file, and input-monitoring usage description match the Ludoxel package identity. Those fields are not marketing copy. They are part of the bundle identity that macOS, diagnostic tools, users, and release operators read when deciding whether a directory is the intended application bundle.',
          'The service performs ad-hoc signing, verifies the bundle with codesign, copies the verified staged bundle into dist/macos, signs the published bundle again, and verifies it again. This establishes local bundle integrity for the produced artifact. It does not perform notarization and does not convert a local build into a public release. Notarization, distribution-channel preparation, and final public release authority remain outside this tool path.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-resource-verification',
        title: 'Resource Verification',
        body: [
          'A macOS artifact is incomplete if the directory exists but required bundled resources are absent. The service verifies the Python framework link, Info.plist identity fields, at least one bundled .icns icon under Contents/Resources, the default Alex skin at an accepted bundled resource location, and each required Minecraft and Kaisei font asset. It then copies legal material beside the published application bundle in dist/macos.',
          'The accepted resource locations reflect the practical variation in PyInstaller bundle layout. The check accepts either Contents/Frameworks or Contents/Resources for several bundled assets because PyInstaller may place collected data under different internal bundle roots. That tolerance is not a license to omit the asset; it is a recognition that the same required file may be packaged under more than one valid macOS container location.',
        ],
        codeBlocks: [
          {
            language: 'yaml',
            code: 'publish directory: dist/macos\npublished bundle: dist/macos/Ludoxel.app\nbundle identifier: com.kentokonishi.ludoxel\nrequired app executable: Contents/MacOS/Ludoxel',
            caption: 'Material macOS bundle coordinates.',
          },
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article describes the local .app artifact and its verification path. It does not claim that the bundle is notarized, accepted by Apple, approved for public download, cleared for redistribution, or legally distributable by any party other than one whose authority is established elsewhere. A signed local bundle is still only a locally produced bundle unless the legal and release-status questions are separately answered.',
          'The narrow conclusion is that a macOS Ludoxel distribution artifact must be a coherent .app bundle with the expected executable, metadata, resources, renderer-runtime inclusions, signature verification, and copied legal material. Anything less should be described as a failed, partial, or unverified build output rather than as a macOS release.',
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
      'Explains how native extension artifacts and Python fallback sources are treated during Ludoxel packaging, why missing compiled extensions must be read precisely, and why fallback availability is not a reason to conceal runtime or distribution defects.',
    sections: [
      {
        id: 'understanding-native-extension-fallbacks-artifact-boundary',
        title: 'Native Extension Artifact Boundary',
        body: [
          'Ludoxel recognizes three native-extension candidates in the current tooling: ray_aabb, voxel_dda, and view_angles. Their module names point into the foundations mathematics packages, and their source paths remain ordinary Python source files under src/ludoxel. The compiled artifacts are recognized by platform suffixes such as .pyd, .so, and .dylib, while the Python source remains the fallback implementation and the semantic reference point for the module contract.',
          'A native extension in this distribution context is therefore not an independent feature package. It is an acceleration or platform-specific execution artifact for a function that remains tied to a named source module. The distribution question is whether the produced desktop artifact and the surrounding build evidence account for the native state accurately, not whether the mere presence or absence of a compiled binary changes the public legal status of the project.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-build-behavior',
        title: 'Build Behavior',
        body: [
          'The desktop build path invokes native-extension building before the Windows or macOS package step unless the operator explicitly skips that phase. The native build service collects the source modules, writes a generated Python build script and payload under the build-native tooling area, runs the configured Python executable, and then verifies that compiled artifacts exist when verification is required. A nonzero native build exit code stops the desktop build before PyInstaller packaging proceeds.',
          'This ordering matters because the packaged application should not silently cross from an optimized native path to a fallback path without evidence. If the operator used --skip-native-build, that choice should remain visible in the build context. If the build attempted native compilation and failed, the failure is not cured by later producing a desktop artifact through some unrelated process.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run build:native\nnpm run build:native:check',
            caption: 'Native extension build and verification entry points.',
          },
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-verification-reading',
        title: 'Verification Reading',
        body: [
          'Native verification prints each native source, its module name, the source path, and the compiled extension files found for that source. When no compiled extension is present, the verifier explicitly states that no compiled extension exists and that the Python fallback source exists. If --require-built is supplied and any source lacks a compiled binary, verification fails and names the missing compiled extension by source id and module name.',
          'That distinction is the article’s practical center. No compiled extension is not the same as no implementation. A Python fallback is not the same as a successful native build. A successful native build is not the same as release permission. Each statement belongs to a different evidentiary layer, and a distribution document must not flatten those layers into a single comforting status word.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-package-effect',
        title: 'Package Effect',
        body: [
          'A desktop package may launch through fallback code when native binaries are absent, but distribution inspection must still record the native state accurately. The package evidence should identify whether native building was run, whether verification was required, which compiled suffixes were found, and whether the PyInstaller command collected the Ludoxel package data from a source tree that still contains the fallback modules.',
          'The package effect is therefore not binary. The artifact may be runnable, yet still fail a native-build requirement imposed for a particular distribution candidate. Conversely, the artifact may satisfy native verification while still fail legal-material inclusion, shader validation, resource-root checks, or release-language constraints. Native verification is one axis of distribution evidence, not a universal pass.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not instruct readers to evade native-build failures by relying on fallback behavior. It also does not require every informal local run to contain compiled native extensions. Its narrower function is to preserve the distinction between source availability, compiled acceleration, verification policy, and package evidence.',
          'When the artifact is described publicly, the description must not imply that native binaries were built unless the build and verification evidence show that they were built. It must also not imply that fallback execution authorizes distribution. The native state is a technical property of the artifact, not a legal grant.',
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
      'Explains the operational requirement that Ludoxel desktop artifacts retain the root License Text and related legal material, without treating inclusion as permission, endorsement, release approval, or third-party clearance.',
    sections: [
      {
        id: 'including-license-text-inclusion-boundary',
        title: 'License Text Inclusion Boundary',
        body: [
          'License Text inclusion is a distribution-operations requirement. The build configuration names LICENSE and third-party as legal material paths, and the desktop build service copies those paths into the relevant staging or publish location when they exist. PyInstaller data arguments also include LICENSE and third-party in the common data set, with macOS treating the same legal material as required bundle input. The purpose is physical retention of controlling and attribution material around the artifact.',
          'That physical retention has a strictly limited meaning. Including LICENSE does not create permission to distribute the package, does not convert a local build into an official release, does not make a recipient an authorized distributor, and does not relax any reservation in the License Text. It prevents the distribution artifact from being severed from the legal text that governs it; it does not itself confer authority.',
        ],
        noteBlocks: [
          {
            type: 'warning',
            content:
              'A package that contains LICENSE may still be unauthorized. A package that lacks LICENSE is defective as a distribution artifact even if some other page or repository surface can be opened in a browser.',
          },
        ],
      },
      {
        id: 'including-license-text-build-copy-path',
        title: 'Build Copy Path',
        body: [
          'The operational copy path is explicit. The legal-copy service iterates over the configured legal material paths and copies each existing path from the project root into the target directory. Windows calls this service for the staging directory and for dist/windows. macOS copies legal material into dist/macos after the bundle is published, and the macOS input check also treats each configured legal material path as a required project input before a valid bundle build is accepted.',
          'The practical consequence is that legal material must be inspected in the same coordinate system as the artifact. For Windows, the inspection target is the directory containing Ludoxel.exe. For macOS, the inspection target is dist/macos around Ludoxel.app, not only the application bundle internals. A review that looks only at the executable or only at the app bundle while ignoring the surrounding publish directory is incomplete.',
        ],
        codeBlocks: [
          {
            language: 'yaml',
            code: 'legal material paths: LICENSE, third-party\nWindows publish target: dist/windows\nmacOS publish target: dist/macos',
            caption: 'Legal material copy coordinates.',
          },
        ],
      },
      {
        id: 'including-license-text-check-reading',
        title: 'Check Reading',
        body: [
          'The legal check reads the root LICENSE, verifies required terms including Ludoxel Independent License, LicenseRef-All-Rights-Reserved, and third-party/, verifies that third-party/ exists, and checks required third-party license files. It also scans source-like files for the required SPDX license identifier outside excluded asset, config, and third-party paths. Its output is a repository-state check, not a package-by-package forensic audit of every generated directory.',
          'That distinction should be preserved when writing documentation. A passed legal check supports the proposition that the repository has the required legal text and SPDX discipline at the time of the check. It does not by itself prove that a previously copied artifact contains the legal material, that a modified artifact retained it, or that a third party may circulate it.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run license:check',
            caption: 'Repository legal-material and SPDX check.',
          },
        ],
      },
      {
        id: 'including-license-text-failure-reading',
        title: 'Failure Reading',
        body: [
          'A missing LICENSE file is a hard defect for a distribution artifact. It deprives the artifact of the controlling text that the recipient must be able to inspect. A missing third-party directory is also a defect when the artifact includes materials whose third-party notices are expected to travel with the package. These are not cosmetic omissions and should not be described as documentation polish.',
          'A failed legal check should be read by its named failure. If the root LICENSE is missing, the defect is not the same as a missing SPDX header in a source file. If the Kaisei license is missing, the defect is not the same as a missing LicenseRef term in package metadata. Distribution writing must name the failed evidence instead of converting every failure into the same vague statement that the package is not ready.',
        ],
      },
      {
        id: 'including-license-text-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not interpret the license grant, define the scope of Original Materials, decide whether Distribution Materials may be shared, or determine the legal effect of public repository visibility. Those issues belong to Legal. This article remains operational: it identifies the required legal text, the tool path that copies it, the check that reads it, and the artifact defects caused by omission.',
          'The narrow conclusion is severe but simple: a distribution artifact must not be detached from its controlling legal material; nevertheless, attachment to the controlling legal material is not permission to distribute the artifact.',
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
      'Explains how third-party license material is retained and checked for Ludoxel distribution artifacts, with particular attention to Kaisei Opti font material and the distinction between notice inclusion and complete third-party provenance analysis.',
    sections: [
      {
        id: 'including-third-party-license-text-inclusion-boundary',
        title: 'Third-Party Inclusion Boundary',
        body: [
          'Third-party license inclusion concerns the physical retention of license texts for third-party material that is carried by the repository or by a desktop artifact. In the current tooling, third-party/ is a configured legal material path, and the legal policy specifically requires third-party/kaisei-opti/LICENSE.txt to contain Kaisei, SIL Open Font License, and Version 1.1. macOS packaging also requires the Kaisei Opti font assets that are used by the application’s visual surface.',
          'This is not the same inquiry as classifying every material in the repository. The presence of the Kaisei Opti license file supports the statement that the required Kaisei license notice is present. It does not decide the provenance of every Minecraft-derived texture, every local asset, every generated thumbnail, or every material whose history requires separate review. Distribution writing must not inflate one verified third-party notice into universal clearance.',
        ],
        noteBlocks: [
          {
            type: 'warning',
            content:
              'Third-party license inclusion is a package-retention and notice problem. It is not a blanket provenance certificate for every asset that appears in the repository, a build output, or a rendered scene.',
          },
        ],
      },
      {
        id: 'including-third-party-license-text-kaisei-font-path',
        title: 'Kaisei Font Path',
        body: [
          'The Kaisei Opti license text is stored under third-party/kaisei-opti/LICENSE.txt. The macOS build path separately verifies KaiseiOpti-Regular.ttf, KaiseiOpti-Medium.ttf, and KaiseiOpti-Bold.ttf under assets/fonts, together with the Minecraft font files that the application uses for its interface. The relationship is evidentiary: the font asset path shows that the material may be bundled, while the third-party license path carries the notice text that must not be lost during packaging.',
          'A bundle that contains the font file but omits the corresponding third-party license text is defective. A repository that contains the license text but omits the font asset may pass one legal-text check while failing a macOS resource prerequisite. The two facts should be kept distinct because they answer different questions: one asks whether notice material exists; the other asks whether runtime resources needed by the platform package are present.',
        ],
        codeBlocks: [
          {
            language: 'yaml',
            code: 'third-party/kaisei-opti/LICENSE.txt\nassets/fonts/KaiseiOpti-Regular.ttf\nassets/fonts/KaiseiOpti-Medium.ttf\nassets/fonts/KaiseiOpti-Bold.ttf',
            caption: 'Kaisei license and font asset coordinates.',
          },
        ],
      },
      {
        id: 'including-third-party-license-text-check-reading',
        title: 'Check Reading',
        body: [
          'The legal check treats the Kaisei Opti license as a required third-party license. If the file is absent, or if the required terms are missing, the check reports the defect by the required license label. This check gives a precise, reproducible signal about a named third-party notice. It should be cited only for that signal and for the broader fact that third-party/ exists as a legal-material root.',
          'The check does not read the full license obligations into a legal opinion and does not certify redistribution of every artifact that embeds a font. It verifies the presence of selected terms. The distribution article may therefore state that a package process must retain this license text; it must not state that the check alone authorizes public distribution of the resulting desktop package.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run license:check',
            caption: 'Repository third-party license check.',
          },
        ],
      },
      {
        id: 'including-third-party-license-text-artifact-reading',
        title: 'Artifact Reading',
        body: [
          'Artifact review should trace third-party notice material from the repository root into the publish target. For Windows, third-party should be present beside the published executable after the legal-copy step. For macOS, third-party should be present in the published dist/macos directory after the bundle is copied and verified. The review should not assume that PyInstaller internal data collection and the surrounding legal-copy step are identical merely because both mention third-party.',
          'When a distribution package is inspected after copying, compression, upload, or transfer, the third-party notice directory must be checked again in the transferred artifact. The repository may have been correct, and the build output may have been correct, yet a later packaging step may still have stripped the directory. Distribution documentation should therefore describe third-party license inclusion as an end-to-end retention requirement rather than a single build-time event.',
        ],
      },
      {
        id: 'including-third-party-license-text-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not classify all third-party material, decide whether a specific third-party license permits a particular external redistribution act, resolve provenance-sensitive assets, or replace the Legal category’s material-boundary articles. It concerns the operational retention of named third-party license text and the package defects that follow from omission.',
          'The resulting rule is narrow: if a distribution artifact carries third-party material, the corresponding third-party license material must remain attached in the artifact’s distribution coordinate system. That attachment is necessary evidence of notice retention, not proof of general legal clearance.',
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
      'Explains the authorized local operation of Ludoxel desktop build commands, the supported target selection model, host constraints, dry-run behavior, native-build ordering, and generated build roots without treating command availability as permission.',
    sections: [
      {
        id: 'running-a-desktop-build-with-permission-authority-premise',
        title: 'Authority Premise',
        body: [
          'This article assumes that the operator already has authority to run the relevant local build command under the controlling License Text or a separate competent written permission. The existence of a package script does not itself grant that authority. The Distribution question begins only after that premise is satisfied: which command is being run, which target is selected, which host is required, which inputs are read, and which artifact paths are created.',
          'That premise prevents this article from collapsing into Legal. Legal decides whether a person may perform a given act. Distribution records how the build act is performed when authority is not in dispute. The build command is therefore described as an operational entry point, not as a permission surface.',
        ],
        noteBlocks: [
          {
            type: 'warning',
            content:
              'Do not cite this article as permission to build, distribute, publish, mirror, or upload Ludoxel. It describes the technical path for an operator whose authority is already established elsewhere.',
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-target-selection',
        title: 'Target Selection',
        body: [
          'The desktop build CLI accepts windows and macos targets, corresponding wrapper scripts also exist for each platform, and the generic build command defaults to Windows when no command is supplied and the user did not request help. The CLI also accepts --dry-run, --skip-native-build, --keep-build-cache, --status, --check, and language selection for help rendering. Conflicting target declarations and unsupported language values are rejected before task execution.',
          'Target selection is not a cosmetic argument because the Windows and macOS services impose different host gates and produce different artifact forms. Windows produces a one-file executable under dist/windows. macOS produces a .app bundle under dist/macos and exposes additional status and packaging-check behavior. A distribution document must identify the selected target before discussing any generated artifact.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run build:desktop -- windows\nnpm run build:desktop -- macos\nnpm run build:desktop -- macos --check\nnpm run build:desktop -- macos --status',
            caption: 'Targeted desktop build invocations.',
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-host-gates',
        title: 'Host Gates and Dry Runs',
        body: [
          'The Windows service requires a Windows host for a real build and verifies that the Windows entry script exists. A Windows dry run can display the constructed PyInstaller command without enforcing the same host requirement because it does not execute the build. The macOS service requires a macOS host before running its build path and also requires the entry script, default Alex skin, a macOS icon candidate, and required font assets before PyInstaller execution.',
          'The dry-run distinction must be read precisely. A dry run can show command construction and path choices, but it does not produce dist/windows/Ludoxel.exe or dist/macos/Ludoxel.app. A packaging check can verify prerequisites for the macOS path, but it does not publish a bundle. Treating either diagnostic mode as a completed build is a factual error.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-native-and-cache-ordering',
        title: 'Native Build and Cache Ordering',
        body: [
          'Unless explicitly skipped, native extensions are built before desktop packaging. A nonzero native build result stops the desktop build. The desktop build then creates tokenized PyInstaller work, spec, staging, and configuration roots under build/, prints the constructed PyInstaller command, executes it with the resolved Python executable, publishes the resulting artifact, and removes tokenized build roots unless --keep-build-cache is supplied.',
          'The generated roots are part of the audit trail. They explain where intermediate files were written and why a staged artifact may exist after a publication problem. They should not be mistaken for release locations. The durable platform publish directories are dist/windows and dist/macos; the tokenized build roots are implementation details unless retained for inspection.',
        ],
        codeBlocks: [
          {
            language: 'yaml',
            code: 'build/pyinstaller-runs/<token>\nbuild/pyinstaller-spec-runs/<token>\nbuild/pyinstaller-dist-runs/<token>\nbuild/pyinstaller-config',
            caption: 'PyInstaller build and configuration roots.',
          },
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not describe installer creation, update delivery, store submission, notarized public release, website download publication, or external redistribution. It also does not decide whether a given operator has permission to run the command. Those are separate legal and release-management questions.',
          'The narrow conclusion is operational. An authorized local desktop build is a target-specific task that validates inputs, may build native extensions, constructs a PyInstaller command, writes intermediate roots, publishes a platform artifact, and emits logs that must be read before the artifact is described or transferred.',
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
      'Explains how to read Ludoxel build and check output as structured evidence, distinguishing command display, pass and failure lines, notes, staged artifacts, locked publish targets, and unsupported conclusions.',
    sections: [
      {
        id: 'reading-build-output-evidentiary-function',
        title: 'Evidentiary Function of Build Output',
        body: [
          'Build output is a record of what a tool attempted, what it verified, what it skipped, and where it wrote artifacts. It is not a substitute for artifact inspection. A log line that prints a PyInstaller command shows command construction; a log line that reports a published artifact shows that the publication function reached its success path; a check line that says passed shows that a named check returned zero. None of those lines alone proves legal permission, official release status, or third-party clearance.',
          'The correct reading order is concrete. First identify the tool and target. Next identify whether the run was diagnostic or productive. Then read named failures and notes without generalizing them beyond their check. Finally compare the reported output path with the file system. A distribution article should never convert an optimistic build transcript into a completed, authorized, transferable release without these intermediate readings.',
        ],
      },
      {
        id: 'reading-build-output-command-display',
        title: 'Command Display',
        body: [
          'The desktop build service prints the PyInstaller command before execution. The displayed command includes the Python executable, PyInstaller module invocation, clean and confirmation flags, application name, output roots, project source path, collected package data, hidden imports, data arguments, icons, and the entry script. On dry run, that displayed command is the principal output because the tool returns before PyInstaller execution.',
          'A displayed command should be read as an intended invocation, not as a completed artifact. It is useful for diagnosing whether the selected target, entry script, icon, data roots, hidden imports, and staging paths are correct. It cannot prove that PyInstaller succeeded, that the output file exists, or that legal material was copied after publication.',
        ],
      },
      {
        id: 'reading-build-output-pass-failure-and-notes',
        title: 'Pass, Failure, and Notes',
        body: [
          'Check output uses a deliberately simple form: a named check prints passed or failed, optional notes are printed as notes, and failures are printed as individual failure lines. A note is not a failure, and a failure line is not a general condemnation of the entire repository. The text after the check name controls the reading because each check has its own evidence set and its own boundaries.',
          'For example, resources notes may record that assets/ exists and must stay ignored until provenance is reviewed, that previous-format configs/ exists, or that generated export output exists. Those notes are not the same as failure lines. Conversely, a missing runtime path module, a missing legal term, or a missing package script is not a mere warning. Distribution writing must preserve these severities.',
        ],
        codeBlocks: [
          {
            language: 'yaml',
            code: '<name>: passed\n  note: <diagnostic note>\n\n<name>: failed\n  - <specific failure>',
            caption: 'Generic check-output shape.',
          },
        ],
      },
      {
        id: 'reading-build-output-publication-results',
        title: 'Publication Results',
        body: [
          'Windows and macOS report publication differently because the artifacts differ. Windows reports the published executable path when dist/windows/Ludoxel.exe is replaced successfully, but it may instead report that the published executable is locked and that the staged executable was preserved. macOS reports a published app bundle after Info.plist patching, signing, verification, copying, re-signing, re-verification, and legal-material copying.',
          'These messages must be read with their platform semantics. A preserved staged Windows executable is not the same as a replaced published executable. A verified macOS bundle is not the same as notarization. A copied legal-material line is not a legal grant. Each message is a fact about a tool step, and the final artifact description must be assembled from those facts rather than inferred from a single favorable line.',
        ],
      },
      {
        id: 'reading-build-output-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not teach generic PyInstaller debugging, Python packaging theory, operating-system code-signing law, or license interpretation. It explains the Ludoxel-specific reading discipline for the build and check output that the repository tools emit.',
          'The narrow conclusion is that build output is admissible technical evidence only when it is read at the granularity at which the tool emitted it. A line about a command, a note, a failure, a staged artifact, or a published artifact cannot be promoted into a legal or release-status conclusion.',
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
      'Explains the repository package, documentation, and legal checks that inform distribution readiness, including what they verify, what they deliberately do not verify, and how their output should be read before artifact publication.',
    sections: [
      {
        id: 'running-package-checks-with-permission-authority-premise',
        title: 'Authority Premise',
        body: [
          'This article assumes that the operator has authority to run repository checks in the local working copy. The checks are executable repository tools, not public grants of permission. Their value is evidentiary: they report whether selected repository invariants are satisfied before a party describes a build as coherent, complete, or ready for a further authorized step.',
          'A passed check must therefore be used with discipline. It can support a statement about the condition that the check actually verifies. It cannot authorize distribution, waive a license condition, certify external redistribution, approve a release, or replace inspection of a concrete artifact after it has been copied or compressed.',
        ],
        noteBlocks: [
          {
            type: 'warning',
            content: 'A green check is a repository signal. It is not a release approval, not legal permission, and not evidence that a later copied artifact still contains every required file.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-package-check',
        title: 'Package Check',
        body: [
          'The package check reads package.json and verifies basic project identity, including the package name and license identifier. It also requires the declared script surface to contain the expected Ludoxel scripts, rejects known obsolete or improper script terms, verifies that node-based script entry files exist, rejects a root scripts/ directory, and rejects the future_ai_workbench tooling directory if it appears as executable tooling rather than as removed design material.',
          'This is a structural repository check. It does not build the desktop application, inspect dist/windows or dist/macos, execute PyInstaller, validate renderer parity, or decide whether a generated artifact may be distributed. Its proper use in Distribution is to show that the repository script surface and package metadata have not drifted away from the expected tooling contract.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run package:check',
            caption: 'Package metadata and script-surface check.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-legal-and-docs-checks',
        title: 'Legal and Documentation Checks',
        body: [
          'The legal check verifies the root License Text terms, the third-party root, required third-party license text, and SPDX headers on source-like files outside excluded paths. The documentation check verifies that README.md exists and contains the required Ludoxel legal-information terms. These checks are narrower than the documents they touch. They verify the presence of required terms and markers; they do not interpret the full legal text or certify that every public explanation is complete.',
          'In Distribution, these checks are useful because package candidates must not be detached from legal and documentation invariants. A package made from a repository that fails these checks should be treated as suspect even before inspecting the platform artifact. But the inverse is not absolute: passing the checks does not prove that a generated archive, installer, upload, or copied directory preserved the relevant material.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run license:check\nnpm run docs:check',
            caption: 'Legal material and README-term checks.',
          },
        ],
      },
      {
        id: 'running-package-checks-with-permission-composite-reading',
        title: 'Composite Reading',
        body: [
          'Package readiness is a composite judgment only in the engineering sense. package:check, license:check, docs:check, resources:check, shader:check, and the platform build checks each inspect a different layer. A failure in any one layer should be named by its layer. A pass in one layer should not be used to excuse missing evidence in another layer.',
          'This is especially important for generated desktop artifacts. The repository may pass package:check while macOS packaging prerequisites fail. The macOS packaging check may pass while the later PyInstaller run fails. The PyInstaller run may succeed while a copied artifact later loses third-party material. Distribution documentation should therefore speak in terms of layer-specific evidence rather than broad release readiness slogans.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not replace continuous integration policy, legal review, release approval, third-party provenance analysis, or manual artifact inspection. It also does not define the contents of the License Text. It explains how package-adjacent checks contribute evidence to the Distribution category.',
          'The narrow conclusion is that package checks are necessary discipline for repository-to-artifact continuity. They are not sufficient authority for distribution and not sufficient proof that a concrete artifact remains complete after it leaves the publish directory.',
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
      'Explains the Ludoxel resource and shader checks as distribution evidence for runtime roots, generated-material boundaries, renderer shader contract compliance, and platform-specific packaging risk.',
    sections: [
      {
        id: 'running-resource-and-shader-checks-with-permission-authority-premise',
        title: 'Authority Premise',
        body: [
          'This article assumes that the operator has authority to run repository checks and inspect the local working copy. The checks are not permission to redistribute resources, shaders, assets, or generated artifacts. Their function is to identify whether the repository state still satisfies selected runtime and renderer invariants that matter before a desktop artifact is described as distribution-ready.',
          'Resource and shader checks are grouped here because both protect package behavior after code is frozen into a desktop artifact. Resource failures tend to produce missing paths, missing runtime data roots, lost assets, or broken persistence boundaries. Shader failures tend to produce renderer compilation problems or backend contract drift. Neither check decides legal material scope or third-party rights.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-resource-check',
        title: 'Resource Check',
        body: [
          'The resource check reads .gitignore for generated and local exclusion terms, verifies the runtime path module, verifies the persistence integrity manifest module, and verifies the shared visual asset root resolver. It specifically expects runtime path handling to mention default_runtime_data_root, state_manifest.json, and integrity_key.bin, and it expects the visual asset resolver to cover the Ludoxel and Minecraft asset roots together with block texture and thumbnail directories.',
          'The notes emitted by this check are part of its discipline. The existence of assets/ is noted because assets must remain ignored until provenance is reviewed. The existence of previous-format configs/ is noted because runtime writes must use the app-managed data root and may only migrate previous-format input. The existence of generated export output is noted because it must remain generated and ignored. Those notes are evidence of boundary management, not incidental commentary.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run resources:check',
            caption: 'Runtime path, generated-material, and asset-root check.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-shader-check',
        title: 'Shader Check',
        body: [
          'The shader check scans the OpenGL shader root and the WGPU shader source root, filters shader files by accepted suffix, and validates stage-specific shader text. Non-include shader files must declare a GLSL version accepted by the Ludoxel validation contract, and vertex shaders must use the compatibility macro for vertex indexing instead of raw gl_VertexID unless the macro is present. The check also reports the number of shader files inspected.',
          'This check is significant for Distribution because renderer source can be packaged into a desktop artifact and then fail at runtime on a target platform. The check does not prove visual equivalence between OpenGL and WGPU, does not render frames, and does not validate every driver behavior. It verifies a source-level shader contract that must hold before the artifact is treated as technically coherent.',
        ],
        codeBlocks: [
          {
            language: 'sh',
            code: 'npm run shader:check',
            caption: 'Renderer shader source-contract check.',
          },
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-platform-effect',
        title: 'Platform Effect',
        body: [
          'The platform effect is different for Windows and macOS. Windows retains the OpenGL renderer path and packages common data roots into a one-file executable. macOS uses the WGPU and Metal-oriented path and requires WGPU source, rendercanvas, wgpu-native imports, the cursor helper, fonts, and bundled resource locations to survive the application-bundle process. Resource and shader checks therefore inform, but do not replace, platform-specific packaging checks.',
          'A resource check can pass while macOS still fails to bundle a font or Alex skin in an accepted bundle location. A shader check can pass while a platform dependency is missing from the macOS build environment. Distribution writing must state the exact level verified: repository resource invariants, shader-source contract, platform packaging prerequisites, or final artifact inspection.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not classify asset provenance, license third-party textures, authorize generated thumbnails, certify visual parity, or provide general renderer debugging. It describes two repository checks whose outputs are relevant to distribution readiness because desktop packages carry resources and shader source into a frozen runtime context.',
          'The narrow conclusion is that resource and shader checks are necessary technical evidence for package integrity, but their success must remain attached to what they actually inspect. They cannot be transformed into a legal conclusion, a release approval, or a promise that every runtime path in every transferred artifact remains intact.',
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
      'Explains how to describe local builds, preview artifacts, copied desktop packages, CI results, and documentation references without implying official release status, legal clearance, or public redistribution permission.',
    sections: [
      {
        id: 'avoiding-unofficial-release-claims-identification-boundary',
        title: 'Identification Boundary',
        body: [
          'Unofficial release claims arise when a technical artifact is described with institutional force it does not possess. A locally built executable, a locally built .app bundle, a preserved staging file, a CI artifact, a Vercel preview, a copied folder, a compressed archive, or a screenshot of a successful check may be real evidence of technical activity. None of those facts, by itself, establishes that the artifact is an official Ludoxel release or that a third party may circulate it.',
          'The Distribution category controls the public wording used around those artifacts because wording is part of artifact handling. A release label can cause readers to infer approval, authority, support expectations, or redistribution permission. If the evidentiary basis is only local generation or technical accessibility, the label must remain local, diagnostic, or unofficial.',
        ],
        noteBlocks: [
          {
            type: 'warning',
            content:
              'Do not call a local build, preview deployment, copied artifact, preserved staging file, or check result an official release unless the separate release authority and release-status evidence actually exist.',
          },
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-safe-description',
        title: 'Safe Description',
        body: [
          'A safe description names the technical source and refuses surplus authority. Acceptable wording can say that an artifact is a local Windows build, a local macOS bundle, a PyInstaller output, a package candidate, a test artifact, a preview artifact, a staged executable preserved after a locked publish target, or a repository check result. Those phrases describe evidence without representing approval by the Licensor or readiness for public circulation.',
          'Unsafe wording says or implies official release, authorized public download, redistribution-ready package, legally cleared build, approved mirror, endorsed upload, or final release artifact when the only evidence is local build output or tool success. The defect is not merely stylistic. It misstates the artifact’s status and invites the reader to infer permission from technical availability.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-support-and-documentation-context',
        title: 'Support and Documentation Context',
        body: [
          'Support and documentation surfaces should preserve the same distinction. A support answer may ask for the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. It should not transform the user’s artifact into an endorsed release by repeating the user’s label without qualification. Documentation should also avoid presenting local build commands as public download instructions.',
          'A public documentation article may describe how the build tool works because that is a technical fact about the repository. The article must still make clear that command availability, repository visibility, static-site publication, or package output does not itself produce release authority. The safest public text names the artifact’s technical origin and then stops.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-evidence-required',
        title: 'Evidence Required for Stronger Claims',
        body: [
          'A stronger release claim requires stronger evidence than an artifact path. At minimum, the claim must be tied to the controlling release decision, the exact artifact or build identifier, the platform target, the included legal and third-party material, the relevant check results, and the public surface on which the release is intentionally presented. If any of those elements is absent, the statement should remain a local or candidate description.',
          'The absence of evidence must not be cured with vague language such as appears to be official, should be fine, effectively released, probably cleared, or generated by the official repo. Distribution prose should be exact even when the answer is inconvenient: a package can be technically generated and still lack release status.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-boundary',
        title: 'Boundary of the Article',
        body: [
          'This article does not decide who may grant official release status, how legal permission is created, whether a particular artifact is licensed for distribution, or how public releases should be announced outside the documentation. It controls the narrower documentation problem of avoiding false release language around technical artifacts.',
          'The narrow conclusion is that Distribution documentation must speak with evidentiary restraint. A build artifact may be named, inspected, diagnosed, and compared against the expected package structure. It must not be promoted into an official or authorized release by rhetorical force.',
        ],
      },
    ],
    relatedTitles: ['Reading Build Output', 'Running Package Checks with Permission', 'Understanding Repository Visibility', 'Understanding Redistribution Restrictions'],
  }),
];
