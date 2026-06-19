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
      'Explains the juridical source of permission for Ludoxel Original Materials, the non-authoritative character of public surfaces, and the point at which authority analysis must stop before material classification or distribution analysis begins.',
    sections: [
      {
        id: 'understanding-license-authority-juridical-function',
        title: 'Juridical Function of License Authority',
        body: [
          'License authority is the legal capacity of a text or later written instrument to grant, withhold, limit, condition, reserve, or terminate permission in relation to Ludoxel Original Materials. It is not the same thing as public availability, technical retrievability, documentation display, repository visibility, platform affordance, package presence, static-site generation, or operational convenience.',
          'The question answered by this article is deliberately anterior to material scope and distribution permission. Before the reader asks whether a proposed act is permitted, the reader must first identify the source from which the asserted permission is alleged to arise. A claim that begins from a repository page, browser-rendered documentation page, clone button, fork button, download archive, preview deployment, generated website output, issue form, release page, package manifest, metadata field, build log, search index, or public cache begins from an access condition, not from license authority.',
          'For Ludoxel Original Materials, license authority is not diffused across every public surface on which Ludoxel material appears. It is centralized in the controlling License Text, subject only to a later written instrument that is competent to alter that legal position. Everything else is subordinate evidence, explanation, notice, routing, or platform behavior unless the controlling source itself gives it operative legal force.',
        ],
      },
      {
        id: 'understanding-license-authority-controlling-source',
        title: 'Controlling Source of Permission',
        body: [
          'The root `LICENSE` is the controlling License Text for Ludoxel Original Materials. It is the place where the permission grant, the reservation of rights, the exclusions from permission, the definitions, the governing-law terms, and the legal limits must be read as legal text rather than as descriptive website copy.',
          '`README.md`, documentation notices, code-block captions, SPDX headers, package metadata, release notes, issue templates, pull-request templates, website metadata, generated documentation text, build output, public summaries, translation fragments, and platform interface text can assist the reader in finding or understanding the License Text. They do not become independent grants, waivers, amendments, exceptions, sublicenses, estoppel instruments, or public-domain dedications merely because they are visible, helpful, or adjacent to protected material.',
          'A public page can point to authority. It cannot substitute itself for authority. A notice can warn the reader that material remains protected. It cannot create an additional permission class. A platform button can make copying technically possible. It cannot transform technical capability into legal authorization.',
        ],
      },
      {
        id: 'understanding-license-authority-non-authority-surfaces',
        title: 'Surfaces That Do Not Confer Authority',
        body: [
          'Repository visibility is not license authority. Documentation-site publication is not license authority. Browser rendering is not license authority. Static-site output is not license authority. Deployment preview is not license authority. Source browsing, search indexing, cached display, copied excerpt display, package inspection, archived download, generated artifact availability, and hosting-service operation are not license authority.',
          'Those surfaces may establish that material was public, visible, indexed, rendered, obtainable, downloadable, previewed, archived, cached, or technically reproducible. That is an evidentiary proposition about access. It is not a juridical proposition about permission.',
          'The same rule governs explanatory summaries. A summary may accurately say that a reader may inspect repository contents under the License Text. It may not be inflated into a broader right to modify, redistribute, mirror, scrape, crawl, train models on, benchmark with, incorporate, deploy, sublicense, or republish Ludoxel Original Materials unless the controlling License Text grants that act.',
        ],
      },
      {
        id: 'understanding-license-authority-reading-order',
        title: 'License Authority Reading Order',
        content: [
          {
            kind: 'paragraph',
            text: 'The reading order below is the legal sequence for authority only. It is retained as a steps block because each stage asks a separate juridical question and may require the reader to reject a different non-authoritative surface before moving to material scope or permission analysis.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-license-authority-reading-order-source',
                title: 'Identify the asserted source of permission.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The reader must first name the alleged source: the root `LICENSE`, a later written instrument signed by the Licensor, a README statement, a documentation notice, a public website page, a platform affordance, a generated artifact, a repository visibility setting, a deployment surface, or an ordinary assumption drawn from access.',
                  },
                ],
              },
              {
                id: 'understanding-license-authority-reading-order-rank',
                title: 'Assign legal rank to that source.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Only the controlling License Text, or a later competent written instrument that expressly changes the legal position, receives operative rank as a permission source. Explanatory and platform surfaces remain subordinate even when they are official, public, prominent, or technically convenient.',
                  },
                ],
              },
              {
                id: 'understanding-license-authority-reading-order-reject-access',
                title: 'Reject access conditions as substitute grants.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'If the asserted permission depends on public display, source-form availability, documentation rendering, code examples, static-site output, clone or fork functionality, download availability, cache visibility, indexing, screenshots, or hosting-service behavior, the assertion fails at the authority stage. It may show access; it does not show grant.',
                  },
                  {
                    kind: 'note',
                    note: {
                      type: 'warning',
                      content: 'Do not treat a public Ludoxel page, repository view, or platform control as a route around the License Text. The legal question is authorization, not obtainability.',
                    },
                  },
                ],
              },
              {
                id: 'understanding-license-authority-reading-order-stop',
                title: 'Stop before taking over neighboring articles.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'After the controlling source has been identified, this article has reached its endpoint. Questions about what counts as Original Materials, what third-party terms require, what ',
                      {
                        kind: 'link',
                        label: 'repository visibility',
                        href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
                      },
                      ' means, what license text must accompany distribution, or what an output contains belong to the neighboring Legal and Data articles.',
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
          'This article must not be expanded into a general legal index. It does not restate the full definition of Original Materials, third-party materials, provenance-sensitive materials, user-created materials, application output, distribution materials, ordinary application use, AI-use restrictions, contribution refusal, security reporting, governing law, forum, or enforcement posture.',
          [
            'Its conclusion is narrow and severe: permission for Ludoxel Original Materials must come from the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text or from a later competent written instrument, not from ',
            {
              kind: 'link',
              label: 'public visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            ', repository access, documentation publication, platform affordance, generated output, metadata, summaries, notices, cache state, indexing, deployment, or nearby policy text.',
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
      'Explains the legal priority of the root License Text over inconsistent repository, documentation, metadata, generated, hosted, interface, issue, release, summary, or translation statements.',
    sections: [
      {
        id: 'understanding-controlling-text-doctrinal-function',
        title: 'Doctrinal Function of the Controlling Text Rule',
        body: [
          'The controlling-text rule is a rule of juridical priority. It does not identify the Licensor, classify every material, authorize distribution, enlarge ordinary use, resolve third-party clearance, accept contributions, or route security reports. Its function is narrower: when a Ludoxel-related statement has been identified and that statement is alleged to alter the legal position, the rule determines whether the statement can operate against the License Text.',
          'For Original Materials, the operative source is the English License Text in the root `LICENSE`. Subordinate statements may describe, summarize, warn, label, expose, render, index, package, deploy, route, or explain the project. They do not obtain equal legal rank by appearing in the repository, in the Documentation Site, in build output, in metadata, in a generated file, in a hosted preview, in a public issue surface, or in an interface element.',
          'The consequence is not merely interpretive preference. A subordinate statement that conflicts with the License Text has no operative effect to the extent of the conflict unless it is itself a later competent written instrument that expressly changes the legal position. The conflict is not solved by popularity, convenience, visibility, reliance, technical availability, platform design, or ordinary user expectation.',
        ],
      },
      {
        id: 'understanding-controlling-text-objects-of-subordination',
        title: 'Objects of Subordination',
        body: [
          'Subordinate statements include repository prose, README summaries, documentation paragraphs, documentation banners, code-block captions, comment explanations, SPDX notices, package metadata, generated documentation, search data, sitemap data, robots text, release descriptions, changelog entries, issue templates, pull-request templates, security-contact pages, contribution text, build output, deployment metadata, public previews, and platform interface copy.',
          'Subordination does not mean that such statements are irrelevant. They may evidence notice, routing, project organization, public presentation, or factual context. It means that they are legally incapable of overriding the License Text when the question is whether permission has been granted, restricted, withheld, reserved, conditioned, or enlarged for Original Materials.',
          'A subordinate statement can be accurate only within its assigned responsibility. When it speaks outside that responsibility, it must not be used to displace the controlling legal text or to import conclusions from a neighboring article.',
        ],
      },
      {
        id: 'understanding-controlling-text-conflict-threshold',
        title: 'Threshold for Conflict',
        body: [
          'A conflict exists where a subordinate statement and the License Text cannot both be given effect in the same legal respect. The conflict may be express, as where a subordinate statement purports to allow redistribution that the License Text does not grant. It may also be functional, as where the subordinate statement would permit the same practical legal result by calling the act viewing, access, example use, repository use, documentation use, ordinary use, or platform use.',
          'No conflict exists merely because the subordinate statement is shorter, less complete, more accessible, less technical, or directed at ordinary readers. A non-conflicting explanation can point to the License Text, warn about the License Text, or summarize a boundary without becoming the boundary.',
          'The threshold is therefore legal inconsistency, not linguistic difference. A simplified statement may coexist with the License Text only while it remains subordinate and non-expansive. The moment it would create a grant, waiver, exception, amendment, substitution, sublicense, release, public-domain dedication, estoppel theory, or implied license contrary to the License Text, it is non-operative to that extent.',
        ],
      },
      {
        id: 'understanding-controlling-text-conflict-reading-sequence',
        title: 'Conflict Reading Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'The controlling-text inquiry must be conducted in a fixed legal order. The reader must not begin from the most permissive sentence, the most visible page, the most convenient platform surface, or the most favorable summary. The analysis begins with the License Text and permits subordinate text to survive only inside the legal space that the License Text leaves available.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-controlling-text-conflict-reading-sequence-license',
                title: 'Read the License Text as the dispositive instrument.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'For Ludoxel Original Materials, the English License Text in the root `LICENSE` is the juridical source against which any asserted permission, reservation, condition, exclusion, waiver, amendment, or enlargement must be measured. A subordinate statement is not read first merely because it is shorter, more public, easier to quote, or closer to the material being viewed.',
                  },
                ],
              },
              {
                id: 'understanding-controlling-text-conflict-reading-sequence-subordinate',
                title: 'Identify the subordinate statement and its assigned function.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The next step is to identify the exact repository, documentation, metadata, generated, hosted, interface, issue, release, summary, translation, package, or platform statement relied upon, and to ask what function that statement can legitimately perform. It may route, warn, summarize, label, describe, or evidence context; it does not acquire dispositive force merely by being adjacent to the material.',
                  },
                ],
              },
              {
                id: 'understanding-controlling-text-conflict-reading-sequence-effect',
                title: 'Compare legal effect rather than vocabulary.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The comparison must be made at the level of legal consequence. The question is whether the subordinate statement would alter the grant, reserved rights, restrictions, conditions, excluded uses, material classification, license-text inclusion, governing instrument, or source of permission. Different words are tolerable only where they preserve the same legal effect.',
                  },
                ],
              },
              {
                id: 'understanding-controlling-text-conflict-reading-sequence-exclude',
                title: 'Exclude only the inconsistent legal effect.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'If conflict exists, the inconsistent subordinate effect is excluded. The statement may remain as non-operative explanation or routing where possible, but it cannot supply permission, erase a reservation, create a waiver, authorize redistribution, justify deployment, permit AI Use, permit derivative preparation, excuse notice removal, or convert public access into a legal grant.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-controlling-text-priority-and-exclusion',
        title: 'Priority and Exclusion',
        body: [
          'Priority means that the License Text governs the legal result. Exclusion means that the inconsistent subordinate statement is excluded from operative effect to the extent it conflicts. The subordinate statement may remain visible, readable, historically explainable, or factually relevant, but it cannot serve as the missing permission.',
          'This priority applies to both grants and reservations. If the License Text does not grant an act, a subordinate statement cannot supply the grant. If the License Text reserves a right, a subordinate statement cannot waive that reservation. If the License Text imposes a condition, a subordinate statement cannot dispense with the condition. If the License Text excludes a use, a subordinate statement cannot recharacterize the excluded use as permitted.',
          'The result is categorical for restricted acts: modification, redistribution, republication, mirroring, public hosting, static-site copying, deployment, scraping, crawling, extraction, dataset creation, AI Use, benchmark construction, derivative preparation, incorporation, sublicensing, removal of notices, and commercial exploitation require affirmative authority in the License Text or a later competent written instrument. They cannot be generated from subordinate text.',
        ],
      },
      {
        id: 'understanding-controlling-text-no-amendment-by-context',
        title: 'No Amendment by Context',
        body: [
          'The legal force of the License Text is not amended by repository layout, branch naming, file placement, source browsing, website routing, documentation navigation, search indexing, preview deployment, static generation, package structure, interface state, public form availability, issue visibility, or release-page design.',
          'Nor is it amended by the fact that a protected file can be copied, cloned, forked, downloaded, screenshotted, cached, indexed, opened in a browser, imported into an editor, or retrieved from a public URL. Those facts describe technical obtainability. They do not describe legal permission.',
          'A contrary approach would make the controlling license depend on every public surface through which material can be seen. That is precisely the error the controlling-text rule prevents.',
        ],
      },
      {
        id: 'understanding-controlling-text-harmonization-limits',
        title: 'Limits of Harmonization',
        body: [
          'Non-conflicting statements should be harmonized where harmonization preserves the License Text and the subordinate statement inside their respective functions. A documentation notice saying that material is protected, for example, can be harmonized with the License Text because it points to the controlling source and does not enlarge permission.',
          'Harmonization ends where it would rewrite the License Text or treat subordinate prose as a hidden exception. The reader must not soften an exclusion, dilute a reservation, expand a grant, or relocate a defined term merely to save an inconsistent sentence from legal consequences.',
          'The correct method is strict: read the License Text first, read the subordinate statement only within its assigned responsibility, and reject any meaning that would give the subordinate statement operative force beyond the License Text.',
        ],
      },
      {
        id: 'understanding-controlling-text-third-party-non-merger',
        title: 'Third-Party Non-Merger',
        body: [
          'The controlling-text rule for Ludoxel Original Materials does not absorb third-party materials into Ludoxel terms. A third-party license, attribution file, asset license, font license, texture license, platform term, or dependency license retains its own legal character where applicable.',
          'Conversely, the presence of third-party material does not reduce the License Text for Ludoxel Original Materials. The categories do not merge merely because they appear in the same repository, package, documentation page, build output, or application bundle.',
          'When the problem is third-party clearance, the answer belongs to the third-party boundary article. When the problem is conflict between a subordinate Ludoxel statement and the Ludoxel License Text, this article controls the priority question and nothing more.',
        ],
      },
      {
        id: 'understanding-controlling-text-publication-and-platform-surfaces',
        title: 'Publication and Platform Surfaces',
        body: [
          'Public display is the usual source of false conflict. A repository page, website page, preview deployment, production deployment, generated static file, cached excerpt, search result, browser display, package preview, fork button, clone button, download button, archive, issue form, pull-request page, action log, or release page may make material visible or technically obtainable. That surface condition does not supply a license term inconsistent with the License Text.',
          'When a platform surface appears to enable an act that the License Text does not authorize, the legal result is not that the platform surface expands the License. The result is that technical capability, service-level functionality, and interface affordance must be separated from permission granted by the Licensor.',
          'The same reasoning applies to Documentation Site content. Code blocks, configuration examples, command examples, images, videos, navigation data, search data, legal notices, and interface text may be publicly displayed, but their display remains subordinate to the License Text. A public page can inform the reader of a legal boundary; it cannot erase that boundary by being public.',
        ],
      },
      {
        id: 'understanding-controlling-text-legal-consequence',
        title: 'Legal Consequence of Reliance on an Inconsistent Statement',
        body: [
          'Reliance on an inconsistent subordinate statement does not create permission where the License Text withholds it. The user who relies on the subordinate statement bears the risk that the statement is non-operative to the extent of conflict. The statement may explain how a misunderstanding occurred, but it does not become a defense written into the License Text.',
          'The legally material consequence is that the proposed act must still be tested against the License Text. If the License Text does not grant the act, a conflicting subordinate statement does not supply the missing grant. If the License Text reserves a right, a conflicting subordinate statement does not waive the reservation. If the License Text imposes a condition, a conflicting subordinate statement does not dispense with performance of that condition.',
          'This rule is especially strict for acts affecting copyright, patent, trademark, database rights, trade secrets, website republication, redistribution, deployment, AI processing, derivative preparation, sublicensing, and removal of legal markings. A subordinate statement cannot convert a restricted act into an authorized act when the License Text does not do so.',
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
            ', what license text must be included in a distribution, whether user-created output is separate from Original Materials, whether a third-party asset is cleared, whether a specific restricted use is permitted, whether contribution material is accepted, or how security reports must be routed.',
          ],
          'Its conclusion is confined to priority. Where a subordinate repository, documentation, metadata, generated, hosted, interface, issue, release, summary, translation, package, or platform statement conflicts with the License Text, the License Text controls for Ludoxel Original Materials, and the inconsistent subordinate statement has no operative effect as a grant, waiver, exception, amendment, substitution, release, estoppel theory, implied license, sublicense, or enlargement of permission unless it is itself a later competent written instrument expressly changing the legal position.',
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
      'Explains why public repository visibility, platform affordances, browser access, static-site publication, cache state, indexing, and technical obtainability do not grant rights in Ludoxel materials beyond the License Text.',
    sections: [
      {
        id: 'understanding-repository-visibility-juridical-function',
        title: 'Juridical Function of Repository Visibility',
        body: [
          'Repository visibility is an access condition. It is not a license grant, not a waiver, not a public-domain dedication, not an open-source declaration, not a redistribution authorization, not a deployment authorization, not a derivative-work authorization, not an AI-use authorization, and not a permission to remove legal markings.',
          'The legal significance of visibility is therefore negative and limiting. It may explain why a reader can see repository contents, Documentation Site source, generated website output, public legal text, issue templates, metadata, package configuration, or deployment-adjacent files. It does not explain why the reader may reuse them.',
          'A repository can be public while the relevant legal permissions remain narrow. Public visibility makes the License Text discoverable; it does not enlarge the License Text. The reader who treats visibility as permission has confused access with authority.',
        ],
      },
      {
        id: 'understanding-repository-visibility-technical-obtainability',
        title: 'Technical Obtainability Is Not Permission',
        body: [
          'A material may be technically obtainable through clone, fork, download, archive generation, raw-file access, browser rendering, static-site output, Documentation Site display, deployment preview, platform preview, package view, package inspection, source browsing, issue form, pull-request form, action artifact, release page, screenshotting, search indexing, caching, mirroring by an infrastructure layer, or copying from a displayed page. None of those obtainability paths grants permission, creates waiver, amends the License Text, creates sublicense, supplies estoppel or defense, or provides a route around the License Text.',
          'The rule applies equally to the Documentation Site. Documentation content, repository files, browser-rendered pages, static site output, deployment previews, generated routes, videos, images, media blocks, code examples, configuration examples, legal banners, search data, sitemap data, and metadata remain subject to the controlling material classification and the License Text. The fact that a browser can render them does not create a right to republish them.',
          'Technical obtainability can be relevant as evidence of access, notice, or copying. It is not relevant as evidence of permission unless the controlling License Text or a later competent written instrument makes it relevant.',
        ],
      },
      {
        id: 'understanding-repository-visibility-limited-viewing',
        title: 'Limited Viewing and Verification',
        body: [
          'The License Text may allow a narrow form of human review and verification of repository contents. That limited allowance must be read as a bounded permission, not as a general license to use everything that the repository makes visible.',
          'Viewing, reading, inspecting, or verifying does not include modification, redistribution, republication, mirroring, crawling, scraping, dataset creation, model training, benchmark creation, incorporation into another work, sublicensing, deployment, public hosting, removal of notices, or extraction of protected expression for a separate project.',
          'If the proposed act is not the limited viewing or verification contemplated by the License Text, the fact that the repository is public does not cure the absence of permission.',
        ],
      },
      {
        id: 'understanding-repository-visibility-platform-functions',
        title: 'Platform Functions and Interface Affordances',
        body: [
          'A hosting platform may present controls that permit a user to fork, clone, download, copy a raw URL, open a file, view history, search contents, inspect a deployment, submit an issue, open a pull request, or read generated output. These controls are service functions. They are not legal conclusions about the scope of the Ludoxel License.',
          'No platform affordance converts viewing into modification, redistribution, derivative preparation, dataset creation, AI Use, website mirroring, republication, sublicensing, deployment, or public hosting. Nor does a platform affordance create an exception to legal markings, license inclusion requirements, third-party boundaries, contribution refusal, or security-report routing.',
          'If a platform makes an act technically possible while the License Text does not grant that act, the legal result is absence of authorization, not implied enlargement of permission.',
        ],
      },
      {
        id: 'understanding-repository-visibility-public-policy-surfaces',
        title: 'Public Policy Surfaces',
        body: [
          'Public legal files, documentation banners, README notices, issue templates, pull-request templates, security-contact documents, contribution documents, changelog pages, and support articles may be visible in the same repository or Documentation Site. Their visibility does not merge their responsibilities.',
          'A public issue form does not invite unrestricted publication of exploit details. A pull-request page does not prove that contributions are accepted. A changelog page does not prove that an unofficial build is authorized. A legal banner does not become a second license. A documentation page does not become open documentation because it is rendered on the web.',
          'Those public surfaces must be read according to the controlling text and the article that owns their legal topic. Repository visibility is the wrong tool for creating permissions that the License Text withholds.',
        ],
      },
      {
        id: 'understanding-repository-visibility-reading-order',
        title: 'Repository Visibility Reading Order',
        content: [
          {
            kind: 'paragraph',
            text: 'The reading order remains a steps block because visibility disputes usually proceed by smuggling an access route into a permission conclusion. Each step separates the route of access from the legal act alleged to be permitted.',
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
                    text: 'Name the surface precisely: repository page, raw file, clone path, fork path, download archive, browser-rendered documentation page, generated static output, deployment preview, search index, cache, issue form, pull-request surface, release page, package manifest, metadata file, video, image, or public legal notice.',
                  },
                ],
              },
              {
                id: 'understanding-repository-visibility-reading-order-act',
                title: 'Identify the proposed act, not merely the access route.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The legally operative question is what the user proposes to do with the material. Viewing, copying for redistribution, mirroring, deployment, scraping, AI processing, derivative preparation, republication, packaging, sublicensing, and contribution submission are different acts even when they begin from the same public surface.',
                  },
                ],
              },
              {
                id: 'understanding-repository-visibility-reading-order-license',
                title: 'Test that act against the License Text.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The proposed act must be tested against the controlling License Text and, where relevant, the proper neighboring article. It must not be tested against the mere fact that a button, URL, preview, cache, browser, or search result made the material obtainable.',
                  },
                ],
              },
              {
                id: 'understanding-repository-visibility-reading-order-result',
                title: 'State the consequence as non-grant.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'If the License Text does not grant the act, the conclusion is not that public visibility fills the gap. The conclusion is that visibility has no grant effect. The user remains without authorization for the act unless another competent written instrument supplies it.',
                  },
                  {
                    kind: 'note',
                    note: {
                      type: 'warning',
                      content:
                        'Public access may explain how a person obtained material. It does not make the acquisition, reuse, or republication lawful where the License Text withholds permission.',
                    },
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
          'This article addresses visibility and access only. It does not classify all materials, decide the full scope of Original Materials, determine third-party clearance, authorize distribution, decide generated-output permissions, define ordinary application use, accept contributions, route security reports, or determine whether a release is official.',
          [
            'Its conclusion is narrow: a public repository, public Documentation Site, public deployment surface, public cache, public index, or public platform interface does not grant permission beyond the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text, does not amend that text, does not create waiver, sublicense, estoppel, defense, or implied permission, and does not change what counts as ',
            {
              kind: 'link',
              label: 'Original Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
            },
            '.',
          ],
        ],
      },
    ],
    relatedTitles: ['Understanding License Authority', 'Understanding Controlling Text', 'Understanding Original Materials'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Original Materials',
    description:
      'Explains the legal classification of Ludoxel Original Materials, the exclusion of third-party and user-created materials, and the boundary between material classification and permission to use or distribute.',
    sections: [
      {
        id: 'understanding-original-materials-juridical-function',
        title: 'Juridical Function of Original Materials',
        body: [
          'Original Materials is a material-scope classification. It identifies the Ludoxel materials to which the License Text applies as Ludoxel materials created, owned, or controlled by the Licensor. It is not itself a permission grant, not a distribution authorization, not an AI-use authorization, not an open-content declaration, and not a waiver of rights.',
          'The classification matters because the License Text cannot be applied accurately until the material being discussed has been placed in the correct legal category. A source file, shader, website component, documentation paragraph, legal banner, generated static-site output, package configuration, metadata file, icon, branding element, asset, video, image, or distribution-preparation file may require different evidence, but the question remains whether it falls within the protected Ludoxel material perimeter.',
          'This article is therefore about what the material is. It does not decide whether the reader may copy, modify, redistribute, mirror, deploy, scrape, crawl, train on, benchmark with, incorporate, sublicense, or republish it. Those acts require separate permission analysis under the License Text and the neighboring legal articles.',
        ],
      },
      {
        id: 'understanding-original-materials-operative-text-and-owner',
        title: 'Operative Text and Owner',
        body: [
          'The operative definition is supplied by the License Text. The relevant owner for Ludoxel Original Materials is Kento Konishi as the Licensor where the material is created, owned, or controlled by that Licensor for Ludoxel.',
          'Ownership or control is not inferred from public display alone. A file may be visible without being free to use. A page may be rendered without becoming public-domain material. A build artifact may be generated without becoming redistributable. A documentation example may be readable without becoming reusable template material.',
          'The inverse is also true. The fact that a material appears in object form, generated form, bundled form, website-build form, or package form does not remove it from Original Materials when the underlying protected expression is Ludoxel material created, owned, or controlled by the Licensor.',
        ],
      },
      {
        id: 'understanding-original-materials-classification-test',
        title: 'Classification Test',
        body: [
          'The classification inquiry begins with the material itself, not with the access route. The reader must identify the concrete material at issue: source code, documentation text, website source, static output, shader, package configuration, build metadata, icon, branding, media block, image, video, search data, legal notice, application resource, or distribution-preparation artifact.',
          'The reader then asks whether that material is created, owned, or controlled by the Licensor as Ludoxel material. If the answer is yes, the material falls within the Original Materials perimeter to the extent the License Text includes it and to the extent it is not excluded by third-party status, user-created status, application-output status, or provenance-sensitive status.',
          'The reader must not replace this classification test with a visibility test. Public repository presence, browser rendering, static-site generation, deployment preview, cache state, indexing, package inclusion, or source-form availability does not decide whether the material is Original Materials and does not grant permission to use it.',
        ],
      },
      {
        id: 'understanding-original-materials-classification-sequence',
        title: 'Original-Material Classification Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'Original Materials must be classified by legal source, legal relation, and exclusion analysis. The sequence is deliberately narrower than a permission analysis. It identifies whether the material is inside the Ludoxel Original Materials perimeter and then stops before deciding what restricted act, if any, has been authorized.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-original-materials-classification-sequence-object',
                title: 'Identify the concrete material, not the surrounding surface.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The object of classification must be the actual source file, documentation text, website component, generated static-site output, shader, package metadata, legal notice, media block, image, video, icon, branding element, build script, application resource, or distribution-preparation artifact. The repository page, browser view, deployment preview, cache, index, or package surface through which it is reached is not the object being classified.',
                  },
                ],
              },
              {
                id: 'understanding-original-materials-classification-sequence-owner',
                title: 'Test creation, ownership, or control by the Licensor.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The material enters the Original Materials analysis only where it is Ludoxel material created, owned, or controlled by Kento Konishi as Licensor, to the extent the License Text so treats it. Visibility, possession of a copy, technical retrievability, static generation, compilation, bundling, or hosting-service publication does not replace this owner-and-control inquiry.',
                  },
                ],
              },
              {
                id: 'understanding-original-materials-classification-sequence-exclusions',
                title: 'Remove materials governed by a separate category.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Third-Party Materials, User-Created Materials, Application Output, Provenance-Sensitive Materials, and materials governed by separate third-party legal terms must not be absorbed into Original Materials by adjacency, packaging, rendering, repository placement, Documentation Site display, build output, metadata reference, or distribution preparation.',
                  },
                ],
              },
              {
                id: 'understanding-original-materials-classification-sequence-permission',
                title: 'Do not convert classification into permission.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'A finding that material is Original Materials only identifies the legal material perimeter. It does not authorize copying, modification, redistribution, derivative preparation, republication, mirroring, scraping, crawling, extraction, incorporation, AI Use, dataset creation, benchmark construction, deployment, sublicensing, or removal of legal markings. Permission remains a separate License Text question.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-original-materials-included-classes',
        title: 'Included Material Classes',
        body: [
          'Original Materials may include Ludoxel source code, website source code, documentation content, legal notices, interface text, project-specific shaders, project-specific metadata, project-specific configuration, package files, build scripts, generated documentation output, generated static-site output, branding elements, icons, images, videos, media blocks, application resources, and distribution-preparation materials where they satisfy the License Text definition.',
          'The form of the material is not decisive. Source Form and Object Form are both capable of remaining within the Original Materials perimeter. Compilation, bundling, static-site generation, minification, packaging, deployment preparation, or inclusion in an application bundle changes technical form; it does not itself destroy the protected Ludoxel character of the material.',
          'The classification should be stated with precision. It is enough to say that the material is treated as Original Materials to the extent it is Ludoxel material created, owned, or controlled by the Licensor and not excluded. It is not proper to turn that classification into a statement that every adjacent asset, dependency, user output, or third-party component has the same legal status.',
        ],
      },
      {
        id: 'understanding-original-materials-excluded-materials',
        title: 'Excluded Materials',
        body: [
          [
            'Third-Party Materials are outside Original Materials. Their presence in the repository, Ludoxel, the Documentation Site, Distribution Materials, package metadata, user interface displays, website displays, or build output does not make them Ludoxel Original Materials and does not place Original Materials under third-party terms. The separate boundary for third-party material handling belongs to ',
            {
              kind: 'link',
              label: 'third-party material boundaries',
              href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-third-party-material-boundaries',
            },
            '.',
          ],
          [
            'User-Created Materials and Application Output also require separation. User materials do not become Original Materials merely because they are entered, edited, displayed, saved, imported, exported, recorded, or processed through Ludoxel. The output-specific boundary belongs to ',
            {
              kind: 'link',
              label: 'output',
              href: '/docs/data/learning-and-material-data/output-and-material-boundaries/separating-original-materials-from-output',
            },
            ' and to the generated-output legal article when the question concerns output permission rather than material classification.',
          ],
          'Provenance-Sensitive Materials must not be treated as Original Materials, public-domain materials, open-source materials, free-to-use materials, redistributable materials, web-deployable materials, or materials cleared for modification merely because they are present, loaded, displayed, referenced, bundled, rendered, indexed, or technically capable of deployment.',
        ],
      },
      {
        id: 'understanding-original-materials-documentation-site',
        title: 'Documentation Site Materials',
        body: [
          'The Documentation Site falls within Original Materials to the extent it consists of materials created, owned, or controlled by the Licensor. That may include website source code, documentation content, user interface text, styling, media blocks, images, videos, static assets, search data, metadata, configuration files, build configuration, generated static-site output, and official deployment material where those materials satisfy the License Text definition.',
          'Publication of the Documentation Site does not convert the site into open content, public-domain material, free documentation, reusable website template material, or a source of permission beyond the License Text. Code blocks, configuration examples, command examples, images, videos, navigation data, search data, and legal notices remain governed by their material classification and the License Text.',
          [
            'Public display, technical retrievability, browser access, static generation, deployment preview, caching, indexing, screenshotting, repository browsing, and hosting-service rendering are immaterial to any asserted entitlement to reuse Original Materials. Such circumstances do not transmute protected Ludoxel material into public-domain material, open content, redistributable material, template material, training material, extractable data, or material encumbered by an implied license. The visibility-specific analysis belongs to ',
            {
              kind: 'link',
              label: 'repository visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            '.',
          ],
        ],
      },
      {
        id: 'understanding-original-materials-distribution-form',
        title: 'Distribution Form Does Not Change Classification',
        body: [
          'Distribution Materials that contain Original Materials remain subject to the License Text. Packaging, bundling, compilation, copying into a distribution directory, embedding in an application bundle, inclusion in an installer, inclusion in an archive, static-site generation, or deployment preparation does not create a new license category that displaces Original Materials classification.',
          [
            'The consequence addressed here is confined to material scope. Distribution form is not a juridical solvent. Packaging, bundling, compilation, static generation, deployment preparation, or inclusion in a website build does not dissolve Original Materials into freely circulable matter and does not generate entitlement to distribute, deploy, publish, mirror, host, redistribute, sublicense, or otherwise circulate Ludoxel materials. The distribution-form boundary belongs to ',
            {
              kind: 'link',
              label: 'distribution materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-distribution-materials',
            },
            ', while permission to distribute must be resolved under the distribution-permission articles.',
          ],
          'The same protected expression may therefore be read through several technical states: source repository material, generated object material, package material, website build output, or displayed documentation. Those states may matter for evidence and handling, but they do not remove the underlying protected Ludoxel material from the Original Materials analysis.',
        ],
      },
      {
        id: 'understanding-original-materials-permission-boundary',
        title: 'Permission Boundary',
        body: [
          'Classifying a material as Original Materials does not authorize copying, modification, redistribution, derivative preparation, republication, mirroring, scraping, crawling, extraction, incorporation, AI Use, dataset creation, benchmark creation, deployment, sublicensing, sale, rental, lending, or removal of legal markings.',
          'The License Text contains an exhaustive limited grant for human review and verification of Repository Contents, Ordinary Documentation Site Viewing, and Ordinary Application Use, and separately reserves rights and excludes uses outside that grant. This article does not restate every exclusion; it states why classification must be settled before those exclusions are applied.',
          'If the proposed act is outside the limited grant, the answer must come from the License Text or from a later competent written instrument. It must not be inferred from material classification, public availability, technical accessibility, package form, hosting-service behavior, documentation examples, or ordinary user expectation.',
        ],
      },
      {
        id: 'understanding-original-materials-article-boundary',
        title: 'Article Boundary',
        body: [
          'This article classifies Ludoxel materials that fall within the Original Materials perimeter under the License Text. It does not classify every third-party asset, prove provenance for every local file, determine whether a specific output may be shared, authorize distribution, decide ordinary application use, resolve AI-use restrictions, accept contributions, route security reports, or determine official release status.',
          [
            'Its conclusion is narrow: Ludoxel Original Materials are the project materials created, owned, or controlled by the Licensor for purposes of the License Text, including the specified source, object, documentation, website, metadata, package, shader, asset, branding, icon, distribution-preparation, and static-site materials to the extent they are not Third-Party Materials. The legal force of that conclusion remains subject to the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text and cannot be expanded by public ',
            {
              kind: 'link',
              label: 'visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            '.',
          ],
        ],
      },
    ],
    relatedTitles: [
      'Understanding License Authority',
      'Understanding Controlling Text',
      'Understanding Repository Visibility',
      'Understanding Distribution Materials',
      'Understanding Ordinary Application Use',
      'Understanding Generated Output',
      'Understanding AI Use Restrictions',
      'Separating Original Materials from Output',
      'Understanding Third Party Material Boundaries',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Distribution Materials',
    description:
      'Explains the legal classification of Ludoxel Distribution Materials, the continued operation of the License Text over packaged or deployed materials, the non-permissive character of legal-text inclusion, and the boundary between distribution form, official status, third-party clearance, and distribution permission.',
    sections: [
      {
        id: 'understanding-distribution-materials-juridical-function',
        title: 'Juridical Function of Distribution Materials',
        body: [
          'Distribution Materials is a material-scope classification for materials prepared for distribution of Ludoxel, the Documentation Site, or Repository Contents. It identifies a technical and legal state in which repository or website materials have been packaged, bundled, copied, generated, deployed, archived, or otherwise prepared for circulation. It is not itself a grant of permission, not an official-release declaration, not an endorsement statement, not a third-party clearance decision, and not a waiver of the Licensor’s reserved rights.',
          [
            'The classification matters because distribution form is a common source of false authority arguments. A file may appear inside an executable, application bundle, installer, archive, wheel, source distribution, generated distribution directory, package, release artifact, static-site build output, website deployment material, embedded resource set, copied legal-material set, or metadata output without ceasing to be governed by the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text.',
          ],
          'This article therefore answers what Distribution Materials are and what legal consequences follow from that classification. It does not answer how to run a build command, how to inspect a package check, whether a local artifact is fit for release, whether a third-party dependency is cleared, or whether a particular party has permission to distribute.',
        ],
      },
      {
        id: 'understanding-distribution-materials-operative-definition',
        title: 'Operative Definition',
        body: [
          'The operative definition is supplied by the License Text. Distribution Materials include application bundles, executable files, installers, archives, wheels, source distributions, generated distribution directories, packages, release artifacts, static-site build output, website deployment materials, embedded resources, copied legal materials, metadata, and other materials prepared for distribution of Ludoxel, the Documentation Site, or Repository Contents.',
          'The definition is functional rather than cosmetic. A material does not become Distribution Materials merely because it is visible, downloadable, generated, cached, logged, compressed, or placed near packaging metadata. The relevant question is whether the material has been prepared as part of a distribution, deployment, package, release artifact, static-site output, or comparable circulation form for Ludoxel, the Documentation Site, or Repository Contents.',
          'The definition also does not erase the classification of the materials carried inside the distribution form. Distribution Materials may contain Original Materials, Third-Party Materials, Provenance-Sensitive Materials, copied legal materials, generated metadata, package data, website deployment files, or other contents with separate legal consequences.',
        ],
      },
      {
        id: 'understanding-distribution-materials-classification-sequence',
        title: 'Distribution-Material Classification Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'Distribution Materials must be classified by distribution form, carried material, legal text, official status, and permission boundary. The sequence is deliberately narrower than a build guide and stricter than a package inventory. It identifies the legal state of the material and then stops before converting that state into distribution permission.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-distribution-materials-classification-sequence-form',
                title: 'Identify the distribution form.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The first question is whether the object is an application bundle, executable, installer, archive, wheel, source distribution, generated distribution directory, package, release artifact, static-site build output, website deployment material, embedded resource set, copied legal-material set, metadata output, or other material prepared for distribution. A repository page, local working file, build log, cache entry, preview surface, or ordinary browser display is not enough by itself.',
                  },
                ],
              },
              {
                id: 'understanding-distribution-materials-classification-sequence-carried-material',
                title: 'Classify the material carried inside that form.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Packaging does not merge all carried material into one legal category. Ludoxel source code, documentation content, website code, shaders, branding, icons, project-specific metadata, and generated static-site output may remain Original Materials. Third-party assets, external packages, runtime components, toolchain materials, fonts, textures, and provenance-sensitive local assets must remain subject to their own classification.',
                  },
                ],
              },
              {
                id: 'understanding-distribution-materials-classification-sequence-legal-text',
                title: 'Separate legal-text inclusion from permission.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The presence of `LICENSE`, Third-Party License Text, SPDX identifiers, package metadata, website metadata, copyright notices, or other legal materials is evidence that legal materials are present. It is not itself permission to distribute, deploy, republish, redistribute, sublicense, mirror, or host the Distribution Materials.',
                  },
                ],
              },
              {
                id: 'understanding-distribution-materials-classification-sequence-official-status',
                title: 'Separate artifact existence from official status.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'A Desktop Distribution, Documentation Site deployment, package, archive, preview, fork build, mirror, or modified artifact is not an Official Distribution merely because it was technically produced from the Current Repository. Official status exists only where the Licensor publishes the material as an official distribution or official deployment.',
                  },
                ],
              },
              {
                id: 'understanding-distribution-materials-classification-sequence-permission',
                title: 'Stop before distribution permission unless the License Text grants it.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'After the material is classified, any proposed act must still be tested against the License Text or a later competent written instrument. Distribution form does not authorize distribution. Package existence does not authorize republication. Deployment output does not authorize redeployment. Legal-material inclusion does not authorize circulation.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-distribution-materials-original-materials-in-distribution-form',
        title: 'Original Materials in Distribution Form',
        body: [
          [
            'Distribution Materials that contain ',
            {
              kind: 'link',
              label: 'Original Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
            },
            ' remain subject to the License Text. Packaging, bundling, compilation, copying into a distribution directory, embedding in an application bundle, inclusion in an installer, inclusion in an archive, static-site generation, or deployment preparation does not create an additional license or permission.',
          ],
          'The same protected expression can pass through source form, object form, generated form, bundled form, packaged form, and deployed form without losing its protected Ludoxel character. Technical transformation may matter for evidence, reproduction, inspection, and package composition. It does not dissolve the Licensor’s reserved-rights structure.',
          'The contrary argument is legally defective. A person cannot say that Ludoxel material became freely distributable because it was compiled, minified, copied into a bundle, emitted into static-site output, placed in an archive, or made reachable through a deployment surface. Those facts describe form, not authorization.',
        ],
      },
      {
        id: 'understanding-distribution-materials-legal-text-and-metadata',
        title: 'Legal Text and Metadata Do Not Grant Permission',
        body: [
          [
            'Distribution Materials may contain the License Text, Third-Party License Text, SPDX identifiers, package metadata, website metadata, copyright notices, attribution records, and other legal or descriptive materials. Their inclusion may be required for a lawful or authorized distribution context, and the practical packaging treatment belongs to ',
            {
              kind: 'link',
              label: 'Including License Text',
              href: '/docs/distribution/desktop-artifacts/packaged-components/including-license-text',
            },
            ' and ',
            {
              kind: 'link',
              label: 'third-party license text',
              href: '/docs/distribution/desktop-artifacts/packaged-components/including-third-party-license-text',
            },
            '.',
          ],
          'That inclusion is not a permission source. A copy of `LICENSE` inside a package does not authorize that package. A third-party notice inside a package does not relicense Ludoxel Original Materials. A package manifest, SPDX header, website metadata field, generated file marker, or artifact name does not create distribution permission, deployment permission, republication permission, or redistribution permission.',
          'Legal materials must therefore be read as legal evidence and required retained text, not as a self-executing grant. Where permission is disputed, the reader returns to the License Text and to any later competent written instrument. The package surface does not supply the missing authority.',
        ],
      },
      {
        id: 'understanding-distribution-materials-official-distribution-status',
        title: 'Official Distribution Status',
        body: [
          'Only the Licensor may publish an Official Distribution of Ludoxel or an official deployment of the Documentation Site. That rule is not displaced by successful local packaging, possession of a build artifact, repository visibility, a fork, a mirror, a downloaded archive, a generated site directory, a package view, an action artifact, a preview deployment, or a third-party hosting-service interface.',
          [
            'A Desktop Distribution, Documentation Site deployment, or other Distribution Materials published by any party other than the Licensor is not an Official Distribution and is not endorsed by the Licensor, even when the material is derived from the Current Repository. The public-access analysis remains governed by ',
            {
              kind: 'link',
              label: 'repository visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            ', not by the fact that the artifact can be obtained.',
          ],
          'The official-status rule is a legal boundary, not a branding preference. A third-party artifact must not be described as official merely because it resembles the official application, includes legal text, uses Ludoxel names, contains repository files, or was produced by a repository build path.',
        ],
      },
      {
        id: 'understanding-distribution-materials-third-party-and-provenance-boundary',
        title: 'Third-Party and Provenance Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'Distribution Materials can carry materials that are not Ludoxel Original Materials. Third-Party Materials remain subject to their respective license terms, copyright statements, attribution requirements, warranty disclaimers, source-offer obligations, redistribution conditions, reserved names, trademark restrictions, and other applicable terms. Their presence in Distribution Materials does not place Ludoxel Original Materials under third-party terms and does not grant additional permission to use Ludoxel Original Materials.',
          },
          {
            kind: 'paragraph',
            text: [
              'Provenance-Sensitive Materials must be treated with separate legal caution. Technical inclusion, loading, display, bundling, static generation, packaging, deployment preparation, or apparent compatibility does not establish authorship, rights ownership, source, license status, redistribution permission, web-deployment permission, modification permission, trademark status, attribution requirements, or distribution eligibility. The broader material split belongs to ',
              {
                kind: 'link',
                label: 'third-party material boundaries',
                href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-third-party-material-boundaries',
              },
              '.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Even a non-Licensor party that has received the Licensor’s written permission to distribute or deploy particular Distribution Materials remains responsible for proving that the proposed act stays within the granted scope, that all required legal materials are included or retained, that Third-Party Materials may lawfully be redistributed or deployed under their applicable Third-Party License Text, and that no Provenance-Sensitive Materials are distributed or deployed without confirmed provenance and confirmed permission.',
            },
          },
        ],
      },
      {
        id: 'understanding-distribution-materials-build-and-deployment-evidence',
        title: 'Build and Deployment Evidence',
        body: [
          'A build command, package check, generated directory, artifact name, website deployment, preview deployment, cache, release-adjacent file, or static-site output may provide evidence that a distribution form exists. It does not decide legal authority. Evidence of production is not evidence of permission.',
          [
            'When the reader needs the mechanical build path, package contents, local artifact inspection, or release-adjacent check result, the subject has moved from this legal material-scope article to the Distribution articles, including ',
            {
              kind: 'link',
              label: 'package checks',
              href: '/docs/distribution/build-and-release-checks/release-checks-and-claims/running-package-checks-with-permission',
            },
            ' and ',
            {
              kind: 'link',
              label: 'unofficial release claims',
              href: '/docs/distribution/build-and-release-checks/release-checks-and-claims/avoiding-unofficial-release-claims',
            },
            '.',
          ],
          'The legal reading remains narrower: an artifact can exist, contain the right files, retain legal text, and still lack distribution permission. Conversely, a missing legal material may be a packaging defect, but correcting that defect does not itself create permission to circulate the package.',
        ],
      },
      {
        id: 'understanding-distribution-materials-permission-boundary',
        title: 'Permission Boundary',
        body: [
          [
            'Classifying material as Distribution Materials does not authorize distribution, deployment, republication, redistribution, mirroring, hosting, transmission, sublicensing, sale, rental, lending, incorporation into another work, preparation of derivative works, AI Use, dataset creation, benchmark construction, extraction, or removal of legal markings. The separate restricted-use analysis belongs to ',
            {
              kind: 'link',
              label: 'redistribution',
              href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-redistribution-restrictions',
            },
            ', derivative-work, and AI-use articles when those acts are proposed.',
          ],
          'The limited grant in the License Text covers only the expressly stated permissions. It does not include permission to distribute Distribution Materials. It does not include permission to deploy the Documentation Site. It does not include permission to republish a package or release artifact. It does not include permission to use distribution form as a substitute for written authorization.',
          'If the proposed act is outside the limited grant, the answer must come from the License Text or from a later competent written instrument. It must not be inferred from package form, official-looking structure, legal-text inclusion, build success, repository visibility, static-site deployment, preview availability, metadata, or ordinary user expectation.',
        ],
      },
      {
        id: 'understanding-distribution-materials-article-boundary',
        title: 'Article Boundary',
        body: [
          'This article classifies Distribution Materials and states the legal consequences of that classification under the License Text. It does not provide build instructions, certify artifact completeness, approve release status, clear third-party materials, clear provenance-sensitive assets, decide ordinary application output, authorize redistribution, authorize deployment, accept contributions, route security reports, or determine whether a specific third-party package may be circulated.',
          [
            'Its conclusion is narrow: Distribution Materials are materials prepared for distribution of Ludoxel, the Documentation Site, or Repository Contents, but distribution form does not create permission, legal-text inclusion does not create permission, third-party inclusion does not relicense Original Materials, and official distribution status exists only where the Licensor publishes the material as official. The legal force of that conclusion remains subject to the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text and cannot be enlarged by public ',
            {
              kind: 'link',
              label: 'visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            '.',
          ],
        ],
      },
    ],
    relatedTitles: [
      'Understanding License Authority',
      'Understanding Controlling Text',
      'Understanding Repository Visibility',
      'Understanding Original Materials',
      'Including License Text',
      'Including Third Party License Text',
      'Running Package Checks with Permission',
      'Avoiding Unofficial Release Claims',
      'Understanding Redistribution Restrictions',
      'Understanding Derivative Work Restrictions',
      'Understanding AI Use Restrictions',
      'Understanding Generated Output',
      'Understanding Third Party Material Boundaries',
    ],
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
