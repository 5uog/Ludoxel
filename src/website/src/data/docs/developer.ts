/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const developerPages: DocsPageContent[] = [
  {
    slug: 'source-structure',
    navigationTitle: 'Source Structure',
    eyebrow: 'Developer',
    title: 'Source Structure',
    description: 'The repository layout for the Ludoxel application source, assets, legal files, third-party license texts, and tooling.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'top-level',
        title: 'Top-level layout',
        body: [
          'The repository holds application source under `src/ludoxel/`, reusable assets under `assets/`, legal and policy files at the root and under `.github/`, third-party license text under `third-party/`, and project tooling under `tools/`. Public text uses these actual paths when describing the application, distribution tooling, or legal material.',
        ],
      },
      {
        id: 'layers',
        title: 'Application layers',
        body: [
          'The `src/ludoxel/` package is organized into `foundations`, `application`, `simulation`, and `presentation`. Foundations owns low-level identity, paths, diagnostics, and mathematics. Application owns bootstrap, preferences, persistence, sessions, and orchestration. Simulation owns gameplay rules, worlds, blocks, inventories, actors, AI, and play spaces. Presentation owns the PyQt interface, audio, rendering, and resources.',
        ],
      },
      {
        id: 'path-accuracy',
        title: 'Path accuracy',
        body: ['A page must cite a real path, not an old, guessed, or moved one. Where a path cannot be verified, the claim is omitted rather than stated.'],
      },
    ],
    references: [
      {
        title: 'Runtime Responsibility Boundaries',
        href: '/docs/runtime-responsibility-boundaries',
        description: 'The dependency direction between layers.',
      },
      {
        title: 'Tooling Overview',
        href: '/docs/tooling-overview',
        description: 'The repository tooling.',
      },
      {
        title: 'Session State Ownership',
        href: '/docs/session-state-ownership',
        description: 'How ownership applies at runtime.',
      },
    ],
  },
  {
    slug: 'runtime-responsibility-boundaries',
    navigationTitle: 'Runtime Responsibility Boundaries',
    eyebrow: 'Developer',
    title: 'Runtime Responsibility Boundaries',
    description: 'The dependency direction between the four layers and the single composition-root exception.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'direction',
        title: 'Dependency direction',
        body: [
          'Dependencies flow downward: presentation may use application, simulation, and foundations; application may use simulation and foundations; simulation may use foundations only; foundations depends on no other Ludoxel layer. Lower layers do not import higher layers.',
        ],
      },
      {
        id: 'composition-root',
        title: 'Composition root',
        body: [
          'The only exception is the composition root in the application bootstrap, which connects to the presentation entry point to start the window. This exception does not extend to persistence, preferences, sessions, runners, stores, or schema.',
        ],
      },
      {
        id: 'why',
        title: 'Why the boundary holds',
        body: [
          'Because simulation does not depend on Qt, renderer backends, audio, or save paths, the rules stay portable and testable, and a presentation or persistence change cannot silently rewrite a rule. This is the same separation that lets the renderer differ per platform.',
        ],
      },
    ],
    references: [
      {
        title: 'Source Structure',
        href: '/docs/source-structure',
        description: 'The layer layout.',
      },
      {
        title: 'Session State Ownership',
        href: '/docs/session-state-ownership',
        description: 'How ownership shows up at runtime.',
      },
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'The platform-specific presentation layer.',
      },
    ],
  },
  {
    slug: 'repository-policy',
    navigationTitle: 'Repository Policy',
    eyebrow: 'Developer',
    title: 'Repository Policy',
    description: 'How the repository is governed: an all-rights-reserved project that is not an open contribution project.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'governance',
        title: 'Governance',
        body: [
          'The repository is governed by the independent all-rights-reserved license in the root `LICENSE`, and it is not maintained as an open source or community contribution project. Public GitHub visibility and the GitHub Platform Terms do not grant permission to Use the Original Materials beyond the License.',
        ],
      },
      {
        id: 'policy-files',
        title: 'Policy files',
        body: [
          'The policy documents live under `.github/`: a contribution policy, a security reporting policy, a pull request policy, and issue templates. They state how the repository accepts reports and questions and how it declines external contributions.',
        ],
      },
      {
        id: 'maintainer',
        title: 'Maintainer',
        body: [
          'The Maintainer is the Licensor acting in the capacity of administering the repository, including triaging a public issue and handling a security report. There is no separate maintainer team.',
        ],
      },
    ],
    references: [
      {
        title: 'GitHub Policy Files',
        href: '/docs/github-policy-files',
        description: 'The files under .github.',
      },
      {
        title: 'Contribution Boundary',
        href: '/docs/contribution-boundary',
        description: 'How contributions are declined.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
    ],
  },
  {
    slug: 'audit-and-check-commands',
    navigationTitle: 'Audit and Check Commands',
    eyebrow: 'Developer',
    title: 'Audit and Check Commands',
    description: 'The repository check commands run locally and in CI, and what each one covers.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'check',
        title: 'The check command',
        body: [
          'The `npm run check` command runs the full set of repository checks: format checking, linting, the tooling tests, and the package, docs, license, resources, and shader checks. The `npm run ci` command runs the same set.',
        ],
        items: [
          '`npm run check` — format check, lint, tools test, package check, docs check, license check, resources check, shader check.',
          '`npm run ci` — runs `npm run check`.',
          '`npm run package:check` — packaging metadata check.',
          '`npm run docs:check` — documentation check.',
          '`npm run license:check` — legal material check.',
          '`npm run resources:check` and `npm run shader:check` — resource and shader checks.',
        ],
      },
      {
        id: 'lint-and-format',
        title: 'Lint and format',
        body: ['Linting runs JavaScript, CSS, and Python lint. Formatting runs the web and Python formatters, with check variants that fail rather than rewrite.'],
        items: [
          '`npm run lint` — `lint:js`, `lint:css`, and `lint:py`.',
          '`npm run format` and `npm run format:check` — web and Python formatting.',
          '`npm run format:web:check` and `npm run format:py:check` — per-language format checks.',
        ],
      },
      {
        id: 'scope',
        title: 'Scope',
        body: ['These commands are repository-facing developer operations. They are not part of the application a general user runs.'],
      },
    ],
    references: [
      {
        title: 'Tooling Overview',
        href: '/docs/tooling-overview',
        description: 'The tools behind these commands.',
      },
      {
        title: 'CI and Dependency Policy',
        href: '/docs/ci-and-dependency-policy',
        description: 'How CI runs these checks.',
      },
      {
        title: 'Release Verification',
        href: '/docs/release-verification',
        description: 'Verification before a release.',
      },
    ],
  },
  {
    slug: 'tooling-overview',
    navigationTitle: 'Tooling Overview',
    eyebrow: 'Developer',
    title: 'Tooling Overview',
    description: 'The Node.js tools under the tools directory and the categories they cover.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'tool-categories',
        title: 'Tool categories',
        body: ['The repository tooling lives under `tools/` and is invoked through the npm scripts. Each tool keeps a script entry, argument parsing, validation, services, and shared helpers.'],
        items: [
          '`tools/build_desktop_app` — desktop packaging for Windows and macOS.',
          '`tools/build_native_extensions` — building and verifying native extensions.',
          '`tools/check_project` — package, docs, legal, resources, and shader checks.',
          '`tools/clean_build_artifacts` — cleaning build outputs.',
          '`tools/convert_audio_assets` — audio asset conversion and checking.',
          '`tools/export_directory_markdown` — directory export and its tests.',
          '`tools/format_python_source` and `tools/format_web_source` — formatting and linting.',
          '`tools/generate_block_thumbnails` — block thumbnail generation and checking.',
          '`tools/help_commands` — the command help listing.',
        ],
      },
      {
        id: 'script-alignment',
        title: 'Script alignment',
        body: ['The npm scripts map to real tool entry points; a script does not assume a tool path or command that does not exist. The help command lists the available repository commands.'],
      },
    ],
    references: [
      {
        title: 'Build Tools',
        href: '/docs/build-tools',
        description: 'The build and native-extension tools.',
      },
      {
        title: 'Formatting and Linting Tools',
        href: '/docs/formatting-and-linting-tools',
        description: 'The formatting and lint tools.',
      },
      {
        title: 'Resource and Shader Checks',
        href: '/docs/resource-and-shader-checks',
        description: 'The check_project checks.',
      },
    ],
  },
  {
    slug: 'build-tools',
    navigationTitle: 'Build Tools',
    eyebrow: 'Developer',
    title: 'Build Tools',
    description: 'The desktop build, native-extension build, and clean tools, and their commands.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'desktop',
        title: 'Desktop build',
        body: [
          'The desktop build tool packages the Windows executable and the macOS bundle through PyInstaller and copies the legal material into the target. The macOS check command verifies packaging inputs without performing a full build.',
        ],
        items: [
          '`npm run build:windows` — build the Windows executable.',
          '`npm run build:macos` — build the macOS application bundle.',
          '`npm run build:macos:check` — verify macOS packaging inputs.',
        ],
      },
      {
        id: 'native-and-clean',
        title: 'Native extensions and clean',
        body: ['The native-extension tool builds and verifies the optional compiled modules, and the clean tool removes build outputs.'],
        items: ['`npm run build:native` and `npm run build:native:check` — build and verify native extensions.', '`npm run clean` and `npm run clean:check` — clean build artifacts and check.'],
      },
      {
        id: 'platform-separation',
        title: 'Platform separation',
        body: ['Windows and macOS builds differ in runtime dependencies and renderer backend, so a result on one platform is not generalized to the other.'],
      },
    ],
    references: [
      {
        title: 'PyInstaller Build Flow',
        href: '/docs/pyinstaller-build-flow',
        description: 'How the desktop build invokes PyInstaller.',
      },
      {
        title: 'Native Extensions',
        href: '/docs/native-extensions',
        description: 'The runtime contract for extensions.',
      },
      {
        title: 'Build Failure Boundaries',
        href: '/docs/build-failure-boundaries',
        description: 'What the build checks enforce.',
      },
    ],
  },
  {
    slug: 'formatting-and-linting-tools',
    navigationTitle: 'Formatting and Linting Tools',
    eyebrow: 'Developer',
    title: 'Formatting and Linting Tools',
    description: 'The web and Python formatting and lint tools and the configuration files they use.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'web',
        title: 'Web formatting and linting',
        body: [
          'The web tooling runs ESLint, Stylelint, and Prettier, configured by `eslint.config.cjs`, `stylelint.config.cjs`, `.prettierrc.json`, and `.prettierignore`. The lint and format commands have fix and check variants.',
        ],
      },
      {
        id: 'python',
        title: 'Python formatting and linting',
        body: ['The Python tooling runs Ruff for formatting and linting through a wrapper that resolves a pinned Ruff release. The format and lint commands cover the application source.'],
      },
      {
        id: 'aggregate',
        title: 'Aggregate commands',
        body: [
          'The aggregate `npm run lint` runs the JavaScript, CSS, and Python lints, and `npm run format` runs the web and Python formatters. The check variants are used in CI so a formatting drift fails rather than rewrites files.',
        ],
      },
    ],
    references: [
      {
        title: 'Audit and Check Commands',
        href: '/docs/audit-and-check-commands',
        description: 'How these run as part of check.',
      },
      {
        title: 'Tooling Overview',
        href: '/docs/tooling-overview',
        description: 'The full tool list.',
      },
      {
        title: 'CI and Dependency Policy',
        href: '/docs/ci-and-dependency-policy',
        description: 'How CI runs them.',
      },
    ],
  },
  {
    slug: 'resource-and-shader-checks',
    navigationTitle: 'Resource and Shader Checks',
    eyebrow: 'Developer',
    title: 'Resource and Shader Checks',
    description: 'The package, docs, legal, resource, and shader checks under the project check tool.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'checks',
        title: 'Project checks',
        body: ['The project check tool provides package, docs, legal, resources, and shader checks, each invoked by its own npm script and bundled into the full check command.'],
        items: [
          '`npm run package:check` — packaging metadata consistency.',
          '`npm run docs:check` — documentation consistency.',
          '`npm run license:check` — legal material consistency.',
          '`npm run resources:check` — resource presence and placement.',
          '`npm run shader:check` — shader policy.',
        ],
      },
      {
        id: 'packaging-inputs',
        title: 'Packaging inputs',
        body: [
          'The theme stylesheets, shaders, Othello resources, and learning resources are declared as package data in `MANIFEST.in` and `pyproject.toml`. The resource and shader checks help keep these consistent with what the build expects.',
        ],
      },
      {
        id: 'role',
        title: 'Role',
        body: ['These checks support release verification by catching missing or misplaced resources before a build is described as a release.'],
      },
    ],
    references: [
      {
        title: 'Audit and Check Commands',
        href: '/docs/audit-and-check-commands',
        description: 'The full check command.',
      },
      {
        title: 'Release Verification',
        href: '/docs/release-verification',
        description: 'Verification before release.',
      },
      {
        title: 'Build Failure Boundaries',
        href: '/docs/build-failure-boundaries',
        description: 'What the build enforces.',
      },
    ],
  },
  {
    slug: 'github-policy-files',
    navigationTitle: 'GitHub Policy Files',
    eyebrow: 'Developer',
    title: 'GitHub Policy Files',
    description: 'The policy documents and issue forms under the .github directory and what each one governs.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'documents',
        title: 'Policy documents',
        body: [
          'The `.github/` directory holds the contribution policy, the security reporting policy, and the pull request policy, each stating that it is subordinate to the root `LICENSE` for Original Materials.',
        ],
        items: [
          '`.github/CONTRIBUTING.md` — states that external contributions are not accepted.',
          '`.github/SECURITY.md` — the Security Reporting Policy.',
          '`.github/pull_request_template.md` — the pull request policy.',
        ],
      },
      {
        id: 'issue-forms',
        title: 'Issue forms',
        body: ['The issue templates are GitHub issue forms that constrain public reports. Blank issues are disabled, so a reporter must use one of the forms.'],
        items: [
          '`.github/ISSUE_TEMPLATE/problem-report.yml` — a limited problem report.',
          '`.github/ISSUE_TEMPLATE/limited-question.yml` — a limited question.',
          '`.github/ISSUE_TEMPLATE/security-contact.yml` — a private-channel request.',
          '`.github/ISSUE_TEMPLATE/config.yml` — disables blank issues.',
        ],
      },
      {
        id: 'subordination',
        title: 'Subordination',
        body: [
          'Each policy document states that if it conflicts with the License Text, the License Text controls for the Original Materials, and that the GitHub Platform Terms do not expand permissions.',
        ],
      },
    ],
    references: [
      {
        title: 'Repository Policy',
        href: '/docs/repository-policy',
        description: 'How the repository is governed.',
      },
      {
        title: 'Contribution Boundary',
        href: '/docs/contribution-boundary',
        description: 'The contribution policy.',
      },
      {
        title: 'Security Reporting for Maintainers',
        href: '/docs/security-reporting-for-maintainers',
        description: 'The security policy.',
      },
    ],
  },
  {
    slug: 'ci-and-dependency-policy',
    navigationTitle: 'CI and Dependency Policy',
    eyebrow: 'Developer',
    title: 'CI and Dependency Policy',
    description: 'The continuous-integration workflow and the dependency update policy.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'ci',
        title: 'Continuous integration',
        body: [
          'The CI workflow runs on pull requests, pushes to the main branch, and manual dispatch. It checks out the repository, sets up Node and Python, installs the package, and runs `npm run ci`, which runs the full check command. The workflow uses read-only permissions and cancels superseded runs.',
        ],
      },
      {
        id: 'dependencies',
        title: 'Dependency updates',
        body: [
          'Dependency updates are configured for the npm, pip, and GitHub Actions ecosystems on a weekly schedule, each with a limited number of open update pull requests and a scoped commit message prefix.',
        ],
      },
      {
        id: 'scope',
        title: 'Scope',
        body: ['CI and dependency configuration are repository-maintenance concerns. They do not change how the application runs for a general user.'],
      },
    ],
    references: [
      {
        title: 'Audit and Check Commands',
        href: '/docs/audit-and-check-commands',
        description: 'The checks CI runs.',
      },
      {
        title: 'Repository Policy',
        href: '/docs/repository-policy',
        description: 'How the repository is governed.',
      },
      {
        title: 'Tooling Overview',
        href: '/docs/tooling-overview',
        description: 'The tools CI invokes.',
      },
    ],
  },
  {
    slug: 'readme-role',
    navigationTitle: 'README Role',
    eyebrow: 'Developer',
    title: 'README Role',
    description: 'What the root README is for: the public overview and the legal entry point, not an operations manual.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'role',
        title: 'Role',
        body: [
          'The root README is the public overview and the legal entry point for the repository. It introduces the application and points to the root `LICENSE`, the third-party license texts, and the `.github/` policy documents.',
        ],
      },
      {
        id: 'not-a-manual',
        title: 'Not an operations manual',
        body: [
          'The README is not an install guide, command catalog, module catalog, parameter catalog, or roadmap, and it does not define legal permission. It directs the reader to the controlling files rather than restating their terms.',
        ],
      },
      {
        id: 'legal-entry',
        title: 'Legal entry point',
        body: [
          'The README explains the relationship between the Original Materials, third-party materials, provenance-sensitive assets, runtime user data, application output, distribution legal material, and repository policy, and it makes clear that the License Text controls for the Original Materials.',
        ],
      },
    ],
    references: [
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
      {
        title: 'Third-Party Materials',
        href: '/docs/third-party-materials',
        description: 'The third-party records the README points to.',
      },
      {
        title: 'Repository Policy',
        href: '/docs/repository-policy',
        description: 'The policy documents the README points to.',
      },
    ],
  },
  {
    slug: 'contribution-boundary',
    navigationTitle: 'Contribution Boundary',
    eyebrow: 'Developer',
    title: 'Contribution Boundary',
    description: 'The maintainer-facing statement that external contributions are not accepted and how submissions are handled.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'not-accepted',
        title: 'Not accepted',
        body: [
          'External contributions are not accepted. The contribution policy and the pull request policy state that Contribution Materials, including pull requests, patches, source or documentation changes, translations, assets, generated files, datasets, feature implementations, refactoring proposals, shader rewrites, saved worlds, and AI-generated material, are not accepted.',
        ],
      },
      {
        id: 'handling',
        title: 'Handling',
        body: [
          'A pull request may be closed without review, and a public issue that proposes or submits Contribution Materials may also be closed without review. Submission does not grant permission to Use the Original Materials.',
        ],
      },
      {
        id: 'public-issues',
        title: 'Public issues',
        body: ['Public issues are limited to a problem report, a limited question, or a private-channel request for a security report. They are not a contribution channel.'],
      },
    ],
    references: [
      {
        title: 'External Contribution Boundary',
        href: '/docs/external-contribution-boundary',
        description: 'The legal view of contributions.',
      },
      {
        title: 'GitHub Policy Files',
        href: '/docs/github-policy-files',
        description: 'The policy documents.',
      },
      {
        title: 'Unsupported Requests',
        href: '/docs/unsupported-requests',
        description: 'The support view of out-of-scope requests.',
      },
    ],
  },
  {
    slug: 'security-reporting-for-maintainers',
    navigationTitle: 'Security Reporting for Maintainers',
    eyebrow: 'Developer',
    title: 'Security Reporting for Maintainers',
    description: 'The Security Reporting Policy: supported scope, the private reporting channel, report contents, and out-of-scope reports.',
    searchSection: 'Developer',
    sections: [
      {
        id: 'scope',
        title: 'Supported scope',
        body: [
          'A Security Report is supported only for the Current Repository and an Official Distribution. It may concern repository source, packaging configuration, native-extension build configuration, distribution material, shader or resource loading, runtime data handling, or dependency-related security issues when the issue materially affects the supported scope.',
        ],
      },
      {
        id: 'channel-and-contents',
        title: 'Channel and contents',
        body: [
          'Reports use a private reporting channel when available, such as GitHub private vulnerability reporting or a security advisory; otherwise only a minimal public contact request is opened. A report may include a concise description, the affected file or component, reproduction steps, the expected impact, and relevant environment details, without unrelated personal data or credentials.',
        ],
      },
      {
        id: 'out-of-scope',
        title: 'Out-of-scope and handling',
        body: [
          "Feature requests, code-quality comments, license objections, reports about unofficial forks, reports requiring unauthorized access, destructive testing, denial of service, and bare scanner output are out of scope. A report may be reviewed, accepted, rejected, or closed at the Maintainer's discretion, with no promised timeline, bounty, or acknowledgement.",
        ],
      },
    ],
    references: [
      {
        title: 'Security Reports',
        href: '/docs/security-reports',
        description: 'The legal scope of a security report.',
      },
      {
        title: 'Security Contact',
        href: '/docs/security-contact',
        description: 'How a reporter requests a private channel.',
      },
      {
        title: 'GitHub Policy Files',
        href: '/docs/github-policy-files',
        description: 'The policy documents.',
      },
    ],
  },
];
