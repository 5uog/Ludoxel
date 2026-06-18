/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const gameplayPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Block Construction',
    title: 'Building in My World',
    description:
      'Explains how block placement and breaking are accepted in My World. This page treats play-space selection as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'building-in-my-world-rule-scope',
        title: 'in My World Rule Scope',
        body: [
          'Building starts with the selected hotbar item and the current pick target. Placement uses the hit face and adjacent cell, while breaking removes the targeted block when the interaction rules allow it. The point matters in rule scope because changing the active game context can otherwise be mistaken for merging My World and Othello state. The local reading frame is Building in My World / My World Building / Block Construction / Rule Scope.',
          'Rule Scope defines the useful size of Building in My World. The article should be broad enough to explain play-space selection, but narrow enough that merging My World and Othello state remains outside the conclusion.',
          'Building in My World should not use rule scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'building-in-my-world-attempted-action',
        title: 'in My World Attempted Action',
        body: [
          'Rule Scope defines the useful size of Building in My World. The article should be broad enough to explain play-space selection, but narrow enough that merging My World and Othello state remains outside the conclusion. Building in My World uses the fact as attempted action evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Building in My World / My World Building / Block Construction / Attempted Action.',
          'A direct observation for Building in My World should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'Use attempted action to keep Building in My World tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'building-in-my-world-accepted-state',
        title: 'in My World Accepted State',
        body: [
          'Building in My World should not use rule scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in accepted state because changing the active game context can otherwise be mistaken for merging My World and Othello state. The local reading frame is Building in My World / My World Building / Block Construction / Accepted State.',
          'Building in My World separates the surface that accepts input from the component or document that controls the result. This is especially important when changing the active game context crosses a saved value, a renderer output, or a public form.',
          'The useful result of Building in My World accepted state is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
      {
        id: 'building-in-my-world-rejection-state',
        title: 'in My World Rejection State',
        body: [
          'Building in My World should be read as topic for building in my world within My World Building and Block Construction. Building in My World uses the fact as attempted action evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Building in My World / My World Building / Block Construction / Attempted Action. The fact also tells the reader which evidence to preserve for rejection state: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Building in My World / My World Building / Block Construction / Rejection State.',
          'Ownership in Building in My World is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'Use rejection state to keep Building in My World tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'building-in-my-world-actor-or-board-owner',
        title: 'in My World Actor or Board Owner',
        body: [
          'A direct observation for Building in My World should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for actor or board owner: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Building in My World / My World Building / Block Construction / Actor or Board Owner.',
          'Visible feedback for Building in My World should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / My World Building / Block Construction.',
          'A public report based on the actor or board owner part of Building in My World should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'building-in-my-world-world-context',
        title: 'in My World World Context',
        body: [
          'Use attempted action to keep Building in My World tied to My World Building; use a related page only when the reader needs a different owner. The point matters in world context because changing the active game context can otherwise be mistaken for merging My World and Othello state. The local reading frame is Building in My World / My World Building / Block Construction / World Context.',
          'When Building in My World touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Building in My World world context is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
      {
        id: 'building-in-my-world-feedback-channel',
        title: 'in My World Feedback Channel',
        body: [
          'Slabs, stairs, fences, fence gates, walls, and full blocks do not all behave like full cubes. Placement checks shape state, support, merge rules, and player clearance before changing the world. The point matters in feedback channel because changing the active game context can otherwise be mistaken for merging My World and Othello state. The local reading frame is Building in My World / My World Building / Block Construction / Feedback Channel.',
          'The surrounding context for Building in My World decides which adjacent topic is relevant. Building in My World should be compared with Understanding Block Shapes, Reading Placement Rejection, Reading Saved World State only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Building in My World feedback channel is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
      {
        id: 'building-in-my-world-edge-case',
        title: 'in My World Edge Case',
        body: [
          'Building in My World separates the surface that accepts input from the component or document that controls the result. This is especially important when changing the active game context crosses a saved value, a renderer output, or a public form. The point matters in edge case because changing the active game context can otherwise be mistaken for merging My World and Othello state. The local reading frame is Building in My World / My World Building / Block Construction / Edge Case.',
          'Recovery or follow-up for Building in My World should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Building in My World should not use edge case to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'building-in-my-world-save-interaction',
        title: 'in My World Save Interaction',
        body: [
          'The useful result of Building in My World accepted state is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Block Construction. Building in My World uses the fact as save interaction evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Building in My World / My World Building / Block Construction / Save Interaction.',
          'The main confusion risk in Building in My World is merging My World and Othello state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Building in My World crosses from save interaction into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'building-in-my-world-debug-evidence',
        title: 'in My World Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. The fact also tells the reader which evidence to preserve for debug evidence: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Building in My World / My World Building / Block Construction / Debug Evidence.',
          'Reportable evidence for Building in My World should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use debug evidence to keep Building in My World tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'building-in-my-world-cross-category-limit',
        title: 'in My World Cross-Category Limit',
        body: [
          'Ownership in Building in My World is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The point matters in cross-category limit because changing the active game context can otherwise be mistaken for merging My World and Othello state. The local reading frame is Building in My World / My World Building / Block Construction / Cross-Category Limit.',
          'Adjacent pages matter for Building in My World, but adjacency does not move authority. Building in My World should be compared with Understanding Block Shapes, Reading Placement Rejection, Reading Saved World State only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Building in My World cross-category limit is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
      {
        id: 'building-in-my-world-related-play',
        title: 'in My World Related Play',
        body: [
          'Use rejection state to keep Building in My World tied to My World Building; use a related page only when the reader needs a different owner. That reading gives Building in My World a public anchor for related play without adding behavior that the current category does not own. The local reading frame is Building in My World / My World Building / Block Construction / Related Play.',
          'The public boundary for Building in My World is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Building in My World related play is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
      {
        id: 'building-in-my-world-failure-reading',
        title: 'in My World Failure Reading',
        body: [
          'Accepted edits update the WorldState revision and mark affected chunks dirty. The renderer then receives new chunk data from the session pipeline rather than editing world geometry by itself. In Building in My World, failure reading is the difference between reading play-space selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Building in My World / My World Building / Block Construction / Failure Reading.',
          'An operator reading Building in My World should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for failure reading does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Building in My World should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'building-in-my-world-public-reporting',
        title: 'in My World Public Reporting',
        body: [
          'Visible feedback for Building in My World should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / My World Building / Block Construction. That reading gives Building in My World a public anchor for public reporting without adding behavior that the current category does not own. The local reading frame is Building in My World / My World Building / Block Construction / Public Reporting.',
          'Implementation limits for Building in My World keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for public reporting does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Building in My World should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'building-in-my-world-rule-preservation',
        title: 'in My World Rule Preservation',
        body: [
          'Building starts with the selected hotbar item and the current pick target. Placement uses the hit face and adjacent cell, while breaking removes the targeted block when the interaction rules allow it. In Building in My World, rule preservation is the difference between reading play-space selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Building in My World / My World Building / Block Construction / Rule Preservation.',
          'The summary value of Building in My World is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for rule preservation does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Building in My World should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'building-in-my-world-closing-check',
        title: 'in My World Closing Check',
        body: [
          'Rule Scope defines the useful size of Building in My World. The article should be broad enough to explain play-space selection, but narrow enough that merging My World and Othello state remains outside the conclusion. That reading gives Building in My World a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Building in My World / My World Building / Block Construction / Closing Check.',
          'A final check for Building in My World should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Building in My World should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Understanding Block Shapes', 'Reading Placement Rejection', 'Reading Saved World State'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Block Construction',
    title: 'Understanding Block Shapes',
    description:
      'Describes how non-cube block models affect collision, placement, and outlines. This page treats block construction as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-block-shapes-rule-scope',
        title: 'Block Shapes Rule Scope',
        body: [
          'A block definition can expose model-specific collision and visual shape data. Full blocks, slabs, stairs, fences, fence gates, and walls each contribute different geometry to interaction and rendering. That reading gives Understanding Block Shapes a public anchor for rule scope without adding behavior that the current category does not own. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Rule Scope.',
          'Rule Scope defines the useful size of Understanding Block Shapes. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion.',
          'The useful result of Understanding Block Shapes rule scope is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
      {
        id: 'understanding-block-shapes-attempted-action',
        title: 'Block Shapes Attempted Action',
        body: [
          'Rule Scope defines the useful size of Understanding Block Shapes. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion. For Understanding Block Shapes, that fact identifies the first concrete boundary for attempted action: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Attempted Action.',
          'A direct observation for Understanding Block Shapes should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'When Understanding Block Shapes crosses from attempted action into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-block-shapes-accepted-state',
        title: 'Block Shapes Accepted State',
        body: [
          'The useful result of Understanding Block Shapes rule scope is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Block Construction. In Understanding Block Shapes, accepted state is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Accepted State.',
          'Understanding Block Shapes separates the surface that accepts input from the component or document that controls the result. This is especially important when placing or interpreting world blocks crosses a saved value, a renderer output, or a public form.',
          'Understanding Block Shapes should not use accepted state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-block-shapes-rejection-state',
        title: 'Block Shapes Rejection State',
        body: [
          'Understanding Block Shapes should be read as conceptual boundary for block shapes within My World Building and Block Construction. The fact also tells the reader which evidence to preserve for rejection state: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Rejection State.',
          'Ownership in Understanding Block Shapes is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'Use rejection state to keep Understanding Block Shapes tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-block-shapes-actor-or-board-owner',
        title: 'Block Shapes Actor or Board Owner',
        body: [
          'A direct observation for Understanding Block Shapes should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. Understanding Block Shapes uses the fact as actor or board owner evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Actor or Board Owner.',
          'Visible feedback for Understanding Block Shapes should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / My World Building / Block Construction.',
          'Use actor or board owner to keep Understanding Block Shapes tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-block-shapes-world-context',
        title: 'Block Shapes World Context',
        body: [
          'When Understanding Block Shapes crosses from attempted action into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Understanding Block Shapes a public anchor for world context without adding behavior that the current category does not own. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / World Context.',
          'When Understanding Block Shapes touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for world context does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding Block Shapes should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-block-shapes-feedback-channel',
        title: 'Block Shapes Feedback Channel',
        body: [
          'Collision, support, placement, picking, and interaction read the block state and model shape. A stair half, a slab merge, or an open fence gate can therefore change the accepted action. In Understanding Block Shapes, accepted state is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Accepted State. In Understanding Block Shapes, feedback channel is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Feedback Channel.',
          'The surrounding context for Understanding Block Shapes decides which adjacent topic is relevant. Understanding Block Shapes should be compared with Reading Placement Rejection, Understanding Selection Outlines, Building in My World only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding Block Shapes should not use feedback channel to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-block-shapes-edge-case',
        title: 'Block Shapes Edge Case',
        body: [
          'Understanding Block Shapes separates the surface that accepts input from the component or document that controls the result. This is especially important when placing or interpreting world blocks crosses a saved value, a renderer output, or a public form. That reading gives Understanding Block Shapes a public anchor for edge case without adding behavior that the current category does not own. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Edge Case.',
          'Recovery or follow-up for Understanding Block Shapes should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'The useful result of Understanding Block Shapes edge case is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
      {
        id: 'understanding-block-shapes-save-interaction',
        title: 'Block Shapes Save Interaction',
        body: [
          'Understanding Block Shapes should not use accepted state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Understanding Block Shapes, that fact identifies the first concrete boundary for save interaction: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Save Interaction.',
          'The main confusion risk in Understanding Block Shapes is treating every block shape as a full-cube collision rule. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the save interaction part of Understanding Block Shapes should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-block-shapes-debug-evidence',
        title: 'Block Shapes Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. For Understanding Block Shapes, that fact identifies the first concrete boundary for debug evidence: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Debug Evidence.',
          'Reportable evidence for Understanding Block Shapes should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the debug evidence part of Understanding Block Shapes should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-block-shapes-cross-category-limit',
        title: 'Block Shapes Cross-Category Limit',
        body: [
          'Ownership in Understanding Block Shapes is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. In Understanding Block Shapes, cross-category limit is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Cross-Category Limit.',
          'Adjacent pages matter for Understanding Block Shapes, but adjacency does not move authority. Understanding Block Shapes should be compared with Reading Placement Rejection, Understanding Selection Outlines, Building in My World only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Understanding Block Shapes should not use cross-category limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-block-shapes-related-play',
        title: 'Block Shapes Related Play',
        body: [
          'Use rejection state to keep Understanding Block Shapes tied to My World Building; use a related page only when the reader needs a different owner. The point matters in related play because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Related Play.',
          'The public boundary for Understanding Block Shapes is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Understanding Block Shapes should not use related play to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-block-shapes-failure-reading',
        title: 'Block Shapes Failure Reading',
        body: [
          'Visible faces, selection outlines, held-block previews, and chunk payloads also depend on model shape. A correct outline is evidence that the renderer received shape-aware data, not that the simulation rule was skipped. Understanding Block Shapes uses the fact as actor or board owner evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Actor or Board Owner. That reading gives Understanding Block Shapes a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Failure Reading.',
          'An operator reading Understanding Block Shapes should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Understanding Block Shapes failure reading is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
      {
        id: 'understanding-block-shapes-public-reporting',
        title: 'Block Shapes Public Reporting',
        body: [
          'Visible feedback for Understanding Block Shapes should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / My World Building / Block Construction. That reading gives Understanding Block Shapes a public anchor for public reporting without adding behavior that the current category does not own. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Public Reporting.',
          'Implementation limits for Understanding Block Shapes keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for public reporting does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding Block Shapes should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-block-shapes-rule-preservation',
        title: 'Block Shapes Rule Preservation',
        body: [
          'A block definition can expose model-specific collision and visual shape data. Full blocks, slabs, stairs, fences, fence gates, and walls each contribute different geometry to interaction and rendering. The point matters in rule preservation because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Rule Preservation.',
          'The summary value of Understanding Block Shapes is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Block Shapes should not use rule preservation to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-block-shapes-closing-check',
        title: 'Block Shapes Closing Check',
        body: [
          'Rule Scope defines the useful size of Understanding Block Shapes. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion. The point matters in closing check because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Understanding Block Shapes / My World Building / Block Construction / Closing Check.',
          'A final check for Understanding Block Shapes should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Understanding Block Shapes closing check is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Block Construction.',
        ],
      },
    ],
    relatedTitles: ['Reading Placement Rejection', 'Understanding Selection Outlines', 'Building in My World'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Placement and Hazards',
    title: 'Reading Placement Rejection',
    description:
      'Helps interpret why a requested block placement did not change the world. This page treats block construction as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-placement-rejection-rule-scope',
        title: 'Placement Rejection Rule Scope',
        body: [
          'Placement can fail because the selected item is empty, the target is missing, the block cannot be placed, the slab merge is invalid, support is insufficient, or the player would intersect the new shape. For Reading Placement Rejection, that fact identifies the first concrete boundary for rule scope: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Rule Scope.',
          'Rule Scope defines the useful size of Reading Placement Rejection. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion.',
          'A public report based on the rule scope part of Reading Placement Rejection should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-placement-rejection-attempted-action',
        title: 'Placement Rejection Attempted Action',
        body: [
          'Rule Scope defines the useful size of Reading Placement Rejection. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion. The point matters in attempted action because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Attempted Action.',
          'A direct observation for Reading Placement Rejection should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'The useful result of Reading Placement Rejection attempted action is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Placement and Hazards.',
        ],
      },
      {
        id: 'reading-placement-rejection-accepted-state',
        title: 'Placement Rejection Accepted State',
        body: [
          'A public report based on the rule scope part of Reading Placement Rejection should state the action, expected result, actual result, environment, and any redaction needed before sharing. Reading Placement Rejection uses the fact as accepted state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Accepted State.',
          'Reading Placement Rejection separates the surface that accepts input from the component or document that controls the result. This is especially important when placing or interpreting world blocks crosses a saved value, a renderer output, or a public form.',
          'Use accepted state to keep Reading Placement Rejection tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-placement-rejection-rejection-state',
        title: 'Placement Rejection Rejection State',
        body: [
          'Reading Placement Rejection should be read as interpretation for placement rejection within My World Building and Placement and Hazards. The point matters in rejection state because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Rejection State.',
          'Ownership in Reading Placement Rejection is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'The useful result of Reading Placement Rejection rejection state is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Placement and Hazards.',
        ],
      },
      {
        id: 'reading-placement-rejection-actor-or-board-owner',
        title: 'Placement Rejection Actor or Board Owner',
        body: [
          'A direct observation for Reading Placement Rejection should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. In Reading Placement Rejection, actor or board owner is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Actor or Board Owner.',
          'Visible feedback for Reading Placement Rejection should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / My World Building / Placement and Hazards.',
          'Reading Placement Rejection should not use actor or board owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-placement-rejection-world-context',
        title: 'Placement Rejection World Context',
        body: [
          'The useful result of Reading Placement Rejection attempted action is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Placement and Hazards. For Reading Placement Rejection, that fact identifies the first concrete boundary for world context: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / World Context.',
          'When Reading Placement Rejection touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the world context part of Reading Placement Rejection should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-placement-rejection-feedback-channel',
        title: 'Placement Rejection Feedback Channel',
        body: [
          'Some blocks react to interaction before placement, such as fence gates toggling open or closed. Crouching can bypass interaction and request placement instead, but the placement rules still run afterward. Reading Placement Rejection uses the fact as accepted state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Accepted State. The fact also tells the reader which evidence to preserve for feedback channel: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Feedback Channel.',
          'The surrounding context for Reading Placement Rejection decides which adjacent topic is relevant. Reading Placement Rejection should be compared with Building in My World, Understanding Block Shapes, Changing AI Behavior Values only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the feedback channel part of Reading Placement Rejection should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-placement-rejection-edge-case',
        title: 'Placement Rejection Edge Case',
        body: [
          'Reading Placement Rejection separates the surface that accepts input from the component or document that controls the result. This is especially important when placing or interpreting world blocks crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for edge case: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Edge Case.',
          'Recovery or follow-up for Reading Placement Rejection should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the edge case part of Reading Placement Rejection should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-placement-rejection-save-interaction',
        title: 'Placement Rejection Save Interaction',
        body: [
          'Use accepted state to keep Reading Placement Rejection tied to My World Building; use a related page only when the reader needs a different owner. The point matters in save interaction because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Save Interaction.',
          'The main confusion risk in Reading Placement Rejection is treating every block shape as a full-cube collision rule. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Reading Placement Rejection should not use save interaction to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-placement-rejection-debug-evidence',
        title: 'Placement Rejection Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. In Reading Placement Rejection, debug evidence is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Debug Evidence.',
          'Reportable evidence for Reading Placement Rejection should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for debug evidence does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading Placement Rejection should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-placement-rejection-cross-category-limit',
        title: 'Placement Rejection Cross-Category Limit',
        body: [
          'Ownership in Reading Placement Rejection is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The fact also tells the reader which evidence to preserve for cross-category limit: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Cross-Category Limit.',
          'Adjacent pages matter for Reading Placement Rejection, but adjacency does not move authority. Reading Placement Rejection should be compared with Building in My World, Understanding Block Shapes, Changing AI Behavior Values only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the cross-category limit part of Reading Placement Rejection should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-placement-rejection-related-play',
        title: 'Placement Rejection Related Play',
        body: [
          'The useful result of Reading Placement Rejection rejection state is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside Placement and Hazards. The fact also tells the reader which evidence to preserve for related play: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Related Play.',
          'The public boundary for Reading Placement Rejection is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use related play to keep Reading Placement Rejection tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-placement-rejection-failure-reading',
        title: 'Placement Rejection Failure Reading',
        body: [
          'For a useful report, include the block id, target face, player stance, creative or survival mode, and whether an AI or route tool was involved. Avoid attaching private save files publicly. In Reading Placement Rejection, actor or board owner is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Actor or Board Owner. Reading Placement Rejection uses the fact as failure reading evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Failure Reading.',
          'An operator reading Reading Placement Rejection should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'Use failure reading to keep Reading Placement Rejection tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-placement-rejection-public-reporting',
        title: 'Placement Rejection Public Reporting',
        body: [
          'Visible feedback for Reading Placement Rejection should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / My World Building / Placement and Hazards. The fact also tells the reader which evidence to preserve for public reporting: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Public Reporting.',
          'Implementation limits for Reading Placement Rejection keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the public reporting part of Reading Placement Rejection should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-placement-rejection-rule-preservation',
        title: 'Placement Rejection Rule Preservation',
        body: [
          'Placement can fail because the selected item is empty, the target is missing, the block cannot be placed, the slab merge is invalid, support is insufficient, or the player would intersect the new shape. Reading Placement Rejection uses the fact as rule preservation evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Rule Preservation.',
          'The summary value of Reading Placement Rejection is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use rule preservation to keep Reading Placement Rejection tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-placement-rejection-closing-check',
        title: 'Placement Rejection Closing Check',
        body: [
          'Rule Scope defines the useful size of Reading Placement Rejection. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion. Reading Placement Rejection uses the fact as closing check evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Placement Rejection / My World Building / Placement and Hazards / Closing Check.',
          'A final check for Reading Placement Rejection should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Reading Placement Rejection crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Building in My World', 'Understanding Block Shapes', 'Changing AI Behavior Values'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Placement and Hazards',
    title: 'Surviving Fall and Void Hazards',
    description:
      'Explains survival damage from falling and from dropping below the void limit. This page treats hazard handling as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'surviving-fall-and-void-hazards-rule-scope',
        title: 'Surviving Fall and Void Hazards Rule Scope',
        body: [
          'Survival movement records the distance fallen while the player is airborne. Landing beyond the safe fall distance applies damage based on the excess distance. For Surviving Fall and Void Hazards, that fact identifies the first concrete boundary for rule scope: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Rule Scope.',
          'Rule Scope defines the useful size of Surviving Fall and Void Hazards. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion.',
          'When Surviving Fall and Void Hazards crosses from rule scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-attempted-action',
        title: 'Surviving Fall and Void Hazards Attempted Action',
        body: [
          'Rule Scope defines the useful size of Surviving Fall and Void Hazards. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. That reading gives Surviving Fall and Void Hazards a public anchor for attempted action without adding behavior that the current category does not own. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Attempted Action.',
          'A direct observation for Surviving Fall and Void Hazards should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'The useful result of Surviving Fall and Void Hazards attempted action is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Placement and Hazards.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-accepted-state',
        title: 'Surviving Fall and Void Hazards Accepted State',
        body: [
          'When Surviving Fall and Void Hazards crosses from rule scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. Surviving Fall and Void Hazards uses the fact as accepted state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Accepted State.',
          'Surviving Fall and Void Hazards separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form.',
          'When Surviving Fall and Void Hazards crosses from accepted state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-rejection-state',
        title: 'Surviving Fall and Void Hazards Rejection State',
        body: [
          'Surviving Fall and Void Hazards should be read as topic for surviving fall and void hazards within My World Building and Placement and Hazards. The point matters in rejection state because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Rejection State.',
          'Ownership in Surviving Fall and Void Hazards is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'Surviving Fall and Void Hazards should not use rejection state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-actor-or-board-owner',
        title: 'Surviving Fall and Void Hazards Actor or Board Owner',
        body: [
          'A direct observation for Surviving Fall and Void Hazards should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. That reading gives Surviving Fall and Void Hazards a public anchor for actor or board owner without adding behavior that the current category does not own. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Actor or Board Owner.',
          'Visible feedback for Surviving Fall and Void Hazards should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / My World Building / Placement and Hazards.',
          'The useful result of Surviving Fall and Void Hazards actor or board owner is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Placement and Hazards.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-world-context',
        title: 'Surviving Fall and Void Hazards World Context',
        body: [
          'The useful result of Surviving Fall and Void Hazards attempted action is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Placement and Hazards. For Surviving Fall and Void Hazards, that fact identifies the first concrete boundary for world context: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / World Context.',
          'When Surviving Fall and Void Hazards touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Surviving Fall and Void Hazards crosses from world context into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-feedback-channel',
        title: 'Surviving Fall and Void Hazards Feedback Channel',
        body: [
          'Below the void threshold, the player takes repeating damage until recovery or death. This is handled by the session stepping logic and is independent of the renderer view. Surviving Fall and Void Hazards uses the fact as accepted state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Accepted State. Surviving Fall and Void Hazards uses the fact as feedback channel evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Feedback Channel.',
          'The surrounding context for Surviving Fall and Void Hazards decides which adjacent topic is relevant. Surviving Fall and Void Hazards should be compared with Moving the Player, Recovering after Death, Reading Saved World State only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Surviving Fall and Void Hazards crosses from feedback channel into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-edge-case',
        title: 'Surviving Fall and Void Hazards Edge Case',
        body: [
          'Surviving Fall and Void Hazards separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form. For Surviving Fall and Void Hazards, that fact identifies the first concrete boundary for edge case: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Edge Case.',
          'Recovery or follow-up for Surviving Fall and Void Hazards should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the edge case part of Surviving Fall and Void Hazards should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-save-interaction',
        title: 'Surviving Fall and Void Hazards Save Interaction',
        body: [
          'When Surviving Fall and Void Hazards crosses from accepted state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Surviving Fall and Void Hazards a public anchor for save interaction without adding behavior that the current category does not own. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Save Interaction.',
          'The main confusion risk in Surviving Fall and Void Hazards is hiding gameplay state behind a generic crash report. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for save interaction does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Surviving Fall and Void Hazards should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-debug-evidence',
        title: 'Surviving Fall and Void Hazards Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. In Surviving Fall and Void Hazards, debug evidence is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Debug Evidence.',
          'Reportable evidence for Surviving Fall and Void Hazards should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Surviving Fall and Void Hazards should not use debug evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-cross-category-limit',
        title: 'Surviving Fall and Void Hazards Cross-Category Limit',
        body: [
          'Ownership in Surviving Fall and Void Hazards is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The fact also tells the reader which evidence to preserve for cross-category limit: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Cross-Category Limit.',
          'Adjacent pages matter for Surviving Fall and Void Hazards, but adjacency does not move authority. Surviving Fall and Void Hazards should be compared with Moving the Player, Recovering after Death, Reading Saved World State only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use cross-category limit to keep Surviving Fall and Void Hazards tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-related-play',
        title: 'Surviving Fall and Void Hazards Related Play',
        body: [
          'Surviving Fall and Void Hazards should not use rejection state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Surviving Fall and Void Hazards, that fact identifies the first concrete boundary for related play: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Related Play.',
          'The public boundary for Surviving Fall and Void Hazards is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Surviving Fall and Void Hazards crosses from related play into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-failure-reading',
        title: 'Surviving Fall and Void Hazards Failure Reading',
        body: [
          'Creative flight can avoid or bypass normal hazard outcomes. When diagnosing hazard behavior, include game mode, flight state, recent movement settings, and the surface or lack of surface under the player. The fact also tells the reader which evidence to preserve for failure reading: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Failure Reading.',
          'An operator reading Surviving Fall and Void Hazards should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'Use failure reading to keep Surviving Fall and Void Hazards tied to My World Building; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-public-reporting',
        title: 'Surviving Fall and Void Hazards Public Reporting',
        body: [
          'Visible feedback for Surviving Fall and Void Hazards should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / My World Building / Placement and Hazards. For Surviving Fall and Void Hazards, that fact identifies the first concrete boundary for public reporting: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Public Reporting.',
          'Implementation limits for Surviving Fall and Void Hazards keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the public reporting part of Surviving Fall and Void Hazards should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-rule-preservation',
        title: 'Surviving Fall and Void Hazards Rule Preservation',
        body: [
          'Survival movement records the distance fallen while the player is airborne. Landing beyond the safe fall distance applies damage based on the excess distance. Surviving Fall and Void Hazards uses the fact as rule preservation evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Rule Preservation.',
          'The summary value of Surviving Fall and Void Hazards is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Surviving Fall and Void Hazards crosses from rule preservation into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-closing-check',
        title: 'Surviving Fall and Void Hazards Closing Check',
        body: [
          'Rule Scope defines the useful size of Surviving Fall and Void Hazards. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. For Surviving Fall and Void Hazards, that fact identifies the first concrete boundary for closing check: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Surviving Fall and Void Hazards / My World Building / Placement and Hazards / Closing Check.',
          'A final check for Surviving Fall and Void Hazards should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Surviving Fall and Void Hazards crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Moving the Player', 'Recovering after Death', 'Reading Saved World State'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Lifecycle',
    title: 'Spawning AI NPCs',
    description:
      'Explains the state created when an AI NPC is added to a Ludoxel world. This page treats AI NPC behavior as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'spawning-ai-npcs-rule-scope',
        title: 'AI NPCs Rule Scope',
        body: [
          'An AI spawn uses normalized settings for mode, personality, name, health display, skin source, regeneration, route data, and placement permission. The manager assigns a live actor id. The point matters in rule scope because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Rule Scope.',
          'Rule Scope defines the useful size of Spawning AI NPCs. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion.',
          'Spawning AI NPCs should not use rule scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'spawning-ai-npcs-attempted-action',
        title: 'AI NPCs Attempted Action',
        body: [
          'Rule Scope defines the useful size of Spawning AI NPCs. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion. The fact also tells the reader which evidence to preserve for attempted action: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Attempted Action.',
          'A direct observation for Spawning AI NPCs should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'A public report based on the attempted action part of Spawning AI NPCs should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'spawning-ai-npcs-accepted-state',
        title: 'AI NPCs Accepted State',
        body: [
          'Spawning AI NPCs should not use rule scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Spawning AI NPCs, accepted state is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Accepted State.',
          'Spawning AI NPCs separates the surface that accepts input from the component or document that controls the result. This is especially important when reading actor identity, health, and action choice crosses a saved value, a renderer output, or a public form.',
          'Spawning AI NPCs should not use accepted state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'spawning-ai-npcs-rejection-state',
        title: 'AI NPCs Rejection State',
        body: [
          'Spawning AI NPCs should be read as actor creation for ai npcs within AI NPC Combat and NPC Lifecycle. Spawning AI NPCs uses the fact as rejection state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Rejection State.',
          'Ownership in Spawning AI NPCs is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'When Spawning AI NPCs crosses from rejection state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'spawning-ai-npcs-actor-or-board-owner',
        title: 'AI NPCs Actor or Board Owner',
        body: [
          'A direct observation for Spawning AI NPCs should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. For Spawning AI NPCs, that fact identifies the first concrete boundary for actor or board owner: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Actor or Board Owner.',
          'Visible feedback for Spawning AI NPCs should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / AI NPC Combat / NPC Lifecycle.',
          'When Spawning AI NPCs crosses from actor or board owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'spawning-ai-npcs-world-context',
        title: 'AI NPCs World Context',
        body: [
          'A public report based on the attempted action part of Spawning AI NPCs should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Spawning AI NPCs, world context is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / World Context.',
          'When Spawning AI NPCs touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Spawning AI NPCs should not use world context to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'spawning-ai-npcs-feedback-channel',
        title: 'AI NPCs Feedback Channel',
        body: [
          'New AI can remain on standby, free-roam and fight, or patrol a route when enough route points exist. Placement permission is a movement aid and does not bypass placement safety checks. In Spawning AI NPCs, accepted state is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Accepted State. In Spawning AI NPCs, feedback channel is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Feedback Channel.',
          'The surrounding context for Spawning AI NPCs decides which adjacent topic is relevant. Spawning AI NPCs should be compared with Reading AI Nametags and Health, Naming an AI NPC, Changing AI Behavior Values only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Spawning AI NPCs should not use feedback channel to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'spawning-ai-npcs-edge-case',
        title: 'AI NPCs Edge Case',
        body: [
          'Spawning AI NPCs separates the surface that accepts input from the component or document that controls the result. This is especially important when reading actor identity, health, and action choice crosses a saved value, a renderer output, or a public form. The point matters in edge case because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Edge Case.',
          'Recovery or follow-up for Spawning AI NPCs should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Spawning AI NPCs should not use edge case to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'spawning-ai-npcs-save-interaction',
        title: 'AI NPCs Save Interaction',
        body: [
          'Spawning AI NPCs should not use accepted state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Spawning AI NPCs, that fact identifies the first concrete boundary for save interaction: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Save Interaction.',
          'The main confusion risk in Spawning AI NPCs is mixing AI actor state with player state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the save interaction part of Spawning AI NPCs should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'spawning-ai-npcs-debug-evidence',
        title: 'AI NPCs Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. Spawning AI NPCs uses the fact as rejection state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Rejection State. For Spawning AI NPCs, that fact identifies the first concrete boundary for debug evidence: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Debug Evidence.',
          'Reportable evidence for Spawning AI NPCs should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the debug evidence part of Spawning AI NPCs should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'spawning-ai-npcs-cross-category-limit',
        title: 'AI NPCs Cross-Category Limit',
        body: [
          'Ownership in Spawning AI NPCs is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. That reading gives Spawning AI NPCs a public anchor for cross-category limit without adding behavior that the current category does not own. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Cross-Category Limit.',
          'Adjacent pages matter for Spawning AI NPCs, but adjacency does not move authority. Spawning AI NPCs should be compared with Reading AI Nametags and Health, Naming an AI NPC, Changing AI Behavior Values only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for cross-category limit does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Spawning AI NPCs should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'spawning-ai-npcs-related-play',
        title: 'AI NPCs Related Play',
        body: [
          'When Spawning AI NPCs crosses from rejection state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Spawning AI NPCs a public anchor for related play without adding behavior that the current category does not own. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Related Play.',
          'The public boundary for Spawning AI NPCs is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Spawning AI NPCs related play is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Lifecycle.',
        ],
      },
      {
        id: 'spawning-ai-npcs-failure-reading',
        title: 'AI NPCs Failure Reading',
        body: [
          'AI actor state is saved with position, velocity, health, route data, behavior values, held item, and skin selection. Loading also handles duplicate or invalid names safely. That reading gives Spawning AI NPCs a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Failure Reading.',
          'An operator reading Spawning AI NPCs should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Spawning AI NPCs failure reading is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Lifecycle.',
        ],
      },
      {
        id: 'spawning-ai-npcs-public-reporting',
        title: 'AI NPCs Public Reporting',
        body: [
          'Visible feedback for Spawning AI NPCs should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / AI NPC Combat / NPC Lifecycle. That reading gives Spawning AI NPCs a public anchor for public reporting without adding behavior that the current category does not own. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Public Reporting.',
          'Implementation limits for Spawning AI NPCs keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for public reporting does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Spawning AI NPCs should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'spawning-ai-npcs-rule-preservation',
        title: 'AI NPCs Rule Preservation',
        body: [
          'An AI spawn uses normalized settings for mode, personality, name, health display, skin source, regeneration, route data, and placement permission. The manager assigns a live actor id. That reading gives Spawning AI NPCs a public anchor for rule preservation without adding behavior that the current category does not own. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Rule Preservation.',
          'The summary value of Spawning AI NPCs is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Spawning AI NPCs rule preservation is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Lifecycle.',
        ],
      },
      {
        id: 'spawning-ai-npcs-closing-check',
        title: 'AI NPCs Closing Check',
        body: [
          'Rule Scope defines the useful size of Spawning AI NPCs. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion. That reading gives Spawning AI NPCs a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Spawning AI NPCs / AI NPC Combat / NPC Lifecycle / Closing Check.',
          'A final check for Spawning AI NPCs should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Spawning AI NPCs should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Reading AI Nametags and Health', 'Naming an AI NPC', 'Changing AI Behavior Values'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Lifecycle',
    title: 'Reading AI Nametags and Health',
    description:
      'Explains the world-space AI name and health presentation. This page treats AI NPC behavior as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-ai-nametags-and-health-rule-scope',
        title: 'AI Nametags and Health Rule Scope',
        body: [
          'AI names are shown as world-space nametags. The name comes from normalized AI settings, and live-name conflicts are handled by the session-side validator. In Reading AI Nametags and Health, rule scope is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Rule Scope. In Reading AI Nametags and Health, rule scope is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Rule Scope.',
          'Rule Scope defines the useful size of Reading AI Nametags and Health. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion.',
          'Reading AI Nametags and Health should not use rule scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-attempted-action',
        title: 'AI Nametags and Health Attempted Action',
        body: [
          'Rule Scope defines the useful size of Reading AI Nametags and Health. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion. The fact also tells the reader which evidence to preserve for attempted action: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Attempted Action.',
          'A direct observation for Reading AI Nametags and Health should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'Use attempted action to keep Reading AI Nametags and Health tied to AI NPC Combat; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-accepted-state',
        title: 'AI Nametags and Health Accepted State',
        body: [
          'Reading AI Nametags and Health should not use rule scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Reading AI Nametags and Health, accepted state is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Accepted State.',
          'Reading AI Nametags and Health separates the surface that accepts input from the component or document that controls the result. This is especially important when reading actor identity, health, and action choice crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for accepted state does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading AI Nametags and Health should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-rejection-state',
        title: 'AI Nametags and Health Rejection State',
        body: [
          'Reading AI Nametags and Health should be read as interpretation for ai nametags and health within AI NPC Combat and NPC Lifecycle. The fact also tells the reader which evidence to preserve for rejection state: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Rejection State.',
          'Ownership in Reading AI Nametags and Health is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'A public report based on the rejection state part of Reading AI Nametags and Health should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-actor-or-board-owner',
        title: 'AI Nametags and Health Actor or Board Owner',
        body: [
          'A direct observation for Reading AI Nametags and Health should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. For Reading AI Nametags and Health, that fact identifies the first concrete boundary for actor or board owner: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Actor or Board Owner.',
          'Visible feedback for Reading AI Nametags and Health should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / AI NPC Combat / NPC Lifecycle.',
          'A public report based on the actor or board owner part of Reading AI Nametags and Health should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-world-context',
        title: 'AI Nametags and Health World Context',
        body: [
          'Use attempted action to keep Reading AI Nametags and Health tied to AI NPC Combat; use a related page only when the reader needs a different owner. The point matters in world context because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / World Context.',
          'When Reading AI Nametags and Health touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading AI Nametags and Health should not use world context to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-feedback-channel',
        title: 'AI Nametags and Health Feedback Channel',
        body: [
          'Health can be shown above the nametag, below the nametag, or hidden. One heart represents two health points in the indicator, while combat rules keep numeric health in simulation state. In Reading AI Nametags and Health, accepted state is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Accepted State. That reading gives Reading AI Nametags and Health a public anchor for feedback channel without adding behavior that the current category does not own. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Feedback Channel.',
          'The surrounding context for Reading AI Nametags and Health decides which adjacent topic is relevant. Reading AI Nametags and Health should be compared with Spawning AI NPCs, Understanding AI Combat, Understanding Render Snapshots only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Reading AI Nametags and Health feedback channel is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Lifecycle.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-edge-case',
        title: 'AI Nametags and Health Edge Case',
        body: [
          'Reading AI Nametags and Health separates the surface that accepts input from the component or document that controls the result. This is especially important when reading actor identity, health, and action choice crosses a saved value, a renderer output, or a public form. In Reading AI Nametags and Health, edge case is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Edge Case.',
          'Recovery or follow-up for Reading AI Nametags and Health should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Reading AI Nametags and Health should not use edge case to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-save-interaction',
        title: 'AI Nametags and Health Save Interaction',
        body: [
          'If the available evidence for accepted state does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading AI Nametags and Health should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for save interaction: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Save Interaction.',
          'The main confusion risk in Reading AI Nametags and Health is mixing AI actor state with player state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the save interaction part of Reading AI Nametags and Health should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-debug-evidence',
        title: 'AI Nametags and Health Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. For Reading AI Nametags and Health, that fact identifies the first concrete boundary for debug evidence: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Debug Evidence.',
          'Reportable evidence for Reading AI Nametags and Health should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Reading AI Nametags and Health crosses from debug evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-cross-category-limit',
        title: 'AI Nametags and Health Cross-Category Limit',
        body: [
          'Ownership in Reading AI Nametags and Health is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. In Reading AI Nametags and Health, cross-category limit is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Cross-Category Limit.',
          'Adjacent pages matter for Reading AI Nametags and Health, but adjacency does not move authority. Reading AI Nametags and Health should be compared with Spawning AI NPCs, Understanding AI Combat, Understanding Render Snapshots only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for cross-category limit does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading AI Nametags and Health should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-related-play',
        title: 'AI Nametags and Health Related Play',
        body: [
          'A public report based on the rejection state part of Reading AI Nametags and Health should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Reading AI Nametags and Health, related play is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Related Play.',
          'The public boundary for Reading AI Nametags and Health is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Reading AI Nametags and Health should not use related play to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-failure-reading',
        title: 'AI Nametags and Health Failure Reading',
        body: [
          'The renderer receives AI render state for display. It does not decide whether the AI is damaged, defeated, regenerated, or allowed to attack. The point matters in failure reading because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Failure Reading.',
          'An operator reading Reading AI Nametags and Health should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Reading AI Nametags and Health failure reading is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Lifecycle.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-public-reporting',
        title: 'AI Nametags and Health Public Reporting',
        body: [
          'Visible feedback for Reading AI Nametags and Health should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / AI NPC Combat / NPC Lifecycle. That reading gives Reading AI Nametags and Health a public anchor for public reporting without adding behavior that the current category does not own. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Public Reporting.',
          'Implementation limits for Reading AI Nametags and Health keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Reading AI Nametags and Health public reporting is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Lifecycle.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-rule-preservation',
        title: 'AI Nametags and Health Rule Preservation',
        body: [
          'AI names are shown as world-space nametags. The name comes from normalized AI settings, and live-name conflicts are handled by the session-side validator. In Reading AI Nametags and Health, rule scope is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Rule Scope. The point matters in rule preservation because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Rule Preservation.',
          'The summary value of Reading AI Nametags and Health is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Reading AI Nametags and Health rule preservation is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Lifecycle.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-closing-check',
        title: 'AI Nametags and Health Closing Check',
        body: [
          'Rule Scope defines the useful size of Reading AI Nametags and Health. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion. The point matters in closing check because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Reading AI Nametags and Health / AI NPC Combat / NPC Lifecycle / Closing Check.',
          'A final check for Reading AI Nametags and Health should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Reading AI Nametags and Health should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Spawning AI NPCs', 'Understanding AI Combat', 'Understanding Render Snapshots'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Actions',
    title: 'Understanding AI Combat',
    description:
      'Describes how aggressive AI attacks are tied to simulation state. This page treats AI NPC behavior as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-ai-combat-rule-scope',
        title: 'AI Combat Rule Scope',
        body: [
          'Aggressive AI uses visibility, distance, cooldown, health, route state, and movement state to decide whether to pursue or attack. Peaceful AI avoids that combat role. For Understanding AI Combat, that fact identifies the first concrete boundary for rule scope: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Rule Scope.',
          'Rule Scope defines the useful size of Understanding AI Combat. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion.',
          'A public report based on the rule scope part of Understanding AI Combat should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-combat-attempted-action',
        title: 'AI Combat Attempted Action',
        body: [
          'Rule Scope defines the useful size of Understanding AI Combat. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion. In Understanding AI Combat, attempted action is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Attempted Action.',
          'A direct observation for Understanding AI Combat should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'Understanding AI Combat should not use attempted action to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-combat-accepted-state',
        title: 'AI Combat Accepted State',
        body: [
          'A public report based on the rule scope part of Understanding AI Combat should state the action, expected result, actual result, environment, and any redaction needed before sharing. For Understanding AI Combat, that fact identifies the first concrete boundary for accepted state: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Accepted State.',
          'Understanding AI Combat separates the surface that accepts input from the component or document that controls the result. This is especially important when reading actor identity, health, and action choice crosses a saved value, a renderer output, or a public form.',
          'When Understanding AI Combat crosses from accepted state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-combat-rejection-state',
        title: 'AI Combat Rejection State',
        body: [
          'Understanding AI Combat should be read as conceptual boundary for ai combat within AI NPC Combat and NPC Actions. In Understanding AI Combat, attempted action is the difference between reading AI NPC behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Attempted Action. The point matters in rejection state because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Rejection State.',
          'Ownership in Understanding AI Combat is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'The useful result of Understanding AI Combat rejection state is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Actions.',
        ],
      },
      {
        id: 'understanding-ai-combat-actor-or-board-owner',
        title: 'AI Combat Actor or Board Owner',
        body: [
          'A direct observation for Understanding AI Combat should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. The point matters in actor or board owner because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Actor or Board Owner.',
          'Visible feedback for Understanding AI Combat should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / AI NPC Combat / NPC Actions.',
          'The useful result of Understanding AI Combat actor or board owner is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Actions.',
        ],
      },
      {
        id: 'understanding-ai-combat-world-context',
        title: 'AI Combat World Context',
        body: [
          'Understanding AI Combat should not use attempted action to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. For Understanding AI Combat, that fact identifies the first concrete boundary for world context: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / World Context.',
          'When Understanding AI Combat touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the world context part of Understanding AI Combat should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-combat-feedback-channel',
        title: 'AI Combat Feedback Channel',
        body: [
          'Melee damage applies through player and AI health systems with cooldowns and knockback. A defeated actor is removed by the AI manager, and player death is reported through the session step. The fact also tells the reader which evidence to preserve for feedback channel: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Feedback Channel.',
          'The surrounding context for Understanding AI Combat decides which adjacent topic is relevant. Understanding AI Combat should be compared with Reading AI Nametags and Health, Changing AI Behavior Values, Understanding AI Action Selection only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the feedback channel part of Understanding AI Combat should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-combat-edge-case',
        title: 'AI Combat Edge Case',
        body: [
          'Understanding AI Combat separates the surface that accepts input from the component or document that controls the result. This is especially important when reading actor identity, health, and action choice crosses a saved value, a renderer output, or a public form. Understanding AI Combat uses the fact as edge case evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Edge Case.',
          'Recovery or follow-up for Understanding AI Combat should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use edge case to keep Understanding AI Combat tied to AI NPC Combat; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-combat-save-interaction',
        title: 'AI Combat Save Interaction',
        body: [
          'When Understanding AI Combat crosses from accepted state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Understanding AI Combat a public anchor for save interaction without adding behavior that the current category does not own. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Save Interaction.',
          'The main confusion risk in Understanding AI Combat is mixing AI actor state with player state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Understanding AI Combat save interaction is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Actions.',
        ],
      },
      {
        id: 'understanding-ai-combat-debug-evidence',
        title: 'AI Combat Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. The point matters in debug evidence because reading actor identity, health, and action choice can otherwise be mistaken for mixing AI actor state with player state. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Debug Evidence.',
          'Reportable evidence for Understanding AI Combat should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Understanding AI Combat should not use debug evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-combat-cross-category-limit',
        title: 'AI Combat Cross-Category Limit',
        body: [
          'Ownership in Understanding AI Combat is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. Understanding AI Combat uses the fact as cross-category limit evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Cross-Category Limit.',
          'Adjacent pages matter for Understanding AI Combat, but adjacency does not move authority. Understanding AI Combat should be compared with Reading AI Nametags and Health, Changing AI Behavior Values, Understanding AI Action Selection only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use cross-category limit to keep Understanding AI Combat tied to AI NPC Combat; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-combat-related-play',
        title: 'AI Combat Related Play',
        body: [
          'The useful result of Understanding AI Combat rejection state is a bounded explanation of AI NPC behavior: enough detail to act, and enough restraint to avoid claims outside NPC Actions. The fact also tells the reader which evidence to preserve for related play: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Related Play.',
          'The public boundary for Understanding AI Combat is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use related play to keep Understanding AI Combat tied to AI NPC Combat; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-combat-failure-reading',
        title: 'AI Combat Failure Reading',
        body: [
          'A learned policy can alter action ranking only after evaluation passes. Action masks and combat safety still constrain the final decision. The fact also tells the reader which evidence to preserve for failure reading: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Failure Reading.',
          'An operator reading Understanding AI Combat should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the failure reading part of Understanding AI Combat should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-combat-public-reporting',
        title: 'AI Combat Public Reporting',
        body: [
          'Visible feedback for Understanding AI Combat should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / AI NPC Combat / NPC Actions. Understanding AI Combat uses the fact as public reporting evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Public Reporting.',
          'Implementation limits for Understanding AI Combat keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use public reporting to keep Understanding AI Combat tied to AI NPC Combat; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-ai-combat-rule-preservation',
        title: 'AI Combat Rule Preservation',
        body: [
          'Aggressive AI uses visibility, distance, cooldown, health, route state, and movement state to decide whether to pursue or attack. Peaceful AI avoids that combat role. For Understanding AI Combat, that fact identifies the first concrete boundary for rule preservation: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Rule Preservation.',
          'The summary value of Understanding AI Combat is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Understanding AI Combat crosses from rule preservation into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-combat-closing-check',
        title: 'AI Combat Closing Check',
        body: [
          'Rule Scope defines the useful size of Understanding AI Combat. The article should be broad enough to explain AI NPC behavior, but narrow enough that mixing AI actor state with player state remains outside the conclusion. Understanding AI Combat uses the fact as closing check evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding AI Combat / AI NPC Combat / NPC Actions / Closing Check.',
          'A final check for Understanding AI Combat should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Understanding AI Combat crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Reading AI Nametags and Health', 'Changing AI Behavior Values', 'Understanding AI Action Selection'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Actions',
    title: 'Understanding AI Placement Behavior',
    description:
      'Explains why AI block placement is a constrained movement aid. This page treats block construction as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-ai-placement-behavior-rule-scope',
        title: 'AI Placement Behavior Rule Scope',
        body: [
          'AI placement supports bridging, securing the next footing, escaping boxed positions, route recovery, and defensive placement. It is not unrestricted building permission. That reading gives Understanding AI Placement Behavior a public anchor for rule scope without adding behavior that the current category does not own. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Rule Scope.',
          'Rule Scope defines the useful size of Understanding AI Placement Behavior. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion.',
          'If the available evidence for rule scope does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding AI Placement Behavior should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-attempted-action',
        title: 'AI Placement Behavior Attempted Action',
        body: [
          'Rule Scope defines the useful size of Understanding AI Placement Behavior. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion. For Understanding AI Placement Behavior, that fact identifies the first concrete boundary for attempted action: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Attempted Action.',
          'A direct observation for Understanding AI Placement Behavior should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'A public report based on the attempted action part of Understanding AI Placement Behavior should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-accepted-state',
        title: 'AI Placement Behavior Accepted State',
        body: [
          'If the available evidence for rule scope does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding AI Placement Behavior should be treated as an observation rather than a confirmed cause. The point matters in accepted state because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Accepted State.',
          'Understanding AI Placement Behavior separates the surface that accepts input from the component or document that controls the result. This is especially important when placing or interpreting world blocks crosses a saved value, a renderer output, or a public form.',
          'Understanding AI Placement Behavior should not use accepted state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-rejection-state',
        title: 'AI Placement Behavior Rejection State',
        body: [
          'Understanding AI Placement Behavior should be read as conceptual boundary for ai placement behavior within AI NPC Combat and NPC Actions. For Understanding AI Placement Behavior, that fact identifies the first concrete boundary for rejection state: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Rejection State.',
          'Ownership in Understanding AI Placement Behavior is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'When Understanding AI Placement Behavior crosses from rejection state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-actor-or-board-owner',
        title: 'AI Placement Behavior Actor or Board Owner',
        body: [
          'A direct observation for Understanding AI Placement Behavior should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. Understanding AI Placement Behavior uses the fact as actor or board owner evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Actor or Board Owner.',
          'Visible feedback for Understanding AI Placement Behavior should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / AI NPC Combat / NPC Actions.',
          'When Understanding AI Placement Behavior crosses from actor or board owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-world-context',
        title: 'AI Placement Behavior World Context',
        body: [
          'A public report based on the attempted action part of Understanding AI Placement Behavior should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Understanding AI Placement Behavior a public anchor for world context without adding behavior that the current category does not own. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / World Context.',
          'When Understanding AI Placement Behavior touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Understanding AI Placement Behavior world context is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside NPC Actions.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-feedback-channel',
        title: 'AI Placement Behavior Feedback Channel',
        body: [
          'Placement requires line of sight, available item state, support, clear collision, and an action mask that allows the requested placement. Forward movement can wait until a bridge footing exists. In Understanding AI Placement Behavior, feedback channel is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Feedback Channel.',
          'The surrounding context for Understanding AI Placement Behavior decides which adjacent topic is relevant. Understanding AI Placement Behavior should be compared with Reading Placement Rejection, Understanding AI Action Selection, Applying a Learned Policy only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for feedback channel does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding AI Placement Behavior should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-edge-case',
        title: 'AI Placement Behavior Edge Case',
        body: [
          'Understanding AI Placement Behavior separates the surface that accepts input from the component or document that controls the result. This is especially important when placing or interpreting world blocks crosses a saved value, a renderer output, or a public form. That reading gives Understanding AI Placement Behavior a public anchor for edge case without adding behavior that the current category does not own. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Edge Case.',
          'Recovery or follow-up for Understanding AI Placement Behavior should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for edge case does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding AI Placement Behavior should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-save-interaction',
        title: 'AI Placement Behavior Save Interaction',
        body: [
          'Understanding AI Placement Behavior should not use accepted state to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for save interaction: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Save Interaction.',
          'The main confusion risk in Understanding AI Placement Behavior is treating every block shape as a full-cube collision rule. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the save interaction part of Understanding AI Placement Behavior should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-debug-evidence',
        title: 'AI Placement Behavior Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. The fact also tells the reader which evidence to preserve for debug evidence: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Debug Evidence.',
          'Reportable evidence for Understanding AI Placement Behavior should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the debug evidence part of Understanding AI Placement Behavior should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-cross-category-limit',
        title: 'AI Placement Behavior Cross-Category Limit',
        body: [
          'Ownership in Understanding AI Placement Behavior is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. That reading gives Understanding AI Placement Behavior a public anchor for cross-category limit without adding behavior that the current category does not own. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Cross-Category Limit.',
          'Adjacent pages matter for Understanding AI Placement Behavior, but adjacency does not move authority. Understanding AI Placement Behavior should be compared with Reading Placement Rejection, Understanding AI Action Selection, Applying a Learned Policy only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Understanding AI Placement Behavior cross-category limit is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside NPC Actions.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-related-play',
        title: 'AI Placement Behavior Related Play',
        body: [
          'When Understanding AI Placement Behavior crosses from rejection state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The point matters in related play because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Related Play.',
          'The public boundary for Understanding AI Placement Behavior is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding AI Placement Behavior related play is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside NPC Actions.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-failure-reading',
        title: 'AI Placement Behavior Failure Reading',
        body: [
          'The placement permission toggle changes whether those aids are available. It does not let learned policies, route mode, or combat mode skip world placement rules. Understanding AI Placement Behavior uses the fact as actor or board owner evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Actor or Board Owner. The point matters in failure reading because placing or interpreting world blocks can otherwise be mistaken for treating every block shape as a full-cube collision rule. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Failure Reading.',
          'An operator reading Understanding AI Placement Behavior should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Understanding AI Placement Behavior failure reading is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside NPC Actions.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-public-reporting',
        title: 'AI Placement Behavior Public Reporting',
        body: [
          'Visible feedback for Understanding AI Placement Behavior should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / AI NPC Combat / NPC Actions. In Understanding AI Placement Behavior, public reporting is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Public Reporting.',
          'Implementation limits for Understanding AI Placement Behavior keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for public reporting does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding AI Placement Behavior should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-rule-preservation',
        title: 'AI Placement Behavior Rule Preservation',
        body: [
          'AI placement supports bridging, securing the next footing, escaping boxed positions, route recovery, and defensive placement. It is not unrestricted building permission. In Understanding AI Placement Behavior, rule preservation is the difference between reading block construction and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Rule Preservation.',
          'The summary value of Understanding AI Placement Behavior is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding AI Placement Behavior should not use rule preservation to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-closing-check',
        title: 'AI Placement Behavior Closing Check',
        body: [
          'Rule Scope defines the useful size of Understanding AI Placement Behavior. The article should be broad enough to explain block construction, but narrow enough that treating every block shape as a full-cube collision rule remains outside the conclusion. That reading gives Understanding AI Placement Behavior a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Understanding AI Placement Behavior / AI NPC Combat / NPC Actions / Closing Check.',
          'A final check for Understanding AI Placement Behavior should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Understanding AI Placement Behavior closing check is a bounded explanation of block construction: enough detail to act, and enough restraint to avoid claims outside NPC Actions.',
        ],
      },
    ],
    relatedTitles: ['Reading Placement Rejection', 'Understanding AI Action Selection', 'Applying a Learned Policy'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Turns',
    title: 'Starting an Othello Match',
    description:
      'Explains the state initialized for a playable Othello match. This page treats application startup as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'starting-an-othello-match-rule-scope',
        title: 'Othello Match Rule Scope',
        body: [
          'A match starts from the standard four-disc board state on the Othello play-space board. The controller computes legal moves from the board rules. The point matters in rule scope because opening the desktop application can otherwise be mistaken for confusing a local run with package or release status. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Rule Scope.',
          'Rule Scope defines the useful size of Starting an Othello Match. The article should be broad enough to explain application startup, but narrow enough that confusing a local run with package or release status remains outside the conclusion.',
          'The useful result of Starting an Othello Match rule scope is a bounded explanation of application startup: enough detail to act, and enough restraint to avoid claims outside Match Turns.',
        ],
      },
      {
        id: 'starting-an-othello-match-attempted-action',
        title: 'Othello Match Attempted Action',
        body: [
          'Rule Scope defines the useful size of Starting an Othello Match. The article should be broad enough to explain application startup, but narrow enough that confusing a local run with package or release status remains outside the conclusion. For Starting an Othello Match, that fact identifies the first concrete boundary for attempted action: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Attempted Action.',
          'A direct observation for Starting an Othello Match should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'A public report based on the attempted action part of Starting an Othello Match should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'starting-an-othello-match-accepted-state',
        title: 'Othello Match Accepted State',
        body: [
          'The useful result of Starting an Othello Match rule scope is a bounded explanation of application startup: enough detail to act, and enough restraint to avoid claims outside Match Turns. That reading gives Starting an Othello Match a public anchor for accepted state without adding behavior that the current category does not own. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Accepted State.',
          'Starting an Othello Match separates the surface that accepts input from the component or document that controls the result. This is especially important when opening the desktop application crosses a saved value, a renderer output, or a public form.',
          'The useful result of Starting an Othello Match accepted state is a bounded explanation of application startup: enough detail to act, and enough restraint to avoid claims outside Match Turns.',
        ],
      },
      {
        id: 'starting-an-othello-match-rejection-state',
        title: 'Othello Match Rejection State',
        body: [
          'Starting an Othello Match should be read as initialization for an othello match within Othello Play and Match Turns. For Starting an Othello Match, that fact identifies the first concrete boundary for rejection state: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Rejection State.',
          'Ownership in Starting an Othello Match is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'When Starting an Othello Match crosses from rejection state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'starting-an-othello-match-actor-or-board-owner',
        title: 'Othello Match Actor or Board Owner',
        body: [
          'A direct observation for Starting an Othello Match should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for actor or board owner: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Actor or Board Owner.',
          'Visible feedback for Starting an Othello Match should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / Othello Play / Match Turns.',
          'Use actor or board owner to keep Starting an Othello Match tied to Othello Play; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'starting-an-othello-match-world-context',
        title: 'Othello Match World Context',
        body: [
          'A public report based on the attempted action part of Starting an Othello Match should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in world context because opening the desktop application can otherwise be mistaken for confusing a local run with package or release status. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / World Context.',
          'When Starting an Othello Match touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Starting an Othello Match should not use world context to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'starting-an-othello-match-feedback-channel',
        title: 'Othello Match Feedback Channel',
        body: [
          'Difficulty, time control, disc animation, player side, worker count, hash level, sacrifice level, and book-learning thresholds come from normalized Othello settings. The point matters in feedback channel because opening the desktop application can otherwise be mistaken for confusing a local run with package or release status. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Feedback Channel.',
          'The surrounding context for Starting an Othello Match decides which adjacent topic is relevant. Starting an Othello Match should be compared with Placing an Othello Move, Changing Match Rules, Changing Othello AI Strength only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Starting an Othello Match should not use feedback channel to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'starting-an-othello-match-edge-case',
        title: 'Othello Match Edge Case',
        body: [
          'Starting an Othello Match separates the surface that accepts input from the component or document that controls the result. This is especially important when opening the desktop application crosses a saved value, a renderer output, or a public form. In Starting an Othello Match, edge case is the difference between reading application startup and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Edge Case.',
          'Recovery or follow-up for Starting an Othello Match should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Starting an Othello Match should not use edge case to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'starting-an-othello-match-save-interaction',
        title: 'Othello Match Save Interaction',
        body: [
          'The useful result of Starting an Othello Match accepted state is a bounded explanation of application startup: enough detail to act, and enough restraint to avoid claims outside Match Turns. Starting an Othello Match uses the fact as save interaction evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Save Interaction.',
          'The main confusion risk in Starting an Othello Match is confusing a local run with package or release status. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use save interaction to keep Starting an Othello Match tied to Othello Play; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'starting-an-othello-match-debug-evidence',
        title: 'Othello Match Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. The fact also tells the reader which evidence to preserve for debug evidence: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Debug Evidence.',
          'Reportable evidence for Starting an Othello Match should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the debug evidence part of Starting an Othello Match should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'starting-an-othello-match-cross-category-limit',
        title: 'Othello Match Cross-Category Limit',
        body: [
          'Ownership in Starting an Othello Match is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. In Starting an Othello Match, cross-category limit is the difference between reading application startup and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Cross-Category Limit.',
          'Adjacent pages matter for Starting an Othello Match, but adjacency does not move authority. Starting an Othello Match should be compared with Placing an Othello Move, Changing Match Rules, Changing Othello AI Strength only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for cross-category limit does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Starting an Othello Match should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'starting-an-othello-match-related-play',
        title: 'Othello Match Related Play',
        body: [
          'When Starting an Othello Match crosses from rejection state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The point matters in related play because opening the desktop application can otherwise be mistaken for confusing a local run with package or release status. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Related Play.',
          'The public boundary for Starting an Othello Match is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Starting an Othello Match related play is a bounded explanation of application startup: enough detail to act, and enough restraint to avoid claims outside Match Turns.',
        ],
      },
      {
        id: 'starting-an-othello-match-failure-reading',
        title: 'Othello Match Failure Reading',
        body: [
          'Othello uses its own persisted space with board, match, world, player, and AI data. It does not reuse My World block-building rules for legal disc moves. That reading gives Starting an Othello Match a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Failure Reading.',
          'An operator reading Starting an Othello Match should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for failure reading does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Starting an Othello Match should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'starting-an-othello-match-public-reporting',
        title: 'Othello Match Public Reporting',
        body: [
          'Visible feedback for Starting an Othello Match should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / Othello Play / Match Turns. In Starting an Othello Match, public reporting is the difference between reading application startup and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Public Reporting.',
          'Implementation limits for Starting an Othello Match keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for public reporting does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Starting an Othello Match should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'starting-an-othello-match-rule-preservation',
        title: 'Othello Match Rule Preservation',
        body: [
          'A match starts from the standard four-disc board state on the Othello play-space board. The controller computes legal moves from the board rules. That reading gives Starting an Othello Match a public anchor for rule preservation without adding behavior that the current category does not own. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Rule Preservation.',
          'The summary value of Starting an Othello Match is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for rule preservation does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Starting an Othello Match should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'starting-an-othello-match-closing-check',
        title: 'Othello Match Closing Check',
        body: [
          'Rule Scope defines the useful size of Starting an Othello Match. The article should be broad enough to explain application startup, but narrow enough that confusing a local run with package or release status remains outside the conclusion. The point matters in closing check because opening the desktop application can otherwise be mistaken for confusing a local run with package or release status. The local reading frame is Starting an Othello Match / Othello Play / Match Turns / Closing Check.',
          'A final check for Starting an Othello Match should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Starting an Othello Match should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Placing an Othello Move', 'Changing Match Rules', 'Changing Othello AI Strength'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Turns',
    title: 'Placing an Othello Move',
    description:
      'Explains how a player move is accepted on the Othello board. This page treats Othello match behavior as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'placing-an-othello-move-rule-scope',
        title: 'Othello Move Rule Scope',
        body: [
          'A player move is accepted only during the player-turn state and only on a legal square. Legal moves are produced by the Othello rule engine from the current board. In Placing an Othello Move, rule scope is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Rule Scope. In Placing an Othello Move, rule scope is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Rule Scope.',
          'Rule Scope defines the useful size of Placing an Othello Move. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion.',
          'Placing an Othello Move should not use rule scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'placing-an-othello-move-attempted-action',
        title: 'Othello Move Attempted Action',
        body: [
          'Rule Scope defines the useful size of Placing an Othello Move. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. For Placing an Othello Move, that fact identifies the first concrete boundary for attempted action: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Attempted Action.',
          'A direct observation for Placing an Othello Move should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'A public report based on the attempted action part of Placing an Othello Move should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'placing-an-othello-move-accepted-state',
        title: 'Othello Move Accepted State',
        body: [
          'Placing an Othello Move should not use rule scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Placing an Othello Move a public anchor for accepted state without adding behavior that the current category does not own. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Accepted State.',
          'Placing an Othello Move separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form.',
          'The useful result of Placing an Othello Move accepted state is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Turns.',
        ],
      },
      {
        id: 'placing-an-othello-move-rejection-state',
        title: 'Othello Move Rejection State',
        body: [
          'Placing an Othello Move should be read as validated action for an othello move within Othello Play and Match Turns. The fact also tells the reader which evidence to preserve for rejection state: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Rejection State.',
          'Ownership in Placing an Othello Move is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'A public report based on the rejection state part of Placing an Othello Move should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'placing-an-othello-move-actor-or-board-owner',
        title: 'Othello Move Actor or Board Owner',
        body: [
          'A direct observation for Placing an Othello Move should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. For Placing an Othello Move, that fact identifies the first concrete boundary for actor or board owner: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Actor or Board Owner.',
          'Visible feedback for Placing an Othello Move should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / Othello Play / Match Turns.',
          'A public report based on the actor or board owner part of Placing an Othello Move should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'placing-an-othello-move-world-context',
        title: 'Othello Move World Context',
        body: [
          'A public report based on the attempted action part of Placing an Othello Move should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Placing an Othello Move a public anchor for world context without adding behavior that the current category does not own. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / World Context.',
          'When Placing an Othello Move touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Placing an Othello Move world context is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Turns.',
        ],
      },
      {
        id: 'placing-an-othello-move-feedback-channel',
        title: 'Othello Move Feedback Channel',
        body: [
          'Applying a move places the disc and flips captured lines in the eight Othello directions. The controller then advances the turn, animation, pass, or finished state. In Placing an Othello Move, feedback channel is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Feedback Channel.',
          'The surrounding context for Placing an Othello Move decides which adjacent topic is relevant. Placing an Othello Move should be compared with Starting an Othello Match, Reading Match Results, Understanding Othello Search only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for feedback channel does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Placing an Othello Move should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'placing-an-othello-move-edge-case',
        title: 'Othello Move Edge Case',
        body: [
          'Placing an Othello Move separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form. That reading gives Placing an Othello Move a public anchor for edge case without adding behavior that the current category does not own. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Edge Case.',
          'Recovery or follow-up for Placing an Othello Move should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for edge case does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Placing an Othello Move should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'placing-an-othello-move-save-interaction',
        title: 'Othello Move Save Interaction',
        body: [
          'The useful result of Placing an Othello Move accepted state is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Turns. For Placing an Othello Move, that fact identifies the first concrete boundary for save interaction: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Save Interaction.',
          'The main confusion risk in Placing an Othello Move is treating Othello state as My World block data. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Placing an Othello Move crosses from save interaction into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'placing-an-othello-move-debug-evidence',
        title: 'Othello Move Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. Placing an Othello Move uses the fact as debug evidence evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Debug Evidence.',
          'Reportable evidence for Placing an Othello Move should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use debug evidence to keep Placing an Othello Move tied to Othello Play; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'placing-an-othello-move-cross-category-limit',
        title: 'Othello Move Cross-Category Limit',
        body: [
          'Ownership in Placing an Othello Move is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The point matters in cross-category limit because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Cross-Category Limit.',
          'Adjacent pages matter for Placing an Othello Move, but adjacency does not move authority. Placing an Othello Move should be compared with Starting an Othello Match, Reading Match Results, Understanding Othello Search only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Placing an Othello Move should not use cross-category limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'placing-an-othello-move-related-play',
        title: 'Othello Move Related Play',
        body: [
          'A public report based on the rejection state part of Placing an Othello Move should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in related play because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Related Play.',
          'The public boundary for Placing an Othello Move is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Placing an Othello Move related play is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Turns.',
        ],
      },
      {
        id: 'placing-an-othello-move-failure-reading',
        title: 'Othello Move Failure Reading',
        body: [
          'The renderer and viewport help locate the selected board square, but the match controller decides legality. A visible square highlight is not a permission grant by itself. That reading gives Placing an Othello Move a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Failure Reading.',
          'An operator reading Placing an Othello Move should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for failure reading does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Placing an Othello Move should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'placing-an-othello-move-public-reporting',
        title: 'Othello Move Public Reporting',
        body: [
          'Visible feedback for Placing an Othello Move should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / Othello Play / Match Turns. In Placing an Othello Move, public reporting is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Public Reporting.',
          'Implementation limits for Placing an Othello Move keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for public reporting does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Placing an Othello Move should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'placing-an-othello-move-rule-preservation',
        title: 'Othello Move Rule Preservation',
        body: [
          'A player move is accepted only during the player-turn state and only on a legal square. Legal moves are produced by the Othello rule engine from the current board. In Placing an Othello Move, rule scope is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Rule Scope. In Placing an Othello Move, rule preservation is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Rule Preservation.',
          'The summary value of Placing an Othello Move is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Placing an Othello Move should not use rule preservation to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'placing-an-othello-move-closing-check',
        title: 'Othello Move Closing Check',
        body: [
          'Rule Scope defines the useful size of Placing an Othello Move. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. In Placing an Othello Move, closing check is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Placing an Othello Move / Othello Play / Match Turns / Closing Check.',
          'A final check for Placing an Othello Move should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Placing an Othello Move should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Starting an Othello Match', 'Reading Match Results', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Outcomes',
    title: 'Understanding Othello AI Turns',
    description:
      'Describes how Ludoxel chooses and applies an Othello AI move. This page treats Othello match behavior as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-othello-ai-turns-rule-scope',
        title: 'Othello AI Turns Rule Scope',
        body: [
          'When the match enters an AI turn, the controller asks the configured engine for a move using the current board, difficulty, time budget, and book settings. That reading gives Understanding Othello AI Turns a public anchor for rule scope without adding behavior that the current category does not own. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Rule Scope.',
          'Rule Scope defines the useful size of Understanding Othello AI Turns. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion.',
          'The useful result of Understanding Othello AI Turns rule scope is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Outcomes.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-attempted-action',
        title: 'Othello AI Turns Attempted Action',
        body: [
          'Rule Scope defines the useful size of Understanding Othello AI Turns. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. Understanding Othello AI Turns uses the fact as attempted action evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Attempted Action.',
          'A direct observation for Understanding Othello AI Turns should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'Use attempted action to keep Understanding Othello AI Turns tied to Othello Play; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-accepted-state',
        title: 'Othello AI Turns Accepted State',
        body: [
          'The useful result of Understanding Othello AI Turns rule scope is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Outcomes. That reading gives Understanding Othello AI Turns a public anchor for accepted state without adding behavior that the current category does not own. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Accepted State.',
          'Understanding Othello AI Turns separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for accepted state does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding Othello AI Turns should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-rejection-state',
        title: 'Othello AI Turns Rejection State',
        body: [
          'Understanding Othello AI Turns should be read as conceptual boundary for othello ai turns within Othello Play and Match Outcomes. Understanding Othello AI Turns uses the fact as attempted action evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Attempted Action. Understanding Othello AI Turns uses the fact as rejection state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Rejection State.',
          'Ownership in Understanding Othello AI Turns is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'When Understanding Othello AI Turns crosses from rejection state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-actor-or-board-owner',
        title: 'Othello AI Turns Actor or Board Owner',
        body: [
          'A direct observation for Understanding Othello AI Turns should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. For Understanding Othello AI Turns, that fact identifies the first concrete boundary for actor or board owner: simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Actor or Board Owner.',
          'Visible feedback for Understanding Othello AI Turns should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / Othello Play / Match Outcomes.',
          'When Understanding Othello AI Turns crosses from actor or board owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-world-context',
        title: 'Othello AI Turns World Context',
        body: [
          'Use attempted action to keep Understanding Othello AI Turns tied to Othello Play; use a related page only when the reader needs a different owner. That reading gives Understanding Othello AI Turns a public anchor for world context without adding behavior that the current category does not own. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / World Context.',
          'When Understanding Othello AI Turns touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for world context does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding Othello AI Turns should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-feedback-channel',
        title: 'Othello AI Turns Feedback Channel',
        body: [
          'If the chosen move is unavailable, the controller can fall back to a legal move or pass according to the rules. That prevents an engine issue from corrupting board state. In Understanding Othello AI Turns, feedback channel is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Feedback Channel.',
          'The surrounding context for Understanding Othello AI Turns decides which adjacent topic is relevant. Understanding Othello AI Turns should be compared with Changing Othello AI Strength, Changing Othello Book Behavior, Understanding Othello Search only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Understanding Othello AI Turns should not use feedback channel to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-edge-case',
        title: 'Othello AI Turns Edge Case',
        body: [
          'Understanding Othello AI Turns separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form. That reading gives Understanding Othello AI Turns a public anchor for edge case without adding behavior that the current category does not own. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Edge Case.',
          'Recovery or follow-up for Understanding Othello AI Turns should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'The useful result of Understanding Othello AI Turns edge case is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Outcomes.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-save-interaction',
        title: 'Othello AI Turns Save Interaction',
        body: [
          'If the available evidence for accepted state does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding Othello AI Turns should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for save interaction: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Save Interaction.',
          'The main confusion risk in Understanding Othello AI Turns is treating Othello state as My World block data. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use save interaction to keep Understanding Othello AI Turns tied to Othello Play; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-debug-evidence',
        title: 'Othello AI Turns Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. Understanding Othello AI Turns uses the fact as rejection state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Rejection State. Understanding Othello AI Turns uses the fact as debug evidence evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Debug Evidence.',
          'Reportable evidence for Understanding Othello AI Turns should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Understanding Othello AI Turns crosses from debug evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-cross-category-limit',
        title: 'Othello AI Turns Cross-Category Limit',
        body: [
          'Ownership in Understanding Othello AI Turns is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. That reading gives Understanding Othello AI Turns a public anchor for cross-category limit without adding behavior that the current category does not own. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Cross-Category Limit.',
          'Adjacent pages matter for Understanding Othello AI Turns, but adjacency does not move authority. Understanding Othello AI Turns should be compared with Changing Othello AI Strength, Changing Othello Book Behavior, Understanding Othello Search only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for cross-category limit does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding Othello AI Turns should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-related-play',
        title: 'Othello AI Turns Related Play',
        body: [
          'When Understanding Othello AI Turns crosses from rejection state into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Understanding Othello AI Turns a public anchor for related play without adding behavior that the current category does not own. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Related Play.',
          'The public boundary for Understanding Othello AI Turns is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding Othello AI Turns related play is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Outcomes.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-failure-reading',
        title: 'Othello AI Turns Failure Reading',
        body: [
          'The chosen move updates discs, clocks, messages, legal moves, and optional animation. Renderer output follows that updated match state. In Understanding Othello AI Turns, failure reading is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Failure Reading.',
          'An operator reading Understanding Othello AI Turns should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for failure reading does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Understanding Othello AI Turns should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-public-reporting',
        title: 'Othello AI Turns Public Reporting',
        body: [
          'Visible feedback for Understanding Othello AI Turns should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / Othello Play / Match Outcomes. The point matters in public reporting because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Public Reporting.',
          'Implementation limits for Understanding Othello AI Turns keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Understanding Othello AI Turns public reporting is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Outcomes.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-rule-preservation',
        title: 'Othello AI Turns Rule Preservation',
        body: [
          'When the match enters an AI turn, the controller asks the configured engine for a move using the current board, difficulty, time budget, and book settings. The point matters in rule preservation because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Rule Preservation.',
          'The summary value of Understanding Othello AI Turns is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Othello AI Turns should not use rule preservation to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-closing-check',
        title: 'Othello AI Turns Closing Check',
        body: [
          'Rule Scope defines the useful size of Understanding Othello AI Turns. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. The point matters in closing check because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Understanding Othello AI Turns / Othello Play / Match Outcomes / Closing Check.',
          'A final check for Understanding Othello AI Turns should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Understanding Othello AI Turns closing check is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Outcomes.',
        ],
      },
    ],
    relatedTitles: ['Changing Othello AI Strength', 'Changing Othello Book Behavior', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Outcomes',
    title: 'Reading Match Results',
    description:
      'Explains how Othello win, loss, draw, and pass outcomes are determined. This page treats Othello match behavior as a rule-facing guide for My World, AI NPC, and Othello behavior, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-match-results-rule-scope',
        title: 'Match Results Rule Scope',
        body: [
          'A match finishes when the board and pass rules reach a terminal state or when clock handling ends the game. The controller stores status, winner, message, and move count. That reading gives Reading Match Results a public anchor for rule scope without adding behavior that the current category does not own. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Rule Scope.',
          'Rule Scope defines the useful size of Reading Match Results. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion.',
          'If the available evidence for rule scope does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading Match Results should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-match-results-attempted-action',
        title: 'Match Results Attempted Action',
        body: [
          'Rule Scope defines the useful size of Reading Match Results. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. Reading Match Results uses the fact as attempted action evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Attempted Action.',
          'A direct observation for Reading Match Results should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state.',
          'When Reading Match Results crosses from attempted action into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-match-results-accepted-state',
        title: 'Match Results Accepted State',
        body: [
          'If the available evidence for rule scope does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading Match Results should be treated as an observation rather than a confirmed cause. In Reading Match Results, accepted state is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Accepted State.',
          'Reading Match Results separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for accepted state does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading Match Results should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-match-results-rejection-state',
        title: 'Match Results Rejection State',
        body: [
          'Reading Match Results should be read as interpretation for match results within Othello Play and Match Outcomes. Reading Match Results uses the fact as attempted action evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Attempted Action. Reading Match Results uses the fact as rejection state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Rejection State.',
          'Ownership in Reading Match Results is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions.',
          'Use rejection state to keep Reading Match Results tied to Othello Play; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-match-results-actor-or-board-owner',
        title: 'Match Results Actor or Board Owner',
        body: [
          'A direct observation for Reading Match Results should name what the user or reader actually sees before it assigns cause. That keeps the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message ahead of guesses about hidden state. Reading Match Results uses the fact as actor or board owner evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Actor or Board Owner.',
          'Visible feedback for Reading Match Results should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / Othello Play / Match Outcomes.',
          'When Reading Match Results crosses from actor or board owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-match-results-world-context',
        title: 'Match Results World Context',
        body: [
          'When Reading Match Results crosses from attempted action into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The point matters in world context because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / World Context.',
          'When Reading Match Results touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading Match Results should not use world context to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-match-results-feedback-channel',
        title: 'Match Results Feedback Channel',
        body: [
          'The winner is based on black and white disc counts after the final position. A tied count produces a draw result rather than assigning a side by preference. In Reading Match Results, accepted state is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Accepted State. That reading gives Reading Match Results a public anchor for feedback channel without adding behavior that the current category does not own. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Feedback Channel.',
          'The surrounding context for Reading Match Results decides which adjacent topic is relevant. Reading Match Results should be compared with Placing an Othello Move, Reading Saved Othello State, Understanding Othello Setting Persistence only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Reading Match Results feedback channel is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Outcomes.',
        ],
      },
      {
        id: 'reading-match-results-edge-case',
        title: 'Match Results Edge Case',
        body: [
          'Reading Match Results separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form. In Reading Match Results, edge case is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Edge Case.',
          'Recovery or follow-up for Reading Match Results should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Reading Match Results should not use edge case to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-match-results-save-interaction',
        title: 'Match Results Save Interaction',
        body: [
          'If the available evidence for accepted state does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading Match Results should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for save interaction: the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Save Interaction.',
          'The main confusion risk in Reading Match Results is treating Othello state as My World block data. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the save interaction part of Reading Match Results should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-match-results-debug-evidence',
        title: 'Match Results Debug Evidence',
        body: [
          'The relevant state is constrained by the article category: Gameplay treats this topic as simulation-facing behavior. Reading Match Results uses the fact as rejection state evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Rejection State. Reading Match Results uses the fact as debug evidence evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Debug Evidence.',
          'Reportable evidence for Reading Match Results should be small, concrete, and public. the mode, position, selected item, target block or square, actor health, accepted move, rejected move, and controller message is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use debug evidence to keep Reading Match Results tied to Othello Play; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-match-results-cross-category-limit',
        title: 'Match Results Cross-Category Limit',
        body: [
          'Ownership in Reading Match Results is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains simulation state, play-space state, actor state, board state, and the session step that applies accepted actions. That reading gives Reading Match Results a public anchor for cross-category limit without adding behavior that the current category does not own. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Cross-Category Limit.',
          'Adjacent pages matter for Reading Match Results, but adjacency does not move authority. Reading Match Results should be compared with Placing an Othello Move, Reading Saved Othello State, Understanding Othello Setting Persistence only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Reading Match Results cross-category limit is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Match Outcomes.',
        ],
      },
      {
        id: 'reading-match-results-related-play',
        title: 'Match Results Related Play',
        body: [
          'Use rejection state to keep Reading Match Results tied to Othello Play; use a related page only when the reader needs a different owner. That reading gives Reading Match Results a public anchor for related play without adding behavior that the current category does not own. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Related Play.',
          'The public boundary for Reading Match Results is part of the article, not an afterthought. It does not turn gameplay symptoms into renderer changes, saved-file schema changes, license permissions, or public security disclosures. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for related play does not identify simulation state, play-space state, actor state, board state, and the session step that applies accepted actions, Reading Match Results should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-match-results-failure-reading',
        title: 'Match Results Failure Reading',
        body: [
          'Saved Othello state includes the board, settings, clocks, legal move state, animations, and message. Reading a result from a save should go through the Othello schema. Reading Match Results uses the fact as actor or board owner evidence, then keeps the explanation inside Gameplay rather than turning it into a project-wide claim. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Actor or Board Owner. In Reading Match Results, failure reading is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Failure Reading.',
          'An operator reading Reading Match Results should follow gameplay reading starts with the attempted action, checks the domain rule that accepts or rejects it, and only then compares visible feedback. That order prevents a visible result from being treated as the first source of truth.',
          'Reading Match Results should not use failure reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-match-results-public-reporting',
        title: 'Match Results Public Reporting',
        body: [
          'Visible feedback for Reading Match Results should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Gameplay / Othello Play / Match Outcomes. The point matters in public reporting because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Public Reporting.',
          'Implementation limits for Reading Match Results keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Reading Match Results should not use public reporting to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-match-results-rule-preservation',
        title: 'Match Results Rule Preservation',
        body: [
          'A match finishes when the board and pass rules reach a terminal state or when clock handling ends the game. The controller stores status, winner, message, and move count. In Reading Match Results, rule preservation is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Rule Preservation.',
          'The summary value of Reading Match Results is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Reading Match Results should not use rule preservation to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-match-results-closing-check',
        title: 'Match Results Closing Check',
        body: [
          'Rule Scope defines the useful size of Reading Match Results. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. The point matters in closing check because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Reading Match Results / Othello Play / Match Outcomes / Closing Check.',
          'A final check for Reading Match Results should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Reading Match Results should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Placing an Othello Move', 'Reading Saved Othello State', 'Understanding Othello Setting Persistence'],
  }),
];
