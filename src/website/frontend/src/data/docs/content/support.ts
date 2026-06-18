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
      'Explains how to write a public non-security problem report for Ludoxel. This page treats support routing as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'writing-a-problem-report-support-scope',
        title: 'Problem Report Support Scope',
        body: [
          'A problem report should describe a reproducible, non-security problem in the current repository or an official distribution. Keep the topic public and specific. The point matters in support scope because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Support Scope.',
          'Support Scope defines the useful size of Writing a Problem Report. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'Writing a Problem Report should not use support scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-a-problem-report-channel-choice',
        title: 'Problem Report Channel Choice',
        body: [
          'Support Scope defines the useful size of Writing a Problem Report. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. In Writing a Problem Report, channel choice is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Channel Choice.',
          'A direct observation for Writing a Problem Report should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'Writing a Problem Report should not use channel choice to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-a-problem-report-public-report',
        title: 'Problem Report Public Report',
        body: [
          'Writing a Problem Report should not use support scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in public report because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Public Report.',
          'Writing a Problem Report separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'Writing a Problem Report should not use public report to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-a-problem-report-reproduction',
        title: 'Problem Report Reproduction',
        body: [
          'Writing a Problem Report should be read as report writing for a problem report within Public Problem Support and Issue Report Content. In Writing a Problem Report, channel choice is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Channel Choice. The fact also tells the reader which evidence to preserve for reproduction: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Reproduction.',
          'Ownership in Writing a Problem Report is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'A public report based on the reproduction part of Writing a Problem Report should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'writing-a-problem-report-platform-evidence',
        title: 'Problem Report Platform Evidence',
        body: [
          'A direct observation for Writing a Problem Report should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for platform evidence: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Platform Evidence.',
          'Visible feedback for Writing a Problem Report should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Public Problem Support / Issue Report Content.',
          'A public report based on the platform evidence part of Writing a Problem Report should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'writing-a-problem-report-log-handling',
        title: 'Problem Report Log Handling',
        body: [
          'Writing a Problem Report should not use channel choice to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Writing a Problem Report, that fact identifies the first concrete boundary for log handling: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Log Handling.',
          'When Writing a Problem Report touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the log handling part of Writing a Problem Report should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'writing-a-problem-report-security-routing',
        title: 'Problem Report Security Routing',
        body: [
          'Useful reports include a brief summary, public reproduction steps, expected behavior, actual behavior, and relevant environment details such as OS, Python, PyQt6, GPU, or package path. The fact also tells the reader which evidence to preserve for security routing: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Security Routing.',
          'The surrounding context for Writing a Problem Report decides which adjacent topic is relevant. Writing a Problem Report should be compared with Supplying Reproduction Steps, Supplying Platform Evidence, Understanding Public Issue Limits only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the security routing part of Writing a Problem Report should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'writing-a-problem-report-unsafe-details',
        title: 'Problem Report Unsafe Details',
        body: [
          'Writing a Problem Report separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. That reading gives Writing a Problem Report a public anchor for unsafe details without adding behavior that the current category does not own. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Unsafe Details.',
          'Recovery or follow-up for Writing a Problem Report should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for unsafe details does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Writing a Problem Report should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'writing-a-problem-report-limited-question',
        title: 'Problem Report Limited Question',
        body: [
          'Writing a Problem Report should not use public report to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Writing a Problem Report, that fact identifies the first concrete boundary for limited question: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Limited Question.',
          'The main confusion risk in Writing a Problem Report is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Writing a Problem Report crosses from limited question into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'writing-a-problem-report-unsupported-request',
        title: 'Problem Report Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Writing a Problem Report, unsupported request is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Unsupported Request.',
          'Reportable evidence for Writing a Problem Report should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Writing a Problem Report should not use unsupported request to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-a-problem-report-closure-reading',
        title: 'Problem Report Closure Reading',
        body: [
          'Ownership in Writing a Problem Report is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. In Writing a Problem Report, closure reading is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Closure Reading.',
          'Adjacent pages matter for Writing a Problem Report, but adjacency does not move authority. Writing a Problem Report should be compared with Supplying Reproduction Steps, Supplying Platform Evidence, Understanding Public Issue Limits only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Writing a Problem Report should not use closure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-a-problem-report-privacy',
        title: 'Problem Report Privacy',
        body: [
          'A public report based on the reproduction part of Writing a Problem Report should state the action, expected result, actual result, environment, and any redaction needed before sharing. For Writing a Problem Report, that fact identifies the first concrete boundary for privacy: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Privacy.',
          'The public boundary for Writing a Problem Report is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Writing a Problem Report crosses from privacy into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'writing-a-problem-report-related-support',
        title: 'Problem Report Related Support',
        body: [
          'Do not include vulnerability details, secrets, private files, contribution material, replacement text, generated files, datasets, or implementation proposals in the public report. Writing a Problem Report uses the fact as related support evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Related Support.',
          'An operator reading Writing a Problem Report should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'When Writing a Problem Report crosses from related support into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'writing-a-problem-report-legal-limit',
        title: 'Problem Report Policy Limit',
        body: [
          'Visible feedback for Writing a Problem Report should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Public Problem Support / Issue Report Content. In Writing a Problem Report, policy limit is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Policy Limit.',
          'Implementation limits for Writing a Problem Report keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Writing a Problem Report should not use policy limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-a-problem-report-reporter-summary',
        title: 'Problem Report Reporter Summary',
        body: [
          'A problem report should describe a reproducible, non-security problem in the current repository or an official distribution. Keep the topic public and specific. The point matters in reporter summary because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Reporter Summary.',
          'The summary value of Writing a Problem Report is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Writing a Problem Report should not use reporter summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-a-problem-report-closing-check',
        title: 'Problem Report Closing Check',
        body: [
          'Support Scope defines the useful size of Writing a Problem Report. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. Writing a Problem Report uses the fact as closing check evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Writing a Problem Report / Public Problem Support / Issue Report Content / Closing Check.',
          'A final check for Writing a Problem Report should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Writing a Problem Report crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Supplying Reproduction Steps', 'Supplying Platform Evidence', 'Understanding Public Issue Limits'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Issue Report Content',
    title: 'Supplying Reproduction Steps',
    description:
      'Explains how to provide useful, public steps for a Ludoxel problem report. This page treats support routing as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'supplying-reproduction-steps-support-scope',
        title: 'Reproduction Steps Support Scope',
        body: [
          'Reproduction steps should be ordered, repeatable, and short enough for another person to follow. Include the play space, mode, settings, and visible action that triggers the behavior. In Supplying Reproduction Steps, support scope is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Support Scope. In Supplying Reproduction Steps, support scope is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Support Scope.',
          'Support Scope defines the useful size of Supplying Reproduction Steps. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'If the available evidence for support scope does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Reproduction Steps should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-channel-choice',
        title: 'Reproduction Steps Channel Choice',
        body: [
          'Support Scope defines the useful size of Supplying Reproduction Steps. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. That reading gives Supplying Reproduction Steps a public anchor for channel choice without adding behavior that the current category does not own. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Channel Choice.',
          'A direct observation for Supplying Reproduction Steps should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'If the available evidence for channel choice does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Reproduction Steps should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-public-report',
        title: 'Reproduction Steps Public Report',
        body: [
          'If the available evidence for support scope does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Reproduction Steps should be treated as an observation rather than a confirmed cause. That reading gives Supplying Reproduction Steps a public anchor for public report without adding behavior that the current category does not own. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Public Report.',
          'Supplying Reproduction Steps separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'The useful result of Supplying Reproduction Steps public report is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Issue Report Content.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-reproduction',
        title: 'Reproduction Steps Reproduction',
        body: [
          'Supplying Reproduction Steps should be read as evidence handling for reproduction steps within Public Problem Support and Issue Report Content. The fact also tells the reader which evidence to preserve for reproduction: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Reproduction.',
          'Ownership in Supplying Reproduction Steps is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'A public report based on the reproduction part of Supplying Reproduction Steps should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-platform-evidence',
        title: 'Reproduction Steps Platform Evidence',
        body: [
          'A direct observation for Supplying Reproduction Steps should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. Supplying Reproduction Steps uses the fact as platform evidence evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Platform Evidence.',
          'Visible feedback for Supplying Reproduction Steps should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Public Problem Support / Issue Report Content.',
          'Use platform evidence to keep Supplying Reproduction Steps tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-log-handling',
        title: 'Reproduction Steps Log Handling',
        body: [
          'If the available evidence for channel choice does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Reproduction Steps should be treated as an observation rather than a confirmed cause. For Supplying Reproduction Steps, that fact identifies the first concrete boundary for log handling: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Log Handling.',
          'When Supplying Reproduction Steps touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the log handling part of Supplying Reproduction Steps should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-security-routing',
        title: 'Reproduction Steps Security Routing',
        body: [
          'Steps should not require private save files, credentials, secret logs, exploit details, or non-public data. Replace sensitive details with safe descriptions. The fact also tells the reader which evidence to preserve for security routing: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Security Routing.',
          'The surrounding context for Supplying Reproduction Steps decides which adjacent topic is relevant. Supplying Reproduction Steps should be compared with Writing a Problem Report, Supplying Platform Evidence, Supplying Logs Without Secrets only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the security routing part of Supplying Reproduction Steps should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-unsafe-details',
        title: 'Reproduction Steps Unsafe Details',
        body: [
          'Supplying Reproduction Steps separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. That reading gives Supplying Reproduction Steps a public anchor for unsafe details without adding behavior that the current category does not own. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Unsafe Details.',
          'Recovery or follow-up for Supplying Reproduction Steps should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for unsafe details does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Reproduction Steps should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-limited-question',
        title: 'Reproduction Steps Limited Question',
        body: [
          'The useful result of Supplying Reproduction Steps public report is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Issue Report Content. The fact also tells the reader which evidence to preserve for limited question: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Limited Question.',
          'The main confusion risk in Supplying Reproduction Steps is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the limited question part of Supplying Reproduction Steps should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-unsupported-request',
        title: 'Reproduction Steps Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Supplying Reproduction Steps, unsupported request is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Unsupported Request.',
          'Reportable evidence for Supplying Reproduction Steps should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Supplying Reproduction Steps should not use unsupported request to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-closure-reading',
        title: 'Reproduction Steps Closure Reading',
        body: [
          'Ownership in Supplying Reproduction Steps is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. In Supplying Reproduction Steps, closure reading is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Closure Reading.',
          'Adjacent pages matter for Supplying Reproduction Steps, but adjacency does not move authority. Supplying Reproduction Steps should be compared with Writing a Problem Report, Supplying Platform Evidence, Supplying Logs Without Secrets only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Supplying Reproduction Steps should not use closure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-privacy',
        title: 'Reproduction Steps Privacy',
        body: [
          'A public report based on the reproduction part of Supplying Reproduction Steps should state the action, expected result, actual result, environment, and any redaction needed before sharing. For Supplying Reproduction Steps, that fact identifies the first concrete boundary for privacy: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Privacy.',
          'The public boundary for Supplying Reproduction Steps is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Supplying Reproduction Steps crosses from privacy into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-related-support',
        title: 'Reproduction Steps Related Support',
        body: [
          'Pair the steps with what should happen and what actually happens. That distinction is more useful than broad statements that the application is broken. Supplying Reproduction Steps uses the fact as platform evidence evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Platform Evidence. The fact also tells the reader which evidence to preserve for related support: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Related Support.',
          'An operator reading Supplying Reproduction Steps should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'Use related support to keep Supplying Reproduction Steps tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-legal-limit',
        title: 'Reproduction Steps Policy Limit',
        body: [
          'Visible feedback for Supplying Reproduction Steps should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Public Problem Support / Issue Report Content. The point matters in policy limit because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Policy Limit.',
          'Implementation limits for Supplying Reproduction Steps keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Supplying Reproduction Steps policy limit is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Issue Report Content.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-reporter-summary',
        title: 'Reproduction Steps Reporter Summary',
        body: [
          'Reproduction steps should be ordered, repeatable, and short enough for another person to follow. Include the play space, mode, settings, and visible action that triggers the behavior. In Supplying Reproduction Steps, support scope is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Support Scope. The point matters in reporter summary because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Reporter Summary.',
          'The summary value of Supplying Reproduction Steps is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Supplying Reproduction Steps should not use reporter summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'supplying-reproduction-steps-closing-check',
        title: 'Reproduction Steps Closing Check',
        body: [
          'Support Scope defines the useful size of Supplying Reproduction Steps. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. Supplying Reproduction Steps uses the fact as closing check evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Supplying Reproduction Steps / Public Problem Support / Issue Report Content / Closing Check.',
          'A final check for Supplying Reproduction Steps should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Supplying Reproduction Steps crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Supplying Platform Evidence', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Evidence Handling',
    title: 'Supplying Platform Evidence',
    description:
      'Explains which environment details help diagnose Ludoxel behavior. This page treats platform evidence as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'supplying-platform-evidence-support-scope',
        title: 'Platform Evidence Support Scope',
        body: [
          'Useful platform evidence can include operating system, Python version, PyQt6 version, GPU or renderer information, OpenGL or WGPU path, package path, and build path. For Supplying Platform Evidence, that fact identifies the first concrete boundary for support scope: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Support Scope.',
          'Support Scope defines the useful size of Supplying Platform Evidence. The article should be broad enough to explain platform evidence, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion.',
          'When Supplying Platform Evidence crosses from support scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'supplying-platform-evidence-channel-choice',
        title: 'Platform Evidence Channel Choice',
        body: [
          'Support Scope defines the useful size of Supplying Platform Evidence. The article should be broad enough to explain platform evidence, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. Supplying Platform Evidence uses the fact as channel choice evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Channel Choice.',
          'A direct observation for Supplying Platform Evidence should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'Use channel choice to keep Supplying Platform Evidence tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-platform-evidence-public-report',
        title: 'Platform Evidence Public Report',
        body: [
          'When Supplying Platform Evidence crosses from support scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Supplying Platform Evidence, that fact identifies the first concrete boundary for public report: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Public Report.',
          'Supplying Platform Evidence separates the surface that accepts input from the component or document that controls the result. This is especially important when reading platform evidence in its documented category crosses a saved value, a renderer output, or a public form.',
          'When Supplying Platform Evidence crosses from public report into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'supplying-platform-evidence-reproduction',
        title: 'Platform Evidence Reproduction',
        body: [
          'Supplying Platform Evidence should be read as evidence handling for platform evidence within Public Problem Support and Evidence Handling. Supplying Platform Evidence uses the fact as channel choice evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Channel Choice. In Supplying Platform Evidence, reproduction is the difference between reading platform evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Reproduction.',
          'Ownership in Supplying Platform Evidence is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'Supplying Platform Evidence should not use reproduction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'supplying-platform-evidence-platform-evidence',
        title: 'Platform Evidence Platform Evidence',
        body: [
          'A direct observation for Supplying Platform Evidence should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. In Supplying Platform Evidence, platform evidence is the difference between reading platform evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Platform Evidence.',
          'Visible feedback for Supplying Platform Evidence should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Public Problem Support / Evidence Handling.',
          'If the available evidence for platform evidence does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Platform Evidence should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-platform-evidence-log-handling',
        title: 'Platform Evidence Log Handling',
        body: [
          'Use channel choice to keep Supplying Platform Evidence tied to Public Problem Support; use a related page only when the reader needs a different owner. That reading gives Supplying Platform Evidence a public anchor for log handling without adding behavior that the current category does not own. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Log Handling.',
          'When Supplying Platform Evidence touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Supplying Platform Evidence log handling is a bounded explanation of platform evidence: enough detail to act, and enough restraint to avoid claims outside Evidence Handling.',
        ],
      },
      {
        id: 'supplying-platform-evidence-security-routing',
        title: 'Platform Evidence Security Routing',
        body: [
          'Renderer problems should include backend, hardware, driver, display scale, shadow setting, render distance, and whether OpenGL or WGPU was active. In Supplying Platform Evidence, security routing is the difference between reading platform evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Security Routing.',
          'The surrounding context for Supplying Platform Evidence decides which adjacent topic is relevant. Supplying Platform Evidence should be compared with Supplying Logs Without Secrets, Understanding the Windows Executable, Understanding the macOS Application Bundle only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Supplying Platform Evidence should not use security routing to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'supplying-platform-evidence-unsafe-details',
        title: 'Platform Evidence Unsafe Details',
        body: [
          'Supplying Platform Evidence separates the surface that accepts input from the component or document that controls the result. This is especially important when reading platform evidence in its documented category crosses a saved value, a renderer output, or a public form. Supplying Platform Evidence uses the fact as unsafe details evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Unsafe Details.',
          'Recovery or follow-up for Supplying Platform Evidence should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use unsafe details to keep Supplying Platform Evidence tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-platform-evidence-limited-question',
        title: 'Platform Evidence Limited Question',
        body: [
          'When Supplying Platform Evidence crosses from public report into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Supplying Platform Evidence a public anchor for limited question without adding behavior that the current category does not own. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Limited Question.',
          'The main confusion risk in Supplying Platform Evidence is moving the topic outside its confirmed boundary. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for limited question does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Platform Evidence should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-platform-evidence-unsupported-request',
        title: 'Platform Evidence Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Supplying Platform Evidence, reproduction is the difference between reading platform evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Reproduction. Supplying Platform Evidence uses the fact as unsupported request evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Unsupported Request.',
          'Reportable evidence for Supplying Platform Evidence should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Supplying Platform Evidence crosses from unsupported request into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'supplying-platform-evidence-closure-reading',
        title: 'Platform Evidence Closure Reading',
        body: [
          'Ownership in Supplying Platform Evidence is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The fact also tells the reader which evidence to preserve for closure reading: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Closure Reading.',
          'Adjacent pages matter for Supplying Platform Evidence, but adjacency does not move authority. Supplying Platform Evidence should be compared with Supplying Logs Without Secrets, Understanding the Windows Executable, Understanding the macOS Application Bundle only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use closure reading to keep Supplying Platform Evidence tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-platform-evidence-privacy',
        title: 'Platform Evidence Privacy',
        body: [
          'Supplying Platform Evidence should not use reproduction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Supplying Platform Evidence a public anchor for privacy without adding behavior that the current category does not own. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Privacy.',
          'The public boundary for Supplying Platform Evidence is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Supplying Platform Evidence privacy is a bounded explanation of platform evidence: enough detail to act, and enough restraint to avoid claims outside Evidence Handling.',
        ],
      },
      {
        id: 'supplying-platform-evidence-related-support',
        title: 'Platform Evidence Related Support',
        body: [
          'Remove private usernames, local secrets, unrelated file paths, and confidential machine details before posting evidence publicly. In Supplying Platform Evidence, platform evidence is the difference between reading platform evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Platform Evidence. The point matters in related support because reading platform evidence in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Related Support.',
          'An operator reading Supplying Platform Evidence should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Supplying Platform Evidence related support is a bounded explanation of platform evidence: enough detail to act, and enough restraint to avoid claims outside Evidence Handling.',
        ],
      },
      {
        id: 'supplying-platform-evidence-legal-limit',
        title: 'Platform Evidence Policy Limit',
        body: [
          'Visible feedback for Supplying Platform Evidence should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Public Problem Support / Evidence Handling. For Supplying Platform Evidence, that fact identifies the first concrete boundary for policy limit: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Policy Limit.',
          'Implementation limits for Supplying Platform Evidence keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the policy limit part of Supplying Platform Evidence should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'supplying-platform-evidence-reporter-summary',
        title: 'Platform Evidence Reporter Summary',
        body: [
          'Useful platform evidence can include operating system, Python version, PyQt6 version, GPU or renderer information, OpenGL or WGPU path, package path, and build path. The fact also tells the reader which evidence to preserve for reporter summary: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Reporter Summary.',
          'The summary value of Supplying Platform Evidence is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use reporter summary to keep Supplying Platform Evidence tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-platform-evidence-closing-check',
        title: 'Platform Evidence Closing Check',
        body: [
          'Support Scope defines the useful size of Supplying Platform Evidence. The article should be broad enough to explain platform evidence, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. In Supplying Platform Evidence, closing check is the difference between reading platform evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Platform Evidence / Public Problem Support / Evidence Handling / Closing Check.',
          'A final check for Supplying Platform Evidence should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Supplying Platform Evidence should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Supplying Logs Without Secrets', 'Understanding the Windows Executable', 'Understanding the macOS Application Bundle'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Public Problem Support',
    group: 'Evidence Handling',
    title: 'Supplying Logs Without Secrets',
    description:
      'Explains how to reduce logs to safe public evidence. This page treats support routing as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'supplying-logs-without-secrets-support-scope',
        title: 'Logs Without Secrets Support Scope',
        body: [
          'Share only the relevant log lines around the observed problem. Include command names and failure lines when they are public and necessary. The fact also tells the reader which evidence to preserve for support scope: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Support Scope.',
          'Support Scope defines the useful size of Supplying Logs Without Secrets. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'Use support scope to keep Supplying Logs Without Secrets tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-channel-choice',
        title: 'Logs Without Secrets Channel Choice',
        body: [
          'Support Scope defines the useful size of Supplying Logs Without Secrets. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. For Supplying Logs Without Secrets, that fact identifies the first concrete boundary for channel choice: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Channel Choice.',
          'A direct observation for Supplying Logs Without Secrets should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'A public report based on the channel choice part of Supplying Logs Without Secrets should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-public-report',
        title: 'Logs Without Secrets Public Report',
        body: [
          'Use support scope to keep Supplying Logs Without Secrets tied to Public Problem Support; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for public report: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Public Report.',
          'Supplying Logs Without Secrets separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'Use public report to keep Supplying Logs Without Secrets tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-reproduction',
        title: 'Logs Without Secrets Reproduction',
        body: [
          'Supplying Logs Without Secrets should be read as evidence handling for logs without secrets within Public Problem Support and Evidence Handling. In Supplying Logs Without Secrets, reproduction is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Reproduction.',
          'Ownership in Supplying Logs Without Secrets is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'If the available evidence for reproduction does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Logs Without Secrets should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-platform-evidence',
        title: 'Logs Without Secrets Platform Evidence',
        body: [
          'A direct observation for Supplying Logs Without Secrets should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. That reading gives Supplying Logs Without Secrets a public anchor for platform evidence without adding behavior that the current category does not own. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Platform Evidence.',
          'Visible feedback for Supplying Logs Without Secrets should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Public Problem Support / Evidence Handling.',
          'If the available evidence for platform evidence does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Logs Without Secrets should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-log-handling',
        title: 'Logs Without Secrets Log Handling',
        body: [
          'A public report based on the channel choice part of Supplying Logs Without Secrets should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in log handling because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Log Handling.',
          'When Supplying Logs Without Secrets touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Supplying Logs Without Secrets log handling is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Evidence Handling.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-security-routing',
        title: 'Logs Without Secrets Security Routing',
        body: [
          'Remove credentials, tokens, cookies, private local files, sensitive URLs, vulnerability details, and third-party confidential information before posting. The point matters in security routing because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Security Routing.',
          'The surrounding context for Supplying Logs Without Secrets decides which adjacent topic is relevant. Supplying Logs Without Secrets should be compared with Writing a Problem Report, Avoiding Public Exploit Details, Understanding Private Security Reporting only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Supplying Logs Without Secrets should not use security routing to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-unsafe-details',
        title: 'Logs Without Secrets Unsafe Details',
        body: [
          'Supplying Logs Without Secrets separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. For Supplying Logs Without Secrets, that fact identifies the first concrete boundary for unsafe details: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Unsafe Details.',
          'Recovery or follow-up for Supplying Logs Without Secrets should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the unsafe details part of Supplying Logs Without Secrets should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-limited-question',
        title: 'Logs Without Secrets Limited Question',
        body: [
          'Use public report to keep Supplying Logs Without Secrets tied to Public Problem Support; use a related page only when the reader needs a different owner. In Supplying Logs Without Secrets, limited question is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Limited Question.',
          'The main confusion risk in Supplying Logs Without Secrets is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for limited question does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Logs Without Secrets should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-unsupported-request',
        title: 'Logs Without Secrets Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Supplying Logs Without Secrets, reproduction is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Reproduction. Supplying Logs Without Secrets uses the fact as unsupported request evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Unsupported Request.',
          'Reportable evidence for Supplying Logs Without Secrets should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use unsupported request to keep Supplying Logs Without Secrets tied to Public Problem Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-closure-reading',
        title: 'Logs Without Secrets Closure Reading',
        body: [
          'Ownership in Supplying Logs Without Secrets is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. For Supplying Logs Without Secrets, that fact identifies the first concrete boundary for closure reading: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Closure Reading.',
          'Adjacent pages matter for Supplying Logs Without Secrets, but adjacency does not move authority. Supplying Logs Without Secrets should be compared with Writing a Problem Report, Avoiding Public Exploit Details, Understanding Private Security Reporting only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Supplying Logs Without Secrets crosses from closure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-privacy',
        title: 'Logs Without Secrets Privacy',
        body: [
          'If the available evidence for reproduction does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Logs Without Secrets should be treated as an observation rather than a confirmed cause. That reading gives Supplying Logs Without Secrets a public anchor for privacy without adding behavior that the current category does not own. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Privacy.',
          'The public boundary for Supplying Logs Without Secrets is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for privacy does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Logs Without Secrets should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-related-support',
        title: 'Logs Without Secrets Related Support',
        body: [
          'If a log reveals a suspected vulnerability or exploit path, do not post it publicly. Use the private security reporting path instead. The point matters in related support because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Related Support.',
          'An operator reading Supplying Logs Without Secrets should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'Supplying Logs Without Secrets should not use related support to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-legal-limit',
        title: 'Logs Without Secrets Policy Limit',
        body: [
          'Visible feedback for Supplying Logs Without Secrets should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Public Problem Support / Evidence Handling. For Supplying Logs Without Secrets, that fact identifies the first concrete boundary for policy limit: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Policy Limit.',
          'Implementation limits for Supplying Logs Without Secrets keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Supplying Logs Without Secrets crosses from policy limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-reporter-summary',
        title: 'Logs Without Secrets Reporter Summary',
        body: [
          'Share only the relevant log lines around the observed problem. Include command names and failure lines when they are public and necessary. The fact also tells the reader which evidence to preserve for reporter summary: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Reporter Summary.',
          'The summary value of Supplying Logs Without Secrets is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the reporter summary part of Supplying Logs Without Secrets should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'supplying-logs-without-secrets-closing-check',
        title: 'Logs Without Secrets Closing Check',
        body: [
          'Support Scope defines the useful size of Supplying Logs Without Secrets. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. In Supplying Logs Without Secrets, closing check is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Supplying Logs Without Secrets / Public Problem Support / Evidence Handling / Closing Check.',
          'A final check for Supplying Logs Without Secrets should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Supplying Logs Without Secrets should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Avoiding Public Exploit Details', 'Understanding Private Security Reporting'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Private Security Contact',
    title: 'Requesting a Private Security Channel',
    description:
      'Explains how to request private contact without disclosing a vulnerability publicly. This page treats support routing as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'requesting-a-private-security-channel-support-scope',
        title: 'Private Security Channel Support Scope',
        body: [
          'Use a public security contact request only when no private reporting channel is available for a suspected vulnerability. Prefer private vulnerability reporting or advisory channels when present. The point matters in support scope because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Support Scope.',
          'Support Scope defines the useful size of Requesting a Private Security Channel. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'Requesting a Private Security Channel should not use support scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-channel-choice',
        title: 'Private Security Channel Channel Choice',
        body: [
          'Support Scope defines the useful size of Requesting a Private Security Channel. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. In Requesting a Private Security Channel, channel choice is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Channel Choice.',
          'A direct observation for Requesting a Private Security Channel should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'Requesting a Private Security Channel should not use channel choice to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-public-report',
        title: 'Private Security Channel Public Report',
        body: [
          'Requesting a Private Security Channel should not use support scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Requesting a Private Security Channel a public anchor for public report without adding behavior that the current category does not own. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Public Report.',
          'Requesting a Private Security Channel separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'The useful result of Requesting a Private Security Channel public report is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Private Security Contact.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-reproduction',
        title: 'Private Security Channel Reproduction',
        body: [
          'Requesting a Private Security Channel should be read as private-channel request for a private security channel within Security and Safety Support and Private Security Contact. In Requesting a Private Security Channel, channel choice is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Channel Choice. For Requesting a Private Security Channel, that fact identifies the first concrete boundary for reproduction: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Reproduction.',
          'Ownership in Requesting a Private Security Channel is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'When Requesting a Private Security Channel crosses from reproduction into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-platform-evidence',
        title: 'Private Security Channel Platform Evidence',
        body: [
          'A direct observation for Requesting a Private Security Channel should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. For Requesting a Private Security Channel, that fact identifies the first concrete boundary for platform evidence: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Platform Evidence.',
          'Visible feedback for Requesting a Private Security Channel should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Security and Safety Support / Private Security Contact.',
          'When Requesting a Private Security Channel crosses from platform evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-log-handling',
        title: 'Private Security Channel Log Handling',
        body: [
          'Requesting a Private Security Channel should not use channel choice to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. Requesting a Private Security Channel uses the fact as log handling evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Log Handling.',
          'When Requesting a Private Security Channel touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Requesting a Private Security Channel crosses from log handling into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-security-routing',
        title: 'Private Security Channel Security Routing',
        body: [
          'The public request should contain a minimal category-level statement and, if desired, a non-sensitive contact method. Do not include technical details. Requesting a Private Security Channel uses the fact as security routing evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Security Routing.',
          'The surrounding context for Requesting a Private Security Channel decides which adjacent topic is relevant. Requesting a Private Security Channel should be compared with Avoiding Public Exploit Details, Understanding Private Security Reporting, Reading Security Policy only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use security routing to keep Requesting a Private Security Channel tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-unsafe-details',
        title: 'Private Security Channel Unsafe Details',
        body: [
          'Requesting a Private Security Channel separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. The point matters in unsafe details because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Unsafe Details.',
          'Recovery or follow-up for Requesting a Private Security Channel should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'The useful result of Requesting a Private Security Channel unsafe details is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Private Security Contact.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-limited-question',
        title: 'Private Security Channel Limited Question',
        body: [
          'The useful result of Requesting a Private Security Channel public report is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Private Security Contact. The fact also tells the reader which evidence to preserve for limited question: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Limited Question.',
          'The main confusion risk in Requesting a Private Security Channel is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the limited question part of Requesting a Private Security Channel should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-unsupported-request',
        title: 'Private Security Channel Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. That reading gives Requesting a Private Security Channel a public anchor for unsupported request without adding behavior that the current category does not own. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Unsupported Request.',
          'Reportable evidence for Requesting a Private Security Channel should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for unsupported request does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Requesting a Private Security Channel should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-closure-reading',
        title: 'Private Security Channel Closure Reading',
        body: [
          'Ownership in Requesting a Private Security Channel is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. In Requesting a Private Security Channel, closure reading is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Closure Reading.',
          'Adjacent pages matter for Requesting a Private Security Channel, but adjacency does not move authority. Requesting a Private Security Channel should be compared with Avoiding Public Exploit Details, Understanding Private Security Reporting, Reading Security Policy only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Requesting a Private Security Channel should not use closure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-privacy',
        title: 'Private Security Channel Privacy',
        body: [
          'When Requesting a Private Security Channel crosses from reproduction into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Requesting a Private Security Channel, that fact identifies the first concrete boundary for privacy: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Privacy.',
          'The public boundary for Requesting a Private Security Channel is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Requesting a Private Security Channel crosses from privacy into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-related-support',
        title: 'Private Security Channel Related Support',
        body: [
          'The request does not grant extra permission to test or use original materials. Security testing must remain lawful, non-destructive, authorized, and good-faith. The fact also tells the reader which evidence to preserve for related support: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Related Support.',
          'An operator reading Requesting a Private Security Channel should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'Use related support to keep Requesting a Private Security Channel tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-legal-limit',
        title: 'Private Security Channel Policy Limit',
        body: [
          'Visible feedback for Requesting a Private Security Channel should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Security and Safety Support / Private Security Contact. The point matters in policy limit because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Policy Limit.',
          'Implementation limits for Requesting a Private Security Channel keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Requesting a Private Security Channel policy limit is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Private Security Contact.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-reporter-summary',
        title: 'Private Security Channel Reporter Summary',
        body: [
          'Use a public security contact request only when no private reporting channel is available for a suspected vulnerability. Prefer private vulnerability reporting or advisory channels when present. That reading gives Requesting a Private Security Channel a public anchor for reporter summary without adding behavior that the current category does not own. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Reporter Summary.',
          'The summary value of Requesting a Private Security Channel is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Requesting a Private Security Channel reporter summary is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Private Security Contact.',
        ],
      },
      {
        id: 'requesting-a-private-security-channel-closing-check',
        title: 'Private Security Channel Closing Check',
        body: [
          'Support Scope defines the useful size of Requesting a Private Security Channel. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. For Requesting a Private Security Channel, that fact identifies the first concrete boundary for closing check: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Requesting a Private Security Channel / Security and Safety Support / Private Security Contact / Closing Check.',
          'A final check for Requesting a Private Security Channel should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Requesting a Private Security Channel should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Avoiding Public Exploit Details', 'Understanding Private Security Reporting', 'Reading Security Policy'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Private Security Contact',
    title: 'Separating Security Reports from Problem Reports',
    description:
      'Explains how to choose between public problem reports and private security reporting. This page treats support routing as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'separating-security-reports-from-problem-reports-support-scope',
        title: 'Security Reports from Problem Reports Support Scope',
        body: [
          'Use the public problem report form for reproducible, non-security behavior that can be described with public steps and public environment details. Separating Security Reports from Problem Reports uses the fact as support scope evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Support Scope. Separating Security Reports from Problem Reports uses the fact as support scope evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Support Scope.',
          'Support Scope defines the useful size of Separating Security Reports from Problem Reports. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'When Separating Security Reports from Problem Reports crosses from support scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-channel-choice',
        title: 'Security Reports from Problem Reports Channel Choice',
        body: [
          'Support Scope defines the useful size of Separating Security Reports from Problem Reports. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. Separating Security Reports from Problem Reports uses the fact as channel choice evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Channel Choice.',
          'A direct observation for Separating Security Reports from Problem Reports should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'When Separating Security Reports from Problem Reports crosses from channel choice into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-public-report',
        title: 'Security Reports from Problem Reports Public Report',
        body: [
          'When Separating Security Reports from Problem Reports crosses from support scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for public report: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Public Report.',
          'Separating Security Reports from Problem Reports separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'Use public report to keep Separating Security Reports from Problem Reports tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-reproduction',
        title: 'Security Reports from Problem Reports Reproduction',
        body: [
          'Separating Security Reports from Problem Reports should be read as classification for security reports from problem reports within Security and Safety Support and Private Security Contact. Separating Security Reports from Problem Reports uses the fact as channel choice evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Channel Choice. In Separating Security Reports from Problem Reports, reproduction is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Reproduction.',
          'Ownership in Separating Security Reports from Problem Reports is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'If the available evidence for reproduction does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Separating Security Reports from Problem Reports should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-platform-evidence',
        title: 'Security Reports from Problem Reports Platform Evidence',
        body: [
          'A direct observation for Separating Security Reports from Problem Reports should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. The point matters in platform evidence because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Platform Evidence.',
          'Visible feedback for Separating Security Reports from Problem Reports should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Security and Safety Support / Private Security Contact.',
          'The useful result of Separating Security Reports from Problem Reports platform evidence is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Private Security Contact.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-log-handling',
        title: 'Security Reports from Problem Reports Log Handling',
        body: [
          'When Separating Security Reports from Problem Reports crosses from channel choice into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Separating Security Reports from Problem Reports a public anchor for log handling without adding behavior that the current category does not own. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Log Handling.',
          'When Separating Security Reports from Problem Reports touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for log handling does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Separating Security Reports from Problem Reports should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-security-routing',
        title: 'Security Reports from Problem Reports Security Routing',
        body: [
          'Use private security reporting for suspected vulnerabilities, exploitability, sensitive reproduction details, credentials, or information that could help abuse the application or repository. In Separating Security Reports from Problem Reports, security routing is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Security Routing.',
          'The surrounding context for Separating Security Reports from Problem Reports decides which adjacent topic is relevant. Separating Security Reports from Problem Reports should be compared with Writing a Problem Report, Requesting a Private Security Channel, Understanding Private Security Reporting only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for security routing does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Separating Security Reports from Problem Reports should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-unsafe-details',
        title: 'Security Reports from Problem Reports Unsafe Details',
        body: [
          'Separating Security Reports from Problem Reports separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. Separating Security Reports from Problem Reports uses the fact as unsafe details evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Unsafe Details.',
          'Recovery or follow-up for Separating Security Reports from Problem Reports should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Separating Security Reports from Problem Reports crosses from unsafe details into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-limited-question',
        title: 'Security Reports from Problem Reports Limited Question',
        body: [
          'Use public report to keep Separating Security Reports from Problem Reports tied to Security and Safety Support; use a related page only when the reader needs a different owner. In Separating Security Reports from Problem Reports, limited question is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Limited Question.',
          'The main confusion risk in Separating Security Reports from Problem Reports is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for limited question does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Separating Security Reports from Problem Reports should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-unsupported-request',
        title: 'Security Reports from Problem Reports Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Separating Security Reports from Problem Reports, reproduction is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Reproduction. The fact also tells the reader which evidence to preserve for unsupported request: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Unsupported Request.',
          'Reportable evidence for Separating Security Reports from Problem Reports should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the unsupported request part of Separating Security Reports from Problem Reports should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-closure-reading',
        title: 'Security Reports from Problem Reports Closure Reading',
        body: [
          'Ownership in Separating Security Reports from Problem Reports is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. For Separating Security Reports from Problem Reports, that fact identifies the first concrete boundary for closure reading: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Closure Reading.',
          'Adjacent pages matter for Separating Security Reports from Problem Reports, but adjacency does not move authority. Separating Security Reports from Problem Reports should be compared with Writing a Problem Report, Requesting a Private Security Channel, Understanding Private Security Reporting only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Separating Security Reports from Problem Reports crosses from closure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-privacy',
        title: 'Security Reports from Problem Reports Privacy',
        body: [
          'If the available evidence for reproduction does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Separating Security Reports from Problem Reports should be treated as an observation rather than a confirmed cause. In Separating Security Reports from Problem Reports, privacy is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Privacy.',
          'The public boundary for Separating Security Reports from Problem Reports is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Separating Security Reports from Problem Reports should not use privacy to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-related-support',
        title: 'Security Reports from Problem Reports Related Support',
        body: [
          'If the behavior may be security-relevant, keep public details minimal and request a private channel rather than posting technical reproduction steps. That reading gives Separating Security Reports from Problem Reports a public anchor for related support without adding behavior that the current category does not own. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Related Support.',
          'An operator reading Separating Security Reports from Problem Reports should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Separating Security Reports from Problem Reports related support is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Private Security Contact.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-legal-limit',
        title: 'Security Reports from Problem Reports Policy Limit',
        body: [
          'Visible feedback for Separating Security Reports from Problem Reports should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Security and Safety Support / Private Security Contact. Separating Security Reports from Problem Reports uses the fact as policy limit evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Policy Limit.',
          'Implementation limits for Separating Security Reports from Problem Reports keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use policy limit to keep Separating Security Reports from Problem Reports tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-reporter-summary',
        title: 'Security Reports from Problem Reports Reporter Summary',
        body: [
          'Use the public problem report form for reproducible, non-security behavior that can be described with public steps and public environment details. Separating Security Reports from Problem Reports uses the fact as support scope evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Support Scope. The fact also tells the reader which evidence to preserve for reporter summary: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Reporter Summary.',
          'The summary value of Separating Security Reports from Problem Reports is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the reporter summary part of Separating Security Reports from Problem Reports should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'separating-security-reports-from-problem-reports-closing-check',
        title: 'Security Reports from Problem Reports Closing Check',
        body: [
          'Support Scope defines the useful size of Separating Security Reports from Problem Reports. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. In Separating Security Reports from Problem Reports, closing check is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating Security Reports from Problem Reports / Security and Safety Support / Private Security Contact / Closing Check.',
          'A final check for Separating Security Reports from Problem Reports should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Separating Security Reports from Problem Reports should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Requesting a Private Security Channel', 'Understanding Private Security Reporting'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Public Safety Limits',
    title: 'Avoiding Public Exploit Details',
    description:
      'Explains what security-sensitive content should stay out of public issues. This page treats hazard handling as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'avoiding-public-exploit-details-support-scope',
        title: 'Public Exploit Details Support Scope',
        body: [
          'Do not post exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, secret logs, private files, or non-public reproduction details. Avoiding Public Exploit Details uses the fact as support scope evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Support Scope. Avoiding Public Exploit Details uses the fact as support scope evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Support Scope.',
          'Support Scope defines the useful size of Avoiding Public Exploit Details. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion.',
          'Use support scope to keep Avoiding Public Exploit Details tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-channel-choice',
        title: 'Public Exploit Details Channel Choice',
        body: [
          'Support Scope defines the useful size of Avoiding Public Exploit Details. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. Avoiding Public Exploit Details uses the fact as channel choice evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Channel Choice.',
          'A direct observation for Avoiding Public Exploit Details should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'Use channel choice to keep Avoiding Public Exploit Details tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-public-report',
        title: 'Public Exploit Details Public Report',
        body: [
          'Use support scope to keep Avoiding Public Exploit Details tied to Security and Safety Support; use a related page only when the reader needs a different owner. Avoiding Public Exploit Details uses the fact as public report evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Public Report.',
          'Avoiding Public Exploit Details separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form.',
          'Use public report to keep Avoiding Public Exploit Details tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-reproduction',
        title: 'Public Exploit Details Reproduction',
        body: [
          'Avoiding Public Exploit Details should be read as risk avoidance for public exploit details within Security and Safety Support and Public Safety Limits. Avoiding Public Exploit Details uses the fact as channel choice evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Channel Choice. In Avoiding Public Exploit Details, reproduction is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Reproduction.',
          'Ownership in Avoiding Public Exploit Details is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'Avoiding Public Exploit Details should not use reproduction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-platform-evidence',
        title: 'Public Exploit Details Platform Evidence',
        body: [
          'A direct observation for Avoiding Public Exploit Details should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. The point matters in platform evidence because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Platform Evidence.',
          'Visible feedback for Avoiding Public Exploit Details should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Security and Safety Support / Public Safety Limits.',
          'Avoiding Public Exploit Details should not use platform evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-log-handling',
        title: 'Public Exploit Details Log Handling',
        body: [
          'Use channel choice to keep Avoiding Public Exploit Details tied to Security and Safety Support; use a related page only when the reader needs a different owner. The point matters in log handling because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Log Handling.',
          'When Avoiding Public Exploit Details touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Avoiding Public Exploit Details should not use log handling to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-security-routing',
        title: 'Public Exploit Details Security Routing',
        body: [
          'A public security contact request should state only that a suspected vulnerability affects the current repository or official distribution and ask for private contact. Avoiding Public Exploit Details uses the fact as public report evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Public Report. In Avoiding Public Exploit Details, security routing is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Security Routing.',
          'The surrounding context for Avoiding Public Exploit Details decides which adjacent topic is relevant. Avoiding Public Exploit Details should be compared with Requesting a Private Security Channel, Supplying Logs Without Secrets, Separating Security Reports from Problem Reports only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Avoiding Public Exploit Details should not use security routing to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-unsafe-details',
        title: 'Public Exploit Details Unsafe Details',
        body: [
          'Avoiding Public Exploit Details separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for unsafe details: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Unsafe Details.',
          'Recovery or follow-up for Avoiding Public Exploit Details should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the unsafe details part of Avoiding Public Exploit Details should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-limited-question',
        title: 'Public Exploit Details Limited Question',
        body: [
          'Use public report to keep Avoiding Public Exploit Details tied to Security and Safety Support; use a related page only when the reader needs a different owner. That reading gives Avoiding Public Exploit Details a public anchor for limited question without adding behavior that the current category does not own. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Limited Question.',
          'The main confusion risk in Avoiding Public Exploit Details is hiding gameplay state behind a generic crash report. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for limited question does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Avoiding Public Exploit Details should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-unsupported-request',
        title: 'Public Exploit Details Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Avoiding Public Exploit Details, reproduction is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Reproduction. For Avoiding Public Exploit Details, that fact identifies the first concrete boundary for unsupported request: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Unsupported Request.',
          'Reportable evidence for Avoiding Public Exploit Details should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the unsupported request part of Avoiding Public Exploit Details should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-closure-reading',
        title: 'Public Exploit Details Closure Reading',
        body: [
          'Ownership in Avoiding Public Exploit Details is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. Avoiding Public Exploit Details uses the fact as closure reading evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Closure Reading.',
          'Adjacent pages matter for Avoiding Public Exploit Details, but adjacency does not move authority. Avoiding Public Exploit Details should be compared with Requesting a Private Security Channel, Supplying Logs Without Secrets, Separating Security Reports from Problem Reports only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Avoiding Public Exploit Details crosses from closure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-privacy',
        title: 'Public Exploit Details Privacy',
        body: [
          'Avoiding Public Exploit Details should not use reproduction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Avoiding Public Exploit Details, privacy is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Privacy.',
          'The public boundary for Avoiding Public Exploit Details is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for privacy does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Avoiding Public Exploit Details should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-related-support',
        title: 'Public Exploit Details Related Support',
        body: [
          'Keep detailed evidence for the private reporting channel. Public issue history can be indexed, copied, and read by people who should not receive vulnerability details. That reading gives Avoiding Public Exploit Details a public anchor for related support without adding behavior that the current category does not own. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Related Support.',
          'An operator reading Avoiding Public Exploit Details should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for related support does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Avoiding Public Exploit Details should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-legal-limit',
        title: 'Public Exploit Details Policy Limit',
        body: [
          'Visible feedback for Avoiding Public Exploit Details should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Security and Safety Support / Public Safety Limits. The fact also tells the reader which evidence to preserve for policy limit: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Policy Limit.',
          'Implementation limits for Avoiding Public Exploit Details keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use policy limit to keep Avoiding Public Exploit Details tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-reporter-summary',
        title: 'Public Exploit Details Reporter Summary',
        body: [
          'Do not post exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, secret logs, private files, or non-public reproduction details. Avoiding Public Exploit Details uses the fact as support scope evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Support Scope. For Avoiding Public Exploit Details, that fact identifies the first concrete boundary for reporter summary: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Reporter Summary.',
          'The summary value of Avoiding Public Exploit Details is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the reporter summary part of Avoiding Public Exploit Details should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-public-exploit-details-closing-check',
        title: 'Public Exploit Details Closing Check',
        body: [
          'Support Scope defines the useful size of Avoiding Public Exploit Details. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. In Avoiding Public Exploit Details, closing check is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Public Exploit Details / Security and Safety Support / Public Safety Limits / Closing Check.',
          'A final check for Avoiding Public Exploit Details should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Avoiding Public Exploit Details should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Requesting a Private Security Channel', 'Supplying Logs Without Secrets', 'Separating Security Reports from Problem Reports'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security and Safety Support',
    group: 'Public Safety Limits',
    title: 'Understanding Unsafe Public Content',
    description:
      'Defines content that should not be placed in public Ludoxel channels. This page treats unsafe public content as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-unsafe-public-content-support-scope',
        title: 'Unsafe Public Content Support Scope',
        body: [
          'Unsafe public content includes vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, and logs containing secrets. That reading gives Understanding Unsafe Public Content a public anchor for support scope without adding behavior that the current category does not own. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Support Scope.',
          'Support Scope defines the useful size of Understanding Unsafe Public Content. The article should be broad enough to explain unsafe public content, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion.',
          'The useful result of Understanding Unsafe Public Content support scope is a bounded explanation of unsafe public content: enough detail to act, and enough restraint to avoid claims outside Public Safety Limits.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-channel-choice',
        title: 'Unsafe Public Content Channel Choice',
        body: [
          'Support Scope defines the useful size of Understanding Unsafe Public Content. The article should be broad enough to explain unsafe public content, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. In Understanding Unsafe Public Content, channel choice is the difference between reading unsafe public content and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Channel Choice.',
          'A direct observation for Understanding Unsafe Public Content should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'Understanding Unsafe Public Content should not use channel choice to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-public-report',
        title: 'Unsafe Public Content Public Report',
        body: [
          'The useful result of Understanding Unsafe Public Content support scope is a bounded explanation of unsafe public content: enough detail to act, and enough restraint to avoid claims outside Public Safety Limits. The point matters in public report because reading unsafe public content in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Public Report.',
          'Understanding Unsafe Public Content separates the surface that accepts input from the component or document that controls the result. This is especially important when reading unsafe public content in its documented category crosses a saved value, a renderer output, or a public form.',
          'Understanding Unsafe Public Content should not use public report to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-reproduction',
        title: 'Unsafe Public Content Reproduction',
        body: [
          'Understanding Unsafe Public Content should be read as conceptual boundary for unsafe public content within Security and Safety Support and Public Safety Limits. In Understanding Unsafe Public Content, channel choice is the difference between reading unsafe public content and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Channel Choice. The fact also tells the reader which evidence to preserve for reproduction: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Reproduction.',
          'Ownership in Understanding Unsafe Public Content is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'A public report based on the reproduction part of Understanding Unsafe Public Content should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-platform-evidence',
        title: 'Unsafe Public Content Platform Evidence',
        body: [
          'A direct observation for Understanding Unsafe Public Content should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. For Understanding Unsafe Public Content, that fact identifies the first concrete boundary for platform evidence: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Platform Evidence.',
          'Visible feedback for Understanding Unsafe Public Content should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Security and Safety Support / Public Safety Limits.',
          'When Understanding Unsafe Public Content crosses from platform evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-log-handling',
        title: 'Unsafe Public Content Log Handling',
        body: [
          'Understanding Unsafe Public Content should not use channel choice to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. Understanding Unsafe Public Content uses the fact as log handling evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Log Handling.',
          'When Understanding Unsafe Public Content touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Understanding Unsafe Public Content crosses from log handling into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-security-routing',
        title: 'Unsafe Public Content Security Routing',
        body: [
          'Private local files, non-public reproduction data, third-party confidential information, and unrelated personal data should not be posted in public issues. Understanding Unsafe Public Content uses the fact as security routing evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Security Routing.',
          'The surrounding context for Understanding Unsafe Public Content decides which adjacent topic is relevant. Understanding Unsafe Public Content should be compared with Avoiding Public Exploit Details, Supplying Logs Without Secrets, Requesting a Private Security Channel only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use security routing to keep Understanding Unsafe Public Content tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-unsafe-details',
        title: 'Unsafe Public Content Unsafe Details',
        body: [
          'Understanding Unsafe Public Content separates the surface that accepts input from the component or document that controls the result. This is especially important when reading unsafe public content in its documented category crosses a saved value, a renderer output, or a public form. In Understanding Unsafe Public Content, unsafe details is the difference between reading unsafe public content and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Unsafe Details.',
          'Recovery or follow-up for Understanding Unsafe Public Content should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Understanding Unsafe Public Content should not use unsafe details to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-limited-question',
        title: 'Unsafe Public Content Limited Question',
        body: [
          'Understanding Unsafe Public Content should not use public report to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for limited question: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Limited Question.',
          'The main confusion risk in Understanding Unsafe Public Content is moving the topic outside its confirmed boundary. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the limited question part of Understanding Unsafe Public Content should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-unsupported-request',
        title: 'Unsafe Public Content Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. That reading gives Understanding Unsafe Public Content a public anchor for unsupported request without adding behavior that the current category does not own. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Unsupported Request.',
          'Reportable evidence for Understanding Unsafe Public Content should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for unsupported request does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsafe Public Content should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-closure-reading',
        title: 'Unsafe Public Content Closure Reading',
        body: [
          'Ownership in Understanding Unsafe Public Content is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. That reading gives Understanding Unsafe Public Content a public anchor for closure reading without adding behavior that the current category does not own. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Closure Reading.',
          'Adjacent pages matter for Understanding Unsafe Public Content, but adjacency does not move authority. Understanding Unsafe Public Content should be compared with Avoiding Public Exploit Details, Supplying Logs Without Secrets, Requesting a Private Security Channel only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for closure reading does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsafe Public Content should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-privacy',
        title: 'Unsafe Public Content Privacy',
        body: [
          'A public report based on the reproduction part of Understanding Unsafe Public Content should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for privacy: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Privacy.',
          'The public boundary for Understanding Unsafe Public Content is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the privacy part of Understanding Unsafe Public Content should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-related-support',
        title: 'Unsafe Public Content Related Support',
        body: [
          'Replacement text, patches, generated files, datasets, shader rewrites, implementation proposals, and design assets are also outside the public issue scope. For Understanding Unsafe Public Content, that fact identifies the first concrete boundary for related support: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Related Support.',
          'An operator reading Understanding Unsafe Public Content should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the related support part of Understanding Unsafe Public Content should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-legal-limit',
        title: 'Unsafe Public Content Policy Limit',
        body: [
          'Visible feedback for Understanding Unsafe Public Content should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Security and Safety Support / Public Safety Limits. The point matters in policy limit because reading unsafe public content in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Policy Limit.',
          'Implementation limits for Understanding Unsafe Public Content keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Understanding Unsafe Public Content policy limit is a bounded explanation of unsafe public content: enough detail to act, and enough restraint to avoid claims outside Public Safety Limits.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-reporter-summary',
        title: 'Unsafe Public Content Reporter Summary',
        body: [
          'Unsafe public content includes vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, and logs containing secrets. In Understanding Unsafe Public Content, reporter summary is the difference between reading unsafe public content and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Reporter Summary.',
          'The summary value of Understanding Unsafe Public Content is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for reporter summary does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsafe Public Content should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-unsafe-public-content-closing-check',
        title: 'Unsafe Public Content Closing Check',
        body: [
          'Support Scope defines the useful size of Understanding Unsafe Public Content. The article should be broad enough to explain unsafe public content, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Unsafe Public Content / Security and Safety Support / Public Safety Limits / Closing Check.',
          'A final check for Understanding Unsafe Public Content should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding Unsafe Public Content tied to Security and Safety Support; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Avoiding Public Exploit Details', 'Supplying Logs Without Secrets', 'Requesting a Private Security Channel'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Limited Question Scope',
    title: 'Asking a Limited Question',
    description:
      'Explains the small set of questions suitable for the public question form. This page treats identity and appearance settings as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'asking-a-limited-question-support-scope',
        title: 'Limited Question Support Scope',
        body: [
          'Limited questions may ask about repository policy, the license, third-party materials, ordinary application use, packaging or build status, and security reporting policy. That reading gives Asking a Limited Question a public anchor for support scope without adding behavior that the current category does not own. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Support Scope.',
          'Support Scope defines the useful size of Asking a Limited Question. The article should be broad enough to explain identity and appearance settings, but narrow enough that publishing private imported assets remains outside the conclusion.',
          'If the available evidence for support scope does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Asking a Limited Question should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'asking-a-limited-question-channel-choice',
        title: 'Limited Question Channel Choice',
        body: [
          'Support Scope defines the useful size of Asking a Limited Question. The article should be broad enough to explain identity and appearance settings, but narrow enough that publishing private imported assets remains outside the conclusion. That reading gives Asking a Limited Question a public anchor for channel choice without adding behavior that the current category does not own. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Channel Choice.',
          'A direct observation for Asking a Limited Question should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'The useful result of Asking a Limited Question channel choice is a bounded explanation of identity and appearance settings: enough detail to act, and enough restraint to avoid claims outside Limited Question Scope.',
        ],
      },
      {
        id: 'asking-a-limited-question-public-report',
        title: 'Limited Question Public Report',
        body: [
          'If the available evidence for support scope does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Asking a Limited Question should be treated as an observation rather than a confirmed cause. The point matters in public report because changing displayed names or skin sources can otherwise be mistaken for publishing private imported assets. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Public Report.',
          'Asking a Limited Question separates the surface that accepts input from the component or document that controls the result. This is especially important when changing displayed names or skin sources crosses a saved value, a renderer output, or a public form.',
          'The useful result of Asking a Limited Question public report is a bounded explanation of identity and appearance settings: enough detail to act, and enough restraint to avoid claims outside Limited Question Scope.',
        ],
      },
      {
        id: 'asking-a-limited-question-reproduction',
        title: 'Limited Question Reproduction',
        body: [
          'Asking a Limited Question should be read as topic for asking a limited question within Scope and Closure Support and Limited Question Scope. Asking a Limited Question uses the fact as reproduction evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Reproduction.',
          'Ownership in Asking a Limited Question is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'When Asking a Limited Question crosses from reproduction into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'asking-a-limited-question-platform-evidence',
        title: 'Limited Question Platform Evidence',
        body: [
          'A direct observation for Asking a Limited Question should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. For Asking a Limited Question, that fact identifies the first concrete boundary for platform evidence: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Platform Evidence.',
          'Visible feedback for Asking a Limited Question should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Limited Question Scope.',
          'A public report based on the platform evidence part of Asking a Limited Question should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'asking-a-limited-question-log-handling',
        title: 'Limited Question Log Handling',
        body: [
          'The useful result of Asking a Limited Question channel choice is a bounded explanation of identity and appearance settings: enough detail to act, and enough restraint to avoid claims outside Limited Question Scope. For Asking a Limited Question, that fact identifies the first concrete boundary for log handling: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Log Handling.',
          'When Asking a Limited Question touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Asking a Limited Question crosses from log handling into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'asking-a-limited-question-security-routing',
        title: 'Limited Question Security Routing',
        body: [
          'Ask a direct question with enough public context to understand it. Do not include proposed replacement content, implementation plans, private files, or security details. For Asking a Limited Question, that fact identifies the first concrete boundary for security routing: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Security Routing.',
          'The surrounding context for Asking a Limited Question decides which adjacent topic is relevant. Asking a Limited Question should be compared with Keeping a Question Within Scope, Avoiding Feature Requests, Understanding Public Issue Limits only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the security routing part of Asking a Limited Question should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'asking-a-limited-question-unsafe-details',
        title: 'Limited Question Unsafe Details',
        body: [
          'Asking a Limited Question separates the surface that accepts input from the component or document that controls the result. This is especially important when changing displayed names or skin sources crosses a saved value, a renderer output, or a public form. In Asking a Limited Question, unsafe details is the difference between reading identity and appearance settings and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Unsafe Details.',
          'Recovery or follow-up for Asking a Limited Question should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for unsafe details does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Asking a Limited Question should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'asking-a-limited-question-limited-question',
        title: 'Limited Question Limited Question',
        body: [
          'The useful result of Asking a Limited Question public report is a bounded explanation of identity and appearance settings: enough detail to act, and enough restraint to avoid claims outside Limited Question Scope. Asking a Limited Question uses the fact as limited question evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Limited Question.',
          'The main confusion risk in Asking a Limited Question is publishing private imported assets. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Asking a Limited Question crosses from limited question into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'asking-a-limited-question-unsupported-request',
        title: 'Limited Question Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. Asking a Limited Question uses the fact as reproduction evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Reproduction. That reading gives Asking a Limited Question a public anchor for unsupported request without adding behavior that the current category does not own. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Unsupported Request.',
          'Reportable evidence for Asking a Limited Question should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Asking a Limited Question unsupported request is a bounded explanation of identity and appearance settings: enough detail to act, and enough restraint to avoid claims outside Limited Question Scope.',
        ],
      },
      {
        id: 'asking-a-limited-question-closure-reading',
        title: 'Limited Question Closure Reading',
        body: [
          'Ownership in Asking a Limited Question is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. In Asking a Limited Question, closure reading is the difference between reading identity and appearance settings and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Closure Reading.',
          'Adjacent pages matter for Asking a Limited Question, but adjacency does not move authority. Asking a Limited Question should be compared with Keeping a Question Within Scope, Avoiding Feature Requests, Understanding Public Issue Limits only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for closure reading does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Asking a Limited Question should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'asking-a-limited-question-privacy',
        title: 'Limited Question Privacy',
        body: [
          'When Asking a Limited Question crosses from reproduction into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. Asking a Limited Question uses the fact as privacy evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Privacy.',
          'The public boundary for Asking a Limited Question is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Asking a Limited Question crosses from privacy into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'asking-a-limited-question-related-support',
        title: 'Limited Question Related Support',
        body: [
          'The limited question form is not a broad support channel or contribution path. It is for narrow policy and usage questions that fit the listed topics. For Asking a Limited Question, that fact identifies the first concrete boundary for related support: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Related Support.',
          'An operator reading Asking a Limited Question should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'When Asking a Limited Question crosses from related support into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'asking-a-limited-question-legal-limit',
        title: 'Limited Question Policy Limit',
        body: [
          'Visible feedback for Asking a Limited Question should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Limited Question Scope. That reading gives Asking a Limited Question a public anchor for policy limit without adding behavior that the current category does not own. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Policy Limit.',
          'Implementation limits for Asking a Limited Question keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Asking a Limited Question policy limit is a bounded explanation of identity and appearance settings: enough detail to act, and enough restraint to avoid claims outside Limited Question Scope.',
        ],
      },
      {
        id: 'asking-a-limited-question-reporter-summary',
        title: 'Limited Question Reporter Summary',
        body: [
          'Limited questions may ask about repository policy, the license, third-party materials, ordinary application use, packaging or build status, and security reporting policy. That reading gives Asking a Limited Question a public anchor for reporter summary without adding behavior that the current category does not own. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Reporter Summary.',
          'The summary value of Asking a Limited Question is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for reporter summary does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Asking a Limited Question should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'asking-a-limited-question-closing-check',
        title: 'Limited Question Closing Check',
        body: [
          'Support Scope defines the useful size of Asking a Limited Question. The article should be broad enough to explain identity and appearance settings, but narrow enough that publishing private imported assets remains outside the conclusion. Asking a Limited Question uses the fact as closing check evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Asking a Limited Question / Scope and Closure Support / Limited Question Scope / Closing Check.',
          'A final check for Asking a Limited Question should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Asking a Limited Question tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
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
    description:
      'Explains how to keep a public question acceptable under the repository policy. This page treats support routing as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'keeping-a-question-within-scope-support-scope',
        title: 'Question Within Scope Support Scope',
        body: [
          'Before posting, match the question to an allowed topic: policy, license, third-party materials, ordinary use, packaging status, or security reporting policy. The fact also tells the reader which evidence to preserve for support scope: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Support Scope.',
          'Support Scope defines the useful size of Keeping a Question Within Scope. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'Use support scope to keep Keeping a Question Within Scope tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-channel-choice',
        title: 'Question Within Scope Channel Choice',
        body: [
          'Support Scope defines the useful size of Keeping a Question Within Scope. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. The fact also tells the reader which evidence to preserve for channel choice: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Channel Choice.',
          'A direct observation for Keeping a Question Within Scope should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'Use channel choice to keep Keeping a Question Within Scope tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-public-report',
        title: 'Question Within Scope Public Report',
        body: [
          'Use support scope to keep Keeping a Question Within Scope tied to Scope and Closure Support; use a related page only when the reader needs a different owner. Keeping a Question Within Scope uses the fact as public report evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Public Report.',
          'Keeping a Question Within Scope separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'When Keeping a Question Within Scope crosses from public report into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-reproduction',
        title: 'Question Within Scope Reproduction',
        body: [
          'Keeping a Question Within Scope should be read as boundary preservation for a question within scope within Scope and Closure Support and Limited Question Scope. The point matters in reproduction because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Reproduction.',
          'Ownership in Keeping a Question Within Scope is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'Keeping a Question Within Scope should not use reproduction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-platform-evidence',
        title: 'Question Within Scope Platform Evidence',
        body: [
          'A direct observation for Keeping a Question Within Scope should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. In Keeping a Question Within Scope, platform evidence is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Platform Evidence.',
          'Visible feedback for Keeping a Question Within Scope should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Limited Question Scope.',
          'Keeping a Question Within Scope should not use platform evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-log-handling',
        title: 'Question Within Scope Log Handling',
        body: [
          'Use channel choice to keep Keeping a Question Within Scope tied to Scope and Closure Support; use a related page only when the reader needs a different owner. In Keeping a Question Within Scope, log handling is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Log Handling.',
          'When Keeping a Question Within Scope touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Keeping a Question Within Scope should not use log handling to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-security-routing',
        title: 'Question Within Scope Security Routing',
        body: [
          'Remove replacement text, patches, feature proposals, generated files, datasets, exploit details, secrets, and private local files from the question. Keeping a Question Within Scope uses the fact as public report evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Public Report. The point matters in security routing because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Security Routing.',
          'The surrounding context for Keeping a Question Within Scope decides which adjacent topic is relevant. Keeping a Question Within Scope should be compared with Asking a Limited Question, Understanding Unsupported Requests, Reading Issue Template Boundaries only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Keeping a Question Within Scope should not use security routing to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-unsafe-details',
        title: 'Question Within Scope Unsafe Details',
        body: [
          'Keeping a Question Within Scope separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. Keeping a Question Within Scope uses the fact as unsafe details evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Unsafe Details.',
          'Recovery or follow-up for Keeping a Question Within Scope should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Keeping a Question Within Scope crosses from unsafe details into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-limited-question',
        title: 'Question Within Scope Limited Question',
        body: [
          'When Keeping a Question Within Scope crosses from public report into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. In Keeping a Question Within Scope, limited question is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Limited Question.',
          'The main confusion risk in Keeping a Question Within Scope is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for limited question does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Keeping a Question Within Scope should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-unsupported-request',
        title: 'Question Within Scope Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. Keeping a Question Within Scope uses the fact as unsupported request evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Unsupported Request.',
          'Reportable evidence for Keeping a Question Within Scope should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use unsupported request to keep Keeping a Question Within Scope tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-closure-reading',
        title: 'Question Within Scope Closure Reading',
        body: [
          'Ownership in Keeping a Question Within Scope is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. Keeping a Question Within Scope uses the fact as closure reading evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Closure Reading.',
          'Adjacent pages matter for Keeping a Question Within Scope, but adjacency does not move authority. Keeping a Question Within Scope should be compared with Asking a Limited Question, Understanding Unsupported Requests, Reading Issue Template Boundaries only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use closure reading to keep Keeping a Question Within Scope tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-privacy',
        title: 'Question Within Scope Privacy',
        body: [
          'Keeping a Question Within Scope should not use reproduction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in privacy because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Privacy.',
          'The public boundary for Keeping a Question Within Scope is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Keeping a Question Within Scope privacy is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Limited Question Scope.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-related-support',
        title: 'Question Within Scope Related Support',
        body: [
          'A question outside the limited scope can be closed without substantive review. Keeping it narrow makes it easier to answer publicly. In Keeping a Question Within Scope, platform evidence is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Platform Evidence. That reading gives Keeping a Question Within Scope a public anchor for related support without adding behavior that the current category does not own. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Related Support.',
          'An operator reading Keeping a Question Within Scope should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Keeping a Question Within Scope related support is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Limited Question Scope.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-legal-limit',
        title: 'Question Within Scope Policy Limit',
        body: [
          'Visible feedback for Keeping a Question Within Scope should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Limited Question Scope. Keeping a Question Within Scope uses the fact as policy limit evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Policy Limit.',
          'Implementation limits for Keeping a Question Within Scope keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use policy limit to keep Keeping a Question Within Scope tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-reporter-summary',
        title: 'Question Within Scope Reporter Summary',
        body: [
          'Before posting, match the question to an allowed topic: policy, license, third-party materials, ordinary use, packaging status, or security reporting policy. Keeping a Question Within Scope uses the fact as reporter summary evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Reporter Summary.',
          'The summary value of Keeping a Question Within Scope is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use reporter summary to keep Keeping a Question Within Scope tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'keeping-a-question-within-scope-closing-check',
        title: 'Question Within Scope Closing Check',
        body: [
          'Support Scope defines the useful size of Keeping a Question Within Scope. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. In Keeping a Question Within Scope, closing check is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping a Question Within Scope / Scope and Closure Support / Limited Question Scope / Closing Check.',
          'A final check for Keeping a Question Within Scope should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Keeping a Question Within Scope should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Asking a Limited Question', 'Understanding Unsupported Requests', 'Reading Issue Template Boundaries'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Unsupported Requests',
    title: 'Avoiding Feature Requests',
    description:
      'Explains why feature requests are outside Ludoxel public issue scope. This page treats hazard handling as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'avoiding-feature-requests-support-scope',
        title: 'Feature Requests Support Scope',
        body: [
          'Feature requests, implementation proposals, design changes, shader rewrites, datasets, generated files, and replacement repository text are contribution material under the public policy. For Avoiding Feature Requests, that fact identifies the first concrete boundary for support scope: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Support Scope.',
          'Support Scope defines the useful size of Avoiding Feature Requests. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion.',
          'When Avoiding Feature Requests crosses from support scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-feature-requests-channel-choice',
        title: 'Feature Requests Channel Choice',
        body: [
          'Support Scope defines the useful size of Avoiding Feature Requests. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. Avoiding Feature Requests uses the fact as channel choice evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Channel Choice.',
          'A direct observation for Avoiding Feature Requests should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'Use channel choice to keep Avoiding Feature Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-feature-requests-public-report',
        title: 'Feature Requests Public Report',
        body: [
          'When Avoiding Feature Requests crosses from support scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Avoiding Feature Requests, that fact identifies the first concrete boundary for public report: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Public Report.',
          'Avoiding Feature Requests separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form.',
          'When Avoiding Feature Requests crosses from public report into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-feature-requests-reproduction',
        title: 'Feature Requests Reproduction',
        body: [
          'Avoiding Feature Requests should be read as risk avoidance for feature requests within Scope and Closure Support and Unsupported Requests. Avoiding Feature Requests uses the fact as channel choice evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Channel Choice. In Avoiding Feature Requests, reproduction is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Reproduction.',
          'Ownership in Avoiding Feature Requests is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'Avoiding Feature Requests should not use reproduction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'avoiding-feature-requests-platform-evidence',
        title: 'Feature Requests Platform Evidence',
        body: [
          'A direct observation for Avoiding Feature Requests should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. In Avoiding Feature Requests, platform evidence is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Platform Evidence.',
          'Visible feedback for Avoiding Feature Requests should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Unsupported Requests.',
          'If the available evidence for platform evidence does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Avoiding Feature Requests should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-feature-requests-log-handling',
        title: 'Feature Requests Log Handling',
        body: [
          'Use channel choice to keep Avoiding Feature Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner. That reading gives Avoiding Feature Requests a public anchor for log handling without adding behavior that the current category does not own. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Log Handling.',
          'When Avoiding Feature Requests touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Avoiding Feature Requests log handling is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
      {
        id: 'avoiding-feature-requests-security-routing',
        title: 'Feature Requests Security Routing',
        body: [
          'A reproducible non-security bug report describes observed and expected behavior. A request for new behavior or a design direction does not fit that form. The point matters in security routing because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Security Routing.',
          'The surrounding context for Avoiding Feature Requests decides which adjacent topic is relevant. Avoiding Feature Requests should be compared with Understanding Contribution Refusal, Understanding Pull Request Boundaries, Keeping a Question Within Scope only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Avoiding Feature Requests security routing is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
      {
        id: 'avoiding-feature-requests-unsafe-details',
        title: 'Feature Requests Unsafe Details',
        body: [
          'Avoiding Feature Requests separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form. Avoiding Feature Requests uses the fact as unsafe details evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Unsafe Details.',
          'Recovery or follow-up for Avoiding Feature Requests should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use unsafe details to keep Avoiding Feature Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-feature-requests-limited-question',
        title: 'Feature Requests Limited Question',
        body: [
          'When Avoiding Feature Requests crosses from public report into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The point matters in limited question because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Limited Question.',
          'The main confusion risk in Avoiding Feature Requests is hiding gameplay state behind a generic crash report. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Avoiding Feature Requests limited question is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
      {
        id: 'avoiding-feature-requests-unsupported-request',
        title: 'Feature Requests Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Avoiding Feature Requests, reproduction is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Reproduction. The fact also tells the reader which evidence to preserve for unsupported request: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Unsupported Request.',
          'Reportable evidence for Avoiding Feature Requests should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use unsupported request to keep Avoiding Feature Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-feature-requests-closure-reading',
        title: 'Feature Requests Closure Reading',
        body: [
          'Ownership in Avoiding Feature Requests is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The fact also tells the reader which evidence to preserve for closure reading: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Closure Reading.',
          'Adjacent pages matter for Avoiding Feature Requests, but adjacency does not move authority. Avoiding Feature Requests should be compared with Understanding Contribution Refusal, Understanding Pull Request Boundaries, Keeping a Question Within Scope only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use closure reading to keep Avoiding Feature Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-feature-requests-privacy',
        title: 'Feature Requests Privacy',
        body: [
          'Avoiding Feature Requests should not use reproduction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Avoiding Feature Requests, privacy is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Privacy.',
          'The public boundary for Avoiding Feature Requests is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for privacy does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Avoiding Feature Requests should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-feature-requests-related-support',
        title: 'Feature Requests Related Support',
        body: [
          'If you need to ask whether a policy topic is in scope, use a limited question without proposing implementation details or replacement content. In Avoiding Feature Requests, platform evidence is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Platform Evidence. The point matters in related support because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Related Support.',
          'An operator reading Avoiding Feature Requests should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Avoiding Feature Requests related support is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
      {
        id: 'avoiding-feature-requests-legal-limit',
        title: 'Feature Requests Policy Limit',
        body: [
          'Visible feedback for Avoiding Feature Requests should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Unsupported Requests. The fact also tells the reader which evidence to preserve for policy limit: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Policy Limit.',
          'Implementation limits for Avoiding Feature Requests keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use policy limit to keep Avoiding Feature Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-feature-requests-reporter-summary',
        title: 'Feature Requests Reporter Summary',
        body: [
          'Feature requests, implementation proposals, design changes, shader rewrites, datasets, generated files, and replacement repository text are contribution material under the public policy. The fact also tells the reader which evidence to preserve for reporter summary: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Reporter Summary.',
          'The summary value of Avoiding Feature Requests is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use reporter summary to keep Avoiding Feature Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-feature-requests-closing-check',
        title: 'Feature Requests Closing Check',
        body: [
          'Support Scope defines the useful size of Avoiding Feature Requests. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. That reading gives Avoiding Feature Requests a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Avoiding Feature Requests / Scope and Closure Support / Unsupported Requests / Closing Check.',
          'A final check for Avoiding Feature Requests should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Avoiding Feature Requests should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Understanding Contribution Refusal', 'Understanding Pull Request Boundaries', 'Keeping a Question Within Scope'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Unsupported Requests',
    title: 'Understanding Closure Without Review',
    description:
      'Explains why some public issues or pull requests may be closed without review. This page treats support routing as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-closure-without-review-support-scope',
        title: 'Closure Without Review Support Scope',
        body: [
          'The repository policy allows unsupported issues or pull requests to be closed without reviewing, accepting, or incorporating submitted material. The fact also tells the reader which evidence to preserve for support scope: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Support Scope.',
          'Support Scope defines the useful size of Understanding Closure Without Review. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'Use support scope to keep Understanding Closure Without Review tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-closure-without-review-channel-choice',
        title: 'Closure Without Review Channel Choice',
        body: [
          'Support Scope defines the useful size of Understanding Closure Without Review. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. The fact also tells the reader which evidence to preserve for channel choice: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Channel Choice.',
          'A direct observation for Understanding Closure Without Review should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'Use channel choice to keep Understanding Closure Without Review tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-closure-without-review-public-report',
        title: 'Closure Without Review Public Report',
        body: [
          'Use support scope to keep Understanding Closure Without Review tied to Scope and Closure Support; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for public report: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Public Report.',
          'Understanding Closure Without Review separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'Use public report to keep Understanding Closure Without Review tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-closure-without-review-reproduction',
        title: 'Closure Without Review Reproduction',
        body: [
          'Understanding Closure Without Review should be read as conceptual boundary for closure without review within Scope and Closure Support and Unsupported Requests. In Understanding Closure Without Review, reproduction is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Reproduction.',
          'Ownership in Understanding Closure Without Review is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'If the available evidence for reproduction does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Closure Without Review should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-closure-without-review-platform-evidence',
        title: 'Closure Without Review Platform Evidence',
        body: [
          'A direct observation for Understanding Closure Without Review should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. The point matters in platform evidence because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Platform Evidence.',
          'Visible feedback for Understanding Closure Without Review should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Unsupported Requests.',
          'The useful result of Understanding Closure Without Review platform evidence is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
      {
        id: 'understanding-closure-without-review-log-handling',
        title: 'Closure Without Review Log Handling',
        body: [
          'Use channel choice to keep Understanding Closure Without Review tied to Scope and Closure Support; use a related page only when the reader needs a different owner. That reading gives Understanding Closure Without Review a public anchor for log handling without adding behavior that the current category does not own. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Log Handling.',
          'When Understanding Closure Without Review touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for log handling does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Closure Without Review should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-closure-without-review-security-routing',
        title: 'Closure Without Review Security Routing',
        body: [
          'Common causes include contribution material, public security details, broad feature requests, private files, generated content, or questions outside the listed limited topics. In Understanding Closure Without Review, security routing is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Security Routing.',
          'The surrounding context for Understanding Closure Without Review decides which adjacent topic is relevant. Understanding Closure Without Review should be compared with Understanding Unsupported Requests, Understanding Contribution Refusal, Reading Issue Template Boundaries only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for security routing does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Closure Without Review should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-closure-without-review-unsafe-details',
        title: 'Closure Without Review Unsafe Details',
        body: [
          'Understanding Closure Without Review separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. Understanding Closure Without Review uses the fact as unsafe details evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Unsafe Details.',
          'Recovery or follow-up for Understanding Closure Without Review should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Closure Without Review crosses from unsafe details into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-closure-without-review-limited-question',
        title: 'Closure Without Review Limited Question',
        body: [
          'Use public report to keep Understanding Closure Without Review tied to Scope and Closure Support; use a related page only when the reader needs a different owner. In Understanding Closure Without Review, limited question is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Limited Question.',
          'The main confusion risk in Understanding Closure Without Review is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for limited question does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Closure Without Review should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-closure-without-review-unsupported-request',
        title: 'Closure Without Review Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Understanding Closure Without Review, reproduction is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Reproduction. Understanding Closure Without Review uses the fact as unsupported request evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Unsupported Request.',
          'Reportable evidence for Understanding Closure Without Review should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use unsupported request to keep Understanding Closure Without Review tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-closure-without-review-closure-reading',
        title: 'Closure Without Review Closure Reading',
        body: [
          'Ownership in Understanding Closure Without Review is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The fact also tells the reader which evidence to preserve for closure reading: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Closure Reading.',
          'Adjacent pages matter for Understanding Closure Without Review, but adjacency does not move authority. Understanding Closure Without Review should be compared with Understanding Unsupported Requests, Understanding Contribution Refusal, Reading Issue Template Boundaries only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the closure reading part of Understanding Closure Without Review should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-closure-without-review-privacy',
        title: 'Closure Without Review Privacy',
        body: [
          'If the available evidence for reproduction does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Closure Without Review should be treated as an observation rather than a confirmed cause. The point matters in privacy because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Privacy.',
          'The public boundary for Understanding Closure Without Review is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding Closure Without Review privacy is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
      {
        id: 'understanding-closure-without-review-related-support',
        title: 'Closure Without Review Related Support',
        body: [
          'For future reports, choose the correct template, keep content public and minimal, and avoid attaching material the policy says is not accepted. The point matters in related support because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Related Support.',
          'An operator reading Understanding Closure Without Review should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'Understanding Closure Without Review should not use related support to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-closure-without-review-legal-limit',
        title: 'Closure Without Review Policy Limit',
        body: [
          'Visible feedback for Understanding Closure Without Review should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Unsupported Requests. Understanding Closure Without Review uses the fact as policy limit evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Policy Limit.',
          'Implementation limits for Understanding Closure Without Review keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use policy limit to keep Understanding Closure Without Review tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-closure-without-review-reporter-summary',
        title: 'Closure Without Review Reporter Summary',
        body: [
          'The repository policy allows unsupported issues or pull requests to be closed without reviewing, accepting, or incorporating submitted material. The fact also tells the reader which evidence to preserve for reporter summary: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Reporter Summary.',
          'The summary value of Understanding Closure Without Review is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the reporter summary part of Understanding Closure Without Review should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-closure-without-review-closing-check',
        title: 'Closure Without Review Closing Check',
        body: [
          'Support Scope defines the useful size of Understanding Closure Without Review. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. That reading gives Understanding Closure Without Review a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Understanding Closure Without Review / Scope and Closure Support / Unsupported Requests / Closing Check.',
          'A final check for Understanding Closure Without Review should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Understanding Closure Without Review closing check is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
    ],
    relatedTitles: ['Understanding Unsupported Requests', 'Understanding Contribution Refusal', 'Reading Issue Template Boundaries'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Scope and Closure Support',
    group: 'Unsupported Requests',
    title: 'Understanding Unsupported Requests',
    description:
      'Defines public requests that Ludoxel policy does not support. This page treats support routing as a support guide for safe public problem reports and private security routing, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-unsupported-requests-support-scope',
        title: 'Unsupported Requests Support Scope',
        body: [
          'Unsupported requests include feature proposals, patches, replacement text, design assets, generated files, broad troubleshooting demands, public vulnerability details, and unofficial release requests. The fact also tells the reader which evidence to preserve for support scope: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Support Scope.',
          'Support Scope defines the useful size of Understanding Unsupported Requests. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion.',
          'Use support scope to keep Understanding Unsupported Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-channel-choice',
        title: 'Unsupported Requests Channel Choice',
        body: [
          'Support Scope defines the useful size of Understanding Unsupported Requests. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. For Understanding Unsupported Requests, that fact identifies the first concrete boundary for channel choice: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Channel Choice.',
          'A direct observation for Understanding Unsupported Requests should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state.',
          'A public report based on the channel choice part of Understanding Unsupported Requests should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-public-report',
        title: 'Unsupported Requests Public Report',
        body: [
          'Use support scope to keep Understanding Unsupported Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner. For Understanding Unsupported Requests, that fact identifies the first concrete boundary for public report: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Public Report.',
          'Understanding Unsupported Requests separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form.',
          'A public report based on the public report part of Understanding Unsupported Requests should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-reproduction',
        title: 'Unsupported Requests Reproduction',
        body: [
          'Understanding Unsupported Requests should be read as conceptual boundary for unsupported requests within Scope and Closure Support and Unsupported Requests. In Understanding Unsupported Requests, reproduction is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Reproduction.',
          'Ownership in Understanding Unsupported Requests is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy.',
          'If the available evidence for reproduction does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsupported Requests should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-platform-evidence',
        title: 'Unsupported Requests Platform Evidence',
        body: [
          'A direct observation for Understanding Unsupported Requests should name what the user or reader actually sees before it assigns cause. That keeps safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report ahead of guesses about hidden state. That reading gives Understanding Unsupported Requests a public anchor for platform evidence without adding behavior that the current category does not own. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Platform Evidence.',
          'Visible feedback for Understanding Unsupported Requests should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Unsupported Requests.',
          'If the available evidence for platform evidence does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsupported Requests should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-log-handling',
        title: 'Unsupported Requests Log Handling',
        body: [
          'A public report based on the channel choice part of Understanding Unsupported Requests should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Understanding Unsupported Requests a public anchor for log handling without adding behavior that the current category does not own. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Log Handling.',
          'When Understanding Unsupported Requests touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for log handling does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsupported Requests should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-security-routing',
        title: 'Unsupported Requests Security Routing',
        body: [
          'The public channels are intentionally narrow so problem reports, limited questions, and security contact requests do not become contribution or disclosure channels. That reading gives Understanding Unsupported Requests a public anchor for security routing without adding behavior that the current category does not own. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Security Routing.',
          'The surrounding context for Understanding Unsupported Requests decides which adjacent topic is relevant. Understanding Unsupported Requests should be compared with Avoiding Feature Requests, Understanding Closure Without Review, Understanding Contribution Refusal only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Understanding Unsupported Requests security routing is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-unsafe-details',
        title: 'Unsupported Requests Unsafe Details',
        body: [
          'Understanding Unsupported Requests separates the surface that accepts input from the component or document that controls the result. This is especially important when preparing public or private support evidence crosses a saved value, a renderer output, or a public form. Understanding Unsupported Requests uses the fact as unsafe details evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Unsafe Details.',
          'Recovery or follow-up for Understanding Unsupported Requests should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Unsupported Requests crosses from unsafe details into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-limited-question',
        title: 'Unsupported Requests Limited Question',
        body: [
          'A public report based on the public report part of Understanding Unsupported Requests should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Understanding Unsupported Requests, limited question is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Limited Question.',
          'The main confusion risk in Understanding Unsupported Requests is posting secrets or security details publicly. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for limited question does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsupported Requests should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-unsupported-request',
        title: 'Unsupported Requests Unsupported Request',
        body: [
          'The relevant state is constrained by the article category: Support treats this topic as public support and reporting-boundary behavior. In Understanding Unsupported Requests, reproduction is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Reproduction. The fact also tells the reader which evidence to preserve for unsupported request: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Unsupported Request.',
          'Reportable evidence for Understanding Unsupported Requests should be small, concrete, and public. safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the unsupported request part of Understanding Unsupported Requests should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-closure-reading',
        title: 'Unsupported Requests Closure Reading',
        body: [
          'Ownership in Understanding Unsupported Requests is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. For Understanding Unsupported Requests, that fact identifies the first concrete boundary for closure reading: problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Closure Reading.',
          'Adjacent pages matter for Understanding Unsupported Requests, but adjacency does not move authority. Understanding Unsupported Requests should be compared with Avoiding Feature Requests, Understanding Closure Without Review, Understanding Contribution Refusal only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Understanding Unsupported Requests crosses from closure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-privacy',
        title: 'Unsupported Requests Privacy',
        body: [
          'If the available evidence for reproduction does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsupported Requests should be treated as an observation rather than a confirmed cause. The point matters in privacy because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Privacy.',
          'The public boundary for Understanding Unsupported Requests is part of the article, not an afterthought. It does not request secrets, exploit steps, proof-of-concept material, private files, or restricted content in public reports. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding Unsupported Requests privacy is a bounded explanation of support routing: enough detail to act, and enough restraint to avoid claims outside Unsupported Requests.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-related-support',
        title: 'Unsupported Requests Related Support',
        body: [
          'Use a problem report for public reproducible non-security defects, a limited question for listed policy topics, and private security reporting for suspected vulnerabilities. In Understanding Unsupported Requests, related support is the difference between reading support routing and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Related Support.',
          'An operator reading Understanding Unsupported Requests should follow support reading starts with the channel, then checks what evidence can be posted publicly and what must remain private. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for related support does not identify problem-report templates, limited-question templates, security-contact templates, public safety limits, and the security policy, Understanding Unsupported Requests should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-legal-limit',
        title: 'Unsupported Requests Policy Limit',
        body: [
          'Visible feedback for Understanding Unsupported Requests should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Support / Scope and Closure Support / Unsupported Requests. The fact also tells the reader which evidence to preserve for policy limit: safe reproduction steps, expected behavior, actual behavior, platform evidence, redacted logs, security relevance, and the channel chosen for the report. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Policy Limit.',
          'Implementation limits for Understanding Unsupported Requests keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the policy limit part of Understanding Unsupported Requests should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-reporter-summary',
        title: 'Unsupported Requests Reporter Summary',
        body: [
          'Unsupported requests include feature proposals, patches, replacement text, design assets, generated files, broad troubleshooting demands, public vulnerability details, and unofficial release requests. Understanding Unsupported Requests uses the fact as reporter summary evidence, then keeps the explanation inside Support rather than turning it into a project-wide claim. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Reporter Summary.',
          'The summary value of Understanding Unsupported Requests is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use reporter summary to keep Understanding Unsupported Requests tied to Scope and Closure Support; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-unsupported-requests-closing-check',
        title: 'Unsupported Requests Closing Check',
        body: [
          'Support Scope defines the useful size of Understanding Unsupported Requests. The article should be broad enough to explain support routing, but narrow enough that posting secrets or security details publicly remains outside the conclusion. The point matters in closing check because preparing public or private support evidence can otherwise be mistaken for posting secrets or security details publicly. The local reading frame is Understanding Unsupported Requests / Scope and Closure Support / Unsupported Requests / Closing Check.',
          'A final check for Understanding Unsupported Requests should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Unsupported Requests should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Avoiding Feature Requests', 'Understanding Closure Without Review', 'Understanding Contribution Refusal'],
  }),
];
