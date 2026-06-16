/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const distributionPages: DocsPageContent[] = [
  {
    slug: 'desktop-distribution-overview',
    navigationTitle: 'Desktop Distribution Overview',
    eyebrow: 'Distribution',
    title: 'Desktop Distribution Overview',
    description: 'How Ludoxel is packaged into desktop artifacts, what is bundled, and the boundary between a local build and an official release.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'what-is-built',
        title: 'What is built',
        body: [
          'The repository contains a desktop build tool that packages Ludoxel with PyInstaller. The Windows path produces a single executable named Ludoxel; the macOS path produces a windowed application bundle named Ludoxel. Both are driven from the `src/ludoxel/__main__.py` entry point.',
        ],
      },
      {
        id: 'bundled-inputs',
        title: 'Bundled inputs',
        body: [
          'The build bundles the application source, the `assets` directory, the root `LICENSE`, and the `third-party` directory as data. The Windows build uses an application icon when present; the macOS build requires an `.icns` icon and additionally collects the wgpu and rendercanvas renderer runtimes.',
        ],
      },
      {
        id: 'official-boundary',
        title: 'Official distribution boundary',
        body: [
          'Only a desktop distribution published by the Licensor is an Official Distribution. A local build, fork build, mirror, modified bundle, or third-party upload is not official merely because it runs or contains Ludoxel files.',
        ],
      },
    ],
    references: [
      {
        title: 'Windows Executable',
        href: '/docs/windows-executable',
        description: 'The Windows build artifact.',
      },
      {
        title: 'macOS Application Bundle',
        href: '/docs/macos-application-bundle',
        description: 'The macOS build artifact.',
      },
      {
        title: 'Legal Materials in Distribution',
        href: '/docs/legal-materials-in-distribution',
        description: 'The legal files copied into a build.',
      },
    ],
  },
  {
    slug: 'windows-executable',
    navigationTitle: 'Windows Executable',
    eyebrow: 'Distribution',
    title: 'Windows Executable',
    description: 'The Windows `.exe` produced by the build, what it contains, and the difference between a local build and an official release.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'identity',
        title: 'Artifact identity',
        body: [
          'The Windows build runs PyInstaller in one-file mode with the name Ludoxel, producing a single `Ludoxel.exe`. The executable bundles the Python code, the application data, and the bundled legal material. It is an object-form artifact and is not a separate license from the root `LICENSE`.',
        ],
      },
      {
        id: 'renderer',
        title: 'Renderer',
        body: [
          'On Windows the application uses the OpenGL renderer backend, so the Windows build does not collect the macOS wgpu runtimes. An application icon from the Windows icon set is applied when present.',
        ],
      },
      {
        id: 'local-vs-official',
        title: 'Local build versus official release',
        body: [
          'A locally produced executable is a local build unless the Licensor publishes it as an Official Distribution. A successful build does not make an executable official, endorsed, or cleared for redistribution.',
        ],
      },
    ],
    references: [
      {
        title: 'PyInstaller Build Flow',
        href: '/docs/pyinstaller-build-flow',
        description: 'How the executable is produced.',
      },
      {
        title: 'Release Verification',
        href: '/docs/release-verification',
        description: 'What to verify before any release claim.',
      },
      {
        title: 'Provenance-Sensitive Materials',
        href: '/docs/provenance-sensitive-materials',
        description: 'Assets that need separate clearance.',
      },
    ],
  },
  {
    slug: 'macos-application-bundle',
    navigationTitle: 'macOS Application Bundle',
    eyebrow: 'Distribution',
    title: 'macOS Application Bundle',
    description: 'The macOS `.app` produced by the build, the wgpu renderer it carries, and the signing work that lies outside the build tool.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'identity',
        title: 'Bundle identity',
        body: [
          'The macOS build runs PyInstaller in windowed mode with the name Ludoxel and the bundle identifier `com.kentokonishi.ludoxel`, producing a `Ludoxel.app` bundle. The bundle structure does not create new permission to redistribute Ludoxel or third-party materials.',
        ],
      },
      {
        id: 'renderer',
        title: 'Renderer and required inputs',
        body: [
          'The macOS build collects the wgpu and rendercanvas runtimes and includes the macOS cursor recenter helper used by gameplay mouse capture, because macOS uses the wgpu-native renderer targeting Metal. The macOS packaging check verifies the required fonts, wgpu sources, the `.icns` icon, and the Darwin-only dependencies.',
        ],
      },
      {
        id: 'signing',
        title: 'Signing and notarization',
        body: [
          'The build patches the bundle identity fields, re-signs the bundle, and verifies the final signature. Codesigning with a developer identity and notarization are release steps that are outside this build tool, so a local bundle is not a notarized release.',
        ],
      },
    ],
    references: [
      {
        title: 'WGPU Renderer',
        href: '/docs/wgpu-renderer',
        description: 'The macOS renderer in the bundle.',
      },
      {
        title: 'PyInstaller Build Flow',
        href: '/docs/pyinstaller-build-flow',
        description: 'How the bundle is produced.',
      },
      {
        title: 'Build Failure Boundaries',
        href: '/docs/build-failure-boundaries',
        description: 'What the packaging check enforces.',
      },
    ],
  },
  {
    slug: 'native-extensions-distribution',
    navigationTitle: 'Native Extensions',
    eyebrow: 'Distribution',
    title: 'Native Extensions',
    description: 'How compiled native extensions are built and verified for a distribution, and how the application behaves without them.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'build',
        title: 'Building extensions',
        body: [
          'A dedicated native-extension build tool compiles the optional native modules, and a separate verify step checks the result. These extensions accelerate low-level numeric routines that also have a Python fallback.',
        ],
      },
      {
        id: 'fallback',
        title: 'Fallback behavior',
        body: [
          'When an extension is not present, the application runs on the Python fallback with the same numeric contract. The presence of a compiled extension is an optimization, not a requirement for the application to run.',
        ],
      },
      {
        id: 'distribution',
        title: 'In a distribution',
        body: ['A desktop build may include compiled extensions when they have been built. As object-form outputs, compiled extensions are distribution materials and are not source files.'],
      },
    ],
    references: [
      {
        title: 'Native Extensions',
        href: '/docs/native-extensions',
        description: 'The runtime contract for extensions.',
      },
      {
        title: 'Build Tools',
        href: '/docs/build-tools',
        description: 'The tool that builds extensions.',
      },
      {
        title: 'Generated Artifacts',
        href: '/docs/generated-artifacts',
        description: 'How object-form outputs are classified.',
      },
    ],
  },
  {
    slug: 'pyinstaller-build-flow',
    navigationTitle: 'PyInstaller Build Flow',
    eyebrow: 'Distribution',
    title: 'PyInstaller Build Flow',
    description: 'How the desktop build invokes PyInstaller, what it stages, and the differences between the Windows and macOS commands.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'invocation',
        title: 'Invocation',
        body: [
          'The build constructs a PyInstaller command with a clean, no-confirm run, the application name Ludoxel, staging directories under the `build` tree, the `src` path, and a collect-data step for the `ludoxel` package. The application bootstrap module is added as a hidden import.',
        ],
      },
      {
        id: 'platform-differences',
        title: 'Platform differences',
        body: [
          'The Windows command uses one-file mode and applies the Windows icon when present. The macOS command uses windowed mode with the bundle identifier, requires the assets, source, license, third-party, fonts, and icon inputs, and adds the wgpu, rendercanvas, and macOS cursor hidden imports.',
        ],
      },
      {
        id: 'staging-and-legal',
        title: 'Staging and legal copy',
        body: [
          'The build stages its output under the `build` tree and copies the legal material into the target directory. The legal copy reports each file as copied or skipped so a missing legal input is visible.',
        ],
      },
    ],
    references: [
      {
        title: 'Generated Artifacts',
        href: '/docs/generated-artifacts',
        description: 'The outputs this flow produces.',
      },
      {
        title: 'Legal Materials in Distribution',
        href: '/docs/legal-materials-in-distribution',
        description: 'What the legal copy includes.',
      },
      {
        title: 'Build Tools',
        href: '/docs/build-tools',
        description: 'The build tool that runs this flow.',
      },
    ],
  },
  {
    slug: 'generated-artifacts',
    navigationTitle: 'Generated Artifacts',
    eyebrow: 'Distribution',
    title: 'Generated Artifacts',
    description: 'The object-form outputs a build produces and why they are not source files.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'artifact-classes',
        title: 'Artifact classes',
        body: [
          'A build produces object-form outputs: the Windows executable, the macOS application bundle, staged distribution directories, compiled native extensions, and the bundled resources inside them. These are generated from source, not source files themselves.',
        ],
      },
      {
        id: 'distribution-materials',
        title: 'Distribution materials',
        body: [
          'When prepared for distribution, these outputs are Distribution Materials. They remain subject to the root `LICENSE`, and packaging them does not create any additional license or permission.',
        ],
      },
      {
        id: 'not-verified-here',
        title: 'Not asserted by the build',
        body: [
          'The build tool produces an executable and an application bundle; it does not, on its own, produce an installer or a store-ready package. A claim that an installer or store distribution exists must be backed by a verified step, not assumed from a successful build.',
        ],
      },
    ],
    references: [
      {
        title: 'Release Verification',
        href: '/docs/release-verification',
        description: 'The verification categories before release.',
      },
      {
        title: 'Distribution Materials',
        href: '/docs/distribution-materials',
        description: 'The legal definition of these materials.',
      },
      {
        title: 'Generated Application Output',
        href: '/docs/generated-application-output',
        description: 'How runtime output differs from build artifacts.',
      },
    ],
  },
  {
    slug: 'legal-materials-in-distribution',
    navigationTitle: 'Legal Materials in Distribution',
    eyebrow: 'Distribution',
    title: 'Legal Materials in Distribution',
    description: 'Which legal files the build copies and bundles, and why their presence does not by itself grant distribution permission.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'copied-files',
        title: 'Copied and bundled files',
        body: [
          'The build copies the root `LICENSE` and the `third-party` directory into the target as legal material, and the same paths are bundled as data inside the artifact. The source distribution and manifest also include the `LICENSE`, the README, the `third-party` directory, and the bundled assets and tools.',
        ],
      },
      {
        id: 'not-permission',
        title: 'Inclusion is not permission',
        body: [
          'Including the license text, third-party license texts, SPDX identifiers, or package metadata does not by itself grant distribution permission. Distribution permission comes only from the root `LICENSE` or a separate written instrument signed by the Licensor.',
        ],
      },
      {
        id: 'third-party',
        title: 'Third-party and provenance-sensitive material',
        body: [
          'A distribution that includes third-party materials or provenance-sensitive assets must satisfy those materials terms separately. Their exact license terms, versions, bundling eligibility, and redistribution conditions must be confirmed before distribution.',
        ],
      },
    ],
    references: [
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling license text.',
      },
      {
        title: 'Third-Party Materials',
        href: '/docs/third-party-materials',
        description: 'Third-party license separation.',
      },
      {
        title: 'Provenance-Sensitive Materials',
        href: '/docs/provenance-sensitive-materials',
        description: 'Assets requiring separate confirmation.',
      },
    ],
  },
  {
    slug: 'release-verification',
    navigationTitle: 'Release Verification',
    eyebrow: 'Distribution',
    title: 'Release Verification',
    description: 'The categories that must be resolved before a build is described as a release, and the assumptions that are not allowed.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'categories',
        title: 'Verification categories',
        body: [
          'A package should be checked by category: the root license, the README legal summary, third-party license texts, provenance-sensitive assets, runtime dependencies, package metadata, application icons, shaders, bundled resources, the executable or bundle structure, and native extensions. The macOS path additionally checks required fonts, wgpu sources, the icon, and Darwin-only dependencies.',
        ],
      },
      {
        id: 'forbidden-assumptions',
        title: 'Assumptions that are not allowed',
        body: [
          'Public repository visibility does not mean open-source status; build success does not mean redistribution permission; including a third-party license text does not mean all third-party material is cleared; a fork build is not official; and user-created output does not remove restrictions on embedded protected material.',
        ],
      },
      {
        id: 'wording',
        title: 'Release wording',
        body: [
          'Use verified status terms: local build for a user build, generated artifact for an unverified output, Desktop Distribution for a package prepared for distribution, and Official Distribution only when the Licensor has actually published it.',
        ],
      },
    ],
    references: [
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'Controls permission wording.',
      },
      {
        title: 'Legal Materials in Distribution',
        href: '/docs/legal-materials-in-distribution',
        description: 'The legal files to verify.',
      },
      {
        title: 'Audit and Check Commands',
        href: '/docs/audit-and-check-commands',
        description: 'The repository checks that support verification.',
      },
    ],
  },
  {
    slug: 'build-failure-boundaries',
    navigationTitle: 'Build Failure Boundaries',
    eyebrow: 'Distribution',
    title: 'Build Failure Boundaries',
    description: 'What the build and packaging checks enforce, and why a local launch does not prove distribution eligibility.',
    searchSection: 'Distribution',
    sections: [
      {
        id: 'required-inputs',
        title: 'Required inputs',
        body: [
          'The build fails when a required bundle input is missing. The macOS packaging check fails on a missing required input, a missing or wrong-type icon, missing Darwin-only dependencies, or a missing required term in the PyInstaller command, and it lists the checked paths.',
        ],
      },
      {
        id: 'platform-separation',
        title: 'Platform separation',
        body: [
          'The Windows and macOS builds differ in runtime dependencies, renderer backend, and packaging behavior. A successful result on one platform is not generalized to the other; each platform is verified on its own.',
        ],
      },
      {
        id: 'launch-not-eligibility',
        title: 'Launch is not eligibility',
        body: [
          'A successful local launch of an executable or bundle does not prove legal distribution eligibility. Distribution permission and the included-material terms must be resolved separately from whether the artifact runs.',
        ],
      },
    ],
    references: [
      {
        title: 'macOS Application Bundle',
        href: '/docs/macos-application-bundle',
        description: 'The macOS packaging requirements.',
      },
      {
        title: 'Release Verification',
        href: '/docs/release-verification',
        description: 'The pre-release verification categories.',
      },
      {
        title: 'Resource and Shader Checks',
        href: '/docs/resource-and-shader-checks',
        description: 'The repository checks for resources and shaders.',
      },
    ],
  },
];
