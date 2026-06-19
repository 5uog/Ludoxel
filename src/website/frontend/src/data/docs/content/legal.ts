/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const legalPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Authority Text',
    title: 'Understanding License Authority',
    description:
      'Explains where permission for Ludoxel original materials comes from, which public texts can only point to that authority, and when the reader must stop instead of treating visibility, summaries, or platform behavior as permission.',
    sections: [
      {
        id: 'understanding-license-authority-meaning',
        title: 'What License Authority Means',
        body: [
          'This article answers one narrow question: which text or written act can grant permission for Ludoxel original materials. It does not classify every material type, restate every restriction, resolve third-party terms, or decide every distribution question.',
          'For Ludoxel original materials, authority starts from the root `LICENSE`. Other public materials may explain, point to, or display that authority, but they do not become an independent permission source unless the `LICENSE` or a later signed written instrument gives them that effect.',
          'This article therefore treats authority as a gatekeeping issue. Before a reader asks whether a proposed use is allowed, the reader must first identify whether the claimed permission comes from the controlling license text or from a non-controlling surface such as a summary, page notice, platform interface, generated artifact, or public repository view.',
        ],
      },
      {
        id: 'understanding-license-authority-controlling-source',
        title: 'Controlling Source',
        body: [
          'The root `LICENSE` is the controlling license text for Ludoxel original materials. It is the place where the permission grant, reservation of rights, and legal limits must be read.',
          '`README.md` can introduce that structure and direct the reader to the license, but it remains explanatory. The same is true of documentation notices, SPDX headers, package metadata, release text, issue templates, pull-request text, website metadata, and generated documentation text.',
          'A public page can make the controlling text easier to find. It cannot enlarge the grant, remove a restriction, or convert ordinary viewing into reuse, redistribution, deployment, scraping, indexing, dataset creation, model training, benchmark use, or incorporation into another work.',
        ],
      },
      {
        id: 'understanding-license-authority-non-authority-surfaces',
        title: 'Non-Authority Surfaces',
        body: [
          'Repository visibility is not license authority. Documentation-site publication is not license authority. A hosted preview, generated static page, build artifact, package file, source browser, search result, copied excerpt, or platform button is not license authority.',
          'Those surfaces may be evidence that a text is public, visible, or technically accessible. They are not evidence that the licensor granted permission beyond the controlling license text.',
          'The same rule applies to summaries and notices. A summary can describe the license hierarchy, and a notice can warn that displayed material remains protected, but neither one becomes a new grant of rights.',
        ],
      },
      {
        id: 'understanding-license-authority-reading-order',
        title: 'License Reading Order',
        content: [
          {
            kind: 'paragraph',
            text: 'The reading order stays narrow. It tests the source of permission before it moves to material scope, third-party status, output handling, distribution, or enforcement. Those later questions belong to their own legal articles after authority has been identified.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-license-authority-reading-order-claim',
                title: 'Identify the claimed permission source.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The first question is not whether the desired use feels ordinary, useful, public, or technically possible. The first question is where the claimed permission is said to come from: the root `LICENSE`, a later written instrument signed by the licensor, a README explanation, a documentation notice, a platform interface, a generated artifact, or mere public visibility.',
                  },
                ],
              },
              {
                id: 'understanding-license-authority-reading-order-control',
                title: 'Give controlling force only to the controlling text.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'For Ludoxel original materials, controlling force belongs to the English license text in the root `LICENSE`, except where a later signed written instrument validly changes the grant. Explanatory repository text and public documentation text remain subordinate to that controlling source.',
                  },
                ],
              },
              {
                id: 'understanding-license-authority-reading-order-reject-surrogates',
                title: 'Reject visibility and summaries as substitute grants.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Public access, source-form availability, Documentation Site display, code excerpts, examples, search data, metadata, package configuration, generated output, and hosting-service behavior do not supply missing permission. They may show that material is visible; they do not show that a broader license has been granted.',
                  },
                  {
                    kind: 'note',
                    note: {
                      type: 'warning',
                      content:
                        'A public notice on a documentation page confirms that the displayed material remains under the stated license authority. It is not a second license and not an exception to the root LICENSE.',
                    },
                  },
                ],
              },
              {
                id: 'understanding-license-authority-reading-order-stop-boundary',
                title: 'Stop once authority is identified.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'After the controlling source is identified, this article has done its job. Questions about what counts as original material, what third-party terms require, what ',
                      {
                        kind: 'link',
                        label: 'repository visibility',
                        href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
                      },
                      ' permits, what license text must accompany materials, or what distribution artifacts contain belong to the neighboring Legal articles.',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-license-authority-boundary',
        title: 'Article Boundary',
        body: [
          'This page should not become a general legal index. It does not restate the full definition of original materials, third-party materials, provenance-sensitive materials, user-created materials, application output, distribution materials, hosting terms, governing law, forum, or AI-use restrictions.',
          [
            'Its conclusion is narrower: permission for Ludoxel original materials must come from the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' license authority, not from ',
            {
              kind: 'link',
              label: 'public visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            ', summaries, notices, metadata, build output, website deployment, platform functions, or nearby policy text.',
          ],
        ],
      },
    ],
    relatedTitles: ['Understanding Controlling Text', 'Including License Text', 'Understanding Repository Visibility'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Authority Text',
    title: 'Understanding Controlling Text',
    description:
      'Explains the legal effect of textual conflict between the root LICENSE and subordinate repository, documentation, metadata, generated, hosted, interface, issue, release, summary, or translation statements.',
    sections: [
      {
        id: 'understanding-controlling-text-doctrinal-function',
        title: 'Doctrinal Function of the Controlling Text Rule',
        body: [
          'The controlling-text rule is a rule of juridical priority. It does not identify the Licensor, classify materials, describe ordinary use, authorize distribution, or enlarge any permission. Those questions remain governed by their own provisions and their own articles. This page addresses the narrower situation in which a reader has already identified a Ludoxel-related legal or quasi-legal statement and must decide what consequence follows if that statement is inconsistent with the License Text.',
          'For Original Materials, the operative legal source is the English License Text in the root `LICENSE`. Subordinate statements may describe, summarize, warn, label, index, render, expose, package, deploy, route, or explain the project, but they do not obtain equal interpretive rank merely because they appear in the same repository, the same website, the same package, the same user interface, or the same public platform surface.',
          'The rule therefore performs a negative function before it performs any explanatory function. It disables reliance on an inconsistent subordinate statement as a license grant, waiver, estoppel-like assurance, interpretive override, implied permission, public dedication, or modification of the rights reserved in the License Text.',
        ],
      },
      {
        id: 'understanding-controlling-text-objects-of-subordination',
        title: 'Objects of Subordination',
        body: [
          'The subordinate class is intentionally broad. README descriptions, package metadata, SPDX headers, generated-file markings, summaries, translations, issue text, pull request text, release text, documentation, Documentation Site content, generated documentation, application user interface text, website user interface text, and other repository statements may all inform a reader where to look, but they do not control over the License Text when inconsistency exists.',
          'This breadth is legally significant because the risk is not limited to traditional prose documentation. A package field may appear permissive; a generated file may look self-sufficient; a website label may appear to license displayed material; an issue template may appear to invite broader use; a platform button may technically permit copying, forking, cloning, downloading, indexing, or previewing. None of those surfaces is elevated into controlling legal authority for the Original Materials by its visibility or operational availability.',
          'The same analysis applies to public legal notices that correctly warn readers but are not themselves the License Text. A notice may state the existence of rights, restrictions, jurisdictional terms, or ownership. Unless it is the License Text or a later written instrument signed by the Licensor that expressly amends the License, it remains subordinate to the License Text when the two cannot be reconciled.',
        ],
      },
      {
        id: 'understanding-controlling-text-conflict-threshold',
        title: 'Threshold for Conflict',
        body: [
          'A conflict exists when the subordinate statement and the License Text cannot reasonably be read together without changing the legal effect of the License Text. The relevant inquiry is not whether the subordinate statement is shorter, simpler, less precise, less complete, or written for a different audience. Mere incompleteness is not conflict. Conflict arises when the subordinate statement purports, expressly or by necessary implication, to grant, waive, narrow, expand, displace, replace, excuse, or condition something differently from the License Text.',
          'A statement that says less than the License Text is usually subordinate but not contradictory. A statement that directs the reader to the License Text is likewise not contradictory. By contrast, a statement that appears to authorize copying, modification, redistribution, deployment, republication, mirroring, scraping, AI processing, derivative preparation, or third-party relicensing beyond the License Text must be treated as legally ineffective to the extent of that inconsistency.',
          [
            'The conflict analysis must be made at the level of legal consequence, not at the level of vocabulary. Different words may be consistent if they preserve the same operative effect. Similar words may conflict if they alter the class of covered materials, the scope of use, the identity of the granting authority, the condition of permission, the survival of reservations, the treatment of third-party material, or the legal status of ',
            {
              kind: 'link',
              label: 'public visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            '.',
          ],
        ],
      },
      {
        id: 'understanding-controlling-text-priority-and-exclusion',
        title: 'Priority and Exclusion',
        body: [
          'Once conflict is identified, the priority rule is categorical. The License Text governs the Original Materials, and the inconsistent subordinate statement is excluded from operative effect to the extent of the inconsistency. The subordinate statement is not harmonized by silently rewriting the License Text; the License Text is not diluted to preserve a more convenient public summary; and the reader may not select the less restrictive formulation as an alternative source of permission.',
          'The exclusion is partial only when the inconsistency is partial. A subordinate statement may remain useful for navigation, factual description, warning, interface labeling, packaging context, or public explanation insofar as it does not alter the legal consequence of the License Text. It loses legal effect only where reliance on it would contradict, enlarge, reduce, or bypass the License Text.',
          'The priority rule also prevents argumentative inversion. A reader may not reason from the existence of a public summary to a broader license, from a hosted page to open-content status, from metadata to redistribution authority, from a platform function to copyright permission, from generated documentation to republication authority, or from interface text to a waiver of restrictions. Each such inference is subordinate to the License Text and fails where it conflicts with that text.',
        ],
      },
      {
        id: 'understanding-controlling-text-no-amendment-by-context',
        title: 'No Amendment by Context',
        body: [
          'A conflicting subordinate statement does not amend the License by adjacency, repetition, deployment, indexing, formatting, packaging, caching, release publication, website availability, or technical usability. Context may explain why the statement exists, but it does not supply the formal legal act required to change the License.',
          'The required legal distinction is between evidence of communication and alteration of legal rights. Repository text, website text, generated output, labels, buttons, issue text, release descriptions, and package metadata may communicate information. They do not, by that communicative function alone, alter the grant, the restrictions, the reserved rights, the termination consequence, the warranty disclaimer, the jurisdictional clause, or the treatment of Original Materials.',
          'A later statement can alter the License only if it is a later written instrument signed by the Licensor and expressly operates as an amendment or separate grant. Ambiguity is insufficient. Convenience is insufficient. Public reliance on a platform feature is insufficient. A broad reading of a summary is insufficient. The controlling legal inquiry remains whether the formal source of permission has actually changed.',
        ],
      },
      {
        id: 'understanding-controlling-text-harmonization-limits',
        title: 'Limits of Harmonization',
        body: [
          'Harmonization is permissible only while it preserves the hierarchy of sources. A subordinate statement may be read narrowly so that it remains consistent with the License Text. It may be understood as descriptive rather than operative, illustrative rather than granting, cautionary rather than permissive, or referential rather than dispositive.',
          'Harmonization becomes impermissible when it requires the reader to treat the subordinate statement as if it rewrote the License Text. A summary cannot delete a restriction by omitting it. A documentation paragraph cannot create a distribution license by describing a public build. Metadata cannot reduce a reservation of rights by using a short label. A user interface cannot transform technical access into legal authorization.',
          'The legally correct reading is therefore conservative. The subordinate statement should be saved, if possible, by narrowing its office to explanation or routing. If it cannot be saved without changing the License Text, it must yield. The License Text remains the dispositive source for the Original Materials.',
        ],
      },
      {
        id: 'understanding-controlling-text-third-party-non-merger',
        title: 'Third-Party Non-Merger',
        body: [
          'The controlling-text rule for the Ludoxel License does not merge Third-Party License Text into the Ludoxel License, and it does not merge the Ludoxel License into third-party terms. Third-Party License Text remains separate legal text governing the Third-Party Materials to which it applies. It is not License Text for Original Materials.',
          'If a third-party notice, third-party license file, attribution text, package notice, or dependency display appears beside Ludoxel Original Materials, that proximity does not place the Original Materials under third-party terms. Conversely, the Ludoxel License does not replace, amend, supersede, translate, narrow, expand, relicense, or otherwise alter the separate terms governing Third-Party Materials.',
          'This non-merger rule matters in conflict analysis because a reader must not cure a conflict by borrowing authority from the wrong legal instrument. The License Text controls the Original Materials. Third-Party License Text controls the relevant Third-Party Materials. Neither category becomes a substitute for the other merely because both appear in the repository, build output, Documentation Site, user interface, or package materials.',
        ],
      },
      {
        id: 'understanding-controlling-text-publication-and-platform-surfaces',
        title: 'Publication and Platform Surfaces',
        body: [
          'Public display is a common source of false conflict. A repository page, website page, preview deployment, production deployment, generated static file, cached excerpt, search result, browser display, package preview, fork button, clone button, download button, archive, issue form, pull request page, action log, or release page may make material visible or technically obtainable. That surface condition does not supply a license term inconsistent with the License Text.',
          'When a platform surface appears to enable an act that the License Text does not authorize, the legal result is not that the platform surface expands the License. The result is that the reader must distinguish technical capability, service-level functionality, and interface affordance from permission granted by the Licensor.',
          'The same reasoning applies to Documentation Site content. Code blocks, configuration examples, command examples, images, videos, navigation data, search data, legal notices, and interface text may be publicly displayed, but their display remains subordinate to the License Text. A public page can inform the reader of a legal boundary; it cannot erase that boundary by being public.',
        ],
      },
      {
        id: 'understanding-controlling-text-legal-consequence',
        title: 'Legal Consequence of Reliance on an Inconsistent Statement',
        body: [
          'Reliance on an inconsistent subordinate statement does not create permission where the License Text withholds it. The user who relies on the subordinate statement bears the risk that the statement is non-operative to the extent of conflict. The statement may explain how the mistake occurred, but it does not become a defense built into the License Text.',
          'The legally material consequence is that the proposed act must still be tested against the License Text. If the License Text does not grant the act, a conflicting subordinate statement does not supply the missing grant. If the License Text reserves a right, a conflicting subordinate statement does not waive the reservation. If the License Text imposes a condition, a conflicting subordinate statement does not dispense with performance of that condition.',
          'This rule is especially strict for acts that would otherwise affect copyright, patent, trademark, database rights, trade secrets, website republication, redistribution, deployment, AI processing, derivative preparation, or sublicensing. A subordinate statement cannot be used to convert a restricted act into an authorized act when the License Text does not do so.',
        ],
      },
      {
        id: 'understanding-controlling-text-boundary',
        title: 'Boundary of This Article',
        body: [
          [
            'This article does not decide who the Licensor is, what materials are Original Materials, whether a ',
            {
              kind: 'link',
              label: 'repository is public',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            ', what license text must be included in a distribution, whether a user-created output is separate from Original Materials, whether a third-party asset is cleared, whether a specific restricted use is permitted, whether contribution material is accepted, or how security reports must be routed.',
          ],
          'Its limited conclusion is this: where a subordinate repository, documentation, metadata, generated, hosted, interface, issue, release, summary, translation, package, or platform statement conflicts with the License Text, the License Text controls for the Original Materials, and the inconsistent subordinate statement has no operative effect as a grant, waiver, exception, amendment, substitution, or enlargement of permission unless it is itself a later written instrument signed by the Licensor and expressly changing the legal position.',
        ],
      },
    ],
    relatedTitles: ['Understanding License Authority', 'Understanding Repository Visibility', 'Including License Text'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Repository Visibility',
    description:
      'Explains why public repository visibility, Source Form availability, Documentation Site display, hosting-service functions, public submission surfaces, and technical obtainability do not grant permission beyond the root LICENSE.',
    sections: [
      {
        id: 'understanding-repository-visibility-juridical-function',
        title: 'Juridical Function of Repository Visibility',
        body: [
          'Repository visibility is a condition of access. It is not a juridical act of licensing, not a waiver of reserved rights, not a public dedication, not an open-source declaration, not an implied covenant, not a course-of-dealing authorization, and not a substitute for an express grant by the Licensor.',
          [
            'The legal analysis therefore begins after license ',
            {
              kind: 'link',
              label: 'authority',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-license-authority',
            },
            ' has been identified. For Ludoxel Original Materials, the relevant public surface is only a place where material may be seen, reached, downloaded, indexed, submitted against, or technically handled. It is not the source that decides whether the proposed act is permitted.',
          ],
          'The controlling distinction is between factual exposure and legal authorization. A file may be public without being free for reuse. A repository may be cloneable without granting redistribution. A page may be rendered by a browser without authorizing republication. A platform may provide buttons, archives, previews, issue forms, pull request forms, action logs, or release pages without converting those functions into permission from the Licensor.',
        ],
      },
      {
        id: 'understanding-repository-visibility-technical-obtainability',
        title: 'Technical Obtainability Is Not Permission',
        body: [
          'Technical obtainability is not legal permission. If a person obtains Repository Contents through a browser, source viewer, clone command, fork interface, download archive, cached page, search result, generated static file, package preview, deployment preview, action artifact, diff view, patch view, issue page, pull request page, or other public surface, that route of acquisition does not itself grant any right to Use the acquired material.',
          'The same rule applies when the access path appears to make a restricted act practically possible. The fact that a file can be copied does not authorize copying for a restricted purpose. The fact that a repository can be cloned does not authorize redistribution, sublicensing, derivative preparation, dataset creation, AI Use, website mirroring, republication, or incorporation into another project. The fact that a public form can receive text does not authorize submission of material that the repository policy refuses to accept.',
          'Nor may a public access route be used as an evasion mechanism. A user cannot avoid the LICENSE by obtaining the same material through a public clone, fork, archive, cache, preview, static-site output, search index, copied code block, browser cache, or platform-generated representation. If the License Text withholds the act, the access route does not cure the absence of permission.',
        ],
        noteBlocks: [
          {
            type: 'warning',
            content:
              'Visibility may explain how a person acquired material. It does not supply the grant, waiver, exception, estoppel, sublicense, amendment, or defense that the LICENSE does not provide.',
          },
        ],
      },
      {
        id: 'understanding-repository-visibility-limited-viewing',
        title: 'Limited Viewing and Verification',
        body: [
          'The only visibility-related permission relevant here is narrow inspection. Public repository access may allow human review and verification of Repository Contents within the limits stated by the LICENSE. That permission is not a reservoir from which broader rights may be implied.',
          'Viewing remains viewing only while it remains within the authorized purpose. Once the asserted act becomes redistribution, modification, derivative preparation, republication, mirrored hosting, training, dataset extraction, automated harvesting, incorporation into another work, sublicensing, or deployment of Ludoxel Original Materials outside the authorized boundary, the act must be justified by an express grant. Repository visibility supplies no such grant.',
          'Incidental technical copies created by browser display, network transmission, local caching, page rendering, static hosting, or service-side presentation remain legally incidental to the permitted viewing context. They must not be repurposed into copies for an excluded use.',
        ],
      },
      {
        id: 'understanding-repository-visibility-platform-functions',
        title: 'Platform Functions and Interface Affordances',
        body: [
          'Hosting-service functions are not license provisions. GitHub Platform Terms, repository interface behavior, fork and clone affordances, download controls, archive generation, issue forms, pull request forms, action logs, release pages, deployment previews, package views, and generated site pages may regulate or facilitate interaction with a service. They do not become copyright, patent, trademark, database-right, website republication, distribution, contribution, or AI-use permission from the Licensor.',
          [
            'If a platform surface appears to enable an act that the License Text does not authorize, the legal consequence is not enlargement of the License. The consequence is the same as under the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' text rule: technical possibility, service-level function, public display, or interface availability must yield to the written license boundary.',
          ],
          'The same analysis applies to the Documentation Site. Code blocks, configuration examples, command examples, images, videos, legal notices, navigation data, search data, and interface text may be publicly displayed. Their display may notify the reader of a boundary. It cannot dissolve the boundary by making the material public.',
        ],
      },
      {
        id: 'understanding-repository-visibility-public-policy-surfaces',
        title: 'Public Policy Surfaces',
        body: [
          'Public repository policy files confirm that visibility is not consent. Contribution guidance, pull request templates, issue templates, and security-contact templates are public, but their public character does not transform them into permission to Use Ludoxel Original Materials outside the LICENSE.',
          [
            'Those files matter here only for the visibility proposition. They show that a public form, visible template, public button, or public page is not a grant. The separate limits on what may be filed in a Public Issue belong to ',
            {
              kind: 'link',
              label: 'public issue limits',
              href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-public-issue-limits',
            },
            ', and the separate legal boundary for pull request submission belongs to ',
            {
              kind: 'link',
              label: 'pull request boundaries',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-pull-request-boundaries',
            },
            '.',
          ],
          'A person who uses a public policy surface must therefore distinguish access from entitlement. The ability to open a form, paste text, submit an issue, create a branch, propose a patch, or expose repository material in a public thread does not establish that the submitted act is authorized.',
        ],
      },
      {
        id: 'understanding-repository-visibility-reading-order',
        title: 'Repository Visibility Reading Order',
        content: [
          {
            kind: 'paragraph',
            text: 'A repository-visibility question must be resolved by legal source, not by surface mechanics. The error to avoid is beginning with a public interface and treating its existence as proof of permission.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-repository-visibility-reading-order-surface',
                title: 'Identify the asserted public surface.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Name the surface being relied on: source view, clone, fork, archive, browser display, cache, generated static file, Documentation Site page, package preview, deployment preview, issue form, pull request form, action log, release page, diff, patch, or another hosting-service function.',
                  },
                ],
              },
              {
                id: 'understanding-repository-visibility-reading-order-act',
                title: 'Identify the proposed act, not merely the access route.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The legally material question is not only how the material was reached. It is what the user proposes to do with it after reaching it. Viewing, verification, redistribution, derivative preparation, republication, mirroring, training, dataset creation, automated extraction, contribution submission, and deployment are different legal acts.',
                  },
                ],
              },
              {
                id: 'understanding-repository-visibility-reading-order-license',
                title: 'Test that act against the LICENSE.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'If the LICENSE grants the act, the act depends on that grant, not on visibility. If the LICENSE does not grant the act, the public surface does not supply the missing permission. The route by which the material was obtained cannot be used to circumvent the reserved-rights structure.',
                  },
                ],
              },
              {
                id: 'understanding-repository-visibility-reading-order-result',
                title: 'State the consequence as non-grant.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The proper conclusion is that repository visibility is legally non-operative as a grant, waiver, exception, amendment, sublicense, estoppel, or enlargement of permission. It may be evidence of access; it is not authority for restricted Use.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-repository-visibility-article-boundary',
        title: 'Article Boundary',
        body: [
          'This article does not classify every Original Material, decide third-party clearance, state distribution-package requirements, define Ordinary Application Use, determine generated-output ownership, decide whether a particular AI-processing act is permitted, accept contribution material, route private security reports, or determine whether a local artifact is an official release.',
          [
            'Its conclusion is narrower and stricter: public repository visibility, Source Form availability, Documentation Site display, hosting-service functions, public forms, technical obtainability, cache behavior, and generated public surfaces do not grant permission to Use Ludoxel Original Materials beyond the LICENSE and cannot be used to evade the LICENSE. Material classification belongs to ',
            {
              kind: 'link',
              label: 'original materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
            },
            ', and contribution-submission refusal belongs to ',
            {
              kind: 'link',
              label: 'contribution refusal',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
            },
            '.',
          ],
        ],
      },
    ],
    relatedTitles: [
      'Understanding License Authority',
      'Understanding Controlling Text',
      'Understanding Original Materials',
      'Understanding Public Issue Limits',
      'Understanding Pull Request Boundaries',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Original Materials',
    description:
      'Explains the project materials governed by the Ludoxel license. This page treats material classification as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-original-materials-authority-scope',
        title: 'Original Materials Authority Scope',
        body: [
          'Original materials include Ludoxel source code, documentation, project-created assets, shaders, package resources, website content, and distribution material created for the project. For Understanding Original Materials, that fact identifies the first concrete boundary for authority scope: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Original Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'A public report based on the authority scope part of Understanding Original Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-original-materials-controlling-text',
        title: 'Original Materials Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Original Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. Understanding Original Materials uses the fact as controlling text evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Controlling Text.',
          'A direct observation for Understanding Original Materials should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'When Understanding Original Materials crosses from controlling text into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-original-materials-material-class',
        title: 'Original Materials Material Class',
        body: [
          'A public report based on the authority scope part of Understanding Original Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for material class: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Material Class.',
          'Understanding Original Materials separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'Use material class to keep Understanding Original Materials tied to License Authority and Materials; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-original-materials-ordinary-use',
        title: 'Original Materials Ordinary Use',
        body: [
          'Understanding Original Materials should be read as conceptual boundary for original materials within License Authority and Materials and Material Scope. Understanding Original Materials uses the fact as controlling text evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Controlling Text. That reading gives Understanding Original Materials a public anchor for ordinary use without adding behavior that the current category does not own. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Ordinary Use.',
          'Ownership in Understanding Original Materials is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'The useful result of Understanding Original Materials ordinary use is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope.',
        ],
      },
      {
        id: 'understanding-original-materials-restricted-use',
        title: 'Original Materials Restricted Use',
        body: [
          'A direct observation for Understanding Original Materials should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. The point matters in restricted use because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Restricted Use.',
          'Visible feedback for Understanding Original Materials should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / License Authority and Materials / Material Scope.',
          'Understanding Original Materials should not use restricted use to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-original-materials-third-party-split',
        title: 'Original Materials Third-Party Split',
        body: [
          'When Understanding Original Materials crosses from controlling text into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for third-party split: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Third-Party Split.',
          'When Understanding Original Materials touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the third-party split part of Understanding Original Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-original-materials-public-summary-limit',
        title: 'Original Materials Public Summary Limit',
        body: [
          'Third-party materials and user-created materials are treated separately when their boundaries apply. Their existence inside or beside the project does not merge all rights into one category. Understanding Original Materials uses the fact as public summary limit evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Public Summary Limit.',
          'The surrounding context for Understanding Original Materials decides which adjacent topic is relevant. Understanding Original Materials should be compared with Separating Original Materials from Output, Understanding Third Party Material Boundaries, Understanding License Authority only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use public summary limit to keep Understanding Original Materials tied to License Authority and Materials; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-original-materials-reporting-limit',
        title: 'Original Materials Reporting Limit',
        body: [
          'Understanding Original Materials separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. The point matters in reporting limit because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Reporting Limit.',
          'Recovery or follow-up for Understanding Original Materials should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Understanding Original Materials should not use reporting limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-original-materials-distribution-limit',
        title: 'Original Materials Distribution Limit',
        body: [
          'Use material class to keep Understanding Original Materials tied to License Authority and Materials; use a related page only when the reader needs a different owner. Understanding Original Materials uses the fact as distribution limit evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Distribution Limit.',
          'The main confusion risk in Understanding Original Materials is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Understanding Original Materials crosses from distribution limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-original-materials-ai-use-limit',
        title: 'Original Materials AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. In Understanding Original Materials, ai use limit is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / AI Use Limit.',
          'Reportable evidence for Understanding Original Materials should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Understanding Original Materials should not use ai use limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-original-materials-evidence',
        title: 'Original Materials Legal Evidence',
        body: [
          'Ownership in Understanding Original Materials is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The point matters in legal evidence because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Legal Evidence.',
          'Adjacent pages matter for Understanding Original Materials, but adjacency does not move authority. Understanding Original Materials should be compared with Separating Original Materials from Output, Understanding Third Party Material Boundaries, Understanding License Authority only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Understanding Original Materials legal evidence is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope.',
        ],
      },
      {
        id: 'understanding-original-materials-related-legal',
        title: 'Original Materials Related Legal',
        body: [
          'The useful result of Understanding Original Materials ordinary use is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope. For Understanding Original Materials, that fact identifies the first concrete boundary for related legal: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Related Legal.',
          'The public boundary for Understanding Original Materials is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the related legal part of Understanding Original Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-original-materials-reader-risk',
        title: 'Original Materials Reader Risk',
        body: [
          'Original materials remain governed by the license even if local tools can copy, edit, package, or analyze them. Technical access is not a permission grant. That reading gives Understanding Original Materials a public anchor for reader risk without adding behavior that the current category does not own. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Reader Risk.',
          'An operator reading Understanding Original Materials should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for reader risk does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Original Materials should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-original-materials-non-advice',
        title: 'Original Materials Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Original Materials should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / License Authority and Materials / Material Scope. The point matters in non-advice boundary because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Non-Advice Boundary.',
          'Implementation limits for Understanding Original Materials keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Understanding Original Materials non-advice boundary is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope.',
        ],
      },
      {
        id: 'understanding-original-materials-public-summary',
        title: 'Original Materials Public Summary',
        body: [
          'Original materials include Ludoxel source code, documentation, project-created assets, shaders, package resources, website content, and distribution material created for the project. For Understanding Original Materials, that fact identifies the first concrete boundary for public summary: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Public Summary.',
          'The summary value of Understanding Original Materials is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the public summary part of Understanding Original Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-original-materials-closing-check',
        title: 'Original Materials Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Original Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. In Understanding Original Materials, closing check is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Original Materials / License Authority and Materials / Material Scope / Closing Check.',
          'A final check for Understanding Original Materials should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Original Materials should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Separating Original Materials from Output', 'Understanding Third Party Material Boundaries', 'Understanding License Authority'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Distribution Materials',
    description:
      'Explains the content and constraints of packaged Ludoxel materials. This page treats material classification as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-distribution-materials-authority-scope',
        title: 'Distribution Materials Authority Scope',
        body: [
          'Distribution materials can include executable code, package resources, shaders, theme data, assets, native components, legal text, third-party notices, and generated packaging metadata. The point matters in authority scope because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Distribution Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'The useful result of Understanding Distribution Materials authority scope is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope.',
        ],
      },
      {
        id: 'understanding-distribution-materials-controlling-text',
        title: 'Distribution Materials Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Distribution Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. That reading gives Understanding Distribution Materials a public anchor for controlling text without adding behavior that the current category does not own. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Controlling Text.',
          'A direct observation for Understanding Distribution Materials should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'The useful result of Understanding Distribution Materials controlling text is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope.',
        ],
      },
      {
        id: 'understanding-distribution-materials-material-class',
        title: 'Distribution Materials Material Class',
        body: [
          'The useful result of Understanding Distribution Materials authority scope is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope. The point matters in material class because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Material Class.',
          'Understanding Distribution Materials separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'Understanding Distribution Materials should not use material class to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-distribution-materials-ordinary-use',
        title: 'Distribution Materials Ordinary Use',
        body: [
          'Understanding Distribution Materials should be read as conceptual boundary for distribution materials within License Authority and Materials and Material Scope. Understanding Distribution Materials uses the fact as ordinary use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Ordinary Use.',
          'Ownership in Understanding Distribution Materials is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'When Understanding Distribution Materials crosses from ordinary use into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-distribution-materials-restricted-use',
        title: 'Distribution Materials Restricted Use',
        body: [
          'A direct observation for Understanding Distribution Materials should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. Understanding Distribution Materials uses the fact as restricted use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Restricted Use.',
          'Visible feedback for Understanding Distribution Materials should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / License Authority and Materials / Material Scope.',
          'When Understanding Distribution Materials crosses from restricted use into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-distribution-materials-third-party-split',
        title: 'Distribution Materials Third-Party Split',
        body: [
          'The useful result of Understanding Distribution Materials controlling text is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope. That reading gives Understanding Distribution Materials a public anchor for third-party split without adding behavior that the current category does not own. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Third-Party Split.',
          'When Understanding Distribution Materials touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Understanding Distribution Materials third-party split is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope.',
        ],
      },
      {
        id: 'understanding-distribution-materials-public-summary-limit',
        title: 'Distribution Materials Public Summary Limit',
        body: [
          'Packaging original materials does not create redistribution authority by itself. The license and official distribution path control what may be shared. In Understanding Distribution Materials, public summary limit is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Public Summary Limit.',
          'The surrounding context for Understanding Distribution Materials decides which adjacent topic is relevant. Understanding Distribution Materials should be compared with Including License Text, Avoiding Unofficial Release Claims, Understanding Redistribution Restrictions only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding Distribution Materials should not use public summary limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-distribution-materials-reporting-limit',
        title: 'Distribution Materials Reporting Limit',
        body: [
          'Understanding Distribution Materials separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for reporting limit: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Reporting Limit.',
          'Recovery or follow-up for Understanding Distribution Materials should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the reporting limit part of Understanding Distribution Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-distribution-materials-distribution-limit',
        title: 'Distribution Materials Distribution Limit',
        body: [
          'Understanding Distribution Materials should not use material class to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Understanding Distribution Materials a public anchor for distribution limit without adding behavior that the current category does not own. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Distribution Limit.',
          'The main confusion risk in Understanding Distribution Materials is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Understanding Distribution Materials distribution limit is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Material Scope.',
        ],
      },
      {
        id: 'understanding-distribution-materials-ai-use-limit',
        title: 'Distribution Materials AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. Understanding Distribution Materials uses the fact as ordinary use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Ordinary Use. The fact also tells the reader which evidence to preserve for ai use limit: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / AI Use Limit.',
          'Reportable evidence for Understanding Distribution Materials should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the ai use limit part of Understanding Distribution Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-distribution-materials-evidence',
        title: 'Distribution Materials Legal Evidence',
        body: [
          'Ownership in Understanding Distribution Materials is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The fact also tells the reader which evidence to preserve for legal evidence: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Legal Evidence.',
          'Adjacent pages matter for Understanding Distribution Materials, but adjacency does not move authority. Understanding Distribution Materials should be compared with Including License Text, Avoiding Unofficial Release Claims, Understanding Redistribution Restrictions only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the legal evidence part of Understanding Distribution Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-distribution-materials-related-legal',
        title: 'Distribution Materials Related Legal',
        body: [
          'When Understanding Distribution Materials crosses from ordinary use into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Understanding Distribution Materials a public anchor for related legal without adding behavior that the current category does not own. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Related Legal.',
          'The public boundary for Understanding Distribution Materials is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for related legal does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Distribution Materials should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-distribution-materials-reader-risk',
        title: 'Distribution Materials Reader Risk',
        body: [
          'Distribution review should include legal text, third-party licenses, resource inclusion, platform renderer dependencies, native extension behavior, and generated output separation. Understanding Distribution Materials uses the fact as restricted use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Restricted Use. The fact also tells the reader which evidence to preserve for reader risk: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Reader Risk.',
          'An operator reading Understanding Distribution Materials should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'Use reader risk to keep Understanding Distribution Materials tied to License Authority and Materials; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-distribution-materials-non-advice',
        title: 'Distribution Materials Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Distribution Materials should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / License Authority and Materials / Material Scope. The fact also tells the reader which evidence to preserve for non-advice boundary: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Non-Advice Boundary.',
          'Implementation limits for Understanding Distribution Materials keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the non-advice boundary part of Understanding Distribution Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-distribution-materials-public-summary',
        title: 'Distribution Materials Public Summary',
        body: [
          'Distribution materials can include executable code, package resources, shaders, theme data, assets, native components, legal text, third-party notices, and generated packaging metadata. The point matters in public summary because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Public Summary.',
          'The summary value of Understanding Distribution Materials is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Distribution Materials should not use public summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-distribution-materials-closing-check',
        title: 'Distribution Materials Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Distribution Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. Understanding Distribution Materials uses the fact as closing check evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Distribution Materials / License Authority and Materials / Material Scope / Closing Check.',
          'A final check for Understanding Distribution Materials should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Understanding Distribution Materials crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Including License Text', 'Avoiding Unofficial Release Claims', 'Understanding Redistribution Restrictions'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Ordinary Use and Output',
    title: 'Understanding Ordinary Application Use',
    description:
      'Explains the limited ordinary-use context for running Ludoxel. This page treats license interpretation as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-ordinary-application-use-authority-scope',
        title: 'Ordinary Application Use Authority Scope',
        body: [
          'Ordinary application use means running the desktop application and interacting with its normal features, settings, worlds, Othello play, screenshots, recordings, and save data. For Understanding Ordinary Application Use, that fact identifies the first concrete boundary for authority scope: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Ordinary Application Use. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion.',
          'When Understanding Ordinary Application Use crosses from authority scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-controlling-text',
        title: 'Ordinary Application Use Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Ordinary Application Use. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. For Understanding Ordinary Application Use, that fact identifies the first concrete boundary for controlling text: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Controlling Text.',
          'A direct observation for Understanding Ordinary Application Use should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'When Understanding Ordinary Application Use crosses from controlling text into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-material-class',
        title: 'Ordinary Application Use Material Class',
        body: [
          'When Understanding Ordinary Application Use crosses from authority scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. Understanding Ordinary Application Use uses the fact as material class evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Material Class.',
          'Understanding Ordinary Application Use separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form.',
          'Use material class to keep Understanding Ordinary Application Use tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-ordinary-use',
        title: 'Ordinary Application Use Ordinary Use',
        body: [
          'Understanding Ordinary Application Use should be read as conceptual boundary for ordinary application use within Use Permissions and Restrictions and Ordinary Use and Output. That reading gives Understanding Ordinary Application Use a public anchor for ordinary use without adding behavior that the current category does not own. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Ordinary Use.',
          'Ownership in Understanding Ordinary Application Use is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'If the available evidence for ordinary use does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Ordinary Application Use should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-restricted-use',
        title: 'Ordinary Application Use Restricted Use',
        body: [
          'A direct observation for Understanding Ordinary Application Use should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. That reading gives Understanding Ordinary Application Use a public anchor for restricted use without adding behavior that the current category does not own. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Restricted Use.',
          'Visible feedback for Understanding Ordinary Application Use should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Ordinary Use and Output.',
          'If the available evidence for restricted use does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Ordinary Application Use should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-third-party-split',
        title: 'Ordinary Application Use Third-Party Split',
        body: [
          'When Understanding Ordinary Application Use crosses from controlling text into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for third-party split: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Third-Party Split.',
          'When Understanding Ordinary Application Use touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use third-party split to keep Understanding Ordinary Application Use tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-public-summary-limit',
        title: 'Ordinary Application Use Public Summary Limit',
        body: [
          'Ordinary use is distinct from redistributing original materials, publishing package artifacts, training on project materials, or creating derivative repository content. Understanding Ordinary Application Use uses the fact as material class evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Material Class. Understanding Ordinary Application Use uses the fact as public summary limit evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Public Summary Limit.',
          'The surrounding context for Understanding Ordinary Application Use decides which adjacent topic is relevant. Understanding Ordinary Application Use should be compared with Understanding User-Created Materials, Understanding Generated Output, Understanding Redistribution Restrictions only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Understanding Ordinary Application Use crosses from public summary limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-reporting-limit',
        title: 'Ordinary Application Use Reporting Limit',
        body: [
          'Understanding Ordinary Application Use separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form. In Understanding Ordinary Application Use, reporting limit is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Reporting Limit.',
          'Recovery or follow-up for Understanding Ordinary Application Use should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Understanding Ordinary Application Use should not use reporting limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-distribution-limit',
        title: 'Ordinary Application Use Distribution Limit',
        body: [
          'Use material class to keep Understanding Ordinary Application Use tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner. For Understanding Ordinary Application Use, that fact identifies the first concrete boundary for distribution limit: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Distribution Limit.',
          'The main confusion risk in Understanding Ordinary Application Use is expanding permissions through explanatory wording. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Understanding Ordinary Application Use crosses from distribution limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-ai-use-limit',
        title: 'Ordinary Application Use AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. That reading gives Understanding Ordinary Application Use a public anchor for ai use limit without adding behavior that the current category does not own. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / AI Use Limit.',
          'Reportable evidence for Understanding Ordinary Application Use should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Understanding Ordinary Application Use ai use limit is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Ordinary Use and Output.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-evidence',
        title: 'Ordinary Application Use Legal Evidence',
        body: [
          'Ownership in Understanding Ordinary Application Use is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. That reading gives Understanding Ordinary Application Use a public anchor for legal evidence without adding behavior that the current category does not own. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Legal Evidence.',
          'Adjacent pages matter for Understanding Ordinary Application Use, but adjacency does not move authority. Understanding Ordinary Application Use should be compared with Understanding User-Created Materials, Understanding Generated Output, Understanding Redistribution Restrictions only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Understanding Ordinary Application Use legal evidence is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Ordinary Use and Output.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-related-legal',
        title: 'Ordinary Application Use Related Legal',
        body: [
          'If the available evidence for ordinary use does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Ordinary Application Use should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for related legal: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Related Legal.',
          'The public boundary for Understanding Ordinary Application Use is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the related legal part of Understanding Ordinary Application Use should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-reader-risk',
        title: 'Ordinary Application Use Reader Risk',
        body: [
          'User output may have a different boundary from original materials, but embedded project or third-party material can still affect how that output is shared. That reading gives Understanding Ordinary Application Use a public anchor for reader risk without adding behavior that the current category does not own. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Reader Risk.',
          'An operator reading Understanding Ordinary Application Use should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Understanding Ordinary Application Use reader risk is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Ordinary Use and Output.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-non-advice',
        title: 'Ordinary Application Use Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Ordinary Application Use should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Ordinary Use and Output. The point matters in non-advice boundary because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Non-Advice Boundary.',
          'Implementation limits for Understanding Ordinary Application Use keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Understanding Ordinary Application Use should not use non-advice boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-public-summary',
        title: 'Ordinary Application Use Public Summary',
        body: [
          'Ordinary application use means running the desktop application and interacting with its normal features, settings, worlds, Othello play, screenshots, recordings, and save data. For Understanding Ordinary Application Use, that fact identifies the first concrete boundary for public summary: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Public Summary.',
          'The summary value of Understanding Ordinary Application Use is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Understanding Ordinary Application Use crosses from public summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-closing-check',
        title: 'Ordinary Application Use Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Ordinary Application Use. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. That reading gives Understanding Ordinary Application Use a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Understanding Ordinary Application Use / Use Permissions and Restrictions / Ordinary Use and Output / Closing Check.',
          'A final check for Understanding Ordinary Application Use should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Understanding Ordinary Application Use closing check is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Ordinary Use and Output.',
        ],
      },
    ],
    relatedTitles: ['Understanding User-Created Materials', 'Understanding Generated Output', 'Understanding Redistribution Restrictions'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Ordinary Use and Output',
    title: 'Understanding Generated Output',
    description:
      'Explains generated or rendered output created during normal use. This page treats material classification as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-generated-output-authority-scope',
        title: 'Generated Output Authority Scope',
        body: [
          'Generated output can include rendered frames, screenshots, recordings, logs, user world data, learned artifacts, and other files produced while using the application. In Understanding Generated Output, authority scope is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Authority Scope. In Understanding Generated Output, authority scope is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Generated Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'If the available evidence for authority scope does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Generated Output should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-generated-output-controlling-text',
        title: 'Generated Output Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Generated Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. In Understanding Generated Output, controlling text is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Controlling Text.',
          'A direct observation for Understanding Generated Output should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'Understanding Generated Output should not use controlling text to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-generated-output-material-class',
        title: 'Generated Output Material Class',
        body: [
          'If the available evidence for authority scope does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Generated Output should be treated as an observation rather than a confirmed cause. In Understanding Generated Output, material class is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Material Class.',
          'Understanding Generated Output separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'Understanding Generated Output should not use material class to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-generated-output-ordinary-use',
        title: 'Generated Output Ordinary Use',
        body: [
          'Understanding Generated Output should be read as conceptual boundary for generated output within Use Permissions and Restrictions and Ordinary Use and Output. In Understanding Generated Output, controlling text is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Controlling Text. Understanding Generated Output uses the fact as ordinary use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Ordinary Use.',
          'Ownership in Understanding Generated Output is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'Use ordinary use to keep Understanding Generated Output tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-generated-output-restricted-use',
        title: 'Generated Output Restricted Use',
        body: [
          'A direct observation for Understanding Generated Output should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. For Understanding Generated Output, that fact identifies the first concrete boundary for restricted use: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Restricted Use.',
          'Visible feedback for Understanding Generated Output should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Ordinary Use and Output.',
          'When Understanding Generated Output crosses from restricted use into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-generated-output-third-party-split',
        title: 'Generated Output Third-Party Split',
        body: [
          'Understanding Generated Output should not use controlling text to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Understanding Generated Output, third-party split is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Third-Party Split.',
          'When Understanding Generated Output touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding Generated Output should not use third-party split to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-generated-output-public-summary-limit',
        title: 'Generated Output Public Summary Limit',
        body: [
          'Output can include user-created content, original materials, third-party material, or private data. Those components should be separated before public sharing. In Understanding Generated Output, material class is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Material Class. The point matters in public summary limit because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Public Summary Limit.',
          'The surrounding context for Understanding Generated Output decides which adjacent topic is relevant. Understanding Generated Output should be compared with Understanding Application Output, Understanding User-Created Materials, Separating Original Materials from Output only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding Generated Output should not use public summary limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-generated-output-reporting-limit',
        title: 'Generated Output Reporting Limit',
        body: [
          'Understanding Generated Output separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. For Understanding Generated Output, that fact identifies the first concrete boundary for reporting limit: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Reporting Limit.',
          'Recovery or follow-up for Understanding Generated Output should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the reporting limit part of Understanding Generated Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-generated-output-distribution-limit',
        title: 'Generated Output Distribution Limit',
        body: [
          'Understanding Generated Output should not use material class to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Understanding Generated Output, distribution limit is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Distribution Limit.',
          'The main confusion risk in Understanding Generated Output is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Understanding Generated Output should not use distribution limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-generated-output-ai-use-limit',
        title: 'Generated Output AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. Understanding Generated Output uses the fact as ordinary use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Ordinary Use. The fact also tells the reader which evidence to preserve for ai use limit: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / AI Use Limit.',
          'Reportable evidence for Understanding Generated Output should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use ai use limit to keep Understanding Generated Output tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-generated-output-evidence',
        title: 'Generated Output Legal Evidence',
        body: [
          'Ownership in Understanding Generated Output is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. Understanding Generated Output uses the fact as legal evidence evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Legal Evidence.',
          'Adjacent pages matter for Understanding Generated Output, but adjacency does not move authority. Understanding Generated Output should be compared with Understanding Application Output, Understanding User-Created Materials, Separating Original Materials from Output only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Understanding Generated Output crosses from legal evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-generated-output-related-legal',
        title: 'Generated Output Related Legal',
        body: [
          'Use ordinary use to keep Understanding Generated Output tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner. The point matters in related legal because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Related Legal.',
          'The public boundary for Understanding Generated Output is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Understanding Generated Output should not use related legal to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-generated-output-reader-risk',
        title: 'Generated Output Reader Risk',
        body: [
          'Use output for ordinary application purposes within the license and applicable third-party rights. Do not treat output as permission to redistribute source or package materials. The fact also tells the reader which evidence to preserve for reader risk: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Reader Risk.',
          'An operator reading Understanding Generated Output should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the reader risk part of Understanding Generated Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-generated-output-non-advice',
        title: 'Generated Output Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Generated Output should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Ordinary Use and Output. Understanding Generated Output uses the fact as non-advice boundary evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Non-Advice Boundary.',
          'Implementation limits for Understanding Generated Output keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Understanding Generated Output crosses from non-advice boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-generated-output-public-summary',
        title: 'Generated Output Public Summary',
        body: [
          'Generated output can include rendered frames, screenshots, recordings, logs, user world data, learned artifacts, and other files produced while using the application. In Understanding Generated Output, authority scope is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Authority Scope. In Understanding Generated Output, public summary is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Public Summary.',
          'The summary value of Understanding Generated Output is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Generated Output should not use public summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-generated-output-closing-check',
        title: 'Generated Output Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Generated Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Generated Output / Use Permissions and Restrictions / Ordinary Use and Output / Closing Check.',
          'A final check for Understanding Generated Output should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Understanding Generated Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Understanding Application Output', 'Understanding User-Created Materials', 'Separating Original Materials from Output'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding Redistribution Restrictions',
    description:
      'Explains why copying or releasing Ludoxel materials requires separate authority. This page treats license interpretation as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-redistribution-restrictions-authority-scope',
        title: 'Redistribution Restrictions Authority Scope',
        body: [
          'Redistribution, sublicensing, publishing package artifacts, hosting copies, or sharing substantial original materials are restricted outside the license grant. The point matters in authority scope because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Redistribution Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion.',
          'The useful result of Understanding Redistribution Restrictions authority scope is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-controlling-text',
        title: 'Redistribution Restrictions Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Redistribution Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. That reading gives Understanding Redistribution Restrictions a public anchor for controlling text without adding behavior that the current category does not own. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Controlling Text.',
          'A direct observation for Understanding Redistribution Restrictions should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'The useful result of Understanding Redistribution Restrictions controlling text is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-material-class',
        title: 'Redistribution Restrictions Material Class',
        body: [
          'The useful result of Understanding Redistribution Restrictions authority scope is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses. In Understanding Redistribution Restrictions, material class is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Material Class.',
          'Understanding Redistribution Restrictions separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for material class does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Redistribution Restrictions should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-ordinary-use',
        title: 'Redistribution Restrictions Ordinary Use',
        body: [
          'Understanding Redistribution Restrictions should be read as conceptual boundary for redistribution restrictions within Use Permissions and Restrictions and Restricted Uses. For Understanding Redistribution Restrictions, that fact identifies the first concrete boundary for ordinary use: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Ordinary Use.',
          'Ownership in Understanding Redistribution Restrictions is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'A public report based on the ordinary use part of Understanding Redistribution Restrictions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-restricted-use',
        title: 'Redistribution Restrictions Restricted Use',
        body: [
          'A direct observation for Understanding Redistribution Restrictions should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for restricted use: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Restricted Use.',
          'Visible feedback for Understanding Redistribution Restrictions should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Restricted Uses.',
          'Use restricted use to keep Understanding Redistribution Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-third-party-split',
        title: 'Redistribution Restrictions Third-Party Split',
        body: [
          'The useful result of Understanding Redistribution Restrictions controlling text is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses. That reading gives Understanding Redistribution Restrictions a public anchor for third-party split without adding behavior that the current category does not own. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Third-Party Split.',
          'When Understanding Redistribution Restrictions touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Understanding Redistribution Restrictions third-party split is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-public-summary-limit',
        title: 'Redistribution Restrictions Public Summary Limit',
        body: [
          'Creating a local build for verification does not make that build redistributable. Build output should be described as local evidence unless official distribution authority applies. In Understanding Redistribution Restrictions, material class is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Material Class. In Understanding Redistribution Restrictions, public summary limit is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Public Summary Limit.',
          'The surrounding context for Understanding Redistribution Restrictions decides which adjacent topic is relevant. Understanding Redistribution Restrictions should be compared with Understanding License Authority, Avoiding Unofficial Release Claims, Understanding Distribution Materials only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding Redistribution Restrictions should not use public summary limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-reporting-limit',
        title: 'Redistribution Restrictions Reporting Limit',
        body: [
          'Understanding Redistribution Restrictions separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for reporting limit: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Reporting Limit.',
          'Recovery or follow-up for Understanding Redistribution Restrictions should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the reporting limit part of Understanding Redistribution Restrictions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-distribution-limit',
        title: 'Redistribution Restrictions Distribution Limit',
        body: [
          'If the available evidence for material class does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Redistribution Restrictions should be treated as an observation rather than a confirmed cause. In Understanding Redistribution Restrictions, distribution limit is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Distribution Limit.',
          'The main confusion risk in Understanding Redistribution Restrictions is expanding permissions through explanatory wording. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for distribution limit does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Redistribution Restrictions should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-ai-use-limit',
        title: 'Redistribution Restrictions AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. Understanding Redistribution Restrictions uses the fact as ai use limit evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / AI Use Limit.',
          'Reportable evidence for Understanding Redistribution Restrictions should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use ai use limit to keep Understanding Redistribution Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-evidence',
        title: 'Redistribution Restrictions Legal Evidence',
        body: [
          'Ownership in Understanding Redistribution Restrictions is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. Understanding Redistribution Restrictions uses the fact as legal evidence evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Legal Evidence.',
          'Adjacent pages matter for Understanding Redistribution Restrictions, but adjacency does not move authority. Understanding Redistribution Restrictions should be compared with Understanding License Authority, Avoiding Unofficial Release Claims, Understanding Distribution Materials only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use legal evidence to keep Understanding Redistribution Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-related-legal',
        title: 'Redistribution Restrictions Related Legal',
        body: [
          'A public report based on the ordinary use part of Understanding Redistribution Restrictions should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Understanding Redistribution Restrictions, related legal is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Related Legal.',
          'The public boundary for Understanding Redistribution Restrictions is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Understanding Redistribution Restrictions should not use related legal to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-reader-risk',
        title: 'Redistribution Restrictions Reader Risk',
        body: [
          'Third-party materials may impose their own notice and license requirements. Complying with a third-party license does not grant rights to Ludoxel original materials. For Understanding Redistribution Restrictions, that fact identifies the first concrete boundary for reader risk: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Reader Risk.',
          'An operator reading Understanding Redistribution Restrictions should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the reader risk part of Understanding Redistribution Restrictions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-non-advice',
        title: 'Redistribution Restrictions Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Redistribution Restrictions should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Restricted Uses. For Understanding Redistribution Restrictions, that fact identifies the first concrete boundary for non-advice boundary: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Non-Advice Boundary.',
          'Implementation limits for Understanding Redistribution Restrictions keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Understanding Redistribution Restrictions crosses from non-advice boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-public-summary',
        title: 'Redistribution Restrictions Public Summary',
        body: [
          'Redistribution, sublicensing, publishing package artifacts, hosting copies, or sharing substantial original materials are restricted outside the license grant. That reading gives Understanding Redistribution Restrictions a public anchor for public summary without adding behavior that the current category does not own. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Public Summary.',
          'The summary value of Understanding Redistribution Restrictions is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Understanding Redistribution Restrictions public summary is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-closing-check',
        title: 'Redistribution Restrictions Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Redistribution Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Redistribution Restrictions / Use Permissions and Restrictions / Restricted Uses / Closing Check.',
          'A final check for Understanding Redistribution Restrictions should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding Redistribution Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Understanding License Authority', 'Avoiding Unofficial Release Claims', 'Understanding Distribution Materials'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding Derivative Work Restrictions',
    description:
      'Explains how modified project materials remain constrained by the license. This page treats license interpretation as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-derivative-work-restrictions-authority-scope',
        title: 'Derivative Work Restrictions Authority Scope',
        body: [
          'Local tools can technically modify files, but technical ability does not create permission to publish derivative works based on Ludoxel original materials. Understanding Derivative Work Restrictions uses the fact as authority scope evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Authority Scope. Understanding Derivative Work Restrictions uses the fact as authority scope evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Derivative Work Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion.',
          'When Understanding Derivative Work Restrictions crosses from authority scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-controlling-text',
        title: 'Derivative Work Restrictions Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Derivative Work Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. The fact also tells the reader which evidence to preserve for controlling text: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Controlling Text.',
          'A direct observation for Understanding Derivative Work Restrictions should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'Use controlling text to keep Understanding Derivative Work Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-material-class',
        title: 'Derivative Work Restrictions Material Class',
        body: [
          'When Understanding Derivative Work Restrictions crosses from authority scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. Understanding Derivative Work Restrictions uses the fact as material class evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Material Class.',
          'Understanding Derivative Work Restrictions separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form.',
          'When Understanding Derivative Work Restrictions crosses from material class into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-ordinary-use',
        title: 'Derivative Work Restrictions Ordinary Use',
        body: [
          'Understanding Derivative Work Restrictions should be read as conceptual boundary for derivative work restrictions within Use Permissions and Restrictions and Restricted Uses. The point matters in ordinary use because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Ordinary Use.',
          'Ownership in Understanding Derivative Work Restrictions is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'Understanding Derivative Work Restrictions should not use ordinary use to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-restricted-use',
        title: 'Derivative Work Restrictions Restricted Use',
        body: [
          'A direct observation for Understanding Derivative Work Restrictions should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. In Understanding Derivative Work Restrictions, restricted use is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Restricted Use.',
          'Visible feedback for Understanding Derivative Work Restrictions should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Restricted Uses.',
          'If the available evidence for restricted use does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Derivative Work Restrictions should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-third-party-split',
        title: 'Derivative Work Restrictions Third-Party Split',
        body: [
          'Use controlling text to keep Understanding Derivative Work Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner. For Understanding Derivative Work Restrictions, that fact identifies the first concrete boundary for third-party split: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Third-Party Split.',
          'When Understanding Derivative Work Restrictions touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Understanding Derivative Work Restrictions crosses from third-party split into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-public-summary-limit',
        title: 'Derivative Work Restrictions Public Summary Limit',
        body: [
          'Submitting patches, replacement text, design assets, generated files, or implementation proposals is outside the contribution policy and can be closed without review. Understanding Derivative Work Restrictions uses the fact as material class evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Material Class. For Understanding Derivative Work Restrictions, that fact identifies the first concrete boundary for public summary limit: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Public Summary Limit.',
          'The surrounding context for Understanding Derivative Work Restrictions decides which adjacent topic is relevant. Understanding Derivative Work Restrictions should be compared with Understanding Original Materials, Understanding Redistribution Restrictions, Understanding Contribution Refusal only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Understanding Derivative Work Restrictions crosses from public summary limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-reporting-limit',
        title: 'Derivative Work Restrictions Reporting Limit',
        body: [
          'Understanding Derivative Work Restrictions separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form. The point matters in reporting limit because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Reporting Limit.',
          'Recovery or follow-up for Understanding Derivative Work Restrictions should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Understanding Derivative Work Restrictions should not use reporting limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-distribution-limit',
        title: 'Derivative Work Restrictions Distribution Limit',
        body: [
          'When Understanding Derivative Work Restrictions crosses from material class into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. Understanding Derivative Work Restrictions uses the fact as distribution limit evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Distribution Limit.',
          'The main confusion risk in Understanding Derivative Work Restrictions is expanding permissions through explanatory wording. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Understanding Derivative Work Restrictions crosses from distribution limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-ai-use-limit',
        title: 'Derivative Work Restrictions AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. In Understanding Derivative Work Restrictions, ai use limit is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / AI Use Limit.',
          'Reportable evidence for Understanding Derivative Work Restrictions should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Understanding Derivative Work Restrictions should not use ai use limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-evidence',
        title: 'Derivative Work Restrictions Legal Evidence',
        body: [
          'Ownership in Understanding Derivative Work Restrictions is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. In Understanding Derivative Work Restrictions, legal evidence is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Legal Evidence.',
          'Adjacent pages matter for Understanding Derivative Work Restrictions, but adjacency does not move authority. Understanding Derivative Work Restrictions should be compared with Understanding Original Materials, Understanding Redistribution Restrictions, Understanding Contribution Refusal only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Understanding Derivative Work Restrictions should not use legal evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-related-legal',
        title: 'Derivative Work Restrictions Related Legal',
        body: [
          'Understanding Derivative Work Restrictions should not use ordinary use to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Understanding Derivative Work Restrictions, that fact identifies the first concrete boundary for related legal: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Related Legal.',
          'The public boundary for Understanding Derivative Work Restrictions is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the related legal part of Understanding Derivative Work Restrictions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-reader-risk',
        title: 'Derivative Work Restrictions Reader Risk',
        body: [
          'Distinguish private local experimentation, ordinary use output, and public derivative distribution. Each has different policy and license consequences. In Understanding Derivative Work Restrictions, restricted use is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Restricted Use. That reading gives Understanding Derivative Work Restrictions a public anchor for reader risk without adding behavior that the current category does not own. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Reader Risk.',
          'An operator reading Understanding Derivative Work Restrictions should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for reader risk does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Derivative Work Restrictions should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-non-advice',
        title: 'Derivative Work Restrictions Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Derivative Work Restrictions should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Restricted Uses. The point matters in non-advice boundary because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Non-Advice Boundary.',
          'Implementation limits for Understanding Derivative Work Restrictions keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Understanding Derivative Work Restrictions non-advice boundary is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-public-summary',
        title: 'Derivative Work Restrictions Public Summary',
        body: [
          'Local tools can technically modify files, but technical ability does not create permission to publish derivative works based on Ludoxel original materials. Understanding Derivative Work Restrictions uses the fact as authority scope evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Authority Scope. The fact also tells the reader which evidence to preserve for public summary: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Public Summary.',
          'The summary value of Understanding Derivative Work Restrictions is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use public summary to keep Understanding Derivative Work Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-closing-check',
        title: 'Derivative Work Restrictions Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Derivative Work Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. In Understanding Derivative Work Restrictions, closing check is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Derivative Work Restrictions / Use Permissions and Restrictions / Restricted Uses / Closing Check.',
          'A final check for Understanding Derivative Work Restrictions should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Derivative Work Restrictions should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Understanding Original Materials', 'Understanding Redistribution Restrictions', 'Understanding Contribution Refusal'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding AI Use Restrictions',
    description:
      'Explains license boundaries for AI-related use of Ludoxel materials. This page treats license interpretation as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-ai-use-restrictions-authority-scope',
        title: 'AI Use Restrictions Authority Scope',
        body: [
          'The license includes restrictions on using original materials for model training, dataset creation, automated extraction, or similar AI-related processing outside the granted scope. The point matters in authority scope because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Authority Scope.',
          'Authority Scope defines the useful size of Understanding AI Use Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion.',
          'Understanding AI Use Restrictions should not use authority scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-controlling-text',
        title: 'AI Use Restrictions Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding AI Use Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. In Understanding AI Use Restrictions, controlling text is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Controlling Text.',
          'A direct observation for Understanding AI Use Restrictions should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'Understanding AI Use Restrictions should not use controlling text to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-material-class',
        title: 'AI Use Restrictions Material Class',
        body: [
          'Understanding AI Use Restrictions should not use authority scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in material class because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Material Class.',
          'Understanding AI Use Restrictions separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding AI Use Restrictions material class is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-ordinary-use',
        title: 'AI Use Restrictions Ordinary Use',
        body: [
          'Understanding AI Use Restrictions should be read as conceptual boundary for ai use restrictions within Use Permissions and Restrictions and Restricted Uses. In Understanding AI Use Restrictions, controlling text is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Controlling Text. The fact also tells the reader which evidence to preserve for ordinary use: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Ordinary Use.',
          'Ownership in Understanding AI Use Restrictions is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'A public report based on the ordinary use part of Understanding AI Use Restrictions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-restricted-use',
        title: 'AI Use Restrictions Restricted Use',
        body: [
          'A direct observation for Understanding AI Use Restrictions should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. For Understanding AI Use Restrictions, that fact identifies the first concrete boundary for restricted use: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Restricted Use.',
          'Visible feedback for Understanding AI Use Restrictions should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Restricted Uses.',
          'When Understanding AI Use Restrictions crosses from restricted use into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-third-party-split',
        title: 'AI Use Restrictions Third-Party Split',
        body: [
          'Understanding AI Use Restrictions should not use controlling text to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Understanding AI Use Restrictions, third-party split is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Third-Party Split.',
          'When Understanding AI Use Restrictions touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding AI Use Restrictions should not use third-party split to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-public-summary-limit',
        title: 'AI Use Restrictions Public Summary Limit',
        body: [
          'Ludoxel AI learning records are user data produced by the application. That feature does not grant permission to train external models on Ludoxel original materials. The point matters in public summary limit because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Public Summary Limit.',
          'The surrounding context for Understanding AI Use Restrictions decides which adjacent topic is relevant. Understanding AI Use Restrictions should be compared with Understanding Contribution Refusal, Understanding Original Materials, Understanding User-Created Materials only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding AI Use Restrictions should not use public summary limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-reporting-limit',
        title: 'AI Use Restrictions Reporting Limit',
        body: [
          'Understanding AI Use Restrictions separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for reporting limit: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Reporting Limit.',
          'Recovery or follow-up for Understanding AI Use Restrictions should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use reporting limit to keep Understanding AI Use Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-distribution-limit',
        title: 'AI Use Restrictions Distribution Limit',
        body: [
          'The useful result of Understanding AI Use Restrictions material class is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses. In Understanding AI Use Restrictions, distribution limit is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Distribution Limit.',
          'The main confusion risk in Understanding AI Use Restrictions is expanding permissions through explanatory wording. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Understanding AI Use Restrictions should not use distribution limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-ai-use-limit',
        title: 'AI Use Restrictions AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. Understanding AI Use Restrictions uses the fact as ai use limit evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / AI Use Limit.',
          'Reportable evidence for Understanding AI Use Restrictions should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Understanding AI Use Restrictions crosses from ai use limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-evidence',
        title: 'AI Use Restrictions Legal Evidence',
        body: [
          'Ownership in Understanding AI Use Restrictions is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The fact also tells the reader which evidence to preserve for legal evidence: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Legal Evidence.',
          'Adjacent pages matter for Understanding AI Use Restrictions, but adjacency does not move authority. Understanding AI Use Restrictions should be compared with Understanding Contribution Refusal, Understanding Original Materials, Understanding User-Created Materials only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use legal evidence to keep Understanding AI Use Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-related-legal',
        title: 'AI Use Restrictions Related Legal',
        body: [
          'A public report based on the ordinary use part of Understanding AI Use Restrictions should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Understanding AI Use Restrictions a public anchor for related legal without adding behavior that the current category does not own. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Related Legal.',
          'The public boundary for Understanding AI Use Restrictions is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding AI Use Restrictions related legal is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Restricted Uses.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-reader-risk',
        title: 'AI Use Restrictions Reader Risk',
        body: [
          'Separate user-created demonstrations and outputs from repository source, documentation, assets, and package resources when evaluating AI-related rights. Understanding AI Use Restrictions uses the fact as reader risk evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Reader Risk.',
          'An operator reading Understanding AI Use Restrictions should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'Use reader risk to keep Understanding AI Use Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-non-advice',
        title: 'AI Use Restrictions Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding AI Use Restrictions should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Use Permissions and Restrictions / Restricted Uses. The fact also tells the reader which evidence to preserve for non-advice boundary: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Non-Advice Boundary.',
          'Implementation limits for Understanding AI Use Restrictions keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use non-advice boundary to keep Understanding AI Use Restrictions tied to Use Permissions and Restrictions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-public-summary',
        title: 'AI Use Restrictions Public Summary',
        body: [
          'The license includes restrictions on using original materials for model training, dataset creation, automated extraction, or similar AI-related processing outside the granted scope. In Understanding AI Use Restrictions, public summary is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Public Summary.',
          'The summary value of Understanding AI Use Restrictions is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding AI Use Restrictions should not use public summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-closing-check',
        title: 'AI Use Restrictions Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding AI Use Restrictions. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding AI Use Restrictions / Use Permissions and Restrictions / Restricted Uses / Closing Check.',
          'A final check for Understanding AI Use Restrictions should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Understanding AI Use Restrictions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Understanding Contribution Refusal', 'Understanding Original Materials', 'Understanding User-Created Materials'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Public and Private Reporting',
    title: 'Understanding Public Issue Limits',
    description:
      'Explains what belongs in Ludoxel public issue forms. This page treats public issue limits as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-public-issue-limits-authority-scope',
        title: 'Public Issue Limits Authority Scope',
        body: [
          'Public issues are limited to reproducible non-security problem reports, limited questions, and minimal security contact requests when no private channel is available. The point matters in authority scope because reading public issue limits in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Public Issue Limits. The article should be broad enough to explain public issue limits, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion.',
          'The useful result of Understanding Public Issue Limits authority scope is a bounded explanation of public issue limits: enough detail to act, and enough restraint to avoid claims outside Public and Private Reporting.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-controlling-text',
        title: 'Public Issue Limits Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Public Issue Limits. The article should be broad enough to explain public issue limits, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. That reading gives Understanding Public Issue Limits a public anchor for controlling text without adding behavior that the current category does not own. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Controlling Text.',
          'A direct observation for Understanding Public Issue Limits should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'The useful result of Understanding Public Issue Limits controlling text is a bounded explanation of public issue limits: enough detail to act, and enough restraint to avoid claims outside Public and Private Reporting.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-material-class',
        title: 'Public Issue Limits Material Class',
        body: [
          'The useful result of Understanding Public Issue Limits authority scope is a bounded explanation of public issue limits: enough detail to act, and enough restraint to avoid claims outside Public and Private Reporting. That reading gives Understanding Public Issue Limits a public anchor for material class without adding behavior that the current category does not own. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Material Class.',
          'Understanding Public Issue Limits separates the surface that accepts input from the component or document that controls the result. This is especially important when reading public issue limits in its documented category crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding Public Issue Limits material class is a bounded explanation of public issue limits: enough detail to act, and enough restraint to avoid claims outside Public and Private Reporting.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-ordinary-use',
        title: 'Public Issue Limits Ordinary Use',
        body: [
          'Understanding Public Issue Limits should be read as conceptual boundary for public issue limits within Reporting and Contributions and Public and Private Reporting. The fact also tells the reader which evidence to preserve for ordinary use: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Ordinary Use.',
          'Ownership in Understanding Public Issue Limits is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'Use ordinary use to keep Understanding Public Issue Limits tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-restricted-use',
        title: 'Public Issue Limits Restricted Use',
        body: [
          'A direct observation for Understanding Public Issue Limits should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for restricted use: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Restricted Use.',
          'Visible feedback for Understanding Public Issue Limits should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Reporting and Contributions / Public and Private Reporting.',
          'Use restricted use to keep Understanding Public Issue Limits tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-third-party-split',
        title: 'Public Issue Limits Third-Party Split',
        body: [
          'The useful result of Understanding Public Issue Limits controlling text is a bounded explanation of public issue limits: enough detail to act, and enough restraint to avoid claims outside Public and Private Reporting. That reading gives Understanding Public Issue Limits a public anchor for third-party split without adding behavior that the current category does not own. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Third-Party Split.',
          'When Understanding Public Issue Limits touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Understanding Public Issue Limits third-party split is a bounded explanation of public issue limits: enough detail to act, and enough restraint to avoid claims outside Public and Private Reporting.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-public-summary-limit',
        title: 'Public Issue Limits Public Summary Limit',
        body: [
          'Public issues must not include contribution material, replacement text, patches, design assets, datasets, generated files, shader rewrites, implementation proposals, or private security details. That reading gives Understanding Public Issue Limits a public anchor for public summary limit without adding behavior that the current category does not own. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Public Summary Limit.',
          'The surrounding context for Understanding Public Issue Limits decides which adjacent topic is relevant. Understanding Public Issue Limits should be compared with Writing a Problem Report, Asking a Limited Question, Understanding Private Security Reporting only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for public summary limit does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Public Issue Limits should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-reporting-limit',
        title: 'Public Issue Limits Reporting Limit',
        body: [
          'Understanding Public Issue Limits separates the surface that accepts input from the component or document that controls the result. This is especially important when reading public issue limits in its documented category crosses a saved value, a renderer output, or a public form. For Understanding Public Issue Limits, that fact identifies the first concrete boundary for reporting limit: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Reporting Limit.',
          'Recovery or follow-up for Understanding Public Issue Limits should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Public Issue Limits crosses from reporting limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-distribution-limit',
        title: 'Public Issue Limits Distribution Limit',
        body: [
          'The useful result of Understanding Public Issue Limits material class is a bounded explanation of public issue limits: enough detail to act, and enough restraint to avoid claims outside Public and Private Reporting. In Understanding Public Issue Limits, distribution limit is the difference between reading public issue limits and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Distribution Limit.',
          'The main confusion risk in Understanding Public Issue Limits is moving the topic outside its confirmed boundary. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for distribution limit does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Public Issue Limits should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-ai-use-limit',
        title: 'Public Issue Limits AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. The fact also tells the reader which evidence to preserve for ai use limit: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / AI Use Limit.',
          'Reportable evidence for Understanding Public Issue Limits should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the ai use limit part of Understanding Public Issue Limits should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-evidence',
        title: 'Public Issue Limits Legal Evidence',
        body: [
          'Ownership in Understanding Public Issue Limits is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. Understanding Public Issue Limits uses the fact as legal evidence evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Legal Evidence.',
          'Adjacent pages matter for Understanding Public Issue Limits, but adjacency does not move authority. Understanding Public Issue Limits should be compared with Writing a Problem Report, Asking a Limited Question, Understanding Private Security Reporting only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use legal evidence to keep Understanding Public Issue Limits tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-related-legal',
        title: 'Public Issue Limits Related Legal',
        body: [
          'Use ordinary use to keep Understanding Public Issue Limits tied to Reporting and Contributions; use a related page only when the reader needs a different owner. That reading gives Understanding Public Issue Limits a public anchor for related legal without adding behavior that the current category does not own. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Related Legal.',
          'The public boundary for Understanding Public Issue Limits is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for related legal does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Public Issue Limits should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-reader-risk',
        title: 'Public Issue Limits Reader Risk',
        body: [
          'Using a public GitHub form does not grant rights beyond the license. Keep issue content factual, limited, and suitable for public disclosure. The fact also tells the reader which evidence to preserve for reader risk: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Reader Risk.',
          'An operator reading Understanding Public Issue Limits should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'Use reader risk to keep Understanding Public Issue Limits tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-non-advice',
        title: 'Public Issue Limits Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Public Issue Limits should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Reporting and Contributions / Public and Private Reporting. Understanding Public Issue Limits uses the fact as non-advice boundary evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Non-Advice Boundary.',
          'Implementation limits for Understanding Public Issue Limits keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use non-advice boundary to keep Understanding Public Issue Limits tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-public-summary',
        title: 'Public Issue Limits Public Summary',
        body: [
          'Public issues are limited to reproducible non-security problem reports, limited questions, and minimal security contact requests when no private channel is available. The point matters in public summary because reading public issue limits in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Public Summary.',
          'The summary value of Understanding Public Issue Limits is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Public Issue Limits should not use public summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-closing-check',
        title: 'Public Issue Limits Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Public Issue Limits. The article should be broad enough to explain public issue limits, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Public Issue Limits / Reporting and Contributions / Public and Private Reporting / Closing Check.',
          'A final check for Understanding Public Issue Limits should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding Public Issue Limits tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Asking a Limited Question', 'Understanding Private Security Reporting'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Public and Private Reporting',
    title: 'Understanding Private Security Reporting',
    description:
      'Explains how suspected vulnerabilities should be reported. This page treats support routing as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-private-security-reporting-authority-scope',
        title: 'Private Security Reporting Authority Scope',
        body: [
          'Use GitHub private vulnerability reporting, a security advisory, or another private reporting channel when available for suspected vulnerabilities. The fact also tells the reader which evidence to preserve for authority scope: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Private Security Reporting. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'Use authority scope to keep Understanding Private Security Reporting tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-controlling-text',
        title: 'Private Security Reporting Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Private Security Reporting. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. For Understanding Private Security Reporting, that fact identifies the first concrete boundary for controlling text: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Controlling Text.',
          'A direct observation for Understanding Private Security Reporting should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'A public report based on the controlling text part of Understanding Private Security Reporting should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-material-class',
        title: 'Private Security Reporting Material Class',
        body: [
          'Use authority scope to keep Understanding Private Security Reporting tied to Reporting and Contributions; use a related page only when the reader needs a different owner. Understanding Private Security Reporting uses the fact as material class evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Material Class.',
          'Understanding Private Security Reporting separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'When Understanding Private Security Reporting crosses from material class into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-ordinary-use',
        title: 'Private Security Reporting Ordinary Use',
        body: [
          'Understanding Private Security Reporting should be read as conceptual boundary for private security reporting within Reporting and Contributions and Public and Private Reporting. In Understanding Private Security Reporting, ordinary use is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Ordinary Use.',
          'Ownership in Understanding Private Security Reporting is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'If the available evidence for ordinary use does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Private Security Reporting should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-restricted-use',
        title: 'Private Security Reporting Restricted Use',
        body: [
          'A direct observation for Understanding Private Security Reporting should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. The point matters in restricted use because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Restricted Use.',
          'Visible feedback for Understanding Private Security Reporting should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Reporting and Contributions / Public and Private Reporting.',
          'Understanding Private Security Reporting should not use restricted use to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-third-party-split',
        title: 'Private Security Reporting Third-Party Split',
        body: [
          'A public report based on the controlling text part of Understanding Private Security Reporting should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for third-party split: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Third-Party Split.',
          'When Understanding Private Security Reporting touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the third-party split part of Understanding Private Security Reporting should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-public-summary-limit',
        title: 'Private Security Reporting Public Summary Limit',
        body: [
          'If no private channel is available, a public security contact request should include only a category-level request and safe contact method. Understanding Private Security Reporting uses the fact as material class evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Material Class. The fact also tells the reader which evidence to preserve for public summary limit: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Public Summary Limit.',
          'The surrounding context for Understanding Private Security Reporting decides which adjacent topic is relevant. Understanding Private Security Reporting should be compared with Requesting a Private Security Channel, Avoiding Public Exploit Details, Reading Security Policy only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the public summary limit part of Understanding Private Security Reporting should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-reporting-limit',
        title: 'Private Security Reporting Reporting Limit',
        body: [
          'Understanding Private Security Reporting separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. In Understanding Private Security Reporting, reporting limit is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Reporting Limit.',
          'Recovery or follow-up for Understanding Private Security Reporting should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for reporting limit does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Private Security Reporting should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-distribution-limit',
        title: 'Private Security Reporting Distribution Limit',
        body: [
          'When Understanding Private Security Reporting crosses from material class into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for distribution limit: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Distribution Limit.',
          'The main confusion risk in Understanding Private Security Reporting is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use distribution limit to keep Understanding Private Security Reporting tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-ai-use-limit',
        title: 'Private Security Reporting AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. In Understanding Private Security Reporting, ordinary use is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Ordinary Use. In Understanding Private Security Reporting, ai use limit is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / AI Use Limit.',
          'Reportable evidence for Understanding Private Security Reporting should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Understanding Private Security Reporting should not use ai use limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-evidence',
        title: 'Private Security Reporting Legal Evidence',
        body: [
          'Ownership in Understanding Private Security Reporting is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. That reading gives Understanding Private Security Reporting a public anchor for legal evidence without adding behavior that the current category does not own. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Legal Evidence.',
          'Adjacent pages matter for Understanding Private Security Reporting, but adjacency does not move authority. Understanding Private Security Reporting should be compared with Requesting a Private Security Channel, Avoiding Public Exploit Details, Reading Security Policy only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for legal evidence does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Private Security Reporting should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-related-legal',
        title: 'Private Security Reporting Related Legal',
        body: [
          'If the available evidence for ordinary use does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Private Security Reporting should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for related legal: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Related Legal.',
          'The public boundary for Understanding Private Security Reporting is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use related legal to keep Understanding Private Security Reporting tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-reader-risk',
        title: 'Private Security Reporting Reader Risk',
        body: [
          'Security testing must remain lawful, non-destructive, good-faith, and limited to systems, accounts, files, and data the reporter is authorized to test. In Understanding Private Security Reporting, reader risk is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Reader Risk.',
          'An operator reading Understanding Private Security Reporting should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'Understanding Private Security Reporting should not use reader risk to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-non-advice',
        title: 'Private Security Reporting Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Private Security Reporting should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Reporting and Contributions / Public and Private Reporting. That reading gives Understanding Private Security Reporting a public anchor for non-advice boundary without adding behavior that the current category does not own. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Non-Advice Boundary.',
          'Implementation limits for Understanding Private Security Reporting keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for non-advice boundary does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Private Security Reporting should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-public-summary',
        title: 'Private Security Reporting Public Summary',
        body: [
          'Use GitHub private vulnerability reporting, a security advisory, or another private reporting channel when available for suspected vulnerabilities. For Understanding Private Security Reporting, that fact identifies the first concrete boundary for public summary: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Public Summary.',
          'The summary value of Understanding Private Security Reporting is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the public summary part of Understanding Private Security Reporting should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-closing-check',
        title: 'Private Security Reporting Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Private Security Reporting. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. In Understanding Private Security Reporting, closing check is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Private Security Reporting / Reporting and Contributions / Public and Private Reporting / Closing Check.',
          'A final check for Understanding Private Security Reporting should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Private Security Reporting should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Requesting a Private Security Channel', 'Avoiding Public Exploit Details', 'Reading Security Policy'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Contribution Boundaries',
    title: 'Understanding Contribution Refusal',
    description:
      'Explains why Ludoxel public channels do not accept external contribution material. This page treats developer inspection as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-contribution-refusal-authority-scope',
        title: 'Contribution Refusal Authority Scope',
        body: [
          'The contribution policy states that external contribution material is not accepted. This includes source code, patches, replacement documentation, assets, datasets, generated files, and implementation proposals. That reading gives Understanding Contribution Refusal a public anchor for authority scope without adding behavior that the current category does not own. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Contribution Refusal. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'The useful result of Understanding Contribution Refusal authority scope is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-controlling-text',
        title: 'Contribution Refusal Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Contribution Refusal. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The point matters in controlling text because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Controlling Text.',
          'A direct observation for Understanding Contribution Refusal should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'The useful result of Understanding Contribution Refusal controlling text is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-material-class',
        title: 'Contribution Refusal Material Class',
        body: [
          'The useful result of Understanding Contribution Refusal authority scope is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries. That reading gives Understanding Contribution Refusal a public anchor for material class without adding behavior that the current category does not own. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Material Class.',
          'Understanding Contribution Refusal separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for material class does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Contribution Refusal should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-ordinary-use',
        title: 'Contribution Refusal Ordinary Use',
        body: [
          'Understanding Contribution Refusal should be read as conceptual boundary for contribution refusal within Reporting and Contributions and Contribution Boundaries. Understanding Contribution Refusal uses the fact as ordinary use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Ordinary Use.',
          'Ownership in Understanding Contribution Refusal is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'Use ordinary use to keep Understanding Contribution Refusal tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-restricted-use',
        title: 'Contribution Refusal Restricted Use',
        body: [
          'A direct observation for Understanding Contribution Refusal should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for restricted use: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Restricted Use.',
          'Visible feedback for Understanding Contribution Refusal should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Reporting and Contributions / Contribution Boundaries.',
          'A public report based on the restricted use part of Understanding Contribution Refusal should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-third-party-split',
        title: 'Contribution Refusal Third-Party Split',
        body: [
          'The useful result of Understanding Contribution Refusal controlling text is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries. In Understanding Contribution Refusal, third-party split is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Third-Party Split.',
          'When Understanding Contribution Refusal touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding Contribution Refusal should not use third-party split to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-public-summary-limit',
        title: 'Contribution Refusal Public Summary Limit',
        body: [
          'Public issue forms are for limited reports or questions, not for submitting project changes. Material outside the allowed scope may be closed without review. In Understanding Contribution Refusal, public summary limit is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Public Summary Limit.',
          'The surrounding context for Understanding Contribution Refusal decides which adjacent topic is relevant. Understanding Contribution Refusal should be compared with Understanding Pull Request Boundaries, Reading Contribution Policy, Avoiding Feature Requests only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for public summary limit does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Contribution Refusal should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-reporting-limit',
        title: 'Contribution Refusal Reporting Limit',
        body: [
          'Understanding Contribution Refusal separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. Understanding Contribution Refusal uses the fact as reporting limit evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Reporting Limit.',
          'Recovery or follow-up for Understanding Contribution Refusal should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Contribution Refusal crosses from reporting limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-distribution-limit',
        title: 'Contribution Refusal Distribution Limit',
        body: [
          'If the available evidence for material class does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Contribution Refusal should be treated as an observation rather than a confirmed cause. The point matters in distribution limit because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Distribution Limit.',
          'The main confusion risk in Understanding Contribution Refusal is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Understanding Contribution Refusal distribution limit is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-ai-use-limit',
        title: 'Contribution Refusal AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. Understanding Contribution Refusal uses the fact as ordinary use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Ordinary Use. For Understanding Contribution Refusal, that fact identifies the first concrete boundary for ai use limit: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / AI Use Limit.',
          'Reportable evidence for Understanding Contribution Refusal should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the ai use limit part of Understanding Contribution Refusal should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-evidence',
        title: 'Contribution Refusal Legal Evidence',
        body: [
          'Ownership in Understanding Contribution Refusal is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The fact also tells the reader which evidence to preserve for legal evidence: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Legal Evidence.',
          'Adjacent pages matter for Understanding Contribution Refusal, but adjacency does not move authority. Understanding Contribution Refusal should be compared with Understanding Pull Request Boundaries, Reading Contribution Policy, Avoiding Feature Requests only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use legal evidence to keep Understanding Contribution Refusal tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-related-legal',
        title: 'Contribution Refusal Related Legal',
        body: [
          'Use ordinary use to keep Understanding Contribution Refusal tied to Reporting and Contributions; use a related page only when the reader needs a different owner. The point matters in related legal because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Related Legal.',
          'The public boundary for Understanding Contribution Refusal is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Understanding Contribution Refusal should not use related legal to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-reader-risk',
        title: 'Contribution Refusal Reader Risk',
        body: [
          'The contribution refusal policy does not restrict ordinary application use. It controls repository communication and project material submission boundaries. Understanding Contribution Refusal uses the fact as reader risk evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Reader Risk.',
          'An operator reading Understanding Contribution Refusal should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'Use reader risk to keep Understanding Contribution Refusal tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-non-advice',
        title: 'Contribution Refusal Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Contribution Refusal should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Reporting and Contributions / Contribution Boundaries. Understanding Contribution Refusal uses the fact as non-advice boundary evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Non-Advice Boundary.',
          'Implementation limits for Understanding Contribution Refusal keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Understanding Contribution Refusal crosses from non-advice boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-public-summary',
        title: 'Contribution Refusal Public Summary',
        body: [
          'The contribution policy states that external contribution material is not accepted. This includes source code, patches, replacement documentation, assets, datasets, generated files, and implementation proposals. In Understanding Contribution Refusal, public summary is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Public Summary.',
          'The summary value of Understanding Contribution Refusal is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Contribution Refusal should not use public summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-closing-check',
        title: 'Contribution Refusal Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Contribution Refusal. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use. The local reading frame is Understanding Contribution Refusal / Reporting and Contributions / Contribution Boundaries / Closing Check.',
          'A final check for Understanding Contribution Refusal should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Understanding Contribution Refusal should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Understanding Pull Request Boundaries', 'Reading Contribution Policy', 'Avoiding Feature Requests'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Contribution Boundaries',
    title: 'Understanding Pull Request Boundaries',
    description:
      'Explains the repository policy around pull requests. This page treats pull request boundaries as a public legal-orientation guide that points to controlling text without expanding it, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-pull-request-boundaries-authority-scope',
        title: 'Pull Request Boundaries Authority Scope',
        body: [
          'Pull requests are not an accepted contribution path for Ludoxel. A public pull request can be closed without review under the repository policy. That reading gives Understanding Pull Request Boundaries a public anchor for authority scope without adding behavior that the current category does not own. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Authority Scope.',
          'Authority Scope defines the useful size of Understanding Pull Request Boundaries. The article should be broad enough to explain pull request boundaries, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion.',
          'The useful result of Understanding Pull Request Boundaries authority scope is a bounded explanation of pull request boundaries: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-controlling-text',
        title: 'Pull Request Boundaries Controlling Text',
        body: [
          'Authority Scope defines the useful size of Understanding Pull Request Boundaries. The article should be broad enough to explain pull request boundaries, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. That reading gives Understanding Pull Request Boundaries a public anchor for controlling text without adding behavior that the current category does not own. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Controlling Text.',
          'A direct observation for Understanding Pull Request Boundaries should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state.',
          'If the available evidence for controlling text does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Pull Request Boundaries should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-material-class',
        title: 'Pull Request Boundaries Material Class',
        body: [
          'The useful result of Understanding Pull Request Boundaries authority scope is a bounded explanation of pull request boundaries: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries. The point matters in material class because reading pull request boundaries in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Material Class.',
          'Understanding Pull Request Boundaries separates the surface that accepts input from the component or document that controls the result. This is especially important when reading pull request boundaries in its documented category crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding Pull Request Boundaries material class is a bounded explanation of pull request boundaries: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-ordinary-use',
        title: 'Pull Request Boundaries Ordinary Use',
        body: [
          'Understanding Pull Request Boundaries should be read as conceptual boundary for pull request boundaries within Reporting and Contributions and Contribution Boundaries. Understanding Pull Request Boundaries uses the fact as ordinary use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Ordinary Use.',
          'Ownership in Understanding Pull Request Boundaries is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text.',
          'Use ordinary use to keep Understanding Pull Request Boundaries tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-restricted-use',
        title: 'Pull Request Boundaries Restricted Use',
        body: [
          'A direct observation for Understanding Pull Request Boundaries should name what the user or reader actually sees before it assigns cause. That keeps the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use ahead of guesses about hidden state. Understanding Pull Request Boundaries uses the fact as restricted use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Restricted Use.',
          'Visible feedback for Understanding Pull Request Boundaries should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Reporting and Contributions / Contribution Boundaries.',
          'Use restricted use to keep Understanding Pull Request Boundaries tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-third-party-split',
        title: 'Pull Request Boundaries Third-Party Split',
        body: [
          'If the available evidence for controlling text does not identify the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text, Understanding Pull Request Boundaries should be treated as an observation rather than a confirmed cause. In Understanding Pull Request Boundaries, third-party split is the difference between reading pull request boundaries and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Third-Party Split.',
          'When Understanding Pull Request Boundaries touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding Pull Request Boundaries should not use third-party split to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-public-summary-limit',
        title: 'Pull Request Boundaries Public Summary Limit',
        body: [
          'A pull request may contain patches, replacement text, generated files, or implementation proposals, all of which fall outside accepted public contribution material. That reading gives Understanding Pull Request Boundaries a public anchor for public summary limit without adding behavior that the current category does not own. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Public Summary Limit.',
          'The surrounding context for Understanding Pull Request Boundaries decides which adjacent topic is relevant. Understanding Pull Request Boundaries should be compared with Understanding Contribution Refusal, Reading Issue Template Boundaries, Avoiding Unauthorized Repository Operations only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Understanding Pull Request Boundaries public summary limit is a bounded explanation of pull request boundaries: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-reporting-limit',
        title: 'Pull Request Boundaries Reporting Limit',
        body: [
          'Understanding Pull Request Boundaries separates the surface that accepts input from the component or document that controls the result. This is especially important when reading pull request boundaries in its documented category crosses a saved value, a renderer output, or a public form. Understanding Pull Request Boundaries uses the fact as reporting limit evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Reporting Limit.',
          'Recovery or follow-up for Understanding Pull Request Boundaries should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Pull Request Boundaries crosses from reporting limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-distribution-limit',
        title: 'Pull Request Boundaries Distribution Limit',
        body: [
          'The useful result of Understanding Pull Request Boundaries material class is a bounded explanation of pull request boundaries: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries. The point matters in distribution limit because reading pull request boundaries in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Distribution Limit.',
          'The main confusion risk in Understanding Pull Request Boundaries is moving the topic outside its confirmed boundary. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Understanding Pull Request Boundaries distribution limit is a bounded explanation of pull request boundaries: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-ai-use-limit',
        title: 'Pull Request Boundaries AI Use Limit',
        body: [
          'The relevant state is constrained by the article category: Legal treats this topic as license and public-policy orientation. Understanding Pull Request Boundaries uses the fact as ordinary use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Ordinary Use. For Understanding Pull Request Boundaries, that fact identifies the first concrete boundary for ai use limit: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / AI Use Limit.',
          'Reportable evidence for Understanding Pull Request Boundaries should be small, concrete, and public. the exact public legal text, affected material category, proposed use, restriction, third-party status, and whether the question concerns ordinary use or a restricted use is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the ai use limit part of Understanding Pull Request Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-evidence',
        title: 'Pull Request Boundaries Legal Evidence',
        body: [
          'Ownership in Understanding Pull Request Boundaries is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. For Understanding Pull Request Boundaries, that fact identifies the first concrete boundary for legal evidence: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Legal Evidence.',
          'Adjacent pages matter for Understanding Pull Request Boundaries, but adjacency does not move authority. Understanding Pull Request Boundaries should be compared with Understanding Contribution Refusal, Reading Issue Template Boundaries, Avoiding Unauthorized Repository Operations only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the legal evidence part of Understanding Pull Request Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-related-legal',
        title: 'Pull Request Boundaries Related Legal',
        body: [
          'Use ordinary use to keep Understanding Pull Request Boundaries tied to Reporting and Contributions; use a related page only when the reader needs a different owner. That reading gives Understanding Pull Request Boundaries a public anchor for related legal without adding behavior that the current category does not own. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Related Legal.',
          'The public boundary for Understanding Pull Request Boundaries is part of the article, not an afterthought. It does not grant extra permission, waive restrictions, replace the controlling text, or provide legal advice. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding Pull Request Boundaries related legal is a bounded explanation of pull request boundaries: enough detail to act, and enough restraint to avoid claims outside Contribution Boundaries.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-reader-risk',
        title: 'Pull Request Boundaries Reader Risk',
        body: [
          'Local authorized work can still create commits or diffs for the user, but that is separate from accepting unsolicited public pull requests. Understanding Pull Request Boundaries uses the fact as restricted use evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Restricted Use. For Understanding Pull Request Boundaries, that fact identifies the first concrete boundary for reader risk: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Reader Risk.',
          'An operator reading Understanding Pull Request Boundaries should follow legal reading starts with material classification, moves to controlling text, and keeps summaries subordinate to the legal source. That order prevents a visible result from being treated as the first source of truth.',
          'When Understanding Pull Request Boundaries crosses from reader risk into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-non-advice',
        title: 'Pull Request Boundaries Non-Advice Boundary',
        body: [
          'Visible feedback for Understanding Pull Request Boundaries should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Legal / Reporting and Contributions / Contribution Boundaries. For Understanding Pull Request Boundaries, that fact identifies the first concrete boundary for non-advice boundary: the root LICENSE, third-party license files, public policy files, issue templates, and controlling legal text. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Non-Advice Boundary.',
          'Implementation limits for Understanding Pull Request Boundaries keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the non-advice boundary part of Understanding Pull Request Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-public-summary',
        title: 'Pull Request Boundaries Public Summary',
        body: [
          'Pull requests are not an accepted contribution path for Ludoxel. A public pull request can be closed without review under the repository policy. In Understanding Pull Request Boundaries, public summary is the difference between reading pull request boundaries and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Public Summary.',
          'The summary value of Understanding Pull Request Boundaries is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Pull Request Boundaries should not use public summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-closing-check',
        title: 'Pull Request Boundaries Closing Check',
        body: [
          'Authority Scope defines the useful size of Understanding Pull Request Boundaries. The article should be broad enough to explain pull request boundaries, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. Understanding Pull Request Boundaries uses the fact as closing check evidence, then keeps the explanation inside Legal rather than turning it into a project-wide claim. The local reading frame is Understanding Pull Request Boundaries / Reporting and Contributions / Contribution Boundaries / Closing Check.',
          'A final check for Understanding Pull Request Boundaries should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding Pull Request Boundaries tied to Reporting and Contributions; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Understanding Contribution Refusal', 'Reading Issue Template Boundaries', 'Avoiding Unauthorized Repository Operations'],
  }),
];
