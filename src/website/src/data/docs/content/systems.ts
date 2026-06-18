/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const systemsPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Session Loop',
    title: 'Understanding Fixed Step Sessions',
    description:
      'Explains why Ludoxel advances simulation in bounded fixed steps. This page treats session stepping as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-fixed-step-sessions-contract-scope',
        title: 'Fixed Step Sessions Contract Scope',
        body: [
          'The fixed-step runner accumulates frame time and advances the session in fixed simulation increments. Very large frame deltas are clamped to avoid runaway catch-up work. The point matters in contract scope because following deterministic runtime updates can otherwise be mistaken for using render cadence as the source of simulation truth. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Fixed Step Sessions. The article should be broad enough to explain session stepping, but narrow enough that using render cadence as the source of simulation truth remains outside the conclusion.',
          'The useful result of Understanding Fixed Step Sessions contract scope is a bounded explanation of session stepping: enough detail to act, and enough restraint to avoid claims outside Session Loop.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-owning-subsystem',
        title: 'Fixed Step Sessions Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Fixed Step Sessions. The article should be broad enough to explain session stepping, but narrow enough that using render cadence as the source of simulation truth remains outside the conclusion. In Understanding Fixed Step Sessions, owning subsystem is the difference between reading session stepping and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Owning Subsystem.',
          'A direct observation for Understanding Fixed Step Sessions should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'If the available evidence for owning subsystem does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Fixed Step Sessions should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-data-shape',
        title: 'Fixed Step Sessions Data Shape',
        body: [
          'The useful result of Understanding Fixed Step Sessions contract scope is a bounded explanation of session stepping: enough detail to act, and enough restraint to avoid claims outside Session Loop. The fact also tells the reader which evidence to preserve for data shape: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Data Shape.',
          'Understanding Fixed Step Sessions separates the surface that accepts input from the component or document that controls the result. This is especially important when following deterministic runtime updates crosses a saved value, a renderer output, or a public form.',
          'A public report based on the data shape part of Understanding Fixed Step Sessions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-handoff',
        title: 'Fixed Step Sessions Handoff',
        body: [
          'Understanding Fixed Step Sessions should be read as conceptual boundary for fixed step sessions within Runtime and Render State and Session Loop. In Understanding Fixed Step Sessions, owning subsystem is the difference between reading session stepping and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Owning Subsystem. The point matters in handoff because following deterministic runtime updates can otherwise be mistaken for using render cadence as the source of simulation truth. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Handoff.',
          'Ownership in Understanding Fixed Step Sessions is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'Understanding Fixed Step Sessions should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-backend-or-service',
        title: 'Fixed Step Sessions Backend or Service',
        body: [
          'A direct observation for Understanding Fixed Step Sessions should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for backend or service: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Backend or Service.',
          'Visible feedback for Understanding Fixed Step Sessions should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Session Loop.',
          'A public report based on the backend or service part of Understanding Fixed Step Sessions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-runtime-state',
        title: 'Fixed Step Sessions Runtime State',
        body: [
          'If the available evidence for owning subsystem does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Fixed Step Sessions should be treated as an observation rather than a confirmed cause. The point matters in runtime state because following deterministic runtime updates can otherwise be mistaken for using render cadence as the source of simulation truth. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Runtime State.',
          'When Understanding Fixed Step Sessions touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Understanding Fixed Step Sessions runtime state is a bounded explanation of session stepping: enough detail to act, and enough restraint to avoid claims outside Session Loop.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-fallback-path',
        title: 'Fixed Step Sessions Fallback Path',
        body: [
          'A frame can process only a bounded number of simulation substeps. Remaining accumulated time is reduced so the application can keep rendering and receiving input. Understanding Fixed Step Sessions uses the fact as fallback path evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Fallback Path.',
          'The surrounding context for Understanding Fixed Step Sessions decides which adjacent topic is relevant. Understanding Fixed Step Sessions should be compared with Understanding Render Snapshots, Understanding Saved Preferences, Switching Play Spaces only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Understanding Fixed Step Sessions crosses from fallback path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-diagnostic-output',
        title: 'Fixed Step Sessions Diagnostic Output',
        body: [
          'Understanding Fixed Step Sessions separates the surface that accepts input from the component or document that controls the result. This is especially important when following deterministic runtime updates crosses a saved value, a renderer output, or a public form. For Understanding Fixed Step Sessions, that fact identifies the first concrete boundary for diagnostic output: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Diagnostic Output.',
          'Recovery or follow-up for Understanding Fixed Step Sessions should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Fixed Step Sessions crosses from diagnostic output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-platform-reading',
        title: 'Fixed Step Sessions Platform Reading',
        body: [
          'A public report based on the data shape part of Understanding Fixed Step Sessions should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for platform reading: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Platform Reading.',
          'The main confusion risk in Understanding Fixed Step Sessions is using render cadence as the source of simulation truth. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use platform reading to keep Understanding Fixed Step Sessions tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-consumer-boundary',
        title: 'Fixed Step Sessions Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. For Understanding Fixed Step Sessions, that fact identifies the first concrete boundary for consumer boundary: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Consumer Boundary.',
          'Reportable evidence for Understanding Fixed Step Sessions should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the consumer boundary part of Understanding Fixed Step Sessions should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-failure-reading',
        title: 'Fixed Step Sessions Failure Reading',
        body: [
          'Ownership in Understanding Fixed Step Sessions is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. In Understanding Fixed Step Sessions, failure reading is the difference between reading session stepping and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Failure Reading.',
          'Adjacent pages matter for Understanding Fixed Step Sessions, but adjacency does not move authority. Understanding Fixed Step Sessions should be compared with Understanding Render Snapshots, Understanding Saved Preferences, Switching Play Spaces only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Understanding Fixed Step Sessions should not use failure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-evidence-quality',
        title: 'Fixed Step Sessions Evidence Quality',
        body: [
          'Understanding Fixed Step Sessions should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. Understanding Fixed Step Sessions uses the fact as evidence quality evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Evidence Quality.',
          'The public boundary for Understanding Fixed Step Sessions is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Understanding Fixed Step Sessions crosses from evidence quality into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-related-systems',
        title: 'Fixed Step Sessions Related Systems',
        body: [
          'Rendering can happen at a different cadence from simulation. The renderer receives snapshots from the latest session state rather than owning the step loop. For Understanding Fixed Step Sessions, that fact identifies the first concrete boundary for related systems: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Related Systems.',
          'An operator reading Understanding Fixed Step Sessions should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'When Understanding Fixed Step Sessions crosses from related systems into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-policy-limit',
        title: 'Fixed Step Sessions Policy Limit',
        body: [
          'Visible feedback for Understanding Fixed Step Sessions should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Session Loop. The point matters in policy limit because following deterministic runtime updates can otherwise be mistaken for using render cadence as the source of simulation truth. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Policy Limit.',
          'Implementation limits for Understanding Fixed Step Sessions keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Understanding Fixed Step Sessions policy limit is a bounded explanation of session stepping: enough detail to act, and enough restraint to avoid claims outside Session Loop.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-technical-summary',
        title: 'Fixed Step Sessions Technical Summary',
        body: [
          'The fixed-step runner accumulates frame time and advances the session in fixed simulation increments. Very large frame deltas are clamped to avoid runaway catch-up work. Understanding Fixed Step Sessions uses the fact as technical summary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Technical Summary.',
          'The summary value of Understanding Fixed Step Sessions is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Understanding Fixed Step Sessions crosses from technical summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-fixed-step-sessions-closing-check',
        title: 'Fixed Step Sessions Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Fixed Step Sessions. The article should be broad enough to explain session stepping, but narrow enough that using render cadence as the source of simulation truth remains outside the conclusion. The point matters in closing check because following deterministic runtime updates can otherwise be mistaken for using render cadence as the source of simulation truth. The local reading frame is Understanding Fixed Step Sessions / Runtime and Render State / Session Loop / Closing Check.',
          'A final check for Understanding Fixed Step Sessions should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Fixed Step Sessions should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Understanding Render Snapshots', 'Understanding Saved Preferences', 'Switching Play Spaces'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Session Loop',
    title: 'Understanding Render Snapshots',
    description:
      'Describes the immutable data Ludoxel sends from sessions to renderers. This page treats renderer contract behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-render-snapshots-contract-scope',
        title: 'Render Snapshots Contract Scope',
        body: [
          'Render snapshots include camera data, player model data, AI render samples, Othello render state, falling blocks, and block-break particles. They are data transfer objects. The point matters in contract scope because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Render Snapshots. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion.',
          'Understanding Render Snapshots should not use contract scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-render-snapshots-owning-subsystem',
        title: 'Render Snapshots Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Render Snapshots. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. The point matters in owning subsystem because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Owning Subsystem.',
          'A direct observation for Understanding Render Snapshots should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'The useful result of Understanding Render Snapshots owning subsystem is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Session Loop.',
        ],
      },
      {
        id: 'understanding-render-snapshots-data-shape',
        title: 'Render Snapshots Data Shape',
        body: [
          'Understanding Render Snapshots should not use contract scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for data shape: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Data Shape.',
          'Understanding Render Snapshots separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form.',
          'Use data shape to keep Understanding Render Snapshots tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-render-snapshots-handoff',
        title: 'Render Snapshots Handoff',
        body: [
          'Understanding Render Snapshots should be read as conceptual boundary for render snapshots within Runtime and Render State and Session Loop. That reading gives Understanding Render Snapshots a public anchor for handoff without adding behavior that the current category does not own. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Handoff.',
          'Ownership in Understanding Render Snapshots is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'If the available evidence for handoff does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Render Snapshots should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-render-snapshots-backend-or-service',
        title: 'Render Snapshots Backend or Service',
        body: [
          'A direct observation for Understanding Render Snapshots should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. For Understanding Render Snapshots, that fact identifies the first concrete boundary for backend or service: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Backend or Service.',
          'Visible feedback for Understanding Render Snapshots should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Session Loop.',
          'A public report based on the backend or service part of Understanding Render Snapshots should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-render-snapshots-runtime-state',
        title: 'Render Snapshots Runtime State',
        body: [
          'The useful result of Understanding Render Snapshots owning subsystem is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Session Loop. The point matters in runtime state because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Runtime State.',
          'When Understanding Render Snapshots touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding Render Snapshots should not use runtime state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-render-snapshots-fallback-path',
        title: 'Render Snapshots Fallback Path',
        body: [
          'The renderer draws from the snapshot but does not mutate the session. World edits, player movement, AI decisions, and Othello moves remain in simulation and application managers. Understanding Render Snapshots uses the fact as fallback path evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Fallback Path.',
          'The surrounding context for Understanding Render Snapshots decides which adjacent topic is relevant. Understanding Render Snapshots should be compared with Understanding Fixed Step Sessions, Understanding OpenGL Rendering, Understanding WGPU Rendering only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use fallback path to keep Understanding Render Snapshots tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-render-snapshots-diagnostic-output',
        title: 'Render Snapshots Diagnostic Output',
        body: [
          'Understanding Render Snapshots separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form. Understanding Render Snapshots uses the fact as diagnostic output evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Diagnostic Output.',
          'Recovery or follow-up for Understanding Render Snapshots should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Render Snapshots crosses from diagnostic output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-render-snapshots-platform-reading',
        title: 'Render Snapshots Platform Reading',
        body: [
          'Use data shape to keep Understanding Render Snapshots tied to Runtime and Render State; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for platform reading: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Platform Reading.',
          'The main confusion risk in Understanding Render Snapshots is claiming parity without backend-specific evidence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the platform reading part of Understanding Render Snapshots should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-render-snapshots-consumer-boundary',
        title: 'Render Snapshots Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. Understanding Render Snapshots uses the fact as consumer boundary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Consumer Boundary.',
          'Reportable evidence for Understanding Render Snapshots should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use consumer boundary to keep Understanding Render Snapshots tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-render-snapshots-failure-reading',
        title: 'Render Snapshots Failure Reading',
        body: [
          'Ownership in Understanding Render Snapshots is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The point matters in failure reading because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Failure Reading.',
          'Adjacent pages matter for Understanding Render Snapshots, but adjacency does not move authority. Understanding Render Snapshots should be compared with Understanding Fixed Step Sessions, Understanding OpenGL Rendering, Understanding WGPU Rendering only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Understanding Render Snapshots should not use failure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-render-snapshots-evidence-quality',
        title: 'Render Snapshots Evidence Quality',
        body: [
          'If the available evidence for handoff does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Render Snapshots should be treated as an observation rather than a confirmed cause. For Understanding Render Snapshots, that fact identifies the first concrete boundary for evidence quality: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Evidence Quality.',
          'The public boundary for Understanding Render Snapshots is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Understanding Render Snapshots crosses from evidence quality into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-render-snapshots-related-systems',
        title: 'Render Snapshots Related Systems',
        body: [
          'Snapshot problems often show up as missing visuals, stale chunks, wrong camera framing, or incorrect AI display. Diagnose those separately from saved-state and input issues. Understanding Render Snapshots uses the fact as related systems evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Related Systems.',
          'An operator reading Understanding Render Snapshots should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'When Understanding Render Snapshots crosses from related systems into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-render-snapshots-policy-limit',
        title: 'Render Snapshots Policy Limit',
        body: [
          'Visible feedback for Understanding Render Snapshots should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Session Loop. That reading gives Understanding Render Snapshots a public anchor for policy limit without adding behavior that the current category does not own. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Policy Limit.',
          'Implementation limits for Understanding Render Snapshots keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Understanding Render Snapshots policy limit is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Session Loop.',
        ],
      },
      {
        id: 'understanding-render-snapshots-technical-summary',
        title: 'Render Snapshots Technical Summary',
        body: [
          'Render snapshots include camera data, player model data, AI render samples, Othello render state, falling blocks, and block-break particles. They are data transfer objects. The fact also tells the reader which evidence to preserve for technical summary: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Technical Summary.',
          'The summary value of Understanding Render Snapshots is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the technical summary part of Understanding Render Snapshots should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-render-snapshots-closing-check',
        title: 'Render Snapshots Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Render Snapshots. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. The point matters in closing check because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Render Snapshots / Runtime and Render State / Session Loop / Closing Check.',
          'A final check for Understanding Render Snapshots should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Understanding Render Snapshots closing check is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Session Loop.',
        ],
      },
    ],
    relatedTitles: ['Understanding Fixed Step Sessions', 'Understanding OpenGL Rendering', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Saved Preferences',
    description:
      'Explains how user preferences are normalized, applied, and persisted. This page treats runtime preferences as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-saved-preferences-contract-scope',
        title: 'Saved Preferences Contract Scope',
        body: [
          'Runtime preferences cover camera, rendering, clouds, shadows, audio, keybinds, player identity, skin source, movement, hotbar branch, Othello, and window state. In Understanding Saved Preferences, contract scope is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Contract Scope. In Understanding Saved Preferences, contract scope is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Saved Preferences. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion.',
          'Understanding Saved Preferences should not use contract scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-saved-preferences-owning-subsystem',
        title: 'Saved Preferences Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Saved Preferences. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion. The point matters in owning subsystem because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Owning Subsystem.',
          'A direct observation for Understanding Saved Preferences should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'Understanding Saved Preferences should not use owning subsystem to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-saved-preferences-data-shape',
        title: 'Saved Preferences Data Shape',
        body: [
          'Understanding Saved Preferences should not use contract scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for data shape: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Data Shape.',
          'Understanding Saved Preferences separates the surface that accepts input from the component or document that controls the result. This is especially important when changing normalized user values crosses a saved value, a renderer output, or a public form.',
          'A public report based on the data shape part of Understanding Saved Preferences should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-saved-preferences-handoff',
        title: 'Saved Preferences Handoff',
        body: [
          'Understanding Saved Preferences should be read as conceptual boundary for saved preferences within Runtime and Render State and Preferences and Input Boundaries. In Understanding Saved Preferences, handoff is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Handoff.',
          'Ownership in Understanding Saved Preferences is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'If the available evidence for handoff does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Saved Preferences should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-saved-preferences-backend-or-service',
        title: 'Saved Preferences Backend or Service',
        body: [
          'A direct observation for Understanding Saved Preferences should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. Understanding Saved Preferences uses the fact as backend or service evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Backend or Service.',
          'Visible feedback for Understanding Saved Preferences should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Preferences and Input Boundaries.',
          'Use backend or service to keep Understanding Saved Preferences tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-saved-preferences-runtime-state',
        title: 'Saved Preferences Runtime State',
        body: [
          'Understanding Saved Preferences should not use owning subsystem to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Understanding Saved Preferences a public anchor for runtime state without adding behavior that the current category does not own. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Runtime State.',
          'When Understanding Saved Preferences touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for runtime state does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Saved Preferences should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-saved-preferences-fallback-path',
        title: 'Saved Preferences Fallback Path',
        body: [
          'Each preference type normalizes unknown, missing, or out-of-range values before use. This protects the running session and saved schema from invalid local edits. The fact also tells the reader which evidence to preserve for fallback path: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Fallback Path.',
          'The surrounding context for Understanding Saved Preferences decides which adjacent topic is relevant. Understanding Saved Preferences should be compared with Reading Saved Preferences, Locating User Data, Changing Camera Preferences only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use fallback path to keep Understanding Saved Preferences tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-saved-preferences-diagnostic-output',
        title: 'Saved Preferences Diagnostic Output',
        body: [
          'Understanding Saved Preferences separates the surface that accepts input from the component or document that controls the result. This is especially important when changing normalized user values crosses a saved value, a renderer output, or a public form. For Understanding Saved Preferences, that fact identifies the first concrete boundary for diagnostic output: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Diagnostic Output.',
          'Recovery or follow-up for Understanding Saved Preferences should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Saved Preferences crosses from diagnostic output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-saved-preferences-platform-reading',
        title: 'Saved Preferences Platform Reading',
        body: [
          'A public report based on the data shape part of Understanding Saved Preferences should state the action, expected result, actual result, environment, and any redaction needed before sharing. For Understanding Saved Preferences, that fact identifies the first concrete boundary for platform reading: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Platform Reading.',
          'The main confusion risk in Understanding Saved Preferences is treating a settings control as unrelated to persistence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the platform reading part of Understanding Saved Preferences should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-saved-preferences-consumer-boundary',
        title: 'Saved Preferences Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. In Understanding Saved Preferences, handoff is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Handoff. For Understanding Saved Preferences, that fact identifies the first concrete boundary for consumer boundary: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Consumer Boundary.',
          'Reportable evidence for Understanding Saved Preferences should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the consumer boundary part of Understanding Saved Preferences should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-saved-preferences-failure-reading',
        title: 'Saved Preferences Failure Reading',
        body: [
          'Ownership in Understanding Saved Preferences is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The point matters in failure reading because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Failure Reading.',
          'Adjacent pages matter for Understanding Saved Preferences, but adjacency does not move authority. Understanding Saved Preferences should be compared with Reading Saved Preferences, Locating User Data, Changing Camera Preferences only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Understanding Saved Preferences failure reading is a bounded explanation of runtime preferences: enough detail to act, and enough restraint to avoid claims outside Preferences and Input Boundaries.',
        ],
      },
      {
        id: 'understanding-saved-preferences-evidence-quality',
        title: 'Saved Preferences Evidence Quality',
        body: [
          'If the available evidence for handoff does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Saved Preferences should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for evidence quality: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Evidence Quality.',
          'The public boundary for Understanding Saved Preferences is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use evidence quality to keep Understanding Saved Preferences tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-saved-preferences-related-systems',
        title: 'Saved Preferences Related Systems',
        body: [
          'Preferences are decoded from saved state, applied to the session and renderer runtime state, and written back through persistence stores. UI widgets do not own the file schema. Understanding Saved Preferences uses the fact as backend or service evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Backend or Service. The fact also tells the reader which evidence to preserve for related systems: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Related Systems.',
          'An operator reading Understanding Saved Preferences should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the related systems part of Understanding Saved Preferences should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-saved-preferences-policy-limit',
        title: 'Saved Preferences Policy Limit',
        body: [
          'Visible feedback for Understanding Saved Preferences should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Preferences and Input Boundaries. In Understanding Saved Preferences, policy limit is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Policy Limit.',
          'Implementation limits for Understanding Saved Preferences keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Understanding Saved Preferences should not use policy limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-saved-preferences-technical-summary',
        title: 'Saved Preferences Technical Summary',
        body: [
          'Runtime preferences cover camera, rendering, clouds, shadows, audio, keybinds, player identity, skin source, movement, hotbar branch, Othello, and window state. In Understanding Saved Preferences, contract scope is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Contract Scope. For Understanding Saved Preferences, that fact identifies the first concrete boundary for technical summary: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Technical Summary.',
          'The summary value of Understanding Saved Preferences is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the technical summary part of Understanding Saved Preferences should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-saved-preferences-closing-check',
        title: 'Saved Preferences Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Saved Preferences. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion. The point matters in closing check because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Understanding Saved Preferences / Runtime and Render State / Preferences and Input Boundaries / Closing Check.',
          'A final check for Understanding Saved Preferences should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Saved Preferences should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Reading Saved Preferences', 'Locating User Data', 'Changing Camera Preferences'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Keybind Resolution',
    description:
      'Explains how Ludoxel maps configured keys to gameplay actions. This page treats runtime preferences as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-keybind-resolution-contract-scope',
        title: 'Keybind Resolution Contract Scope',
        body: [
          'Each action is bound to a single key. Defaults cover movement, jump, crouch, sprint, inventory, creative mode, camera cycling, HUD/debug toggles, clearing the slot, and hotbar slots. Understanding Keybind Resolution uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Contract Scope. Understanding Keybind Resolution uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Keybind Resolution. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion.',
          'Use contract scope to keep Understanding Keybind Resolution tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-owning-subsystem',
        title: 'Keybind Resolution Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Keybind Resolution. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion. The fact also tells the reader which evidence to preserve for owning subsystem: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Owning Subsystem.',
          'A direct observation for Understanding Keybind Resolution should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'Use owning subsystem to keep Understanding Keybind Resolution tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-data-shape',
        title: 'Keybind Resolution Data Shape',
        body: [
          'Use contract scope to keep Understanding Keybind Resolution tied to Runtime and Render State; use a related page only when the reader needs a different owner. The point matters in data shape because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Data Shape.',
          'Understanding Keybind Resolution separates the surface that accepts input from the component or document that controls the result. This is especially important when changing normalized user values crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding Keybind Resolution data shape is a bounded explanation of runtime preferences: enough detail to act, and enough restraint to avoid claims outside Preferences and Input Boundaries.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-handoff',
        title: 'Keybind Resolution Handoff',
        body: [
          'Understanding Keybind Resolution should be read as conceptual boundary for keybind resolution within Runtime and Render State and Preferences and Input Boundaries. For Understanding Keybind Resolution, that fact identifies the first concrete boundary for handoff: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Handoff.',
          'Ownership in Understanding Keybind Resolution is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'When Understanding Keybind Resolution crosses from handoff into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-backend-or-service',
        title: 'Keybind Resolution Backend or Service',
        body: [
          'A direct observation for Understanding Keybind Resolution should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. The point matters in backend or service because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Backend or Service.',
          'Visible feedback for Understanding Keybind Resolution should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Preferences and Input Boundaries.',
          'The useful result of Understanding Keybind Resolution backend or service is a bounded explanation of runtime preferences: enough detail to act, and enough restraint to avoid claims outside Preferences and Input Boundaries.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-runtime-state',
        title: 'Keybind Resolution Runtime State',
        body: [
          'Use owning subsystem to keep Understanding Keybind Resolution tied to Runtime and Render State; use a related page only when the reader needs a different owner. Understanding Keybind Resolution uses the fact as runtime state evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Runtime State.',
          'When Understanding Keybind Resolution touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Understanding Keybind Resolution crosses from runtime state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-fallback-path',
        title: 'Keybind Resolution Fallback Path',
        body: [
          'When a key is assigned to a new action, the previous owner is unbound. Unknown or invalid bindings normalize to an unbound state. In Understanding Keybind Resolution, fallback path is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Fallback Path.',
          'The surrounding context for Understanding Keybind Resolution decides which adjacent topic is relevant. Understanding Keybind Resolution should be compared with Changing Keybind Preferences, Using Mouse Capture, Understanding Overlay Input Blocking only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding Keybind Resolution should not use fallback path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-diagnostic-output',
        title: 'Keybind Resolution Diagnostic Output',
        body: [
          'Understanding Keybind Resolution separates the surface that accepts input from the component or document that controls the result. This is especially important when changing normalized user values crosses a saved value, a renderer output, or a public form. The point matters in diagnostic output because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Diagnostic Output.',
          'Recovery or follow-up for Understanding Keybind Resolution should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Understanding Keybind Resolution should not use diagnostic output to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-platform-reading',
        title: 'Keybind Resolution Platform Reading',
        body: [
          'The useful result of Understanding Keybind Resolution data shape is a bounded explanation of runtime preferences: enough detail to act, and enough restraint to avoid claims outside Preferences and Input Boundaries. The point matters in platform reading because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Platform Reading.',
          'The main confusion risk in Understanding Keybind Resolution is treating a settings control as unrelated to persistence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Understanding Keybind Resolution should not use platform reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-consumer-boundary',
        title: 'Keybind Resolution Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. That reading gives Understanding Keybind Resolution a public anchor for consumer boundary without adding behavior that the current category does not own. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Consumer Boundary.',
          'Reportable evidence for Understanding Keybind Resolution should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for consumer boundary does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Keybind Resolution should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-failure-reading',
        title: 'Keybind Resolution Failure Reading',
        body: [
          'Ownership in Understanding Keybind Resolution is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. For Understanding Keybind Resolution, that fact identifies the first concrete boundary for failure reading: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Failure Reading.',
          'Adjacent pages matter for Understanding Keybind Resolution, but adjacency does not move authority. Understanding Keybind Resolution should be compared with Changing Keybind Preferences, Using Mouse Capture, Understanding Overlay Input Blocking only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the failure reading part of Understanding Keybind Resolution should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-evidence-quality',
        title: 'Keybind Resolution Evidence Quality',
        body: [
          'When Understanding Keybind Resolution crosses from handoff into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Understanding Keybind Resolution a public anchor for evidence quality without adding behavior that the current category does not own. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Evidence Quality.',
          'The public boundary for Understanding Keybind Resolution is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding Keybind Resolution evidence quality is a bounded explanation of runtime preferences: enough detail to act, and enough restraint to avoid claims outside Preferences and Input Boundaries.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-related-systems',
        title: 'Keybind Resolution Related Systems',
        body: [
          'Keybind resolution depends on focus. Search fields, settings dialogs, inventory, death screens, and pause surfaces can consume keys before gameplay receives them. The point matters in related systems because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Related Systems.',
          'An operator reading Understanding Keybind Resolution should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'Understanding Keybind Resolution should not use related systems to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-policy-limit',
        title: 'Keybind Resolution Policy Limit',
        body: [
          'Visible feedback for Understanding Keybind Resolution should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Preferences and Input Boundaries. The fact also tells the reader which evidence to preserve for policy limit: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Policy Limit.',
          'Implementation limits for Understanding Keybind Resolution keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the policy limit part of Understanding Keybind Resolution should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-technical-summary',
        title: 'Keybind Resolution Technical Summary',
        body: [
          'Each action is bound to a single key. Defaults cover movement, jump, crouch, sprint, inventory, creative mode, camera cycling, HUD/debug toggles, clearing the slot, and hotbar slots. Understanding Keybind Resolution uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Contract Scope. In Understanding Keybind Resolution, technical summary is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Technical Summary.',
          'The summary value of Understanding Keybind Resolution is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Keybind Resolution should not use technical summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-keybind-resolution-closing-check',
        title: 'Keybind Resolution Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Keybind Resolution. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion. Understanding Keybind Resolution uses the fact as closing check evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Keybind Resolution / Runtime and Render State / Preferences and Input Boundaries / Closing Check.',
          'A final check for Understanding Keybind Resolution should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding Keybind Resolution tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Changing Keybind Preferences', 'Using Mouse Capture', 'Understanding Overlay Input Blocking'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Overlay Input Blocking',
    description:
      'Describes how overlays protect dialogs and gameplay from conflicting input. This page treats block construction as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-overlay-input-blocking-contract-scope',
        title: 'Overlay Input Blocking Contract Scope',
        body: [
          'Blocking overlays take focus for dialog controls, search boxes, close buttons, settings rows, or recovery actions. Gameplay capture and hotbar shortcuts should not leak through while they are active. That reading gives Understanding Overlay Input Blocking a public anchor for contract scope without adding behavior that the current category does not own. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Overlay Input Blocking. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion.',
          'If the available evidence for contract scope does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Overlay Input Blocking should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-owning-subsystem',
        title: 'Overlay Input Blocking Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Overlay Input Blocking. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion. That reading gives Understanding Overlay Input Blocking a public anchor for owning subsystem without adding behavior that the current category does not own. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Owning Subsystem.',
          'A direct observation for Understanding Overlay Input Blocking should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'The useful result of Understanding Overlay Input Blocking owning subsystem is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Preferences and Input Boundaries.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-data-shape',
        title: 'Overlay Input Blocking Data Shape',
        body: [
          'If the available evidence for contract scope does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Overlay Input Blocking should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for data shape: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Data Shape.',
          'Understanding Overlay Input Blocking separates the surface that accepts input from the component or document that controls the result. This is especially important when placing or interpreting world blocks crosses a saved value, a renderer output, or a public form.',
          'A public report based on the data shape part of Understanding Overlay Input Blocking should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-handoff',
        title: 'Overlay Input Blocking Handoff',
        body: [
          'Understanding Overlay Input Blocking should be read as conceptual boundary for overlay input blocking within Runtime and Render State and Preferences and Input Boundaries. The point matters in handoff because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Handoff.',
          'Ownership in Understanding Overlay Input Blocking is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'Understanding Overlay Input Blocking should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-backend-or-service',
        title: 'Overlay Input Blocking Backend or Service',
        body: [
          'A direct observation for Understanding Overlay Input Blocking should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for backend or service: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Backend or Service.',
          'Visible feedback for Understanding Overlay Input Blocking should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Preferences and Input Boundaries.',
          'A public report based on the backend or service part of Understanding Overlay Input Blocking should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-runtime-state',
        title: 'Overlay Input Blocking Runtime State',
        body: [
          'The useful result of Understanding Overlay Input Blocking owning subsystem is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Preferences and Input Boundaries. That reading gives Understanding Overlay Input Blocking a public anchor for runtime state without adding behavior that the current category does not own. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Runtime State.',
          'When Understanding Overlay Input Blocking touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for runtime state does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Overlay Input Blocking should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-fallback-path',
        title: 'Overlay Input Blocking Fallback Path',
        body: [
          'Overlay actions communicate through controllers, signals, or session managers. That keeps UI actions from bypassing simulation validation or saved-state normalization. Understanding Overlay Input Blocking uses the fact as fallback path evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Fallback Path.',
          'The surrounding context for Understanding Overlay Input Blocking decides which adjacent topic is relevant. Understanding Overlay Input Blocking should be compared with Using the Inventory Overlay, Recovering after Death, Understanding Keybind Resolution only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Understanding Overlay Input Blocking crosses from fallback path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-diagnostic-output',
        title: 'Overlay Input Blocking Diagnostic Output',
        body: [
          'Understanding Overlay Input Blocking separates the surface that accepts input from the component or document that controls the result. This is especially important when placing or interpreting world blocks crosses a saved value, a renderer output, or a public form. Understanding Overlay Input Blocking uses the fact as diagnostic output evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Diagnostic Output.',
          'Recovery or follow-up for Understanding Overlay Input Blocking should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use diagnostic output to keep Understanding Overlay Input Blocking tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-platform-reading',
        title: 'Overlay Input Blocking Platform Reading',
        body: [
          'A public report based on the data shape part of Understanding Overlay Input Blocking should state the action, expected result, actual result, environment, and any redaction needed before sharing. Understanding Overlay Input Blocking uses the fact as platform reading evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Platform Reading.',
          'The main confusion risk in Understanding Overlay Input Blocking is treating every block shape as a full-cube collision rule. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Understanding Overlay Input Blocking crosses from platform reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-consumer-boundary',
        title: 'Overlay Input Blocking Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. Understanding Overlay Input Blocking uses the fact as consumer boundary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Consumer Boundary.',
          'Reportable evidence for Understanding Overlay Input Blocking should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Understanding Overlay Input Blocking crosses from consumer boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-failure-reading',
        title: 'Overlay Input Blocking Failure Reading',
        body: [
          'Ownership in Understanding Overlay Input Blocking is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. That reading gives Understanding Overlay Input Blocking a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Failure Reading.',
          'Adjacent pages matter for Understanding Overlay Input Blocking, but adjacency does not move authority. Understanding Overlay Input Blocking should be compared with Using the Inventory Overlay, Recovering after Death, Understanding Keybind Resolution only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Overlay Input Blocking should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-evidence-quality',
        title: 'Overlay Input Blocking Evidence Quality',
        body: [
          'Understanding Overlay Input Blocking should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Understanding Overlay Input Blocking, that fact identifies the first concrete boundary for evidence quality: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Evidence Quality.',
          'The public boundary for Understanding Overlay Input Blocking is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the evidence quality part of Understanding Overlay Input Blocking should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-related-systems',
        title: 'Overlay Input Blocking Related Systems',
        body: [
          'If input seems ignored, check whether an overlay is active, whether the search box has focus, and whether the viewport has recaptured the mouse after closing the surface. The fact also tells the reader which evidence to preserve for related systems: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Related Systems.',
          'An operator reading Understanding Overlay Input Blocking should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the related systems part of Understanding Overlay Input Blocking should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-policy-limit',
        title: 'Overlay Input Blocking Policy Limit',
        body: [
          'Visible feedback for Understanding Overlay Input Blocking should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Runtime and Render State / Preferences and Input Boundaries. That reading gives Understanding Overlay Input Blocking a public anchor for policy limit without adding behavior that the current category does not own. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Policy Limit.',
          'Implementation limits for Understanding Overlay Input Blocking keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for policy limit does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Overlay Input Blocking should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-technical-summary',
        title: 'Overlay Input Blocking Technical Summary',
        body: [
          'Blocking overlays take focus for dialog controls, search boxes, close buttons, settings rows, or recovery actions. Gameplay capture and hotbar shortcuts should not leak through while they are active. The fact also tells the reader which evidence to preserve for technical summary: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Technical Summary.',
          'The summary value of Understanding Overlay Input Blocking is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use technical summary to keep Understanding Overlay Input Blocking tied to Runtime and Render State; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-overlay-input-blocking-closing-check',
        title: 'Overlay Input Blocking Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Overlay Input Blocking. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion. The point matters in closing check because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Understanding Overlay Input Blocking / Runtime and Render State / Preferences and Input Boundaries / Closing Check.',
          'A final check for Understanding Overlay Input Blocking should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Overlay Input Blocking should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Using the Inventory Overlay', 'Recovering after Death', 'Understanding Keybind Resolution'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'Backend Implementations',
    title: 'Understanding OpenGL Rendering',
    description:
      'Explains the OpenGL backend responsibilities used by the desktop renderer path. This page treats renderer contract behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-opengl-rendering-contract-scope',
        title: 'OpenGL Rendering Contract Scope',
        body: [
          'The OpenGL backend owns shader programs, texture atlases, chunk payload submission, selection lines, shadows, clouds, first-person geometry, player models, Othello visuals, and frame metrics. That reading gives Understanding OpenGL Rendering a public anchor for contract scope without adding behavior that the current category does not own. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Contract Scope.',
          'Contract Scope defines the useful size of Understanding OpenGL Rendering. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion.',
          'If the available evidence for contract scope does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding OpenGL Rendering should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-owning-subsystem',
        title: 'OpenGL Rendering Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding OpenGL Rendering. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. In Understanding OpenGL Rendering, owning subsystem is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Owning Subsystem.',
          'A direct observation for Understanding OpenGL Rendering should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'If the available evidence for owning subsystem does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding OpenGL Rendering should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-data-shape',
        title: 'OpenGL Rendering Data Shape',
        body: [
          'If the available evidence for contract scope does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding OpenGL Rendering should be treated as an observation rather than a confirmed cause. Understanding OpenGL Rendering uses the fact as data shape evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Data Shape.',
          'Understanding OpenGL Rendering separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form.',
          'Use data shape to keep Understanding OpenGL Rendering tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-handoff',
        title: 'OpenGL Rendering Handoff',
        body: [
          'Understanding OpenGL Rendering should be read as conceptual boundary for opengl rendering within Rendering Backends and Backend Implementations. In Understanding OpenGL Rendering, owning subsystem is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Owning Subsystem. The point matters in handoff because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Handoff.',
          'Ownership in Understanding OpenGL Rendering is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'Understanding OpenGL Rendering should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-backend-or-service',
        title: 'OpenGL Rendering Backend or Service',
        body: [
          'A direct observation for Understanding OpenGL Rendering should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for backend or service: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Backend or Service.',
          'Visible feedback for Understanding OpenGL Rendering should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Rendering Backends / Backend Implementations.',
          'A public report based on the backend or service part of Understanding OpenGL Rendering should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-runtime-state',
        title: 'OpenGL Rendering Runtime State',
        body: [
          'If the available evidence for owning subsystem does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding OpenGL Rendering should be treated as an observation rather than a confirmed cause. In Understanding OpenGL Rendering, runtime state is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Runtime State.',
          'When Understanding OpenGL Rendering touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding OpenGL Rendering should not use runtime state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-fallback-path',
        title: 'OpenGL Rendering Fallback Path',
        body: [
          'The backend implements the renderer API. It receives assets, block registry data, runtime state, chunk faces, player skins, and render snapshots through that contract. Understanding OpenGL Rendering uses the fact as data shape evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Data Shape. For Understanding OpenGL Rendering, that fact identifies the first concrete boundary for fallback path: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Fallback Path.',
          'The surrounding context for Understanding OpenGL Rendering decides which adjacent topic is relevant. Understanding OpenGL Rendering should be compared with Understanding WGPU Rendering, Understanding Render Distance Fog and Shadows, Understanding Selection Outlines only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the fallback path part of Understanding OpenGL Rendering should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-diagnostic-output',
        title: 'OpenGL Rendering Diagnostic Output',
        body: [
          'Understanding OpenGL Rendering separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for diagnostic output: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Diagnostic Output.',
          'Recovery or follow-up for Understanding OpenGL Rendering should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding OpenGL Rendering crosses from diagnostic output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-platform-reading',
        title: 'OpenGL Rendering Platform Reading',
        body: [
          'Use data shape to keep Understanding OpenGL Rendering tied to Rendering Backends; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for platform reading: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Platform Reading.',
          'The main confusion risk in Understanding OpenGL Rendering is claiming parity without backend-specific evidence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use platform reading to keep Understanding OpenGL Rendering tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-consumer-boundary',
        title: 'OpenGL Rendering Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. Understanding OpenGL Rendering uses the fact as consumer boundary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Consumer Boundary.',
          'Reportable evidence for Understanding OpenGL Rendering should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Understanding OpenGL Rendering crosses from consumer boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-failure-reading',
        title: 'OpenGL Rendering Failure Reading',
        body: [
          'Ownership in Understanding OpenGL Rendering is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. In Understanding OpenGL Rendering, failure reading is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Failure Reading.',
          'Adjacent pages matter for Understanding OpenGL Rendering, but adjacency does not move authority. Understanding OpenGL Rendering should be compared with Understanding WGPU Rendering, Understanding Render Distance Fog and Shadows, Understanding Selection Outlines only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Understanding OpenGL Rendering should not use failure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-evidence-quality',
        title: 'OpenGL Rendering Evidence Quality',
        body: [
          'Understanding OpenGL Rendering should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Understanding OpenGL Rendering, that fact identifies the first concrete boundary for evidence quality: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Evidence Quality.',
          'The public boundary for Understanding OpenGL Rendering is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the evidence quality part of Understanding OpenGL Rendering should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-related-systems',
        title: 'OpenGL Rendering Related Systems',
        body: [
          'OpenGL behavior should not be generalized to the WGPU backend without checking parity. The two backends share a contract but use different resource and pipeline implementations. Understanding OpenGL Rendering uses the fact as related systems evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Related Systems.',
          'An operator reading Understanding OpenGL Rendering should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'Use related systems to keep Understanding OpenGL Rendering tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-policy-limit',
        title: 'OpenGL Rendering Policy Limit',
        body: [
          'Visible feedback for Understanding OpenGL Rendering should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Rendering Backends / Backend Implementations. In Understanding OpenGL Rendering, policy limit is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Policy Limit.',
          'Implementation limits for Understanding OpenGL Rendering keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Understanding OpenGL Rendering should not use policy limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-technical-summary',
        title: 'OpenGL Rendering Technical Summary',
        body: [
          'The OpenGL backend owns shader programs, texture atlases, chunk payload submission, selection lines, shadows, clouds, first-person geometry, player models, Othello visuals, and frame metrics. Understanding OpenGL Rendering uses the fact as technical summary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Technical Summary.',
          'The summary value of Understanding OpenGL Rendering is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Understanding OpenGL Rendering crosses from technical summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-opengl-rendering-closing-check',
        title: 'OpenGL Rendering Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding OpenGL Rendering. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. That reading gives Understanding OpenGL Rendering a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Understanding OpenGL Rendering / Rendering Backends / Backend Implementations / Closing Check.',
          'A final check for Understanding OpenGL Rendering should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Understanding OpenGL Rendering closing check is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Backend Implementations.',
        ],
      },
    ],
    relatedTitles: ['Understanding WGPU Rendering', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'Backend Implementations',
    title: 'Understanding WGPU Rendering',
    description:
      'Explains the WGPU renderer path and how it relates to the OpenGL path. This page treats renderer contract behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-wgpu-rendering-contract-scope',
        title: 'WGPU Rendering Contract Scope',
        body: [
          'The WGPU backend owns its surface, resources, meshes, shader sources, textures, and pipeline setup for the macOS-oriented renderer path. That reading gives Understanding WGPU Rendering a public anchor for contract scope without adding behavior that the current category does not own. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Contract Scope.',
          'Contract Scope defines the useful size of Understanding WGPU Rendering. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion.',
          'The useful result of Understanding WGPU Rendering contract scope is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Backend Implementations.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-owning-subsystem',
        title: 'WGPU Rendering Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding WGPU Rendering. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. The point matters in owning subsystem because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Owning Subsystem.',
          'A direct observation for Understanding WGPU Rendering should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'The useful result of Understanding WGPU Rendering owning subsystem is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Backend Implementations.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-data-shape',
        title: 'WGPU Rendering Data Shape',
        body: [
          'The useful result of Understanding WGPU Rendering contract scope is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Backend Implementations. The fact also tells the reader which evidence to preserve for data shape: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Data Shape.',
          'Understanding WGPU Rendering separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form.',
          'Use data shape to keep Understanding WGPU Rendering tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-handoff',
        title: 'WGPU Rendering Handoff',
        body: [
          'Understanding WGPU Rendering should be read as conceptual boundary for wgpu rendering within Rendering Backends and Backend Implementations. The point matters in handoff because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Handoff.',
          'Ownership in Understanding WGPU Rendering is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'The useful result of Understanding WGPU Rendering handoff is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Backend Implementations.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-backend-or-service',
        title: 'WGPU Rendering Backend or Service',
        body: [
          'A direct observation for Understanding WGPU Rendering should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. Understanding WGPU Rendering uses the fact as backend or service evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Backend or Service.',
          'Visible feedback for Understanding WGPU Rendering should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Rendering Backends / Backend Implementations.',
          'When Understanding WGPU Rendering crosses from backend or service into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-runtime-state',
        title: 'WGPU Rendering Runtime State',
        body: [
          'The useful result of Understanding WGPU Rendering owning subsystem is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Backend Implementations. That reading gives Understanding WGPU Rendering a public anchor for runtime state without adding behavior that the current category does not own. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Runtime State.',
          'When Understanding WGPU Rendering touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Understanding WGPU Rendering runtime state is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Backend Implementations.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-fallback-path',
        title: 'WGPU Rendering Fallback Path',
        body: [
          'WGPU uses the same renderer-facing contract as the OpenGL path. Camera data, chunk payloads, runtime state, player skins, and Othello render state should mean the same thing. For Understanding WGPU Rendering, that fact identifies the first concrete boundary for fallback path: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Fallback Path.',
          'The surrounding context for Understanding WGPU Rendering decides which adjacent topic is relevant. Understanding WGPU Rendering should be compared with Understanding OpenGL Rendering, Understanding Render Distance Fog and Shadows, Understanding Selection Outlines only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Understanding WGPU Rendering crosses from fallback path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-diagnostic-output',
        title: 'WGPU Rendering Diagnostic Output',
        body: [
          'Understanding WGPU Rendering separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form. For Understanding WGPU Rendering, that fact identifies the first concrete boundary for diagnostic output: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Diagnostic Output.',
          'Recovery or follow-up for Understanding WGPU Rendering should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the diagnostic output part of Understanding WGPU Rendering should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-platform-reading',
        title: 'WGPU Rendering Platform Reading',
        body: [
          'Use data shape to keep Understanding WGPU Rendering tied to Rendering Backends; use a related page only when the reader needs a different owner. Understanding WGPU Rendering uses the fact as platform reading evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Platform Reading.',
          'The main confusion risk in Understanding WGPU Rendering is claiming parity without backend-specific evidence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use platform reading to keep Understanding WGPU Rendering tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-consumer-boundary',
        title: 'WGPU Rendering Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. Understanding WGPU Rendering uses the fact as consumer boundary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Consumer Boundary.',
          'Reportable evidence for Understanding WGPU Rendering should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use consumer boundary to keep Understanding WGPU Rendering tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-failure-reading',
        title: 'WGPU Rendering Failure Reading',
        body: [
          'Ownership in Understanding WGPU Rendering is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. In Understanding WGPU Rendering, failure reading is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Failure Reading.',
          'Adjacent pages matter for Understanding WGPU Rendering, but adjacency does not move authority. Understanding WGPU Rendering should be compared with Understanding OpenGL Rendering, Understanding Render Distance Fog and Shadows, Understanding Selection Outlines only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding WGPU Rendering should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-evidence-quality',
        title: 'WGPU Rendering Evidence Quality',
        body: [
          'The useful result of Understanding WGPU Rendering handoff is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside Backend Implementations. For Understanding WGPU Rendering, that fact identifies the first concrete boundary for evidence quality: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Evidence Quality.',
          'The public boundary for Understanding WGPU Rendering is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Understanding WGPU Rendering crosses from evidence quality into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-related-systems',
        title: 'WGPU Rendering Related Systems',
        body: [
          'When diagnosing WGPU rendering, compare world faces, clouds, selection outlines, UVs, shadows, first-person geometry, third-person camera, and pause overlay behavior against OpenGL expectations. Understanding WGPU Rendering uses the fact as backend or service evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Backend or Service. For Understanding WGPU Rendering, that fact identifies the first concrete boundary for related systems: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Related Systems.',
          'An operator reading Understanding WGPU Rendering should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the related systems part of Understanding WGPU Rendering should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-policy-limit',
        title: 'WGPU Rendering Policy Limit',
        body: [
          'Visible feedback for Understanding WGPU Rendering should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Rendering Backends / Backend Implementations. In Understanding WGPU Rendering, policy limit is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Policy Limit.',
          'Implementation limits for Understanding WGPU Rendering keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for policy limit does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding WGPU Rendering should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-technical-summary',
        title: 'WGPU Rendering Technical Summary',
        body: [
          'The WGPU backend owns its surface, resources, meshes, shader sources, textures, and pipeline setup for the macOS-oriented renderer path. For Understanding WGPU Rendering, that fact identifies the first concrete boundary for technical summary: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Technical Summary.',
          'The summary value of Understanding WGPU Rendering is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Understanding WGPU Rendering crosses from technical summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-wgpu-rendering-closing-check',
        title: 'WGPU Rendering Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding WGPU Rendering. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. That reading gives Understanding WGPU Rendering a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Understanding WGPU Rendering / Rendering Backends / Backend Implementations / Closing Check.',
          'A final check for Understanding WGPU Rendering should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding WGPU Rendering should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding Render Distance Fog and Shadows',
    description:
      'Explains how distance, fog, sun, and shadow settings reach the renderer. This page treats renderer contract behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-render-distance-fog-and-shadows-contract-scope',
        title: 'Render Distance Fog and Shadows Contract Scope',
        body: [
          'Render distance is stored as a chunk radius and controls the area uploaded around the player. It is normalized separately from shadow quality. That reading gives Understanding Render Distance Fog and Shadows a public anchor for contract scope without adding behavior that the current category does not own. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Render Distance Fog and Shadows. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion.',
          'The useful result of Understanding Render Distance Fog and Shadows contract scope is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside World Visuals.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-owning-subsystem',
        title: 'Render Distance Fog and Shadows Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Render Distance Fog and Shadows. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. In Understanding Render Distance Fog and Shadows, owning subsystem is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Owning Subsystem.',
          'A direct observation for Understanding Render Distance Fog and Shadows should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'Understanding Render Distance Fog and Shadows should not use owning subsystem to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-data-shape',
        title: 'Render Distance Fog and Shadows Data Shape',
        body: [
          'The useful result of Understanding Render Distance Fog and Shadows contract scope is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside World Visuals. For Understanding Render Distance Fog and Shadows, that fact identifies the first concrete boundary for data shape: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Data Shape.',
          'Understanding Render Distance Fog and Shadows separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form.',
          'A public report based on the data shape part of Understanding Render Distance Fog and Shadows should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-handoff',
        title: 'Render Distance Fog and Shadows Handoff',
        body: [
          'Understanding Render Distance Fog and Shadows should be read as conceptual boundary for render distance fog and shadows within Rendering Backends and World Visuals. In Understanding Render Distance Fog and Shadows, owning subsystem is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Owning Subsystem. In Understanding Render Distance Fog and Shadows, handoff is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Handoff.',
          'Ownership in Understanding Render Distance Fog and Shadows is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'Understanding Render Distance Fog and Shadows should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-backend-or-service',
        title: 'Render Distance Fog and Shadows Backend or Service',
        body: [
          'A direct observation for Understanding Render Distance Fog and Shadows should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. Understanding Render Distance Fog and Shadows uses the fact as backend or service evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Backend or Service.',
          'Visible feedback for Understanding Render Distance Fog and Shadows should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Rendering Backends / World Visuals.',
          'When Understanding Render Distance Fog and Shadows crosses from backend or service into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-runtime-state',
        title: 'Render Distance Fog and Shadows Runtime State',
        body: [
          'Understanding Render Distance Fog and Shadows should not use owning subsystem to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in runtime state because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Runtime State.',
          'When Understanding Render Distance Fog and Shadows touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding Render Distance Fog and Shadows should not use runtime state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-fallback-path',
        title: 'Render Distance Fog and Shadows Fallback Path',
        body: [
          'Sun azimuth, sun elevation, shadow enablement, shadow quality, debug shadow, and wireframe modes are part of renderer runtime state. The renderer reads those values per frame. Understanding Render Distance Fog and Shadows uses the fact as fallback path evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Fallback Path.',
          'The surrounding context for Understanding Render Distance Fog and Shadows decides which adjacent topic is relevant. Understanding Render Distance Fog and Shadows should be compared with Changing Shadow Preferences, Changing Cloud Preferences, Understanding OpenGL Rendering only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use fallback path to keep Understanding Render Distance Fog and Shadows tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-diagnostic-output',
        title: 'Render Distance Fog and Shadows Diagnostic Output',
        body: [
          'Understanding Render Distance Fog and Shadows separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for diagnostic output: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Diagnostic Output.',
          'Recovery or follow-up for Understanding Render Distance Fog and Shadows should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use diagnostic output to keep Understanding Render Distance Fog and Shadows tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-platform-reading',
        title: 'Render Distance Fog and Shadows Platform Reading',
        body: [
          'A public report based on the data shape part of Understanding Render Distance Fog and Shadows should state the action, expected result, actual result, environment, and any redaction needed before sharing. For Understanding Render Distance Fog and Shadows, that fact identifies the first concrete boundary for platform reading: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Platform Reading.',
          'The main confusion risk in Understanding Render Distance Fog and Shadows is claiming parity without backend-specific evidence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Understanding Render Distance Fog and Shadows crosses from platform reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-consumer-boundary',
        title: 'Render Distance Fog and Shadows Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. In Understanding Render Distance Fog and Shadows, handoff is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Handoff. The fact also tells the reader which evidence to preserve for consumer boundary: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Consumer Boundary.',
          'Reportable evidence for Understanding Render Distance Fog and Shadows should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the consumer boundary part of Understanding Render Distance Fog and Shadows should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-failure-reading',
        title: 'Render Distance Fog and Shadows Failure Reading',
        body: [
          'Ownership in Understanding Render Distance Fog and Shadows is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. In Understanding Render Distance Fog and Shadows, failure reading is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Failure Reading.',
          'Adjacent pages matter for Understanding Render Distance Fog and Shadows, but adjacency does not move authority. Understanding Render Distance Fog and Shadows should be compared with Changing Shadow Preferences, Changing Cloud Preferences, Understanding OpenGL Rendering only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Render Distance Fog and Shadows should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-evidence-quality',
        title: 'Render Distance Fog and Shadows Evidence Quality',
        body: [
          'Understanding Render Distance Fog and Shadows should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. Understanding Render Distance Fog and Shadows uses the fact as evidence quality evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Evidence Quality.',
          'The public boundary for Understanding Render Distance Fog and Shadows is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use evidence quality to keep Understanding Render Distance Fog and Shadows tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-related-systems',
        title: 'Render Distance Fog and Shadows Related Systems',
        body: [
          'Distance fog and shadow settings affect visual presentation and workload, but they do not change saved world blocks or Othello rules. Report renderer symptoms with backend and hardware details. Understanding Render Distance Fog and Shadows uses the fact as backend or service evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Backend or Service. For Understanding Render Distance Fog and Shadows, that fact identifies the first concrete boundary for related systems: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Related Systems.',
          'An operator reading Understanding Render Distance Fog and Shadows should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the related systems part of Understanding Render Distance Fog and Shadows should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-policy-limit',
        title: 'Render Distance Fog and Shadows Policy Limit',
        body: [
          'Visible feedback for Understanding Render Distance Fog and Shadows should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Rendering Backends / World Visuals. The point matters in policy limit because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Policy Limit.',
          'Implementation limits for Understanding Render Distance Fog and Shadows keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Understanding Render Distance Fog and Shadows should not use policy limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-technical-summary',
        title: 'Render Distance Fog and Shadows Technical Summary',
        body: [
          'Render distance is stored as a chunk radius and controls the area uploaded around the player. It is normalized separately from shadow quality. Understanding Render Distance Fog and Shadows uses the fact as technical summary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Technical Summary.',
          'The summary value of Understanding Render Distance Fog and Shadows is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use technical summary to keep Understanding Render Distance Fog and Shadows tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-render-distance-fog-and-shadows-closing-check',
        title: 'Render Distance Fog and Shadows Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Render Distance Fog and Shadows. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. That reading gives Understanding Render Distance Fog and Shadows a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Understanding Render Distance Fog and Shadows / Rendering Backends / World Visuals / Closing Check.',
          'A final check for Understanding Render Distance Fog and Shadows should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Render Distance Fog and Shadows should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Changing Shadow Preferences', 'Changing Cloud Preferences', 'Understanding OpenGL Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding Selection Outlines',
    description:
      'Explains how selected blocks receive shape-aware outlines. This page treats renderer contract behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-selection-outlines-contract-scope',
        title: 'Selection Outlines Contract Scope',
        body: [
          'Selection starts with a simulation pick target containing block position and state. If there is no valid target, the renderer clears the selection. The point matters in contract scope because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Selection Outlines. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion.',
          'Understanding Selection Outlines should not use contract scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-selection-outlines-owning-subsystem',
        title: 'Selection Outlines Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Selection Outlines. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. That reading gives Understanding Selection Outlines a public anchor for owning subsystem without adding behavior that the current category does not own. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Owning Subsystem.',
          'A direct observation for Understanding Selection Outlines should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'If the available evidence for owning subsystem does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Selection Outlines should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-selection-outlines-data-shape',
        title: 'Selection Outlines Data Shape',
        body: [
          'Understanding Selection Outlines should not use contract scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for data shape: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Data Shape.',
          'Understanding Selection Outlines separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form.',
          'Use data shape to keep Understanding Selection Outlines tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-selection-outlines-handoff',
        title: 'Selection Outlines Handoff',
        body: [
          'Understanding Selection Outlines should be read as conceptual boundary for selection outlines within Rendering Backends and World Visuals. The point matters in handoff because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Handoff.',
          'Ownership in Understanding Selection Outlines is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'The useful result of Understanding Selection Outlines handoff is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside World Visuals.',
        ],
      },
      {
        id: 'understanding-selection-outlines-backend-or-service',
        title: 'Selection Outlines Backend or Service',
        body: [
          'A direct observation for Understanding Selection Outlines should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for backend or service: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Backend or Service.',
          'Visible feedback for Understanding Selection Outlines should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Rendering Backends / World Visuals.',
          'Use backend or service to keep Understanding Selection Outlines tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-selection-outlines-runtime-state',
        title: 'Selection Outlines Runtime State',
        body: [
          'If the available evidence for owning subsystem does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Selection Outlines should be treated as an observation rather than a confirmed cause. That reading gives Understanding Selection Outlines a public anchor for runtime state without adding behavior that the current category does not own. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Runtime State.',
          'When Understanding Selection Outlines touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Understanding Selection Outlines runtime state is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside World Visuals.',
        ],
      },
      {
        id: 'understanding-selection-outlines-fallback-path',
        title: 'Selection Outlines Fallback Path',
        body: [
          'The outline uses model-aware block data so slabs, stairs, fences, gates, and walls can draw closer to their effective shape than a simple cube would. The fact also tells the reader which evidence to preserve for fallback path: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Fallback Path.',
          'The surrounding context for Understanding Selection Outlines decides which adjacent topic is relevant. Understanding Selection Outlines should be compared with Understanding Block Shapes, Reading Placement Rejection, Understanding WGPU Rendering only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the fallback path part of Understanding Selection Outlines should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-selection-outlines-diagnostic-output',
        title: 'Selection Outlines Diagnostic Output',
        body: [
          'Understanding Selection Outlines separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for diagnostic output: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Diagnostic Output.',
          'Recovery or follow-up for Understanding Selection Outlines should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use diagnostic output to keep Understanding Selection Outlines tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-selection-outlines-platform-reading',
        title: 'Selection Outlines Platform Reading',
        body: [
          'Use data shape to keep Understanding Selection Outlines tied to Rendering Backends; use a related page only when the reader needs a different owner. Understanding Selection Outlines uses the fact as platform reading evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Platform Reading.',
          'The main confusion risk in Understanding Selection Outlines is claiming parity without backend-specific evidence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use platform reading to keep Understanding Selection Outlines tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-selection-outlines-consumer-boundary',
        title: 'Selection Outlines Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. The fact also tells the reader which evidence to preserve for consumer boundary: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Consumer Boundary.',
          'Reportable evidence for Understanding Selection Outlines should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the consumer boundary part of Understanding Selection Outlines should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-selection-outlines-failure-reading',
        title: 'Selection Outlines Failure Reading',
        body: [
          'Ownership in Understanding Selection Outlines is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. That reading gives Understanding Selection Outlines a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Failure Reading.',
          'Adjacent pages matter for Understanding Selection Outlines, but adjacency does not move authority. Understanding Selection Outlines should be compared with Understanding Block Shapes, Reading Placement Rejection, Understanding WGPU Rendering only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Understanding Selection Outlines failure reading is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside World Visuals.',
        ],
      },
      {
        id: 'understanding-selection-outlines-evidence-quality',
        title: 'Selection Outlines Evidence Quality',
        body: [
          'The useful result of Understanding Selection Outlines handoff is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside World Visuals. For Understanding Selection Outlines, that fact identifies the first concrete boundary for evidence quality: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Evidence Quality.',
          'The public boundary for Understanding Selection Outlines is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Understanding Selection Outlines crosses from evidence quality into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-selection-outlines-related-systems',
        title: 'Selection Outlines Related Systems',
        body: [
          'An incorrect outline can point to picking, model state, renderer upload, or backend drawing. Keep those possibilities separate when reporting selection behavior. The fact also tells the reader which evidence to preserve for related systems: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Related Systems.',
          'An operator reading Understanding Selection Outlines should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'Use related systems to keep Understanding Selection Outlines tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-selection-outlines-policy-limit',
        title: 'Selection Outlines Policy Limit',
        body: [
          'Visible feedback for Understanding Selection Outlines should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Rendering Backends / World Visuals. The point matters in policy limit because reading backend output through snapshots and resources can otherwise be mistaken for claiming parity without backend-specific evidence. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Policy Limit.',
          'Implementation limits for Understanding Selection Outlines keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Understanding Selection Outlines should not use policy limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-selection-outlines-technical-summary',
        title: 'Selection Outlines Technical Summary',
        body: [
          'Selection starts with a simulation pick target containing block position and state. If there is no valid target, the renderer clears the selection. Understanding Selection Outlines uses the fact as technical summary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Technical Summary.',
          'The summary value of Understanding Selection Outlines is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use technical summary to keep Understanding Selection Outlines tied to Rendering Backends; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-selection-outlines-closing-check',
        title: 'Selection Outlines Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Selection Outlines. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. In Understanding Selection Outlines, closing check is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Selection Outlines / Rendering Backends / World Visuals / Closing Check.',
          'A final check for Understanding Selection Outlines should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Selection Outlines should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Understanding Block Shapes', 'Reading Placement Rejection', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Audio Feedback',
    title: 'Understanding Material Sounds',
    description:
      'Describes how block and player material sounds are selected. This page treats audio feedback as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-material-sounds-contract-scope',
        title: 'Material Sounds Contract Scope',
        body: [
          'Placement, breaking, and interaction choose a sound group from the affected block state. Fence gate open and close sounds are selected through interaction state. The point matters in contract scope because reading sound selection and playback state can otherwise be mistaken for changing simulation rules to explain sound output. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Material Sounds. The article should be broad enough to explain audio feedback, but narrow enough that changing simulation rules to explain sound output remains outside the conclusion.',
          'Understanding Material Sounds should not use contract scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-material-sounds-owning-subsystem',
        title: 'Material Sounds Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Material Sounds. The article should be broad enough to explain audio feedback, but narrow enough that changing simulation rules to explain sound output remains outside the conclusion. The point matters in owning subsystem because reading sound selection and playback state can otherwise be mistaken for changing simulation rules to explain sound output. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Owning Subsystem.',
          'A direct observation for Understanding Material Sounds should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'The useful result of Understanding Material Sounds owning subsystem is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback.',
        ],
      },
      {
        id: 'understanding-material-sounds-data-shape',
        title: 'Material Sounds Data Shape',
        body: [
          'Understanding Material Sounds should not use contract scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for data shape: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Data Shape.',
          'Understanding Material Sounds separates the surface that accepts input from the component or document that controls the result. This is especially important when reading sound selection and playback state crosses a saved value, a renderer output, or a public form.',
          'Use data shape to keep Understanding Material Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-material-sounds-handoff',
        title: 'Material Sounds Handoff',
        body: [
          'Understanding Material Sounds should be read as conceptual boundary for material sounds within Feedback and Intelligence and Audio Feedback. In Understanding Material Sounds, handoff is the difference between reading audio feedback and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Handoff.',
          'Ownership in Understanding Material Sounds is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'Understanding Material Sounds should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-material-sounds-backend-or-service',
        title: 'Material Sounds Backend or Service',
        body: [
          'A direct observation for Understanding Material Sounds should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. For Understanding Material Sounds, that fact identifies the first concrete boundary for backend or service: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Backend or Service.',
          'Visible feedback for Understanding Material Sounds should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / Audio Feedback.',
          'A public report based on the backend or service part of Understanding Material Sounds should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-material-sounds-runtime-state',
        title: 'Material Sounds Runtime State',
        body: [
          'The useful result of Understanding Material Sounds owning subsystem is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback. In Understanding Material Sounds, runtime state is the difference between reading audio feedback and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Runtime State.',
          'When Understanding Material Sounds touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for runtime state does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Material Sounds should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-material-sounds-fallback-path',
        title: 'Material Sounds Fallback Path',
        body: [
          'Footsteps and landing sounds use the support block beneath the player. Larger falls can select stronger landing sounds before normal movement continues. For Understanding Material Sounds, that fact identifies the first concrete boundary for fallback path: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Fallback Path.',
          'The surrounding context for Understanding Material Sounds decides which adjacent topic is relevant. Understanding Material Sounds should be compared with Changing Audio Preferences, Supplying Platform Evidence, Supplying Logs Without Secrets only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Understanding Material Sounds crosses from fallback path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-material-sounds-diagnostic-output',
        title: 'Material Sounds Diagnostic Output',
        body: [
          'Understanding Material Sounds separates the surface that accepts input from the component or document that controls the result. This is especially important when reading sound selection and playback state crosses a saved value, a renderer output, or a public form. Understanding Material Sounds uses the fact as diagnostic output evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Diagnostic Output.',
          'Recovery or follow-up for Understanding Material Sounds should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Understanding Material Sounds crosses from diagnostic output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-material-sounds-platform-reading',
        title: 'Material Sounds Platform Reading',
        body: [
          'Use data shape to keep Understanding Material Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner. Understanding Material Sounds uses the fact as platform reading evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Platform Reading.',
          'The main confusion risk in Understanding Material Sounds is changing simulation rules to explain sound output. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use platform reading to keep Understanding Material Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-material-sounds-consumer-boundary',
        title: 'Material Sounds Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. In Understanding Material Sounds, handoff is the difference between reading audio feedback and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Handoff. Understanding Material Sounds uses the fact as consumer boundary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Consumer Boundary.',
          'Reportable evidence for Understanding Material Sounds should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use consumer boundary to keep Understanding Material Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-material-sounds-failure-reading',
        title: 'Material Sounds Failure Reading',
        body: [
          'Ownership in Understanding Material Sounds is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The point matters in failure reading because reading sound selection and playback state can otherwise be mistaken for changing simulation rules to explain sound output. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Failure Reading.',
          'Adjacent pages matter for Understanding Material Sounds, but adjacency does not move authority. Understanding Material Sounds should be compared with Changing Audio Preferences, Supplying Platform Evidence, Supplying Logs Without Secrets only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Understanding Material Sounds should not use failure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-material-sounds-evidence-quality',
        title: 'Material Sounds Evidence Quality',
        body: [
          'Understanding Material Sounds should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for evidence quality: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Evidence Quality.',
          'The public boundary for Understanding Material Sounds is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the evidence quality part of Understanding Material Sounds should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-material-sounds-related-systems',
        title: 'Material Sounds Related Systems',
        body: [
          'The presentation audio manager resolves existing sources, applies category volume, spatial cutoff, throttling, and source pools. Simulation reports events but does not play audio devices directly. The fact also tells the reader which evidence to preserve for related systems: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Related Systems.',
          'An operator reading Understanding Material Sounds should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'Use related systems to keep Understanding Material Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-material-sounds-policy-limit',
        title: 'Material Sounds Policy Limit',
        body: [
          'Visible feedback for Understanding Material Sounds should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / Audio Feedback. That reading gives Understanding Material Sounds a public anchor for policy limit without adding behavior that the current category does not own. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Policy Limit.',
          'Implementation limits for Understanding Material Sounds keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Understanding Material Sounds policy limit is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback.',
        ],
      },
      {
        id: 'understanding-material-sounds-technical-summary',
        title: 'Material Sounds Technical Summary',
        body: [
          'Placement, breaking, and interaction choose a sound group from the affected block state. Fence gate open and close sounds are selected through interaction state. The fact also tells the reader which evidence to preserve for technical summary: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Technical Summary.',
          'The summary value of Understanding Material Sounds is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the technical summary part of Understanding Material Sounds should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-material-sounds-closing-check',
        title: 'Material Sounds Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Material Sounds. The article should be broad enough to explain audio feedback, but narrow enough that changing simulation rules to explain sound output remains outside the conclusion. That reading gives Understanding Material Sounds a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Understanding Material Sounds / Feedback and Intelligence / Audio Feedback / Closing Check.',
          'A final check for Understanding Material Sounds should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Material Sounds should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Changing Audio Preferences', 'Supplying Platform Evidence', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Audio Feedback',
    title: 'Understanding Ambient Sounds',
    description:
      'Explains the ambient audio loop and its preference boundaries. This page treats audio feedback as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-ambient-sounds-contract-scope',
        title: 'Ambient Sounds Contract Scope',
        body: [
          'Ambient playback selects a desired ambient key from the active play space and preference state. If ambient audio is disabled or muted, the loop stops. Understanding Ambient Sounds uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Contract Scope. Understanding Ambient Sounds uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Ambient Sounds. The article should be broad enough to explain audio feedback, but narrow enough that changing simulation rules to explain sound output remains outside the conclusion.',
          'When Understanding Ambient Sounds crosses from contract scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-owning-subsystem',
        title: 'Ambient Sounds Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Ambient Sounds. The article should be broad enough to explain audio feedback, but narrow enough that changing simulation rules to explain sound output remains outside the conclusion. Understanding Ambient Sounds uses the fact as owning subsystem evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Owning Subsystem.',
          'A direct observation for Understanding Ambient Sounds should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'Use owning subsystem to keep Understanding Ambient Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-data-shape',
        title: 'Ambient Sounds Data Shape',
        body: [
          'When Understanding Ambient Sounds crosses from contract scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Understanding Ambient Sounds a public anchor for data shape without adding behavior that the current category does not own. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Data Shape.',
          'Understanding Ambient Sounds separates the surface that accepts input from the component or document that controls the result. This is especially important when reading sound selection and playback state crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding Ambient Sounds data shape is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-handoff',
        title: 'Ambient Sounds Handoff',
        body: [
          'Understanding Ambient Sounds should be read as conceptual boundary for ambient sounds within Feedback and Intelligence and Audio Feedback. Understanding Ambient Sounds uses the fact as owning subsystem evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Owning Subsystem. The fact also tells the reader which evidence to preserve for handoff: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Handoff.',
          'Ownership in Understanding Ambient Sounds is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'Use handoff to keep Understanding Ambient Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-backend-or-service',
        title: 'Ambient Sounds Backend or Service',
        body: [
          'A direct observation for Understanding Ambient Sounds should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. That reading gives Understanding Ambient Sounds a public anchor for backend or service without adding behavior that the current category does not own. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Backend or Service.',
          'Visible feedback for Understanding Ambient Sounds should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / Audio Feedback.',
          'The useful result of Understanding Ambient Sounds backend or service is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-runtime-state',
        title: 'Ambient Sounds Runtime State',
        body: [
          'Use owning subsystem to keep Understanding Ambient Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner. For Understanding Ambient Sounds, that fact identifies the first concrete boundary for runtime state: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Runtime State.',
          'When Understanding Ambient Sounds touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Understanding Ambient Sounds crosses from runtime state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-fallback-path',
        title: 'Ambient Sounds Fallback Path',
        body: [
          'The audio manager resolves available ambient files and rotates through existing sources. Missing sources stop playback cleanly rather than changing simulation state. The point matters in fallback path because reading sound selection and playback state can otherwise be mistaken for changing simulation rules to explain sound output. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Fallback Path.',
          'The surrounding context for Understanding Ambient Sounds decides which adjacent topic is relevant. Understanding Ambient Sounds should be compared with Changing Audio Preferences, Supplying Platform Evidence, Understanding Material Sounds only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding Ambient Sounds should not use fallback path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-diagnostic-output',
        title: 'Ambient Sounds Diagnostic Output',
        body: [
          'Understanding Ambient Sounds separates the surface that accepts input from the component or document that controls the result. This is especially important when reading sound selection and playback state crosses a saved value, a renderer output, or a public form. That reading gives Understanding Ambient Sounds a public anchor for diagnostic output without adding behavior that the current category does not own. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Diagnostic Output.',
          'Recovery or follow-up for Understanding Ambient Sounds should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for diagnostic output does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Ambient Sounds should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-platform-reading',
        title: 'Ambient Sounds Platform Reading',
        body: [
          'The useful result of Understanding Ambient Sounds data shape is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback. The point matters in platform reading because reading sound selection and playback state can otherwise be mistaken for changing simulation rules to explain sound output. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Platform Reading.',
          'The main confusion risk in Understanding Ambient Sounds is changing simulation rules to explain sound output. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Understanding Ambient Sounds platform reading is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-consumer-boundary',
        title: 'Ambient Sounds Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. That reading gives Understanding Ambient Sounds a public anchor for consumer boundary without adding behavior that the current category does not own. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Consumer Boundary.',
          'Reportable evidence for Understanding Ambient Sounds should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Understanding Ambient Sounds consumer boundary is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-failure-reading',
        title: 'Ambient Sounds Failure Reading',
        body: [
          'Ownership in Understanding Ambient Sounds is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The fact also tells the reader which evidence to preserve for failure reading: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Failure Reading.',
          'Adjacent pages matter for Understanding Ambient Sounds, but adjacency does not move authority. Understanding Ambient Sounds should be compared with Changing Audio Preferences, Supplying Platform Evidence, Understanding Material Sounds only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the failure reading part of Understanding Ambient Sounds should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-evidence-quality',
        title: 'Ambient Sounds Evidence Quality',
        body: [
          'Use handoff to keep Understanding Ambient Sounds tied to Feedback and Intelligence; use a related page only when the reader needs a different owner. That reading gives Understanding Ambient Sounds a public anchor for evidence quality without adding behavior that the current category does not own. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Evidence Quality.',
          'The public boundary for Understanding Ambient Sounds is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for evidence quality does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Ambient Sounds should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-related-systems',
        title: 'Ambient Sounds Related Systems',
        body: [
          'Ambient volume is multiplied by master volume. Changing the mixer changes presentation gain only; it does not affect world rules, AI behavior, or Othello clocks. The point matters in related systems because reading sound selection and playback state can otherwise be mistaken for changing simulation rules to explain sound output. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Related Systems.',
          'An operator reading Understanding Ambient Sounds should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Understanding Ambient Sounds related systems is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-policy-limit',
        title: 'Ambient Sounds Policy Limit',
        body: [
          'Visible feedback for Understanding Ambient Sounds should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / Audio Feedback. Understanding Ambient Sounds uses the fact as policy limit evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Policy Limit.',
          'Implementation limits for Understanding Ambient Sounds keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Understanding Ambient Sounds crosses from policy limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-technical-summary',
        title: 'Ambient Sounds Technical Summary',
        body: [
          'Ambient playback selects a desired ambient key from the active play space and preference state. If ambient audio is disabled or muted, the loop stops. Understanding Ambient Sounds uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Contract Scope. In Understanding Ambient Sounds, technical summary is the difference between reading audio feedback and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Technical Summary.',
          'The summary value of Understanding Ambient Sounds is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Understanding Ambient Sounds technical summary is a bounded explanation of audio feedback: enough detail to act, and enough restraint to avoid claims outside Audio Feedback.',
        ],
      },
      {
        id: 'understanding-ambient-sounds-closing-check',
        title: 'Ambient Sounds Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Ambient Sounds. The article should be broad enough to explain audio feedback, but narrow enough that changing simulation rules to explain sound output remains outside the conclusion. Understanding Ambient Sounds uses the fact as closing check evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Ambient Sounds / Feedback and Intelligence / Audio Feedback / Closing Check.',
          'A final check for Understanding Ambient Sounds should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Understanding Ambient Sounds crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Changing Audio Preferences', 'Supplying Platform Evidence', 'Understanding Material Sounds'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'AI Decision Records',
    title: 'Understanding AI Action Selection',
    description:
      'Explains how AI decisions combine deterministic behavior, masks, and learned policies. This page treats renderer contract behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-ai-action-selection-contract-scope',
        title: 'AI Action Selection Contract Scope',
        body: [
          'AI action selection starts from observations such as player visibility, distance, health, route state, footing, headroom, placement permission, and available block count. The fact also tells the reader which evidence to preserve for contract scope: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Contract Scope.',
          'Contract Scope defines the useful size of Understanding AI Action Selection. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion.',
          'Use contract scope to keep Understanding AI Action Selection tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-owning-subsystem',
        title: 'AI Action Selection Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding AI Action Selection. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. The fact also tells the reader which evidence to preserve for owning subsystem: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Owning Subsystem.',
          'A direct observation for Understanding AI Action Selection should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'A public report based on the owning subsystem part of Understanding AI Action Selection should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-data-shape',
        title: 'AI Action Selection Data Shape',
        body: [
          'Use contract scope to keep Understanding AI Action Selection tied to Feedback and Intelligence; use a related page only when the reader needs a different owner. That reading gives Understanding AI Action Selection a public anchor for data shape without adding behavior that the current category does not own. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Data Shape.',
          'Understanding AI Action Selection separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding AI Action Selection data shape is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside AI Decision Records.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-handoff',
        title: 'AI Action Selection Handoff',
        body: [
          'Understanding AI Action Selection should be read as conceptual boundary for ai action selection within Feedback and Intelligence and AI Decision Records. Understanding AI Action Selection uses the fact as handoff evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Handoff.',
          'Ownership in Understanding AI Action Selection is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'When Understanding AI Action Selection crosses from handoff into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-backend-or-service',
        title: 'AI Action Selection Backend or Service',
        body: [
          'A direct observation for Understanding AI Action Selection should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. In Understanding AI Action Selection, backend or service is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Backend or Service.',
          'Visible feedback for Understanding AI Action Selection should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / AI Decision Records.',
          'If the available evidence for backend or service does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Action Selection should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-runtime-state',
        title: 'AI Action Selection Runtime State',
        body: [
          'A public report based on the owning subsystem part of Understanding AI Action Selection should state the action, expected result, actual result, environment, and any redaction needed before sharing. Understanding AI Action Selection uses the fact as runtime state evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Runtime State.',
          'When Understanding AI Action Selection touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use runtime state to keep Understanding AI Action Selection tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-fallback-path',
        title: 'AI Action Selection Fallback Path',
        body: [
          'The action mask blocks unsafe or impossible actions such as moving into void, attacking out of range, placing without support, or breaking self-supporting footing. That reading gives Understanding AI Action Selection a public anchor for fallback path without adding behavior that the current category does not own. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Fallback Path.',
          'The surrounding context for Understanding AI Action Selection decides which adjacent topic is relevant. Understanding AI Action Selection should be compared with Understanding AI Learning Records, Understanding Policy Evaluation, Understanding AI Combat only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Understanding AI Action Selection fallback path is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside AI Decision Records.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-diagnostic-output',
        title: 'AI Action Selection Diagnostic Output',
        body: [
          'Understanding AI Action Selection separates the surface that accepts input from the component or document that controls the result. This is especially important when reading backend output through snapshots and resources crosses a saved value, a renderer output, or a public form. That reading gives Understanding AI Action Selection a public anchor for diagnostic output without adding behavior that the current category does not own. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Diagnostic Output.',
          'Recovery or follow-up for Understanding AI Action Selection should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for diagnostic output does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Action Selection should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-platform-reading',
        title: 'AI Action Selection Platform Reading',
        body: [
          'The useful result of Understanding AI Action Selection data shape is a bounded explanation of renderer contract behavior: enough detail to act, and enough restraint to avoid claims outside AI Decision Records. In Understanding AI Action Selection, platform reading is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Platform Reading.',
          'The main confusion risk in Understanding AI Action Selection is claiming parity without backend-specific evidence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Understanding AI Action Selection should not use platform reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-consumer-boundary',
        title: 'AI Action Selection Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. Understanding AI Action Selection uses the fact as handoff evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Handoff. In Understanding AI Action Selection, consumer boundary is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Consumer Boundary.',
          'Reportable evidence for Understanding AI Action Selection should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for consumer boundary does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Action Selection should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-failure-reading',
        title: 'AI Action Selection Failure Reading',
        body: [
          'Ownership in Understanding AI Action Selection is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. For Understanding AI Action Selection, that fact identifies the first concrete boundary for failure reading: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Failure Reading.',
          'Adjacent pages matter for Understanding AI Action Selection, but adjacency does not move authority. Understanding AI Action Selection should be compared with Understanding AI Learning Records, Understanding Policy Evaluation, Understanding AI Combat only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Understanding AI Action Selection crosses from failure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-evidence-quality',
        title: 'AI Action Selection Evidence Quality',
        body: [
          'When Understanding AI Action Selection crosses from handoff into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Understanding AI Action Selection a public anchor for evidence quality without adding behavior that the current category does not own. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Evidence Quality.',
          'The public boundary for Understanding AI Action Selection is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for evidence quality does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Action Selection should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-related-systems',
        title: 'AI Action Selection Related Systems',
        body: [
          'A learned policy can adjust action scores after it passes evaluation. It does not replace action masks, route recovery rules, or deterministic fallback behavior. In Understanding AI Action Selection, backend or service is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Backend or Service. In Understanding AI Action Selection, related systems is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Related Systems.',
          'An operator reading Understanding AI Action Selection should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'Understanding AI Action Selection should not use related systems to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-policy-limit',
        title: 'AI Action Selection Policy Limit',
        body: [
          'Visible feedback for Understanding AI Action Selection should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / AI Decision Records. For Understanding AI Action Selection, that fact identifies the first concrete boundary for policy limit: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Policy Limit.',
          'Implementation limits for Understanding AI Action Selection keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the policy limit part of Understanding AI Action Selection should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-technical-summary',
        title: 'AI Action Selection Technical Summary',
        body: [
          'AI action selection starts from observations such as player visibility, distance, health, route state, footing, headroom, placement permission, and available block count. In Understanding AI Action Selection, technical summary is the difference between reading renderer contract behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Technical Summary.',
          'The summary value of Understanding AI Action Selection is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for technical summary does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Action Selection should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-action-selection-closing-check',
        title: 'AI Action Selection Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding AI Action Selection. The article should be broad enough to explain renderer contract behavior, but narrow enough that claiming parity without backend-specific evidence remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding AI Action Selection / Feedback and Intelligence / AI Decision Records / Closing Check.',
          'A final check for Understanding AI Action Selection should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding AI Action Selection tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Understanding AI Learning Records', 'Understanding Policy Evaluation', 'Understanding AI Combat'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'AI Decision Records',
    title: 'Understanding AI Learning Records',
    description:
      'Describes the demonstration records used by the AI learning workflow. This page treats AI policy and search behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-ai-learning-records-contract-scope',
        title: 'AI Learning Records Contract Scope',
        body: [
          'Learning records can capture player movement, combat, block placement, block breaking, parkour, trap behavior, AI decisions, failures, deaths, route failures, and escape attempts. Understanding AI Learning Records uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Contract Scope. Understanding AI Learning Records uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Contract Scope.',
          'Contract Scope defines the useful size of Understanding AI Learning Records. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion.',
          'When Understanding AI Learning Records crosses from contract scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-owning-subsystem',
        title: 'AI Learning Records Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding AI Learning Records. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. Understanding AI Learning Records uses the fact as owning subsystem evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Owning Subsystem.',
          'A direct observation for Understanding AI Learning Records should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'Use owning subsystem to keep Understanding AI Learning Records tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-data-shape',
        title: 'AI Learning Records Data Shape',
        body: [
          'When Understanding AI Learning Records crosses from contract scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. In Understanding AI Learning Records, data shape is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Data Shape.',
          'Understanding AI Learning Records separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for data shape does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Learning Records should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-handoff',
        title: 'AI Learning Records Handoff',
        body: [
          'Understanding AI Learning Records should be read as conceptual boundary for ai learning records within Feedback and Intelligence and AI Decision Records. Understanding AI Learning Records uses the fact as owning subsystem evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Owning Subsystem. The fact also tells the reader which evidence to preserve for handoff: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Handoff.',
          'Ownership in Understanding AI Learning Records is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'Use handoff to keep Understanding AI Learning Records tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-backend-or-service',
        title: 'AI Learning Records Backend or Service',
        body: [
          'A direct observation for Understanding AI Learning Records should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. The point matters in backend or service because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Backend or Service.',
          'Visible feedback for Understanding AI Learning Records should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / AI Decision Records.',
          'Understanding AI Learning Records should not use backend or service to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-runtime-state',
        title: 'AI Learning Records Runtime State',
        body: [
          'Use owning subsystem to keep Understanding AI Learning Records tied to Feedback and Intelligence; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for runtime state: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Runtime State.',
          'When Understanding AI Learning Records touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the runtime state part of Understanding AI Learning Records should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-fallback-path',
        title: 'AI Learning Records Fallback Path',
        body: [
          'Records are stored as JSONL rows in the configured dataset. Loading skips corrupt rows and reports counts so one bad row does not discard the whole dataset. In Understanding AI Learning Records, data shape is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Data Shape. The point matters in fallback path because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Fallback Path.',
          'The surrounding context for Understanding AI Learning Records decides which adjacent topic is relevant. Understanding AI Learning Records should be compared with Reading Demonstration Data, Handling Corrupt Learning Rows, Training a Policy only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding AI Learning Records should not use fallback path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-diagnostic-output',
        title: 'AI Learning Records Diagnostic Output',
        body: [
          'Understanding AI Learning Records separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form. In Understanding AI Learning Records, diagnostic output is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Diagnostic Output.',
          'Recovery or follow-up for Understanding AI Learning Records should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Understanding AI Learning Records should not use diagnostic output to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-platform-reading',
        title: 'AI Learning Records Platform Reading',
        body: [
          'If the available evidence for data shape does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Learning Records should be treated as an observation rather than a confirmed cause. The point matters in platform reading because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Platform Reading.',
          'The main confusion risk in Understanding AI Learning Records is treating learning files as general user content. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Understanding AI Learning Records platform reading is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside AI Decision Records.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-consumer-boundary',
        title: 'AI Learning Records Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. The point matters in consumer boundary because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Consumer Boundary.',
          'Reportable evidence for Understanding AI Learning Records should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Understanding AI Learning Records should not use consumer boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-failure-reading',
        title: 'AI Learning Records Failure Reading',
        body: [
          'Ownership in Understanding AI Learning Records is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The fact also tells the reader which evidence to preserve for failure reading: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Failure Reading.',
          'Adjacent pages matter for Understanding AI Learning Records, but adjacency does not move authority. Understanding AI Learning Records should be compared with Reading Demonstration Data, Handling Corrupt Learning Rows, Training a Policy only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the failure reading part of Understanding AI Learning Records should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-evidence-quality',
        title: 'AI Learning Records Evidence Quality',
        body: [
          'Use handoff to keep Understanding AI Learning Records tied to Feedback and Intelligence; use a related page only when the reader needs a different owner. That reading gives Understanding AI Learning Records a public anchor for evidence quality without adding behavior that the current category does not own. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Evidence Quality.',
          'The public boundary for Understanding AI Learning Records is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for evidence quality does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Learning Records should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-related-systems',
        title: 'AI Learning Records Related Systems',
        body: [
          'Observe-only mode records demonstrations. Training reads the dataset later, while live action selection uses only policies that pass compatibility and evaluation checks. That reading gives Understanding AI Learning Records a public anchor for related systems without adding behavior that the current category does not own. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Related Systems.',
          'An operator reading Understanding AI Learning Records should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for related systems does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding AI Learning Records should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-policy-limit',
        title: 'AI Learning Records Policy Limit',
        body: [
          'Visible feedback for Understanding AI Learning Records should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / AI Decision Records. Understanding AI Learning Records uses the fact as policy limit evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Policy Limit.',
          'Implementation limits for Understanding AI Learning Records keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Understanding AI Learning Records crosses from policy limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-technical-summary',
        title: 'AI Learning Records Technical Summary',
        body: [
          'Learning records can capture player movement, combat, block placement, block breaking, parkour, trap behavior, AI decisions, failures, deaths, route failures, and escape attempts. Understanding AI Learning Records uses the fact as contract scope evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Contract Scope. The point matters in technical summary because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Technical Summary.',
          'The summary value of Understanding AI Learning Records is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding AI Learning Records should not use technical summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-learning-records-closing-check',
        title: 'AI Learning Records Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding AI Learning Records. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding AI Learning Records / Feedback and Intelligence / AI Decision Records / Closing Check.',
          'A final check for Understanding AI Learning Records should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding AI Learning Records tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Reading Demonstration Data', 'Handling Corrupt Learning Rows', 'Training a Policy'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Policy and Search',
    title: 'Understanding Policy Evaluation',
    description:
      'Explains the checks that make a learned policy usable at runtime. This page treats AI policy and search behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-policy-evaluation-contract-scope',
        title: 'Policy Evaluation Contract Scope',
        body: [
          'Evaluation verifies policy schema version, compatibility target, action catalog version, feature encoder version, referenced actions, and referenced feature keys. The fact also tells the reader which evidence to preserve for contract scope: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Policy Evaluation. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion.',
          'A public report based on the contract scope part of Understanding Policy Evaluation should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-owning-subsystem',
        title: 'Policy Evaluation Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Policy Evaluation. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. Understanding Policy Evaluation uses the fact as owning subsystem evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Owning Subsystem.',
          'A direct observation for Understanding Policy Evaluation should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'When Understanding Policy Evaluation crosses from owning subsystem into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-data-shape',
        title: 'Policy Evaluation Data Shape',
        body: [
          'A public report based on the contract scope part of Understanding Policy Evaluation should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Understanding Policy Evaluation, data shape is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Data Shape.',
          'Understanding Policy Evaluation separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form.',
          'Understanding Policy Evaluation should not use data shape to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-handoff',
        title: 'Policy Evaluation Handoff',
        body: [
          'Understanding Policy Evaluation should be read as conceptual boundary for policy evaluation within Feedback and Intelligence and Policy and Search. Understanding Policy Evaluation uses the fact as owning subsystem evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Owning Subsystem. The fact also tells the reader which evidence to preserve for handoff: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Handoff.',
          'Ownership in Understanding Policy Evaluation is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'A public report based on the handoff part of Understanding Policy Evaluation should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-backend-or-service',
        title: 'Policy Evaluation Backend or Service',
        body: [
          'A direct observation for Understanding Policy Evaluation should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. The point matters in backend or service because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Backend or Service.',
          'Visible feedback for Understanding Policy Evaluation should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / Policy and Search.',
          'The useful result of Understanding Policy Evaluation backend or service is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Policy and Search.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-runtime-state',
        title: 'Policy Evaluation Runtime State',
        body: [
          'When Understanding Policy Evaluation crosses from owning subsystem into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for runtime state: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Runtime State.',
          'When Understanding Policy Evaluation touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use runtime state to keep Understanding Policy Evaluation tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-fallback-path',
        title: 'Policy Evaluation Fallback Path',
        body: [
          'The evaluator tests representative observations for action-mask compliance and compares policy sandbox score against the deterministic baseline. Any failed task keeps the policy from live use. In Understanding Policy Evaluation, data shape is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Data Shape. In Understanding Policy Evaluation, fallback path is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Fallback Path.',
          'The surrounding context for Understanding Policy Evaluation decides which adjacent topic is relevant. Understanding Policy Evaluation should be compared with Applying a Learned Policy, Reading Learned Policies, Understanding AI Action Selection only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding Policy Evaluation should not use fallback path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-diagnostic-output',
        title: 'Policy Evaluation Diagnostic Output',
        body: [
          'Understanding Policy Evaluation separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form. That reading gives Understanding Policy Evaluation a public anchor for diagnostic output without adding behavior that the current category does not own. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Diagnostic Output.',
          'Recovery or follow-up for Understanding Policy Evaluation should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'The useful result of Understanding Policy Evaluation diagnostic output is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Policy and Search.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-platform-reading',
        title: 'Policy Evaluation Platform Reading',
        body: [
          'Understanding Policy Evaluation should not use data shape to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Understanding Policy Evaluation a public anchor for platform reading without adding behavior that the current category does not own. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Platform Reading.',
          'The main confusion risk in Understanding Policy Evaluation is treating learning files as general user content. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Understanding Policy Evaluation platform reading is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Policy and Search.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-consumer-boundary',
        title: 'Policy Evaluation Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. In Understanding Policy Evaluation, consumer boundary is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Consumer Boundary.',
          'Reportable evidence for Understanding Policy Evaluation should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Understanding Policy Evaluation should not use consumer boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-failure-reading',
        title: 'Policy Evaluation Failure Reading',
        body: [
          'Ownership in Understanding Policy Evaluation is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The fact also tells the reader which evidence to preserve for failure reading: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Failure Reading.',
          'Adjacent pages matter for Understanding Policy Evaluation, but adjacency does not move authority. Understanding Policy Evaluation should be compared with Applying a Learned Policy, Reading Learned Policies, Understanding AI Action Selection only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use failure reading to keep Understanding Policy Evaluation tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-evidence-quality',
        title: 'Policy Evaluation Evidence Quality',
        body: [
          'A public report based on the handoff part of Understanding Policy Evaluation should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Understanding Policy Evaluation, evidence quality is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Evidence Quality.',
          'The public boundary for Understanding Policy Evaluation is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for evidence quality does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Policy Evaluation should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-related-systems',
        title: 'Policy Evaluation Related Systems',
        body: [
          'Evaluation results are saved with pass status, score, baseline score, mask violations, compatibility errors, and decision differences. User policies become usable only after the saved artifact includes a passing evaluation. The point matters in related systems because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Related Systems.',
          'An operator reading Understanding Policy Evaluation should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'Understanding Policy Evaluation should not use related systems to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-policy-limit',
        title: 'Policy Evaluation Policy Limit',
        body: [
          'Visible feedback for Understanding Policy Evaluation should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / Policy and Search. For Understanding Policy Evaluation, that fact identifies the first concrete boundary for policy limit: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Policy Limit.',
          'Implementation limits for Understanding Policy Evaluation keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Understanding Policy Evaluation crosses from policy limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-technical-summary',
        title: 'Policy Evaluation Technical Summary',
        body: [
          'Evaluation verifies policy schema version, compatibility target, action catalog version, feature encoder version, referenced actions, and referenced feature keys. In Understanding Policy Evaluation, technical summary is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Technical Summary.',
          'The summary value of Understanding Policy Evaluation is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Policy Evaluation should not use technical summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-policy-evaluation-closing-check',
        title: 'Policy Evaluation Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Policy Evaluation. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Policy Evaluation / Feedback and Intelligence / Policy and Search / Closing Check.',
          'A final check for Understanding Policy Evaluation should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Understanding Policy Evaluation should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Applying a Learned Policy', 'Reading Learned Policies', 'Understanding AI Action Selection'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Policy and Search',
    title: 'Understanding Othello Search',
    description:
      'Explains the Othello AI engine behavior behind difficulty settings. This page treats Othello match behavior as a technical guide to runtime subsystems and their contracts, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-othello-search-contract-scope',
        title: 'Othello Search Contract Scope',
        body: [
          'Weak, medium, strong, insane, and insane-plus settings select different search behavior and budget use. Stronger settings can spend more work on evaluation and exact search paths. The point matters in contract scope because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Contract Scope.',
          'Contract Scope defines the useful size of Understanding Othello Search. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion.',
          'The useful result of Understanding Othello Search contract scope is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Policy and Search.',
        ],
      },
      {
        id: 'understanding-othello-search-owning-subsystem',
        title: 'Othello Search Owning Subsystem',
        body: [
          'Contract Scope defines the useful size of Understanding Othello Search. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. That reading gives Understanding Othello Search a public anchor for owning subsystem without adding behavior that the current category does not own. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Owning Subsystem.',
          'A direct observation for Understanding Othello Search should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state.',
          'The useful result of Understanding Othello Search owning subsystem is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Policy and Search.',
        ],
      },
      {
        id: 'understanding-othello-search-data-shape',
        title: 'Othello Search Data Shape',
        body: [
          'The useful result of Understanding Othello Search contract scope is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Policy and Search. For Understanding Othello Search, that fact identifies the first concrete boundary for data shape: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Data Shape.',
          'Understanding Othello Search separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form.',
          'When Understanding Othello Search crosses from data shape into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-othello-search-handoff',
        title: 'Othello Search Handoff',
        body: [
          'Understanding Othello Search should be read as conceptual boundary for othello search within Feedback and Intelligence and Policy and Search. The point matters in handoff because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Handoff.',
          'Ownership in Understanding Othello Search is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article.',
          'Understanding Othello Search should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-othello-search-backend-or-service',
        title: 'Othello Search Backend or Service',
        body: [
          'A direct observation for Understanding Othello Search should name what the user or reader actually sees before it assigns cause. That keeps backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status ahead of guesses about hidden state. Understanding Othello Search uses the fact as backend or service evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Backend or Service.',
          'Visible feedback for Understanding Othello Search should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / Policy and Search.',
          'Use backend or service to keep Understanding Othello Search tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-othello-search-runtime-state',
        title: 'Othello Search Runtime State',
        body: [
          'The useful result of Understanding Othello Search owning subsystem is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Policy and Search. In Understanding Othello Search, runtime state is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Runtime State.',
          'When Understanding Othello Search touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding Othello Search should not use runtime state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-othello-search-fallback-path',
        title: 'Othello Search Fallback Path',
        body: [
          'Insane-plus can use opening-book data, including bundled resources and user-learned book lines. Compiled book cache is separate from persistent user book state. Understanding Othello Search uses the fact as fallback path evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Fallback Path.',
          'The surrounding context for Understanding Othello Search decides which adjacent topic is relevant. Understanding Othello Search should be compared with Understanding Othello AI Turns, Changing Othello AI Strength, Changing Othello Book Behavior only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Understanding Othello Search crosses from fallback path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-othello-search-diagnostic-output',
        title: 'Othello Search Diagnostic Output',
        body: [
          'Understanding Othello Search separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form. Understanding Othello Search uses the fact as diagnostic output evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Diagnostic Output.',
          'Recovery or follow-up for Understanding Othello Search should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use diagnostic output to keep Understanding Othello Search tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-othello-search-platform-reading',
        title: 'Othello Search Platform Reading',
        body: [
          'When Understanding Othello Search crosses from data shape into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Understanding Othello Search, that fact identifies the first concrete boundary for platform reading: the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Platform Reading.',
          'The main confusion risk in Understanding Othello Search is treating Othello state as My World block data. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the platform reading part of Understanding Othello Search should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-othello-search-consumer-boundary',
        title: 'Othello Search Consumer Boundary',
        body: [
          'The relevant state is constrained by the article category: Systems treats this topic as runtime subsystem behavior. Understanding Othello Search uses the fact as consumer boundary evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Consumer Boundary.',
          'Reportable evidence for Understanding Othello Search should be small, concrete, and public. backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Understanding Othello Search crosses from consumer boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-othello-search-failure-reading',
        title: 'Othello Search Failure Reading',
        body: [
          'Ownership in Understanding Othello Search is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article. In Understanding Othello Search, failure reading is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Failure Reading.',
          'Adjacent pages matter for Understanding Othello Search, but adjacency does not move authority. Understanding Othello Search should be compared with Understanding Othello AI Turns, Changing Othello AI Strength, Changing Othello Book Behavior only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Understanding Othello Search should not use failure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-othello-search-evidence-quality',
        title: 'Othello Search Evidence Quality',
        body: [
          'Understanding Othello Search should not use handoff to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. Understanding Othello Search uses the fact as evidence quality evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Evidence Quality.',
          'The public boundary for Understanding Othello Search is part of the article, not an afterthought. It does not claim that one backend, command, policy file, or generated artifact proves every other subsystem. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Understanding Othello Search crosses from evidence quality into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-othello-search-related-systems',
        title: 'Othello Search Related Systems',
        body: [
          'Search relies on the Othello board rules for legal moves, flips, passes, terminal state, and winner calculation. The renderer only displays the resulting board and animation state. Understanding Othello Search uses the fact as backend or service evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Backend or Service. Understanding Othello Search uses the fact as related systems evidence, then keeps the explanation inside Systems rather than turning it into a project-wide claim. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Related Systems.',
          'An operator reading Understanding Othello Search should follow system analysis follows the owning contract first, then consumers, fallback behavior, and diagnostic output. That order prevents a visible result from being treated as the first source of truth.',
          'Use related systems to keep Understanding Othello Search tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-othello-search-policy-limit',
        title: 'Othello Search Policy Limit',
        body: [
          'Visible feedback for Understanding Othello Search should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Systems / Feedback and Intelligence / Policy and Search. In Understanding Othello Search, policy limit is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Policy Limit.',
          'Implementation limits for Understanding Othello Search keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Understanding Othello Search should not use policy limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-othello-search-technical-summary',
        title: 'Othello Search Technical Summary',
        body: [
          'Weak, medium, strong, insane, and insane-plus settings select different search behavior and budget use. Stronger settings can spend more work on evaluation and exact search paths. The fact also tells the reader which evidence to preserve for technical summary: backend identity, runtime preference values, snapshot fields, saved schema branch, command output, engine state, and subsystem-specific status. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Technical Summary.',
          'The summary value of Understanding Othello Search is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use technical summary to keep Understanding Othello Search tied to Feedback and Intelligence; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-othello-search-closing-check',
        title: 'Othello Search Closing Check',
        body: [
          'Contract Scope defines the useful size of Understanding Othello Search. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. In Understanding Othello Search, closing check is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Othello Search / Feedback and Intelligence / Policy and Search / Closing Check.',
          'A final check for Understanding Othello Search should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the fixed-step loop, renderer contract, backend implementation, audio manager, persistence pipeline, AI learning service, policy evaluator, or Othello engine named by the article, Understanding Othello Search should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Understanding Othello AI Turns', 'Changing Othello AI Strength', 'Changing Othello Book Behavior'],
  }),
];
