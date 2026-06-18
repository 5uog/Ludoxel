/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const developerPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Source Architecture',
    group: 'Layer Boundaries',
    title: 'Reading the Four Layer Boundary',
    description:
      'Explains Ludoxel source ownership across foundations, application, simulation, and presentation. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-the-four-layer-boundary-source-scope',
        title: 'Four Layer Boundary Source Scope',
        body: [
          'Foundations owns low-level contracts, application owns runtime orchestration and persistence, simulation owns domain state and rules, and presentation owns desktop UI, input, rendering, and audio. That reading gives Reading the Four Layer Boundary a public anchor for source scope without adding behavior that the current category does not own. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Source Scope.',
          'Source Scope defines the useful size of Reading the Four Layer Boundary. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'If the available evidence for source scope does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading the Four Layer Boundary should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-owning-layer',
        title: 'Four Layer Boundary Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading the Four Layer Boundary. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. Reading the Four Layer Boundary uses the fact as owning layer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Owning Layer.',
          'A direct observation for Reading the Four Layer Boundary should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'Use owning layer to keep Reading the Four Layer Boundary tied to Source Architecture; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-call-path',
        title: 'Four Layer Boundary Call Path',
        body: [
          'If the available evidence for source scope does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading the Four Layer Boundary should be treated as an observation rather than a confirmed cause. In Reading the Four Layer Boundary, call path is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Call Path.',
          'Reading the Four Layer Boundary separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for call path does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading the Four Layer Boundary should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-facade-boundary',
        title: 'Four Layer Boundary Facade Boundary',
        body: [
          'Reading the Four Layer Boundary should be read as interpretation for the four layer boundary within Source Architecture and Layer Boundaries. Reading the Four Layer Boundary uses the fact as owning layer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Owning Layer. In Reading the Four Layer Boundary, facade boundary is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Facade Boundary.',
          'Ownership in Reading the Four Layer Boundary is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'If the available evidence for facade boundary does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading the Four Layer Boundary should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-schema-or-store',
        title: 'Four Layer Boundary Schema or Store',
        body: [
          'A direct observation for Reading the Four Layer Boundary should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for schema or store: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Schema or Store.',
          'Visible feedback for Reading the Four Layer Boundary should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Source Architecture / Layer Boundaries.',
          'Use schema or store to keep Reading the Four Layer Boundary tied to Source Architecture; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-resource-root',
        title: 'Four Layer Boundary Resource Root',
        body: [
          'Use owning layer to keep Reading the Four Layer Boundary tied to Source Architecture; use a related page only when the reader needs a different owner. That reading gives Reading the Four Layer Boundary a public anchor for resource root without adding behavior that the current category does not own. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Resource Root.',
          'When Reading the Four Layer Boundary touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Reading the Four Layer Boundary resource root is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Layer Boundaries.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-tool-command',
        title: 'Four Layer Boundary Tool Command',
        body: [
          'Dependencies flow upward from foundations through simulation and application into presentation. Lower layers should not import presentation UI or renderer implementations. In Reading the Four Layer Boundary, call path is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Call Path. In Reading the Four Layer Boundary, tool command is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Tool Command.',
          'The surrounding context for Reading the Four Layer Boundary decides which adjacent topic is relevant. Reading the Four Layer Boundary should be compared with Keeping Simulation Independent, Keeping Presentation Styling Out of Python Logic, Reading Asset Roots only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for tool command does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading the Four Layer Boundary should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-format-or-build',
        title: 'Four Layer Boundary Format or Build',
        body: [
          'Reading the Four Layer Boundary separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. For Reading the Four Layer Boundary, that fact identifies the first concrete boundary for format or build: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Format or Build.',
          'Recovery or follow-up for Reading the Four Layer Boundary should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Reading the Four Layer Boundary crosses from format or build into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-policy-file',
        title: 'Four Layer Boundary Policy File',
        body: [
          'If the available evidence for call path does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading the Four Layer Boundary should be treated as an observation rather than a confirmed cause. Reading the Four Layer Boundary uses the fact as policy file evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Policy File.',
          'The main confusion risk in Reading the Four Layer Boundary is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Reading the Four Layer Boundary crosses from policy file into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-authorization',
        title: 'Four Layer Boundary Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. In Reading the Four Layer Boundary, facade boundary is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Facade Boundary. In Reading the Four Layer Boundary, authorization is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Authorization.',
          'Reportable evidence for Reading the Four Layer Boundary should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Reading the Four Layer Boundary should not use authorization to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-failure-reading',
        title: 'Four Layer Boundary Failure Reading',
        body: [
          'Ownership in Reading the Four Layer Boundary is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. Reading the Four Layer Boundary uses the fact as failure reading evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Failure Reading.',
          'Adjacent pages matter for Reading the Four Layer Boundary, but adjacency does not move authority. Reading the Four Layer Boundary should be compared with Keeping Simulation Independent, Keeping Presentation Styling Out of Python Logic, Reading Asset Roots only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Reading the Four Layer Boundary crosses from failure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-working-tree',
        title: 'Four Layer Boundary Working Tree',
        body: [
          'If the available evidence for facade boundary does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading the Four Layer Boundary should be treated as an observation rather than a confirmed cause. For Reading the Four Layer Boundary, that fact identifies the first concrete boundary for working tree: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Working Tree.',
          'The public boundary for Reading the Four Layer Boundary is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the working tree part of Reading the Four Layer Boundary should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-related-developer',
        title: 'Four Layer Boundary Related Developer',
        body: [
          'When reading a feature, identify the owning layer first. A renderer symptom, saved-file symptom, or gameplay symptom can involve different layers even when visible in the same window. In Reading the Four Layer Boundary, related developer is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Related Developer.',
          'An operator reading Reading the Four Layer Boundary should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for related developer does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading the Four Layer Boundary should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-public-limit',
        title: 'Four Layer Boundary Public Limit',
        body: [
          'Visible feedback for Reading the Four Layer Boundary should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Source Architecture / Layer Boundaries. The point matters in public limit because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Public Limit.',
          'Implementation limits for Reading the Four Layer Boundary keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Reading the Four Layer Boundary public limit is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Layer Boundaries.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-technical-summary',
        title: 'Four Layer Boundary Technical Summary',
        body: [
          'Foundations owns low-level contracts, application owns runtime orchestration and persistence, simulation owns domain state and rules, and presentation owns desktop UI, input, rendering, and audio. The point matters in technical summary because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Technical Summary.',
          'The summary value of Reading the Four Layer Boundary is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Reading the Four Layer Boundary technical summary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Layer Boundaries.',
        ],
      },
      {
        id: 'reading-the-four-layer-boundary-closing-check',
        title: 'Four Layer Boundary Closing Check',
        body: [
          'Source Scope defines the useful size of Reading the Four Layer Boundary. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. For Reading the Four Layer Boundary, that fact identifies the first concrete boundary for closing check: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading the Four Layer Boundary / Source Architecture / Layer Boundaries / Closing Check.',
          'A final check for Reading the Four Layer Boundary should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Reading the Four Layer Boundary tied to Source Architecture; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Keeping Simulation Independent', 'Keeping Presentation Styling Out of Python Logic', 'Reading Asset Roots'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Source Architecture',
    group: 'Layer Boundaries',
    title: 'Keeping Simulation Independent',
    description:
      'Explains why simulation code should not depend on UI, storage paths, or renderers. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'keeping-simulation-independent-source-scope',
        title: 'Simulation Independent Source Scope',
        body: [
          'Simulation owns world state, block rules, player and AI behavior, movement, collision, Othello rules, inventory, and play-space domain state. In Keeping Simulation Independent, source scope is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Source Scope. In Keeping Simulation Independent, source scope is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Source Scope.',
          'Source Scope defines the useful size of Keeping Simulation Independent. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'Keeping Simulation Independent should not use source scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-simulation-independent-owning-layer',
        title: 'Simulation Independent Owning Layer',
        body: [
          'Source Scope defines the useful size of Keeping Simulation Independent. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. Keeping Simulation Independent uses the fact as owning layer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Owning Layer.',
          'A direct observation for Keeping Simulation Independent should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'Use owning layer to keep Keeping Simulation Independent tied to Source Architecture; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'keeping-simulation-independent-call-path',
        title: 'Simulation Independent Call Path',
        body: [
          'Keeping Simulation Independent should not use source scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in call path because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Call Path.',
          'Keeping Simulation Independent separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'Keeping Simulation Independent should not use call path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-simulation-independent-facade-boundary',
        title: 'Simulation Independent Facade Boundary',
        body: [
          'Keeping Simulation Independent should be read as boundary preservation for simulation independent within Source Architecture and Layer Boundaries. Keeping Simulation Independent uses the fact as owning layer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Owning Layer. The point matters in facade boundary because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Facade Boundary.',
          'Ownership in Keeping Simulation Independent is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'Keeping Simulation Independent should not use facade boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-simulation-independent-schema-or-store',
        title: 'Simulation Independent Schema or Store',
        body: [
          'A direct observation for Keeping Simulation Independent should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. Keeping Simulation Independent uses the fact as schema or store evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Schema or Store.',
          'Visible feedback for Keeping Simulation Independent should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Source Architecture / Layer Boundaries.',
          'When Keeping Simulation Independent crosses from schema or store into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'keeping-simulation-independent-resource-root',
        title: 'Simulation Independent Resource Root',
        body: [
          'Use owning layer to keep Keeping Simulation Independent tied to Source Architecture; use a related page only when the reader needs a different owner. In Keeping Simulation Independent, resource root is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Resource Root.',
          'When Keeping Simulation Independent touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for resource root does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Keeping Simulation Independent should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'keeping-simulation-independent-tool-command',
        title: 'Simulation Independent Tool Command',
        body: [
          'Simulation should not depend on Qt widgets, renderer backends, audio devices, persistence file paths, desktop packaging, or presentation-only resources. That reading gives Keeping Simulation Independent a public anchor for tool command without adding behavior that the current category does not own. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Tool Command.',
          'The surrounding context for Keeping Simulation Independent decides which adjacent topic is relevant. Keeping Simulation Independent should be compared with Reading the Four Layer Boundary, Understanding AI Action Selection, Understanding Othello Search only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Keeping Simulation Independent tool command is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Layer Boundaries.',
        ],
      },
      {
        id: 'keeping-simulation-independent-format-or-build',
        title: 'Simulation Independent Format or Build',
        body: [
          'Keeping Simulation Independent separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. For Keeping Simulation Independent, that fact identifies the first concrete boundary for format or build: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Format or Build.',
          'Recovery or follow-up for Keeping Simulation Independent should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Keeping Simulation Independent crosses from format or build into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'keeping-simulation-independent-policy-file',
        title: 'Simulation Independent Policy File',
        body: [
          'Keeping Simulation Independent should not use call path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Keeping Simulation Independent, that fact identifies the first concrete boundary for policy file: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Policy File.',
          'The main confusion risk in Keeping Simulation Independent is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the policy file part of Keeping Simulation Independent should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'keeping-simulation-independent-authorization',
        title: 'Simulation Independent Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. In Keeping Simulation Independent, authorization is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Authorization.',
          'Reportable evidence for Keeping Simulation Independent should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Keeping Simulation Independent should not use authorization to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-simulation-independent-failure-reading',
        title: 'Simulation Independent Failure Reading',
        body: [
          'Ownership in Keeping Simulation Independent is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. Keeping Simulation Independent uses the fact as failure reading evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Failure Reading.',
          'Adjacent pages matter for Keeping Simulation Independent, but adjacency does not move authority. Keeping Simulation Independent should be compared with Reading the Four Layer Boundary, Understanding AI Action Selection, Understanding Othello Search only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Keeping Simulation Independent crosses from failure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'keeping-simulation-independent-working-tree',
        title: 'Simulation Independent Working Tree',
        body: [
          'Keeping Simulation Independent should not use facade boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Keeping Simulation Independent, that fact identifies the first concrete boundary for working tree: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Working Tree.',
          'The public boundary for Keeping Simulation Independent is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the working tree part of Keeping Simulation Independent should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'keeping-simulation-independent-related-developer',
        title: 'Simulation Independent Related Developer',
        body: [
          'Keeping simulation independent lets sessions, persistence, rendering, AI learning, and tests exchange domain state without turning UI behavior into game rules. Keeping Simulation Independent uses the fact as schema or store evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Schema or Store. The point matters in related developer because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Related Developer.',
          'An operator reading Keeping Simulation Independent should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'Keeping Simulation Independent should not use related developer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-simulation-independent-public-limit',
        title: 'Simulation Independent Public Limit',
        body: [
          'Visible feedback for Keeping Simulation Independent should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Source Architecture / Layer Boundaries. In Keeping Simulation Independent, public limit is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Public Limit.',
          'Implementation limits for Keeping Simulation Independent keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Keeping Simulation Independent should not use public limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-simulation-independent-technical-summary',
        title: 'Simulation Independent Technical Summary',
        body: [
          'Simulation owns world state, block rules, player and AI behavior, movement, collision, Othello rules, inventory, and play-space domain state. In Keeping Simulation Independent, source scope is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Source Scope. In Keeping Simulation Independent, technical summary is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Technical Summary.',
          'The summary value of Keeping Simulation Independent is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Keeping Simulation Independent should not use technical summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-simulation-independent-closing-check',
        title: 'Simulation Independent Closing Check',
        body: [
          'Source Scope defines the useful size of Keeping Simulation Independent. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. For Keeping Simulation Independent, that fact identifies the first concrete boundary for closing check: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Keeping Simulation Independent / Source Architecture / Layer Boundaries / Closing Check.',
          'A final check for Keeping Simulation Independent should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Keeping Simulation Independent crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Reading the Four Layer Boundary', 'Understanding AI Action Selection', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Source Architecture',
    group: 'Presentation and Assets',
    title: 'Keeping Presentation Styling Out of Python Logic',
    description:
      'Explains how Ludoxel separates widget structure from decorative styling. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'keeping-presentation-styling-out-of-python-logic-source-scope',
        title: 'Presentation Styling Out of Python Logic Source Scope',
        body: [
          'Python widget files create controls, object names, layouts, signals, state reflection, and Qt-only behavior. They should not carry decorative QSS strings for colors or borders. In Keeping Presentation Styling Out of Python Logic, source scope is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Source Scope. In Keeping Presentation Styling Out of Python Logic, source scope is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Source Scope.',
          'Source Scope defines the useful size of Keeping Presentation Styling Out of Python Logic. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'Keeping Presentation Styling Out of Python Logic should not use source scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-owning-layer',
        title: 'Presentation Styling Out of Python Logic Owning Layer',
        body: [
          'Source Scope defines the useful size of Keeping Presentation Styling Out of Python Logic. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. For Keeping Presentation Styling Out of Python Logic, that fact identifies the first concrete boundary for owning layer: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Owning Layer.',
          'A direct observation for Keeping Presentation Styling Out of Python Logic should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'When Keeping Presentation Styling Out of Python Logic crosses from owning layer into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-call-path',
        title: 'Presentation Styling Out of Python Logic Call Path',
        body: [
          'Keeping Presentation Styling Out of Python Logic should not use source scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Keeping Presentation Styling Out of Python Logic a public anchor for call path without adding behavior that the current category does not own. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Call Path.',
          'Keeping Presentation Styling Out of Python Logic separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'The useful result of Keeping Presentation Styling Out of Python Logic call path is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Presentation and Assets.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-facade-boundary',
        title: 'Presentation Styling Out of Python Logic Facade Boundary',
        body: [
          'Keeping Presentation Styling Out of Python Logic should be read as boundary preservation for presentation styling out of python logic within Source Architecture and Presentation and Assets. That reading gives Keeping Presentation Styling Out of Python Logic a public anchor for facade boundary without adding behavior that the current category does not own. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Facade Boundary.',
          'Ownership in Keeping Presentation Styling Out of Python Logic is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'The useful result of Keeping Presentation Styling Out of Python Logic facade boundary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Presentation and Assets.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-schema-or-store',
        title: 'Presentation Styling Out of Python Logic Schema or Store',
        body: [
          'A direct observation for Keeping Presentation Styling Out of Python Logic should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for schema or store: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Schema or Store.',
          'Visible feedback for Keeping Presentation Styling Out of Python Logic should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Source Architecture / Presentation and Assets.',
          'Use schema or store to keep Keeping Presentation Styling Out of Python Logic tied to Source Architecture; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-resource-root',
        title: 'Presentation Styling Out of Python Logic Resource Root',
        body: [
          'When Keeping Presentation Styling Out of Python Logic crosses from owning layer into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Keeping Presentation Styling Out of Python Logic a public anchor for resource root without adding behavior that the current category does not own. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Resource Root.',
          'When Keeping Presentation Styling Out of Python Logic touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Keeping Presentation Styling Out of Python Logic resource root is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Presentation and Assets.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-tool-command',
        title: 'Presentation Styling Out of Python Logic Tool Command',
        body: [
          'Theme QSS files own visual decoration such as colors, backgrounds, borders, radius, fonts, hover state, pressed state, padding, and object-name-specific styling. In Keeping Presentation Styling Out of Python Logic, tool command is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Tool Command.',
          'The surrounding context for Keeping Presentation Styling Out of Python Logic decides which adjacent topic is relevant. Keeping Presentation Styling Out of Python Logic should be compared with Reading the Four Layer Boundary, Running Web Formatting with Permission, Reading Documentation Check Failures only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for tool command does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Keeping Presentation Styling Out of Python Logic should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-format-or-build',
        title: 'Presentation Styling Out of Python Logic Format or Build',
        body: [
          'Keeping Presentation Styling Out of Python Logic separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. For Keeping Presentation Styling Out of Python Logic, that fact identifies the first concrete boundary for format or build: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Format or Build.',
          'Recovery or follow-up for Keeping Presentation Styling Out of Python Logic should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Keeping Presentation Styling Out of Python Logic crosses from format or build into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-policy-file',
        title: 'Presentation Styling Out of Python Logic Policy File',
        body: [
          'The useful result of Keeping Presentation Styling Out of Python Logic call path is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Presentation and Assets. Keeping Presentation Styling Out of Python Logic uses the fact as policy file evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Policy File.',
          'The main confusion risk in Keeping Presentation Styling Out of Python Logic is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Keeping Presentation Styling Out of Python Logic crosses from policy file into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-authorization',
        title: 'Presentation Styling Out of Python Logic Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. In Keeping Presentation Styling Out of Python Logic, authorization is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Authorization.',
          'Reportable evidence for Keeping Presentation Styling Out of Python Logic should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Keeping Presentation Styling Out of Python Logic should not use authorization to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-failure-reading',
        title: 'Presentation Styling Out of Python Logic Failure Reading',
        body: [
          'Ownership in Keeping Presentation Styling Out of Python Logic is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. For Keeping Presentation Styling Out of Python Logic, that fact identifies the first concrete boundary for failure reading: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Failure Reading.',
          'Adjacent pages matter for Keeping Presentation Styling Out of Python Logic, but adjacency does not move authority. Keeping Presentation Styling Out of Python Logic should be compared with Reading the Four Layer Boundary, Running Web Formatting with Permission, Reading Documentation Check Failures only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the failure reading part of Keeping Presentation Styling Out of Python Logic should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-working-tree',
        title: 'Presentation Styling Out of Python Logic Working Tree',
        body: [
          'The useful result of Keeping Presentation Styling Out of Python Logic facade boundary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Presentation and Assets. For Keeping Presentation Styling Out of Python Logic, that fact identifies the first concrete boundary for working tree: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Working Tree.',
          'The public boundary for Keeping Presentation Styling Out of Python Logic is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the working tree part of Keeping Presentation Styling Out of Python Logic should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-related-developer',
        title: 'Presentation Styling Out of Python Logic Related Developer',
        body: [
          'When styling files change, stylesheet load order and package data must stay aligned so source-tree and packaged runs see the same theme resources. That reading gives Keeping Presentation Styling Out of Python Logic a public anchor for related developer without adding behavior that the current category does not own. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Related Developer.',
          'An operator reading Keeping Presentation Styling Out of Python Logic should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Keeping Presentation Styling Out of Python Logic related developer is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Presentation and Assets.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-public-limit',
        title: 'Presentation Styling Out of Python Logic Public Limit',
        body: [
          'Visible feedback for Keeping Presentation Styling Out of Python Logic should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Source Architecture / Presentation and Assets. In Keeping Presentation Styling Out of Python Logic, public limit is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Public Limit.',
          'Implementation limits for Keeping Presentation Styling Out of Python Logic keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Keeping Presentation Styling Out of Python Logic should not use public limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-technical-summary',
        title: 'Presentation Styling Out of Python Logic Technical Summary',
        body: [
          'Python widget files create controls, object names, layouts, signals, state reflection, and Qt-only behavior. They should not carry decorative QSS strings for colors or borders. In Keeping Presentation Styling Out of Python Logic, source scope is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Source Scope. The point matters in technical summary because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Technical Summary.',
          'The summary value of Keeping Presentation Styling Out of Python Logic is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Keeping Presentation Styling Out of Python Logic technical summary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Presentation and Assets.',
        ],
      },
      {
        id: 'keeping-presentation-styling-out-of-python-logic-closing-check',
        title: 'Presentation Styling Out of Python Logic Closing Check',
        body: [
          'Source Scope defines the useful size of Keeping Presentation Styling Out of Python Logic. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. Keeping Presentation Styling Out of Python Logic uses the fact as closing check evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Keeping Presentation Styling Out of Python Logic / Source Architecture / Presentation and Assets / Closing Check.',
          'A final check for Keeping Presentation Styling Out of Python Logic should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Keeping Presentation Styling Out of Python Logic tied to Source Architecture; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Reading the Four Layer Boundary', 'Running Web Formatting with Permission', 'Reading Documentation Check Failures'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Source Architecture',
    group: 'Presentation and Assets',
    title: 'Reading Asset Roots',
    description:
      'Explains how Ludoxel resolves project assets and provenance-sensitive material. This page treats asset roots as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-asset-roots-source-scope',
        title: 'Asset Roots Source Scope',
        body: [
          'Asset root resolution separates project resources, Ludoxel assets, Minecraft-named asset areas, thumbnails, fonts, shader resources, and packaged resource roots. For Reading Asset Roots, that fact identifies the first concrete boundary for source scope: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Source Scope.',
          'Source Scope defines the useful size of Reading Asset Roots. The article should be broad enough to explain asset roots, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion.',
          'A public report based on the source scope part of Reading Asset Roots should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-asset-roots-owning-layer',
        title: 'Asset Roots Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Asset Roots. The article should be broad enough to explain asset roots, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. In Reading Asset Roots, owning layer is the difference between reading asset roots and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Owning Layer.',
          'A direct observation for Reading Asset Roots should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'If the available evidence for owning layer does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Asset Roots should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-asset-roots-call-path',
        title: 'Asset Roots Call Path',
        body: [
          'A public report based on the source scope part of Reading Asset Roots should state the action, expected result, actual result, environment, and any redaction needed before sharing. Reading Asset Roots uses the fact as call path evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Call Path.',
          'Reading Asset Roots separates the surface that accepts input from the component or document that controls the result. This is especially important when reading asset roots in its documented category crosses a saved value, a renderer output, or a public form.',
          'When Reading Asset Roots crosses from call path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-asset-roots-facade-boundary',
        title: 'Asset Roots Facade Boundary',
        body: [
          'Reading Asset Roots should be read as interpretation for asset roots within Source Architecture and Presentation and Assets. In Reading Asset Roots, owning layer is the difference between reading asset roots and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Owning Layer. For Reading Asset Roots, that fact identifies the first concrete boundary for facade boundary: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Facade Boundary.',
          'Ownership in Reading Asset Roots is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'A public report based on the facade boundary part of Reading Asset Roots should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-asset-roots-schema-or-store',
        title: 'Asset Roots Schema or Store',
        body: [
          'A direct observation for Reading Asset Roots should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. The point matters in schema or store because reading asset roots in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Schema or Store.',
          'Visible feedback for Reading Asset Roots should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Source Architecture / Presentation and Assets.',
          'Reading Asset Roots should not use schema or store to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-asset-roots-resource-root',
        title: 'Asset Roots Resource Root',
        body: [
          'If the available evidence for owning layer does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Asset Roots should be treated as an observation rather than a confirmed cause. For Reading Asset Roots, that fact identifies the first concrete boundary for resource root: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Resource Root.',
          'When Reading Asset Roots touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the resource root part of Reading Asset Roots should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-asset-roots-tool-command',
        title: 'Asset Roots Tool Command',
        body: [
          'Rendering, item photos, skins, audio, shaders, theme files, and Othello resources read assets through resource-root contracts rather than assuming the current working directory. Reading Asset Roots uses the fact as call path evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Call Path. The fact also tells the reader which evidence to preserve for tool command: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Tool Command.',
          'The surrounding context for Reading Asset Roots decides which adjacent topic is relevant. Reading Asset Roots should be compared with Understanding Third Party Material Boundaries, Including Third Party License Text, Separating User Data from Source Files only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the tool command part of Reading Asset Roots should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-asset-roots-format-or-build',
        title: 'Asset Roots Format or Build',
        body: [
          'Reading Asset Roots separates the surface that accepts input from the component or document that controls the result. This is especially important when reading asset roots in its documented category crosses a saved value, a renderer output, or a public form. That reading gives Reading Asset Roots a public anchor for format or build without adding behavior that the current category does not own. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Format or Build.',
          'Recovery or follow-up for Reading Asset Roots should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for format or build does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Asset Roots should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-asset-roots-policy-file',
        title: 'Asset Roots Policy File',
        body: [
          'When Reading Asset Roots crosses from call path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The point matters in policy file because reading asset roots in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Policy File.',
          'The main confusion risk in Reading Asset Roots is moving the topic outside its confirmed boundary. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Reading Asset Roots should not use policy file to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-asset-roots-authorization',
        title: 'Asset Roots Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. The fact also tells the reader which evidence to preserve for authorization: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Authorization.',
          'Reportable evidence for Reading Asset Roots should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the authorization part of Reading Asset Roots should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-asset-roots-failure-reading',
        title: 'Asset Roots Failure Reading',
        body: [
          'Ownership in Reading Asset Roots is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The point matters in failure reading because reading asset roots in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Failure Reading.',
          'Adjacent pages matter for Reading Asset Roots, but adjacency does not move authority. Reading Asset Roots should be compared with Understanding Third Party Material Boundaries, Including Third Party License Text, Separating User Data from Source Files only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Reading Asset Roots should not use failure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-asset-roots-working-tree',
        title: 'Asset Roots Working Tree',
        body: [
          'A public report based on the facade boundary part of Reading Asset Roots should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Reading Asset Roots, working tree is the difference between reading asset roots and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Working Tree.',
          'The public boundary for Reading Asset Roots is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Reading Asset Roots should not use working tree to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-asset-roots-related-developer',
        title: 'Asset Roots Related Developer',
        body: [
          'Asset paths can carry provenance and license meaning. Review third-party and provenance-sensitive areas before making distribution, attribution, or replacement claims. Reading Asset Roots uses the fact as related developer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Related Developer.',
          'An operator reading Reading Asset Roots should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'When Reading Asset Roots crosses from related developer into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-asset-roots-public-limit',
        title: 'Asset Roots Public Limit',
        body: [
          'Visible feedback for Reading Asset Roots should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Source Architecture / Presentation and Assets. For Reading Asset Roots, that fact identifies the first concrete boundary for public limit: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Public Limit.',
          'Implementation limits for Reading Asset Roots keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use public limit to keep Reading Asset Roots tied to Source Architecture; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-asset-roots-technical-summary',
        title: 'Asset Roots Technical Summary',
        body: [
          'Asset root resolution separates project resources, Ludoxel assets, Minecraft-named asset areas, thumbnails, fonts, shader resources, and packaged resource roots. For Reading Asset Roots, that fact identifies the first concrete boundary for technical summary: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Technical Summary.',
          'The summary value of Reading Asset Roots is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Reading Asset Roots crosses from technical summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-asset-roots-closing-check',
        title: 'Asset Roots Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Asset Roots. The article should be broad enough to explain asset roots, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. That reading gives Reading Asset Roots a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Reading Asset Roots / Source Architecture / Presentation and Assets / Closing Check.',
          'A final check for Reading Asset Roots should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Asset Roots should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Understanding Third Party Material Boundaries', 'Including Third Party License Text', 'Separating User Data from Source Files'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Runtime Integration',
    group: 'Session Assembly',
    title: 'Reading Application Bootstrap Flow',
    description:
      'Explains the composition root that connects Ludoxel runtime setup to the UI. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-application-bootstrap-flow-source-scope',
        title: 'Application Bootstrap Flow Source Scope',
        body: [
          'Bootstrap resolves project, resource, and data roots using source-tree and frozen-application rules. Those roots define how resources and user state are found. That reading gives Reading Application Bootstrap Flow a public anchor for source scope without adding behavior that the current category does not own. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Source Scope.',
          'Source Scope defines the useful size of Reading Application Bootstrap Flow. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'If the available evidence for source scope does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Application Bootstrap Flow should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-owning-layer',
        title: 'Application Bootstrap Flow Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Application Bootstrap Flow. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The fact also tells the reader which evidence to preserve for owning layer: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Owning Layer.',
          'A direct observation for Reading Application Bootstrap Flow should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'A public report based on the owning layer part of Reading Application Bootstrap Flow should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-call-path',
        title: 'Application Bootstrap Flow Call Path',
        body: [
          'If the available evidence for source scope does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Application Bootstrap Flow should be treated as an observation rather than a confirmed cause. In Reading Application Bootstrap Flow, call path is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Call Path.',
          'Reading Application Bootstrap Flow separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for call path does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Application Bootstrap Flow should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-facade-boundary',
        title: 'Application Bootstrap Flow Facade Boundary',
        body: [
          'Reading Application Bootstrap Flow should be read as interpretation for application bootstrap flow within Runtime Integration and Session Assembly. That reading gives Reading Application Bootstrap Flow a public anchor for facade boundary without adding behavior that the current category does not own. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Facade Boundary.',
          'Ownership in Reading Application Bootstrap Flow is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'The useful result of Reading Application Bootstrap Flow facade boundary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Session Assembly.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-schema-or-store',
        title: 'Application Bootstrap Flow Schema or Store',
        body: [
          'A direct observation for Reading Application Bootstrap Flow should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. Reading Application Bootstrap Flow uses the fact as schema or store evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Schema or Store.',
          'Visible feedback for Reading Application Bootstrap Flow should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Runtime Integration / Session Assembly.',
          'When Reading Application Bootstrap Flow crosses from schema or store into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-resource-root',
        title: 'Application Bootstrap Flow Resource Root',
        body: [
          'A public report based on the owning layer part of Reading Application Bootstrap Flow should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Reading Application Bootstrap Flow a public anchor for resource root without adding behavior that the current category does not own. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Resource Root.',
          'When Reading Application Bootstrap Flow touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Reading Application Bootstrap Flow resource root is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Session Assembly.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-tool-command',
        title: 'Application Bootstrap Flow Tool Command',
        body: [
          'Bootstrap performs runtime checks and installs Othello book storage hooks before importing the presentation main window. That import is the intentional application-to-presentation entry point. In Reading Application Bootstrap Flow, call path is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Call Path. The point matters in tool command because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Tool Command.',
          'The surrounding context for Reading Application Bootstrap Flow decides which adjacent topic is relevant. Reading Application Bootstrap Flow should be compared with Reading Play Space Factories, Understanding Fixed Step Sessions, Switching Play Spaces only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Reading Application Bootstrap Flow should not use tool command to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-format-or-build',
        title: 'Application Bootstrap Flow Format or Build',
        body: [
          'Reading Application Bootstrap Flow separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. For Reading Application Bootstrap Flow, that fact identifies the first concrete boundary for format or build: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Format or Build.',
          'Recovery or follow-up for Reading Application Bootstrap Flow should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Reading Application Bootstrap Flow crosses from format or build into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-policy-file',
        title: 'Application Bootstrap Flow Policy File',
        body: [
          'If the available evidence for call path does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Application Bootstrap Flow should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for policy file: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Policy File.',
          'The main confusion risk in Reading Application Bootstrap Flow is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use policy file to keep Reading Application Bootstrap Flow tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-authorization',
        title: 'Application Bootstrap Flow Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. In Reading Application Bootstrap Flow, authorization is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Authorization.',
          'Reportable evidence for Reading Application Bootstrap Flow should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Reading Application Bootstrap Flow should not use authorization to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-failure-reading',
        title: 'Application Bootstrap Flow Failure Reading',
        body: [
          'Ownership in Reading Application Bootstrap Flow is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. Reading Application Bootstrap Flow uses the fact as failure reading evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Failure Reading.',
          'Adjacent pages matter for Reading Application Bootstrap Flow, but adjacency does not move authority. Reading Application Bootstrap Flow should be compared with Reading Play Space Factories, Understanding Fixed Step Sessions, Switching Play Spaces only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Reading Application Bootstrap Flow crosses from failure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-working-tree',
        title: 'Application Bootstrap Flow Working Tree',
        body: [
          'The useful result of Reading Application Bootstrap Flow facade boundary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Session Assembly. Reading Application Bootstrap Flow uses the fact as working tree evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Working Tree.',
          'The public boundary for Reading Application Bootstrap Flow is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Reading Application Bootstrap Flow crosses from working tree into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-related-developer',
        title: 'Application Bootstrap Flow Related Developer',
        body: [
          'Other application modules should not casually import presentation windows. The bootstrap file is the composition root where lower-layer orchestration enters the top-level UI. Reading Application Bootstrap Flow uses the fact as schema or store evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Schema or Store. The point matters in related developer because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Related Developer.',
          'An operator reading Reading Application Bootstrap Flow should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'Reading Application Bootstrap Flow should not use related developer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-public-limit',
        title: 'Application Bootstrap Flow Public Limit',
        body: [
          'Visible feedback for Reading Application Bootstrap Flow should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Runtime Integration / Session Assembly. In Reading Application Bootstrap Flow, public limit is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Public Limit.',
          'Implementation limits for Reading Application Bootstrap Flow keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Reading Application Bootstrap Flow should not use public limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-technical-summary',
        title: 'Application Bootstrap Flow Technical Summary',
        body: [
          'Bootstrap resolves project, resource, and data roots using source-tree and frozen-application rules. Those roots define how resources and user state are found. In Reading Application Bootstrap Flow, technical summary is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Technical Summary.',
          'The summary value of Reading Application Bootstrap Flow is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Reading Application Bootstrap Flow should not use technical summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-application-bootstrap-flow-closing-check',
        title: 'Application Bootstrap Flow Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Application Bootstrap Flow. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. Reading Application Bootstrap Flow uses the fact as closing check evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Application Bootstrap Flow / Runtime Integration / Session Assembly / Closing Check.',
          'A final check for Reading Application Bootstrap Flow should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Reading Application Bootstrap Flow tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Reading Play Space Factories', 'Understanding Fixed Step Sessions', 'Switching Play Spaces'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Runtime Integration',
    group: 'Session Assembly',
    title: 'Reading Play Space Factories',
    description:
      'Explains how My World and Othello sessions are assembled. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-play-space-factories-source-scope',
        title: 'Play Space Factories Source Scope',
        body: [
          'Play-space factories construct session state from saved data or defaults. They provide the initial world, player, settings, inventory, AI state, and space-specific controllers. The point matters in source scope because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Source Scope.',
          'Source Scope defines the useful size of Reading Play Space Factories. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'Reading Play Space Factories should not use source scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-play-space-factories-owning-layer',
        title: 'Play Space Factories Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Play Space Factories. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The fact also tells the reader which evidence to preserve for owning layer: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Owning Layer.',
          'A direct observation for Reading Play Space Factories should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'Use owning layer to keep Reading Play Space Factories tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-play-space-factories-call-path',
        title: 'Play Space Factories Call Path',
        body: [
          'Reading Play Space Factories should not use source scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Reading Play Space Factories, call path is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Call Path.',
          'Reading Play Space Factories separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'Reading Play Space Factories should not use call path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-play-space-factories-facade-boundary',
        title: 'Play Space Factories Facade Boundary',
        body: [
          'Reading Play Space Factories should be read as interpretation for play space factories within Runtime Integration and Session Assembly. The point matters in facade boundary because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Facade Boundary.',
          'Ownership in Reading Play Space Factories is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'The useful result of Reading Play Space Factories facade boundary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Session Assembly.',
        ],
      },
      {
        id: 'reading-play-space-factories-schema-or-store',
        title: 'Play Space Factories Schema or Store',
        body: [
          'A direct observation for Reading Play Space Factories should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. Reading Play Space Factories uses the fact as schema or store evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Schema or Store.',
          'Visible feedback for Reading Play Space Factories should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Runtime Integration / Session Assembly.',
          'Use schema or store to keep Reading Play Space Factories tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-play-space-factories-resource-root',
        title: 'Play Space Factories Resource Root',
        body: [
          'Use owning layer to keep Reading Play Space Factories tied to Runtime Integration; use a related page only when the reader needs a different owner. In Reading Play Space Factories, resource root is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Resource Root.',
          'When Reading Play Space Factories touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading Play Space Factories should not use resource root to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-play-space-factories-tool-command',
        title: 'Play Space Factories Tool Command',
        body: [
          'The My World factory uses the My World saved state or default world generation and spawn state, then creates a session around that simulation data. In Reading Play Space Factories, call path is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Call Path. That reading gives Reading Play Space Factories a public anchor for tool command without adding behavior that the current category does not own. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Tool Command.',
          'The surrounding context for Reading Play Space Factories decides which adjacent topic is relevant. Reading Play Space Factories should be compared with Reading Application Bootstrap Flow, Switching Play Spaces, Understanding Fixed Step Sessions only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for tool command does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Play Space Factories should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-play-space-factories-format-or-build',
        title: 'Play Space Factories Format or Build',
        body: [
          'Reading Play Space Factories separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for format or build: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Format or Build.',
          'Recovery or follow-up for Reading Play Space Factories should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use format or build to keep Reading Play Space Factories tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-play-space-factories-policy-file',
        title: 'Play Space Factories Policy File',
        body: [
          'Reading Play Space Factories should not use call path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for policy file: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Policy File.',
          'The main confusion risk in Reading Play Space Factories is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the policy file part of Reading Play Space Factories should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-play-space-factories-authorization',
        title: 'Play Space Factories Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. The point matters in authorization because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Authorization.',
          'Reportable evidence for Reading Play Space Factories should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Reading Play Space Factories should not use authorization to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-play-space-factories-failure-reading',
        title: 'Play Space Factories Failure Reading',
        body: [
          'Ownership in Reading Play Space Factories is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. Reading Play Space Factories uses the fact as failure reading evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Failure Reading.',
          'Adjacent pages matter for Reading Play Space Factories, but adjacency does not move authority. Reading Play Space Factories should be compared with Reading Application Bootstrap Flow, Switching Play Spaces, Understanding Fixed Step Sessions only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use failure reading to keep Reading Play Space Factories tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-play-space-factories-working-tree',
        title: 'Play Space Factories Working Tree',
        body: [
          'The useful result of Reading Play Space Factories facade boundary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Session Assembly. Reading Play Space Factories uses the fact as working tree evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Working Tree.',
          'The public boundary for Reading Play Space Factories is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use working tree to keep Reading Play Space Factories tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-play-space-factories-related-developer',
        title: 'Play Space Factories Related Developer',
        body: [
          'The Othello factory creates the Othello board environment, match state, settings, player spawn, and Othello-specific space data. The UI consumes the resulting session rather than building it directly. Reading Play Space Factories uses the fact as schema or store evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Schema or Store. In Reading Play Space Factories, related developer is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Related Developer.',
          'An operator reading Reading Play Space Factories should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'Reading Play Space Factories should not use related developer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-play-space-factories-public-limit',
        title: 'Play Space Factories Public Limit',
        body: [
          'Visible feedback for Reading Play Space Factories should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Runtime Integration / Session Assembly. In Reading Play Space Factories, public limit is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Public Limit.',
          'Implementation limits for Reading Play Space Factories keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for public limit does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Play Space Factories should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-play-space-factories-technical-summary',
        title: 'Play Space Factories Technical Summary',
        body: [
          'Play-space factories construct session state from saved data or defaults. They provide the initial world, player, settings, inventory, AI state, and space-specific controllers. That reading gives Reading Play Space Factories a public anchor for technical summary without adding behavior that the current category does not own. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Technical Summary.',
          'The summary value of Reading Play Space Factories is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Reading Play Space Factories technical summary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Session Assembly.',
        ],
      },
      {
        id: 'reading-play-space-factories-closing-check',
        title: 'Play Space Factories Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Play Space Factories. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Play Space Factories / Runtime Integration / Session Assembly / Closing Check.',
          'A final check for Reading Play Space Factories should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Reading Play Space Factories tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Reading Application Bootstrap Flow', 'Switching Play Spaces', 'Understanding Fixed Step Sessions'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Runtime Integration',
    group: 'Persistence Boundaries',
    title: 'Reading Persistence Schemas',
    description:
      'Explains the versioned schema modules that define saved Ludoxel data. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-persistence-schemas-source-scope',
        title: 'Persistence Schemas Source Scope',
        body: [
          'Persistence schemas cover player state, world state, settings, inventory, AI actors, AI learning settings, Othello state, play-space data, and file envelopes. For Reading Persistence Schemas, that fact identifies the first concrete boundary for source scope: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Source Scope.',
          'Source Scope defines the useful size of Reading Persistence Schemas. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'When Reading Persistence Schemas crosses from source scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-persistence-schemas-owning-layer',
        title: 'Persistence Schemas Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Persistence Schemas. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. In Reading Persistence Schemas, owning layer is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Owning Layer.',
          'A direct observation for Reading Persistence Schemas should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'Reading Persistence Schemas should not use owning layer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-persistence-schemas-call-path',
        title: 'Persistence Schemas Call Path',
        body: [
          'When Reading Persistence Schemas crosses from source scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for call path: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Call Path.',
          'Reading Persistence Schemas separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'A public report based on the call path part of Reading Persistence Schemas should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-persistence-schemas-facade-boundary',
        title: 'Persistence Schemas Facade Boundary',
        body: [
          'Reading Persistence Schemas should be read as interpretation for persistence schemas within Runtime Integration and Persistence Boundaries. In Reading Persistence Schemas, owning layer is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Owning Layer. For Reading Persistence Schemas, that fact identifies the first concrete boundary for facade boundary: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Facade Boundary.',
          'Ownership in Reading Persistence Schemas is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'When Reading Persistence Schemas crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-persistence-schemas-schema-or-store',
        title: 'Persistence Schemas Schema or Store',
        body: [
          'A direct observation for Reading Persistence Schemas should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. The point matters in schema or store because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Schema or Store.',
          'Visible feedback for Reading Persistence Schemas should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Runtime Integration / Persistence Boundaries.',
          'The useful result of Reading Persistence Schemas schema or store is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Persistence Boundaries.',
        ],
      },
      {
        id: 'reading-persistence-schemas-resource-root',
        title: 'Persistence Schemas Resource Root',
        body: [
          'Reading Persistence Schemas should not use owning layer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Reading Persistence Schemas, that fact identifies the first concrete boundary for resource root: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Resource Root.',
          'When Reading Persistence Schemas touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Reading Persistence Schemas crosses from resource root into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-persistence-schemas-tool-command',
        title: 'Persistence Schemas Tool Command',
        body: [
          'File envelopes carry schema versions and migration behavior. Runtime code should decode through schemas instead of reading arbitrary dictionaries as trusted state. For Reading Persistence Schemas, that fact identifies the first concrete boundary for tool command: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Tool Command.',
          'The surrounding context for Reading Persistence Schemas decides which adjacent topic is relevant. Reading Persistence Schemas should be compared with Reading Store Responsibilities, Reading Saved Preferences, Understanding Othello Setting Persistence only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the tool command part of Reading Persistence Schemas should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-persistence-schemas-format-or-build',
        title: 'Persistence Schemas Format or Build',
        body: [
          'Reading Persistence Schemas separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. In Reading Persistence Schemas, format or build is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Format or Build.',
          'Recovery or follow-up for Reading Persistence Schemas should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for format or build does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Persistence Schemas should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-persistence-schemas-policy-file',
        title: 'Persistence Schemas Policy File',
        body: [
          'A public report based on the call path part of Reading Persistence Schemas should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in policy file because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Policy File.',
          'The main confusion risk in Reading Persistence Schemas is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Reading Persistence Schemas policy file is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Persistence Boundaries.',
        ],
      },
      {
        id: 'reading-persistence-schemas-authorization',
        title: 'Persistence Schemas Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. For Reading Persistence Schemas, that fact identifies the first concrete boundary for authorization: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Authorization.',
          'Reportable evidence for Reading Persistence Schemas should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the authorization part of Reading Persistence Schemas should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-persistence-schemas-failure-reading',
        title: 'Persistence Schemas Failure Reading',
        body: [
          'Ownership in Reading Persistence Schemas is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. That reading gives Reading Persistence Schemas a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Failure Reading.',
          'Adjacent pages matter for Reading Persistence Schemas, but adjacency does not move authority. Reading Persistence Schemas should be compared with Reading Store Responsibilities, Reading Saved Preferences, Understanding Othello Setting Persistence only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Persistence Schemas should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-persistence-schemas-working-tree',
        title: 'Persistence Schemas Working Tree',
        body: [
          'When Reading Persistence Schemas crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Reading Persistence Schemas a public anchor for working tree without adding behavior that the current category does not own. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Working Tree.',
          'The public boundary for Reading Persistence Schemas is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Reading Persistence Schemas working tree is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Persistence Boundaries.',
        ],
      },
      {
        id: 'reading-persistence-schemas-related-developer',
        title: 'Persistence Schemas Related Developer',
        body: [
          'Schemas define saved data shape in the application layer. Simulation owns domain meaning, and presentation should not change schemas for display convenience. For Reading Persistence Schemas, that fact identifies the first concrete boundary for related developer: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Related Developer.',
          'An operator reading Reading Persistence Schemas should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'When Reading Persistence Schemas crosses from related developer into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-persistence-schemas-public-limit',
        title: 'Persistence Schemas Public Limit',
        body: [
          'Visible feedback for Reading Persistence Schemas should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Runtime Integration / Persistence Boundaries. For Reading Persistence Schemas, that fact identifies the first concrete boundary for public limit: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Public Limit.',
          'Implementation limits for Reading Persistence Schemas keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Reading Persistence Schemas crosses from public limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-persistence-schemas-technical-summary',
        title: 'Persistence Schemas Technical Summary',
        body: [
          'Persistence schemas cover player state, world state, settings, inventory, AI actors, AI learning settings, Othello state, play-space data, and file envelopes. For Reading Persistence Schemas, that fact identifies the first concrete boundary for technical summary: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Technical Summary.',
          'The summary value of Reading Persistence Schemas is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the technical summary part of Reading Persistence Schemas should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-persistence-schemas-closing-check',
        title: 'Persistence Schemas Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Persistence Schemas. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The point matters in closing check because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Persistence Schemas / Runtime Integration / Persistence Boundaries / Closing Check.',
          'A final check for Reading Persistence Schemas should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Reading Persistence Schemas should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Reading Store Responsibilities', 'Reading Saved Preferences', 'Understanding Othello Setting Persistence'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Runtime Integration',
    group: 'Persistence Boundaries',
    title: 'Reading Store Responsibilities',
    description:
      'Explains what Ludoxel persistence stores own beyond schema shapes. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-store-responsibilities-source-scope',
        title: 'Store Responsibilities Source Scope',
        body: [
          'JSON-backed stores own atomic reading and writing, object validation, temporary-file replacement, and filesystem errors around persisted state. Reading Store Responsibilities uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Source Scope. Reading Store Responsibilities uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Source Scope.',
          'Source Scope defines the useful size of Reading Store Responsibilities. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'Use source scope to keep Reading Store Responsibilities tied to Runtime Integration; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-store-responsibilities-owning-layer',
        title: 'Store Responsibilities Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Store Responsibilities. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. That reading gives Reading Store Responsibilities a public anchor for owning layer without adding behavior that the current category does not own. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Owning Layer.',
          'A direct observation for Reading Store Responsibilities should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'If the available evidence for owning layer does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Store Responsibilities should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-store-responsibilities-call-path',
        title: 'Store Responsibilities Call Path',
        body: [
          'Use source scope to keep Reading Store Responsibilities tied to Runtime Integration; use a related page only when the reader needs a different owner. For Reading Store Responsibilities, that fact identifies the first concrete boundary for call path: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Call Path.',
          'Reading Store Responsibilities separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'When Reading Store Responsibilities crosses from call path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-store-responsibilities-facade-boundary',
        title: 'Store Responsibilities Facade Boundary',
        body: [
          'Reading Store Responsibilities should be read as interpretation for store responsibilities within Runtime Integration and Persistence Boundaries. For Reading Store Responsibilities, that fact identifies the first concrete boundary for facade boundary: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Facade Boundary.',
          'Ownership in Reading Store Responsibilities is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'When Reading Store Responsibilities crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-store-responsibilities-schema-or-store',
        title: 'Store Responsibilities Schema or Store',
        body: [
          'A direct observation for Reading Store Responsibilities should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. The point matters in schema or store because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Schema or Store.',
          'Visible feedback for Reading Store Responsibilities should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Runtime Integration / Persistence Boundaries.',
          'The useful result of Reading Store Responsibilities schema or store is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Persistence Boundaries.',
        ],
      },
      {
        id: 'reading-store-responsibilities-resource-root',
        title: 'Store Responsibilities Resource Root',
        body: [
          'If the available evidence for owning layer does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Store Responsibilities should be treated as an observation rather than a confirmed cause. For Reading Store Responsibilities, that fact identifies the first concrete boundary for resource root: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Resource Root.',
          'When Reading Store Responsibilities touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Reading Store Responsibilities crosses from resource root into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-store-responsibilities-tool-command',
        title: 'Store Responsibilities Tool Command',
        body: [
          'Application stores manage player and world state files, previous-format fallbacks, integrity manifests, AI learning artifacts, policies, evaluations, datasets, and opening-book hooks. Reading Store Responsibilities uses the fact as tool command evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Tool Command.',
          'The surrounding context for Reading Store Responsibilities decides which adjacent topic is relevant. Reading Store Responsibilities should be compared with Reading Persistence Schemas, Reading Saved World State, Reading Saved AI State only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Reading Store Responsibilities crosses from tool command into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-store-responsibilities-format-or-build',
        title: 'Store Responsibilities Format or Build',
        body: [
          'Reading Store Responsibilities separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. In Reading Store Responsibilities, format or build is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Format or Build.',
          'Recovery or follow-up for Reading Store Responsibilities should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for format or build does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Store Responsibilities should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-store-responsibilities-policy-file',
        title: 'Store Responsibilities Policy File',
        body: [
          'When Reading Store Responsibilities crosses from call path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Reading Store Responsibilities a public anchor for policy file without adding behavior that the current category does not own. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Policy File.',
          'The main confusion risk in Reading Store Responsibilities is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for policy file does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Store Responsibilities should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-store-responsibilities-authorization',
        title: 'Store Responsibilities Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. For Reading Store Responsibilities, that fact identifies the first concrete boundary for authorization: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Authorization.',
          'Reportable evidence for Reading Store Responsibilities should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the authorization part of Reading Store Responsibilities should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-store-responsibilities-failure-reading',
        title: 'Store Responsibilities Failure Reading',
        body: [
          'Ownership in Reading Store Responsibilities is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. That reading gives Reading Store Responsibilities a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Failure Reading.',
          'Adjacent pages matter for Reading Store Responsibilities, but adjacency does not move authority. Reading Store Responsibilities should be compared with Reading Persistence Schemas, Reading Saved World State, Reading Saved AI State only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Store Responsibilities should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-store-responsibilities-working-tree',
        title: 'Store Responsibilities Working Tree',
        body: [
          'When Reading Store Responsibilities crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Reading Store Responsibilities a public anchor for working tree without adding behavior that the current category does not own. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Working Tree.',
          'The public boundary for Reading Store Responsibilities is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Reading Store Responsibilities working tree is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Persistence Boundaries.',
        ],
      },
      {
        id: 'reading-store-responsibilities-related-developer',
        title: 'Store Responsibilities Related Developer',
        body: [
          'Stores operate under the application-managed runtime data root. Simulation should not decide save paths, and presentation should not bypass store responsibilities. The fact also tells the reader which evidence to preserve for related developer: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Related Developer.',
          'An operator reading Reading Store Responsibilities should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the related developer part of Reading Store Responsibilities should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-store-responsibilities-public-limit',
        title: 'Store Responsibilities Public Limit',
        body: [
          'Visible feedback for Reading Store Responsibilities should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Runtime Integration / Persistence Boundaries. For Reading Store Responsibilities, that fact identifies the first concrete boundary for public limit: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Public Limit.',
          'Implementation limits for Reading Store Responsibilities keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Reading Store Responsibilities crosses from public limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-store-responsibilities-technical-summary',
        title: 'Store Responsibilities Technical Summary',
        body: [
          'JSON-backed stores own atomic reading and writing, object validation, temporary-file replacement, and filesystem errors around persisted state. Reading Store Responsibilities uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Source Scope. For Reading Store Responsibilities, that fact identifies the first concrete boundary for technical summary: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Technical Summary.',
          'The summary value of Reading Store Responsibilities is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the technical summary part of Reading Store Responsibilities should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-store-responsibilities-closing-check',
        title: 'Store Responsibilities Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Store Responsibilities. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The point matters in closing check because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Store Responsibilities / Runtime Integration / Persistence Boundaries / Closing Check.',
          'A final check for Reading Store Responsibilities should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Reading Store Responsibilities should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Reading Persistence Schemas', 'Reading Saved World State', 'Reading Saved AI State'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling and Checks',
    group: 'Repository Checks',
    title: 'Running Project Checks with Permission',
    description:
      'Explains the repository check runner and the scope of local verification commands. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'running-project-checks-with-permission-source-scope',
        title: 'Project Checks with Permission Source Scope',
        body: [
          'Project checks are dispatched through the Node tooling runner. Check groups can cover documentation, legal material, resources, shaders, package data, or all configured checks. That reading gives Running Project Checks with Permission a public anchor for source scope without adding behavior that the current category does not own. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Source Scope.',
          'Source Scope defines the useful size of Running Project Checks with Permission. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'If the available evidence for source scope does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Project Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-owning-layer',
        title: 'Project Checks with Permission Owning Layer',
        body: [
          'Source Scope defines the useful size of Running Project Checks with Permission. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The fact also tells the reader which evidence to preserve for owning layer: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Owning Layer.',
          'A direct observation for Running Project Checks with Permission should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'A public report based on the owning layer part of Running Project Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-call-path',
        title: 'Project Checks with Permission Call Path',
        body: [
          'If the available evidence for source scope does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Project Checks with Permission should be treated as an observation rather than a confirmed cause. That reading gives Running Project Checks with Permission a public anchor for call path without adding behavior that the current category does not own. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Call Path.',
          'Running Project Checks with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'The useful result of Running Project Checks with Permission call path is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Repository Checks.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-facade-boundary',
        title: 'Project Checks with Permission Facade Boundary',
        body: [
          'Running Project Checks with Permission should be read as authorized operation for project checks with permission within Tooling and Checks and Repository Checks. That reading gives Running Project Checks with Permission a public anchor for facade boundary without adding behavior that the current category does not own. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Facade Boundary.',
          'Ownership in Running Project Checks with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'The useful result of Running Project Checks with Permission facade boundary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Repository Checks.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-schema-or-store',
        title: 'Project Checks with Permission Schema or Store',
        body: [
          'A direct observation for Running Project Checks with Permission should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. For Running Project Checks with Permission, that fact identifies the first concrete boundary for schema or store: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Schema or Store.',
          'Visible feedback for Running Project Checks with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Tooling and Checks / Repository Checks.',
          'A public report based on the schema or store part of Running Project Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-resource-root',
        title: 'Project Checks with Permission Resource Root',
        body: [
          'A public report based on the owning layer part of Running Project Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in resource root because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Resource Root.',
          'When Running Project Checks with Permission touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Running Project Checks with Permission should not use resource root to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-tool-command',
        title: 'Project Checks with Permission Tool Command',
        body: [
          'Run checks that match the authorized task. A docs-only check does not prove desktop packaging, and a package check does not prove gameplay behavior. In Running Project Checks with Permission, tool command is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Tool Command.',
          'The surrounding context for Running Project Checks with Permission decides which adjacent topic is relevant. Running Project Checks with Permission should be compared with Reading Documentation Check Failures, Running Web Formatting with Permission, Running Desktop Builds with Permission only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for tool command does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Project Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-format-or-build',
        title: 'Project Checks with Permission Format or Build',
        body: [
          'Running Project Checks with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. For Running Project Checks with Permission, that fact identifies the first concrete boundary for format or build: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Format or Build.',
          'Recovery or follow-up for Running Project Checks with Permission should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Running Project Checks with Permission crosses from format or build into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-policy-file',
        title: 'Project Checks with Permission Policy File',
        body: [
          'The useful result of Running Project Checks with Permission call path is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Repository Checks. The fact also tells the reader which evidence to preserve for policy file: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Policy File.',
          'The main confusion risk in Running Project Checks with Permission is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use policy file to keep Running Project Checks with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-authorization',
        title: 'Project Checks with Permission Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. That reading gives Running Project Checks with Permission a public anchor for authorization without adding behavior that the current category does not own. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Authorization.',
          'Reportable evidence for Running Project Checks with Permission should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for authorization does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Project Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-failure-reading',
        title: 'Project Checks with Permission Failure Reading',
        body: [
          'Ownership in Running Project Checks with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. For Running Project Checks with Permission, that fact identifies the first concrete boundary for failure reading: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Failure Reading.',
          'Adjacent pages matter for Running Project Checks with Permission, but adjacency does not move authority. Running Project Checks with Permission should be compared with Reading Documentation Check Failures, Running Web Formatting with Permission, Running Desktop Builds with Permission only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the failure reading part of Running Project Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-working-tree',
        title: 'Project Checks with Permission Working Tree',
        body: [
          'The useful result of Running Project Checks with Permission facade boundary is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Repository Checks. For Running Project Checks with Permission, that fact identifies the first concrete boundary for working tree: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Working Tree.',
          'The public boundary for Running Project Checks with Permission is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the working tree part of Running Project Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-related-developer',
        title: 'Project Checks with Permission Related Developer',
        body: [
          'Report the command, exit status, and meaningful failure lines. Do not claim a check passed if it was skipped, blocked, or run only for a narrower scope. In Running Project Checks with Permission, related developer is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Related Developer.',
          'An operator reading Running Project Checks with Permission should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for related developer does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Project Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-public-limit',
        title: 'Project Checks with Permission Public Limit',
        body: [
          'Visible feedback for Running Project Checks with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Tooling and Checks / Repository Checks. The point matters in public limit because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Public Limit.',
          'Implementation limits for Running Project Checks with Permission keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Running Project Checks with Permission public limit is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Repository Checks.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-technical-summary',
        title: 'Project Checks with Permission Technical Summary',
        body: [
          'Project checks are dispatched through the Node tooling runner. Check groups can cover documentation, legal material, resources, shaders, package data, or all configured checks. That reading gives Running Project Checks with Permission a public anchor for technical summary without adding behavior that the current category does not own. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Technical Summary.',
          'The summary value of Running Project Checks with Permission is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for technical summary does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Project Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-project-checks-with-permission-closing-check',
        title: 'Project Checks with Permission Closing Check',
        body: [
          'Source Scope defines the useful size of Running Project Checks with Permission. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. For Running Project Checks with Permission, that fact identifies the first concrete boundary for closing check: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Project Checks with Permission / Tooling and Checks / Repository Checks / Closing Check.',
          'A final check for Running Project Checks with Permission should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Running Project Checks with Permission crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Reading Documentation Check Failures', 'Running Web Formatting with Permission', 'Running Desktop Builds with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling and Checks',
    group: 'Repository Checks',
    title: 'Reading Documentation Check Failures',
    description:
      'Explains what Ludoxel documentation checks inspect. This page treats documentation check failures as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-documentation-check-failures-source-scope',
        title: 'Documentation Check Failures Source Scope',
        body: [
          'Documentation checks read repository text files and required README terms. They verify presence of required public-document language, not runtime behavior. Reading Documentation Check Failures uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Source Scope. Reading Documentation Check Failures uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Source Scope.',
          'Source Scope defines the useful size of Reading Documentation Check Failures. The article should be broad enough to explain documentation check failures, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion.',
          'Use source scope to keep Reading Documentation Check Failures tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-owning-layer',
        title: 'Documentation Check Failures Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Documentation Check Failures. The article should be broad enough to explain documentation check failures, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. The point matters in owning layer because reading documentation check failures in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Owning Layer.',
          'A direct observation for Reading Documentation Check Failures should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'The useful result of Reading Documentation Check Failures owning layer is a bounded explanation of documentation check failures: enough detail to act, and enough restraint to avoid claims outside Repository Checks.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-call-path',
        title: 'Documentation Check Failures Call Path',
        body: [
          'Use source scope to keep Reading Documentation Check Failures tied to Tooling and Checks; use a related page only when the reader needs a different owner. For Reading Documentation Check Failures, that fact identifies the first concrete boundary for call path: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Call Path.',
          'Reading Documentation Check Failures separates the surface that accepts input from the component or document that controls the result. This is especially important when reading documentation check failures in its documented category crosses a saved value, a renderer output, or a public form.',
          'When Reading Documentation Check Failures crosses from call path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-facade-boundary',
        title: 'Documentation Check Failures Facade Boundary',
        body: [
          'Reading Documentation Check Failures should be read as interpretation for documentation check failures within Tooling and Checks and Repository Checks. For Reading Documentation Check Failures, that fact identifies the first concrete boundary for facade boundary: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Facade Boundary.',
          'Ownership in Reading Documentation Check Failures is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'When Reading Documentation Check Failures crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-schema-or-store',
        title: 'Documentation Check Failures Schema or Store',
        body: [
          'A direct observation for Reading Documentation Check Failures should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. The point matters in schema or store because reading documentation check failures in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Schema or Store.',
          'Visible feedback for Reading Documentation Check Failures should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Tooling and Checks / Repository Checks.',
          'The useful result of Reading Documentation Check Failures schema or store is a bounded explanation of documentation check failures: enough detail to act, and enough restraint to avoid claims outside Repository Checks.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-resource-root',
        title: 'Documentation Check Failures Resource Root',
        body: [
          'The useful result of Reading Documentation Check Failures owning layer is a bounded explanation of documentation check failures: enough detail to act, and enough restraint to avoid claims outside Repository Checks. Reading Documentation Check Failures uses the fact as resource root evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Resource Root.',
          'When Reading Documentation Check Failures touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use resource root to keep Reading Documentation Check Failures tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-tool-command',
        title: 'Documentation Check Failures Tool Command',
        body: [
          'A documentation check failure usually points to missing or changed public wording. It should be fixed in the owning document rather than hidden with unrelated code changes. The fact also tells the reader which evidence to preserve for tool command: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Tool Command.',
          'The surrounding context for Reading Documentation Check Failures decides which adjacent topic is relevant. Reading Documentation Check Failures should be compared with Running Project Checks with Permission, Running Package Checks with Permission, Running Web Formatting with Permission only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use tool command to keep Reading Documentation Check Failures tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-format-or-build',
        title: 'Documentation Check Failures Format or Build',
        body: [
          'Reading Documentation Check Failures separates the surface that accepts input from the component or document that controls the result. This is especially important when reading documentation check failures in its documented category crosses a saved value, a renderer output, or a public form. The point matters in format or build because reading documentation check failures in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Format or Build.',
          'Recovery or follow-up for Reading Documentation Check Failures should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Reading Documentation Check Failures should not use format or build to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-policy-file',
        title: 'Documentation Check Failures Policy File',
        body: [
          'When Reading Documentation Check Failures crosses from call path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Reading Documentation Check Failures a public anchor for policy file without adding behavior that the current category does not own. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Policy File.',
          'The main confusion risk in Reading Documentation Check Failures is moving the topic outside its confirmed boundary. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for policy file does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Documentation Check Failures should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-authorization',
        title: 'Documentation Check Failures Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. For Reading Documentation Check Failures, that fact identifies the first concrete boundary for authorization: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Authorization.',
          'Reportable evidence for Reading Documentation Check Failures should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the authorization part of Reading Documentation Check Failures should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-failure-reading',
        title: 'Documentation Check Failures Failure Reading',
        body: [
          'Ownership in Reading Documentation Check Failures is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. That reading gives Reading Documentation Check Failures a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Failure Reading.',
          'Adjacent pages matter for Reading Documentation Check Failures, but adjacency does not move authority. Reading Documentation Check Failures should be compared with Running Project Checks with Permission, Running Package Checks with Permission, Running Web Formatting with Permission only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Documentation Check Failures should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-working-tree',
        title: 'Documentation Check Failures Working Tree',
        body: [
          'When Reading Documentation Check Failures crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The point matters in working tree because reading documentation check failures in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Working Tree.',
          'The public boundary for Reading Documentation Check Failures is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Reading Documentation Check Failures should not use working tree to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-related-developer',
        title: 'Documentation Check Failures Related Developer',
        body: [
          'Passing documentation checks does not prove website article quality, legal sufficiency, or gameplay accuracy. It is one verification signal among others. Reading Documentation Check Failures uses the fact as related developer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Related Developer.',
          'An operator reading Reading Documentation Check Failures should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'Use related developer to keep Reading Documentation Check Failures tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-public-limit',
        title: 'Documentation Check Failures Public Limit',
        body: [
          'Visible feedback for Reading Documentation Check Failures should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Tooling and Checks / Repository Checks. The fact also tells the reader which evidence to preserve for public limit: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Public Limit.',
          'Implementation limits for Reading Documentation Check Failures keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the public limit part of Reading Documentation Check Failures should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-technical-summary',
        title: 'Documentation Check Failures Technical Summary',
        body: [
          'Documentation checks read repository text files and required README terms. They verify presence of required public-document language, not runtime behavior. Reading Documentation Check Failures uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Source Scope. Reading Documentation Check Failures uses the fact as technical summary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Technical Summary.',
          'The summary value of Reading Documentation Check Failures is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Reading Documentation Check Failures crosses from technical summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-documentation-check-failures-closing-check',
        title: 'Documentation Check Failures Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Documentation Check Failures. The article should be broad enough to explain documentation check failures, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. The point matters in closing check because reading documentation check failures in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Documentation Check Failures / Tooling and Checks / Repository Checks / Closing Check.',
          'A final check for Reading Documentation Check Failures should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Reading Documentation Check Failures should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Running Project Checks with Permission', 'Running Package Checks with Permission', 'Running Web Formatting with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling and Checks',
    group: 'Formatting and Builds',
    title: 'Running Web Formatting with Permission',
    description:
      'Explains website formatting checks and their safe scope. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'running-web-formatting-with-permission-source-scope',
        title: 'Web Formatting with Permission Source Scope',
        body: [
          'Website formatting checks run the website Prettier configuration over website source. They can report formatting differences without checking application runtime behavior. The fact also tells the reader which evidence to preserve for source scope: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Source Scope.',
          'Source Scope defines the useful size of Running Web Formatting with Permission. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'Use source scope to keep Running Web Formatting with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-owning-layer',
        title: 'Web Formatting with Permission Owning Layer',
        body: [
          'Source Scope defines the useful size of Running Web Formatting with Permission. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. That reading gives Running Web Formatting with Permission a public anchor for owning layer without adding behavior that the current category does not own. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Owning Layer.',
          'A direct observation for Running Web Formatting with Permission should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'The useful result of Running Web Formatting with Permission owning layer is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Formatting and Builds.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-call-path',
        title: 'Web Formatting with Permission Call Path',
        body: [
          'Use source scope to keep Running Web Formatting with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner. For Running Web Formatting with Permission, that fact identifies the first concrete boundary for call path: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Call Path.',
          'Running Web Formatting with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'A public report based on the call path part of Running Web Formatting with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-facade-boundary',
        title: 'Web Formatting with Permission Facade Boundary',
        body: [
          'Running Web Formatting with Permission should be read as authorized operation for web formatting with permission within Tooling and Checks and Formatting and Builds. Running Web Formatting with Permission uses the fact as facade boundary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Facade Boundary.',
          'Ownership in Running Web Formatting with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'A public report based on the facade boundary part of Running Web Formatting with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-schema-or-store',
        title: 'Web Formatting with Permission Schema or Store',
        body: [
          'A direct observation for Running Web Formatting with Permission should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. In Running Web Formatting with Permission, schema or store is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Schema or Store.',
          'Visible feedback for Running Web Formatting with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Tooling and Checks / Formatting and Builds.',
          'If the available evidence for schema or store does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Web Formatting with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-resource-root',
        title: 'Web Formatting with Permission Resource Root',
        body: [
          'The useful result of Running Web Formatting with Permission owning layer is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Formatting and Builds. The fact also tells the reader which evidence to preserve for resource root: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Resource Root.',
          'When Running Web Formatting with Permission touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use resource root to keep Running Web Formatting with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-tool-command',
        title: 'Web Formatting with Permission Tool Command',
        body: [
          'Formatting commands that write files should be limited to authorized paths. Broad formatting can change UI, style, or route files outside a content-only task. Running Web Formatting with Permission uses the fact as tool command evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Tool Command.',
          'The surrounding context for Running Web Formatting with Permission decides which adjacent topic is relevant. Running Web Formatting with Permission should be compared with Running Project Checks with Permission, Keeping Presentation Styling Out of Python Logic, Changing Shadow Preferences only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use tool command to keep Running Web Formatting with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-format-or-build',
        title: 'Web Formatting with Permission Format or Build',
        body: [
          'Running Web Formatting with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. That reading gives Running Web Formatting with Permission a public anchor for format or build without adding behavior that the current category does not own. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Format or Build.',
          'Recovery or follow-up for Running Web Formatting with Permission should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for format or build does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Web Formatting with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-policy-file',
        title: 'Web Formatting with Permission Policy File',
        body: [
          'A public report based on the call path part of Running Web Formatting with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in policy file because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Policy File.',
          'The main confusion risk in Running Web Formatting with Permission is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Running Web Formatting with Permission should not use policy file to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-authorization',
        title: 'Web Formatting with Permission Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. Running Web Formatting with Permission uses the fact as facade boundary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Facade Boundary. Running Web Formatting with Permission uses the fact as authorization evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Authorization.',
          'Reportable evidence for Running Web Formatting with Permission should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use authorization to keep Running Web Formatting with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-failure-reading',
        title: 'Web Formatting with Permission Failure Reading',
        body: [
          'Ownership in Running Web Formatting with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. In Running Web Formatting with Permission, failure reading is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Failure Reading.',
          'Adjacent pages matter for Running Web Formatting with Permission, but adjacency does not move authority. Running Web Formatting with Permission should be compared with Running Project Checks with Permission, Keeping Presentation Styling Out of Python Logic, Changing Shadow Preferences only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Web Formatting with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-working-tree',
        title: 'Web Formatting with Permission Working Tree',
        body: [
          'A public report based on the facade boundary part of Running Web Formatting with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Running Web Formatting with Permission, working tree is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Working Tree.',
          'The public boundary for Running Web Formatting with Permission is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Running Web Formatting with Permission should not use working tree to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-related-developer',
        title: 'Web Formatting with Permission Related Developer',
        body: [
          'If formatting fails, either adjust the allowed files manually or run a scoped formatter on the allowed files, then re-run the check. In Running Web Formatting with Permission, schema or store is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Schema or Store. For Running Web Formatting with Permission, that fact identifies the first concrete boundary for related developer: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Related Developer.',
          'An operator reading Running Web Formatting with Permission should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the related developer part of Running Web Formatting with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-public-limit',
        title: 'Web Formatting with Permission Public Limit',
        body: [
          'Visible feedback for Running Web Formatting with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Tooling and Checks / Formatting and Builds. The fact also tells the reader which evidence to preserve for public limit: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Public Limit.',
          'Implementation limits for Running Web Formatting with Permission keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use public limit to keep Running Web Formatting with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-technical-summary',
        title: 'Web Formatting with Permission Technical Summary',
        body: [
          'Website formatting checks run the website Prettier configuration over website source. They can report formatting differences without checking application runtime behavior. Running Web Formatting with Permission uses the fact as technical summary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Technical Summary.',
          'The summary value of Running Web Formatting with Permission is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use technical summary to keep Running Web Formatting with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-web-formatting-with-permission-closing-check',
        title: 'Web Formatting with Permission Closing Check',
        body: [
          'Source Scope defines the useful size of Running Web Formatting with Permission. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. That reading gives Running Web Formatting with Permission a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Running Web Formatting with Permission / Tooling and Checks / Formatting and Builds / Closing Check.',
          'A final check for Running Web Formatting with Permission should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Web Formatting with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Running Project Checks with Permission', 'Keeping Presentation Styling Out of Python Logic', 'Changing Shadow Preferences'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling and Checks',
    group: 'Formatting and Builds',
    title: 'Running Desktop Builds with Permission',
    description:
      'Explains developer-facing desktop build execution and its local effects. This page treats desktop distribution evidence as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'running-desktop-builds-with-permission-source-scope',
        title: 'Desktop Builds with Permission Source Scope',
        body: [
          'Desktop builds can create generated directories, package resources, copy legal files, include shaders, test native components, and produce platform artifacts. The fact also tells the reader which evidence to preserve for source scope: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Source Scope.',
          'Source Scope defines the useful size of Running Desktop Builds with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion.',
          'Use source scope to keep Running Desktop Builds with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-owning-layer',
        title: 'Desktop Builds with Permission Owning Layer',
        body: [
          'Source Scope defines the useful size of Running Desktop Builds with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. That reading gives Running Desktop Builds with Permission a public anchor for owning layer without adding behavior that the current category does not own. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Owning Layer.',
          'A direct observation for Running Desktop Builds with Permission should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'The useful result of Running Desktop Builds with Permission owning layer is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Formatting and Builds.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-call-path',
        title: 'Desktop Builds with Permission Call Path',
        body: [
          'Use source scope to keep Running Desktop Builds with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner. For Running Desktop Builds with Permission, that fact identifies the first concrete boundary for call path: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Call Path.',
          'Running Desktop Builds with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form.',
          'A public report based on the call path part of Running Desktop Builds with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-facade-boundary',
        title: 'Desktop Builds with Permission Facade Boundary',
        body: [
          'Running Desktop Builds with Permission should be read as authorized operation for desktop builds with permission within Tooling and Checks and Formatting and Builds. Running Desktop Builds with Permission uses the fact as facade boundary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Facade Boundary.',
          'Ownership in Running Desktop Builds with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'When Running Desktop Builds with Permission crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-schema-or-store',
        title: 'Desktop Builds with Permission Schema or Store',
        body: [
          'A direct observation for Running Desktop Builds with Permission should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. In Running Desktop Builds with Permission, schema or store is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Schema or Store.',
          'Visible feedback for Running Desktop Builds with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Tooling and Checks / Formatting and Builds.',
          'If the available evidence for schema or store does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Desktop Builds with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-resource-root',
        title: 'Desktop Builds with Permission Resource Root',
        body: [
          'The useful result of Running Desktop Builds with Permission owning layer is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Formatting and Builds. The fact also tells the reader which evidence to preserve for resource root: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Resource Root.',
          'When Running Desktop Builds with Permission touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use resource root to keep Running Desktop Builds with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-tool-command',
        title: 'Desktop Builds with Permission Tool Command',
        body: [
          'Because builds can be broad and platform-specific, run them only when the local task authorizes desktop build work. Do not treat a website or docs task as build permission. Running Desktop Builds with Permission uses the fact as tool command evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Tool Command.',
          'The surrounding context for Running Desktop Builds with Permission decides which adjacent topic is relevant. Running Desktop Builds with Permission should be compared with Running a Desktop Build with Permission, Reading Build Output, Avoiding Unofficial Release Claims only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use tool command to keep Running Desktop Builds with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-format-or-build',
        title: 'Desktop Builds with Permission Format or Build',
        body: [
          'Running Desktop Builds with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form. That reading gives Running Desktop Builds with Permission a public anchor for format or build without adding behavior that the current category does not own. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Format or Build.',
          'Recovery or follow-up for Running Desktop Builds with Permission should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for format or build does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Desktop Builds with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-policy-file',
        title: 'Desktop Builds with Permission Policy File',
        body: [
          'A public report based on the call path part of Running Desktop Builds with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in policy file because reading local build artifacts and package checks can otherwise be mistaken for describing local output as official release authority. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Policy File.',
          'The main confusion risk in Running Desktop Builds with Permission is describing local output as official release authority. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Running Desktop Builds with Permission should not use policy file to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-authorization',
        title: 'Desktop Builds with Permission Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. Running Desktop Builds with Permission uses the fact as facade boundary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Facade Boundary. The fact also tells the reader which evidence to preserve for authorization: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Authorization.',
          'Reportable evidence for Running Desktop Builds with Permission should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the authorization part of Running Desktop Builds with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-failure-reading',
        title: 'Desktop Builds with Permission Failure Reading',
        body: [
          'Ownership in Running Desktop Builds with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. In Running Desktop Builds with Permission, failure reading is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Failure Reading.',
          'Adjacent pages matter for Running Desktop Builds with Permission, but adjacency does not move authority. Running Desktop Builds with Permission should be compared with Running a Desktop Build with Permission, Reading Build Output, Avoiding Unofficial Release Claims only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Desktop Builds with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-working-tree',
        title: 'Desktop Builds with Permission Working Tree',
        body: [
          'When Running Desktop Builds with Permission crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. In Running Desktop Builds with Permission, working tree is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Working Tree.',
          'The public boundary for Running Desktop Builds with Permission is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Running Desktop Builds with Permission should not use working tree to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-related-developer',
        title: 'Desktop Builds with Permission Related Developer',
        body: [
          'Read build output with platform context. A Windows result does not prove macOS behavior, and a local artifact is not an official release. In Running Desktop Builds with Permission, schema or store is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Schema or Store. The fact also tells the reader which evidence to preserve for related developer: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Related Developer.',
          'An operator reading Running Desktop Builds with Permission should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'Use related developer to keep Running Desktop Builds with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-public-limit',
        title: 'Desktop Builds with Permission Public Limit',
        body: [
          'Visible feedback for Running Desktop Builds with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Tooling and Checks / Formatting and Builds. For Running Desktop Builds with Permission, that fact identifies the first concrete boundary for public limit: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Public Limit.',
          'Implementation limits for Running Desktop Builds with Permission keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the public limit part of Running Desktop Builds with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-technical-summary',
        title: 'Desktop Builds with Permission Technical Summary',
        body: [
          'Desktop builds can create generated directories, package resources, copy legal files, include shaders, test native components, and produce platform artifacts. Running Desktop Builds with Permission uses the fact as technical summary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Technical Summary.',
          'The summary value of Running Desktop Builds with Permission is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use technical summary to keep Running Desktop Builds with Permission tied to Tooling and Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-desktop-builds-with-permission-closing-check',
        title: 'Desktop Builds with Permission Closing Check',
        body: [
          'Source Scope defines the useful size of Running Desktop Builds with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. That reading gives Running Desktop Builds with Permission a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Running Desktop Builds with Permission / Tooling and Checks / Formatting and Builds / Closing Check.',
          'A final check for Running Desktop Builds with Permission should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Running Desktop Builds with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Reading Build Output', 'Avoiding Unofficial Release Claims'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Public Policy Files',
    title: 'Reading Contribution Policy',
    description:
      'Explains what the public contribution policy says about external material. This page treats AI policy and search behavior as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-contribution-policy-source-scope',
        title: 'Contribution Policy Source Scope',
        body: [
          'The policy allows narrow public communication through reproducible non-security problem reports, limited questions, and security contact requests. The point matters in source scope because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Source Scope.',
          'Source Scope defines the useful size of Reading Contribution Policy. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion.',
          'Reading Contribution Policy should not use source scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-contribution-policy-owning-layer',
        title: 'Contribution Policy Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Contribution Policy. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. The fact also tells the reader which evidence to preserve for owning layer: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Owning Layer.',
          'A direct observation for Reading Contribution Policy should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'Use owning layer to keep Reading Contribution Policy tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-contribution-policy-call-path',
        title: 'Contribution Policy Call Path',
        body: [
          'Reading Contribution Policy should not use source scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in call path because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Call Path.',
          'Reading Contribution Policy separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form.',
          'The useful result of Reading Contribution Policy call path is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Public Policy Files.',
        ],
      },
      {
        id: 'reading-contribution-policy-facade-boundary',
        title: 'Contribution Policy Facade Boundary',
        body: [
          'Reading Contribution Policy should be read as interpretation for contribution policy within Repository Policy and Public Policy Files. In Reading Contribution Policy, facade boundary is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Facade Boundary.',
          'Ownership in Reading Contribution Policy is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'Reading Contribution Policy should not use facade boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-contribution-policy-schema-or-store',
        title: 'Contribution Policy Schema or Store',
        body: [
          'A direct observation for Reading Contribution Policy should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. Reading Contribution Policy uses the fact as schema or store evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Schema or Store.',
          'Visible feedback for Reading Contribution Policy should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Public Policy Files.',
          'Use schema or store to keep Reading Contribution Policy tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-contribution-policy-resource-root',
        title: 'Contribution Policy Resource Root',
        body: [
          'Use owning layer to keep Reading Contribution Policy tied to Repository Policy; use a related page only when the reader needs a different owner. In Reading Contribution Policy, resource root is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Resource Root.',
          'When Reading Contribution Policy touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading Contribution Policy should not use resource root to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-contribution-policy-tool-command',
        title: 'Contribution Policy Tool Command',
        body: [
          'External contribution material is not accepted, including patches, source code, replacement text, assets, datasets, generated files, shader rewrites, feature implementations, and refactoring proposals. In Reading Contribution Policy, tool command is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Tool Command.',
          'The surrounding context for Reading Contribution Policy decides which adjacent topic is relevant. Reading Contribution Policy should be compared with Understanding Contribution Refusal, Understanding Pull Request Boundaries, Reading Issue Template Boundaries only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Reading Contribution Policy should not use tool command to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-contribution-policy-format-or-build',
        title: 'Contribution Policy Format or Build',
        body: [
          'Reading Contribution Policy separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form. For Reading Contribution Policy, that fact identifies the first concrete boundary for format or build: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Format or Build.',
          'Recovery or follow-up for Reading Contribution Policy should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the format or build part of Reading Contribution Policy should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-contribution-policy-policy-file',
        title: 'Contribution Policy Policy File',
        body: [
          'The useful result of Reading Contribution Policy call path is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Public Policy Files. Reading Contribution Policy uses the fact as policy file evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Policy File.',
          'The main confusion risk in Reading Contribution Policy is treating learning files as general user content. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use policy file to keep Reading Contribution Policy tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-contribution-policy-authorization',
        title: 'Contribution Policy Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. In Reading Contribution Policy, facade boundary is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Facade Boundary. The point matters in authorization because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Authorization.',
          'Reportable evidence for Reading Contribution Policy should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Reading Contribution Policy should not use authorization to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-contribution-policy-failure-reading',
        title: 'Contribution Policy Failure Reading',
        body: [
          'Ownership in Reading Contribution Policy is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The fact also tells the reader which evidence to preserve for failure reading: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Failure Reading.',
          'Adjacent pages matter for Reading Contribution Policy, but adjacency does not move authority. Reading Contribution Policy should be compared with Understanding Contribution Refusal, Understanding Pull Request Boundaries, Reading Issue Template Boundaries only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the failure reading part of Reading Contribution Policy should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-contribution-policy-working-tree',
        title: 'Contribution Policy Working Tree',
        body: [
          'Reading Contribution Policy should not use facade boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for working tree: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Working Tree.',
          'The public boundary for Reading Contribution Policy is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the working tree part of Reading Contribution Policy should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-contribution-policy-related-developer',
        title: 'Contribution Policy Related Developer',
        body: [
          'The policy controls repository communication. It does not restrict ordinary application use beyond the license and applicable third-party rights. Reading Contribution Policy uses the fact as schema or store evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Schema or Store. In Reading Contribution Policy, related developer is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Related Developer.',
          'An operator reading Reading Contribution Policy should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'Reading Contribution Policy should not use related developer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-contribution-policy-public-limit',
        title: 'Contribution Policy Public Limit',
        body: [
          'Visible feedback for Reading Contribution Policy should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Public Policy Files. That reading gives Reading Contribution Policy a public anchor for public limit without adding behavior that the current category does not own. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Public Limit.',
          'Implementation limits for Reading Contribution Policy keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Reading Contribution Policy public limit is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Public Policy Files.',
        ],
      },
      {
        id: 'reading-contribution-policy-technical-summary',
        title: 'Contribution Policy Technical Summary',
        body: [
          'The policy allows narrow public communication through reproducible non-security problem reports, limited questions, and security contact requests. In Reading Contribution Policy, technical summary is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Technical Summary.',
          'The summary value of Reading Contribution Policy is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for technical summary does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Contribution Policy should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-contribution-policy-closing-check',
        title: 'Contribution Policy Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Contribution Policy. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. Reading Contribution Policy uses the fact as closing check evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Contribution Policy / Repository Policy / Public Policy Files / Closing Check.',
          'A final check for Reading Contribution Policy should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Reading Contribution Policy crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Understanding Contribution Refusal', 'Understanding Pull Request Boundaries', 'Reading Issue Template Boundaries'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Public Policy Files',
    title: 'Reading Security Policy',
    description:
      'Explains the scope and disclosure rules in the security policy. This page treats AI policy and search behavior as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-security-policy-source-scope',
        title: 'Security Policy Source Scope',
        body: [
          'The security policy applies to the current repository and official distributions of Ludoxel. It does not authorize testing unrelated systems or private data. In Reading Security Policy, source scope is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Source Scope. In Reading Security Policy, source scope is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Source Scope.',
          'Source Scope defines the useful size of Reading Security Policy. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion.',
          'If the available evidence for source scope does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Security Policy should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-security-policy-owning-layer',
        title: 'Security Policy Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Security Policy. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. Reading Security Policy uses the fact as owning layer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Owning Layer.',
          'A direct observation for Reading Security Policy should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'When Reading Security Policy crosses from owning layer into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-security-policy-call-path',
        title: 'Security Policy Call Path',
        body: [
          'If the available evidence for source scope does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Security Policy should be treated as an observation rather than a confirmed cause. The point matters in call path because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Call Path.',
          'Reading Security Policy separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form.',
          'The useful result of Reading Security Policy call path is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Public Policy Files.',
        ],
      },
      {
        id: 'reading-security-policy-facade-boundary',
        title: 'Security Policy Facade Boundary',
        body: [
          'Reading Security Policy should be read as interpretation for security policy within Repository Policy and Public Policy Files. Reading Security Policy uses the fact as owning layer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Owning Layer. That reading gives Reading Security Policy a public anchor for facade boundary without adding behavior that the current category does not own. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Facade Boundary.',
          'Ownership in Reading Security Policy is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'If the available evidence for facade boundary does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Security Policy should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-security-policy-schema-or-store',
        title: 'Security Policy Schema or Store',
        body: [
          'A direct observation for Reading Security Policy should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. For Reading Security Policy, that fact identifies the first concrete boundary for schema or store: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Schema or Store.',
          'Visible feedback for Reading Security Policy should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Public Policy Files.',
          'When Reading Security Policy crosses from schema or store into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-security-policy-resource-root',
        title: 'Security Policy Resource Root',
        body: [
          'When Reading Security Policy crosses from owning layer into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. In Reading Security Policy, resource root is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Resource Root.',
          'When Reading Security Policy touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading Security Policy should not use resource root to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-security-policy-tool-command',
        title: 'Security Policy Tool Command',
        body: [
          'Suspected vulnerabilities should use private reporting channels when available. Public contact requests must not include vulnerability details. In Reading Security Policy, tool command is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Tool Command.',
          'The surrounding context for Reading Security Policy decides which adjacent topic is relevant. Reading Security Policy should be compared with Understanding Private Security Reporting, Requesting a Private Security Channel, Avoiding Public Exploit Details only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Reading Security Policy should not use tool command to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-security-policy-format-or-build',
        title: 'Security Policy Format or Build',
        body: [
          'Reading Security Policy separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form. Reading Security Policy uses the fact as format or build evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Format or Build.',
          'Recovery or follow-up for Reading Security Policy should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Reading Security Policy crosses from format or build into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-security-policy-policy-file',
        title: 'Security Policy Policy File',
        body: [
          'The useful result of Reading Security Policy call path is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Public Policy Files. For Reading Security Policy, that fact identifies the first concrete boundary for policy file: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Policy File.',
          'The main confusion risk in Reading Security Policy is treating learning files as general user content. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Reading Security Policy crosses from policy file into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-security-policy-authorization',
        title: 'Security Policy Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. In Reading Security Policy, authorization is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Authorization.',
          'Reportable evidence for Reading Security Policy should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for authorization does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Security Policy should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-security-policy-failure-reading',
        title: 'Security Policy Failure Reading',
        body: [
          'Ownership in Reading Security Policy is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. For Reading Security Policy, that fact identifies the first concrete boundary for failure reading: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Failure Reading.',
          'Adjacent pages matter for Reading Security Policy, but adjacency does not move authority. Reading Security Policy should be compared with Understanding Private Security Reporting, Requesting a Private Security Channel, Avoiding Public Exploit Details only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Reading Security Policy crosses from failure reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-security-policy-working-tree',
        title: 'Security Policy Working Tree',
        body: [
          'If the available evidence for facade boundary does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Reading Security Policy should be treated as an observation rather than a confirmed cause. Reading Security Policy uses the fact as working tree evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Working Tree.',
          'The public boundary for Reading Security Policy is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use working tree to keep Reading Security Policy tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-security-policy-related-developer',
        title: 'Security Policy Related Developer',
        body: [
          'Security testing must be lawful, non-destructive, good-faith, and limited to systems, accounts, files, and data the reporter is authorized to test. In Reading Security Policy, related developer is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Related Developer.',
          'An operator reading Reading Security Policy should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'Reading Security Policy should not use related developer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-security-policy-public-limit',
        title: 'Security Policy Public Limit',
        body: [
          'Visible feedback for Reading Security Policy should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Public Policy Files. The point matters in public limit because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Public Limit.',
          'Implementation limits for Reading Security Policy keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Reading Security Policy should not use public limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-security-policy-technical-summary',
        title: 'Security Policy Technical Summary',
        body: [
          'The security policy applies to the current repository and official distributions of Ludoxel. It does not authorize testing unrelated systems or private data. In Reading Security Policy, source scope is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Source Scope. That reading gives Reading Security Policy a public anchor for technical summary without adding behavior that the current category does not own. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Technical Summary.',
          'The summary value of Reading Security Policy is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Reading Security Policy technical summary is a bounded explanation of AI policy and search behavior: enough detail to act, and enough restraint to avoid claims outside Public Policy Files.',
        ],
      },
      {
        id: 'reading-security-policy-closing-check',
        title: 'Security Policy Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Security Policy. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Security Policy / Repository Policy / Public Policy Files / Closing Check.',
          'A final check for Reading Security Policy should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Reading Security Policy tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Understanding Private Security Reporting', 'Requesting a Private Security Channel', 'Avoiding Public Exploit Details'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Issue and Commit Operations',
    title: 'Reading Issue Template Boundaries',
    description:
      'Explains the different public issue templates and their content limits. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-issue-template-boundaries-source-scope',
        title: 'Issue Template Boundaries Source Scope',
        body: [
          'The problem report template is for reproducible, non-security problems and asks for summary, reproduction steps, expected behavior, actual behavior, and optional environment details. The fact also tells the reader which evidence to preserve for source scope: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Source Scope.',
          'Source Scope defines the useful size of Reading Issue Template Boundaries. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'A public report based on the source scope part of Reading Issue Template Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-owning-layer',
        title: 'Issue Template Boundaries Owning Layer',
        body: [
          'Source Scope defines the useful size of Reading Issue Template Boundaries. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. In Reading Issue Template Boundaries, owning layer is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Owning Layer.',
          'A direct observation for Reading Issue Template Boundaries should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'Reading Issue Template Boundaries should not use owning layer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-call-path',
        title: 'Issue Template Boundaries Call Path',
        body: [
          'A public report based on the source scope part of Reading Issue Template Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for call path: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Call Path.',
          'Reading Issue Template Boundaries separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'A public report based on the call path part of Reading Issue Template Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-facade-boundary',
        title: 'Issue Template Boundaries Facade Boundary',
        body: [
          'Reading Issue Template Boundaries should be read as interpretation for issue template boundaries within Repository Policy and Issue and Commit Operations. In Reading Issue Template Boundaries, owning layer is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Owning Layer. For Reading Issue Template Boundaries, that fact identifies the first concrete boundary for facade boundary: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Facade Boundary.',
          'Ownership in Reading Issue Template Boundaries is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'When Reading Issue Template Boundaries crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-schema-or-store',
        title: 'Issue Template Boundaries Schema or Store',
        body: [
          'A direct observation for Reading Issue Template Boundaries should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. The point matters in schema or store because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Schema or Store.',
          'Visible feedback for Reading Issue Template Boundaries should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Issue and Commit Operations.',
          'The useful result of Reading Issue Template Boundaries schema or store is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-resource-root',
        title: 'Issue Template Boundaries Resource Root',
        body: [
          'Reading Issue Template Boundaries should not use owning layer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. Reading Issue Template Boundaries uses the fact as resource root evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Resource Root.',
          'When Reading Issue Template Boundaries touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use resource root to keep Reading Issue Template Boundaries tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-tool-command',
        title: 'Issue Template Boundaries Tool Command',
        body: [
          'The limited question template is for policy, license, third-party material, ordinary use, packaging status, or security reporting policy questions. For Reading Issue Template Boundaries, that fact identifies the first concrete boundary for tool command: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Tool Command.',
          'The surrounding context for Reading Issue Template Boundaries decides which adjacent topic is relevant. Reading Issue Template Boundaries should be compared with Writing a Problem Report, Asking a Limited Question, Requesting a Private Security Channel only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the tool command part of Reading Issue Template Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-format-or-build',
        title: 'Issue Template Boundaries Format or Build',
        body: [
          'Reading Issue Template Boundaries separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. The point matters in format or build because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Format or Build.',
          'Recovery or follow-up for Reading Issue Template Boundaries should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Reading Issue Template Boundaries should not use format or build to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-policy-file',
        title: 'Issue Template Boundaries Policy File',
        body: [
          'A public report based on the call path part of Reading Issue Template Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Reading Issue Template Boundaries, policy file is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Policy File.',
          'The main confusion risk in Reading Issue Template Boundaries is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Reading Issue Template Boundaries should not use policy file to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-authorization',
        title: 'Issue Template Boundaries Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. Reading Issue Template Boundaries uses the fact as authorization evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Authorization.',
          'Reportable evidence for Reading Issue Template Boundaries should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Reading Issue Template Boundaries crosses from authorization into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-failure-reading',
        title: 'Issue Template Boundaries Failure Reading',
        body: [
          'Ownership in Reading Issue Template Boundaries is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The point matters in failure reading because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Failure Reading.',
          'Adjacent pages matter for Reading Issue Template Boundaries, but adjacency does not move authority. Reading Issue Template Boundaries should be compared with Writing a Problem Report, Asking a Limited Question, Requesting a Private Security Channel only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Reading Issue Template Boundaries failure reading is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-working-tree',
        title: 'Issue Template Boundaries Working Tree',
        body: [
          'When Reading Issue Template Boundaries crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Reading Issue Template Boundaries a public anchor for working tree without adding behavior that the current category does not own. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Working Tree.',
          'The public boundary for Reading Issue Template Boundaries is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Reading Issue Template Boundaries working tree is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-related-developer',
        title: 'Issue Template Boundaries Related Developer',
        body: [
          'The security contact template is only for requesting a private channel without disclosing vulnerability details in public. For Reading Issue Template Boundaries, that fact identifies the first concrete boundary for related developer: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Related Developer.',
          'An operator reading Reading Issue Template Boundaries should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'When Reading Issue Template Boundaries crosses from related developer into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-public-limit',
        title: 'Issue Template Boundaries Public Limit',
        body: [
          'Visible feedback for Reading Issue Template Boundaries should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Issue and Commit Operations. The fact also tells the reader which evidence to preserve for public limit: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Public Limit.',
          'Implementation limits for Reading Issue Template Boundaries keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the public limit part of Reading Issue Template Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-technical-summary',
        title: 'Issue Template Boundaries Technical Summary',
        body: [
          'The problem report template is for reproducible, non-security problems and asks for summary, reproduction steps, expected behavior, actual behavior, and optional environment details. The fact also tells the reader which evidence to preserve for technical summary: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Technical Summary.',
          'The summary value of Reading Issue Template Boundaries is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use technical summary to keep Reading Issue Template Boundaries tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-issue-template-boundaries-closing-check',
        title: 'Issue Template Boundaries Closing Check',
        body: [
          'Source Scope defines the useful size of Reading Issue Template Boundaries. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. That reading gives Reading Issue Template Boundaries a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Reading Issue Template Boundaries / Repository Policy / Issue and Commit Operations / Closing Check.',
          'A final check for Reading Issue Template Boundaries should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Reading Issue Template Boundaries closing check is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
    ],
    relatedTitles: ['Writing a Problem Report', 'Asking a Limited Question', 'Requesting a Private Security Channel'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Issue and Commit Operations',
    title: 'Writing Commit Messages After Authorized Changes',
    description:
      'Explains how commit messages should be written after permitted local edits. This page treats developer inspection as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'writing-commit-messages-after-authorized-changes-source-scope',
        title: 'Commit Messages After Authorized Changes Source Scope',
        body: [
          'A commit message should describe the actual local diff after authorized changes exist. It should not describe planned work as if it has already landed. The fact also tells the reader which evidence to preserve for source scope: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Source Scope.',
          'Source Scope defines the useful size of Writing Commit Messages After Authorized Changes. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion.',
          'Use source scope to keep Writing Commit Messages After Authorized Changes tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-owning-layer',
        title: 'Commit Messages After Authorized Changes Owning Layer',
        body: [
          'Source Scope defines the useful size of Writing Commit Messages After Authorized Changes. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. The point matters in owning layer because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Owning Layer.',
          'A direct observation for Writing Commit Messages After Authorized Changes should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'Writing Commit Messages After Authorized Changes should not use owning layer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-call-path',
        title: 'Commit Messages After Authorized Changes Call Path',
        body: [
          'Use source scope to keep Writing Commit Messages After Authorized Changes tied to Repository Policy; use a related page only when the reader needs a different owner. Writing Commit Messages After Authorized Changes uses the fact as call path evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Call Path.',
          'Writing Commit Messages After Authorized Changes separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form.',
          'When Writing Commit Messages After Authorized Changes crosses from call path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-facade-boundary',
        title: 'Commit Messages After Authorized Changes Facade Boundary',
        body: [
          'Writing Commit Messages After Authorized Changes should be read as report writing for commit messages after authorized changes within Repository Policy and Issue and Commit Operations. Writing Commit Messages After Authorized Changes uses the fact as facade boundary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Facade Boundary.',
          'Ownership in Writing Commit Messages After Authorized Changes is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'When Writing Commit Messages After Authorized Changes crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-schema-or-store',
        title: 'Commit Messages After Authorized Changes Schema or Store',
        body: [
          'A direct observation for Writing Commit Messages After Authorized Changes should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. In Writing Commit Messages After Authorized Changes, schema or store is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Schema or Store.',
          'Visible feedback for Writing Commit Messages After Authorized Changes should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Issue and Commit Operations.',
          'If the available evidence for schema or store does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Writing Commit Messages After Authorized Changes should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-resource-root',
        title: 'Commit Messages After Authorized Changes Resource Root',
        body: [
          'Writing Commit Messages After Authorized Changes should not use owning layer to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Writing Commit Messages After Authorized Changes, that fact identifies the first concrete boundary for resource root: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Resource Root.',
          'When Writing Commit Messages After Authorized Changes touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the resource root part of Writing Commit Messages After Authorized Changes should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-tool-command',
        title: 'Commit Messages After Authorized Changes Tool Command',
        body: [
          'The body should mention meaningful checks that were actually run and any important checks that were blocked or out of scope. Avoid claiming broad verification from a narrow command. Writing Commit Messages After Authorized Changes uses the fact as call path evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Call Path. The fact also tells the reader which evidence to preserve for tool command: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Tool Command.',
          'The surrounding context for Writing Commit Messages After Authorized Changes decides which adjacent topic is relevant. Writing Commit Messages After Authorized Changes should be compared with Avoiding Unauthorized Repository Operations, Reading Issue Template Boundaries, Running Project Checks with Permission only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the tool command part of Writing Commit Messages After Authorized Changes should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-format-or-build',
        title: 'Commit Messages After Authorized Changes Format or Build',
        body: [
          'Writing Commit Messages After Authorized Changes separates the surface that accepts input from the component or document that controls the result. This is especially important when reading source ownership and authorized commands crosses a saved value, a renderer output, or a public form. The point matters in format or build because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Format or Build.',
          'Recovery or follow-up for Writing Commit Messages After Authorized Changes should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'The useful result of Writing Commit Messages After Authorized Changes format or build is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-policy-file',
        title: 'Commit Messages After Authorized Changes Policy File',
        body: [
          'When Writing Commit Messages After Authorized Changes crosses from call path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The point matters in policy file because reading source ownership and authorized commands can otherwise be mistaken for turning local inspection into an invitation for external changes. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Policy File.',
          'The main confusion risk in Writing Commit Messages After Authorized Changes is turning local inspection into an invitation for external changes. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Writing Commit Messages After Authorized Changes should not use policy file to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-authorization',
        title: 'Commit Messages After Authorized Changes Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. Writing Commit Messages After Authorized Changes uses the fact as facade boundary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Facade Boundary. The fact also tells the reader which evidence to preserve for authorization: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Authorization.',
          'Reportable evidence for Writing Commit Messages After Authorized Changes should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the authorization part of Writing Commit Messages After Authorized Changes should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-failure-reading',
        title: 'Commit Messages After Authorized Changes Failure Reading',
        body: [
          'Ownership in Writing Commit Messages After Authorized Changes is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. That reading gives Writing Commit Messages After Authorized Changes a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Failure Reading.',
          'Adjacent pages matter for Writing Commit Messages After Authorized Changes, but adjacency does not move authority. Writing Commit Messages After Authorized Changes should be compared with Avoiding Unauthorized Repository Operations, Reading Issue Template Boundaries, Running Project Checks with Permission only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Writing Commit Messages After Authorized Changes failure reading is a bounded explanation of developer inspection: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-working-tree',
        title: 'Commit Messages After Authorized Changes Working Tree',
        body: [
          'When Writing Commit Messages After Authorized Changes crosses from facade boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. In Writing Commit Messages After Authorized Changes, working tree is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Working Tree.',
          'The public boundary for Writing Commit Messages After Authorized Changes is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Writing Commit Messages After Authorized Changes should not use working tree to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-related-developer',
        title: 'Commit Messages After Authorized Changes Related Developer',
        body: [
          'Writing a commit message is separate from committing, pushing, releasing, or opening public pull requests. Those operations need their own authorization. In Writing Commit Messages After Authorized Changes, schema or store is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Schema or Store. The fact also tells the reader which evidence to preserve for related developer: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Related Developer.',
          'An operator reading Writing Commit Messages After Authorized Changes should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'Use related developer to keep Writing Commit Messages After Authorized Changes tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-public-limit',
        title: 'Commit Messages After Authorized Changes Public Limit',
        body: [
          'Visible feedback for Writing Commit Messages After Authorized Changes should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Issue and Commit Operations. Writing Commit Messages After Authorized Changes uses the fact as public limit evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Public Limit.',
          'Implementation limits for Writing Commit Messages After Authorized Changes keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Writing Commit Messages After Authorized Changes crosses from public limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-technical-summary',
        title: 'Commit Messages After Authorized Changes Technical Summary',
        body: [
          'A commit message should describe the actual local diff after authorized changes exist. It should not describe planned work as if it has already landed. Writing Commit Messages After Authorized Changes uses the fact as technical summary evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Technical Summary.',
          'The summary value of Writing Commit Messages After Authorized Changes is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use technical summary to keep Writing Commit Messages After Authorized Changes tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'writing-commit-messages-after-authorized-changes-closing-check',
        title: 'Commit Messages After Authorized Changes Closing Check',
        body: [
          'Source Scope defines the useful size of Writing Commit Messages After Authorized Changes. The article should be broad enough to explain developer inspection, but narrow enough that turning local inspection into an invitation for external changes remains outside the conclusion. In Writing Commit Messages After Authorized Changes, closing check is the difference between reading developer inspection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Writing Commit Messages After Authorized Changes / Repository Policy / Issue and Commit Operations / Closing Check.',
          'A final check for Writing Commit Messages After Authorized Changes should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Writing Commit Messages After Authorized Changes should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Avoiding Unauthorized Repository Operations', 'Reading Issue Template Boundaries', 'Running Project Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Issue and Commit Operations',
    title: 'Avoiding Unauthorized Repository Operations',
    description:
      'Explains repository operations that require explicit authorization or careful scope. This page treats hazard handling as a source-and-tooling guide for readers inspecting confirmed repository structure and authorized local operations, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'avoiding-unauthorized-repository-operations-source-scope',
        title: 'Unauthorized Repository Operations Source Scope',
        body: [
          'Committing, pushing, releasing, deleting generated output, running broad builds, changing policy files, or modifying unrelated paths should be done only when authorized for the task. Avoiding Unauthorized Repository Operations uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Source Scope. Avoiding Unauthorized Repository Operations uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Source Scope.',
          'Source Scope defines the useful size of Avoiding Unauthorized Repository Operations. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion.',
          'When Avoiding Unauthorized Repository Operations crosses from source scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-owning-layer',
        title: 'Unauthorized Repository Operations Owning Layer',
        body: [
          'Source Scope defines the useful size of Avoiding Unauthorized Repository Operations. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. In Avoiding Unauthorized Repository Operations, owning layer is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Owning Layer.',
          'A direct observation for Avoiding Unauthorized Repository Operations should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state.',
          'If the available evidence for owning layer does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Avoiding Unauthorized Repository Operations should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-call-path',
        title: 'Unauthorized Repository Operations Call Path',
        body: [
          'When Avoiding Unauthorized Repository Operations crosses from source scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Avoiding Unauthorized Repository Operations, that fact identifies the first concrete boundary for call path: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Call Path.',
          'Avoiding Unauthorized Repository Operations separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form.',
          'A public report based on the call path part of Avoiding Unauthorized Repository Operations should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-facade-boundary',
        title: 'Unauthorized Repository Operations Facade Boundary',
        body: [
          'Avoiding Unauthorized Repository Operations should be read as risk avoidance for unauthorized repository operations within Repository Policy and Issue and Commit Operations. In Avoiding Unauthorized Repository Operations, owning layer is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Owning Layer. The fact also tells the reader which evidence to preserve for facade boundary: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Facade Boundary.',
          'Ownership in Avoiding Unauthorized Repository Operations is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article.',
          'Use facade boundary to keep Avoiding Unauthorized Repository Operations tied to Repository Policy; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-schema-or-store',
        title: 'Unauthorized Repository Operations Schema or Store',
        body: [
          'A direct observation for Avoiding Unauthorized Repository Operations should name what the user or reader actually sees before it assigns cause. That keeps real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope ahead of guesses about hidden state. In Avoiding Unauthorized Repository Operations, schema or store is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Schema or Store.',
          'Visible feedback for Avoiding Unauthorized Repository Operations should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Issue and Commit Operations.',
          'If the available evidence for schema or store does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Avoiding Unauthorized Repository Operations should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-resource-root',
        title: 'Unauthorized Repository Operations Resource Root',
        body: [
          'If the available evidence for owning layer does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Avoiding Unauthorized Repository Operations should be treated as an observation rather than a confirmed cause. Avoiding Unauthorized Repository Operations uses the fact as resource root evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Resource Root.',
          'When Avoiding Unauthorized Repository Operations touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Avoiding Unauthorized Repository Operations crosses from resource root into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-tool-command',
        title: 'Unauthorized Repository Operations Tool Command',
        body: [
          'A dirty working tree can contain user changes. Inspect diffs before editing shared files, and do not revert unrelated changes to make a local result look clean. For Avoiding Unauthorized Repository Operations, that fact identifies the first concrete boundary for tool command: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Tool Command.',
          'The surrounding context for Avoiding Unauthorized Repository Operations decides which adjacent topic is relevant. Avoiding Unauthorized Repository Operations should be compared with Writing Commit Messages After Authorized Changes, Running Desktop Builds with Permission, Avoiding Unofficial Release Claims only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Avoiding Unauthorized Repository Operations crosses from tool command into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-format-or-build',
        title: 'Unauthorized Repository Operations Format or Build',
        body: [
          'Avoiding Unauthorized Repository Operations separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form. That reading gives Avoiding Unauthorized Repository Operations a public anchor for format or build without adding behavior that the current category does not own. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Format or Build.',
          'Recovery or follow-up for Avoiding Unauthorized Repository Operations should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for format or build does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Avoiding Unauthorized Repository Operations should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-policy-file',
        title: 'Unauthorized Repository Operations Policy File',
        body: [
          'A public report based on the call path part of Avoiding Unauthorized Repository Operations should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Avoiding Unauthorized Repository Operations a public anchor for policy file without adding behavior that the current category does not own. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Policy File.',
          'The main confusion risk in Avoiding Unauthorized Repository Operations is hiding gameplay state behind a generic crash report. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Avoiding Unauthorized Repository Operations policy file is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-authorization',
        title: 'Unauthorized Repository Operations Authorization',
        body: [
          'The relevant state is constrained by the article category: Developer treats this topic as public source-structure and authorized-operation behavior. The fact also tells the reader which evidence to preserve for authorization: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Authorization.',
          'Reportable evidence for Avoiding Unauthorized Repository Operations should be small, concrete, and public. real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the authorization part of Avoiding Unauthorized Repository Operations should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-failure-reading',
        title: 'Unauthorized Repository Operations Failure Reading',
        body: [
          'Ownership in Avoiding Unauthorized Repository Operations is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. In Avoiding Unauthorized Repository Operations, failure reading is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Failure Reading.',
          'Adjacent pages matter for Avoiding Unauthorized Repository Operations, but adjacency does not move authority. Avoiding Unauthorized Repository Operations should be compared with Writing Commit Messages After Authorized Changes, Running Desktop Builds with Permission, Avoiding Unofficial Release Claims only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for failure reading does not identify the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article, Avoiding Unauthorized Repository Operations should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-working-tree',
        title: 'Unauthorized Repository Operations Working Tree',
        body: [
          'Use facade boundary to keep Avoiding Unauthorized Repository Operations tied to Repository Policy; use a related page only when the reader needs a different owner. The point matters in working tree because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Working Tree.',
          'The public boundary for Avoiding Unauthorized Repository Operations is part of the article, not an afterthought. It does not invite external contribution, owner-only operation, unverified checks, or source changes outside the authorized scope. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Avoiding Unauthorized Repository Operations working tree is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-related-developer',
        title: 'Unauthorized Repository Operations Related Developer',
        body: [
          'When an operation is skipped, blocked, or not requested, state that plainly. Do not imply that repository state changed when it did not. In Avoiding Unauthorized Repository Operations, schema or store is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Schema or Store. Avoiding Unauthorized Repository Operations uses the fact as related developer evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Related Developer.',
          'An operator reading Avoiding Unauthorized Repository Operations should follow developer reading starts with confirmed files and commands, then separates ownership, call path, package behavior, and repository policy. That order prevents a visible result from being treated as the first source of truth.',
          'When Avoiding Unauthorized Repository Operations crosses from related developer into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-public-limit',
        title: 'Unauthorized Repository Operations Public Limit',
        body: [
          'Visible feedback for Avoiding Unauthorized Repository Operations should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Developer / Repository Policy / Issue and Commit Operations. For Avoiding Unauthorized Repository Operations, that fact identifies the first concrete boundary for public limit: the source layers, package facades, schema modules, store modules, resource roots, package metadata, tooling scripts, and public policy files named by the article. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Public Limit.',
          'Implementation limits for Avoiding Unauthorized Repository Operations keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the public limit part of Avoiding Unauthorized Repository Operations should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-technical-summary',
        title: 'Unauthorized Repository Operations Technical Summary',
        body: [
          'Committing, pushing, releasing, deleting generated output, running broad builds, changing policy files, or modifying unrelated paths should be done only when authorized for the task. Avoiding Unauthorized Repository Operations uses the fact as source scope evidence, then keeps the explanation inside Developer rather than turning it into a project-wide claim. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Source Scope. The fact also tells the reader which evidence to preserve for technical summary: real file paths, actual command names, observed command output, confirmed schema ownership, resource-root behavior, and working-tree scope. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Technical Summary.',
          'The summary value of Avoiding Unauthorized Repository Operations is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the technical summary part of Avoiding Unauthorized Repository Operations should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-unauthorized-repository-operations-closing-check',
        title: 'Unauthorized Repository Operations Closing Check',
        body: [
          'Source Scope defines the useful size of Avoiding Unauthorized Repository Operations. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. The point matters in closing check because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Unauthorized Repository Operations / Repository Policy / Issue and Commit Operations / Closing Check.',
          'A final check for Avoiding Unauthorized Repository Operations should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Avoiding Unauthorized Repository Operations closing check is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Issue and Commit Operations.',
        ],
      },
    ],
    relatedTitles: ['Writing Commit Messages After Authorized Changes', 'Running Desktop Builds with Permission', 'Avoiding Unofficial Release Claims'],
  }),
];
