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
    description: 'Defines the public problem-report form as a narrow non-security support channel, including required fields, prohibited public content, and the boundary between observable evidence and contribution or security material.',
    sections: [
      {
        id: 'writing-a-problem-report-channel-authority',
        title: 'Public Problem-Report Channel',
        content: [
          {
            kind: 'paragraph',
            text: 'The public problem-report form scopes a single intake route. Its `problem-report.yml` preamble limits the form to a reproducible, non-security problem in the Current Repository or an Official Distribution of Ludoxel, and its required acknowledgement checkboxes make the reporter confirm, before submission, that the issue carries no security-sensitive detail, no non-public reproduction information, and no Contribution Materials. Repository direction, legal objections, design suggestions, implementation proposals, and suspected vulnerabilities each fall to a different governing surface — the LICENSE, the Repository Contribution Policy, or the Security Reporting Policy. The form records an observable defect through a constrained public route.',
          },
          {
            kind: 'paragraph',
            text: [
              'The `problem-report.yml` public intake route must be read together with ',
              {
                kind: 'link',
                label: 'public issue limits',
                href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-public-issue-limits',
              },
              '. The `LICENSE` and Repository Contribution Policy fix permission and acceptance, while `problem-report.yml` supplies the public field structure for a reproducible non-security observation.',
            ],
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The issue form identifies the public route as a limited non-security problem-report channel.',
            code: `name: Limited problem report
description: Report a reproducible non-security problem without submitting Contribution Materials.
title: '[Problem]: '
labels: []
body:
  - type: markdown
    attributes:
      value: |
        This public form is limited to reproducible, non-security problems in the Current Repository or an Official Distribution of Ludoxel.
`,
          },
          {
            kind: 'paragraph',
            text: 'A rendered GitHub form is an intake surface. Under the Repository Contribution Policy a Public Issue that proposes or submits Contribution Materials may be closed without review, and the Security Reporting Policy routes vulnerability material to a private channel. A patch, project redesign, replacement documentation, or vulnerability material entered here reaches no acceptance path. The reporter settles the classification at the outset — public, reproducible, non-security problem — because an incorrect classification leaves the summary, reproduction, expected, and actual fields recording an out-of-route submission.',
          },
          {
            kind: 'paragraph',
            text: '`problem-report.yml` marks the `acknowledgement` checkbox group and the `summary`, `reproduction`, `expected`, and `actual` textareas as required. GitHub blocks submission until those validations pass; the optional `environment` and `additional-context` fields remain available for public, non-sensitive facts that materially affect reproduction. `.github/SECURITY.md` moves vulnerability detail, proof material, credentials, private files, and non-public reproduction information into a Private Reporting Channel, preserving a separate private evaluation route from the public issue record.',
          },
          {
            kind: 'paragraph',
            text: 'The form and policy files divide support evidence by repository surface. `problem-report.yml` admits a required public record of observable non-security behavior; `security-contact.yml` supplies a public request for a private reporting route; `.github/SECURITY.md` governs the security-report channel; and `.github/CONTRIBUTING.md` with `pull_request_template.md` governs the repository response to proposed contribution material. GitHub validation applies the form fields before issue creation, while policy text controls the legal and procedural consequence of the submitted class. A populated public issue records intake through the public form; it supplies neither acceptance, review, incorporation, waiver, nor a private-channel substitute.',
          },
        ],
      },
      {
        id: 'writing-a-problem-report-required-structure',
        title: 'Required Report Structure',
        content: [
          {
            kind: 'paragraph',
            text: 'The required fields separate the report into distinct evidentiary functions. The summary identifies the observed problem. The reproduction field states the public sequence that produces it. The expected and actual fields force the reporter to distinguish normative expectation from observation. That separation produces a report evaluable as a reproducible non-security defect.',
          },
          {
            kind: 'paragraph',
            text: 'Each field carries a distinct evidentiary load, and collapsing them defeats the separation the template enforces. The `reproduction` field records the public action sequence that produces the behavior; the `expected` field records the normative result the reporter relied on; the `actual` field records the build result. Maintainer review owns diagnosis, the Repository Contribution Policy classifies a patch as excluded Contribution Material, and the additional-context field admits public, non-sensitive evidence. The issue closes as a public record of observable behavior; the LICENSE governs any incorporation of supplied material into Ludoxel.',
          },
        ],
      },
      {
        id: 'writing-a-problem-report-excluded-content',
        title: 'Excluded Public Content',
        content: [
          {
            kind: 'paragraph',
            text: 'The acknowledgement section operates as a required public-content gate. Each `checkboxes` option in `problem-report.yml` carries `required: true`, so GitHub withholds submission until the reporter affirms that the issue holds no security-sensitive detail, no non-public reproduction information, and no Contribution Materials, and acknowledges that public GitHub features and the GitHub Platform Terms grant no permission to Use the Original Materials beyond the LICENSE. A submission that still carries prohibited content has crossed out of the permitted problem-report route at that gate, and its defect is one of channel that the remaining fields cannot reclassify.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The acknowledgement section requires the reporter to exclude security-sensitive and contribution material.',
            code: `  - type: checkboxes
    id: acknowledgement
    attributes:
      label: Acknowledgement
      options:
        - label: I understand that this Public Issue must not contain security-sensitive details or non-public reproduction information.
          required: true
        - label: I understand that this Public Issue must not contain Contribution Materials, replacement text, design assets, datasets, generated files, shader rewrites, or implementation proposals.
          required: true
        - label: I understand that public GitHub features and the GitHub Platform Terms do not grant permission to Use the Original Materials beyond the LICENSE.
          required: true`,
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
                '. If the report requires that material, the public problem-report form is the wrong channel.',
              ],
            },
          },
        ],
      },
    ],
    relatedTitles: ['Supplying Reproduction Steps', 'Supplying Platform Evidence', 'Supplying Logs Without Secrets', 'Separating Security Reports from Problem Reports', 'Understanding Public Issue Limits'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Issue Report Content',
    title: 'Supplying Reproduction Steps',
    description: 'Defines reproduction steps as public, non-sensitive evidence for a non-security problem report, and separates reproducible observation from diagnosis, exploit disclosure, private files, and implementation proposals.',
    sections: [
      {
        id: 'supplying-reproduction-steps-evidentiary-function',
        title: 'Evidentiary Function',
        content: [
          {
            kind: 'paragraph',
            text: 'Reproduction steps are the part of the public report that lets another reader reach the same observed behavior from public facts alone, without the reporter’s private machine, private data, or unposted inference. The `reproduction` field description in `problem-report.yml` narrows the input to public, non-sensitive steps that reproduce the problem. Cause analysis is the Maintainer’s work on review, a suggested fix is Contribution Material the Repository Contribution Policy excludes, and a private artifact that would make the report unsafe to publish belongs to the private security route — each held back by a different governing surface, not by a single stylistic preference.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The reproduction field requires only public, non-sensitive steps.',
            code: `  - type: textarea
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
          {
            kind: 'paragraph',
            text: 'A public reproduction draws only on what any reader can see and repeat: the screen, route, mode, command, setting, or visible action involved. The moment it depends on undisclosed local files, account state, credentials, exploit materials, or a patch, it leaves the public, non-sensitive boundary the `reproduction` field sets, and the issue is no longer a clean public problem report.',
          },
        ],
      },
      {
        id: 'supplying-reproduction-steps-order-and-boundary',
        title: 'Ordering and Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'Use an ordered sequence when the behavior depends on order. Each step states a public action or an observable state transition. The expected result and actual result stay out of the step sequence because `problem-report.yml` already binds those claims to the separate required `expected` and `actual` fields; holding the sequence to repeatable observation lets the reproduction read as a path another reader can walk, where mixing in the comparison would turn it into an argument, a complaint, or a hidden diagnosis.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'State the public starting state, such as the page, mode, session, command, setting, or build artifact.',
              'State the user action or command exactly enough for another reader to repeat it.',
              'State any intermediate visible state only when it is necessary for the next step.',
              'Stop the sequence when the unexpected behavior appears, then move the comparison into the expected and actual fields.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The list must remain procedural. Do not insert implementation theories, replacement code, file diffs, shader rewrites, model changes, translations, or other proposed repository material. Those additions convert a reproduction section into an unsupported contribution channel.',
          },
        ],
      },
      {
        id: 'supplying-reproduction-steps-security-stop',
        title: 'Security Stop',
        content: [
          {
            kind: 'paragraph',
            text: 'A reproduction step must not teach a public reader how to exploit a suspected vulnerability. The Security Reporting Policy in `.github/SECURITY.md` keeps vulnerability detail off the Public Issue surface regardless of how cleanly the sequence reproduces, so a sequence that carries a vulnerability mechanism, sensitive URL, proof-of-concept payload, secret-bearing log, private save file, or non-public reproduction condition belongs outside the public problem-report form even when it is the most direct demonstration available.',
          },
          {
            kind: 'paragraph',
            text: [
              'When the reproduction cannot be made public without removing the material that makes the suspected vulnerability understandable, the report must be routed through ',
              {
                kind: 'link',
                label: 'private security reporting',
                href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-private-security-reporting',
              },
              ' or, if no private channel is available, through the minimal public contact request described in Support.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Supplying Platform Evidence', 'Avoiding Public Exploit Details', 'Requesting a Private Security Channel'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Evidence Handling',
    title: 'Supplying Platform Evidence',
    description: 'Defines how platform and environment evidence supports a Ludoxel problem report when operating system, Python, PyQt6, GPU, OpenGL, package state, or build path materially affects reproducibility.',
    sections: [
      {
        id: 'supplying-platform-evidence-purpose',
        title: 'Purpose of Platform Evidence',
        content: [
          {
            kind: 'paragraph',
            text: 'Platform evidence narrows a public report to the environment in which the observed problem can be evaluated. Ludoxel spans desktop execution, Python runtime behavior, PyQt6 UI behavior, GPU-backed rendering, package tooling, and distribution artifacts. A problem that appears only on one platform or build route may be impossible to evaluate without that context.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The problem-report template keeps environment evidence optional but specific.',
            code: `  - type: input
    id: environment
    attributes:
      label: Environment
      description: Operating system, Python version, PyQt6 version, GPU/OpenGL details, or package/build path if relevant.
      placeholder: Windows 11, Python 3.13, PyQt6 6.6, OpenGL 4.3 capable GPU
    validations:
      required: false`,
          },
          {
            kind: 'paragraph',
            text: 'The field is optional because not every support problem is platform-bound. When the problem concerns rendering, packaging, native extensions, desktop UI behavior, input capture, or local runtime execution, omitting the environment can make the report ambiguous. When the problem is purely textual or policy-based, unrelated platform inventory only obscures the report.',
          },
        ],
      },
      {
        id: 'supplying-platform-evidence-relevance',
        title: 'Relevance Standard',
        content: [
          {
            kind: 'paragraph',
            text: 'Supply platform evidence when it can change the technical analysis. The `environment` field carries `required: false`; relevance governs its value. The report names facts that plausibly affect reproduction and omits machine inventory that adds no evaluative value.',
          },
          {
            kind: 'list',
            items: [
              'Operating system and version when behavior differs between desktop platforms.',
              'Python version when local execution, scripts, native extension fallback, or package checks are involved.',
              'PyQt6 version when the problem concerns windows, overlays, input handling, settings, or desktop UI rendering.',
              'GPU and OpenGL capability when the problem concerns world rendering, shaders, selection outlines, fog, frame output, or graphics backend behavior.',
              'Package or build path when the report concerns an executable, bundle, generated distribution artifact, or local build output.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The field collects targeted environment facts, not a local-machine dossier. Private directory names, local user names, proprietary project paths, access tokens, account identifiers, and unrelated logs are removed before the public report is submitted, under the same public, non-sensitive limit that governs the additional-context field.',
          },
        ],
      },
      {
        id: 'supplying-platform-evidence-routing',
        title: 'Evidence Routing',
        content: [
          {
            kind: 'paragraph',
            text: 'Platform evidence remains subject to the same public-content limits as every other part of the report. If the only useful platform evidence contains secrets, private paths, confidential third-party information, or non-public security reproduction detail, it is not public problem-report material. Redact what can safely be redacted; route what cannot.',
          },
          {
            kind: 'paragraph',
            text: [
              'When the supporting evidence is a log, apply the rule in ',
              {
                kind: 'link',
                label: 'logs without secrets',
                href: '/docs/support/public-problem-support/evidence-handling/supplying-logs-without-secrets',
              },
              '. Evidence necessary to evaluate a suspected vulnerability belongs on the private-security route.',
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
    description: 'Defines how logs and additional context may be used in public Ludoxel support only after secrets, private files, vulnerability details, and non-public reproduction information have been removed.',
    sections: [
      {
        id: 'supplying-logs-without-secrets-context-field',
        title: 'Additional Public Context',
        content: [
          {
            kind: 'paragraph',
            text: 'A log enters the public report only after it passes the additional-context limit, which the `additional-context` field states as public, non-sensitive context necessary to understand the problem. Explaining a non-security defect does not by itself clear a log for publication; the reporter filters the excerpt down to the public lines that carry the observable behavior before any of it reaches GitHub.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The additional-context field is limited to public, non-sensitive material.',
            code: `  - type: textarea
    id: additional-context
    attributes:
      label: Additional public context
      description: Add only public, non-sensitive context necessary to understand the problem.
    validations:
      required: false`,
          },
          {
            kind: 'paragraph',
            text: 'The field label — Additional public context — is controlling, and the word public binds the input. The same field that accepts a short explanatory excerpt turns away private files, unredacted trace output, crash dumps containing secrets, vulnerability payloads, and implementation proposals, the last of which the Repository Contribution Policy excludes from any Public Issue.',
          },
        ],
      },
      {
        id: 'supplying-logs-without-secrets-redaction-analysis',
        title: 'Redaction Analysis',
        content: [
          {
            kind: 'paragraph',
            text: 'Redaction is a content test applied line by line. A log line that materially helps is still disallowed when it discloses credentials, tokens, cookies, local private paths, confidential data, or exploit detail, and the public report retains only the minimum log material that identifies the observable non-security problem once unsafe material is gone.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Remove credentials, API keys, access tokens, cookies, session identifiers, and authentication material.',
              'Remove private local files, private directory names, user-specific save data, and unrelated machine identifiers.',
              'Remove vulnerability mechanisms, exploit steps, proof-of-concept payloads, sensitive URLs, and non-public reproduction conditions.',
              'Remove third-party confidential information and data the reporter is not authorized to disclose.',
              'Retain only the shortest public excerpt that materially explains the non-security behavior being reported.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'A redacted log must not be rewritten into a theory of cause. If the log supports the observed behavior, present the relevant public lines and leave implementation analysis to the repository maintainer’s review.',
          },
        ],
      },
      {
        id: 'supplying-logs-without-secrets-security-crossing',
        title: 'Security Crossing',
        content: [
          {
            kind: 'paragraph',
            text: 'If the unredacted log is necessary to show the security impact, the problem has crossed out of the public non-security form. Publishing a redacted fragment that hints at the vulnerability while withholding the decisive detail can also be unsafe if it points public readers toward exploitation.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: [
                'Do not use public logs to disclose or imply ',
                {
                  kind: 'link',
                  label: 'exploit details',
                  href: '/docs/support/security-and-safety-support/public-safety-limits/avoiding-public-exploit-details',
                },
                '. A public report that requires secret-bearing or vulnerability-bearing logs is misrouted.',
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
    description: 'Defines the public security-contact request as a minimal request for private communication, not as a public Security Report or a grant of testing or use permission.',
    sections: [
      {
        id: 'requesting-a-private-security-channel-public-request-function',
        title: 'Public Request Function',
        content: [
          {
            kind: 'paragraph',
            text: 'The security-contact form requests a Private Reporting Channel, while the Security Report itself travels through that private channel once it exists. The `security-contact.yml` preamble limits the form to requesting a private contact method when no Private Reporting Channel is available, and directs the reporter to GitHub private vulnerability reporting or a GitHub security advisory whenever either exists for the repository. Where such a private route exists, the public request form is bypassed and the Security Report goes straight to the private channel.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The security-contact form is expressly limited to requesting a Private Reporting Channel.',
            code: `name: Security contact request
description: Request a Private Reporting Channel for a suspected vulnerability. Do not include vulnerability details here.
title: '[Security Contact Request]: '
labels: []
body:
  - type: markdown
    attributes:
      value: |
        This public form is only for requesting a Private Reporting Channel when no Private Reporting Channel is available for a Security Report.

        If GitHub private vulnerability reporting or a GitHub security advisory is available for this repository, use that Private Reporting Channel instead.`,
          },
          {
            kind: 'paragraph',
            text: [
              'The legal boundary of the private route is handled by ',
              {
                kind: 'link',
                label: 'private security reporting',
                href: '/docs/legal/reporting-and-contributions/public-and-private-reporting/understanding-private-security-reporting',
              },
              '. The `security-contact.yml` public route admits a minimal contact request; `.github/SECURITY.md` places vulnerability detail in the Private Reporting Channel.',
            ],
          },
        ],
      },
      {
        id: 'requesting-a-private-security-channel-allowed-public-fields',
        title: 'Allowed Public Fields',
        content: [
          {
            kind: 'paragraph',
            text: 'The public form permits only a minimal category-level summary and an optional non-sensitive contact method. Those fields are intentionally insufficient to evaluate the vulnerability. Their function is to create a private communication path without placing exploit-enabling information into a public issue.',
          },
          {
            kind: 'paragraph',
            text: 'The limited summary must identify only the broad category of concern and the affected supported scope. It must not identify the vulnerable mechanism, affected private URL, exploit payload, proof of concept, secret-bearing log, private file path, or non-public reproduction path.',
          },
        ],
      },
      {
        id: 'requesting-a-private-security-channel-acknowledgement-boundary',
        title: 'Acknowledgement Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'The acknowledgement checkboxes fix what the request is. All three carry `required: true`, so before submission the reporter affirms that the issue contains no vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, secret-bearing logs, private local files, or other non-public reproduction information; that the request grants no permission to Use the Original Materials beyond the LICENSE; and that any Security Testing stays lawful, non-destructive, good-faith, and limited to systems, accounts, files, and data the reporter is authorized to test. The Security Reporting Policy states the same boundary at its source: Security Testing and the submission of a Security Report do not grant or expand any permission to Use the Original Materials.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The acknowledgement section excludes vulnerability detail and testing overreach.',
            code: `  - type: checkboxes
    id: acknowledgement
    attributes:
      label: Acknowledgement
      options:
        - label: I have not included vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, logs containing secrets, private local files, or other non-public reproduction information in this Public Issue.
          required: true
        - label: I understand that this request does not grant permission to Use the Original Materials beyond the LICENSE.
          required: true
        - label: I understand that any Security Testing must remain lawful, non-destructive, good-faith, and limited to systems, accounts, files, and data that I am authorized to test.
          required: true`,
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
    description: 'Defines the operational classification between a public non-security problem report and a private Security Report for the Current Repository or an Official Distribution.',
    sections: [
      {
        id: 'separating-security-reports-from-problem-reports-classification',
        title: 'Classification Before Submission',
        content: [
          {
            kind: 'paragraph',
            text: 'The first support decision is channel classification. A public problem report is appropriate only when the matter can be described as a reproducible, non-security defect using public and non-sensitive facts. A Security Report is appropriate when the matter is a suspected vulnerability and evaluation may require non-public technical detail.',
          },
          {
            kind: 'steps',
            steps: [
              {
                id: 'separating-security-reports-from-problem-reports-step-public',
                title: 'Use the public problem-report route only for non-security evidence.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The public route may contain a summary, public reproduction steps, expected behavior, actual behavior, relevant environment, and additional public context. It must remain free of security-sensitive detail and Contribution Materials.',
                  },
                ],
              },
              {
                id: 'separating-security-reports-from-problem-reports-step-private',
                title: 'Use a Private Reporting Channel for suspected vulnerability detail.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The private route may receive vulnerability description, necessary reproduction steps, affected files or features, security impact, and relevant platform details when those materials are needed for evaluation and remain within the supported scope.',
                  },
                ],
              },
            ],
          },
          {
            kind: 'paragraph',
            text: 'The classification is made from the content required to evaluate the report, not from the reporter’s preferred label. A submission titled as a bug can still be a Security Report if it requires vulnerability detail, and a submission titled as a security issue can still be unsupported if it falls outside the Security Reporting Policy.',
          },
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-supported-scope',
        title: 'Supported Security Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'The Security Reporting Policy supports reports only for the Current Repository and an Official Distribution. It may cover repository source code, packaging configuration, native extension build configuration, Desktop Distribution material, shader or resource loading, app-managed runtime data handling, or dependency-related security issues when the reported issue materially affects that supported scope.',
          },
          {
            kind: 'list',
            items: [
              'Older commits, archived copies, forks, mirrors, downloaded copies, modified versions, unofficial deployments, and third-party redistributions are outside the supported security scope.',
              'Feature requests, general code-quality comments, license objections, reuse requests, and unofficial deployment concerns are not Security Reports merely because they mention risk.',
              'Reports requiring unauthorized access, destructive testing, denial of service, spam, social engineering, physical attacks, or automated scanner output without practical impact are outside the accepted support path.',
            ],
          },
          {
            kind: 'paragraph',
            text: '`.github/SECURITY.md` supports Security Reports for the Current Repository and Official Distributions, while `problem-report.yml` admits reproducible non-security problems. A report outside both routes is an unsupported request and receives no public-form classification.',
          },
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-public-stop-rule',
        title: 'Public Stop Rule',
        content: [
          {
            kind: 'paragraph',
            text: 'Stop using the public problem-report form when the useful report would require vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, local user data, save files, private local files, or other non-public reproduction information. A public issue that exposes that material creates the very disclosure boundary the security policy forbids.',
          },
          {
            kind: 'paragraph',
            text: [
              'When no private route is available, the correct public act is only the minimal ',
              {
                kind: 'link',
                label: 'request',
                href: '/docs/support/security-and-safety-support/private-security-contact/requesting-a-private-security-channel',
              },
              ' for a Private Reporting Channel. That request must not attempt to prove the vulnerability in public.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Requesting a Private Security Channel', 'Avoiding Public Exploit Details', 'Understanding Unsupported Requests'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Public Safety Limits',
    title: 'Avoiding Public Exploit Details',
    description: 'Defines why vulnerability mechanisms, exploit procedures, proof-of-concept code, sensitive URLs, secrets, and non-public reproduction information must be excluded from public Ludoxel support channels.',
    sections: [
      {
        id: 'avoiding-public-exploit-details-categorical-public-exclusion',
        title: 'Categorical Public Exclusion',
        content: [
          {
            kind: 'paragraph',
            text: 'Exploit detail is excluded from public support channels because public disclosure changes the risk profile of the report. A public issue, pull request, discussion, social post, or comment is readable by parties who are not part of the private evaluation process. The Security Reporting Policy therefore requires suspected vulnerability detail to remain out of public channels.',
          },
          {
            kind: 'paragraph',
            text: 'The exclusion reaches well past complete exploit code. A partial mechanism, a sensitive URL, a targeted payload shape, a secret-bearing stack trace, or a reproduction path involving private files can each be enough on its own to make the public issue unsafe.',
          },
        ],
      },
      {
        id: 'avoiding-public-exploit-details-material-classes',
        title: 'Material Classes',
        content: [
          {
            kind: 'paragraph',
            text: 'The public-posting rule follows content type. A reporter may act in good faith and still publish material assigned to a private channel. The decisive question is whether the material enables, demonstrates, targets, or materially narrows a suspected vulnerability.',
          },
          {
            kind: 'list',
            items: [
              'Vulnerability mechanisms, exploit procedures, proof-of-concept code, payloads, and reproduction data that make the suspected vulnerability actionable.',
              'Sensitive URLs, credentials, tokens, cookies, session identifiers, API keys, and logs containing secrets.',
              'Local user data, save files, private local files, internal paths, and other non-public reproduction information.',
              'Third-party confidential information or data obtained from systems, accounts, files, or data the reporter is not authorized to access or disclose.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Removing the most obvious secret leaves the post unsafe when the remaining text still points public readers to the exploit. The test runs over the public content as a whole: the surrounding mechanism — the payload shape, the targeted path, the secret-bearing trace — must be gone, so a post scrubbed of passwords while still narrowing the vulnerability fails it.',
          },
        ],
      },
      {
        id: 'avoiding-public-exploit-details-route',
        title: 'Correct Route',
        content: [
          {
            kind: 'paragraph',
            text: 'When exploit detail is needed, the correct route is a Private Reporting Channel. If such a channel is unavailable, the public issue may request a private contact method, but it must not include the vulnerability mechanism or the evidence needed to validate it.',
          },
          {
            kind: 'paragraph',
            text: [
              'The operational step is described in ',
              {
                kind: 'link',
                label: 'requesting',
                href: '/docs/support/security-and-safety-support/private-security-contact/requesting-a-private-security-channel',
              },
              ' a Private Reporting Channel. The root `LICENSE` controls permission, while `.github/SECURITY.md` controls the reporting procedure; opening a route request records channel selection and carries no independent permission effect.',
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
    description: 'Defines content that must not be placed in public Ludoxel support channels and states why usefulness, good faith, or public GitHub visibility does not make excluded material acceptable.',
    sections: [
      {
        id: 'understanding-unsafe-public-content-definition',
        title: 'Definition',
        content: [
          {
            kind: 'paragraph',
            text: 'Unsafe public content is material that the repository issue templates, the Security Reporting Policy in `.github/SECURITY.md`, or the Repository Contribution Policy in `.github/CONTRIBUTING.md` exclude from public support surfaces. The classification turns on what a post would disclose: it applies whenever a public post would carry security-sensitive information, private data, Contribution Materials, or unsupported testing material, even when the post is otherwise relevant to Ludoxel.',
          },
          {
            kind: 'paragraph',
            text: 'The public issue tracker is built for the three forms the Repository Contribution Policy admits: a problem report, a limited question, or a request for a Private Reporting Channel for a Security Report. Secrets, private local files, vulnerability mechanisms, proof-of-concept payloads, Contribution Materials, and data obtained from systems the reporter is not authorized to test or disclose fall outside all three and reach no intake path through it.',
          },
        ],
      },
      {
        id: 'understanding-unsafe-public-content-classes',
        title: 'Unsafe Classes',
        content: [
          {
            kind: 'paragraph',
            text: 'The following classes are unsafe because they either expose security risk, disclose private or confidential material, or attempt to use support as an unauthorized intake route. Each is removed from a public submission; presenting it as supporting detail does not change the classification.',
          },
          {
            kind: 'list',
            items: [
              'Security-sensitive detail, including vulnerability mechanisms, exploit steps, proof-of-concept code, sensitive URLs, and non-public reproduction information.',
              'Secrets and authentication material, including credentials, tokens, cookies, session identifiers, API keys, and logs containing secrets.',
              'Private or confidential material, including private local files, local user data, save files, third-party confidential information, and data the reporter is not authorized to disclose.',
              'Contribution Materials, including source code, patches, replacement text, translations, design assets, generated files, datasets, shader rewrites, saved worlds, feature implementations, refactoring proposals, and artificial-intelligence-generated material offered for use with Ludoxel.',
              'Unsupported testing material, including unauthorized access, destructive testing, denial of service, spam, social engineering, physical attacks, and automated scanner output without practical impact analysis.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The public admissibility of a submission is determined before its usefulness is weighed. A technically useful exploit proof, patch, or dataset remains inadmissible if the repository policy excludes that type of public submission.',
          },
        ],
      },
      {
        id: 'understanding-unsafe-public-content-routing-result',
        title: 'Routing Result',
        content: [
          {
            kind: 'paragraph',
            text: 'Unsafe public content must either be removed or moved to the proper private route when a private route is available and appropriate. If removing the unsafe material leaves no meaningful public report, the correct result is not to publish the unsafe version. It is to use the private security process, reduce the submission to a limited public request, or not submit the unsupported material.',
          },
          {
            kind: 'paragraph',
            text: [
              'Contribution Material follows the governing rule in ',
              {
                kind: 'link',
                label: 'contribution refusal',
                href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
              },
              ' and the public issue must not be used as a replacement acceptance route.',
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
    description: 'Defines the limited-question form as a narrow public route for repository-policy, license, third-party-material, ordinary-use, packaging, build-status, and security-reporting questions.',
    sections: [
      {
        id: 'asking-a-limited-question-form-function',
        title: 'Form Function',
        content: [
          {
            kind: 'paragraph',
            text: 'The limited-question form is a public route for narrow questions about existing repository policy and documented boundaries. Its `limited-question.yml` preamble limits the form to questions about repository policy, the LICENSE, Third-Party Materials, Ordinary Application Use, packaging status, or the Security Reporting Policy, and its required acknowledgement makes the asker confirm that the issue carries no Contribution Materials, replacement repository content, or implementation proposals. Proposed repository content, code-review submissions, security disclosures, and demands to change the project’s legal or contribution posture each map to a different governing surface and reach no acceptance path through this question channel.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The limited-question template defines a narrow public question channel.',
            code: `name: Limited question
description: Ask a limited repository question without submitting Contribution Materials.
title: '[Question]: '
labels: []
body:
  - type: markdown
    attributes:
      value: |
        This public form is limited to questions about repository policy, the LICENSE, Third-Party Materials, Ordinary Application Use, packaging status, or the Security Reporting Policy.
`,
          },
          {
            kind: 'paragraph',
            text: 'The issue must remain a question about the existing public materials. A request to accept a patch, rewrite legal text, redesign documentation, implement a feature, review code, evaluate a dataset, or disclose a suspected vulnerability does not become a limited question because it is phrased with a question mark.',
          },
        ],
      },
      {
        id: 'asking-a-limited-question-topic-options',
        title: 'Topic Options',
        content: [
          {
            kind: 'paragraph',
            text: 'The topic dropdown is a routing device. It identifies the kind of limited question being asked and allows the public record to remain within a defined repository-policy subject. The selected topic does not broaden the permissible content of the issue body.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The template restricts the question to enumerated topic classes.',
            code: `  - type: dropdown
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
              'Questions about ordinary use must stay within ',
              {
                kind: 'link',
                label: 'ordinary',
                href: '/docs/legal/use-permissions-and-restrictions/ordinary-use-and-output/understanding-ordinary-application-use',
              },
              ' application use. The limited-question route must not be used to infer redistribution rights, AI-use permission, derivative-work permission, contribution acceptance, or security-disclosure permission.',
            ],
          },
        ],
      },
      {
        id: 'asking-a-limited-question-body-boundary',
        title: 'Question Body Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'The body of the issue must ask the limited question without submitting Contribution Materials, proposed repository content, or non-public security information. The required question field controls the form’s function: it asks for a question, not replacement text, a patch, a proposed policy, or vulnerability reproduction.',
          },
          {
            kind: 'code',
            language: 'yaml',
            caption: 'The question field excludes Contribution Materials and non-public security information.',
            code: `  - type: textarea
    id: question
    attributes:
      label: Question
      description: Ask the limited question without submitting Contribution Materials, proposed repository content, or non-public security information.
    validations:
      required: true`,
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
    description: 'Defines how a limited public question remains inside the repository-policy subjects accepted by the issue template without turning it into a feature request, contribution, public security disclosure, or unsupported demand.',
    sections: [
      {
        id: 'keeping-a-question-within-scope-question-standard',
        title: 'Question Standard',
        content: [
          {
            kind: 'paragraph',
            text: 'A limited question is within scope only when it asks for clarification of an existing public boundary: repository policy, the LICENSE, Third-Party Materials, Ordinary Application Use, packaging or build status, the Security Reporting Policy, or another comparably limited public question. The question must be answerable without reviewing proposed replacement material or receiving non-public detail.',
          },
          {
            kind: 'paragraph',
            text: 'Scope follows the content a question demands, and tone leaves that content unchanged. A polite feature request, a careful patch proposal, a detailed vulnerability proof, or a legal objection framed as a question still falls outside the limited-question route when it demands action or carries material the `limited-question.yml` acknowledgement excludes.',
          },
        ],
      },
      {
        id: 'keeping-a-question-within-scope-routing-analysis',
        title: 'Routing Analysis',
        content: [
          {
            kind: 'steps',
            steps: [
              {
                id: 'keeping-a-question-within-scope-step-existing-boundary',
                title: 'Ask about an existing public boundary.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'The issue may ask what an existing policy, license boundary, third-party-material boundary, ordinary-use boundary, packaging status, build status, or security-reporting rule means.',
                  },
                ],
              },
              {
                id: 'keeping-a-question-within-scope-step-problem-report',
                title: 'Use the problem-report route for observed non-security behavior.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'If the submission describes a reproducible non-security defect with expected and actual behavior, the problem-report template is the narrower public route.',
                  },
                ],
              },
              {
                id: 'keeping-a-question-within-scope-step-security',
                title: 'Use a private route for suspected vulnerability detail.',
                content: [
                  {
                    kind: 'paragraph',
                    text: 'If a useful answer requires exploit detail, proof-of-concept material, secrets, private files, or non-public reproduction information, the limited-question form must not be used.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'keeping-a-question-within-scope-exclusions',
        title: 'Exclusions',
        content: [
          {
            kind: 'paragraph',
            text: 'Do not submit source code, patches, documentation rewrites, translations, design assets, generated files, datasets, shader rewrites, saved worlds, artificial-intelligence-generated material, feature implementations, refactoring proposals, or legal replacement text through a limited question. Those materials are not made admissible by adding a request for comment.',
          },
          {
            kind: 'paragraph',
            text: [
              'If the question asks whether public GitHub visibility, issue forms, pull request affordances, or platform terms create permission, the answer belongs to ',
              {
                kind: 'link',
                label: 'controlling',
                href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
              },
              ' legal text; a support form cannot alter that rule.',
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
    description: 'Defines why Ludoxel public support forms do not accept feature requests, feature implementations, patches, refactoring proposals, design submissions, or replacement repository content.',
    sections: [
      {
        id: 'avoiding-feature-requests-contribution-boundary',
        title: 'Contribution Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'Ludoxel’s repository policy places the repository outside open contribution maintenance and rejects External Contributions. That rule controls public support practice. A public issue form cannot be used to solicit, review, accept, or preserve a feature request or implementation proposal that the repository policy excludes.',
          },
          {
            kind: 'paragraph',
            text: [
              'The legal consequence is described in ',
              {
                kind: 'link',
                label: 'contribution refusal',
                href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
              },
              '. Public issue forms admit reproducible non-security problems, limited questions, and minimal private-contact requests. Feature material remains Contribution Material under `.github/CONTRIBUTING.md` and falls outside those public intake routes.',
            ],
          },
        ],
      },
      {
        id: 'avoiding-feature-requests-excluded-content',
        title: 'Excluded Content',
        content: [
          {
            kind: 'paragraph',
            text: 'The exclusion is broader than pull requests. It covers the materials by which an external party attempts to shape Ludoxel’s source, documentation, assets, data, design, distribution, or legal text. The form of the submission does not change its character.',
          },
          {
            kind: 'list',
            items: [
              'Feature requests and feature implementations.',
              'Pull requests, source code changes, patches, refactoring proposals, shader rewrites, and code-review submissions.',
              'Documentation changes, replacement text, website text, translations, and legal-text proposals.',
              'Design assets, images, audio, video, textures, generated files, datasets, saved worlds, and artificial-intelligence-generated material.',
              'Asset submissions, dataset submissions, design proposals, and implementation plans submitted through issues, comments, or pull requests.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'A technically coherent proposal remains excluded. Public support may identify a reproducible non-security defect or ask a limited question, but it does not become a planning process for external improvements.',
          },
        ],
      },
      {
        id: 'avoiding-feature-requests-not-a-bug-report',
        title: 'Not a Bug Report',
        content: [
          {
            kind: 'paragraph',
            text: 'A feature request must not be attached to an observed problem as the proposed remedy. The problem-report form may state what happened, how to reproduce it, what was expected, and what actually occurred. It must not include the requested implementation, replacement behavior, source patch, or project-direction demand.',
          },
          {
            kind: 'paragraph',
            text: [
              'If the issue is closed because it contains excluded material, the support consequence is addressed in ',
              {
                kind: 'link',
                label: 'closure',
                href: '/docs/support/scope-and-closure-support/unsupported-requests/understanding-closure-without-review',
              },
              ' without review. Resubmitting the same material under a different public form does not change the repository boundary.',
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
    description: 'Defines closure without review as an enforcement of repository support and contribution boundaries, not as technical evaluation, legal acceptance, remediation commitment, or permission.',
    sections: [
      {
        id: 'understanding-closure-without-review-public-submission-boundary',
        title: 'Public Submission Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'Closure without review is a procedural consequence of an excluded public submission. The Contribution Policy states that a pull request may be closed without review and that a Public Issue or other public submission proposing or submitting Contribution Materials may also be closed without review. The decisive point is the submission’s category, not its quality.',
          },
          {
            kind: 'paragraph',
            text: 'A closed issue therefore must not be read as a technical rejection after review, an implied acceptance of safe content, or a negotiation over scope. The repository may refuse to evaluate material that the public route is not designed to receive.',
          },
        ],
      },
      {
        id: 'understanding-closure-without-review-security-discretion',
        title: 'Security Handling Discretion',
        content: [
          {
            kind: 'paragraph',
            text: 'The Security Reporting Policy separately states that a Security Report may be reviewed, accepted, rejected, or closed at Maintainer discretion. It also states that no fixed response time, remediation time, disclosure schedule, bounty, compensation, credit, or public acknowledgement is promised. Those limits prevent the private security route from being converted into a service-level obligation.',
          },
          {
            kind: 'paragraph',
            text: 'Posting vulnerability material publicly to force a response violates the public-content boundary in `.github/SECURITY.md`. The Security Reporting Policy promises no fixed response or remediation time, so public disclosure leaves the Maintainer’s discretion intact, exposes the vulnerability to readers outside the private evaluation process, and keeps the excluded material outside any supported route — the pressure shifts the risk, not the obligation.',
          },
        ],
      },
      {
        id: 'understanding-closure-without-review-legal-non-effect',
        title: 'Legal Non-Effect',
        content: [
          {
            kind: 'paragraph',
            text: 'The controlling legal and policy text fixes what these procedural events mean. Under the Repository Contribution Policy and the LICENSE, closure without review, silence, a delayed response, and the mere availability of a GitHub form are repository mechanics: each leaves the permission to Use the Original Materials where the LICENSE sets it, accepts no externally supplied material, amends no License Text, and waives no repository policy. Public GitHub features sit beneath that controlling text, and the GitHub Platform Terms do not expand the Licensor’s permissions for the Original Materials.',
          },
          {
            kind: 'paragraph',
            text: [
              'The legal analysis of non-acceptance is handled by ',
              {
                kind: 'link',
                label: 'contribution refusal',
                href: '/docs/legal/reporting-and-contributions/contribution-boundaries/understanding-contribution-refusal',
              },
              ' and the visibility analysis is handled by ',
              {
                kind: 'link',
                label: 'repository visibility',
                href: '/docs/legal/license-authority-and-materials/material-scope/understanding-repository-visibility',
              },
              '. The issue form and Repository Contribution Policy define the resulting public closure route.',
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
    description: 'Defines request categories outside Ludoxel support scope and why unsupported material cannot be made acceptable by relabeling it as a problem report, limited question, or security contact request.',
    sections: [
      {
        id: 'understanding-unsupported-requests-definition',
        title: 'Unsupported Request Definition',
        content: [
          {
            kind: 'paragraph',
            text: 'An unsupported request is a public or private submission that fits none of the admitted routes: the problem-report form, the limited-question form, the minimal security-contact request, the Public Issue types the Repository Contribution Policy accepts, or the supported scope of the Security Reporting Policy. Each of those sources enumerates what it receives, so a submission outside all of them reaches the support system with no route to land on.',
          },
          {
            kind: 'paragraph',
            text: 'Admissibility turns on whether the request fits an authorized support route without carrying prohibited content, and a broad connection to Ludoxel does not satisfy that test on its own. A submission that fits no route resolves by exclusion, and the public issue tracker does not widen to absorb it.',
          },
        ],
      },
      {
        id: 'understanding-unsupported-requests-classes',
        title: 'Unsupported Classes',
        content: [
          {
            kind: 'paragraph',
            text: 'Unsupported requests include both contribution-like submissions and security reports outside the supported scope. They also include demands that ask the repository to provide legal permission, project direction, release status, support obligations, or review obligations through a public issue.',
          },
          {
            kind: 'list',
            items: [
              'Feature requests, feature implementations, patches, replacement text, design proposals, refactoring proposals, shader rewrites, datasets, generated files, saved worlds, and other Contribution Materials.',
              'General code-quality comments, broad project-direction comments, and open-ended discussion that are not limited questions or reproducible non-security problem reports.',
              'License objections, reuse requests, relicensing requests, and permission requests presented as support issues.',
              'Reports about older commits, archived copies, forks, mirrors, downloaded copies, modified versions, unofficial deployments, or third-party redistributions outside the supported security scope.',
              'Reports requiring unauthorized access, destructive testing, denial of service, spam, social engineering, physical attacks, or automated scanner output without practical impact explanation.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'A request may be unsupported even when it is technically sophisticated. Support admissibility depends on the repository’s defined routes and prohibited content, not on the amount of work invested in the submission.',
          },
        ],
      },
      {
        id: 'understanding-unsupported-requests-routing-result',
        title: 'Routing Result',
        content: [
          {
            kind: 'paragraph',
            text: 'Unsupported material must not be refiled until it has been reduced to a valid support form. If the remaining content is a public non-security defect, use the problem-report route. If it is a narrow question about existing public policy, use the limited-question route. If it is a suspected vulnerability requiring non-public detail and within supported scope, use a Private Reporting Channel.',
          },
          {
            kind: 'paragraph',
            text: [
              'If the request is really an attempt to obtain permission, alter the LICENSE, expand support scope, compel review, or use public platform visibility as a source of rights, the answer must be read against the ',
              {
                kind: 'link',
                label: 'controlling',
                href: '/docs/legal/license-authority-and-materials/authority-text/understanding-controlling-text',
              },
              ' legal text. The presence of a public support surface carries no separate legal effect.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Avoiding Feature Requests', 'Understanding Closure Without Review', 'Understanding Public Issue Limits'],
  }),
];
