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
      'Defines the juridical source of permission for Ludoxel Original Materials, the non-authoritative character of public surfaces, and the point at which authority analysis must stop before material classification or distribution analysis begins.',
    sections: [
      {
        id: 'understanding-license-authority-juridical-function',
        title: 'Juridical Function of License Authority',
        body: [
          'License authority is the legal capacity of a text or later written instrument to grant, withhold, limit, condition, reserve, or terminate permission in relation to Ludoxel Original Materials. It is not the same thing as public availability, technical retrievability, documentation display, repository visibility, platform affordance, package presence, static-site generation, or operational convenience.',
          'Authority analysis begins with the source asserted to grant the proposed act. A repository page, browser-rendered documentation page, clone button, fork button, download archive, preview deployment, generated website output, issue form, release page, package manifest, metadata field, build log, search index, and public cache are Access Paths under `LICENSE`; the License Text supplies the operative permission analysis.',
          'For Ludoxel Original Materials, license authority is not diffused across every public surface on which Ludoxel material appears. It is centralized in the controlling License Text, subject only to a later written instrument that is competent to alter that legal position. Everything else is subordinate evidence, explanation, notice, routing, or platform behavior unless the controlling source itself gives it operative legal force.',
        ],
      },
      {
        id: 'understanding-license-authority-controlling-source',
        title: 'Controlling Source of Permission',
        body: [
          'The root `LICENSE` is the controlling License Text for Ludoxel Original Materials. Its legal text contains the permission grant, reservation of rights, exclusions from permission, definitions, governing-law terms, and legal limits.',
          'Section 1 defines the Licensor, Signed Written Permission, Original Materials, Third-Party Materials, Distribution Materials, Ordinary Application Use, AI Use, Public Issue, Private Reporting Channel, and Security Report. Sections 3 through 5 then connect those definitions to the limited grant, reservations, and excluded uses. The operative legal relation follows that text: an Access Path can make a repository object reachable, while a License Text provision or later signed instrument supplies authority for an identified act and material.',
          '`README.md`, documentation notices, code-block captions, SPDX headers, package metadata, release notes, issue templates, pull-request templates, website metadata, generated documentation text, build output, public summaries, translation fragments, and platform interface text can assist the reader in finding or understanding the License Text. They do not become independent grants, waivers, amendments, exceptions, sublicenses, estoppel instruments, or public-domain dedications merely because they are visible, helpful, or adjacent to protected material.',
          'A public page can point to the controlling source, but it cannot stand in for that source. A protective notice can warn the reader that material remains protected, yet it creates no additional permission class. A platform button can make copying technically possible without converting that technical capability into legal authorization.',
        ],
      },
      {
        id: 'understanding-license-authority-non-authority-surfaces',
        title: 'Surfaces That Do Not Confer Authority',
        body: [
          'License authority for Ludoxel Original Materials sits in the controlling License Text. Repository visibility, Documentation-Site publication, browser rendering, static-site output, deployment preview, source browsing, search indexing, cached display, copied-excerpt display, package inspection, archived download, generated-artifact availability, and hosting-service operation are access conditions: each can make material reachable, and none of them carries the capacity to grant, withhold, or enlarge permission.',
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
                      'After the controlling source has been identified, Original Materials, third-party terms, and ',
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
        title: 'Permission Source and Access Conditions',
        body: [
          [
            'The root `LICENSE` defines the source of permission for Original Materials. Material classification, third-party terms, provenance review, user-created data, Application Output, Distribution Materials, ',
            {
              kind: 'link',
              label: 'ordinary application use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            ', AI-use restrictions, contribution refusal, security reporting, governing law, forum, or enforcement posture.',
          ],
          [
            'Permission for Ludoxel Original Materials comes from the ',
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
    relatedTitles: ['Understanding Controlling Text', 'Including License Text', 'Understanding Repository Visibility', 'Understanding Ordinary Application Use'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Authority Text',
    title: 'Understanding Controlling Text',
    description:
      'Defines the legal priority of the root License Text over inconsistent repository, documentation, metadata, generated, hosted, interface, issue, release, summary, or translation statements.',
    sections: [
      {
        id: 'understanding-controlling-text-doctrinal-function',
        title: 'Doctrinal Function of the Controlling Text Rule',
        body: [
          [
            'The controlling-text rule is a rule of juridical priority. It does not identify the Licensor, classify every material, authorize distribution, enlarge ',
            {
              kind: 'link',
              label: 'ordinary use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            ', resolve third-party clearance, accept contributions, or route security reports. Its function is narrower: when a Ludoxel-related statement has been identified and that statement is alleged to alter the legal position, the rule determines whether the statement can operate against the License Text.',
          ],
          'For Original Materials, the operative source is the English License Text in the root `LICENSE`. Subordinate statements may describe, summarize, warn, label, expose, render, index, package, deploy, route, or explain the project. They do not obtain equal legal rank by appearing in the repository, in the Documentation Site, in build output, in metadata, in a generated file, in a hosted preview, in a public issue surface, or in an interface element.',
          'The consequence reaches past interpretive preference into operative effect. A subordinate statement that conflicts with the License Text has no operative effect to the extent of the conflict unless it is itself a later competent written instrument that expressly changes the legal position. The conflict is not solved by popularity, convenience, visibility, reliance, technical availability, platform design, or ordinary user expectation.',
        ],
      },
      {
        id: 'understanding-controlling-text-objects-of-subordination',
        title: 'Objects of Subordination',
        body: [
          'Subordinate statements include repository prose, README summaries, documentation paragraphs, documentation banners, code-block captions, comment explanations, SPDX notices, package metadata, generated documentation, search data, sitemap data, robots text, release descriptions, changelog entries, issue templates, pull-request templates, security-contact pages, contribution text, build output, deployment metadata, public previews, and platform interface copy.',
          'Subordinate statements can evidence notice, routing, project organization, public presentation, and factual context. Their legal force ends at the License Text when the question concerns permission for Original Materials.',
          'A subordinate statement can be accurate only within its assigned responsibility. When it speaks outside that responsibility, it must not be used to displace the controlling legal text or to import conclusions from a neighboring article.',
        ],
      },
      {
        id: 'understanding-controlling-text-conflict-threshold',
        title: 'Threshold for Conflict',
        body: [
          [
            'A conflict exists where a subordinate statement and the License Text cannot both be given effect in the same legal respect. The conflict may be express, as where a subordinate statement purports to allow redistribution that the License Text does not grant. It may also be functional, as where the subordinate statement would permit the same practical legal result by calling the act viewing, access, example use, repository use, documentation use, ',
            {
              kind: 'link',
              label: 'ordinary use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            ', or platform use.',
          ],
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
                title: 'Read the legal effect of the controlling text.',
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
          'The License Text priority clause governs both grants and reservations. A subordinate statement has no grant-making or waiver operation against an act, reservation, condition, or exclusion controlled by the License Text.',
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
          'Non-conflicting statements may be harmonized only where harmonization preserves the License Text and the subordinate statement inside their respective functions. A documentation notice saying that material is protected, for example, can be harmonized with the License Text because it points to the controlling source and does not enlarge permission.',
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
          'Third-party clearance follows the applicable third-party terms. A conflict between a subordinate Ludoxel statement and the Ludoxel License Text is resolved by the controlling-text provision in `LICENSE`.',
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
          'The License Text reservation governs acts affecting copyright, patent, trademark, database rights, trade secrets, website republication, redistribution, deployment, AI processing, derivative preparation, sublicensing, and removal of legal markings. A subordinate statement carries no authority to convert a reserved act into an authorized one.',
        ],
      },
      {
        id: 'understanding-controlling-text-boundary',
        title: 'Controlling Text and Subordinate Statements',
        body: [
          [
            'The License Text identifies the Licensor and controls any conflict with a ',
            {
              kind: 'link',
              label: 'repository is public',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            ', what license text must be included in a distribution, whether user-created output is separate from Original Materials, whether a third-party asset is cleared, whether a specific restricted use is permitted, whether contribution material is accepted, or how security reports must be routed.',
          ],
          'Where a repository, documentation, metadata, generated, hosted, interface, issue, release, summary, translation, package, or platform statement conflicts with the License Text, the License Text controls for Ludoxel Original Materials. A later competent written instrument must expressly change the legal position before it can operate as a grant, waiver, exception, amendment, substitution, release, estoppel theory, implied license, sublicense, or enlargement of permission.',
        ],
      },
    ],
    relatedTitles: ['Understanding License Authority', 'Understanding Repository Visibility', 'Including License Text', 'Understanding Ordinary Application Use'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Repository Visibility',
    description:
      'Defines why public repository visibility, platform affordances, browser access, static-site publication, cache state, indexing, and technical obtainability do not grant rights in Ludoxel materials beyond the License Text.',
    sections: [
      {
        id: 'understanding-repository-visibility-juridical-function',
        title: 'Juridical Function of Repository Visibility',
        body: [
          'Repository visibility is an access condition. The License Text alone holds the capacity to grant permission, waive a right, dedicate material to the public domain, declare it open source, or authorize redistribution, deployment, derivative work, AI Use, or removal of legal markings; visibility supplies none of those and only makes the controlling text reachable.',
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
          'Each surface keeps its own assigned function. A public issue form accepts limited reports. A pull-request page exposes a submission channel, a changelog records project history, a legal banner routes to the License Text, and a documentation page rendered on the web remains governed documentation. None of those surfaces changes the authority held by the License Text.',
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
                title: 'Identify the proposed act and its access route.',
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
        title: 'Access Conditions and License Text',
        body: [
          [
            'Repository and Documentation Site visibility make a ',
            {
              kind: 'link',
              label: 'ordinary application use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            ', accept contributions, route security reports, or determine whether a release is official.',
          ],
          [
            'A public repository, Documentation Site, deployment surface, cache, index, or platform interface remains subject to the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text. The License Text fixes amendments, waiver, sublicense, estoppel, defense, implied permission, and the material classification of ',
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
    relatedTitles: ['Understanding License Authority', 'Understanding Controlling Text', 'Understanding Original Materials', 'Understanding Ordinary Application Use'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Original Materials',
    description:
      'Defines the legal classification of Ludoxel Original Materials, the exclusion of third-party and user-created materials, and the boundary between material classification and permission to use or distribute.',
    sections: [
      {
        id: 'understanding-original-materials-juridical-function',
        title: 'Juridical Function of Original Materials',
        body: [
          'Original Materials is a material-scope classification. It identifies the Ludoxel materials to which the License Text applies as Ludoxel materials created, owned, or controlled by the Licensor. As a classification it carries no permission of its own: a grant, a distribution authorization, an AI-use authorization, an open-content declaration, or a waiver of rights would each have to come from the License Text, not from placing material inside this perimeter.',
          'The classification matters because the License Text cannot be applied accurately until the material being discussed has been placed in the correct legal category. A source file, shader, website component, documentation paragraph, legal banner, generated static-site output, package configuration, metadata file, icon, branding element, asset, video, image, or distribution-preparation file may require different evidence, but the question remains whether it falls within the protected Ludoxel material perimeter.',
          'The Original Materials definition establishes material classification. Copying, modification, redistribution, mirroring, deployment, scraping, crawling, AI Use, benchmarking, incorporation, sublicensing, and republication require the applicable permission analysis under the License Text.',
        ],
      },
      {
        id: 'understanding-original-materials-operative-text-and-owner',
        title: 'Operative Text and Owner',
        body: [
          'The operative definition is supplied by the License Text. The relevant owner for Ludoxel Original Materials is Kento Konishi as the Licensor where the material is created, owned, or controlled by that Licensor for Ludoxel.',
          'Ownership or control is not inferred from public display alone. A file can be visible yet remain unfree to use; a rendered page does not pass into the public domain; a generated build artifact does not turn redistributable; and a readable documentation example does not become reusable template material.',
          'The inverse is also true. The fact that a material appears in object form, generated form, bundled form, website-build form, or package form does not remove it from Original Materials when the underlying protected expression is Ludoxel material created, owned, or controlled by the Licensor.',
        ],
      },
      {
        id: 'understanding-original-materials-classification-test',
        title: 'Classification Test',
        body: [
          'The classification inquiry begins with the material itself, not with the access route. The reader must identify the concrete material at issue: source code, documentation text, website source, static output, shader, package configuration, build metadata, icon, branding, media block, image, video, search data, legal notice, application resource, or distribution-preparation artifact.',
          'The reader then asks whether that material is created, owned, or controlled by the Licensor as Ludoxel material. If the answer is yes, the material falls within the Original Materials perimeter to the extent the License Text includes it and to the extent it is not excluded by third-party status, user-created status, application-output status, or provenance-sensitive status.',
          'The `LICENSE` classifies Original Materials by creation, ownership, or control by the Licensor. Public repository presence, browser rendering, static-site generation, deployment preview, cache state, indexing, package inclusion, and source-form availability are Access Path facts; permission follows the License Text.',
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
          'The classification must be stated with precision. It is enough to say that the material is treated as Original Materials to the extent it is Ludoxel material created, owned, or controlled by the Licensor and not excluded. It is not proper to turn that classification into a statement that every adjacent asset, dependency, user output, or third-party component has the same legal status.',
        ],
      },
      {
        id: 'understanding-original-materials-excluded-materials',
        title: 'Excluded Materials',
        body: [
          [
            'Third-Party Materials remain outside Original Materials when present in the repository, Ludoxel, the Documentation Site, Distribution Materials, package metadata, interface displays, website displays, or build output. Their own license terms govern them, while the License Text continues to govern Original Materials. The separate boundary for third-party material handling belongs to ',
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
            ' and to the generated-output legal article when the question concerns output permission.',
          ],
          'Provenance-Sensitive Materials retain their own legal classification when present, loaded, displayed, referenced, bundled, rendered, indexed, or technically capable of deployment. Clearance for origin, license, reuse, redistribution, web deployment, and modification requires the governing legal source for the material.',
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
            'Distribution form classifies an artifact prepared for circulation. Packaging, bundling, compilation, static generation, deployment preparation, and website-build inclusion retain the License Text’s treatment of Original Materials; distribution, deployment, publication, mirroring, hosting, sublicensing, and circulation require affirmative authority. The distribution-form boundary belongs to ',
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
          [
            'The License Text contains an exhaustive limited grant for human review and verification of Repository Contents, Ordinary Documentation Site Viewing, and ',
            {
              kind: 'link',
              label: 'Ordinary Application Use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            ', and separately reserves rights and excludes uses outside that grant. Material classification determines which protected components enter the grant and reservation analysis.',
          ],
          'If the proposed act is outside the limited grant, the answer must come from the License Text or from a later competent written instrument. It must not be inferred from material classification, public availability, technical accessibility, package form, hosting-service behavior, documentation examples, or ordinary user expectation.',
        ],
      },
      {
        id: 'understanding-original-materials-article-boundary',
        title: 'Original Materials and Separate Material Terms',
        body: [
          [
            'The `LICENSE` defines Original Materials as Ludoxel materials created, owned, or controlled by the Licensor. Third-party assets, local-file provenance, output sharing, distribution, and ',
            {
              kind: 'link',
              label: 'ordinary application use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            ', resolve AI-use restrictions, accept contributions, route security reports, or determine official release status.',
          ],
          [
            'Original Materials include the source, object, documentation, website, metadata, package, shader, asset, branding, icon, distribution-preparation, and static-site materials created, owned, or controlled by the Licensor, subject to the License Text and the separate definition of Third-Party Materials. The ',
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
      'Defines the legal classification of Ludoxel Distribution Materials, the continued operation of the License Text over packaged or deployed materials, the non-permissive character of legal-text inclusion, and the boundary between distribution form, official status, third-party clearance, and distribution permission.',
    sections: [
      {
        id: 'understanding-distribution-materials-juridical-function',
        title: 'Juridical Function of Distribution Materials',
        body: [
          'Distribution Materials is a material-scope classification for materials prepared for distribution of Ludoxel, the Documentation Site, or Repository Contents. It identifies a technical and legal state in which repository or website materials have been packaged, bundled, copied, generated, deployed, archived, or otherwise prepared for circulation. The classification confers nothing on its own: distribution permission, official-release status, endorsement, third-party clearance, and any waiver of the Licensor’s reserved rights all remain with the License Text and a later competent written instrument.',
          [
            'The classification matters because distribution form is a common source of false authority arguments. A file may appear inside an executable, application bundle, installer, archive, wheel, source distribution, generated distribution directory, package, release artifact, static-site build output, website deployment material, embedded resource set, copied legal-material set, or metadata output without ceasing to be governed by the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text.',
          ],
          'The Distribution Materials definition classifies artifacts prepared for circulation. `tools/build_desktop_app` and `tools/check_project` provide build and inspection paths; release fitness, third-party clearance, and distribution permission remain subject to their controlling technical and legal evidence.',
        ],
      },
      {
        id: 'understanding-distribution-materials-operative-definition',
        title: 'Operative Definition',
        body: [
          'The operative definition is supplied by the License Text. Distribution Materials include application bundles, executable files, installers, archives, wheels, source distributions, generated distribution directories, packages, release artifacts, static-site build output, website deployment materials, embedded resources, copied legal materials, metadata, and other materials prepared for distribution of Ludoxel, the Documentation Site, or Repository Contents.',
          'The definition turns on function. Distribution Materials comprise material prepared as part of a distribution, deployment, package, release artifact, static-site output, or comparable circulation form for Ludoxel, the Documentation Site, or Repository Contents. Visibility, downloadability, generation, caching, logging, compression, and proximity to packaging metadata leave that classification unchanged.',
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
                    text: 'After the material is classified, any proposed act must still be tested against the License Text or a later competent written instrument. The act draws no authority from the artifact’s state: its distribution form, the existence of a package, deployment output, and the inclusion of legal material are all conditions of production, while distribution, republication, redeployment, and circulation each require an affirmative grant in the License Text.',
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
          'That inclusion is not a permission source. A copy of `LICENSE` inside a package leaves that package unauthorized; a third-party notice inside it relicenses no Ludoxel Original Materials; and a package manifest, SPDX header, website metadata field, generated-file marker, or artifact name creates no distribution, deployment, republication, or redistribution permission.',
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
            text: 'Distribution Materials can carry materials outside Ludoxel Original Materials. Third-Party Materials remain subject to their respective license terms, copyright statements, attribution requirements, warranty disclaimers, source-offer obligations, redistribution conditions, reserved names, trademark restrictions, and other applicable terms. The License Text continues to govern Ludoxel Original Materials and fixes permission for their Use.',
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
          'The limited grant in the License Text covers only the expressly stated permissions. Distributing Distribution Materials, deploying the Documentation Site, republishing a package or release artifact, and treating distribution form as a substitute for written authorization all fall outside it, each demanding an affirmative grant that the limited permission does not contain.',
          'If the proposed act is outside the limited grant, the answer must come from the License Text or from a later competent written instrument. It must not be inferred from package form, official-looking structure, legal-text inclusion, build success, repository visibility, static-site deployment, preview availability, metadata, or ordinary user expectation.',
        ],
      },
      {
        id: 'understanding-distribution-materials-article-boundary',
        title: 'Distribution Classification and Release Authority',
        body: [
          'The `LICENSE` defines Distribution Materials as packages, bundles, executables, static-site output, copied legal material, and related artifacts prepared for distribution of Ludoxel, the Documentation Site, or Repository Contents. Build services create those technical artifacts; release status, redistribution, deployment, third-party clearance, provenance review, contribution handling, and security reporting remain governed by their controlling legal and policy text.',
          [
            'Distribution Materials are materials prepared for circulation of Ludoxel, the Documentation Site, or Repository Contents. The License Text controls permission; retained legal text preserves notice; third-party terms continue to govern third-party components; and Official Distribution status arises from publication by the Licensor. The ',
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
      'Understanding Ordinary Application Use',
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
      'Defines the limited permission to use Ludoxel as a desktop application, separates ordinary interactive operation from restricted uses of Ludoxel Original Materials, and states the boundary between local use, user-created materials, application output, distribution, and AI Use.',
    sections: [
      {
        id: 'understanding-ordinary-application-use-juridical-function',
        title: 'Juridical Function of Ordinary Application Use',
        body: [
          [
            'Ordinary Application Use is the defined endpoint of the limited permission to use Ludoxel as a desktop application. It is a permitted mode of application operation under the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text; it is not a general license to reuse the repository, the Documentation Site, package contents, source files, assets, branding, shaders, metadata, or other ',
            {
              kind: 'link',
              label: 'Original Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
            },
            '.',
          ],
          'The legal function of the term is restrictive. It marks the ordinary local operation of Ludoxel that the License Text permits, while excluding uses that transform application operation into reuse of protected project materials, circulation of project artifacts, extraction of resources, derivative preparation, AI processing, website mirroring, or public deployment.',
          [
            'The License Text tests whether a proposed act remains within ordinary local application use or enters ',
            {
              kind: 'link',
              label: 'generated output',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-generated-output',
            },
            ', redistribution, derivative preparation, AI Use, third-party clearance, distribution status, or another legal question controlled by a different article.',
          ],
        ],
      },
      {
        id: 'understanding-ordinary-application-use-operative-text',
        title: 'Operative Text and Exhaustive Grant',
        body: [
          [
            'The License Text grants only limited, non-exclusive, non-transferable, non-sublicensable, revocable permission to use Ludoxel solely for Ordinary Application Use, subject to complete compliance with the License Text. That permission must be read under the ',
            {
              kind: 'link',
              label: 'license-authority',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-license-authority',
            },
            ' structure and cannot be enlarged by explanatory documentation, interface wording, package presence, repository access, or user expectation.',
          ],
          'The grant is exhaustive. Ordinary Application Use is not an open-ended example of permitted conduct; it is the maximum permitted use category for running Ludoxel unless a later competent written instrument signed by the Licensor grants a further permission.',
          [
            'Because the grant is exhaustive, conduct outside the definition remains ungranted. That consequence is not altered by public ',
            {
              kind: 'link',
              label: 'visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            ', technical accessibility, platform functionality, application availability, package form, local convenience, educational purpose, noncommercial purpose, or the fact that a user can cause the application to display or save something.',
          ],
        ],
      },
      {
        id: 'understanding-ordinary-application-use-definition',
        title: 'Definition of Ordinary Application Use',
        body: [
          'Ordinary Application Use means using Ludoxel as a desktop application for its ordinary interactive functions. The License Text identifies launching Ludoxel, using its user interface, changing settings, saving and loading user-specific data, taking ordinary screenshots, recording ordinary screen footage, and performing directly related local actions.',
          'The word ordinary is legally limiting. It confines the permission to application-facing, local, interactive operation and directly related local actions. It does not convert every technically possible action involving Ludoxel into a permitted action.',
          'The definition must not be read backward from a desired result. If the proposed act requires copying protected project material, extracting resources, publishing a package, deploying website output, preparing a derivative work, training a model, creating a dataset, or circulating Ludoxel materials, the act is not made ordinary merely because Ludoxel was first launched or displayed.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-reading-sequence',
        title: 'Ordinary Application Use Reading Sequence',
        content: [
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-ordinary-application-use-reading-sequence-act',
                title: 'Identify the proposed act.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The first question is not whether Ludoxel is publicly available or technically usable. The first question is the exact act: launching, interacting, configuring, saving, loading, screenshotting, recording, extracting, copying, publishing, distributing, deploying, training, or incorporating.',
                  },
                ],
              },
              {
                id: 'understanding-ordinary-application-use-reading-sequence-application-function',
                title: 'Test whether the act is ordinary desktop operation.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The scope covers use of Ludoxel as a desktop application for ordinary interactive functions and directly related local action. The inquiry follows the operative legal function of the act.',
                  },
                ],
              },
              {
                id: 'understanding-ordinary-application-use-reading-sequence-materials',
                title: 'Separate application operation from material use.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'Running Ludoxel may involve Original Materials, Third-Party Materials, user-created data, and Application Output. Ordinary Application Use does not collapse those categories. Material classification remains governed by ',
                      {
                        kind: 'link',
                        label: 'Original Materials',
                        href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
                      },
                      ', third-party terms, user-created-material rules, and output-specific boundaries.',
                    ],
                  },
                ],
              },
              {
                id: 'understanding-ordinary-application-use-reading-sequence-output',
                title: 'Treat output as output, not as source permission.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'Screenshots, recordings, save files, logs, settings, and other results of ordinary operation may raise an ',
                      {
                        kind: 'link',
                        label: 'output',
                        href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-generated-output',
                      },
                      ' question. They do not grant permission to reuse the underlying source files, website materials, assets, interface text, branding, shaders, or package contents.',
                    ],
                  },
                ],
              },
              {
                id: 'understanding-ordinary-application-use-reading-sequence-exclusion',
                title: 'Exclude restricted uses without softening them.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'If the proposed act is redistribution, derivative preparation, resource extraction, Documentation Site scraping, website mirroring, deployment, incorporation into another work, legal-marking removal, or ',
                      {
                        kind: 'link',
                        label: 'AI Use',
                        href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-ai-use-restrictions',
                      },
                      ', the act has left Ordinary Application Use. The restricted-use provisions in `LICENSE` control the next analysis.',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-ordinary-application-use-permitted-local-operation',
        title: 'Permitted Local Operation',
        body: [
          'Launching Ludoxel, using the interface, changing settings, saving and loading user-specific data, taking ordinary screenshots, recording ordinary screen footage, and performing directly related local actions are the core acts identified by the License Text as ordinary application use.',
          'The ordinary-application-use grant is local and operational. It permits the Licensee to run and interact with the desktop application within the category stated in the License Text. Licensor ownership, sublicensing authority, reuse rights, and separate exploitation of repository or website materials remain governed by the surrounding reservations.',
          'A permitted local action supplies authority for that local act. Later publication, sharing, redistribution, commercial use, competition use, dataset use, benchmark use, and AI Use require their own authority under the License Text and applicable third-party rights.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-restricted-acts',
        title: 'Restricted Acts Are Not Ordinary Use',
        content: [
          {
            kind: 'paragraph',
            text: [
              'Ordinary Application Use does not include permission to reuse Original Materials, prepare ',
              {
                kind: 'link',
                label: 'Derivative Works',
                href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-derivative-work-restrictions',
              },
              ', distribute Distribution Materials, conduct AI Use, extract assets or resources, scrape the Documentation Site, mirror the Documentation Site, deploy the Documentation Site, remove legal markings, or incorporate Original Materials into another work, repository, product, service, dataset, model, benchmark, index, library, template collection, website, documentation site, or comparable material.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: [
                'A restricted act is not rehabilitated by calling it personal, local, educational, noncommercial, experimental, incidental, or ordinary. If the ',
                {
                  kind: 'link',
                  label: 'controlling',
                  href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
                },
                ' License Text does not grant the act, Ordinary Application Use does not supply the missing permission.',
              ],
            },
          },
        ],
      },
      {
        id: 'understanding-ordinary-application-use-user-created-materials-and-output',
        title: 'User-Created Materials and Application Output',
        body: [
          'User-Created Materials do not become Original Materials merely because they are entered, edited, displayed, saved, imported, exported, recorded, or processed through Ludoxel. Ordinary Application Use therefore does not confiscate user-created material into Ludoxel Original Materials by the mere fact of application handling.',
          [
            'Subject to the License Text and applicable third-party rights, the Licensee may use, reproduce, publish, and share the Licensee’s own User-Created Materials and Application Output created through Ordinary Application Use. The data-classification details belong to ',
            {
              kind: 'link',
              label: 'User-Created Materials',
              href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-user-created-materials',
            },
            ' and ',
            {
              kind: 'link',
              label: 'Application Output',
              href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-application-output',
            },
            '.',
          ],
          'That permission is not unconditional. If User-Created Materials or Application Output contain material parts of Original Materials, Third-Party Materials, Provenance-Sensitive Materials, user interface text, visual assets, bundled resources, project-specific textures, branding material, application icons, shaders, Documentation Site material, or other protected material, the included protected material remains governed by its applicable legal terms.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-third-party-and-provenance-boundary',
        title: 'Third-Party and Provenance Boundary',
        body: [
          'Ordinary Application Use does not relicense Third-Party Materials. Third-Party Materials remain subject to their own license terms, copyright statements, attribution requirements, warranty disclaimers, source-offer obligations, redistribution conditions, reserved names, trademark restrictions, and other applicable terms.',
          'Ordinary Application Use also does not clear Provenance-Sensitive Materials. The fact that such material may be present in the repository, loaded by Ludoxel, displayed by Ludoxel, referenced by documentation, or technically capable of being bundled or deployed does not make it Original Materials, public-domain material, open source material, redistributable material, web-deployable material, or material cleared for modification.',
          'The legal result is strict separation. Local application operation may be permitted while reuse, publication, redistribution, extraction, modification, deployment, or incorporation of a third-party or provenance-sensitive component remains unconfirmed or prohibited.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-distribution-and-public-sharing',
        title: 'Distribution and Public Sharing Boundary',
        body: [
          [
            'Using Ludoxel locally does not authorize distribution of Ludoxel, application bundles, executable files, installers, archives, wheels, source distributions, generated distribution directories, packages, release artifacts, website deployment material, embedded resources, copied legal materials, metadata, or other ',
            {
              kind: 'link',
              label: 'Distribution Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-distribution-materials',
            },
            '.',
          ],
          [
            'A user may have a separate output-sharing question when sharing the user’s own screenshots, recordings, save data, logs, configuration files, rendered states, or other output. That question must be resolved under the License Text, applicable third-party rights, protected-material inclusion, and the ',
            {
              kind: 'link',
              label: 'redistribution',
              href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-redistribution-restrictions',
            },
            ' boundary where public circulation of protected material is involved.',
          ],
          'Ordinary Application Use is therefore not a distribution permission. It is a local-use permission whose downstream public consequences remain legally conditional.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-ai-use-boundary',
        title: 'AI Use Boundary',
        body: [
          [
            'AI Use is outside Ordinary Application Use. The License Text separately defines AI Use and excludes it from the limited grant. Running Ludoxel, viewing its interface, recording ordinary footage, or obtaining output does not authorize creation, training, fine-tuning, evaluation, benchmarking, validation, testing, improvement, population, operation, indexing, retrieval, embedding, vector-database use, dataset creation, synthetic-data generation, or comparable computational use involving protected material.',
          ],
          [
            'If Application Output contains protected material, that protected portion remains subject to the applicable legal terms. Training, benchmarking, retrieval, and dataset use require authority for the protected portion even when ordinary application operation produced the output. The detailed restriction belongs to ',
            {
              kind: 'link',
              label: 'AI Use',
              href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-ai-use-restrictions',
            },
            '.',
          ],
        ],
      },
      {
        id: 'understanding-ordinary-application-use-no-expansion-by-interface',
        title: 'No Expansion by Interface or Expectation',
        body: [
          'An interface control, settings screen, screenshot function, recording workflow, save operation, package file, visible asset, public route, application window, cache file, local data file, or generated display does not amend the License Text.',
          [
            'A technical affordance may explain how an act occurred. It does not prove that the act is authorized. The same rule applies to repository access and platform surfaces: access may be factually possible, but legal authority must still come from the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text or a later competent written instrument.',
          ],
          'Ordinary Application Use must therefore be read as a controlled legal term, not as a user’s intuitive description of whatever feels normal while using an application.',
        ],
      },
      {
        id: 'understanding-ordinary-application-use-article-boundary',
        title: 'Ordinary Use and Reserved Acts',
        body: [
          [
            'Section 3 of `LICENSE` limits Ordinary Application Use to the listed desktop interaction, settings, user-data, screenshot, recording, and directly related local actions. Application Output, redistribution, deployment, derivative preparation, AI Use, third-party material, provenance-sensitive material, contributions, security reports, and Official Distribution each follow their own operative source and legal condition.',
          ],
          [
            'Ordinary Application Use permits the local desktop operation identified by the License Text. Rights in Original Materials beyond that operation, output publication, distribution, and AI Use require authority under the License Text or a later competent written instrument; public visibility, technical possibility, interface affordance, and user expectation carry no authority to enlarge the grant.',
          ],
        ],
      },
    ],
    relatedTitles: [
      'Understanding License Authority',
      'Understanding Controlling Text',
      'Understanding Repository Visibility',
      'Understanding Original Materials',
      'Understanding Distribution Materials',
      'Understanding Generated Output',
      'Understanding Redistribution Restrictions',
      'Understanding Derivative Work Restrictions',
      'Understanding AI Use Restrictions',
      'Understanding Application Output',
      'Understanding User-Created Materials',
      'Understanding Third Party Material Boundaries',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Ordinary Use and Output',
    title: 'Understanding Generated Output',
    description:
      'Defines the legal treatment of output produced through Ordinary Application Use, the composite material character of that output, and the boundary between a permission to use the user’s own output and any asserted right to reuse the underlying Ludoxel Original Materials.',
    sections: [
      {
        id: 'understanding-generated-output-juridical-function',
        title: 'Juridical Function of the Generated-Output Boundary',
        body: [
          [
            'Generated output is the result that Ludoxel produces, displays, records, or saves while it runs as a desktop application. Section 6 of `LICENSE` fixes the legal effect of such output on permissions concerning Ludoxel ',
            {
              kind: 'link',
              label: 'Original Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
            },
            '. The answer is that it does not enlarge them at all.',
          ],
          [
            'The boundary is distinct from the act of running Ludoxel. Whether a given operation is permitted at all is decided by ',
            {
              kind: 'link',
              label: 'Ordinary Application Use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            '. The resulting file, frame, recording, or record retains the legal status determined by the License Text and its embedded material.',
          ],
          'Runtime stores and schemas determine where output is stored, its structure, and its data classification. Section 6 of `LICENSE` governs permission and restriction for protected Ludoxel material carried in that output.',
        ],
      },
      {
        id: 'understanding-generated-output-operative-text',
        title: 'Operative Text',
        body: [
          'The operative source is the License Text governing User-Created Materials and Application Output. The License Text provides that, subject to the License and applicable third-party rights, a Licensee may use, reproduce, publish, and share the Licensee’s own User-Created Materials and Application Output created through Ordinary Application Use. That permission is conditional, not absolute, and it does not reach beyond the Licensee’s own output.',
          'The License Text further provides that User-Created Materials do not become Original Materials merely because they are entered, edited, displayed, saved, imported, exported, recorded, or processed through Ludoxel. The act of generating output through application operation therefore neither transfers ownership of protected Ludoxel material to the Licensee nor strips protection from any protected material that the output happens to contain.',
          'Because the permission is defined by the License Text, it cannot be enlarged by the interface that produced the output, the file format that stores it, the menu that exported it, or the convenience of possessing it. A generated file is evidence that an operation occurred; it is not a grant.',
        ],
      },
      {
        id: 'understanding-generated-output-covered-output',
        title: 'Output Within the Boundary',
        body: [
          'The output addressed here includes rendered frames, ordinary screenshots, ordinary screen recordings, log files, configuration files, rendered states, save files, saved world data, and learned artifacts produced through Ordinary Application Use. The form of the output is not decisive; a screenshot, a recording, a save file, and a log raise the same legal question about what the output authorizes.',
          'The defined permission attaches to the Licensee’s own output. It does not attach to the application that produced it, to the repository from which the application was obtained, or to the website that documents it. The permission to share a screenshot is not a permission to share the source code, assets, shaders, branding, interface text, or documentation visible within that screenshot as separable protected material.',
        ],
      },
      {
        id: 'understanding-generated-output-composite-character',
        title: 'Composite Material Character of Output',
        body: [
          [
            'Generated output is frequently composite. A single screenshot, recording, or save artifact may simultaneously embed User-Created Materials, Application Output, ',
            {
              kind: 'link',
              label: 'Original Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
            },
            ', Third-Party Materials, and Provenance-Sensitive Materials. The defined permission to share the Licensee’s own output does not dissolve those embedded categories into a single freely usable mass.',
          ],
          'The License Text states the consequence directly: where User-Created Materials or Application Output contain any material part of Original Materials, Third-Party Materials, Provenance-Sensitive Materials, user interface text, visual assets, bundled resources, project-specific textures, branding material, application icons, shaders, Documentation Site material, or other protected material, the included protected material remains subject to its applicable legal terms.',
          'The legal method evaluates each material component separately. Applicable legal terms continue to govern protected portions carried with a Licensee contribution, including portions captured in the same output file.',
        ],
      },
      {
        id: 'understanding-generated-output-classification-sequence',
        title: 'Generated-Output Reading Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'The inquiry proceeds in a fixed order because the common error is to reason from the existence of an output file to a general permission. Each step isolates a separate legal question and refuses to let possession of the file answer it.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-generated-output-classification-sequence-identify',
                title: 'Identify the output and the proposed downstream act.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Name the concrete output and the act proposed for it: private retention, display, publication, redistribution, commercial exploitation, dataset construction, or model input. The act, not the existence of the file, is what must be tested.',
                  },
                ],
              },
              {
                id: 'understanding-generated-output-classification-sequence-decompose',
                title: 'Decompose the output into legal categories.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Separate the Licensee’s own User-Created Materials and Application Output from any embedded Original Materials, Third-Party Materials, and Provenance-Sensitive Materials. A composite file is not treated as a single category merely because it was produced in one operation.',
                  },
                ],
              },
              {
                id: 'understanding-generated-output-classification-sequence-apply',
                title: 'Apply the correct terms to each part.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The Licensee’s own output is subject to the License and applicable third-party rights. Embedded protected material remains subject to its own applicable legal terms. The permission to share one part does not authorize separable reuse of another.',
                  },
                  {
                    kind: 'note',
                    note: {
                      type: 'warning',
                      content:
                        'Possession of a generated file does not grant permission to reuse the source code, assets, shaders, branding, interface text, documentation material, or package contents that the file may depict or contain.',
                    },
                  },
                ],
              },
              {
                id: 'understanding-generated-output-classification-sequence-stop',
                title: 'Stop before redistribution and AI analysis.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'Where the proposed act is public circulation of protected material, the analysis moves to ',
                      {
                        kind: 'link',
                        label: 'redistribution',
                        href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-redistribution-restrictions',
                      },
                      '. Where the proposed act is computational ingestion, the analysis moves to ',
                      {
                        kind: 'link',
                        label: 'AI Use',
                        href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-ai-use-restrictions',
                      },
                      '. Their authority is determined by the applicable License Text provision.',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-generated-output-not-source-grant',
        title: 'Output Is Not a Source-Reuse Grant',
        body: [
          'The defined permission concerns output. It does not concern the underlying materials that the application used to produce that output. The fact that Ludoxel rendered a frame from project shaders, drew an interface from project styling, or displayed branding and documentation text does not place those underlying materials at the Licensee’s disposal because a frame was captured.',
          'A Licensee therefore cannot extract source code, assets, shaders, branding, application icons, interface text, documentation material, or package content from generated output and treat the extracted material as licensed. The output captured the appearance or result of protected material; it did not detach that material from the License Text.',
          'The same limit applies to learned artifacts and save data. The capacity of Ludoxel to produce these files through ordinary operation is not a license to the project source, the Documentation Site, the assets, or the package contents that the application embodies.',
        ],
      },
      {
        id: 'understanding-generated-output-third-party-provenance',
        title: 'Third-Party and Provenance Boundary in Output',
        body: [
          [
            'Output may capture Third-Party Materials or Provenance-Sensitive Materials. Third-Party Materials remain subject to their own license terms, and reuse of Provenance-Sensitive Materials requires the governing source for those materials even when a generated file carries them. The broader material split is owned by ',
            {
              kind: 'link',
              label: 'third-party material boundaries',
              href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-third-party-material-boundaries',
            },
            '.',
          ],
          'The License Text is explicit that nothing in it represents that User-Created Materials or Application Output are free from third-party rights or suitable for publication, distribution, commercial use, competition use, educational use, AI Use, dataset use, benchmark use, or any other specific purpose. The Licensee bears the burden of confirming that a proposed downstream use of composite output is lawful.',
        ],
      },
      {
        id: 'understanding-generated-output-public-and-ai-boundary',
        title: 'Public Sharing and AI-Use Boundary',
        content: [
          {
            kind: 'paragraph',
            text: [
              'The permission to publish and share the Licensee’s own output is not a redistribution permission for protected Ludoxel material that the output contains. Where the proposed act is public circulation of a material part of Original Materials, the controlling analysis is the ',
              {
                kind: 'link',
                label: 'redistribution',
                href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-redistribution-restrictions',
              },
              ' restriction.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Output containing protected material requires authority for training, benchmarking, retrieval, and dataset use even when ordinary application operation produced it. Computational ingestion of protected material is AI Use; the limited grant covers the stated local operation.',
            },
          },
        ],
      },
      {
        id: 'understanding-generated-output-article-boundary',
        title: 'Application Output and Protected Components',
        body: [
          [
            'Application Output is produced through ',
            {
              kind: 'link',
              label: 'Ordinary Application Use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            '. Its persistence shape, distribution treatment, AI Use, third-party components, provenance-sensitive components, and publication authority each remain subject to their governing source.',
          ],
          [
            'Output created through Ordinary Application Use remains subject to the License Text and applicable third-party rights. Embedded protected components retain their legal status, and extraction, redistribution, training, and reuse of the underlying ',
            {
              kind: 'link',
              label: 'Original Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
            },
            ', assets, branding, shaders, interface text, documentation material, or package content.',
          ],
        ],
      },
    ],
    relatedTitles: [
      'Understanding Ordinary Application Use',
      'Understanding Original Materials',
      'Understanding Redistribution Restrictions',
      'Understanding AI Use Restrictions',
      'Understanding Application Output',
      'Understanding User-Created Materials',
      'Separating Original Materials from Output',
      'Understanding Third Party Material Boundaries',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding Redistribution Restrictions',
    description:
      'Defines why copying, publishing, hosting, mirroring, repackaging, sublicensing, and republishing Ludoxel Original Materials are restricted acts outside the limited grant, and why repository visibility, technical obtainability, package existence, license-text inclusion, and noncommercial or educational purpose do not create redistribution permission.',
    sections: [
      {
        id: 'understanding-redistribution-restrictions-juridical-function',
        title: 'Juridical Function of the Redistribution Restriction',
        body: [
          'The redistribution restriction governs the act of putting Ludoxel Original Materials into circulation. It treats copying for others, sharing, publishing, hosting, mirroring, reposting, repackaging, sublicensing, release-artifact publication, website redeployment, and static-site republication as acts that require affirmative authority, not as acts that follow automatically from lawful access.',
          [
            'Redistribution is a Use defined by `LICENSE`; material scope determines what ',
            {
              kind: 'link',
              label: 'Distribution Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-distribution-materials',
            },
            ' are. A packaged artifact can be correctly classified while circulation remains outside the limited grant; classification identifies the object and the License Text governs movement into circulation.',
          ],
          'The function of the restriction is to prevent the limited grant from being read as a distribution license. The Licensee may have lawful access to Original Materials and may run Ludoxel, yet remain without any permission to redistribute the protected material to third parties.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-operative-text',
        title: 'Operative Text and the Exhaustive Grant',
        body: [
          [
            'The License Text grants a limited, non-exclusive, non-transferable, non-sublicensable, revocable permission confined to human review and verification of Repository Contents, Ordinary Documentation Site Viewing, and ',
            {
              kind: 'link',
              label: 'Ordinary Application Use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            '. That grant is exhaustive and does not include distribution.',
          ],
          'The License Text separately excludes publication, distribution, transmission, sublicensing, hosting, deployment, and incorporation from the permitted scope, and reserves all such rights to the Licensor. The exhaustive character of the grant means that any redistribution not expressly authorized is, by definition, ungranted.',
          [
            'Because redistribution is ungranted, authority for it must come from the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text or a later competent written instrument signed by the Licensor. It cannot be assembled from explanatory text, platform behavior, or user expectation.',
          ],
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-covered-acts',
        title: 'Acts Within the Restriction',
        body: [
          'The restriction reaches copying Original Materials for distribution to others, sharing protected files, publishing repository or website material, hosting copies for public access, mirroring the repository or Documentation Site, reposting protected content elsewhere, repackaging protected material into another distribution, sublicensing, publishing release artifacts, redeploying the website, and republishing static-site output.',
          'The technical mechanism is immaterial. Redistribution by upload, by package registry, by file-sharing service, by archive, by re-hosting a generated site, by embedding into another product, or by transmitting copies to a group are the same act for the purpose of the restriction: protected Ludoxel material is moved into circulation beyond the Licensee.',
          'Partial redistribution remains within the restriction. Circulation of a material part of Original Materials carries protected expression beyond the Licensee, irrespective of whether a complete project copy is involved.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-analysis-sequence',
        title: 'Redistribution Analysis Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'Redistribution disputes often assert that an access route, purpose, or convenience made circulation permissible. The sequence isolates the act and applies the License Text to that act.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-redistribution-restrictions-analysis-sequence-act',
                title: 'Identify the circulation act.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'State precisely what is being moved into circulation and to whom: which protected material, in which form, through which channel, to which recipients beyond the Licensee.',
                  },
                ],
              },
              {
                id: 'understanding-redistribution-restrictions-analysis-sequence-material',
                title: 'Confirm that protected material is involved.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'Confirm that the circulated material is, in material part, ',
                      {
                        kind: 'link',
                        label: 'Original Materials',
                        href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
                      },
                      '. Third-party and provenance-sensitive components are governed by their own terms and are analyzed separately.',
                    ],
                  },
                ],
              },
              {
                id: 'understanding-redistribution-restrictions-analysis-sequence-test',
                title: 'Test the act against the limited grant.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Redistribution is outside the exhaustive limited grant. Unless the License Text or a later competent written instrument expressly authorizes the circulation, the act is ungranted regardless of the route by which the material was obtained.',
                  },
                  {
                    kind: 'note',
                    note: {
                      type: 'warning',
                      content:
                        'A noncommercial motive, an educational setting, a private group, or mere personal convenience does not convert an ungranted redistribution into a permitted one. The License Text grants the act, or the act is not granted.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-non-authorizing-circumstances',
        title: 'Circumstances That Do Not Authorize Redistribution',
        body: [
          [
            'Public ',
            {
              kind: 'link',
              label: 'repository visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            ' does not authorize redistribution. The fact that material can be viewed, cloned, forked, downloaded, archived, cached, indexed, or rendered in a browser establishes technical obtainability, not permission to circulate.',
          ],
          'The existence of a package, build artifact, or generated site directory does not authorize redistribution. An artifact can exist, be reproducible, and contain the correct files while no permission to publish or host it exists.',
          'Inclusion of the License Text, Third-Party License Text, SPDX identifiers, or other legal materials inside a copy does not authorize redistribution. Retained legal text is a condition that an authorized distribution must satisfy; it is not itself the authorization. A noncommercial purpose, an educational purpose, and private convenience are equally insufficient, because the limited grant does not turn on the Licensee’s purpose.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-official-distribution',
        title: 'Official Distribution Reservation',
        body: [
          [
            'Only the Licensor may publish an Official Distribution of Ludoxel or an official deployment of the Documentation Site. A Desktop Distribution, deployment, package, archive, fork build, or mirror published by any other party is not an Official Distribution, even when it is derived from the Current Repository. The presentational dimension of this reservation is addressed by ',
            {
              kind: 'link',
              label: 'unofficial release claims',
              href: '/docs/distribution/build-and-release-checks/release-checks-and-claims/avoiding-unofficial-release-claims',
            },
            '.',
          ],
          'The reservation means that a third party cannot cure the absence of redistribution permission by producing an artifact that resembles the official application. Resemblance, inclusion of legal text, use of Ludoxel names, or production through a repository build path does not create authority to circulate.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-documentation-site',
        title: 'Documentation Site Republication',
        body: [
          'Republication of the Documentation Site is within the restriction. The License Text provides that public website availability, static-site output, previews, and hosting-service features do not grant rights to copy, mirror, redeploy, or republish the site. A Licensee who can view the documentation in a browser has Ordinary Documentation Site Viewing, not a republication license.',
          'Static-site output does not change this result. Generated HTML, assets, search data, and metadata produced from the website source remain Original Materials in object form. The ability to retrieve or regenerate that output does not authorize hosting it elsewhere or incorporating it into another documentation set.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-third-party-provenance',
        title: 'Third-Party and Provenance Boundary',
        body: [
          [
            'A redistribution may carry Third-Party Materials and Provenance-Sensitive Materials in addition to Original Materials. Compliance with a third-party license governing one component does not grant any right in the Ludoxel Original Materials carried alongside it, and the separate material split is owned by ',
            {
              kind: 'link',
              label: 'third-party material boundaries',
              href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-third-party-material-boundaries',
            },
            '.',
          ],
          'Conversely, the Ludoxel limited grant does not authorize redistribution of third-party or provenance-sensitive components. A party that proposes to circulate any such component must separately confirm redistribution permission for that component under its own terms.',
        ],
      },
      {
        id: 'understanding-redistribution-restrictions-article-boundary',
        title: 'Redistribution Authority and Artifact Classification',
        body: [
          [
            'Section 3 of `LICENSE` requires affirmative authority for copying, sharing, publishing, hosting, mirroring, reposting, repackaging, sublicensing, release-artifact publication, website redeployment, and static-site republication of Original Materials. ',
            {
              kind: 'link',
              label: 'Distribution Materials',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-distribution-materials',
            },
            ' describes the artifact category used by build and packaging paths; derivative preparation, AI Use, third-party material, and Official Distribution remain distinct legal conditions.',
          ],
          [
            'The limited grant excludes redistribution acts involving Ludoxel Original Materials. Authority for those acts must arise in the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text or a later competent written instrument. Repository visibility, technical obtainability, package existence, license-text inclusion, noncommercial purpose, educational purpose, and private convenience do not supply that authority.',
          ],
        ],
      },
    ],
    relatedTitles: [
      'Understanding License Authority',
      'Understanding Controlling Text',
      'Understanding Repository Visibility',
      'Understanding Distribution Materials',
      'Understanding Derivative Work Restrictions',
      'Understanding AI Use Restrictions',
      'Avoiding Unofficial Release Claims',
      'Understanding Third Party Material Boundaries',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding Derivative Work Restrictions',
    description:
      'Defines why modification, adaptation, translation, rewriting, fork-based alteration, documentation replacement, shader rewriting, asset substitution, package modification, and website redesign of Ludoxel Original Materials are restricted, and why private technical capability does not create permission to prepare, use, publish, or circulate a derivative work.',
    sections: [
      {
        id: 'understanding-derivative-work-restrictions-juridical-function',
        title: 'Juridical Function of the Derivative-Work Restriction',
        body: [
          'The derivative-work restriction governs the preparation and use of works based on Ludoxel Original Materials. Modifying, adapting, translating, rewriting, restructuring, refactoring, porting, reimplementing, and otherwise transforming protected material each require affirmative authority.',
          [
            'The derivative-work restriction governs preparation and use of works based on Original Materials. Circulation engages ',
            {
              kind: 'link',
              label: 'redistribution',
              href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-redistribution-restrictions',
            },
            ', while submission of derivative material follows the contribution-refusal policy. Preparation, circulation, and submission are separate acts under their respective License Text and policy provisions.',
          ],
          'The function of the restriction is to keep the Licensor’s exclusive right to prepare derivative works intact notwithstanding the limited grant. Lawful access to the source does not carry an implied right to produce and use altered versions of it.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-operative-text',
        title: 'Operative Text and the Definition of Derivative Work',
        body: [
          'The License Text defines a Derivative Work as any work based on, derived from, adapted from, modified from, translated from, transformed from, compiled from, bundled with, incorporated with, rendered from, generated from, extracted from, optimized from, restructured from, refactored from, ported from, or reimplemented from any part of the Original Materials, to the extent recognized under applicable law.',
          'The License Text excludes the preparation of Derivative Works from the limited grant and reserves the corresponding rights to the Licensor. The exhaustive grant covers human review and verification, Ordinary Documentation Site Viewing, and Ordinary Application Use, none of which includes authority to prepare an altered version of protected material for use beyond that grant.',
          [
            'Authority to prepare or use a derivative work must therefore originate in the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text or a later competent written instrument. The breadth of the defined term means that superficial relabeling, partial rewriting, or translation does not escape the restriction.',
          ],
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-covered-acts',
        title: 'Acts of Derivative Preparation',
        body: [
          'The restriction reaches modification of source code, adaptation of project behavior, translation of documentation or interface text, rewriting of project files, fork-based alteration of the repository, replacement or rewriting of documentation content, shader rewriting, asset substitution, modification of package contents, and redesign of the website.',
          'It also reaches the production of proposed patches and replacement text, because such material is prepared from the Original Materials and is a Derivative Work within the defined term. The fact that a derivative is framed as an improvement, a fix, or a contribution proposal does not remove it from the restriction.',
          'The restriction does not depend on the quality, size, or intent of the alteration. A small edit, a faithful translation, and a complete rewrite are each derivative preparation when they are based on protected Ludoxel material.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-analysis-sequence',
        title: 'Derivative-Work Analysis Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'The recurring error is to reason from the technical ability to edit a file to a legal permission to prepare and use the edited result. The sequence separates capability from authority and isolates the scope of the proposed use.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-derivative-work-restrictions-analysis-sequence-act',
                title: 'Identify the alteration and its basis.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Identify what is being altered and confirm that the result is based on, derived from, or transformed from a part of the Original Materials. If it is, the result is a Derivative Work within the defined term.',
                  },
                ],
              },
              {
                id: 'understanding-derivative-work-restrictions-analysis-sequence-scope',
                title: 'Identify the scope of the intended use.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Distinguish a strictly private, local result from a result intended for use beyond the Licensee, such as publication, distribution, deployment, incorporation, or submission. The intended scope determines which further restrictions also apply.',
                  },
                ],
              },
              {
                id: 'understanding-derivative-work-restrictions-analysis-sequence-test',
                title: 'Test preparation and use against the limited grant.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Preparation of a Derivative Work is excluded from the limited grant. Unless the License Text or a later competent written instrument authorizes it, the preparation and use of the derivative are ungranted, and any public circulation additionally engages the redistribution restriction.',
                  },
                  {
                    kind: 'note',
                    note: {
                      type: 'warning',
                      content:
                        'The technical ability of local tools to modify project files is not permission to prepare or use a public derivative work based on Ludoxel Original Materials. Capability is not authority.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-capability-not-permission',
        title: 'Technical Capability Is Not Permission',
        body: [
          'A local editor, compiler, translator, or build tool can transform protected files. That technical capability describes what the Licensee’s machine can do; it does not describe what the License Text permits. The restriction is not lifted because a fork can be edited, a file can be rewritten, or a shader can be recompiled.',
          [
            'The same separation governs forks. The ability to create a fork through a hosting-service feature does not grant authority to prepare and circulate altered versions of the Original Materials, because no platform affordance enlarges the License Text. The platform-feature analysis is owned by ',
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
        id: 'understanding-derivative-work-restrictions-private-versus-public',
        title: 'Private Experiment and Public Derivative Circulation',
        body: [
          'A strictly private local alteration and public derivative circulation produce different technical evidence, while public circulation also engages redistribution, AI Use, and contribution rules. The License Text determines authority for preparation and use of the derivative; practical privacy supplies no additional grant.',
          'The decisive point is that the existence of a private capability cannot be advanced as evidence of any broader permission. A Licensee cannot reason from the ability to experiment locally to a right to publish, distribute, deploy, submit, incorporate, or otherwise circulate a derivative work to others.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-third-party-provenance',
        title: 'Third-Party and Provenance Boundary',
        body: [
          'A derivative may incorporate Third-Party Materials or Provenance-Sensitive Materials. The Ludoxel restriction does not relicense those components, and compliance with a third-party license governing one component does not grant any right to prepare a derivative of the Ludoxel Original Materials.',
          'Where an alteration substitutes, adapts, or incorporates third-party or provenance-sensitive assets, the responsible party must separately confirm the rights governing those assets. The Ludoxel analysis and the third-party analysis remain distinct and must both be satisfied.',
        ],
      },
      {
        id: 'understanding-derivative-work-restrictions-article-boundary',
        title: 'Derivative Preparation, Circulation, and Submission',
        body: [
          [
            'The License Text treats modification, adaptation, translation, rewriting, fork-based alteration, documentation replacement, shader rewriting, asset substitution, package modification, and website redesign as derivative preparation. Circulation of a derivative engages ',
            {
              kind: 'link',
              label: 'redistribution',
              href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-redistribution-restrictions',
            },
            ', while proposed derivative material enters the Repository only under ',
            {
              kind: 'link',
              label: 'contribution refusal',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
            },
            '.',
          ],
          'The limited grant excludes derivative preparation involving Original Materials. Local technical capability leaves the License Text, redistribution rule, and contribution policy as the controlling sources for preparation, circulation, and submission.',
        ],
      },
    ],
    relatedTitles: [
      'Understanding Original Materials',
      'Understanding Redistribution Restrictions',
      'Understanding AI Use Restrictions',
      'Understanding Contribution Refusal',
      'Understanding Ordinary Application Use',
      'Understanding Repository Visibility',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding AI Use Restrictions',
    description:
      'Defines the License Text restriction on AI Use of Ludoxel Original Materials, separates that restriction from Ordinary Application Use, and states why Ludoxel’s own AI features and learning records do not authorize training, evaluation, dataset creation, indexing, or other computational ingestion of protected material by external systems.',
    sections: [
      {
        id: 'understanding-ai-use-restrictions-juridical-function',
        title: 'Juridical Function of the AI-Use Restriction',
        body: [
          'The AI-use restriction governs the computational ingestion of Ludoxel Original Materials into artificial-intelligence and comparable systems. It treats training, fine-tuning, evaluation, benchmarking, indexing, retrieval, embedding, dataset creation, and synthetic-data generation as a distinct restricted category, separate from the question of whether an application operation is permitted at all.',
          [
            'The AI Use definition and exclusion in `LICENSE` govern computational ingestion of Original Materials. Ordinary local operation follows ',
            {
              kind: 'link',
              label: 'Ordinary Application Use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            ', because launching Ludoxel and obtaining output are runtime acts, while ingesting protected material into a model, dataset, index, benchmark, or retrieval system is a separate restricted act outside the ordinary-use grant.',
          ],
          'The function of the restriction is to prevent the limited grant, the public availability of the materials, or the presence of machine-learning functionality inside Ludoxel from being read as consent to computational reuse of protected expression.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-operative-text',
        title: 'Operative Text and the Definition of AI Use',
        body: [
          'The License Text defines AI Use as using Original Materials, Repository Contents, Documentation Site materials, Distribution Materials, Derivative Works, Application Output containing protected material, or any substantial part of them to create, train, fine-tune, evaluate, benchmark, validate, test, improve, populate, operate, index, retrieve for, or generate data for any artificial-intelligence system, machine-learning system, generative model, code model, image model, multimodal model, search index, embedding system, vector database, dataset, benchmark, evaluation suite, synthetic-data pipeline, or comparable computational system.',
          'The License Text excludes AI Use from the limited grant and reserves it. It further states that the exclusion applies regardless of whether the material is used as input data, training data, fine-tuning data, evaluation data, benchmark data, validation data, retrieval material, embedding material, synthetic-data seed material, code-generation reference material, image-generation reference material, website-corpus material, or comparable computational material.',
          [
            'Authority for AI Use therefore must come from the ',
            {
              kind: 'link',
              label: 'controlling',
              href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
            },
            ' License Text or a later competent written instrument. The breadth of the defined term forecloses arguments that a particular pipeline stage or model role is exempt.',
          ],
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-covered-acts',
        title: 'Acts Within AI Use',
        body: [
          'The restriction reaches training and fine-tuning models on protected material; using protected material for evaluation, benchmarking, validation, or testing; indexing or embedding protected material for retrieval; constructing vector databases from it; creating datasets or benchmarks from it; generating synthetic data seeded by it; populating or operating a model with it; and performing automated extraction of it for any of these purposes.',
          'The category follows computational purpose. Manual reading and machine ingestion are distinct acts even when they begin from the same visible page. The restriction reaches ingestion of a substantial part of protected material.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-analysis-sequence',
        title: 'AI-Use Analysis Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'AI-use disputes commonly proceed by characterizing protected material as ordinary, public, or user-generated and therefore available for ingestion. The sequence isolates the computational act and tests the material that feeds it.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-ai-use-restrictions-analysis-sequence-act',
                title: 'Identify the computational act.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Name the act precisely: training, fine-tuning, evaluation, benchmarking, indexing, retrieval, embedding, dataset construction, synthetic-data generation, or automated extraction. The act, not the convenience of access, is what is tested.',
                  },
                ],
              },
              {
                id: 'understanding-ai-use-restrictions-analysis-sequence-material',
                title: 'Identify the material that feeds the system.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'Determine whether the input is, in substantial part, ',
                      {
                        kind: 'link',
                        label: 'Original Materials',
                        href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
                      },
                      ', Repository Contents, Documentation Site material, Distribution Materials, a Derivative Work, or Application Output containing protected material.',
                    ],
                  },
                ],
              },
              {
                id: 'understanding-ai-use-restrictions-analysis-sequence-test',
                title: 'Apply the exclusion.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'AI Use is excluded from the limited grant. Unless the License Text or a later competent written instrument authorizes it, the computational ingestion of protected material is prohibited irrespective of the pipeline role assigned to that material.',
                  },
                  {
                    kind: 'note',
                    note: {
                      type: 'warning',
                      content:
                        'Public visibility, technical obtainability, a noncommercial purpose, a research purpose, or an evaluation-only purpose does not authorize AI Use. The License Text grants the act, or the act is not granted.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-internal-features',
        title: 'Internal AI Features Are Not External AI Permission',
        body: [
          'Ludoxel contains AI-controlled non-player actors and produces AI learning records as part of its ordinary operation. Those features are runtime behavior of the application and the resulting records are user data produced locally. Their existence does not grant permission to train, evaluate, benchmark, or otherwise ingest Ludoxel Original Materials into any external model, dataset, index, or benchmark.',
          'The internal learning behavior operates within the application’s own runtime context. It is not a representation that the project source, assets, documentation, or package contents are available as training, evaluation, indexing, benchmark, retrieval, embedding, or dataset material for systems outside Ludoxel. The presence of machine-learning functionality inside the application must not be read as consent to AI Use of the protected materials that compose the application.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-output-not-clean',
        title: 'Output and User Material Do Not Become Clean AI Material',
        body: [
          [
            'Application Output and User-Created Materials may contain protected material. Where they do, that protected portion remains subject to the applicable legal terms and is not converted into clean AI material by having arisen during ordinary operation. The output-permission boundary is owned by ',
            {
              kind: 'link',
              label: 'generated output',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-generated-output',
            },
            '.',
          ],
          'A Licensee therefore cannot launder protected material through the output path. Capturing a screenshot, exporting a save file, or recording footage does not strip the embedded Original Materials of protection, and the resulting file does not become a permissible training, benchmark, retrieval, or dataset source merely because it is the Licensee’s own output.',
        ],
      },
      {
        id: 'understanding-ai-use-restrictions-article-boundary',
        title: 'AI Use, Application Features, and Material Authority',
        body: [
          [
            'The `LICENSE` defines AI Use as training, fine-tuning, evaluation, benchmarking, validation, testing, improvement, indexing, retrieval, embedding, vector-database construction, dataset creation, synthetic-data generation, model population, and automated extraction involving Original Materials. ',
            {
              kind: 'link',
              label: 'Ordinary Application Use',
              href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
            },
            ' supplies the separate local-use term. AI actor implementation, learning records, redistribution, and third-party or provenance-sensitive material remain governed by their respective implementation and legal sources.',
          ],
          [
            'The listed computational acts are AI Use outside the limited grant. Ludoxel AI features, learning records, and the public ',
            {
              kind: 'link',
              label: 'visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            ' of the materials, do not supply that authority.',
          ],
        ],
      },
    ],
    relatedTitles: [
      'Understanding Ordinary Application Use',
      'Understanding Original Materials',
      'Understanding Generated Output',
      'Understanding User-Created Materials',
      'Understanding Redistribution Restrictions',
      'Understanding Contribution Refusal',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Public and Private Reporting',
    title: 'Understanding Public Issue Limits',
    description:
      'Defines the legal and operational limits of the Ludoxel public issue surface, the narrow categories of submission it admits, the content it must never carry, and why a public form does not create permission, a right of submission, or acceptance of any contribution.',
    sections: [
      {
        id: 'understanding-public-issue-limits-juridical-function',
        title: 'Juridical Function of the Public-Issue Limit',
        body: [
          'The public-issue limit defines what a publicly visible submission to the Repository is permitted to be and to contain. It treats the public issue surface as a restricted channel with three narrow uses, not as an open forum for discussion, proposal, or disclosure.',
          'The function of the limit is twofold. It protects the public surface from carrying security-sensitive or otherwise unsuitable content, and it prevents the act of opening a public submission from being read as a grant of permission or as the opening of a contribution relationship.',
          [
            '`LICENSE`, `.github/CONTRIBUTING.md`, and the issue-form acknowledgements govern the legal status of the public surface. The operational composition of a submission follows ',
            {
              kind: 'link',
              label: 'writing a problem report',
              href: '/docs/support/public-problem-support/issue-report-content/writing-a-problem-report',
            },
            ' and ',
            {
              kind: 'link',
              label: 'asking a limited question',
              href: '/docs/support/scope-and-closure-support/limited-question-scope/asking-a-limited-question',
            },
            '.',
          ],
        ],
      },
      {
        id: 'understanding-public-issue-limits-operative-text',
        title: 'Operative Text',
        body: [
          'The operative sources are the License Text governing External Contributions and Security Reports, the Repository Contribution Policy in `.github/CONTRIBUTING.md`, the Security Reporting Policy in `.github/SECURITY.md`, and the configured issue forms. The License Text defines a Public Issue as a publicly visible issue, pull request, discussion, comment, or other public submission made through a hosting-service feature, and confines its proper use accordingly.',
          'The Contribution Policy states that a Public Issue is limited to a problem report, a limited question, or a request for a Private Reporting Channel for a Security Report, and that it is not a channel for an External Contribution, replacement text, code-review submissions, asset submissions, dataset submissions, or design proposals. The configured forms are confined to the same categories and require explicit acknowledgement of these limits.',
          'These sources are consistent and controlling. The public surface admits only the enumerated categories, and the License Text controls where any subordinate statement appears to widen them.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-permitted-categories',
        title: 'Permitted Public-Issue Categories',
        body: [
          [
            'A public issue is admitted only for a reproducible non-security ',
            {
              kind: 'link',
              label: 'problem report',
              href: '/docs/support/public-problem-support/issue-report-content/writing-a-problem-report',
            },
            ' concerning the Current Repository or an Official Distribution; for a ',
            {
              kind: 'link',
              label: 'limited question',
              href: '/docs/support/scope-and-closure-support/limited-question-scope/asking-a-limited-question',
            },
            ' about repository policy, the License, Third-Party Materials, Ordinary Application Use, packaging status, or the Security Reporting Policy; and for a minimal request for a ',
            {
              kind: 'link',
              label: 'Private Reporting Channel',
              href: '/docs/support/security-and-safety-support/private-security-contact/requesting-a-private-security-channel',
            },
            ' when no such channel is available. Each category is admitted only as a narrow report-routing surface and does not become an invitation to submit patches, replacement text, exploit detail, feature proposals, design material, or implementation material.',
          ],
          'These categories are exhaustive for the public surface. A submission that does not fall within one of them is outside the permitted scope of the public issue channel, regardless of how it is labelled.',
        ],
      },
      {
        id: 'understanding-public-issue-limits-excluded-content',
        title: 'Content Excluded from a Public Issue',
        content: [
          {
            kind: 'paragraph',
            text: 'A public issue must not carry security-sensitive content or contribution material. The exclusion is categorical and is reinforced by the acknowledgements required by the issue forms.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: [
                'A Public Issue must not contain vulnerability details, exploit steps, proof-of-concept code, credentials, tokens, cookies, logs containing secrets, private local files, third-party confidential information, or other ',
                {
                  kind: 'link',
                  label: 'unsafe public content',
                  href: '/docs/support/security-and-safety-support/public-safety-limits/understanding-unsafe-public-content',
                },
                '. It must not contain Contribution Materials, replacement text, patches, design assets, datasets, generated files, shader rewrites, implementation proposals, or ',
                {
                  kind: 'link',
                  label: 'feature requests',
                  href: '/docs/support/scope-and-closure-support/unsupported-requests/avoiding-feature-requests',
                },
                '.',
              ],
            },
          },
        ],
      },
      {
        id: 'understanding-public-issue-limits-reading-sequence',
        title: 'Public-Issue Reading Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'A submission is tested by category, content, and legal effect, in that order. The sequence prevents a submitter from inferring permission or contribution acceptance from the mere availability of the form.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-public-issue-limits-reading-sequence-category',
                title: 'Confirm the submission falls within a permitted category.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Confirm that the submission is a reproducible non-security problem report, a limited question, or a request for a private reporting channel. If it is none of these, the public surface is not the proper channel.',
                  },
                ],
              },
              {
                id: 'understanding-public-issue-limits-reading-sequence-content',
                title: 'Confirm the content is suitable for public disclosure.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'Confirm that the submission contains no security-sensitive detail and no contribution material. Security-relevant matters are routed to ',
                      {
                        kind: 'link',
                        label: 'private security reporting',
                        href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-private-security-reporting',
                      },
                      '.',
                    ],
                  },
                ],
              },
              {
                id: 'understanding-public-issue-limits-reading-sequence-effect',
                title: 'Recognize the absence of legal effect.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'A Public Issue is a limited reporting channel under `.github/CONTRIBUTING.md`. Permission to Use Original Materials remains in the License Text, while the contribution policy governs Maintainer review and contribution acceptance.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-public-issue-limits-surface-not-grant',
        title: 'A Public Surface Is Not a Grant',
        body: [
          [
            'The public issue form operates within the License Text and Repository Contribution Policy. Those sources fix the permitted submission categories and the Maintainer’s discretion over review, acceptance, preservation, credit, response, and incorporation. The platform-feature principle is stated in ',
            {
              kind: 'link',
              label: 'repository visibility',
              href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
            },
            '.',
          ],
          [
            'A public submission that proposes or carries contribution material is outside the permitted scope and may be closed without review. The refusal of external contribution material is owned by ',
            {
              kind: 'link',
              label: 'contribution refusal',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
            },
            ', and the public surface does not create an exception to it.',
          ],
        ],
      },
      {
        id: 'understanding-public-issue-limits-article-boundary',
        title: 'Public Issue Intake and Legal Effect',
        body: [
          'The Repository Contribution Policy limits a Public Issue to a problem report, limited question, or request for a Private Reporting Channel. `problem-report.yml`, `limited-question.yml`, and `security-contact.yml` provide the operational fields; `.github/SECURITY.md` supplies the private security procedure; and `LICENSE` controls permission and enforcement effects.',
          [
            'The public surface receives the three stated report classes and records them in a public repository. Its acknowledgement fields exclude security-sensitive detail and Contribution Materials; Security Reports proceed through ',
            {
              kind: 'link',
              label: 'private security reporting',
              href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-private-security-reporting',
            },
            '.',
          ],
        ],
      },
    ],
    relatedTitles: [
      'Understanding Private Security Reporting',
      'Understanding Contribution Refusal',
      'Understanding Pull Request Boundaries',
      'Writing a Problem Report',
      'Asking a Limited Question',
      'Requesting a Private Security Channel',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Public and Private Reporting',
    title: 'Understanding Private Security Reporting',
    description:
      'Defines the private reporting route for suspected vulnerabilities, the lawful and authorized limits of Security Testing, and the fixed scope of a private reporting channel. The channel supplies a reporting route; testing authority, exploit publication, safe-harbor status, third-party-system access, and other permission require their governing source.',
    sections: [
      {
        id: 'understanding-private-security-reporting-juridical-function',
        title: 'Juridical Function of Private Security Reporting',
        body: [
          'Private security reporting governs how a suspected vulnerability affecting the Current Repository, an Official Distribution, or an official Documentation Site deployment is to be communicated. It treats non-public reporting as the required channel and public disclosure of vulnerability detail as prohibited.',
          [
            'The Security Reporting Policy separates Public Issues from a Private Reporting Channel and retains the License Text’s non-expansion of permission. The operational request path follows ',
            {
              kind: 'link',
              label: 'requesting a private security channel',
              href: '/docs/support/security-and-safety-support/private-security-contact/requesting-a-private-security-channel',
            },
            ', and the public-disclosure prohibition is developed by ',
            {
              kind: 'link',
              label: 'avoiding public exploit details',
              href: '/docs/support/security-and-safety-support/public-safety-limits/avoiding-public-exploit-details',
            },
            '.',
          ],
          'The function of the rule is to keep sensitive technical detail out of public surfaces while making clear that submitting a report neither enlarges the reporter’s permissions nor obligates the Maintainer.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-operative-text',
        title: 'Operative Text',
        body: [
          'The operative sources are the License Text governing Security Reports and the Security Reporting Policy in `.github/SECURITY.md`. The License Text provides that a Security Report is governed by the Security Reporting Policy and must be submitted through a Private Reporting Channel when one is available, and that a Public Issue must not contain vulnerability details, exploit steps, proof-of-concept code, credentials, tokens, cookies, logs containing secrets, private local files, third-party confidential information, or other information unsuitable for public disclosure.',
          [
            'The Security Reporting Policy directs the reporter to use GitHub private vulnerability reporting or a GitHub security advisory when available, and otherwise to open only a minimal Public Issue ',
            {
              kind: 'link',
              label: 'requesting',
              href: '/docs/support/security-and-safety-support/private-security-contact/requesting-a-private-security-channel',
            },
            ' a private contact method that itself contains no vulnerability detail. The supported scope is confined to the Current Repository and an Official Distribution.',
          ],
          'These sources control the channel and the content. Where any subordinate statement appears to permit public disclosure of vulnerability detail, the License Text and the Security Reporting Policy control.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-channel-selection',
        title: 'Channel Selection',
        body: [
          'A suspected vulnerability must be reported privately when a Private Reporting Channel is available. Where GitHub private vulnerability reporting or a security advisory exists for the Repository, that channel must be used.',
          [
            'Where no Private Reporting Channel is available, the only permitted public step is a minimal request for a private contact method, which must not include vulnerability detail. That request remains within the narrow categories admitted by ',
            {
              kind: 'link',
              label: 'public issue limits',
              href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-public-issue-limits',
            },
            '.',
          ],
        ],
      },
      {
        id: 'understanding-private-security-reporting-public-disclosure-prohibition',
        title: 'Public Disclosure Prohibition',
        content: [
          {
            kind: 'paragraph',
            text: 'Public disclosure of vulnerability detail is prohibited through any public channel, including a public issue, a public pull request, a public discussion, and social media.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Do not disclose vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, logs containing secrets, private local files, third-party confidential information, or other non-public reproduction information through any public channel.',
            },
          },
        ],
      },
      {
        id: 'understanding-private-security-reporting-sequence',
        title: 'Security Reporting Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'The reporter proceeds by confirming scope, selecting the private channel, and withholding sensitive detail from public surfaces. The sequence keeps disclosure private and keeps the reporter’s permissions unchanged.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'understanding-private-security-reporting-sequence-scope',
                title: 'Confirm the report is within scope.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Confirm that the suspected vulnerability affects the Current Repository, an Official Distribution, or an official Documentation Site deployment. Older commits, forks, mirrors, and unofficial deployments are outside the supported scope.',
                  },
                ],
              },
              {
                id: 'understanding-private-security-reporting-sequence-channel',
                title: 'Use the private channel.',
                content: [
                  {
                    kind: 'paragraph',
                    text: [
                      'Submit through GitHub private vulnerability reporting or a security advisory when available; otherwise ',
                      {
                        kind: 'link',
                        label: 'request',
                        href: '/docs/support/security-and-safety-support/private-security-contact/requesting-a-private-security-channel',
                      },
                      ' a private contact method through a minimal public issue that contains no vulnerability detail.',
                    ],
                  },
                ],
              },
              {
                id: 'understanding-private-security-reporting-sequence-limits',
                title: 'Keep testing lawful and permissions unchanged.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'Confine any Security Testing to systems, accounts, files, and data the reporter is authorized to test, and recognize that submitting a report does not enlarge any permission and creates no obligation on the Maintainer.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'understanding-private-security-reporting-testing-limits',
        title: 'Limits of Security Testing',
        body: [
          'The Security Reporting Policy requires that Security Testing remain lawful, non-destructive, good-faith, and limited to systems, accounts, files, and data that the reporter is authorized to test. Testing that exceeds those limits is outside the policy and is not sanctioned by the availability of a reporting channel.',
          'Out-of-scope conduct is expressly identified, including reports requiring unauthorized access, destructive testing, denial of service, and reports about unofficial forks or deployments. The existence of a private channel does not convert any of these into permitted activity.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-non-expansion',
        title: 'Reporting Does Not Expand Permission',
        body: [
          'The License Text and `.github/SECURITY.md` establish a Private Reporting Channel for Security Reports and define lawful, authorized Security Testing. Permission to Use Original Materials remains under the License Text, while report review, acceptance, response, and remediation remain within Maintainer discretion.',
          'A Private Reporting Channel is a confidential route for communicating a suspected vulnerability, and nothing more. It does not become unlimited testing permission, exploit-publication permission, a security-research safe harbor, authorization to access third-party environments, or permission to disclose secrets. The reporter remains solely responsible for ensuring that a submission does not contain confidential or unauthorized material.',
        ],
      },
      {
        id: 'understanding-private-security-reporting-article-boundary',
        title: 'Private Reporting Channel and Security Testing',
        body: [
          [
            '`.github/SECURITY.md` directs a suspected vulnerability to a Private Reporting Channel. The public contact request described by ',
            {
              kind: 'link',
              label: 'requesting a private security channel',
              href: '/docs/support/security-and-safety-support/private-security-contact/requesting-a-private-security-channel',
            },
            ' carries a minimal category-level request; public issue categories remain fixed by ',
            {
              kind: 'link',
              label: 'public issue limits',
              href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-public-issue-limits',
            },
            '.',
          ],
          'The Security Reporting Policy requires lawful, non-destructive, good-faith testing limited to systems, accounts, files, and data the reporter is authorized to test. A Private Reporting Channel carries a Security Report; testing scope, exploit publication, safe-harbor treatment, third-party access, secret disclosure, and Use of Original Materials remain subject to the License Text and the policy.',
        ],
      },
    ],
    relatedTitles: ['Understanding Public Issue Limits', 'Requesting a Private Security Channel', 'Avoiding Public Exploit Details', 'Reading Security Policy'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Contribution Boundaries',
    title: 'Understanding Contribution Refusal',
    description:
      'Defines that Ludoxel does not accept External Contribution material of any kind, and that a public issue, a pull request, a discussion, a fork, technical availability, or repository visibility creates no contribution invitation, license grant, review obligation, assignment acceptance, joint authorship, or implied consent.',
    sections: [
      {
        id: 'understanding-contribution-refusal-juridical-function',
        title: 'Juridical Function of Contribution Refusal',
        body: [
          'Contribution refusal is the general principle that the Repository is not maintained as an open contribution project and does not accept External Contribution material. It governs the legal status of any externally supplied material proposed for inclusion in, modification of, replacement of, or use with Ludoxel.',
          [
            'The Repository Contribution Policy rejects External Contribution material across public submission routes. Pull-request behavior follows ',
            {
              kind: 'link',
              label: 'pull request boundaries',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-pull-request-boundaries',
            },
            '; the same contribution policy governs every submission route.',
          ],
          'The function of the rule is to foreclose the inference that visibility, platform features, or the act of submitting material create a contribution relationship, a license to the project, or any obligation on the Licensor.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-operative-text',
        title: 'Operative Text',
        body: [
          'The operative sources are the License Text governing External Contributions and the Repository Contribution Policy in `.github/CONTRIBUTING.md`. The License Text states that the Repository is not maintained as an open contribution project, that an External Contribution is not requested and is not accepted through a public pull request, a Public Issue, a discussion, a patch, a website text proposal, or a comparable submission, and that Contribution Materials submitted as an External Contribution are not accepted.',
          [
            'The Contribution Policy reinforces this by stating that an External Contribution is not accepted and that a pull request, or a public submission that proposes Contribution Materials, may be ',
            {
              kind: 'link',
              label: 'closed without review',
              href: '/docs/support/scope-and-closure-support/unsupported-requests/understanding-closure-without-review',
            },
            '. Public GitHub visibility and the GitHub Platform Terms do not grant permission to Use the Original Materials beyond the License.',
          ],
          'These sources are controlling. No subordinate statement, platform affordance, or course of conduct converts the refusal into acceptance.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-materials-not-accepted',
        title: 'Materials Not Accepted',
        body: [
          'The refusal reaches all Contribution Materials, including source code, patches, pull requests, documentation text, website text, replacement text, translations, design assets, images, audio, video, textures, generated files, datasets, feature implementations, refactoring proposals, shader rewrites, saved worlds, reports containing proposed implementation material, legal-text replacement, website redesign, and artificial-intelligence-generated material.',
          'The form of submission does not change the result. Material framed as a fix, an improvement, a translation, or a courtesy is Contribution Materials when it is offered for possible inclusion in, modification of, replacement of, or use with the Original Materials, and it is not accepted.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-no-invitation',
        title: 'No Invitation from Public Surfaces',
        content: [
          {
            kind: 'paragraph',
            text: [
              'No public surface constitutes an invitation to contribute. A public issue, a pull request, a discussion, a fork, technical availability, and ',
              {
                kind: 'link',
                label: 'repository visibility',
                href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
              },
              ' are access and platform conditions, not solicitations of contribution material.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'The ability to open a pull request, post an issue, start a discussion, or create a fork does not create a contribution invitation, a license grant, a review obligation, acceptance of an assignment, joint authorship, or implied consent.',
            },
          },
        ],
      },
      {
        id: 'understanding-contribution-refusal-no-obligation',
        title: 'No Obligation from Submission',
        body: [
          'The License Text provides that submission of an External Contribution does not create any obligation for the Licensor to review, accept, preserve, credit, respond to, incorporate, license, publish, deploy, or return the Contribution Materials. The Licensor’s silence or inaction is not acceptance, and a submission that is left unanswered confers nothing.',
          'A submission leaves the submitter’s rights in Original Materials governed by the License. The Repository Contribution Policy expresses that refusal as a governing repository posture, extending beyond a statement of preference.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-submitter-responsibility',
        title: 'Submitter Responsibility',
        body: [
          'The License Text places responsibility on a person who submits Contribution Materials despite the refusal. That person is solely responsible for ensuring that the submission does not contain confidential information, third-party confidential material, private data, credentials, security-sensitive detail unsuitable for the chosen channel, infringing material, or material that the person lacks authority to submit.',
          'The Repository Contribution Policy leaves responsibility for an improper Contribution Material with its submitter. Licensor review, custody, and remediation duties arise only from an applicable governing source.',
        ],
      },
      {
        id: 'understanding-contribution-refusal-article-boundary',
        title: 'Contribution Refusal and Platform Submission',
        body: [
          [
            '`.github/CONTRIBUTING.md` states that Ludoxel is not maintained as an open contribution project and rejects External Contribution material. The pull-request mechanism follows ',
            {
              kind: 'link',
              label: 'pull request boundaries',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-pull-request-boundaries',
            },
            ', while public issue intake follows ',
            {
              kind: 'link',
              label: 'public issue limits',
              href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-public-issue-limits',
            },
            '.',
          ],
          'The Repository Contribution Policy treats source code, patches, documentation, translations, design assets, generated files, datasets, feature implementations, refactoring proposals, shader rewrites, saved worlds, and artificial-intelligence-generated material as Contribution Materials. Public GitHub affordances remain platform functions; the License Text and contribution policy control invitation, licensing, review, assignment, authorship, and consent.',
        ],
      },
    ],
    relatedTitles: [
      'Understanding Pull Request Boundaries',
      'Understanding Public Issue Limits',
      'Understanding Derivative Work Restrictions',
      'Reading Contribution Policy',
      'Avoiding Feature Requests',
    ],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Contribution Boundaries',
    title: 'Understanding Pull Request Boundaries',
    description:
      'Defines why a pull request is not an accepted contribution path for Ludoxel, why a public pull request may be closed without review, and why the pull-request interface creates no submission permission, review obligation, merge expectation, license amendment, or right to have material considered.',
    sections: [
      {
        id: 'understanding-pull-request-boundaries-juridical-function',
        title: 'Juridical Function of the Pull-Request Boundary',
        body: [
          'A pull request is a hosting-service submission mechanism. `.github/pull_request_template.md` and `.github/CONTRIBUTING.md` classify its material as an External Contribution, and the License Text preserves Maintainer discretion over every response.',
          [
            '`.github/pull_request_template.md` identifies the pull-request submission surface, while the general refusal of External Contribution material appears in ',
            {
              kind: 'link',
              label: 'contribution refusal',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
            },
            '. The GitHub mechanism supplies a technical submission affordance; the License Text and policy determine its legal effect.',
          ],
          'The function of the rule is to prevent the existence of pull-request functionality, and the act of opening a pull request, from being read as submission permission, review entitlement, or an expectation of merge.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-operative-text',
        title: 'Operative Text',
        body: [
          'The operative sources are the License Text governing External Contributions, the Repository Contribution Policy in `.github/CONTRIBUTING.md`, and the Pull Request Policy in `.github/pull_request_template.md`. The License Text states that an External Contribution is not accepted through a public pull request and that submission of an External Contribution does not expand the Licensee’s rights in the Original Materials.',
          'The Pull Request Policy states that the Repository is not an open source project and does not accept an External Contribution, that a pull request may be closed without review, and that submission of a pull request does not grant permission to Use the Original Materials beyond the License. The Contribution Policy is to the same effect.',
          'These sources control the surface. No interface affordance and no subordinate statement converts the ability to open a pull request into an accepted contribution path.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-not-created',
        title: 'What the Pull-Request Surface Does Not Create',
        content: [
          {
            kind: 'paragraph',
            text: 'The pull-request interface is a platform feature. Its availability does not create the legal incidents that an open contribution project would normally imply.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Opening a pull request does not create submission permission, a review obligation, a merge expectation, a license amendment, acceptance of a contribution, or a right to have the submitted material considered.',
            },
          },
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-contents-are-contribution-materials',
        title: 'Pull-Request Contents Are Contribution Materials',
        body: [
          [
            'The contents of a pull request are Contribution Materials. A patch, replacement text, generated file, implementation proposal, asset change, dataset, legal wording, or website source modification carried in a pull request is material offered for possible inclusion in the Original Materials, and is therefore subject to the general ',
            {
              kind: 'link',
              label: 'contribution refusal',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
            },
            '.',
          ],
          [
            'To the extent pull-request contents alter, replace, adapt, translate, restructure, refactor, port, reimplement, or otherwise derive from protected material, they are also Derivative Works within the License Text, and their preparation is governed by the ',
            {
              kind: 'link',
              label: 'derivative-work',
              href: '/docs/legal/use-permissions-and-restrictions/restricted-uses/understanding-derivative-work-restrictions',
            },
            ' restriction. Framing the material as a pull request does not change its character or create acceptance.',
          ],
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-closure-without-review',
        title: 'Closure Without Review',
        body: [
          'A public pull request may be closed without review. The Contribution Policy and the Pull Request Policy state this expressly, and the License Text imposes no obligation on the Licensor to review, accept, preserve, credit, respond to, incorporate, license, publish, deploy, or return the submitted material.',
          'Closure without review is not a defect in handling and does not indicate that the material was evaluated. It is the ordinary consequence of the refusal: the pull-request path is not an accepted contribution path, and a submission through it carries no entitlement to consideration.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-platform-affordance',
        title: 'The Platform Affordance Is Not a Grant',
        body: [
          'The License Text provides that hosting-service features, including a pull request, do not authorize Use of the Original Materials outside the limited grant, and that the GitHub Platform Terms operate only between the hosting service and its users. The capacity of the platform to accept a pull request is a service function, not a grant by the Licensor.',
          'A submitter therefore cannot infer from the operation of the pull-request feature that submission is permitted, that review is owed, that a merge will follow, or that the License has been amended. The interface makes the action technically possible; it does not make it legally authorized or obligatory.',
        ],
      },
      {
        id: 'understanding-pull-request-boundaries-article-boundary',
        title: 'Pull Request Policy and Submission Status',
        body: [
          [
            '`.github/pull_request_template.md` and `.github/CONTRIBUTING.md` classify a pull request as an External Contribution submission. The general ',
            {
              kind: 'link',
              label: 'contribution refusal',
              href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
            },
            ' supplies the governing refusal, while public issue categories, derivative preparation, and redistribution follow their respective policy and License Text provisions.',
          ],
          'A pull request may be closed without review under the Contribution Policy and Pull Request Policy. The GitHub interface provides a technical submission mechanism; the License Text and contribution policy retain authority over permission, review, merge, amendment, and acceptance. Material carried through that mechanism is Contribution Material.',
        ],
      },
    ],
    relatedTitles: [
      'Understanding Contribution Refusal',
      'Understanding Public Issue Limits',
      'Understanding Derivative Work Restrictions',
      'Reading Contribution Policy',
      'Reading Issue Template Boundaries',
      'Avoiding Unauthorized Repository Operations',
    ],
  }),
];
