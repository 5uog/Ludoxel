/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const dataPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'User Data Location',
    title: 'Locating User Data',
    description:
      'Explains where Ludoxel stores user-specific runtime state and cache files. This page treats local saved data as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'locating-user-data-data-scope',
        title: 'User Data Data Scope',
        body: [
          'Ludoxel first honors LUDOXEL_DATA_ROOT. Without that override, Windows uses LocalAppData or AppData, macOS uses Application Support, and other systems use XDG data home or a local user-data fallback. The fact also tells the reader which evidence to preserve for data scope: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Data Scope.',
          'Data Scope defines the useful size of Locating User Data. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion.',
          'Use data scope to keep Locating User Data tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'locating-user-data-file-owner',
        title: 'User Data File Owner',
        body: [
          'Data Scope defines the useful size of Locating User Data. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. For Locating User Data, that fact identifies the first concrete boundary for file owner: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / File Owner.',
          'A direct observation for Locating User Data should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'When Locating User Data crosses from file owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'locating-user-data-root-resolution',
        title: 'User Data Root Resolution',
        body: [
          'Use data scope to keep Locating User Data tied to Local and Saved Data; use a related page only when the reader needs a different owner. Locating User Data uses the fact as root resolution evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Root Resolution.',
          'Locating User Data separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form.',
          'Use root resolution to keep Locating User Data tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'locating-user-data-schema-reading',
        title: 'User Data Schema Reading',
        body: [
          'Locating User Data should be read as path resolution for user data within Local and Saved Data and User Data Location. The fact also tells the reader which evidence to preserve for schema reading: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Schema Reading.',
          'Ownership in Locating User Data is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'Use schema reading to keep Locating User Data tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'locating-user-data-state-versus-cache',
        title: 'User Data State Versus Cache',
        body: [
          'A direct observation for Locating User Data should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for state versus cache: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / State Versus Cache.',
          'Visible feedback for Locating User Data should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / User Data Location.',
          'Use state versus cache to keep Locating User Data tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'locating-user-data-privacy',
        title: 'User Data Privacy',
        body: [
          'When Locating User Data crosses from file owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Locating User Data, that fact identifies the first concrete boundary for privacy: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Privacy.',
          'When Locating User Data touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the privacy part of Locating User Data should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'locating-user-data-recovery',
        title: 'User Data Recovery',
        body: [
          'The runtime data root contains state and cache child paths. State includes saves and integrity material; cache is for data that can be rebuilt. Locating User Data uses the fact as root resolution evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Root Resolution. The fact also tells the reader which evidence to preserve for recovery: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Recovery.',
          'The surrounding context for Locating User Data decides which adjacent topic is relevant. Locating User Data should be compared with Separating User Data from Source Files, Cleaning Local User Data Safely, Reading Saved Preferences only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the recovery part of Locating User Data should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'locating-user-data-generated-output',
        title: 'User Data Generated Output',
        body: [
          'Locating User Data separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form. The point matters in generated output because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Generated Output.',
          'Recovery or follow-up for Locating User Data should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Locating User Data should not use generated output to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'locating-user-data-material-category',
        title: 'User Data Material Category',
        body: [
          'Use root resolution to keep Locating User Data tied to Local and Saved Data; use a related page only when the reader needs a different owner. The point matters in material category because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Material Category.',
          'The main confusion risk in Locating User Data is editing source files to repair private state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Locating User Data should not use material category to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'locating-user-data-corrupt-data',
        title: 'User Data Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. The fact also tells the reader which evidence to preserve for corrupt data: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Corrupt Data.',
          'Reportable evidence for Locating User Data should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the corrupt data part of Locating User Data should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'locating-user-data-report-evidence',
        title: 'User Data Report Evidence',
        body: [
          'Ownership in Locating User Data is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The point matters in report evidence because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Report Evidence.',
          'Adjacent pages matter for Locating User Data, but adjacency does not move authority. Locating User Data should be compared with Separating User Data from Source Files, Cleaning Local User Data Safely, Reading Saved Preferences only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Locating User Data should not use report evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'locating-user-data-related-data',
        title: 'User Data Related Data',
        body: [
          'Use schema reading to keep Locating User Data tied to Local and Saved Data; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for related data: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Related Data.',
          'The public boundary for Locating User Data is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use related data to keep Locating User Data tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'locating-user-data-legal-boundary',
        title: 'User Data Legal Boundary',
        body: [
          'User data location affects backups, cleanup, support evidence, and privacy. Do not assume saved files live beside the source checkout or packaged executable. The point matters in legal boundary because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Legal Boundary.',
          'An operator reading Locating User Data should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'Locating User Data should not use legal boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'locating-user-data-operator-summary',
        title: 'User Data Operator Summary',
        body: [
          'Visible feedback for Locating User Data should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / User Data Location. The point matters in operator summary because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Operator Summary.',
          'Implementation limits for Locating User Data keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Locating User Data should not use operator summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'locating-user-data-source-boundary',
        title: 'User Data Source Boundary',
        body: [
          'Ludoxel first honors LUDOXEL_DATA_ROOT. Without that override, Windows uses LocalAppData or AppData, macOS uses Application Support, and other systems use XDG data home or a local user-data fallback. In Locating User Data, source boundary is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Source Boundary.',
          'The summary value of Locating User Data is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Locating User Data should not use source boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'locating-user-data-closing-check',
        title: 'User Data Closing Check',
        body: [
          'Data Scope defines the useful size of Locating User Data. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Locating User Data / Local and Saved Data / User Data Location / Closing Check.',
          'A final check for Locating User Data should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Locating User Data should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Separating User Data from Source Files', 'Cleaning Local User Data Safely', 'Reading Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'User Data Location',
    title: 'Separating User Data from Source Files',
    description:
      'Explains the boundary between local runtime data and repository content. This page treats local saved data as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'separating-user-data-from-source-files-data-scope',
        title: 'User Data from Source Files Data Scope',
        body: [
          'Runtime data includes player state, world state, settings, integrity files, learning datasets, learned policies, user book data, and cache files. That reading gives Separating User Data from Source Files a public anchor for data scope without adding behavior that the current category does not own. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Data Scope.',
          'Data Scope defines the useful size of Separating User Data from Source Files. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion.',
          'The useful result of Separating User Data from Source Files data scope is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-file-owner',
        title: 'User Data from Source Files File Owner',
        body: [
          'Data Scope defines the useful size of Separating User Data from Source Files. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. The point matters in file owner because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / File Owner.',
          'A direct observation for Separating User Data from Source Files should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'The useful result of Separating User Data from Source Files file owner is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-root-resolution',
        title: 'User Data from Source Files Root Resolution',
        body: [
          'The useful result of Separating User Data from Source Files data scope is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location. That reading gives Separating User Data from Source Files a public anchor for root resolution without adding behavior that the current category does not own. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Root Resolution.',
          'Separating User Data from Source Files separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form.',
          'The useful result of Separating User Data from Source Files root resolution is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-schema-reading',
        title: 'User Data from Source Files Schema Reading',
        body: [
          'Separating User Data from Source Files should be read as classification for user data from source files within Local and Saved Data and User Data Location. In Separating User Data from Source Files, schema reading is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Schema Reading.',
          'Ownership in Separating User Data from Source Files is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'If the available evidence for schema reading does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Separating User Data from Source Files should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-state-versus-cache',
        title: 'User Data from Source Files State Versus Cache',
        body: [
          'A direct observation for Separating User Data from Source Files should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. The point matters in state versus cache because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / State Versus Cache.',
          'Visible feedback for Separating User Data from Source Files should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / User Data Location.',
          'Separating User Data from Source Files should not use state versus cache to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-privacy',
        title: 'User Data from Source Files Privacy',
        body: [
          'The useful result of Separating User Data from Source Files file owner is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location. The point matters in privacy because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Privacy.',
          'When Separating User Data from Source Files touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Separating User Data from Source Files privacy is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-recovery',
        title: 'User Data from Source Files Recovery',
        body: [
          'Repository source files, package resources, legal text, third-party licenses, shaders, QSS, and assets are not normal save locations. They should not be edited to clear gameplay state. In Separating User Data from Source Files, recovery is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Recovery.',
          'The surrounding context for Separating User Data from Source Files decides which adjacent topic is relevant. Separating User Data from Source Files should be compared with Locating User Data, Separating Original Materials from Output, Understanding Third Party Material Boundaries only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Separating User Data from Source Files should not use recovery to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-generated-output',
        title: 'User Data from Source Files Generated Output',
        body: [
          'Separating User Data from Source Files separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for generated output: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Generated Output.',
          'Recovery or follow-up for Separating User Data from Source Files should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use generated output to keep Separating User Data from Source Files tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-material-category',
        title: 'User Data from Source Files Material Category',
        body: [
          'The useful result of Separating User Data from Source Files root resolution is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location. The fact also tells the reader which evidence to preserve for material category: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Material Category.',
          'The main confusion risk in Separating User Data from Source Files is editing source files to repair private state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the material category part of Separating User Data from Source Files should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-corrupt-data',
        title: 'User Data from Source Files Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. In Separating User Data from Source Files, schema reading is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Schema Reading. In Separating User Data from Source Files, corrupt data is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Corrupt Data.',
          'Reportable evidence for Separating User Data from Source Files should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Separating User Data from Source Files should not use corrupt data to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-report-evidence',
        title: 'User Data from Source Files Report Evidence',
        body: [
          'Ownership in Separating User Data from Source Files is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. Separating User Data from Source Files uses the fact as report evidence evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Report Evidence.',
          'Adjacent pages matter for Separating User Data from Source Files, but adjacency does not move authority. Separating User Data from Source Files should be compared with Locating User Data, Separating Original Materials from Output, Understanding Third Party Material Boundaries only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use report evidence to keep Separating User Data from Source Files tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-related-data',
        title: 'User Data from Source Files Related Data',
        body: [
          'If the available evidence for schema reading does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Separating User Data from Source Files should be treated as an observation rather than a confirmed cause. That reading gives Separating User Data from Source Files a public anchor for related data without adding behavior that the current category does not own. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Related Data.',
          'The public boundary for Separating User Data from Source Files is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Separating User Data from Source Files related data is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-legal-boundary',
        title: 'User Data from Source Files Legal Boundary',
        body: [
          'Before deleting or sharing files, identify whether they are user state, cache, source, third-party material, or generated output. Each category has different consequences. Separating User Data from Source Files uses the fact as legal boundary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Legal Boundary.',
          'An operator reading Separating User Data from Source Files should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'When Separating User Data from Source Files crosses from legal boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-operator-summary',
        title: 'User Data from Source Files Operator Summary',
        body: [
          'Visible feedback for Separating User Data from Source Files should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / User Data Location. Separating User Data from Source Files uses the fact as operator summary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Operator Summary.',
          'Implementation limits for Separating User Data from Source Files keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Separating User Data from Source Files crosses from operator summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-source-boundary',
        title: 'User Data from Source Files Source Boundary',
        body: [
          'Runtime data includes player state, world state, settings, integrity files, learning datasets, learned policies, user book data, and cache files. For Separating User Data from Source Files, that fact identifies the first concrete boundary for source boundary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Source Boundary.',
          'The summary value of Separating User Data from Source Files is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the source boundary part of Separating User Data from Source Files should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'separating-user-data-from-source-files-closing-check',
        title: 'User Data from Source Files Closing Check',
        body: [
          'Data Scope defines the useful size of Separating User Data from Source Files. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. In Separating User Data from Source Files, closing check is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating User Data from Source Files / Local and Saved Data / User Data Location / Closing Check.',
          'A final check for Separating User Data from Source Files should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Separating User Data from Source Files should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Locating User Data', 'Separating Original Materials from Output', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'User Data Location',
    title: 'Cleaning Local User Data Safely',
    description:
      'Explains how to approach local data cleanup without confusing state and source. This page treats local saved data as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'cleaning-local-user-data-safely-data-scope',
        title: 'Local User Data Safely Data Scope',
        body: [
          'Resolve the active runtime data root before cleaning. An environment override can move all state and cache files away from the platform default location. In Cleaning Local User Data Safely, data scope is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Data Scope. In Cleaning Local User Data Safely, data scope is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Data Scope.',
          'Data Scope defines the useful size of Cleaning Local User Data Safely. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion.',
          'Cleaning Local User Data Safely should not use data scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-file-owner',
        title: 'Local User Data Safely File Owner',
        body: [
          'Data Scope defines the useful size of Cleaning Local User Data Safely. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. In Cleaning Local User Data Safely, file owner is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / File Owner.',
          'A direct observation for Cleaning Local User Data Safely should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'If the available evidence for file owner does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Cleaning Local User Data Safely should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-root-resolution',
        title: 'Local User Data Safely Root Resolution',
        body: [
          'Cleaning Local User Data Safely should not use data scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in root resolution because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Root Resolution.',
          'Cleaning Local User Data Safely separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form.',
          'The useful result of Cleaning Local User Data Safely root resolution is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-schema-reading',
        title: 'Local User Data Safely Schema Reading',
        body: [
          'Cleaning Local User Data Safely should be read as topic for cleaning local user data safely within Local and Saved Data and User Data Location. In Cleaning Local User Data Safely, file owner is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / File Owner. In Cleaning Local User Data Safely, schema reading is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Schema Reading.',
          'Ownership in Cleaning Local User Data Safely is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'Cleaning Local User Data Safely should not use schema reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-state-versus-cache',
        title: 'Local User Data Safely State Versus Cache',
        body: [
          'A direct observation for Cleaning Local User Data Safely should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. That reading gives Cleaning Local User Data Safely a public anchor for state versus cache without adding behavior that the current category does not own. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / State Versus Cache.',
          'Visible feedback for Cleaning Local User Data Safely should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / User Data Location.',
          'If the available evidence for state versus cache does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Cleaning Local User Data Safely should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-privacy',
        title: 'Local User Data Safely Privacy',
        body: [
          'If the available evidence for file owner does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Cleaning Local User Data Safely should be treated as an observation rather than a confirmed cause. The point matters in privacy because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Privacy.',
          'When Cleaning Local User Data Safely touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Cleaning Local User Data Safely should not use privacy to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-recovery',
        title: 'Local User Data Safely Recovery',
        body: [
          'State files preserve worlds, preferences, AI actors, policies, datasets, and book data. Cache files are designed to be rebuilt, but deleting them can still affect startup work. In Cleaning Local User Data Safely, recovery is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Recovery.',
          'The surrounding context for Cleaning Local User Data Safely decides which adjacent topic is relevant. Cleaning Local User Data Safely should be compared with Locating User Data, Reading Saved World State, Reading Saved AI State only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for recovery does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Cleaning Local User Data Safely should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-generated-output',
        title: 'Local User Data Safely Generated Output',
        body: [
          'Cleaning Local User Data Safely separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form. Cleaning Local User Data Safely uses the fact as generated output evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Generated Output.',
          'Recovery or follow-up for Cleaning Local User Data Safely should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use generated output to keep Cleaning Local User Data Safely tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-material-category',
        title: 'Local User Data Safely Material Category',
        body: [
          'The useful result of Cleaning Local User Data Safely root resolution is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location. Cleaning Local User Data Safely uses the fact as material category evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Material Category.',
          'The main confusion risk in Cleaning Local User Data Safely is editing source files to repair private state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Cleaning Local User Data Safely crosses from material category into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-corrupt-data',
        title: 'Local User Data Safely Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. In Cleaning Local User Data Safely, schema reading is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Schema Reading. The point matters in corrupt data because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Corrupt Data.',
          'Reportable evidence for Cleaning Local User Data Safely should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Cleaning Local User Data Safely should not use corrupt data to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-report-evidence',
        title: 'Local User Data Safely Report Evidence',
        body: [
          'Ownership in Cleaning Local User Data Safely is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. Cleaning Local User Data Safely uses the fact as report evidence evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Report Evidence.',
          'Adjacent pages matter for Cleaning Local User Data Safely, but adjacency does not move authority. Cleaning Local User Data Safely should be compared with Locating User Data, Reading Saved World State, Reading Saved AI State only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Cleaning Local User Data Safely crosses from report evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-related-data',
        title: 'Local User Data Safely Related Data',
        body: [
          'Cleaning Local User Data Safely should not use schema reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Cleaning Local User Data Safely, related data is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Related Data.',
          'The public boundary for Cleaning Local User Data Safely is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Cleaning Local User Data Safely should not use related data to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-legal-boundary',
        title: 'Local User Data Safely Legal Boundary',
        body: [
          'Back up user data before removing it. Public reports should describe the cleanup scope instead of attaching private save files or local integrity keys. Cleaning Local User Data Safely uses the fact as legal boundary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Legal Boundary.',
          'An operator reading Cleaning Local User Data Safely should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'Use legal boundary to keep Cleaning Local User Data Safely tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-operator-summary',
        title: 'Local User Data Safely Operator Summary',
        body: [
          'Visible feedback for Cleaning Local User Data Safely should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / User Data Location. For Cleaning Local User Data Safely, that fact identifies the first concrete boundary for operator summary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Operator Summary.',
          'Implementation limits for Cleaning Local User Data Safely keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Cleaning Local User Data Safely crosses from operator summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-source-boundary',
        title: 'Local User Data Safely Source Boundary',
        body: [
          'Resolve the active runtime data root before cleaning. An environment override can move all state and cache files away from the platform default location. In Cleaning Local User Data Safely, data scope is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Data Scope. For Cleaning Local User Data Safely, that fact identifies the first concrete boundary for source boundary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Source Boundary.',
          'The summary value of Cleaning Local User Data Safely is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Cleaning Local User Data Safely crosses from source boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'cleaning-local-user-data-safely-closing-check',
        title: 'Local User Data Safely Closing Check',
        body: [
          'Data Scope defines the useful size of Cleaning Local User Data Safely. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. The point matters in closing check because reading files below the runtime data root can otherwise be mistaken for editing source files to repair private state. The local reading frame is Cleaning Local User Data Safely / Local and Saved Data / User Data Location / Closing Check.',
          'A final check for Cleaning Local User Data Safely should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Cleaning Local User Data Safely closing check is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside User Data Location.',
        ],
      },
    ],
    relatedTitles: ['Locating User Data', 'Reading Saved World State', 'Reading Saved AI State'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved Preferences',
    description:
      'Explains the settings data stored in Ludoxel player state. This page treats runtime preferences as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-saved-preferences-data-scope',
        title: 'Saved Preferences Data Scope',
        body: [
          'Saved preferences are part of the player state file rather than the world block file. They are decoded through the settings schema before runtime use. That reading gives Reading Saved Preferences a public anchor for data scope without adding behavior that the current category does not own. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Data Scope.',
          'Data Scope defines the useful size of Reading Saved Preferences. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion.',
          'If the available evidence for data scope does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Preferences should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-preferences-file-owner',
        title: 'Saved Preferences File Owner',
        body: [
          'Data Scope defines the useful size of Reading Saved Preferences. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion. The point matters in file owner because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / File Owner.',
          'A direct observation for Reading Saved Preferences should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'Reading Saved Preferences should not use file owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-preferences-root-resolution',
        title: 'Saved Preferences Root Resolution',
        body: [
          'If the available evidence for data scope does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Preferences should be treated as an observation rather than a confirmed cause. In Reading Saved Preferences, root resolution is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Root Resolution.',
          'Reading Saved Preferences separates the surface that accepts input from the component or document that controls the result. This is especially important when changing normalized user values crosses a saved value, a renderer output, or a public form.',
          'Reading Saved Preferences should not use root resolution to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-preferences-schema-reading',
        title: 'Saved Preferences Schema Reading',
        body: [
          'Reading Saved Preferences should be read as interpretation for saved preferences within Local and Saved Data and Saved Runtime State. The point matters in schema reading because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Schema Reading.',
          'Ownership in Reading Saved Preferences is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'The useful result of Reading Saved Preferences schema reading is a bounded explanation of runtime preferences: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State.',
        ],
      },
      {
        id: 'reading-saved-preferences-state-versus-cache',
        title: 'Saved Preferences State Versus Cache',
        body: [
          'A direct observation for Reading Saved Preferences should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. That reading gives Reading Saved Preferences a public anchor for state versus cache without adding behavior that the current category does not own. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / State Versus Cache.',
          'Visible feedback for Reading Saved Preferences should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / Saved Runtime State.',
          'If the available evidence for state versus cache does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Preferences should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-preferences-privacy',
        title: 'Saved Preferences Privacy',
        body: [
          'Reading Saved Preferences should not use file owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in privacy because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Privacy.',
          'When Reading Saved Preferences touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading Saved Preferences should not use privacy to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-preferences-recovery',
        title: 'Saved Preferences Recovery',
        body: [
          'The schema covers camera, display, window, movement, audio, keybinds, crosshair, clouds, shadows, skins, names, Othello settings, hotbars, and related runtime values. In Reading Saved Preferences, root resolution is the difference between reading runtime preferences and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Root Resolution. The point matters in recovery because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Recovery.',
          'The surrounding context for Reading Saved Preferences decides which adjacent topic is relevant. Reading Saved Preferences should be compared with Understanding Saved Preferences, Changing Camera Preferences, Changing Audio Preferences only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Reading Saved Preferences should not use recovery to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-preferences-generated-output',
        title: 'Saved Preferences Generated Output',
        body: [
          'Reading Saved Preferences separates the surface that accepts input from the component or document that controls the result. This is especially important when changing normalized user values crosses a saved value, a renderer output, or a public form. For Reading Saved Preferences, that fact identifies the first concrete boundary for generated output: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Generated Output.',
          'Recovery or follow-up for Reading Saved Preferences should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Reading Saved Preferences crosses from generated output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-preferences-material-category',
        title: 'Saved Preferences Material Category',
        body: [
          'Reading Saved Preferences should not use root resolution to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. Reading Saved Preferences uses the fact as material category evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Material Category.',
          'The main confusion risk in Reading Saved Preferences is treating a settings control as unrelated to persistence. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Reading Saved Preferences crosses from material category into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-preferences-corrupt-data',
        title: 'Saved Preferences Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. The point matters in corrupt data because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Corrupt Data.',
          'Reportable evidence for Reading Saved Preferences should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Reading Saved Preferences should not use corrupt data to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-preferences-report-evidence',
        title: 'Saved Preferences Report Evidence',
        body: [
          'Ownership in Reading Saved Preferences is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The fact also tells the reader which evidence to preserve for report evidence: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Report Evidence.',
          'Adjacent pages matter for Reading Saved Preferences, but adjacency does not move authority. Reading Saved Preferences should be compared with Understanding Saved Preferences, Changing Camera Preferences, Changing Audio Preferences only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use report evidence to keep Reading Saved Preferences tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-preferences-related-data',
        title: 'Saved Preferences Related Data',
        body: [
          'The useful result of Reading Saved Preferences schema reading is a bounded explanation of runtime preferences: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State. The point matters in related data because changing normalized user values can otherwise be mistaken for treating a settings control as unrelated to persistence. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Related Data.',
          'The public boundary for Reading Saved Preferences is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Reading Saved Preferences related data is a bounded explanation of runtime preferences: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State.',
        ],
      },
      {
        id: 'reading-saved-preferences-legal-boundary',
        title: 'Saved Preferences Legal Boundary',
        body: [
          'Manual file edits can be normalized or ignored if invalid. Use the application settings surfaces when possible, and keep private paths out of public reports. The fact also tells the reader which evidence to preserve for legal boundary: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Legal Boundary.',
          'An operator reading Reading Saved Preferences should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the legal boundary part of Reading Saved Preferences should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-saved-preferences-operator-summary',
        title: 'Saved Preferences Operator Summary',
        body: [
          'Visible feedback for Reading Saved Preferences should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / Saved Runtime State. For Reading Saved Preferences, that fact identifies the first concrete boundary for operator summary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Operator Summary.',
          'Implementation limits for Reading Saved Preferences keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Reading Saved Preferences crosses from operator summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-preferences-source-boundary',
        title: 'Saved Preferences Source Boundary',
        body: [
          'Saved preferences are part of the player state file rather than the world block file. They are decoded through the settings schema before runtime use. For Reading Saved Preferences, that fact identifies the first concrete boundary for source boundary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Source Boundary.',
          'The summary value of Reading Saved Preferences is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Reading Saved Preferences crosses from source boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-preferences-closing-check',
        title: 'Saved Preferences Closing Check',
        body: [
          'Data Scope defines the useful size of Reading Saved Preferences. The article should be broad enough to explain runtime preferences, but narrow enough that treating a settings control as unrelated to persistence remains outside the conclusion. That reading gives Reading Saved Preferences a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Reading Saved Preferences / Local and Saved Data / Saved Runtime State / Closing Check.',
          'A final check for Reading Saved Preferences should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Preferences should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Understanding Saved Preferences', 'Changing Camera Preferences', 'Changing Audio Preferences'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved World State',
    description:
      'Explains how world blocks and revisions are persisted. This page treats local saved data as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-saved-world-state-data-scope',
        title: 'Saved World State Data Scope',
        body: [
          'World state stores a revision and block entries. Loading reconstructs WorldState objects used by simulation rather than renderer-ready mesh data. The fact also tells the reader which evidence to preserve for data scope: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Data Scope.',
          'Data Scope defines the useful size of Reading Saved World State. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion.',
          'Use data scope to keep Reading Saved World State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-world-state-file-owner',
        title: 'Saved World State File Owner',
        body: [
          'Data Scope defines the useful size of Reading Saved World State. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. The fact also tells the reader which evidence to preserve for file owner: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / File Owner.',
          'A direct observation for Reading Saved World State should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'A public report based on the file owner part of Reading Saved World State should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-saved-world-state-root-resolution',
        title: 'Saved World State Root Resolution',
        body: [
          'Use data scope to keep Reading Saved World State tied to Local and Saved Data; use a related page only when the reader needs a different owner. Reading Saved World State uses the fact as root resolution evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Root Resolution.',
          'Reading Saved World State separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form.',
          'Use root resolution to keep Reading Saved World State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-world-state-schema-reading',
        title: 'Saved World State Schema Reading',
        body: [
          'Reading Saved World State should be read as interpretation for saved world state within Local and Saved Data and Saved Runtime State. The fact also tells the reader which evidence to preserve for schema reading: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Schema Reading.',
          'Ownership in Reading Saved World State is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'Use schema reading to keep Reading Saved World State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-world-state-state-versus-cache',
        title: 'Saved World State State Versus Cache',
        body: [
          'A direct observation for Reading Saved World State should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. Reading Saved World State uses the fact as state versus cache evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / State Versus Cache.',
          'Visible feedback for Reading Saved World State should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / Saved Runtime State.',
          'When Reading Saved World State crosses from state versus cache into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-world-state-privacy',
        title: 'Saved World State Privacy',
        body: [
          'A public report based on the file owner part of Reading Saved World State should state the action, expected result, actual result, environment, and any redaction needed before sharing. Reading Saved World State uses the fact as privacy evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Privacy.',
          'When Reading Saved World State touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Reading Saved World State crosses from privacy into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-world-state-recovery',
        title: 'Saved World State Recovery',
        body: [
          'The world file can contain play-space data for My World and Othello. My World stores its block world, player, and AI state; Othello stores its own play-space state. Reading Saved World State uses the fact as root resolution evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Root Resolution. For Reading Saved World State, that fact identifies the first concrete boundary for recovery: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Recovery.',
          'The surrounding context for Reading Saved World State decides which adjacent topic is relevant. Reading Saved World State should be compared with Building in My World, Cleaning Local User Data Safely, Understanding User-Created Materials only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Reading Saved World State crosses from recovery into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-world-state-generated-output',
        title: 'Saved World State Generated Output',
        body: [
          'Reading Saved World State separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form. In Reading Saved World State, generated output is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Generated Output.',
          'Recovery or follow-up for Reading Saved World State should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for generated output does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved World State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-world-state-material-category',
        title: 'Saved World State Material Category',
        body: [
          'Use root resolution to keep Reading Saved World State tied to Local and Saved Data; use a related page only when the reader needs a different owner. In Reading Saved World State, material category is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Material Category.',
          'The main confusion risk in Reading Saved World State is editing source files to repair private state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for material category does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved World State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-world-state-corrupt-data',
        title: 'Saved World State Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. The fact also tells the reader which evidence to preserve for corrupt data: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Corrupt Data.',
          'Reportable evidence for Reading Saved World State should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the corrupt data part of Reading Saved World State should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-saved-world-state-report-evidence',
        title: 'Saved World State Report Evidence',
        body: [
          'Ownership in Reading Saved World State is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. That reading gives Reading Saved World State a public anchor for report evidence without adding behavior that the current category does not own. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Report Evidence.',
          'Adjacent pages matter for Reading Saved World State, but adjacency does not move authority. Reading Saved World State should be compared with Building in My World, Cleaning Local User Data Safely, Understanding User-Created Materials only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Reading Saved World State report evidence is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State.',
        ],
      },
      {
        id: 'reading-saved-world-state-related-data',
        title: 'Saved World State Related Data',
        body: [
          'Use schema reading to keep Reading Saved World State tied to Local and Saved Data; use a related page only when the reader needs a different owner. Reading Saved World State uses the fact as related data evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Related Data.',
          'The public boundary for Reading Saved World State is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Reading Saved World State crosses from related data into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-world-state-legal-boundary',
        title: 'Saved World State Legal Boundary',
        body: [
          'World revision helps downstream systems detect changed state. It is not a user-facing version number and should not be edited to force renderer behavior. Reading Saved World State uses the fact as state versus cache evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / State Versus Cache. In Reading Saved World State, legal boundary is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Legal Boundary.',
          'An operator reading Reading Saved World State should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for legal boundary does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved World State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-world-state-operator-summary',
        title: 'Saved World State Operator Summary',
        body: [
          'Visible feedback for Reading Saved World State should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / Saved Runtime State. That reading gives Reading Saved World State a public anchor for operator summary without adding behavior that the current category does not own. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Operator Summary.',
          'Implementation limits for Reading Saved World State keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Reading Saved World State operator summary is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State.',
        ],
      },
      {
        id: 'reading-saved-world-state-source-boundary',
        title: 'Saved World State Source Boundary',
        body: [
          'World state stores a revision and block entries. Loading reconstructs WorldState objects used by simulation rather than renderer-ready mesh data. That reading gives Reading Saved World State a public anchor for source boundary without adding behavior that the current category does not own. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Source Boundary.',
          'The summary value of Reading Saved World State is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for source boundary does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved World State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-world-state-closing-check',
        title: 'Saved World State Closing Check',
        body: [
          'Data Scope defines the useful size of Reading Saved World State. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. For Reading Saved World State, that fact identifies the first concrete boundary for closing check: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved World State / Local and Saved Data / Saved Runtime State / Closing Check.',
          'A final check for Reading Saved World State should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Reading Saved World State crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Building in My World', 'Cleaning Local User Data Safely', 'Understanding User-Created Materials'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved AI State',
    description:
      'Explains the fields Ludoxel stores for AI actors. This page treats local saved data as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-saved-ai-state-data-scope',
        title: 'Saved AI State Data Scope',
        body: [
          'AI state stores actor id, mode, personality, placement permission, held item, display name, health indicator, skin source, and optional custom skin id. Reading Saved AI State uses the fact as data scope evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Data Scope. Reading Saved AI State uses the fact as data scope evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Data Scope.',
          'Data Scope defines the useful size of Reading Saved AI State. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion.',
          'Use data scope to keep Reading Saved AI State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-ai-state-file-owner',
        title: 'Saved AI State File Owner',
        body: [
          'Data Scope defines the useful size of Reading Saved AI State. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. For Reading Saved AI State, that fact identifies the first concrete boundary for file owner: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / File Owner.',
          'A direct observation for Reading Saved AI State should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'A public report based on the file owner part of Reading Saved AI State should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-saved-ai-state-root-resolution',
        title: 'Saved AI State Root Resolution',
        body: [
          'Use data scope to keep Reading Saved AI State tied to Local and Saved Data; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for root resolution: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Root Resolution.',
          'Reading Saved AI State separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form.',
          'Use root resolution to keep Reading Saved AI State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-ai-state-schema-reading',
        title: 'Saved AI State Schema Reading',
        body: [
          'Reading Saved AI State should be read as interpretation for saved ai state within Local and Saved Data and Saved Runtime State. For Reading Saved AI State, that fact identifies the first concrete boundary for schema reading: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Schema Reading.',
          'Ownership in Reading Saved AI State is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'When Reading Saved AI State crosses from schema reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-ai-state-state-versus-cache',
        title: 'Saved AI State State Versus Cache',
        body: [
          'A direct observation for Reading Saved AI State should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. Reading Saved AI State uses the fact as state versus cache evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / State Versus Cache.',
          'Visible feedback for Reading Saved AI State should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / Saved Runtime State.',
          'Use state versus cache to keep Reading Saved AI State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-ai-state-privacy',
        title: 'Saved AI State Privacy',
        body: [
          'A public report based on the file owner part of Reading Saved AI State should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for privacy: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Privacy.',
          'When Reading Saved AI State touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the privacy part of Reading Saved AI State should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-saved-ai-state-recovery',
        title: 'Saved AI State Recovery',
        body: [
          'Saved state also records position, velocity, yaw, pitch, health, maximum health, on-ground state, flying state, regeneration, and route information. The fact also tells the reader which evidence to preserve for recovery: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Recovery.',
          'The surrounding context for Reading Saved AI State decides which adjacent topic is relevant. Reading Saved AI State should be compared with Naming an AI NPC, Choosing an AI Skin Source, Reading Learned Policies only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use recovery to keep Reading Saved AI State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-ai-state-generated-output',
        title: 'Saved AI State Generated Output',
        body: [
          'Reading Saved AI State separates the surface that accepts input from the component or document that controls the result. This is especially important when reading files below the runtime data root crosses a saved value, a renderer output, or a public form. That reading gives Reading Saved AI State a public anchor for generated output without adding behavior that the current category does not own. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Generated Output.',
          'Recovery or follow-up for Reading Saved AI State should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for generated output does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved AI State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-ai-state-material-category',
        title: 'Saved AI State Material Category',
        body: [
          'Use root resolution to keep Reading Saved AI State tied to Local and Saved Data; use a related page only when the reader needs a different owner. That reading gives Reading Saved AI State a public anchor for material category without adding behavior that the current category does not own. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Material Category.',
          'The main confusion risk in Reading Saved AI State is editing source files to repair private state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for material category does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved AI State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-ai-state-corrupt-data',
        title: 'Saved AI State Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. Reading Saved AI State uses the fact as corrupt data evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Corrupt Data.',
          'Reportable evidence for Reading Saved AI State should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Reading Saved AI State crosses from corrupt data into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-ai-state-report-evidence',
        title: 'Saved AI State Report Evidence',
        body: [
          'Ownership in Reading Saved AI State is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. In Reading Saved AI State, report evidence is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Report Evidence.',
          'Adjacent pages matter for Reading Saved AI State, but adjacency does not move authority. Reading Saved AI State should be compared with Naming an AI NPC, Choosing an AI Skin Source, Reading Learned Policies only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Reading Saved AI State should not use report evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-ai-state-related-data',
        title: 'Saved AI State Related Data',
        body: [
          'When Reading Saved AI State crosses from schema reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Reading Saved AI State, that fact identifies the first concrete boundary for related data: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Related Data.',
          'The public boundary for Reading Saved AI State is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Reading Saved AI State crosses from related data into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-ai-state-legal-boundary',
        title: 'Saved AI State Legal Boundary',
        body: [
          'Loading normalizes invalid values, reassigns conflicting names when needed, and falls back for missing custom skins. The save file should not be treated as trusted executable input. Reading Saved AI State uses the fact as state versus cache evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / State Versus Cache. That reading gives Reading Saved AI State a public anchor for legal boundary without adding behavior that the current category does not own. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Legal Boundary.',
          'An operator reading Reading Saved AI State should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for legal boundary does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved AI State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-ai-state-operator-summary',
        title: 'Saved AI State Operator Summary',
        body: [
          'Visible feedback for Reading Saved AI State should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / Saved Runtime State. In Reading Saved AI State, operator summary is the difference between reading local saved data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Operator Summary.',
          'Implementation limits for Reading Saved AI State keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Reading Saved AI State should not use operator summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-ai-state-source-boundary',
        title: 'Saved AI State Source Boundary',
        body: [
          'AI state stores actor id, mode, personality, placement permission, held item, display name, health indicator, skin source, and optional custom skin id. Reading Saved AI State uses the fact as data scope evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Data Scope. That reading gives Reading Saved AI State a public anchor for source boundary without adding behavior that the current category does not own. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Source Boundary.',
          'The summary value of Reading Saved AI State is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Reading Saved AI State source boundary is a bounded explanation of local saved data: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State.',
        ],
      },
      {
        id: 'reading-saved-ai-state-closing-check',
        title: 'Saved AI State Closing Check',
        body: [
          'Data Scope defines the useful size of Reading Saved AI State. The article should be broad enough to explain local saved data, but narrow enough that editing source files to repair private state remains outside the conclusion. Reading Saved AI State uses the fact as closing check evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved AI State / Local and Saved Data / Saved Runtime State / Closing Check.',
          'A final check for Reading Saved AI State should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Reading Saved AI State crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
    ],
    relatedTitles: ['Naming an AI NPC', 'Choosing an AI Skin Source', 'Reading Learned Policies'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved Othello State',
    description:
      'Explains the persisted Othello board, match, and book-related state. This page treats Othello match behavior as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-saved-othello-state-data-scope',
        title: 'Saved Othello State Data Scope',
        body: [
          'Saved Othello state includes board contents, match status, settings, sides, clocks, move count, passes, winner, messages, legal moves, animations, and thinking state. In Reading Saved Othello State, data scope is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Data Scope. In Reading Saved Othello State, data scope is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Data Scope.',
          'Data Scope defines the useful size of Reading Saved Othello State. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion.',
          'If the available evidence for data scope does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Othello State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-othello-state-file-owner',
        title: 'Saved Othello State File Owner',
        body: [
          'Data Scope defines the useful size of Reading Saved Othello State. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. That reading gives Reading Saved Othello State a public anchor for file owner without adding behavior that the current category does not own. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / File Owner.',
          'A direct observation for Reading Saved Othello State should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'If the available evidence for file owner does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Othello State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-othello-state-root-resolution',
        title: 'Saved Othello State Root Resolution',
        body: [
          'If the available evidence for data scope does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Othello State should be treated as an observation rather than a confirmed cause. In Reading Saved Othello State, root resolution is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Root Resolution.',
          'Reading Saved Othello State separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for root resolution does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Othello State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-othello-state-schema-reading',
        title: 'Saved Othello State Schema Reading',
        body: [
          'Reading Saved Othello State should be read as interpretation for saved othello state within Local and Saved Data and Saved Runtime State. The point matters in schema reading because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Schema Reading.',
          'Ownership in Reading Saved Othello State is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'Reading Saved Othello State should not use schema reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-othello-state-state-versus-cache',
        title: 'Saved Othello State State Versus Cache',
        body: [
          'A direct observation for Reading Saved Othello State should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. In Reading Saved Othello State, state versus cache is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / State Versus Cache.',
          'Visible feedback for Reading Saved Othello State should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / Saved Runtime State.',
          'If the available evidence for state versus cache does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Othello State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-othello-state-privacy',
        title: 'Saved Othello State Privacy',
        body: [
          'If the available evidence for file owner does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Othello State should be treated as an observation rather than a confirmed cause. That reading gives Reading Saved Othello State a public anchor for privacy without adding behavior that the current category does not own. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Privacy.',
          'When Reading Saved Othello State touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for privacy does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Othello State should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-saved-othello-state-recovery',
        title: 'Saved Othello State Recovery',
        body: [
          'The Othello play space also carries its player, world, and AI player data. That lets Othello persist as a full play space rather than only a board grid. In Reading Saved Othello State, root resolution is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Root Resolution. In Reading Saved Othello State, recovery is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Recovery.',
          'The surrounding context for Reading Saved Othello State decides which adjacent topic is relevant. Reading Saved Othello State should be compared with Reading Match Results, Understanding Othello Setting Persistence, Changing Othello Book Behavior only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Reading Saved Othello State should not use recovery to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-saved-othello-state-generated-output',
        title: 'Saved Othello State Generated Output',
        body: [
          'Reading Saved Othello State separates the surface that accepts input from the component or document that controls the result. This is especially important when reading board turns, move legality, and engine state crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for generated output: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Generated Output.',
          'Recovery or follow-up for Reading Saved Othello State should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use generated output to keep Reading Saved Othello State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-othello-state-material-category',
        title: 'Saved Othello State Material Category',
        body: [
          'If the available evidence for root resolution does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Saved Othello State should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for material category: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Material Category.',
          'The main confusion risk in Reading Saved Othello State is treating Othello state as My World block data. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the material category part of Reading Saved Othello State should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-saved-othello-state-corrupt-data',
        title: 'Saved Othello State Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. The point matters in corrupt data because reading board turns, move legality, and engine state can otherwise be mistaken for treating Othello state as My World block data. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Corrupt Data.',
          'Reportable evidence for Reading Saved Othello State should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Reading Saved Othello State corrupt data is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State.',
        ],
      },
      {
        id: 'reading-saved-othello-state-report-evidence',
        title: 'Saved Othello State Report Evidence',
        body: [
          'Ownership in Reading Saved Othello State is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The fact also tells the reader which evidence to preserve for report evidence: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Report Evidence.',
          'Adjacent pages matter for Reading Saved Othello State, but adjacency does not move authority. Reading Saved Othello State should be compared with Reading Match Results, Understanding Othello Setting Persistence, Changing Othello Book Behavior only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the report evidence part of Reading Saved Othello State should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-saved-othello-state-related-data',
        title: 'Saved Othello State Related Data',
        body: [
          'Reading Saved Othello State should not use schema reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Reading Saved Othello State a public anchor for related data without adding behavior that the current category does not own. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Related Data.',
          'The public boundary for Reading Saved Othello State is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Reading Saved Othello State related data is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State.',
        ],
      },
      {
        id: 'reading-saved-othello-state-legal-boundary',
        title: 'Saved Othello State Legal Boundary',
        body: [
          'User opening-book data is stored through application hooks and user data paths. Bundled book resources remain package data and should not be rewritten by normal play. In Reading Saved Othello State, state versus cache is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / State Versus Cache. The fact also tells the reader which evidence to preserve for legal boundary: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Legal Boundary.',
          'An operator reading Reading Saved Othello State should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'Use legal boundary to keep Reading Saved Othello State tied to Local and Saved Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-saved-othello-state-operator-summary',
        title: 'Saved Othello State Operator Summary',
        body: [
          'Visible feedback for Reading Saved Othello State should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Local and Saved Data / Saved Runtime State. For Reading Saved Othello State, that fact identifies the first concrete boundary for operator summary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Operator Summary.',
          'Implementation limits for Reading Saved Othello State keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the operator summary part of Reading Saved Othello State should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-saved-othello-state-source-boundary',
        title: 'Saved Othello State Source Boundary',
        body: [
          'Saved Othello state includes board contents, match status, settings, sides, clocks, move count, passes, winner, messages, legal moves, animations, and thinking state. In Reading Saved Othello State, data scope is the difference between reading Othello match behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Data Scope. Reading Saved Othello State uses the fact as source boundary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Source Boundary.',
          'The summary value of Reading Saved Othello State is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Reading Saved Othello State crosses from source boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-saved-othello-state-closing-check',
        title: 'Saved Othello State Closing Check',
        body: [
          'Data Scope defines the useful size of Reading Saved Othello State. The article should be broad enough to explain Othello match behavior, but narrow enough that treating Othello state as My World block data remains outside the conclusion. That reading gives Reading Saved Othello State a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Reading Saved Othello State / Local and Saved Data / Saved Runtime State / Closing Check.',
          'A final check for Reading Saved Othello State should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Reading Saved Othello State closing check is a bounded explanation of Othello match behavior: enough detail to act, and enough restraint to avoid claims outside Saved Runtime State.',
        ],
      },
    ],
    relatedTitles: ['Reading Match Results', 'Understanding Othello Setting Persistence', 'Changing Othello Book Behavior'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Reading Demonstration Data',
    description:
      'Explains the JSONL demonstration records used by AI learning. This page treats demonstration data as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-demonstration-data-data-scope',
        title: 'Demonstration Data Data Scope',
        body: [
          'Demonstrations are stored as JSONL rows under the learning dataset path for the selected dataset id. Legacy dataset locations can be read for compatibility. In Reading Demonstration Data, data scope is the difference between reading demonstration data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Data Scope. In Reading Demonstration Data, data scope is the difference between reading demonstration data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Data Scope.',
          'Data Scope defines the useful size of Reading Demonstration Data. The article should be broad enough to explain demonstration data, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion.',
          'If the available evidence for data scope does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Demonstration Data should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-demonstration-data-file-owner',
        title: 'Demonstration Data File Owner',
        body: [
          'Data Scope defines the useful size of Reading Demonstration Data. The article should be broad enough to explain demonstration data, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. In Reading Demonstration Data, file owner is the difference between reading demonstration data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / File Owner.',
          'A direct observation for Reading Demonstration Data should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'Reading Demonstration Data should not use file owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-demonstration-data-root-resolution',
        title: 'Demonstration Data Root Resolution',
        body: [
          'If the available evidence for data scope does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Demonstration Data should be treated as an observation rather than a confirmed cause. That reading gives Reading Demonstration Data a public anchor for root resolution without adding behavior that the current category does not own. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Root Resolution.',
          'Reading Demonstration Data separates the surface that accepts input from the component or document that controls the result. This is especially important when reading demonstration data in its documented category crosses a saved value, a renderer output, or a public form.',
          'The useful result of Reading Demonstration Data root resolution is a bounded explanation of demonstration data: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts.',
        ],
      },
      {
        id: 'reading-demonstration-data-schema-reading',
        title: 'Demonstration Data Schema Reading',
        body: [
          'Reading Demonstration Data should be read as interpretation for demonstration data within Learning and Material Data and Learning Artifacts. In Reading Demonstration Data, file owner is the difference between reading demonstration data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / File Owner. In Reading Demonstration Data, schema reading is the difference between reading demonstration data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Schema Reading.',
          'Ownership in Reading Demonstration Data is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'If the available evidence for schema reading does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Demonstration Data should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-demonstration-data-state-versus-cache',
        title: 'Demonstration Data State Versus Cache',
        body: [
          'A direct observation for Reading Demonstration Data should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. The point matters in state versus cache because reading demonstration data in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / State Versus Cache.',
          'Visible feedback for Reading Demonstration Data should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Learning Artifacts.',
          'Reading Demonstration Data should not use state versus cache to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-demonstration-data-privacy',
        title: 'Demonstration Data Privacy',
        body: [
          'Reading Demonstration Data should not use file owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Reading Demonstration Data, privacy is the difference between reading demonstration data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Privacy.',
          'When Reading Demonstration Data touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading Demonstration Data should not use privacy to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-demonstration-data-recovery',
        title: 'Demonstration Data Recovery',
        body: [
          'Rows can describe player movement, combat, placement, breaking, parkour, trap behavior, AI decisions, failures, deaths, route failures, and escape attempts. That reading gives Reading Demonstration Data a public anchor for recovery without adding behavior that the current category does not own. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Recovery.',
          'The surrounding context for Reading Demonstration Data decides which adjacent topic is relevant. Reading Demonstration Data should be compared with Understanding AI Learning Records, Training a Policy, Handling Corrupt Learning Rows only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for recovery does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Demonstration Data should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-demonstration-data-generated-output',
        title: 'Demonstration Data Generated Output',
        body: [
          'Reading Demonstration Data separates the surface that accepts input from the component or document that controls the result. This is especially important when reading demonstration data in its documented category crosses a saved value, a renderer output, or a public form. For Reading Demonstration Data, that fact identifies the first concrete boundary for generated output: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Generated Output.',
          'Recovery or follow-up for Reading Demonstration Data should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the generated output part of Reading Demonstration Data should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-demonstration-data-material-category',
        title: 'Demonstration Data Material Category',
        body: [
          'The useful result of Reading Demonstration Data root resolution is a bounded explanation of demonstration data: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts. For Reading Demonstration Data, that fact identifies the first concrete boundary for material category: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Material Category.',
          'The main confusion risk in Reading Demonstration Data is moving the topic outside its confirmed boundary. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Reading Demonstration Data crosses from material category into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-demonstration-data-corrupt-data',
        title: 'Demonstration Data Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. In Reading Demonstration Data, schema reading is the difference between reading demonstration data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Schema Reading. The point matters in corrupt data because reading demonstration data in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Corrupt Data.',
          'Reportable evidence for Reading Demonstration Data should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Reading Demonstration Data corrupt data is a bounded explanation of demonstration data: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts.',
        ],
      },
      {
        id: 'reading-demonstration-data-report-evidence',
        title: 'Demonstration Data Report Evidence',
        body: [
          'Ownership in Reading Demonstration Data is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The fact also tells the reader which evidence to preserve for report evidence: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Report Evidence.',
          'Adjacent pages matter for Reading Demonstration Data, but adjacency does not move authority. Reading Demonstration Data should be compared with Understanding AI Learning Records, Training a Policy, Handling Corrupt Learning Rows only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the report evidence part of Reading Demonstration Data should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-demonstration-data-related-data',
        title: 'Demonstration Data Related Data',
        body: [
          'If the available evidence for schema reading does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Demonstration Data should be treated as an observation rather than a confirmed cause. That reading gives Reading Demonstration Data a public anchor for related data without adding behavior that the current category does not own. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Related Data.',
          'The public boundary for Reading Demonstration Data is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Reading Demonstration Data related data is a bounded explanation of demonstration data: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts.',
        ],
      },
      {
        id: 'reading-demonstration-data-legal-boundary',
        title: 'Demonstration Data Legal Boundary',
        body: [
          'Demonstration rows are user data. Review them before sharing because they may reveal local play behavior, names, positions, or other context from a private session. Reading Demonstration Data uses the fact as legal boundary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Legal Boundary.',
          'An operator reading Reading Demonstration Data should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'When Reading Demonstration Data crosses from legal boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-demonstration-data-operator-summary',
        title: 'Demonstration Data Operator Summary',
        body: [
          'Visible feedback for Reading Demonstration Data should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Learning Artifacts. The fact also tells the reader which evidence to preserve for operator summary: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Operator Summary.',
          'Implementation limits for Reading Demonstration Data keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use operator summary to keep Reading Demonstration Data tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-demonstration-data-source-boundary',
        title: 'Demonstration Data Source Boundary',
        body: [
          'Demonstrations are stored as JSONL rows under the learning dataset path for the selected dataset id. Legacy dataset locations can be read for compatibility. In Reading Demonstration Data, data scope is the difference between reading demonstration data and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Data Scope. Reading Demonstration Data uses the fact as source boundary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Source Boundary.',
          'The summary value of Reading Demonstration Data is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Reading Demonstration Data crosses from source boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-demonstration-data-closing-check',
        title: 'Demonstration Data Closing Check',
        body: [
          'Data Scope defines the useful size of Reading Demonstration Data. The article should be broad enough to explain demonstration data, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. The point matters in closing check because reading demonstration data in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Demonstration Data / Learning and Material Data / Learning Artifacts / Closing Check.',
          'A final check for Reading Demonstration Data should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Demonstration Data should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Understanding AI Learning Records', 'Training a Policy', 'Handling Corrupt Learning Rows'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Reading Learned Policies',
    description:
      'Explains the structure and usability checks for saved learned policies. This page treats learned policies as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-learned-policies-data-scope',
        title: 'Learned Policies Data Scope',
        body: [
          'Policy artifacts store policy id, name, schema version, compatibility target, feature encoder version, action catalog version, weights, negative modifiers, evaluation, and policy version. The point matters in data scope because reading learned policies in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Data Scope.',
          'Data Scope defines the useful size of Reading Learned Policies. The article should be broad enough to explain learned policies, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion.',
          'The useful result of Reading Learned Policies data scope is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts.',
        ],
      },
      {
        id: 'reading-learned-policies-file-owner',
        title: 'Learned Policies File Owner',
        body: [
          'Data Scope defines the useful size of Reading Learned Policies. The article should be broad enough to explain learned policies, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. That reading gives Reading Learned Policies a public anchor for file owner without adding behavior that the current category does not own. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / File Owner.',
          'A direct observation for Reading Learned Policies should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'The useful result of Reading Learned Policies file owner is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts.',
        ],
      },
      {
        id: 'reading-learned-policies-root-resolution',
        title: 'Learned Policies Root Resolution',
        body: [
          'The useful result of Reading Learned Policies data scope is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts. The point matters in root resolution because reading learned policies in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Root Resolution.',
          'Reading Learned Policies separates the surface that accepts input from the component or document that controls the result. This is especially important when reading learned policies in its documented category crosses a saved value, a renderer output, or a public form.',
          'The useful result of Reading Learned Policies root resolution is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts.',
        ],
      },
      {
        id: 'reading-learned-policies-schema-reading',
        title: 'Learned Policies Schema Reading',
        body: [
          'Reading Learned Policies should be read as interpretation for learned policies within Learning and Material Data and Learning Artifacts. The point matters in schema reading because reading learned policies in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Schema Reading.',
          'Ownership in Reading Learned Policies is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'The useful result of Reading Learned Policies schema reading is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts.',
        ],
      },
      {
        id: 'reading-learned-policies-state-versus-cache',
        title: 'Learned Policies State Versus Cache',
        body: [
          'A direct observation for Reading Learned Policies should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. In Reading Learned Policies, state versus cache is the difference between reading learned policies and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / State Versus Cache.',
          'Visible feedback for Reading Learned Policies should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Learning Artifacts.',
          'Reading Learned Policies should not use state versus cache to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-learned-policies-privacy',
        title: 'Learned Policies Privacy',
        body: [
          'The useful result of Reading Learned Policies file owner is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts. The point matters in privacy because reading learned policies in its documented category can otherwise be mistaken for moving the topic outside its confirmed boundary. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Privacy.',
          'When Reading Learned Policies touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading Learned Policies should not use privacy to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-learned-policies-recovery',
        title: 'Learned Policies Recovery',
        body: [
          'Bundled policies come from package resources, and user policies come from user data. The registry returns only usable policies or falls back to the deterministic baseline. In Reading Learned Policies, recovery is the difference between reading learned policies and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Recovery.',
          'The surrounding context for Reading Learned Policies decides which adjacent topic is relevant. Reading Learned Policies should be compared with Applying a Learned Policy, Understanding Policy Evaluation, Training a Policy only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for recovery does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Learned Policies should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-learned-policies-generated-output',
        title: 'Learned Policies Generated Output',
        body: [
          'Reading Learned Policies separates the surface that accepts input from the component or document that controls the result. This is especially important when reading learned policies in its documented category crosses a saved value, a renderer output, or a public form. For Reading Learned Policies, that fact identifies the first concrete boundary for generated output: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Generated Output.',
          'Recovery or follow-up for Reading Learned Policies should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Reading Learned Policies crosses from generated output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-learned-policies-material-category',
        title: 'Learned Policies Material Category',
        body: [
          'The useful result of Reading Learned Policies root resolution is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts. For Reading Learned Policies, that fact identifies the first concrete boundary for material category: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Material Category.',
          'The main confusion risk in Reading Learned Policies is moving the topic outside its confirmed boundary. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the material category part of Reading Learned Policies should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-learned-policies-corrupt-data',
        title: 'Learned Policies Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. That reading gives Reading Learned Policies a public anchor for corrupt data without adding behavior that the current category does not own. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Corrupt Data.',
          'Reportable evidence for Reading Learned Policies should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Reading Learned Policies corrupt data is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts.',
        ],
      },
      {
        id: 'reading-learned-policies-report-evidence',
        title: 'Learned Policies Report Evidence',
        body: [
          'Ownership in Reading Learned Policies is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The fact also tells the reader which evidence to preserve for report evidence: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Report Evidence.',
          'Adjacent pages matter for Reading Learned Policies, but adjacency does not move authority. Reading Learned Policies should be compared with Applying a Learned Policy, Understanding Policy Evaluation, Training a Policy only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use report evidence to keep Reading Learned Policies tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-learned-policies-related-data',
        title: 'Learned Policies Related Data',
        body: [
          'The useful result of Reading Learned Policies schema reading is a bounded explanation of learned policies: enough detail to act, and enough restraint to avoid claims outside Learning Artifacts. In Reading Learned Policies, related data is the difference between reading learned policies and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Related Data.',
          'The public boundary for Reading Learned Policies is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Reading Learned Policies should not use related data to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-learned-policies-legal-boundary',
        title: 'Learned Policies Legal Boundary',
        body: [
          'A policy without a passing evaluation is stored data, not live behavior. Inspect the evaluation report before assuming a learned policy is affecting AI. In Reading Learned Policies, state versus cache is the difference between reading learned policies and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / State Versus Cache. For Reading Learned Policies, that fact identifies the first concrete boundary for legal boundary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Legal Boundary.',
          'An operator reading Reading Learned Policies should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'When Reading Learned Policies crosses from legal boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-learned-policies-operator-summary',
        title: 'Learned Policies Operator Summary',
        body: [
          'Visible feedback for Reading Learned Policies should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Learning Artifacts. Reading Learned Policies uses the fact as operator summary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Operator Summary.',
          'Implementation limits for Reading Learned Policies keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use operator summary to keep Reading Learned Policies tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-learned-policies-source-boundary',
        title: 'Learned Policies Source Boundary',
        body: [
          'Policy artifacts store policy id, name, schema version, compatibility target, feature encoder version, action catalog version, weights, negative modifiers, evaluation, and policy version. The fact also tells the reader which evidence to preserve for source boundary: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Source Boundary.',
          'The summary value of Reading Learned Policies is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the source boundary part of Reading Learned Policies should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-learned-policies-closing-check',
        title: 'Learned Policies Closing Check',
        body: [
          'Data Scope defines the useful size of Reading Learned Policies. The article should be broad enough to explain learned policies, but narrow enough that moving the topic outside its confirmed boundary remains outside the conclusion. That reading gives Reading Learned Policies a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Reading Learned Policies / Learning and Material Data / Learning Artifacts / Closing Check.',
          'A final check for Reading Learned Policies should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Reading Learned Policies should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Applying a Learned Policy', 'Understanding Policy Evaluation', 'Training a Policy'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Handling Corrupt Learning Rows',
    description:
      'Explains how Ludoxel keeps a damaged learning dataset usable. This page treats AI policy and search behavior as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'handling-corrupt-learning-rows-data-scope',
        title: 'Corrupt Learning Rows Data Scope',
        body: [
          'Learning datasets are decoded row by row. Empty, malformed, or invalid rows are skipped instead of crashing the whole dataset load. In Handling Corrupt Learning Rows, data scope is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Data Scope. In Handling Corrupt Learning Rows, data scope is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Data Scope.',
          'Data Scope defines the useful size of Handling Corrupt Learning Rows. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion.',
          'Handling Corrupt Learning Rows should not use data scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-file-owner',
        title: 'Corrupt Learning Rows File Owner',
        body: [
          'Data Scope defines the useful size of Handling Corrupt Learning Rows. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. The point matters in file owner because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / File Owner.',
          'A direct observation for Handling Corrupt Learning Rows should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'Handling Corrupt Learning Rows should not use file owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-root-resolution',
        title: 'Corrupt Learning Rows Root Resolution',
        body: [
          'Handling Corrupt Learning Rows should not use data scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. That reading gives Handling Corrupt Learning Rows a public anchor for root resolution without adding behavior that the current category does not own. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Root Resolution.',
          'Handling Corrupt Learning Rows separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for root resolution does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Handling Corrupt Learning Rows should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-schema-reading',
        title: 'Corrupt Learning Rows Schema Reading',
        body: [
          'Handling Corrupt Learning Rows should be read as topic for handling corrupt learning rows within Learning and Material Data and Learning Artifacts. That reading gives Handling Corrupt Learning Rows a public anchor for schema reading without adding behavior that the current category does not own. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Schema Reading.',
          'Ownership in Handling Corrupt Learning Rows is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'If the available evidence for schema reading does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Handling Corrupt Learning Rows should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-state-versus-cache',
        title: 'Corrupt Learning Rows State Versus Cache',
        body: [
          'A direct observation for Handling Corrupt Learning Rows should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. In Handling Corrupt Learning Rows, state versus cache is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / State Versus Cache.',
          'Visible feedback for Handling Corrupt Learning Rows should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Learning Artifacts.',
          'Handling Corrupt Learning Rows should not use state versus cache to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-privacy',
        title: 'Corrupt Learning Rows Privacy',
        body: [
          'Handling Corrupt Learning Rows should not use file owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Handling Corrupt Learning Rows, privacy is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Privacy.',
          'When Handling Corrupt Learning Rows touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for privacy does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Handling Corrupt Learning Rows should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-recovery',
        title: 'Corrupt Learning Rows Recovery',
        body: [
          'The store tracks how many corrupt lines were encountered, and training reports that number. Valid records can still train a policy if enough useful data remains. The point matters in recovery because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Recovery.',
          'The surrounding context for Handling Corrupt Learning Rows decides which adjacent topic is relevant. Handling Corrupt Learning Rows should be compared with Reading Demonstration Data, Training a Policy, Understanding AI Learning Records only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Handling Corrupt Learning Rows should not use recovery to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-generated-output',
        title: 'Corrupt Learning Rows Generated Output',
        body: [
          'Handling Corrupt Learning Rows separates the surface that accepts input from the component or document that controls the result. This is especially important when reading decision records and generated artifacts crosses a saved value, a renderer output, or a public form. For Handling Corrupt Learning Rows, that fact identifies the first concrete boundary for generated output: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Generated Output.',
          'Recovery or follow-up for Handling Corrupt Learning Rows should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Handling Corrupt Learning Rows crosses from generated output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-material-category',
        title: 'Corrupt Learning Rows Material Category',
        body: [
          'If the available evidence for root resolution does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Handling Corrupt Learning Rows should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for material category: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Material Category.',
          'The main confusion risk in Handling Corrupt Learning Rows is treating learning files as general user content. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use material category to keep Handling Corrupt Learning Rows tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-corrupt-data',
        title: 'Corrupt Learning Rows Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. The point matters in corrupt data because reading decision records and generated artifacts can otherwise be mistaken for treating learning files as general user content. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Corrupt Data.',
          'Reportable evidence for Handling Corrupt Learning Rows should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Handling Corrupt Learning Rows should not use corrupt data to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-report-evidence',
        title: 'Corrupt Learning Rows Report Evidence',
        body: [
          'Ownership in Handling Corrupt Learning Rows is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. Handling Corrupt Learning Rows uses the fact as report evidence evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Report Evidence.',
          'Adjacent pages matter for Handling Corrupt Learning Rows, but adjacency does not move authority. Handling Corrupt Learning Rows should be compared with Reading Demonstration Data, Training a Policy, Understanding AI Learning Records only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Handling Corrupt Learning Rows crosses from report evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-related-data',
        title: 'Corrupt Learning Rows Related Data',
        body: [
          'If the available evidence for schema reading does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Handling Corrupt Learning Rows should be treated as an observation rather than a confirmed cause. In Handling Corrupt Learning Rows, related data is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Related Data.',
          'The public boundary for Handling Corrupt Learning Rows is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Handling Corrupt Learning Rows should not use related data to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-legal-boundary',
        title: 'Corrupt Learning Rows Legal Boundary',
        body: [
          'When cleaning a dataset, work on a backup and preserve the JSONL format. Do not post the full dataset publicly unless you have checked it for private play data. In Handling Corrupt Learning Rows, state versus cache is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / State Versus Cache. For Handling Corrupt Learning Rows, that fact identifies the first concrete boundary for legal boundary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Legal Boundary.',
          'An operator reading Handling Corrupt Learning Rows should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'When Handling Corrupt Learning Rows crosses from legal boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-operator-summary',
        title: 'Corrupt Learning Rows Operator Summary',
        body: [
          'Visible feedback for Handling Corrupt Learning Rows should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Learning Artifacts. Handling Corrupt Learning Rows uses the fact as operator summary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Operator Summary.',
          'Implementation limits for Handling Corrupt Learning Rows keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use operator summary to keep Handling Corrupt Learning Rows tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-source-boundary',
        title: 'Corrupt Learning Rows Source Boundary',
        body: [
          'Learning datasets are decoded row by row. Empty, malformed, or invalid rows are skipped instead of crashing the whole dataset load. In Handling Corrupt Learning Rows, data scope is the difference between reading AI policy and search behavior and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Data Scope. Handling Corrupt Learning Rows uses the fact as source boundary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Source Boundary.',
          'The summary value of Handling Corrupt Learning Rows is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use source boundary to keep Handling Corrupt Learning Rows tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-closing-check',
        title: 'Corrupt Learning Rows Closing Check',
        body: [
          'Data Scope defines the useful size of Handling Corrupt Learning Rows. The article should be broad enough to explain AI policy and search behavior, but narrow enough that treating learning files as general user content remains outside the conclusion. That reading gives Handling Corrupt Learning Rows a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Handling Corrupt Learning Rows / Learning and Material Data / Learning Artifacts / Closing Check.',
          'A final check for Handling Corrupt Learning Rows should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Handling Corrupt Learning Rows should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Reading Demonstration Data', 'Training a Policy', 'Understanding AI Learning Records'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding Application Output',
    description:
      'Defines ordinary output created while using Ludoxel. This page treats material classification as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-application-output-data-scope',
        title: 'Application Output Data Scope',
        body: [
          'Application output can include save files, settings, logs, screenshots, recordings, rendered views, user-created worlds, and other products of ordinary application use. In Understanding Application Output, data scope is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Data Scope. In Understanding Application Output, data scope is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Data Scope.',
          'Data Scope defines the useful size of Understanding Application Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'The useful result of Understanding Application Output data scope is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'understanding-application-output-file-owner',
        title: 'Application Output File Owner',
        body: [
          'Data Scope defines the useful size of Understanding Application Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. The point matters in file owner because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / File Owner.',
          'A direct observation for Understanding Application Output should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'The useful result of Understanding Application Output file owner is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'understanding-application-output-root-resolution',
        title: 'Application Output Root Resolution',
        body: [
          'The useful result of Understanding Application Output data scope is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries. That reading gives Understanding Application Output a public anchor for root resolution without adding behavior that the current category does not own. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Root Resolution.',
          'Understanding Application Output separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding Application Output root resolution is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'understanding-application-output-schema-reading',
        title: 'Application Output Schema Reading',
        body: [
          'Understanding Application Output should be read as conceptual boundary for application output within Learning and Material Data and Output and Material Boundaries. In Understanding Application Output, schema reading is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Schema Reading.',
          'Ownership in Understanding Application Output is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'If the available evidence for schema reading does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Understanding Application Output should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-application-output-state-versus-cache',
        title: 'Application Output State Versus Cache',
        body: [
          'A direct observation for Understanding Application Output should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. That reading gives Understanding Application Output a public anchor for state versus cache without adding behavior that the current category does not own. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / State Versus Cache.',
          'Visible feedback for Understanding Application Output should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Output and Material Boundaries.',
          'The useful result of Understanding Application Output state versus cache is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'understanding-application-output-privacy',
        title: 'Application Output Privacy',
        body: [
          'The useful result of Understanding Application Output file owner is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries. In Understanding Application Output, privacy is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Privacy.',
          'When Understanding Application Output touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding Application Output should not use privacy to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-application-output-recovery',
        title: 'Application Output Recovery',
        body: [
          'Output is distinct from repository source, packaged assets, legal text, and third-party material. Embedded protected content or third-party content can still carry restrictions. That reading gives Understanding Application Output a public anchor for recovery without adding behavior that the current category does not own. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Recovery.',
          'The surrounding context for Understanding Application Output decides which adjacent topic is relevant. Understanding Application Output should be compared with Understanding Generated Output, Separating Original Materials from Output, Supplying Logs Without Secrets only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for recovery does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Understanding Application Output should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-application-output-generated-output',
        title: 'Application Output Generated Output',
        body: [
          'Understanding Application Output separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for generated output: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Generated Output.',
          'Recovery or follow-up for Understanding Application Output should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use generated output to keep Understanding Application Output tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-application-output-material-category',
        title: 'Application Output Material Category',
        body: [
          'The useful result of Understanding Application Output root resolution is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries. The fact also tells the reader which evidence to preserve for material category: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Material Category.',
          'The main confusion risk in Understanding Application Output is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the material category part of Understanding Application Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-application-output-corrupt-data',
        title: 'Application Output Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. In Understanding Application Output, schema reading is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Schema Reading. That reading gives Understanding Application Output a public anchor for corrupt data without adding behavior that the current category does not own. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Corrupt Data.',
          'Reportable evidence for Understanding Application Output should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for corrupt data does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Understanding Application Output should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-application-output-report-evidence',
        title: 'Application Output Report Evidence',
        body: [
          'Ownership in Understanding Application Output is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. For Understanding Application Output, that fact identifies the first concrete boundary for report evidence: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Report Evidence.',
          'Adjacent pages matter for Understanding Application Output, but adjacency does not move authority. Understanding Application Output should be compared with Understanding Generated Output, Separating Original Materials from Output, Supplying Logs Without Secrets only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Understanding Application Output crosses from report evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-application-output-related-data',
        title: 'Application Output Related Data',
        body: [
          'If the available evidence for schema reading does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Understanding Application Output should be treated as an observation rather than a confirmed cause. That reading gives Understanding Application Output a public anchor for related data without adding behavior that the current category does not own. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Related Data.',
          'The public boundary for Understanding Application Output is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding Application Output related data is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'understanding-application-output-legal-boundary',
        title: 'Application Output Legal Boundary',
        body: [
          'Before sharing output, consider privacy, third-party rights, and the license. Public support channels should receive only the minimal non-sensitive evidence needed. Understanding Application Output uses the fact as legal boundary evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Legal Boundary.',
          'An operator reading Understanding Application Output should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'When Understanding Application Output crosses from legal boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-application-output-operator-summary',
        title: 'Application Output Operator Summary',
        body: [
          'Visible feedback for Understanding Application Output should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Output and Material Boundaries. For Understanding Application Output, that fact identifies the first concrete boundary for operator summary: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Operator Summary.',
          'Implementation limits for Understanding Application Output keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the operator summary part of Understanding Application Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-application-output-source-boundary',
        title: 'Application Output Source Boundary',
        body: [
          'Application output can include save files, settings, logs, screenshots, recordings, rendered views, user-created worlds, and other products of ordinary application use. In Understanding Application Output, data scope is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Data Scope. The fact also tells the reader which evidence to preserve for source boundary: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Source Boundary.',
          'The summary value of Understanding Application Output is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use source boundary to keep Understanding Application Output tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-application-output-closing-check',
        title: 'Application Output Closing Check',
        body: [
          'Data Scope defines the useful size of Understanding Application Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. The point matters in closing check because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Application Output / Learning and Material Data / Output and Material Boundaries / Closing Check.',
          'A final check for Understanding Application Output should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Application Output should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Understanding Generated Output', 'Separating Original Materials from Output', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding User-Created Materials',
    description:
      'Explains how user-created materials differ from Ludoxel original materials. This page treats material classification as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-user-created-materials-data-scope',
        title: 'User-Created Materials Data Scope',
        body: [
          'User-created materials are content a user makes through ordinary use, such as custom worlds, skins, screenshots, recordings, or other outputs that are not copied from Ludoxel original materials. For Understanding User-Created Materials, that fact identifies the first concrete boundary for data scope: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Data Scope.',
          'Data Scope defines the useful size of Understanding User-Created Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'When Understanding User-Created Materials crosses from data scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-user-created-materials-file-owner',
        title: 'User-Created Materials File Owner',
        body: [
          'Data Scope defines the useful size of Understanding User-Created Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. The fact also tells the reader which evidence to preserve for file owner: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / File Owner.',
          'A direct observation for Understanding User-Created Materials should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'Use file owner to keep Understanding User-Created Materials tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-user-created-materials-root-resolution',
        title: 'User-Created Materials Root Resolution',
        body: [
          'When Understanding User-Created Materials crosses from data scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Understanding User-Created Materials, that fact identifies the first concrete boundary for root resolution: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Root Resolution.',
          'Understanding User-Created Materials separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'A public report based on the root resolution part of Understanding User-Created Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-user-created-materials-schema-reading',
        title: 'User-Created Materials Schema Reading',
        body: [
          'Understanding User-Created Materials should be read as conceptual boundary for user-created materials within Learning and Material Data and Output and Material Boundaries. For Understanding User-Created Materials, that fact identifies the first concrete boundary for schema reading: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Schema Reading.',
          'Ownership in Understanding User-Created Materials is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'When Understanding User-Created Materials crosses from schema reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-user-created-materials-state-versus-cache',
        title: 'User-Created Materials State Versus Cache',
        body: [
          'A direct observation for Understanding User-Created Materials should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. For Understanding User-Created Materials, that fact identifies the first concrete boundary for state versus cache: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / State Versus Cache.',
          'Visible feedback for Understanding User-Created Materials should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Output and Material Boundaries.',
          'When Understanding User-Created Materials crosses from state versus cache into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-user-created-materials-privacy',
        title: 'User-Created Materials Privacy',
        body: [
          'Use file owner to keep Understanding User-Created Materials tied to Learning and Material Data; use a related page only when the reader needs a different owner. For Understanding User-Created Materials, that fact identifies the first concrete boundary for privacy: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Privacy.',
          'When Understanding User-Created Materials touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Understanding User-Created Materials crosses from privacy into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-user-created-materials-recovery',
        title: 'User-Created Materials Recovery',
        body: [
          'A file can contain both user-created expression and protected project or third-party material. The presence of user work does not remove rights attached to embedded material. For Understanding User-Created Materials, that fact identifies the first concrete boundary for recovery: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Recovery.',
          'The surrounding context for Understanding User-Created Materials decides which adjacent topic is relevant. Understanding User-Created Materials should be compared with Understanding Application Output, Understanding Ordinary Application Use, Separating Original Materials from Output only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the recovery part of Understanding User-Created Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-user-created-materials-generated-output',
        title: 'User-Created Materials Generated Output',
        body: [
          'Understanding User-Created Materials separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. In Understanding User-Created Materials, generated output is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Generated Output.',
          'Recovery or follow-up for Understanding User-Created Materials should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Understanding User-Created Materials should not use generated output to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-user-created-materials-material-category',
        title: 'User-Created Materials Material Category',
        body: [
          'A public report based on the root resolution part of Understanding User-Created Materials should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Understanding User-Created Materials, material category is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Material Category.',
          'The main confusion risk in Understanding User-Created Materials is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Understanding User-Created Materials should not use material category to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-user-created-materials-corrupt-data',
        title: 'User-Created Materials Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. Understanding User-Created Materials uses the fact as corrupt data evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Corrupt Data.',
          'Reportable evidence for Understanding User-Created Materials should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Understanding User-Created Materials crosses from corrupt data into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-user-created-materials-report-evidence',
        title: 'User-Created Materials Report Evidence',
        body: [
          'Ownership in Understanding User-Created Materials is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. That reading gives Understanding User-Created Materials a public anchor for report evidence without adding behavior that the current category does not own. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Report Evidence.',
          'Adjacent pages matter for Understanding User-Created Materials, but adjacency does not move authority. Understanding User-Created Materials should be compared with Understanding Application Output, Understanding Ordinary Application Use, Separating Original Materials from Output only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for report evidence does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Understanding User-Created Materials should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-user-created-materials-related-data',
        title: 'User-Created Materials Related Data',
        body: [
          'When Understanding User-Created Materials crosses from schema reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Understanding User-Created Materials, that fact identifies the first concrete boundary for related data: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Related Data.',
          'The public boundary for Understanding User-Created Materials is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Understanding User-Created Materials crosses from related data into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-user-created-materials-legal-boundary',
        title: 'User-Created Materials Legal Boundary',
        body: [
          'Treat user-created files as user data for privacy and backup purposes, while still checking license and third-party constraints before public sharing or redistribution. In Understanding User-Created Materials, legal boundary is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Legal Boundary.',
          'An operator reading Understanding User-Created Materials should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'Understanding User-Created Materials should not use legal boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-user-created-materials-operator-summary',
        title: 'User-Created Materials Operator Summary',
        body: [
          'Visible feedback for Understanding User-Created Materials should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Output and Material Boundaries. In Understanding User-Created Materials, operator summary is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Operator Summary.',
          'Implementation limits for Understanding User-Created Materials keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Understanding User-Created Materials should not use operator summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-user-created-materials-source-boundary',
        title: 'User-Created Materials Source Boundary',
        body: [
          'User-created materials are content a user makes through ordinary use, such as custom worlds, skins, screenshots, recordings, or other outputs that are not copied from Ludoxel original materials. That reading gives Understanding User-Created Materials a public anchor for source boundary without adding behavior that the current category does not own. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Source Boundary.',
          'The summary value of Understanding User-Created Materials is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Understanding User-Created Materials source boundary is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'understanding-user-created-materials-closing-check',
        title: 'User-Created Materials Closing Check',
        body: [
          'Data Scope defines the useful size of Understanding User-Created Materials. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Understanding User-Created Materials / Learning and Material Data / Output and Material Boundaries / Closing Check.',
          'A final check for Understanding User-Created Materials should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding User-Created Materials tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Understanding Application Output', 'Understanding Ordinary Application Use', 'Separating Original Materials from Output'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Separating Original Materials from Output',
    description:
      'Explains how to distinguish Ludoxel original materials from ordinary output. This page treats material classification as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'separating-original-materials-from-output-data-scope',
        title: 'Original Materials from Output Data Scope',
        body: [
          'Original materials include Ludoxel source code, documentation, project assets, package resources, shaders, QSS, and other project-created repository or distribution content. The fact also tells the reader which evidence to preserve for data scope: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Data Scope.',
          'Data Scope defines the useful size of Separating Original Materials from Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'Use data scope to keep Separating Original Materials from Output tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-file-owner',
        title: 'Original Materials from Output File Owner',
        body: [
          'Data Scope defines the useful size of Separating Original Materials from Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. For Separating Original Materials from Output, that fact identifies the first concrete boundary for file owner: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / File Owner.',
          'A direct observation for Separating Original Materials from Output should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'When Separating Original Materials from Output crosses from file owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-root-resolution',
        title: 'Original Materials from Output Root Resolution',
        body: [
          'Use data scope to keep Separating Original Materials from Output tied to Learning and Material Data; use a related page only when the reader needs a different owner. Separating Original Materials from Output uses the fact as root resolution evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Root Resolution.',
          'Separating Original Materials from Output separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'Use root resolution to keep Separating Original Materials from Output tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-schema-reading',
        title: 'Original Materials from Output Schema Reading',
        body: [
          'Separating Original Materials from Output should be read as classification for original materials from output within Learning and Material Data and Output and Material Boundaries. Separating Original Materials from Output uses the fact as schema reading evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Schema Reading.',
          'Ownership in Separating Original Materials from Output is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'When Separating Original Materials from Output crosses from schema reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-state-versus-cache',
        title: 'Original Materials from Output State Versus Cache',
        body: [
          'A direct observation for Separating Original Materials from Output should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for state versus cache: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / State Versus Cache.',
          'Visible feedback for Separating Original Materials from Output should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Output and Material Boundaries.',
          'Use state versus cache to keep Separating Original Materials from Output tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-privacy',
        title: 'Original Materials from Output Privacy',
        body: [
          'When Separating Original Materials from Output crosses from file owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Separating Original Materials from Output, that fact identifies the first concrete boundary for privacy: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Privacy.',
          'When Separating Original Materials from Output touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the privacy part of Separating Original Materials from Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-recovery',
        title: 'Original Materials from Output Recovery',
        body: [
          'Ordinary output is produced by running and using the application, such as save data, screenshots, recordings, logs, or user-created world content. Separating Original Materials from Output uses the fact as root resolution evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Root Resolution. The fact also tells the reader which evidence to preserve for recovery: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Recovery.',
          'The surrounding context for Separating Original Materials from Output decides which adjacent topic is relevant. Separating Original Materials from Output should be compared with Understanding Original Materials, Understanding Generated Output, Understanding Third Party Material Boundaries only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the recovery part of Separating Original Materials from Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-generated-output',
        title: 'Original Materials from Output Generated Output',
        body: [
          'Separating Original Materials from Output separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. The point matters in generated output because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Generated Output.',
          'Recovery or follow-up for Separating Original Materials from Output should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Separating Original Materials from Output should not use generated output to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-material-category',
        title: 'Original Materials from Output Material Category',
        body: [
          'Use root resolution to keep Separating Original Materials from Output tied to Learning and Material Data; use a related page only when the reader needs a different owner. The point matters in material category because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Material Category.',
          'The main confusion risk in Separating Original Materials from Output is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Separating Original Materials from Output should not use material category to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-corrupt-data',
        title: 'Original Materials from Output Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. Separating Original Materials from Output uses the fact as schema reading evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Schema Reading. For Separating Original Materials from Output, that fact identifies the first concrete boundary for corrupt data: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Corrupt Data.',
          'Reportable evidence for Separating Original Materials from Output should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Separating Original Materials from Output crosses from corrupt data into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-report-evidence',
        title: 'Original Materials from Output Report Evidence',
        body: [
          'Ownership in Separating Original Materials from Output is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. That reading gives Separating Original Materials from Output a public anchor for report evidence without adding behavior that the current category does not own. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Report Evidence.',
          'Adjacent pages matter for Separating Original Materials from Output, but adjacency does not move authority. Separating Original Materials from Output should be compared with Understanding Original Materials, Understanding Generated Output, Understanding Third Party Material Boundaries only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Separating Original Materials from Output report evidence is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-related-data',
        title: 'Original Materials from Output Related Data',
        body: [
          'When Separating Original Materials from Output crosses from schema reading into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Separating Original Materials from Output, that fact identifies the first concrete boundary for related data: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Related Data.',
          'The public boundary for Separating Original Materials from Output is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the related data part of Separating Original Materials from Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-legal-boundary',
        title: 'Original Materials from Output Legal Boundary',
        body: [
          'The distinction matters for sharing, cleanup, attribution, and support. Output can be shareable in ways original materials are not, but embedded protected content still matters. The point matters in legal boundary because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Legal Boundary.',
          'An operator reading Separating Original Materials from Output should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'Separating Original Materials from Output should not use legal boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-operator-summary',
        title: 'Original Materials from Output Operator Summary',
        body: [
          'Visible feedback for Separating Original Materials from Output should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Output and Material Boundaries. In Separating Original Materials from Output, operator summary is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Operator Summary.',
          'Implementation limits for Separating Original Materials from Output keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for operator summary does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Separating Original Materials from Output should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-source-boundary',
        title: 'Original Materials from Output Source Boundary',
        body: [
          'Original materials include Ludoxel source code, documentation, project assets, package resources, shaders, QSS, and other project-created repository or distribution content. The point matters in source boundary because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Source Boundary.',
          'The summary value of Separating Original Materials from Output is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Separating Original Materials from Output source boundary is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'separating-original-materials-from-output-closing-check',
        title: 'Original Materials from Output Closing Check',
        body: [
          'Data Scope defines the useful size of Separating Original Materials from Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Separating Original Materials from Output / Learning and Material Data / Output and Material Boundaries / Closing Check.',
          'A final check for Separating Original Materials from Output should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Separating Original Materials from Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Understanding Original Materials', 'Understanding Generated Output', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding Third Party Material Boundaries',
    description:
      'Explains where third-party material and its license text fit in Ludoxel. This page treats material classification as a local-data guide for saved state, generated output, caches, learning artifacts, and material categories, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-third-party-material-boundaries-data-scope',
        title: 'Third Party Material Boundaries Data Scope',
        body: [
          'Third-party license text is kept under third-party material paths, such as the Kaisei Opti font license file. Those terms remain separate from the Ludoxel license. Understanding Third Party Material Boundaries uses the fact as data scope evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Data Scope. Understanding Third Party Material Boundaries uses the fact as data scope evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Data Scope.',
          'Data Scope defines the useful size of Understanding Third Party Material Boundaries. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'When Understanding Third Party Material Boundaries crosses from data scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-file-owner',
        title: 'Third Party Material Boundaries File Owner',
        body: [
          'Data Scope defines the useful size of Understanding Third Party Material Boundaries. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. Understanding Third Party Material Boundaries uses the fact as file owner evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / File Owner.',
          'A direct observation for Understanding Third Party Material Boundaries should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state.',
          'Use file owner to keep Understanding Third Party Material Boundaries tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-root-resolution',
        title: 'Third Party Material Boundaries Root Resolution',
        body: [
          'When Understanding Third Party Material Boundaries crosses from data scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for root resolution: the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Root Resolution.',
          'Understanding Third Party Material Boundaries separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'A public report based on the root resolution part of Understanding Third Party Material Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-schema-reading',
        title: 'Third Party Material Boundaries Schema Reading',
        body: [
          'Understanding Third Party Material Boundaries should be read as conceptual boundary for third party material boundaries within Learning and Material Data and Output and Material Boundaries. Understanding Third Party Material Boundaries uses the fact as file owner evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / File Owner. For Understanding Third Party Material Boundaries, that fact identifies the first concrete boundary for schema reading: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Schema Reading.',
          'Ownership in Understanding Third Party Material Boundaries is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output.',
          'A public report based on the schema reading part of Understanding Third Party Material Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-state-versus-cache',
        title: 'Third Party Material Boundaries State Versus Cache',
        body: [
          'A direct observation for Understanding Third Party Material Boundaries should name what the user or reader actually sees before it assigns cause. That keeps the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data ahead of guesses about hidden state. Understanding Third Party Material Boundaries uses the fact as state versus cache evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / State Versus Cache.',
          'Visible feedback for Understanding Third Party Material Boundaries should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Output and Material Boundaries.',
          'When Understanding Third Party Material Boundaries crosses from state versus cache into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-privacy',
        title: 'Third Party Material Boundaries Privacy',
        body: [
          'Use file owner to keep Understanding Third Party Material Boundaries tied to Learning and Material Data; use a related page only when the reader needs a different owner. For Understanding Third Party Material Boundaries, that fact identifies the first concrete boundary for privacy: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Privacy.',
          'When Understanding Third Party Material Boundaries touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the privacy part of Understanding Third Party Material Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-recovery',
        title: 'Third Party Material Boundaries Recovery',
        body: [
          'Provenance-sensitive assets are identified separately from Ludoxel original materials. Material names, paths, and package inclusion should be read carefully before redistribution claims. For Understanding Third Party Material Boundaries, that fact identifies the first concrete boundary for recovery: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Recovery.',
          'The surrounding context for Understanding Third Party Material Boundaries decides which adjacent topic is relevant. Understanding Third Party Material Boundaries should be compared with Including Third Party License Text, Reading Asset Roots only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Understanding Third Party Material Boundaries crosses from recovery into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-generated-output',
        title: 'Third Party Material Boundaries Generated Output',
        body: [
          'Understanding Third Party Material Boundaries separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. That reading gives Understanding Third Party Material Boundaries a public anchor for generated output without adding behavior that the current category does not own. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Generated Output.',
          'Recovery or follow-up for Understanding Third Party Material Boundaries should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'The useful result of Understanding Third Party Material Boundaries generated output is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Output and Material Boundaries.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-material-category',
        title: 'Third Party Material Boundaries Material Category',
        body: [
          'A public report based on the root resolution part of Understanding Third Party Material Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing. In Understanding Third Party Material Boundaries, material category is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Material Category.',
          'The main confusion risk in Understanding Third Party Material Boundaries is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for material category does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Understanding Third Party Material Boundaries should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-corrupt-data',
        title: 'Third Party Material Boundaries Corrupt Data',
        body: [
          'The relevant state is constrained by the article category: Data treats this topic as local data and material-boundary behavior. For Understanding Third Party Material Boundaries, that fact identifies the first concrete boundary for corrupt data: runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Corrupt Data.',
          'Reportable evidence for Understanding Third Party Material Boundaries should be small, concrete, and public. the resolved data root, file category, schema version, state-versus-cache distinction, material classification, and whether the file contains private user data is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Understanding Third Party Material Boundaries crosses from corrupt data into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-report-evidence',
        title: 'Third Party Material Boundaries Report Evidence',
        body: [
          'Ownership in Understanding Third Party Material Boundaries is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output. The point matters in report evidence because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Report Evidence.',
          'Adjacent pages matter for Understanding Third Party Material Boundaries, but adjacency does not move authority. Understanding Third Party Material Boundaries should be compared with Including Third Party License Text, Reading Asset Roots only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Understanding Third Party Material Boundaries should not use report evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-related-data',
        title: 'Third Party Material Boundaries Related Data',
        body: [
          'A public report based on the schema reading part of Understanding Third Party Material Boundaries should state the action, expected result, actual result, environment, and any redaction needed before sharing. Understanding Third Party Material Boundaries uses the fact as related data evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Related Data.',
          'The public boundary for Understanding Third Party Material Boundaries is part of the article, not an afterthought. It does not ask readers to publish private files or infer rights from the existence of local output. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Understanding Third Party Material Boundaries crosses from related data into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-legal-boundary',
        title: 'Third Party Material Boundaries Legal Boundary',
        body: [
          'Do not remove third-party notices when packaging or discussing affected materials. A public summary is not a substitute for the original third-party license text. Understanding Third Party Material Boundaries uses the fact as state versus cache evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / State Versus Cache. The point matters in legal boundary because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Legal Boundary.',
          'An operator reading Understanding Third Party Material Boundaries should follow data reading starts with file ownership and classification, then considers schema, privacy, recovery, and public reporting. That order prevents a visible result from being treated as the first source of truth.',
          'Understanding Third Party Material Boundaries should not use legal boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-operator-summary',
        title: 'Third Party Material Boundaries Operator Summary',
        body: [
          'Visible feedback for Understanding Third Party Material Boundaries should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Data / Learning and Material Data / Output and Material Boundaries. In Understanding Third Party Material Boundaries, operator summary is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Operator Summary.',
          'Implementation limits for Understanding Third Party Material Boundaries keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for operator summary does not identify runtime data roots, JSON stores, schema modules, cache directories, learning-artifact readers, and the public material classifications that separate source files from output, Understanding Third Party Material Boundaries should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-source-boundary',
        title: 'Third Party Material Boundaries Source Boundary',
        body: [
          'Third-party license text is kept under third-party material paths, such as the Kaisei Opti font license file. Those terms remain separate from the Ludoxel license. Understanding Third Party Material Boundaries uses the fact as data scope evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Data Scope. In Understanding Third Party Material Boundaries, source boundary is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Source Boundary.',
          'The summary value of Understanding Third Party Material Boundaries is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Understanding Third Party Material Boundaries should not use source boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-closing-check',
        title: 'Third Party Material Boundaries Closing Check',
        body: [
          'Data Scope defines the useful size of Understanding Third Party Material Boundaries. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. Understanding Third Party Material Boundaries uses the fact as closing check evidence, then keeps the explanation inside Data rather than turning it into a project-wide claim. The local reading frame is Understanding Third Party Material Boundaries / Learning and Material Data / Output and Material Boundaries / Closing Check.',
          'A final check for Understanding Third Party Material Boundaries should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding Third Party Material Boundaries tied to Learning and Material Data; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Including Third Party License Text', 'Reading Asset Roots'],
  }),
];
