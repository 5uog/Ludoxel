/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const legalPages: DocsPageContent[] = [
  {
    slug: 'license-authority',
    navigationTitle: 'License Authority',
    eyebrow: 'Legal',
    title: 'License Authority',
    description: 'The controlling legal authority for Ludoxel Original Materials and the strict subordination of all public text to the root LICENSE.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'controlling-text',
        title: 'Controlling text',
        body: [
          'The root `LICENSE` file contains the controlling English License Text for the Ludoxel Original Materials. README summaries, UI labels, package metadata, generated files, comments, issue templates, translations, and these documentation pages do not replace, expand, or weaken that License Text.',
          'The identifier `LicenseRef-All-Rights-Reserved` is the repository-specific identifier for the Ludoxel Independent License. It does not mean MIT, Apache-2.0, BSD, GPL, AGPL, LGPL, MPL, Creative Commons, a public-domain dedication, or any other open-source or public-content license.',
        ],
      },
      {
        id: 'rights-reserved',
        title: 'Rights reserved',
        body: [
          'Public availability of source files, object files, assets, documentation, issue forms, build scripts, or repository metadata grants no permission beyond what the root `LICENSE` expressly states. Technical access is not legal authorization, and no right is granted by implication, repository visibility, or platform functionality.',
        ],
      },
      {
        id: 'subordination',
        title: 'Documentary subordination',
        body: [
          'Every public page is subordinate to the root `LICENSE` for Original Materials. These pages may summarize categories and direct the reader to the controlling file; they do not create an alternate license, an informal exception, an implied waiver, or a permissive interpretation.',
        ],
      },
    ],
    references: [
      {
        title: 'Ordinary Application Use',
        href: '/docs/ordinary-application-use',
        description: 'The narrow ordinary-use permission.',
      },
      {
        title: 'Prohibited Use',
        href: '/docs/prohibited-use',
        description: 'Uses outside the granted permission.',
      },
      {
        title: 'Controlling Text',
        href: '/docs/controlling-text',
        description: 'How conflicts are resolved.',
      },
    ],
  },
  {
    slug: 'ordinary-application-use',
    navigationTitle: 'Ordinary Application Use',
    eyebrow: 'Legal',
    title: 'Ordinary Application Use',
    description: 'The narrow permission to run Ludoxel as a desktop application, and the limits that permission does not exceed.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'definition',
        title: 'Definition',
        body: [
          'Ordinary Application Use is using Ludoxel as a desktop application for its ordinary interactive functions: launching it, using its user interface, changing settings, saving and loading user-specific data, taking ordinary screenshots, recording ordinary screen footage, and performing directly related local actions.',
        ],
      },
      {
        id: 'non-expansion',
        title: 'Non-expansion',
        body: [
          'Ordinary use does not grant permission to copy source code, extract protected assets, modify repository materials, redistribute builds, publish mirrors, sublicense content, conduct AI Use on protected materials, build datasets, or represent derivative material as original work.',
        ],
      },
      {
        id: 'user-output',
        title: 'User output',
        body: [
          'User-Created Materials and ordinary Application Output may remain user-specific, but any embedded Ludoxel material, third-party material, user interface material, texture material, font material, audio material, or provenance-sensitive material keeps its own legal restrictions.',
        ],
      },
    ],
    references: [
      {
        title: 'User-Created Materials',
        href: '/docs/user-created-materials',
        description: 'Materials a user creates through ordinary use.',
      },
      {
        title: 'Application Output',
        href: '/docs/application-output',
        description: 'Output produced through ordinary use.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
    ],
  },
  {
    slug: 'prohibited-use',
    navigationTitle: 'Prohibited Use',
    eyebrow: 'Legal',
    title: 'Prohibited Use',
    description: 'Uses of the Original Materials outside the limited grant, which are prohibited absent a separate signed authorization.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'excluded-uses',
        title: 'Excluded uses',
        body: [
          'Unless separately authorized in a written instrument signed by the Licensor, the following are outside the granted permission: reuse, modification, adaptation, translation, restructuring, refactoring, optimization, compilation, bundling, embedding, publication, distribution, transmission, sublicensing, sale, rental, lending, hosting, deployment, incorporation, resource extraction, asset extraction, reverse engineering, decompilation, disassembly, and the preparation of Derivative Works.',
        ],
      },
      {
        id: 'representation',
        title: 'Attribution and naming',
        body: [
          "The Licensee must not represent the Original Materials or any Derivative Work as the Licensee's own work, and must not remove or alter copyright statements, license statements, SPDX identifiers, attribution, or other legal markings. The project name, application name, branding, and icons must not be used to suggest endorsement, affiliation, or authorization where none exists.",
        ],
      },
      {
        id: 'reservation',
        title: 'Reservation of rights',
        body: [
          'All copyrights, trademark rights, database rights, and other protectable rights in the Original Materials are reserved by the Licensor. Any Use outside the limited grant is prohibited.',
        ],
      },
    ],
    references: [
      {
        title: 'AI Use Restrictions',
        href: '/docs/ai-use-restrictions',
        description: 'The specific AI Use prohibition.',
      },
      {
        title: 'External Contribution Boundary',
        href: '/docs/external-contribution-boundary',
        description: 'Why submissions are not accepted.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
    ],
  },
  {
    slug: 'ai-use-restrictions',
    navigationTitle: 'AI Use Restrictions',
    eyebrow: 'Legal',
    title: 'AI Use Restrictions',
    description: 'The prohibition on using the Original Materials for external artificial-intelligence systems, and the separation from the in-application AI Learning feature.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'ai-use',
        title: 'AI Use is prohibited',
        body: [
          'The Licensee must not conduct AI Use of the Original Materials, Repository Contents, Distribution Materials, Derivative Works, or protected Application Output. This covers using such material to create, train, fine-tune, evaluate, benchmark, validate, test, improve, populate, operate, index, retrieve for, or generate data for any artificial-intelligence system, machine-learning system, generative model, code model, image model, multimodal model, search index, embedding system, vector database, dataset, benchmark, evaluation suite, or synthetic-data pipeline.',
        ],
      },
      {
        id: 'regardless-of-role',
        title: 'Regardless of data role',
        body: [
          'The prohibition applies whether the material is used as input data, training data, fine-tuning data, evaluation data, benchmark data, validation data, retrieval material, embedding material, synthetic-data seed material, or comparable computational material.',
        ],
      },
      {
        id: 'feature-separation',
        title: 'Separation from AI Learning',
        body: [
          'The in-application AI Learning system is an internal gameplay system for AI NPC behavior. It is not permission to use Ludoxel Original Materials or protected Application Output for any external artificial-intelligence or machine-learning purpose.',
        ],
      },
    ],
    references: [
      {
        title: 'AI Learning',
        href: '/docs/ai-learning',
        description: 'The internal gameplay system.',
      },
      {
        title: 'Prohibited Use',
        href: '/docs/prohibited-use',
        description: 'The broader prohibition.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
    ],
  },
  {
    slug: 'distribution-materials',
    navigationTitle: 'Distribution Materials',
    eyebrow: 'Legal',
    title: 'Distribution Materials',
    description: 'How Distribution Materials that contain Original Materials remain subject to the License.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'definition',
        title: 'Definition',
        body: [
          'Distribution Materials are application bundles, executable files, installers, archives, wheels, source distributions, generated distribution directories, packages, release artifacts, embedded resources, copied legal materials, and metadata prepared for distribution of Ludoxel or Repository Contents.',
        ],
      },
      {
        id: 'remain-subject',
        title: 'They remain subject to the License',
        body: [
          'Distribution Materials that contain Original Materials remain subject to the root `LICENSE`. Packaging, bundling, compilation, copying into a distribution directory, embedding in an application bundle, or inclusion in an archive does not create any additional license or permission.',
        ],
      },
      {
        id: 'inclusion-not-permission',
        title: 'Inclusion is not permission',
        body: [
          'Including License Text, third-party license texts, SPDX identifiers, package metadata, or other legal materials in Distribution Materials does not itself grant distribution permission. A party authorized to distribute is responsible for confirming that the distribution remains authorized and that all required legal materials are included.',
        ],
      },
    ],
    references: [
      {
        title: 'Official Distribution',
        href: '/docs/official-distribution',
        description: 'What makes a distribution official.',
      },
      {
        title: 'Legal Materials in Distribution',
        href: '/docs/legal-materials-in-distribution',
        description: 'The legal files in a build.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
    ],
  },
  {
    slug: 'official-distribution',
    navigationTitle: 'Official Distribution',
    eyebrow: 'Legal',
    title: 'Official Distribution',
    description: 'The narrow meaning of an Official Distribution and why a fork, mirror, or local build is not one.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'definition',
        title: 'Definition',
        body: [
          'An Official Distribution is Distribution Materials, including any Desktop Distribution, that the Licensor has published as an official distribution of Ludoxel. Only the Licensor may publish an Official Distribution.',
        ],
      },
      {
        id: 'not-official',
        title: 'What is not official',
        body: [
          'Forks, mirrors, modified versions, re-packed archives, and other third-party redistributions are not an Official Distribution and are not endorsed by the Licensor, even when derived from the Current Repository.',
        ],
      },
      {
        id: 'build-success',
        title: 'Build success is not official status',
        body: ['A local build that completes successfully is a local build, not an Official Distribution. Running, building, or containing Ludoxel files does not confer official status.'],
      },
    ],
    references: [
      {
        title: 'Distribution Materials',
        href: '/docs/distribution-materials',
        description: 'The materials this status applies to.',
      },
      {
        title: 'Release Verification',
        href: '/docs/release-verification',
        description: 'The verification before a release claim.',
      },
      {
        title: 'Desktop Distribution Overview',
        href: '/docs/desktop-distribution-overview',
        description: 'The build that produces these materials.',
      },
    ],
  },
  {
    slug: 'third-party-materials',
    navigationTitle: 'Third-Party Materials',
    eyebrow: 'Legal',
    title: 'Third-Party Materials',
    description: 'How third-party license terms remain separate from the License governing the Original Materials.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'definition',
        title: 'Definition',
        body: [
          'Third-Party Materials are materials that are not Original Materials and that are owned, authored, licensed, maintained, or supplied by a third party, including external libraries, runtime environments, software development kits, toolchain components, fonts, packages, vendor materials, and external images, audio, textures, or icons.',
        ],
      },
      {
        id: 'separation',
        title: 'License separation',
        body: [
          'Third-party licenses do not relicense the Ludoxel Original Materials, and the Ludoxel Independent License does not alter third-party license terms. A distribution that includes both must satisfy each category separately. Third-party license texts are retained in their original form under the `third-party` directory and are not License Text.',
        ],
      },
      {
        id: 'records',
        title: 'Known records',
        body: [
          'The repository retains the third-party license text for the Kaisei Opti font at `third-party/kaisei-opti/LICENSE.txt` under the SIL Open Font License 1.1. The README also identifies runtime and toolchain components, such as CPython, PyQt6, Qt components, NumPy, PyOpenGL, wgpu, rendercanvas, PyInstaller, Ruff, Node.js, ESLint, Stylelint, and Prettier, whose exact terms, versions, bundling eligibility, and redistribution conditions require separate confirmation before distribution.',
        ],
      },
    ],
    references: [
      {
        title: 'Provenance-Sensitive Materials',
        href: '/docs/provenance-sensitive-materials',
        description: 'Assets that require separate confirmation.',
      },
      {
        title: 'Legal Materials in Distribution',
        href: '/docs/legal-materials-in-distribution',
        description: 'Third-party files in a build.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The license for Original Materials.',
      },
    ],
  },
  {
    slug: 'provenance-sensitive-materials',
    navigationTitle: 'Provenance-Sensitive Materials',
    eyebrow: 'Legal',
    title: 'Provenance-Sensitive Materials',
    description: 'Local assets whose source, rights, trademark status, or redistribution eligibility requires separate confirmation before reuse or distribution.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'rule',
        title: 'The rule',
        body: [
          'Provenance-Sensitive Materials are materials whose authorship, source, rights holder, license status, redistribution permission, modification permission, trademark status, attribution requirements, or distribution eligibility requires separate confirmation before reuse or distribution. Their presence in the repository or use by the application does not make them freely reusable.',
        ],
      },
      {
        id: 'minecraft-named',
        title: 'Minecraft-named assets',
        body: [
          'At minimum, the README treats the materials under `assets/minecraft/` and the font files under `assets/fonts/` that contain Minecraft names as Provenance-Sensitive Materials. They must not be described as Ludoxel Original Materials, public-domain materials, open-source materials, freely redistributable materials, or materials cleared for extraction.',
        ],
      },
      {
        id: 'distribution-effect',
        title: 'Distribution effect',
        body: [
          'A packaged executable or bundle may technically include such assets, but technical inclusion is not legal clearance. Before distribution, the rights status, license, trademark implications, modification permission, attribution, and redistribution eligibility of each provenance-sensitive material must be resolved.',
        ],
      },
    ],
    references: [
      {
        title: 'Third-Party Materials',
        href: '/docs/third-party-materials',
        description: 'Third-party license separation.',
      },
      {
        title: 'Legal Materials in Distribution',
        href: '/docs/legal-materials-in-distribution',
        description: 'Assets inside a build.',
      },
      {
        title: 'Release Verification',
        href: '/docs/release-verification',
        description: 'Resolving asset status before release.',
      },
    ],
  },
  {
    slug: 'user-created-materials',
    navigationTitle: 'User-Created Materials',
    eyebrow: 'Legal',
    title: 'User-Created Materials',
    description: 'The legal treatment of materials a user creates through ordinary use, and the protected material that may remain embedded in them.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'definition',
        title: 'Definition',
        body: [
          'User-Created Materials are materials independently created, entered, edited, supplied, imported, or saved by a Licensee through Ordinary Application Use, including player names, settings, key bindings, window state, save data, world edits, imported skins, user-created text, user-created images, and user-created recordings.',
        ],
      },
      {
        id: 'not-original',
        title: 'Not Original Materials',
        body: [
          "User-Created Materials do not become Original Materials merely because they are entered, edited, displayed, saved, imported, exported, recorded, or processed through Ludoxel. Subject to the License and applicable third-party rights, the Licensee may use, reproduce, publish, and share the Licensee's own User-Created Materials.",
        ],
      },
      {
        id: 'embedded',
        title: 'Embedded protected material',
        body: [
          'If User-Created Materials contain any material part of the Original Materials, Third-Party Materials, Provenance-Sensitive Materials, user interface text, visual assets, bundled resources, textures, branding, icons, or shaders, the included protected material remains subject to its applicable legal terms. The License does not represent that such materials are free of third-party rights or suitable for any specific purpose.',
        ],
      },
    ],
    references: [
      {
        title: 'Application Output',
        href: '/docs/application-output',
        description: 'Output produced through ordinary use.',
      },
      {
        title: 'Ordinary Application Use',
        href: '/docs/ordinary-application-use',
        description: 'The use that produces these materials.',
      },
      {
        title: 'Provenance-Sensitive Materials',
        href: '/docs/provenance-sensitive-materials',
        description: 'Embedded assets that need confirmation.',
      },
    ],
  },
  {
    slug: 'application-output',
    navigationTitle: 'Application Output',
    eyebrow: 'Legal',
    title: 'Application Output',
    description: 'The legal treatment of output produced through ordinary use, and the protected material that may remain embedded in it.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'definition',
        title: 'Definition',
        body: [
          'Application Output is output produced, displayed, recorded, or saved through Ordinary Application Use, including screenshots, screen recordings, save files, logs, configuration files, and rendered states.',
        ],
      },
      {
        id: 'user-portion',
        title: 'User-created portion',
        body: [
          "The portion of Application Output that the user independently creates is user-specific and is not treated as a project source file merely because the application produced or displayed it. Subject to the License and third-party rights, the Licensee may use and share the Licensee's own Application Output.",
        ],
      },
      {
        id: 'embedded',
        title: 'Embedded protected material',
        body: [
          'When Application Output contains Original Materials, Third-Party Materials, Provenance-Sensitive Materials, user interface material, visual assets, textures, branding, or shaders, the included protected material keeps its own legal terms. The License does not represent that the output is free of third-party rights or suitable for publication, distribution, AI Use, dataset use, or any other purpose.',
        ],
      },
    ],
    references: [
      {
        title: 'User-Created Materials',
        href: '/docs/user-created-materials',
        description: 'Materials the user creates.',
      },
      {
        title: 'Generated Application Output',
        href: '/docs/generated-application-output',
        description: 'The data view of application output.',
      },
      {
        title: 'AI Use Restrictions',
        href: '/docs/ai-use-restrictions',
        description: 'The AI Use boundary on output.',
      },
    ],
  },
  {
    slug: 'security-reports',
    navigationTitle: 'Security Reports',
    eyebrow: 'Legal',
    title: 'Security Reports',
    description: 'The scope of a Security Report, the use of a private reporting channel, and the permission boundary that reporting does not cross.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'scope',
        title: 'Scope',
        body: [
          'A Security Report is a report of a suspected security vulnerability affecting the Current Repository or an Official Distribution. Older commits, archived copies, forks, mirrors, modified versions, and unofficial deployments are outside the supported scope.',
        ],
      },
      {
        id: 'private-channel',
        title: 'Private reporting channel',
        body: [
          'Vulnerability details must not be disclosed through a Public Issue or another public channel. When GitHub private vulnerability reporting or a security advisory is available, that private channel must be used; otherwise only a minimal Public Issue requesting a private contact method may be opened, without vulnerability details.',
        ],
      },
      {
        id: 'no-expansion',
        title: 'No permission expansion',
        body: [
          'Submitting a Security Report, using a private reporting channel, or conducting lawful, non-destructive, authorized Security Testing does not grant or expand any permission to Use the Original Materials, and creates no obligation on the Maintainer to review, respond to, or remediate the report.',
        ],
      },
    ],
    references: [
      {
        title: 'Public Issues',
        href: '/docs/public-issues',
        description: 'What a public issue may contain.',
      },
      {
        title: 'Security Contact',
        href: '/docs/security-contact',
        description: 'How to request a private channel.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling permission boundary.',
      },
    ],
  },
  {
    slug: 'public-issues',
    navigationTitle: 'Public Issues',
    eyebrow: 'Legal',
    title: 'Public Issues',
    description: 'What a Public Issue is limited to, and the information it must not contain.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'scope',
        title: 'Scope',
        body: [
          'A Public Issue is limited to a problem report, a limited question, or a request for a private reporting channel for a Security Report. It is not a channel for an External Contribution, replacement text, code review submissions, asset submissions, dataset submissions, or design proposals.',
        ],
      },
      {
        id: 'exclusions',
        title: 'Exclusions',
        body: [
          'A Public Issue must not contain vulnerability details, exploit steps, proof-of-concept code, credentials, tokens, cookies, logs containing secrets, private local files, third-party confidential information, or other information unsuitable for public disclosure.',
        ],
      },
      {
        id: 'platform',
        title: 'Platform features are not permission',
        body: ['The availability of public issue forms and other GitHub features does not grant permission to Use the Original Materials beyond the root `LICENSE`.'],
      },
    ],
    references: [
      {
        title: 'Security Reports',
        href: '/docs/security-reports',
        description: 'How security matters are reported.',
      },
      {
        title: 'Public Issue Boundary',
        href: '/docs/public-issue-boundary',
        description: 'The support view of public issues.',
      },
      {
        title: 'External Contribution Boundary',
        href: '/docs/external-contribution-boundary',
        description: 'Why submissions are not accepted.',
      },
    ],
  },
  {
    slug: 'external-contribution-boundary',
    navigationTitle: 'External Contribution Boundary',
    eyebrow: 'Legal',
    title: 'External Contribution Boundary',
    description: 'Why the repository does not accept External Contributions and what counts as Contribution Materials.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'not-accepted',
        title: 'Not accepted',
        body: [
          'The repository is not maintained as an open contribution project. An External Contribution is not requested and is not accepted through a public pull request, a Public Issue, a discussion, a patch, or a comparable submission. A pull request or a Public Issue that proposes Contribution Materials may be closed without review.',
        ],
      },
      {
        id: 'contribution-materials',
        title: 'Contribution Materials',
        body: [
          'Contribution Materials include source code, patches, pull requests, documentation text, replacement text, translations, design assets, images, audio, textures, generated files, datasets, feature implementations, refactoring proposals, shader rewrites, saved worlds, reports containing proposed implementation material, and artificial-intelligence-generated material.',
        ],
      },
      {
        id: 'no-obligation',
        title: 'No obligation, no expansion',
        body: [
          "Submitting an External Contribution creates no obligation for the Licensor to review, accept, preserve, credit, respond to, incorporate, license, or return it, and does not expand the Licensee's rights in the Original Materials.",
        ],
      },
    ],
    references: [
      {
        title: 'Prohibited Use',
        href: '/docs/prohibited-use',
        description: 'The broader prohibition.',
      },
      {
        title: 'Contribution Boundary',
        href: '/docs/contribution-boundary',
        description: 'The maintainer-facing contribution policy.',
      },
      {
        title: 'Public Issues',
        href: '/docs/public-issues',
        description: 'What a public issue may contain.',
      },
    ],
  },
  {
    slug: 'github-platform-terms-boundary',
    navigationTitle: 'GitHub Platform Terms Boundary',
    eyebrow: 'Legal',
    title: 'GitHub Platform Terms Boundary',
    description: 'How the GitHub Platform Terms govern the hosting relationship without granting any license to the Original Materials.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'scope',
        title: 'Scope',
        body: [
          'The GitHub Platform Terms govern the relationship between the hosting service operated by GitHub and its users. Any service-level permission under those terms operates only between that hosting service and the user, including file display and interface functions.',
        ],
      },
      {
        id: 'no-license',
        title: 'No license to Original Materials',
        body: [
          'The GitHub Platform Terms do not grant a copyright, patent, trademark, database-right, trade-secret, or other license from the Licensor beyond the limited grant in the root `LICENSE`. A fork, clone, download, archive, Public Issue, pull request, action run, release, package, or diff view does not authorize Use outside that grant.',
        ],
      },
      {
        id: 'distinct',
        title: 'Distinct relationships',
        body: [
          'The Japanese governing-law and forum provisions of the License govern the independent-license relationship for the Original Materials; the GitHub Platform Terms govern the service relationship. The two apply to different subject matter and must not be conflated.',
        ],
      },
    ],
    references: [
      {
        title: 'Legal Disputes',
        href: '/docs/legal-disputes',
        description: 'The governing-law and forum provisions.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
      {
        title: 'Public Issues',
        href: '/docs/public-issues',
        description: 'Public platform submissions.',
      },
    ],
  },
  {
    slug: 'legal-disputes',
    navigationTitle: 'Legal Disputes',
    eyebrow: 'Legal',
    title: 'Legal Disputes',
    description: 'The governing law, forum, and non-waiver provisions stated as license facts.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'governing-law',
        title: 'Governing law',
        body: [
          "The Ludoxel Independent License is governed by the laws of Japan, excluding conflict-of-law rules that would require application of another jurisdiction's law, to the maximum extent permitted by applicable law. Public legal text states this as a license fact and does not replace it with informal jurisdiction language.",
        ],
      },
      {
        id: 'forum',
        title: 'Forum',
        body: [
          'Any dispute arising out of or relating to the License, the Original Materials, Repository Contents, Distribution Materials, or unauthorized use of those materials is subject to the exclusive jurisdiction of the Tokyo District Court as the court of first instance, to the maximum extent permitted by applicable law.',
        ],
      },
      {
        id: 'severability',
        title: 'Severability and non-waiver',
        body: [
          "If a provision is held invalid or unenforceable, the remaining provisions remain in effect to the maximum extent permitted by law. The Licensor's failure to enforce a provision in any instance is not a waiver of that provision or any other right.",
        ],
      },
    ],
    references: [
      {
        title: 'Warranty and Liability',
        href: '/docs/warranty-and-liability',
        description: 'The disclaimers and liability limits.',
      },
      {
        title: 'GitHub Platform Terms Boundary',
        href: '/docs/github-platform-terms-boundary',
        description: 'The distinct service relationship.',
      },
      {
        title: 'Controlling Text',
        href: '/docs/controlling-text',
        description: 'How conflicts are resolved.',
      },
    ],
  },
  {
    slug: 'warranty-and-liability',
    navigationTitle: 'Warranty and Liability',
    eyebrow: 'Legal',
    title: 'Warranty and Liability',
    description: 'The warranty disclaimer and limitation of liability stated by the License.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'no-warranty',
        title: 'No warranty',
        body: [
          'Ludoxel, the Repository, the Original Materials, the Repository Contents, the Distribution Materials, User-Created Materials, Application Output, Third-Party Materials, and Provenance-Sensitive Materials are provided as is and as available, without warranty of any kind. The Licensor disclaims all warranties, including title, non-infringement, merchantability, fitness for a particular purpose, accuracy, availability, security, correctness of game rules, correctness of artificial-intelligence behavior, and freedom from third-party claims.',
        ],
      },
      {
        id: 'liability',
        title: 'Limitation of liability',
        body: [
          'To the maximum extent permitted by applicable law, the Licensor is not liable for any direct, indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenue, data, goodwill, business opportunity, or use, arising out of or relating to Ludoxel, the License, permitted viewing, Ordinary Application Use, unauthorized use, or prohibited use, regardless of legal theory.',
        ],
      },
      {
        id: 'no-implied-obligation',
        title: 'No implied obligation',
        body: [
          'Public manuals and support text must not imply a warranty, a maintenance obligation, a release obligation, a contribution obligation, or expanded liability. The disclaimers and liability limits are governed by the root `LICENSE`.',
        ],
      },
    ],
    references: [
      {
        title: 'Legal Disputes',
        href: '/docs/legal-disputes',
        description: 'Governing law and forum.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
      {
        title: 'Controlling Text',
        href: '/docs/controlling-text',
        description: 'How conflicts are resolved.',
      },
    ],
  },
  {
    slug: 'controlling-text',
    navigationTitle: 'Controlling Text',
    eyebrow: 'Legal',
    title: 'Controlling Text',
    description: 'The rule that the License Text controls for the Original Materials when any other statement conflicts with it.',
    searchSection: 'Legal',
    sections: [
      {
        id: 'rule',
        title: 'The controlling-text rule',
        body: [
          'The License Text is the controlling text for the Original Materials. If README descriptions, package metadata, SPDX headers, generated-file markings, summaries, translations, issue text, pull request text, release text, documentation, generated documentation, application user interface text, or other repository statements conflict with the License Text, the License Text controls for the Original Materials.',
        ],
      },
      {
        id: 'no-outside-permission',
        title: 'No outside permission',
        body: [
          'No statement outside the License grants any permission to Use the Original Materials unless that statement expressly amends the License through a later written instrument signed by the Licensor.',
        ],
      },
      {
        id: 'these-pages',
        title: 'These pages are subordinate',
        body: ['These documentation pages are explanatory and subordinate to the License. Where any wording here could be read more broadly than the License Text, the License Text governs.'],
      },
    ],
    references: [
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text.',
      },
      {
        title: 'Warranty and Liability',
        href: '/docs/warranty-and-liability',
        description: 'The disclaimers under the License.',
      },
      {
        title: 'Legal Disputes',
        href: '/docs/legal-disputes',
        description: 'Governing law and forum.',
      },
    ],
  },
];
