/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const supportPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Issue Report Content',
    title: 'Writing a Problem Report',
    description:
      'Explains how to use the limited public problem-report form for reproducible, non-security Ludoxel problems without submitting contribution material or security-sensitive information.',
    sections: [
      {
        id: 'writing-a-problem-report-public-channel-function',
        title: 'Public Channel Function',
        content: [
          {
            kind: 'paragraph',
            text: 'The problem-report form is a public channel for a narrow class of support information: a reproducible, non-security problem in the Current Repository or an Official Distribution of Ludoxel. It is not a feature-request form, a contribution route, a code-review route, a design-proposal route, or a security-disclosure route.',
          },
          {
            kind: 'paragraph',
            text: [
              'The public legal boundary of that surface is controlled by ',
              {
                kind: 'link',
                label: 'public issue limits',
                href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-public-issue-limits',
              },
              '. This Support article does not grant legal permission; it states how to prepare a report that stays inside the configured public form.',
            ],
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Problem-report form identity and public-scope warning.',
            code: `name: Limited problem report
description: Report a reproducible non-security problem without submitting Contribution Materials.
title: '[Problem]: '
body:
  - type: markdown
    attributes:
      value: |
        This public form is limited to reproducible, non-security problems in the Current Repository or an Official Distribution of Ludoxel.

        Do not use this form to submit Contribution Materials, including source code, patches, replacement text, design assets, datasets, generated files, shader rewrites, feature implementations, or refactoring proposals.`,
          },
        ],
      },
      {
        id: 'writing-a-problem-report-required-fields',
        title: 'Required Report Fields',
        content: [
          {
            kind: 'paragraph',
            text: 'A valid public problem report must separate summary, reproduction, expected result, and actual result. The form makes those fields required because a report without that separation cannot be evaluated as a reproducible problem report rather than a general complaint.',
          },
          {
            kind: 'list',
            items: [
              '`Problem summary`: a brief statement of the observed non-security problem.',
              '`Reproduction steps`: public and non-sensitive steps that reproduce the problem.',
              '`Expected behavior`: the result that should have occurred.',
              '`Actual behavior`: the result that actually occurred.',
              '`Environment`: optional platform evidence when the problem depends on operating system, Python, PyQt6, GPU/OpenGL, package path, or build path.',
              '`Additional public context`: optional public and non-sensitive context only when it is needed to understand the problem.',
            ],
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Required problem-report fields from `.github/ISSUE_TEMPLATE/problem-report.yml`.',
            code: `- type: textarea
  id: summary
  attributes:
    label: Problem summary
    description: Describe the observed non-security problem briefly.
  validations:
    required: true

- type: textarea
  id: reproduction
  attributes:
    label: Reproduction steps
    description: Provide only public, non-sensitive steps that reproduce the problem.
  validations:
    required: true

- type: textarea
  id: expected
  attributes:
    label: Expected behavior
  validations:
    required: true

- type: textarea
  id: actual
  attributes:
    label: Actual behavior
  validations:
    required: true`,
          },
        ],
      },
      {
        id: 'writing-a-problem-report-public-exclusions',
        title: 'Public Exclusions',
        content: [
          {
            kind: 'paragraph',
            text: 'The acknowledgement section prevents the report from being used as an indirect submission channel. A report must not contain contribution material, replacement content, implementation proposals, or security-sensitive information. The reporter must narrow the report to public facts about the observed problem.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: [
                'Do not include vulnerability details, exploit steps, proof-of-concept code, credentials, tokens, cookies, logs containing secrets, private local files, third-party confidential information, or other ',
                {
                  kind: 'link',
                  label: 'unsafe public content',
                  href: '/docs/support/security-and-safety-support/public-safety-limits/understanding-unsafe-public-content',
                },
                '.',
              ],
            },
          },
          {
            kind: 'paragraph',
            text: [
              'If the problem may be security-relevant, stop preparing a public problem report and use the private-security path described in ',
              {
                kind: 'link',
                label: 'separating security reports',
                href: '/docs/support/security-and-safety-support/private-security-contact/separating-security-reports-from-problem-reports',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: [
      'Supplying Reproduction Steps',
      'Supplying Platform Evidence',
      'Supplying Logs Without Secrets',
      'Separating Security Reports from Problem Reports',
      'Understanding Public Issue Limits',
    ],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Issue Report Content',
    title: 'Supplying Reproduction Steps',
    description:
      'Explains how to write public, non-sensitive reproduction steps for a Ludoxel problem report without turning the report into a patch proposal, exploit disclosure, or private-data disclosure.',
    sections: [
      {
        id: 'supplying-reproduction-steps-purpose',
        title: 'Purpose of Reproduction Steps',
        content: [
          {
            kind: 'paragraph',
            text: 'Reproduction steps are the operational core of a public problem report. They must let another reader trigger the same observable non-security behavior without requiring private files, credentials, local secrets, exploit material, or access outside the Current Repository or an Official Distribution.',
          },
          {
            kind: 'paragraph',
            text: 'A reproduction section is not a theory of cause. It should not prescribe an implementation change, submit a patch, paste replacement code, or attempt to redesign the affected feature. The support task is to state the public path to the observed behavior.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The configured reproduction field requires public, non-sensitive steps.',
            code: `- type: textarea
  id: reproduction
  attributes:
    label: Reproduction steps
    description: Provide only public, non-sensitive steps that reproduce the problem.
    placeholder: |
      1.
      2.
      3.
  validations:
    required: true`,
          },
        ],
      },
      {
        id: 'supplying-reproduction-steps-sequence',
        title: 'Step Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'Use an ordered list when order changes the result. Each entry should describe one public action or observation. Do not mix the expected result, actual result, environment, and extra logs into the reproduction sequence when the form has separate fields for them.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Name the starting state, such as the screen, mode, route, command, package, or build artifact involved.',
              'Name the visible action taken by the user or the command actually invoked.',
              'State the immediate visible result after the action when that result is needed for the next step.',
              'Stop when the unexpected behavior appears, then put the expected and actual comparison in the required fields.',
            ],
          },
        ],
      },
      {
        id: 'supplying-reproduction-steps-boundary',
        title: 'Boundary of a Public Reproduction',
        content: [
          {
            kind: 'paragraph',
            text: 'A public reproduction is invalid if it depends on material that cannot safely be posted. Do not disclose private local files, personal save data, credentials, access tokens, cookies, private URLs, third-party confidential information, vulnerability mechanisms, or proof-of-concept exploit material.',
          },
          {
            kind: 'paragraph',
            text: [
              'When the reproduction requires security-sensitive detail, the subject belongs to ',
              {
                kind: 'link',
                label: 'private security reporting',
                href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-private-security-reporting',
              },
              ' rather than the public problem-report form.',
            ],
          },
          {
            kind: 'paragraph',
            text: [
              'When the reproduction section becomes a patch, feature implementation, shader rewrite, or replacement text, the subject crosses into ',
              {
                kind: 'link',
                label: 'feature requests',
                href: '/docs/support/scope-and-closure-support/unsupported-requests/avoiding-feature-requests',
              },
              ' and must be removed from the public problem report.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Supplying Platform Evidence', 'Avoiding Public Exploit Details'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Evidence Handling',
    title: 'Supplying Platform Evidence',
    description:
      'Explains the platform and environment evidence that can support a public Ludoxel problem report, including operating system, Python, PyQt6, GPU/OpenGL, and package or build-path details when relevant.',
    sections: [
      {
        id: 'supplying-platform-evidence-field-purpose',
        title: 'Environment Field Purpose',
        content: [
          {
            kind: 'paragraph',
            text: 'The `Environment` field is optional, but it becomes material when the problem depends on runtime platform, build state, package shape, renderer capability, or desktop UI behavior. It should identify the relevant platform facts, not speculate about the cause.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Environment field from the public problem-report template.',
            code: `- type: input
  id: environment
  attributes:
    label: Environment
    description: Operating system, Python version, PyQt6 version, GPU/OpenGL details, or package/build path if relevant.
    placeholder: Windows 11, Python 3.13, PyQt6 6.6, OpenGL 4.3 capable GPU
  validations:
    required: false`,
          },
        ],
      },
      {
        id: 'supplying-platform-evidence-relevant-facts',
        title: 'Relevant Platform Facts',
        content: [
          {
            kind: 'paragraph',
            text: 'Use platform evidence to narrow the report to facts that can affect reproduction. Do not overload the report with unrelated system inventory or private local paths.',
          },
          {
            kind: 'list',
            items: [
              'Operating system and version when the problem appears platform-specific.',
              'Python version when the report concerns local execution, scripts, package behavior, or interpreter-dependent behavior.',
              'PyQt6 version when the report concerns desktop windows, settings overlays, input handling, or UI rendering.',
              'GPU and OpenGL details when the report concerns rendering, frame output, selection outlines, fog, shaders, or GPU capability.',
              'Package or build path when the report concerns a packaged executable, application bundle, local build artifact, or deployment output.',
            ],
          },
        ],
      },
      {
        id: 'supplying-platform-evidence-redaction',
        title: 'Evidence Redaction',
        content: [
          {
            kind: 'paragraph',
            text: 'Platform evidence can itself expose information that should not be public. Local user names, private directory names, access tokens embedded in paths, proprietary machine identifiers, or unrelated private logs must be removed before posting.',
          },
          {
            kind: 'paragraph',
            text: [
              'If platform evidence must be paired with logs, apply the redaction rule in ',
              {
                kind: 'link',
                label: 'logs without secrets',
                href: '/docs/support/public-problem-support/evidence-handling/supplying-logs-without-secrets',
              },
              ' before adding it to a public issue.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Supplying Reproduction Steps', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Evidence Handling',
    title: 'Supplying Logs Without Secrets',
    description:
      'Explains how to use logs and additional public context in Ludoxel support without disclosing credentials, tokens, cookies, private local files, vulnerability details, or other non-public information.',
    sections: [
      {
        id: 'supplying-logs-without-secrets-field-purpose',
        title: 'Additional Public Context',
        content: [
          {
            kind: 'paragraph',
            text: 'The problem-report form allows additional public context only when the context is public, non-sensitive, and necessary to understand the problem. Logs can be useful, but only after they are reduced to lines that are safe to disclose.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Additional public context field from the problem-report template.',
            code: `- type: textarea
  id: additional-context
  attributes:
    label: Additional public context
    description: Add only public, non-sensitive context necessary to understand the problem.
  validations:
    required: false`,
          },
        ],
      },
      {
        id: 'supplying-logs-without-secrets-redaction-sequence',
        title: 'Redaction Sequence',
        content: [
          {
            kind: 'paragraph',
            text: 'Review logs before posting them. A log line can contain information that is outside the public issue scope even when the surrounding problem is non-security.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Remove credentials, API keys, tokens, cookies, session identifiers, and authentication material.',
              'Remove private local files and path fragments that disclose personal, confidential, or unrelated local information.',
              'Remove vulnerability mechanisms, exploit steps, proof-of-concept material, and non-public reproduction information.',
              'Remove third-party confidential information and data obtained from systems, accounts, files, or data the reporter is not authorized to disclose.',
              'Keep only the minimal public log lines needed to explain the observed non-security problem.',
            ],
          },
        ],
      },
      {
        id: 'supplying-logs-without-secrets-security-crossing',
        title: 'Security Crossing',
        content: [
          {
            kind: 'paragraph',
            text: 'A log that contains security-sensitive material is not made public merely because it appears in a non-security problem report. If the unredacted log is necessary to evaluate a suspected vulnerability, the report belongs in a Private Reporting Channel.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: [
                'Do not use public logs to disclose ',
                {
                  kind: 'link',
                  label: 'exploit details',
                  href: '/docs/support/security-and-safety-support/public-safety-limits/avoiding-public-exploit-details',
                },
                ' or secrets. A public issue is not a substitute for private security reporting.',
              ],
            },
          },
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Supplying Platform Evidence', 'Understanding Unsafe Public Content'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Private Security Contact',
    title: 'Requesting a Private Security Channel',
    description:
      'Explains how to request a private reporting route for a suspected Ludoxel vulnerability without publicly disclosing vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, or private reproduction information.',
    sections: [
      {
        id: 'requesting-a-private-security-channel-function',
        title: 'Function of the Public Request',
        content: [
          {
            kind: 'paragraph',
            text: 'The security-contact form is not the Security Report. It is a public request for a Private Reporting Channel when no Private Reporting Channel is available. If GitHub private vulnerability reporting or a GitHub security advisory is available for the repository, the reporter must use that private route instead.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Security-contact form identity and private-channel routing rule.',
            code: `name: Security contact request
description: Request a Private Reporting Channel for a suspected vulnerability. Do not include vulnerability details here.
title: '[Security Contact Request]: '
body:
  - type: markdown
    attributes:
      value: |
        This public form is only for requesting a Private Reporting Channel when no Private Reporting Channel is available for a Security Report.

        If GitHub private vulnerability reporting or a GitHub security advisory is available for this repository, use that Private Reporting Channel instead.`,
          },
        ],
      },
      {
        id: 'requesting-a-private-security-channel-public-content',
        title: 'Permitted Public Content',
        content: [
          {
            kind: 'paragraph',
            text: 'The public request may include only a minimal category-level summary and, optionally, a non-sensitive preferred reply method. It must not include the facts that would make the suspected vulnerability reproducible or exploitable.',
          },
          {
            kind: 'list',
            items: [
              '`Limited public summary`: a category-level statement that a suspected vulnerability affects the Current Repository or an Official Distribution.',
              '`Preferred reply method`: a non-sensitive contact method, such as a GitHub username or email address, only if the reporter chooses to provide it.',
            ],
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Public fields allowed in a security-contact request.',
            code: `- type: textarea
  id: limited-summary
  attributes:
    label: Limited public summary
    description: Provide only a minimal category-level description suitable for a Public Issue.
    placeholder: I would like to report a suspected vulnerability affecting the Current Repository or an Official Distribution.
  validations:
    required: true

- type: input
  id: contact
  attributes:
    label: Preferred reply method
    description: Provide a non-sensitive contact method only if you want to receive a reply outside this Public Issue.
  validations:
    required: false`,
          },
        ],
      },
      {
        id: 'requesting-a-private-security-channel-acknowledgements',
        title: 'Acknowledgements and Testing Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'The acknowledgement section confirms three limits: no non-public security detail is included in the public request; the request does not grant permission beyond the license; and any Security Testing remains lawful, non-destructive, good-faith, and limited to authorized systems, accounts, files, and data.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: [
                'A private-channel request is not a testing authorization and not a security-research safe harbor. The legal boundary is addressed by ',
                {
                  kind: 'link',
                  label: 'private security reporting',
                  href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-private-security-reporting',
                },
                '.',
              ],
            },
          },
        ],
      },
    ],
    relatedTitles: ['Separating Security Reports from Problem Reports', 'Avoiding Public Exploit Details', 'Understanding Private Security Reporting'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Private Security Contact',
    title: 'Separating Security Reports from Problem Reports',
    description: 'Explains the operational difference between a public non-security problem report and a private Security Report for the Current Repository or an Official Distribution.',
    sections: [
      {
        id: 'separating-security-reports-from-problem-reports-channel-test',
        title: 'Channel Test',
        content: [
          {
            kind: 'paragraph',
            text: 'Use the public problem-report form only when the issue is a reproducible, non-security problem that can be described with public, non-sensitive information. Use a Private Reporting Channel when the issue is a suspected vulnerability and evaluation requires non-public technical detail.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'separating-security-reports-from-problem-reports-step-non-security',
                title: 'Classify the issue as non-security before using the problem form.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The public report may contain the problem summary, public reproduction steps, expected behavior, actual behavior, relevant environment, and additional public context.',
                  },
                ],
              },
              {
                id: 'separating-security-reports-from-problem-reports-step-security',
                title: 'Move suspected vulnerabilities to a private route.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'A Security Report may need the affected file, feature, dependency, package, shader, build tool, distribution artifact, reproduction steps necessary for evaluation, expected security impact, and platform details. Those details are not for a public issue.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-security-policy-content',
        title: 'Security Policy Content',
        content: [
          {
            kind: 'paragraph',
            text: 'The Security Reporting Policy states that a Security Report is supported only for the Current Repository and for an Official Distribution. It may concern repository source code, packaging configuration, native extension build configuration, Desktop Distribution material, shader or resource loading, app-managed runtime data handling, or dependency-related security issues when the issue materially affects that supported scope.',
          },
          {
            kind: 'list',
            items: [
              'Older commits, archived copies, forks, mirrors, downloaded copies, modified versions, unofficial deployments, and third-party redistributions are outside the supported security scope.',
              'Security Testing must remain lawful, non-destructive, good-faith, and limited to systems, accounts, files, and data the reporter is authorized to test.',
              'No fixed response time, remediation time, disclosure schedule, bounty, compensation, credit, or public acknowledgement is promised.',
            ],
          },
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-public-stop-rule',
        title: 'Public Stop Rule',
        content: [
          {
            kind: 'paragraph',
            text: 'Stop using a public issue when the report would require vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, logs containing secrets, local user data, save files, private local files, or other non-public reproduction information.',
          },
          {
            kind: 'paragraph',
            text: [
              'When no private route is available, open only the minimal public request described in ',
              {
                kind: 'link',
                label: 'requesting a private security channel',
                href: '/docs/support/security-and-safety-support/private-security-contact/requesting-a-private-security-channel',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Requesting a Private Security Channel', 'Avoiding Public Exploit Details'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Public Safety Limits',
    title: 'Avoiding Public Exploit Details',
    description:
      'Explains why vulnerability mechanisms, exploit steps, proof-of-concept code, sensitive URLs, credentials, and non-public reproduction information must not be posted through public Ludoxel support surfaces.',
    sections: [
      {
        id: 'avoiding-public-exploit-details-public-prohibition',
        title: 'Public Prohibition',
        content: [
          {
            kind: 'paragraph',
            text: 'Public issues, pull requests, discussions, comments, social media posts, and other public channels must not be used to disclose vulnerability detail. Public visibility makes the content unsuitable for security handling and conflicts with the Security Reporting Policy.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Security-contact warning against public vulnerability details.',
            code: `attributes:
  value: |
    Do not disclose vulnerability details, exploit steps, proof-of-concept code, credentials, tokens, cookies, logs containing secrets, private local files, third-party confidential information, or non-public reproduction information in this Public Issue.`,
          },
        ],
      },
      {
        id: 'avoiding-public-exploit-details-excluded-material',
        title: 'Excluded Material',
        content: [
          {
            kind: 'paragraph',
            text: 'The exclusion is not limited to working exploit code. It covers the information needed to make the suspected vulnerability reproducible, actionable, or non-public.',
          },
          {
            kind: 'list',
            items: [
              'Vulnerability mechanisms, exploit procedures, and proof-of-concept code or data.',
              'Sensitive URLs, credentials, tokens, cookies, session identifiers, API keys, and logs containing secrets.',
              'Local user data, save files, private local files, and other non-public reproduction information.',
              'Third-party confidential information or data obtained from systems, accounts, files, or data the reporter is not authorized to access or disclose.',
            ],
          },
        ],
      },
      {
        id: 'avoiding-public-exploit-details-safe-routing',
        title: 'Safe Routing',
        content: [
          {
            kind: 'paragraph',
            text: 'When the suspected vulnerability cannot be evaluated without excluded material, the safe route is a Private Reporting Channel. If no private route is available, the only public act is a minimal request for private contact, with all technical detail omitted.',
          },
          {
            kind: 'paragraph',
            text: [
              'The legal non-expansion rule for that private route is owned by ',
              {
                kind: 'link',
                label: 'private security reporting',
                href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-private-security-reporting',
              },
              '; this Support article states the practical public-posting boundary.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Requesting a Private Security Channel', 'Understanding Unsafe Public Content', 'Understanding Private Security Reporting'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Public Safety Limits',
    title: 'Understanding Unsafe Public Content',
    description:
      'Defines content that must not be placed in public Ludoxel support channels, including security-sensitive detail, secrets, private files, confidential third-party information, contribution material, and unsupported testing material.',
    sections: [
      {
        id: 'understanding-unsafe-public-content-definition',
        title: 'Operational Definition',
        content: [
          {
            kind: 'paragraph',
            text: 'Unsafe public content is any material that the issue templates, contribution policy, or security policy exclude from public support surfaces. The rule applies before the Maintainer considers whether the report is useful.',
          },
          {
            kind: 'paragraph',
            text: 'The public issue tracker accepts narrow public reports and questions. It does not accept secrets, private files, vulnerability detail, contribution material, or requests that require unsupported testing or unauthorized access.',
          },
        ],
      },
      {
        id: 'understanding-unsafe-public-content-categories',
        title: 'Categories of Unsafe Public Content',
        content: [
          {
            kind: 'list',
            items: [
              'Security-sensitive detail: vulnerability mechanisms, exploit steps, proof-of-concept code, sensitive URLs, and non-public reproduction information.',
              'Secrets and authentication material: credentials, API keys, tokens, cookies, session identifiers, and logs containing secrets.',
              'Private or confidential material: private local files, local user data, save files, third-party confidential information, and data the reporter is not authorized to disclose.',
              'Contribution material: source code, patches, replacement text, design assets, datasets, generated files, shader rewrites, feature implementations, refactoring proposals, saved worlds, translations, and artificial-intelligence-generated material submitted for use with Ludoxel.',
              'Unsupported security material: reports requiring unauthorized access, destructive testing, denial of service, spam, social engineering, physical attacks, or automated scanner output without a practical explanation of impact.',
            ],
          },
        ],
      },
      {
        id: 'understanding-unsafe-public-content-result',
        title: 'Routing Result',
        content: [
          {
            kind: 'paragraph',
            text: 'Unsafe public content must be removed from the public issue before submission. When the content is necessary for a suspected vulnerability, use a private security route. When the content is a feature proposal or implementation material, do not submit it through public support.',
          },
          {
            kind: 'paragraph',
            text: [
              'The legal consequence of submitting contribution material despite the refusal belongs to ',
              {
                kind: 'link',
                label: 'contribution refusal',
                href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Supplying Logs Without Secrets', 'Avoiding Public Exploit Details', 'Understanding Contribution Refusal'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Limited Question Scope',
    title: 'Asking a Limited Question',
    description:
      'Explains the limited-question public form for narrow Ludoxel questions about repository policy, the license, Third-Party Materials, Ordinary Application Use, packaging or build status, and the Security Reporting Policy.',
    sections: [
      {
        id: 'asking-a-limited-question-form-purpose',
        title: 'Form Purpose',
        content: [
          {
            kind: 'paragraph',
            text: 'The limited-question form is a public route for narrow repository questions. It is not an unrestricted discussion form and not a route for proposed repository content, implementation proposals, or non-public security information.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Limited-question form identity and public limit.',
            code: `name: Limited question
description: Ask a limited repository question without submitting Contribution Materials.
title: '[Question]: '
body:
  - type: markdown
    attributes:
      value: |
        This public form is limited to questions about repository policy, the LICENSE, Third-Party Materials, Ordinary Application Use, packaging status, or the Security Reporting Policy.`,
          },
        ],
      },
      {
        id: 'asking-a-limited-question-topic-list',
        title: 'Allowed Topics',
        content: [
          {
            kind: 'paragraph',
            text: 'The dropdown restricts the question to a defined topic category. The selected category must match the actual question text; a broad request does not become allowed merely because a narrow option was selected.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'Configured topic options in `.github/ISSUE_TEMPLATE/limited-question.yml`.',
            code: `- type: dropdown
  id: topic
  attributes:
    label: Topic
    options:
      - Repository policy
      - License or Third-Party Materials
      - Ordinary Application Use
      - Packaging or build status
      - Security Reporting Policy
      - Other limited question
  validations:
    required: true`,
          },
          {
            kind: 'paragraph',
            text: [
              'Questions about ordinary use must stay within ordinary use and should not be used to infer broader permission. The legal boundary belongs to ',
              {
                kind: 'link',
                label: 'ordinary application use',
                href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
              },
              '.',
            ],
          },
        ],
      },
      {
        id: 'asking-a-limited-question-exclusions',
        title: 'Question Exclusions',
        content: [
          {
            kind: 'paragraph',
            text: 'The question field must ask the limited question without submitting contribution material, proposed repository content, implementation proposals, or non-public security information. A question that attaches excluded material is outside the form even if its subject appears in the topic dropdown.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: [
                'Do not use a limited question to seek acceptance of patches, replacement text, design assets, generated files, shader rewrites, feature implementations, or refactoring proposals. Those requests are excluded by ',
                {
                  kind: 'link',
                  label: 'feature-request',
                  href: '/docs/support/scope-and-closure-support/unsupported-requests/avoiding-feature-requests',
                },
                ' boundaries.',
              ],
            },
          },
        ],
      },
    ],
    relatedTitles: ['Keeping a Question Within Scope', 'Avoiding Feature Requests', 'Understanding Public Issue Limits'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Limited Question Scope',
    title: 'Keeping a Question Within Scope',
    description: 'Explains how to keep a public limited question inside the topics and exclusions defined by the Ludoxel issue template and repository contribution policy.',
    sections: [
      {
        id: 'keeping-a-question-within-scope-scope-test',
        title: 'Scope Test',
        content: [
          {
            kind: 'paragraph',
            text: 'A limited question stays within scope only when it asks for clarification about an allowed topic and can be answered from public repository policy, license text, third-party-material boundaries, ordinary-use boundaries, packaging or build status, or the Security Reporting Policy.',
          },
          {
            kind: 'paragraph',
            text: 'The form is not a workaround for public contribution refusal. If the body supplies repository replacement material or asks the Maintainer to accept a change, the submission is outside the limited-question route.',
          },
        ],
      },
      {
        id: 'keeping-a-question-within-scope-routing-sequence',
        title: 'Routing Sequence',
        content: [
          {
            kind: 'steps',
            steps: [
              {
                id: 'keeping-a-question-within-scope-routing-question',
                title: 'Confirm that the submission is a question.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The submission should ask what an existing repository policy, license boundary, third-party-material boundary, ordinary-use boundary, packaging status, build status, or security-reporting rule means.',
                  },
                ],
              },
              {
                id: 'keeping-a-question-within-scope-routing-problem',
                title: 'Move reproducible behavior failures to the problem-report form.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'When the submission describes an observed non-security failure with expected and actual behavior, the narrower route is a public problem report.',
                  },
                ],
              },
              {
                id: 'keeping-a-question-within-scope-routing-security',
                title: 'Move vulnerability detail to private security reporting.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'When a useful answer requires vulnerability detail, exploit steps, proof-of-concept material, credentials, private files, or non-public reproduction information, the limited-question form is not the correct public route.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'keeping-a-question-within-scope-excluded-formulations',
        title: 'Excluded Formulations',
        content: [
          {
            kind: 'paragraph',
            text: 'Do not formulate the question as a request to review, accept, merge, rewrite, adopt, publish, deploy, or maintain externally supplied material. Do not include source code, patches, replacement text, documentation rewrites, translations, design assets, generated files, datasets, shader rewrites, saved worlds, or artificial-intelligence-generated material.',
          },
          {
            kind: 'paragraph',
            text: [
              'If the question concerns whether a public support surface creates permission or acceptance, the legal answer is controlled by ',
              {
                kind: 'link',
                label: 'controlling text',
                href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
              },
              ' and not by support routing.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Asking a Limited Question', 'Writing a Problem Report', 'Requesting a Private Security Channel'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Unsupported Requests',
    title: 'Avoiding Feature Requests',
    description:
      'Explains why the Ludoxel public issue forms and contribution policy do not accept feature requests, feature implementations, refactoring proposals, patches, design proposals, or replacement repository content.',
    sections: [
      {
        id: 'avoiding-feature-requests-policy-position',
        title: 'Policy Position',
        content: [
          {
            kind: 'paragraph',
            text: 'Ludoxel is not maintained as a community contribution project. External Contributions are not accepted. The support forms reflect that policy by excluding source code changes, documentation changes, translations, design assets, generated files, datasets, feature implementations, refactoring proposals, shader rewrites, saved worlds, and artificial-intelligence-generated material.',
          },
          {
            kind: 'paragraph',
            text: [
              'The legal rule is stated in ',
              {
                kind: 'link',
                label: 'contribution refusal',
                href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
              },
              '. This Support article explains the practical consequence for public support requests.',
            ],
          },
        ],
      },
      {
        id: 'avoiding-feature-requests-excluded-material',
        title: 'Excluded Request Material',
        content: [
          {
            kind: 'list',
            items: [
              'Feature requests and feature implementations.',
              'Source code changes, patches, refactoring proposals, shader rewrites, and code-review submissions.',
              'Documentation changes, replacement text, translations, website text, and legal-text proposals.',
              'Design assets, images, audio, video, textures, generated files, datasets, saved worlds, and artificial-intelligence-generated material.',
              'Asset submissions, dataset submissions, and design proposals through public issues or pull requests.',
            ],
          },
        ],
      },
      {
        id: 'avoiding-feature-requests-not-a-problem-report',
        title: 'Not a Problem Report',
        content: [
          {
            kind: 'paragraph',
            text: 'A feature request does not become a valid problem report by being attached to a bug description. The public problem-report form may identify observed non-security behavior, but it must not carry the proposed implementation, replacement text, or requested project direction.',
          },
          {
            kind: 'paragraph',
            text: [
              'If the request asks why it may be closed without review, use ',
              {
                kind: 'link',
                label: 'closure without review',
                href: '/docs/support/scope-and-closure-support/unsupported-requests/understanding-closure-without-review',
              },
              ' rather than trying to repackage the request as a limited question.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Asking a Limited Question', 'Understanding Closure Without Review', 'Understanding Unsupported Requests'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Unsupported Requests',
    title: 'Understanding Closure Without Review',
    description:
      'Explains why public issues or pull requests that submit Contribution Materials or fall outside Ludoxel support policy may be closed without review, and why no fixed security response time or remediation schedule is promised.',
    sections: [
      {
        id: 'understanding-closure-without-review-public-submissions',
        title: 'Public Submission Closure',
        content: [
          {
            kind: 'paragraph',
            text: 'The repository contribution policy states that a pull request may be closed without review and that a Public Issue or other public submission proposing or submitting Contribution Materials may also be closed without review. The closure rule applies before technical merit is evaluated.',
          },
          {
            kind: 'paragraph',
            text: 'Closure without review is therefore not a promise that the Maintainer has evaluated the submitted material. It is an application of the repository boundary against unsupported public submissions.',
          },
        ],
      },
      {
        id: 'understanding-closure-without-review-security-handling',
        title: 'Security Handling',
        content: [
          {
            kind: 'paragraph',
            text: 'The Security Reporting Policy states that a Security Report may be reviewed, accepted, rejected, or closed at Maintainer discretion. It also states that no fixed response time, remediation time, disclosure schedule, bounty, compensation, credit, or public acknowledgement is promised.',
          },
          {
            kind: 'paragraph',
            text: 'Do not post vulnerability details publicly in an attempt to force faster review, remediation, acknowledgement, or disclosure. Public security disclosure violates the public-content boundary and does not create a review obligation.',
          },
        ],
      },
      {
        id: 'understanding-closure-without-review-non-effect',
        title: 'Legal Non-Effect',
        content: [
          {
            kind: 'paragraph',
            text: [
              'A public closure, lack of response, delayed response, or public form availability does not grant permission to Use Original Materials and does not accept externally supplied material. That legal consequence belongs to ',
              {
                kind: 'link',
                label: 'contribution refusal',
                href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
              },
              ' and ',
              {
                kind: 'link',
                label: 'repository visibility',
                href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Avoiding Feature Requests', 'Understanding Unsupported Requests', 'Understanding Contribution Refusal'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Unsupported Requests',
    title: 'Understanding Unsupported Requests',
    description:
      'Explains request types outside Ludoxel support scope, including unsupported security reports, feature requests, license objections, reuse requests, unofficial forks or deployments, unauthorized testing, destructive testing, denial of service, spam, and automated scanner output without practical impact.',
    sections: [
      {
        id: 'understanding-unsupported-requests-definition',
        title: 'Unsupported Request Definition',
        content: [
          {
            kind: 'paragraph',
            text: 'An unsupported request is a request that does not fit the public problem-report form, the limited-question form, the minimal security-contact request, the repository contribution policy, or the Security Reporting Policy. The issue tracker is not a residual channel for material excluded from those routes.',
          },
          {
            kind: 'paragraph',
            text: 'Unsupported requests should not be rewritten into another public form unless the actual content can be reduced to that form without prohibited material, non-public security detail, or a request for acceptance of external material.',
          },
        ],
      },
      {
        id: 'understanding-unsupported-requests-categories',
        title: 'Unsupported Categories',
        content: [
          {
            kind: 'list',
            items: [
              'Feature requests, feature implementations, design proposals, replacement text, patches, refactoring proposals, shader rewrites, datasets, saved worlds, and other Contribution Materials.',
              'General code quality comments, broad project-direction comments, and open-ended discussion that are not a limited question or reproducible non-security problem report.',
              'License objections and reuse requests seeking permission or policy change through a public support issue.',
              'Reports about older commits, archived copies, forks, mirrors, downloaded copies, modified versions, unofficial deployments, or other third-party redistributions outside the supported security scope.',
              'Reports requiring unauthorized access, destructive testing, denial of service, spam, social engineering, physical attacks, or automated scanner output without a practical explanation of impact.',
            ],
          },
        ],
      },
      {
        id: 'understanding-unsupported-requests-routing-result',
        title: 'Routing Result',
        content: [
          {
            kind: 'paragraph',
            text: 'The correct result for an unsupported request is exclusion from the public support route, not expansion of the support route. A valid remaining question may be submitted through the limited-question form only when it actually fits that form and contains no prohibited material.',
          },
          {
            kind: 'paragraph',
            text: [
              'A request for permission, relicensing, reuse, or policy change is not resolved by support routing. It must be read against the ',
              {
                kind: 'link',
                label: 'controlling',
                href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
              },
              ' legal text rather than against the existence of a public issue form.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Avoiding Feature Requests', 'Understanding Closure Without Review', 'Understanding Public Issue Limits'],
  }),
];
