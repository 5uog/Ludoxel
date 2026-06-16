/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const supportPages: DocsPageContent[] = [
  {
    slug: 'support-overview',
    navigationTitle: 'Support Overview',
    eyebrow: 'Support',
    title: 'Support Overview',
    description: 'What can be reported publicly, what must go through a private channel, and what is not accepted.',
    searchSection: 'Support',
    sections: [
      {
        id: 'channels',
        title: 'Reporting channels',
        body: [
          'Public reporting is limited to three issue forms: a limited problem report, a limited question, and a security contact request. Each form is constrained to its purpose and explicitly excludes contribution material and non-public security details.',
        ],
      },
      {
        id: 'private-security',
        title: 'Private security',
        body: [
          'A suspected security vulnerability requiring non-public detail goes through a private reporting channel, not a public form. When no private channel is available, only a minimal contact request may be opened publicly.',
        ],
      },
      {
        id: 'not-a-contribution-channel',
        title: 'Not a contribution channel',
        body: ['None of these forms accept an External Contribution. They are for bounded reports and limited questions, not for replacement code, documentation, assets, or other submissions.'],
      },
    ],
    references: [
      {
        title: 'Problem Reports',
        href: '/docs/problem-reports',
        description: 'The problem report form.',
      },
      {
        title: 'Security Contact',
        href: '/docs/security-contact',
        description: 'How to request a private channel.',
      },
      {
        title: 'Unsupported Requests',
        href: '/docs/unsupported-requests',
        description: 'What is out of scope.',
      },
    ],
  },
  {
    slug: 'problem-reports',
    navigationTitle: 'Problem Reports',
    eyebrow: 'Support',
    title: 'Problem Reports',
    description: 'The limited problem report form, what it asks for, and the disclosure limits it enforces.',
    searchSection: 'Support',
    sections: [
      {
        id: 'scope',
        title: 'Scope',
        body: [
          'The problem report form is limited to a reproducible, non-security problem in the Current Repository or an Official Distribution. It asks for a summary, reproduction steps, expected behavior, actual behavior, and optional environment details such as the operating system, Python version, PyQt6 version, and GPU or OpenGL details.',
        ],
      },
      {
        id: 'limits',
        title: 'Disclosure limits',
        body: [
          'The form requires acknowledging that the issue must not contain security-sensitive details, non-public reproduction information, or Contribution Materials, and that public platform features do not grant permission to Use the Original Materials. A security-relevant problem follows the Security Reporting Policy instead.',
        ],
      },
      {
        id: 'reproducibility',
        title: 'Reproducibility',
        body: ['A useful report is a reproducible defect report, not a general redesign request. Clear, public, non-sensitive steps make the problem evaluable.'],
      },
    ],
    references: [
      {
        title: 'Useful Report Content',
        href: '/docs/useful-report-content',
        description: 'What makes a report actionable.',
      },
      {
        title: 'Public Issue Boundary',
        href: '/docs/public-issue-boundary',
        description: 'What a public issue may contain.',
      },
      {
        title: 'Security Contact',
        href: '/docs/security-contact',
        description: 'Where security problems go.',
      },
    ],
  },
  {
    slug: 'limited-questions',
    navigationTitle: 'Limited Questions',
    eyebrow: 'Support',
    title: 'Limited Questions',
    description: 'The limited question form and the topics it covers.',
    searchSection: 'Support',
    sections: [
      {
        id: 'scope',
        title: 'Scope',
        body: [
          'The limited question form is for questions about repository policy, the LICENSE, Third-Party Materials, Ordinary Application Use, packaging or build status, or the Security Reporting Policy. It selects a topic and asks the question.',
        ],
      },
      {
        id: 'limits',
        title: 'Limits',
        body: [
          'The form requires acknowledging that the issue must not include Contribution Materials, replacement repository content, implementation proposals, or non-public security information. Public platform features do not grant permission to Use the Original Materials.',
        ],
      },
      {
        id: 'not-feature-requests',
        title: 'Not feature requests',
        body: ['A limited question asks about existing policy or status. It is not a feature request, a roadmap inquiry, or a contribution proposal.'],
      },
    ],
    references: [
      {
        title: 'Support Overview',
        href: '/docs/support-overview',
        description: 'The reporting channels.',
      },
      {
        title: 'Public Issue Boundary',
        href: '/docs/public-issue-boundary',
        description: 'What a public issue may contain.',
      },
      {
        title: 'Unsupported Requests',
        href: '/docs/unsupported-requests',
        description: 'What is out of scope.',
      },
    ],
  },
  {
    slug: 'security-contact',
    navigationTitle: 'Security Contact',
    eyebrow: 'Support',
    title: 'Security Contact',
    description: 'How to reach a private reporting channel for a suspected vulnerability without disclosing details publicly.',
    searchSection: 'Support',
    sections: [
      {
        id: 'private-first',
        title: 'Use a private channel first',
        body: [
          'If GitHub private vulnerability reporting or a security advisory is available for the repository, use that private reporting channel. The security contact form exists only to request a private channel when none is available, and it must not contain vulnerability details.',
        ],
      },
      {
        id: 'minimal-public',
        title: 'Minimal public content',
        body: [
          'The security contact form asks only for a minimal, category-level summary and an optional non-sensitive reply method. It requires acknowledging that no vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, secret logs, or private files are included.',
        ],
      },
      {
        id: 'no-promise',
        title: 'Handling',
        body: [
          "A Security Report may be reviewed, accepted, rejected, or closed at the Maintainer's discretion. No fixed response time, remediation time, disclosure schedule, bounty, or acknowledgement is promised, and reporting does not expand any permission to Use the Original Materials.",
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
        title: 'Security Reporting for Maintainers',
        href: '/docs/security-reporting-for-maintainers',
        description: 'The maintainer-facing policy.',
      },
      {
        title: 'Public Issue Boundary',
        href: '/docs/public-issue-boundary',
        description: 'What stays out of public issues.',
      },
    ],
  },
  {
    slug: 'public-issue-boundary',
    navigationTitle: 'Public Issue Boundary',
    eyebrow: 'Support',
    title: 'Public Issue Boundary',
    description: 'The content that a public issue must never contain.',
    searchSection: 'Support',
    sections: [
      {
        id: 'never-include',
        title: 'Never include',
        body: [
          'A public issue must not contain credentials, tokens, cookies, private local files, exploit code, vulnerability details, third-party confidential material, or material unsuitable for public disclosure. It also must not submit replacement code, replacement documentation, design assets, translations, datasets, or other contribution material.',
        ],
      },
      {
        id: 'screenshots',
        title: 'Screenshots',
        body: [
          'A screenshot can be useful when it shows a visual defect, but it must not include secrets or private local paths. Visual defect reports are clearer when they name the renderer backend.',
        ],
      },
      {
        id: 'why',
        title: 'Why the boundary exists',
        body: [
          'Public disclosure of security-sensitive detail increases risk before review, and contribution material is not accepted. Keeping public issues bounded protects reporters and keeps reports actionable.',
        ],
      },
    ],
    references: [
      {
        title: 'Public Issues',
        href: '/docs/public-issues',
        description: 'The legal definition of a public issue.',
      },
      {
        title: 'Useful Report Content',
        href: '/docs/useful-report-content',
        description: 'What belongs in a report.',
      },
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'The backend a visual report should name.',
      },
    ],
  },
  {
    slug: 'useful-report-content',
    navigationTitle: 'Useful Report Content',
    eyebrow: 'Support',
    title: 'Useful Report Content',
    description: 'What makes a report specific and actionable: a single version, platform, backend, expected and observed behavior, and a reproduction sequence.',
    searchSection: 'Support',
    sections: [
      {
        id: 'specific',
        title: 'Be specific',
        body: [
          'A useful report identifies the affected application area, the play space, the renderer backend when visual output is involved, the build form, the operating system, the exact steps, the observed behavior, the expected behavior, and relevant log text without secrets.',
        ],
      },
      {
        id: 'numerical',
        title: 'Be numerical',
        body: [
          'The strongest reports are numerical and minimal: one affected version or commit if known, one platform, one renderer backend if relevant, one expected behavior, one observed behavior, one reproduction sequence, and minimal supporting evidence.',
        ],
      },
      {
        id: 'backend',
        title: 'Name the backend',
        body: ['Because Ludoxel uses OpenGL on Windows and Linux and wgpu on macOS, a visual defect should name the backend, since parity defects can exist even when gameplay state is correct.'],
      },
    ],
    references: [
      {
        title: 'Problem Reports',
        href: '/docs/problem-reports',
        description: 'The form that asks for this content.',
      },
      {
        title: 'Public Issue Boundary',
        href: '/docs/public-issue-boundary',
        description: 'What to keep out of a report.',
      },
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'The backends to identify.',
      },
    ],
  },
  {
    slug: 'unsupported-requests',
    navigationTitle: 'Unsupported Requests',
    eyebrow: 'Support',
    title: 'Unsupported Requests',
    description: 'Requests that are out of scope: feature requests, contributions, reuse requests, and reports about unofficial copies.',
    searchSection: 'Support',
    sections: [
      {
        id: 'out-of-scope',
        title: 'Out of scope',
        body: [
          'Feature requests, general code quality comments, license objections, reuse requests, reports about unofficial forks or deployments, reports requiring unauthorized access, destructive testing, denial of service, spam, and automated scanner output without a practical impact explanation are outside the supported policy.',
        ],
      },
      {
        id: 'contribution',
        title: 'Contributions',
        body: [
          'External contributions are not accepted. A submission that proposes or includes Contribution Materials may be closed without review. This boundary is consistent with the legal Prohibited Use and the maintainer Contribution Boundary.',
        ],
      },
      {
        id: 'ordinary-use',
        title: 'Ordinary use is not restricted',
        body: [
          'This policy does not restrict Ordinary Application Use, including ordinary play, local saving, ordinary screenshots, and ordinary screen recordings. It governs what may be submitted through public channels, not how the application is used.',
        ],
      },
    ],
    references: [
      {
        title: 'External Contribution Boundary',
        href: '/docs/external-contribution-boundary',
        description: 'Why contributions are not accepted.',
      },
      {
        title: 'Contribution Boundary',
        href: '/docs/contribution-boundary',
        description: 'The maintainer-facing policy.',
      },
      {
        title: 'Ordinary Application Use',
        href: '/docs/ordinary-application-use',
        description: 'The use that is not restricted.',
      },
    ],
  },
];
