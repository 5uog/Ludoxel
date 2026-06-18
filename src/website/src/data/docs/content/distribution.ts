/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const distributionPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Platform Packages',
    title: 'Understanding the Windows Executable',
    description:
      'Explains the Windows desktop package boundary and included runtime materials. This page treats window composition as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-the-windows-executable-artifact-scope',
        title: 'Windows Executable Artifact Scope',
        body: [
          'The Windows executable path is based on PyInstaller packaging with PyQt6, OpenGL runtime resources, package data, native extension handling, shaders, QSS, and legal material. For Understanding the Windows Executable, that fact identifies the first concrete boundary for artifact scope: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Artifact Scope.',
          'Artifact Scope defines the useful size of Understanding the Windows Executable. The article should be broad enough to explain window composition, but narrow enough that treating a rendered label as the saved schema remains outside the conclusion.',
          'When Understanding the Windows Executable crosses from artifact scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-platform-owner',
        title: 'Windows Executable Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Understanding the Windows Executable. The article should be broad enough to explain window composition, but narrow enough that treating a rendered label as the saved schema remains outside the conclusion. That reading gives Understanding the Windows Executable a public anchor for platform owner without adding behavior that the current category does not own. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Platform Owner.',
          'A direct observation for Understanding the Windows Executable should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'The useful result of Understanding the Windows Executable platform owner is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-build-command',
        title: 'Windows Executable Build Command',
        body: [
          'When Understanding the Windows Executable crosses from artifact scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Understanding the Windows Executable a public anchor for build command without adding behavior that the current category does not own. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Build Command.',
          'Understanding the Windows Executable separates the surface that accepts input from the component or document that controls the result. This is especially important when reading the visible desktop surface crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding the Windows Executable build command is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-included-resources',
        title: 'Windows Executable Included Resources',
        body: [
          'Understanding the Windows Executable should be read as conceptual boundary for the windows executable within Desktop Artifacts and Platform Packages. The fact also tells the reader which evidence to preserve for included resources: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Included Resources.',
          'Ownership in Understanding the Windows Executable is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'A public report based on the included resources part of Understanding the Windows Executable should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-native-or-runtime',
        title: 'Windows Executable Native or Runtime Path',
        body: [
          'A direct observation for Understanding the Windows Executable should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. The point matters in native or runtime path because reading the visible desktop surface can otherwise be mistaken for treating a rendered label as the saved schema. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Native or Runtime Path.',
          'Visible feedback for Understanding the Windows Executable should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Platform Packages.',
          'The useful result of Understanding the Windows Executable native or runtime path is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-legal-materials',
        title: 'Windows Executable Legal Materials',
        body: [
          'The useful result of Understanding the Windows Executable platform owner is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Platform Packages. The fact also tells the reader which evidence to preserve for legal materials: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Legal Materials.',
          'When Understanding the Windows Executable touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the legal materials part of Understanding the Windows Executable should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-check-output',
        title: 'Windows Executable Check Output',
        body: [
          'A packaged executable still uses the application runtime data root for user state. It should not write normal saves into the installed executable directory. That reading gives Understanding the Windows Executable a public anchor for check output without adding behavior that the current category does not own. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Check Output.',
          'The surrounding context for Understanding the Windows Executable decides which adjacent topic is relevant. Understanding the Windows Executable should be compared with Running Package Checks with Permission, Including License Text, Supplying Platform Evidence only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Understanding the Windows Executable check output is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-local-artifact',
        title: 'Windows Executable Local Artifact',
        body: [
          'Understanding the Windows Executable separates the surface that accepts input from the component or document that controls the result. This is especially important when reading the visible desktop surface crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for local artifact: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Local Artifact.',
          'Recovery or follow-up for Understanding the Windows Executable should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the local artifact part of Understanding the Windows Executable should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-release-language',
        title: 'Windows Executable Release Language',
        body: [
          'The useful result of Understanding the Windows Executable build command is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Platform Packages. In Understanding the Windows Executable, release language is the difference between reading window composition and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Release Language.',
          'The main confusion risk in Understanding the Windows Executable is treating a rendered label as the saved schema. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for release language does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding the Windows Executable should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-failure-reading',
        title: 'Windows Executable Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. That reading gives Understanding the Windows Executable a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Failure Reading.',
          'Reportable evidence for Understanding the Windows Executable should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Understanding the Windows Executable failure reading is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-privacy',
        title: 'Windows Executable Build Privacy',
        body: [
          'Ownership in Understanding the Windows Executable is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. In Understanding the Windows Executable, build privacy is the difference between reading window composition and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Build Privacy.',
          'Adjacent pages matter for Understanding the Windows Executable, but adjacency does not move authority. Understanding the Windows Executable should be compared with Running Package Checks with Permission, Including License Text, Supplying Platform Evidence only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for build privacy does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding the Windows Executable should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-related-distribution',
        title: 'Windows Executable Related Distribution',
        body: [
          'A public report based on the included resources part of Understanding the Windows Executable should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for related distribution: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Related Distribution.',
          'The public boundary for Understanding the Windows Executable is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the related distribution part of Understanding the Windows Executable should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-policy-limit',
        title: 'Windows Executable Policy Limit',
        body: [
          'When diagnosing a Windows package, collect public OS, Python or package context, GPU/OpenGL information, package path, and relevant check output without sharing private local files. In Understanding the Windows Executable, policy limit is the difference between reading window composition and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Policy Limit.',
          'An operator reading Understanding the Windows Executable should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'Understanding the Windows Executable should not use policy limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-operator-summary',
        title: 'Windows Executable Operator Summary',
        body: [
          'Visible feedback for Understanding the Windows Executable should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Platform Packages. In Understanding the Windows Executable, operator summary is the difference between reading window composition and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Operator Summary.',
          'Implementation limits for Understanding the Windows Executable keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for operator summary does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding the Windows Executable should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-platform-limit',
        title: 'Windows Executable Platform Limit',
        body: [
          'The Windows executable path is based on PyInstaller packaging with PyQt6, OpenGL runtime resources, package data, native extension handling, shaders, QSS, and legal material. The fact also tells the reader which evidence to preserve for platform limit: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Platform Limit.',
          'The summary value of Understanding the Windows Executable is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use platform limit to keep Understanding the Windows Executable tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-the-windows-executable-closing-check',
        title: 'Windows Executable Closing Check',
        body: [
          'Artifact Scope defines the useful size of Understanding the Windows Executable. The article should be broad enough to explain window composition, but narrow enough that treating a rendered label as the saved schema remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the Windows Executable / Desktop Artifacts / Platform Packages / Closing Check.',
          'A final check for Understanding the Windows Executable should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Understanding the Windows Executable should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Running Package Checks with Permission', 'Including License Text', 'Supplying Platform Evidence'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Platform Packages',
    title: 'Understanding the macOS Application Bundle',
    description:
      'Explains the macOS desktop bundle boundary and WGPU-oriented runtime path. This page treats desktop distribution evidence as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-the-macos-application-bundle-artifact-scope',
        title: 'macOS Application Bundle Artifact Scope',
        body: [
          'The macOS bundle uses platform-specific packaging behavior with PyQt6, WGPU, rendercanvas, shader sources, package resources, theme data, and legal material. For Understanding the macOS Application Bundle, that fact identifies the first concrete boundary for artifact scope: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Artifact Scope.',
          'Artifact Scope defines the useful size of Understanding the macOS Application Bundle. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion.',
          'A public report based on the artifact scope part of Understanding the macOS Application Bundle should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-platform-owner',
        title: 'macOS Application Bundle Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Understanding the macOS Application Bundle. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. The point matters in platform owner because reading local build artifacts and package checks can otherwise be mistaken for describing local output as official release authority. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Platform Owner.',
          'A direct observation for Understanding the macOS Application Bundle should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'The useful result of Understanding the macOS Application Bundle platform owner is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-build-command',
        title: 'macOS Application Bundle Build Command',
        body: [
          'A public report based on the artifact scope part of Understanding the macOS Application Bundle should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in build command because reading local build artifacts and package checks can otherwise be mistaken for describing local output as official release authority. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Build Command.',
          'Understanding the macOS Application Bundle separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form.',
          'The useful result of Understanding the macOS Application Bundle build command is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-included-resources',
        title: 'macOS Application Bundle Included Resources',
        body: [
          'Understanding the macOS Application Bundle should be read as conceptual boundary for the macos application bundle within Desktop Artifacts and Platform Packages. For Understanding the macOS Application Bundle, that fact identifies the first concrete boundary for included resources: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Included Resources.',
          'Ownership in Understanding the macOS Application Bundle is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'A public report based on the included resources part of Understanding the macOS Application Bundle should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-native-or-runtime',
        title: 'macOS Application Bundle Native or Runtime Path',
        body: [
          'A direct observation for Understanding the macOS Application Bundle should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. That reading gives Understanding the macOS Application Bundle a public anchor for native or runtime path without adding behavior that the current category does not own. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Native or Runtime Path.',
          'Visible feedback for Understanding the macOS Application Bundle should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Platform Packages.',
          'The useful result of Understanding the macOS Application Bundle native or runtime path is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-legal-materials',
        title: 'macOS Application Bundle Legal Materials',
        body: [
          'The useful result of Understanding the macOS Application Bundle platform owner is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Platform Packages. Understanding the macOS Application Bundle uses the fact as legal materials evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Legal Materials.',
          'When Understanding the macOS Application Bundle touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'When Understanding the macOS Application Bundle crosses from legal materials into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-check-output',
        title: 'macOS Application Bundle Check Output',
        body: [
          'macOS rendering should be checked against the WGPU backend and compared with OpenGL contract expectations when diagnosing parity issues. That reading gives Understanding the macOS Application Bundle a public anchor for check output without adding behavior that the current category does not own. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Check Output.',
          'The surrounding context for Understanding the macOS Application Bundle decides which adjacent topic is relevant. Understanding the macOS Application Bundle should be compared with Understanding WGPU Rendering, Running Package Checks with Permission, Supplying Platform Evidence only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for check output does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding the macOS Application Bundle should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-local-artifact',
        title: 'macOS Application Bundle Local Artifact',
        body: [
          'Understanding the macOS Application Bundle separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for local artifact: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Local Artifact.',
          'Recovery or follow-up for Understanding the macOS Application Bundle should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use local artifact to keep Understanding the macOS Application Bundle tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-release-language',
        title: 'macOS Application Bundle Release Language',
        body: [
          'The useful result of Understanding the macOS Application Bundle build command is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Platform Packages. The point matters in release language because reading local build artifacts and package checks can otherwise be mistaken for describing local output as official release authority. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Release Language.',
          'The main confusion risk in Understanding the macOS Application Bundle is describing local output as official release authority. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Understanding the macOS Application Bundle release language is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-failure-reading',
        title: 'macOS Application Bundle Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. The point matters in failure reading because reading local build artifacts and package checks can otherwise be mistaken for describing local output as official release authority. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Failure Reading.',
          'Reportable evidence for Understanding the macOS Application Bundle should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Understanding the macOS Application Bundle failure reading is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-privacy',
        title: 'macOS Application Bundle Build Privacy',
        body: [
          'Ownership in Understanding the macOS Application Bundle is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. That reading gives Understanding the macOS Application Bundle a public anchor for build privacy without adding behavior that the current category does not own. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Build Privacy.',
          'Adjacent pages matter for Understanding the macOS Application Bundle, but adjacency does not move authority. Understanding the macOS Application Bundle should be compared with Understanding WGPU Rendering, Running Package Checks with Permission, Supplying Platform Evidence only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for build privacy does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding the macOS Application Bundle should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-related-distribution',
        title: 'macOS Application Bundle Related Distribution',
        body: [
          'A public report based on the included resources part of Understanding the macOS Application Bundle should state the action, expected result, actual result, environment, and any redaction needed before sharing. Understanding the macOS Application Bundle uses the fact as related distribution evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Related Distribution.',
          'The public boundary for Understanding the macOS Application Bundle is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Understanding the macOS Application Bundle crosses from related distribution into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-policy-limit',
        title: 'macOS Application Bundle Policy Limit',
        body: [
          'Useful macOS evidence includes bundle path, OS version, renderer information, package output, and visible symptoms. Keep private files and security details out of public reports. That reading gives Understanding the macOS Application Bundle a public anchor for policy limit without adding behavior that the current category does not own. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Policy Limit.',
          'An operator reading Understanding the macOS Application Bundle should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Understanding the macOS Application Bundle policy limit is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Platform Packages.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-operator-summary',
        title: 'macOS Application Bundle Operator Summary',
        body: [
          'Visible feedback for Understanding the macOS Application Bundle should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Platform Packages. That reading gives Understanding the macOS Application Bundle a public anchor for operator summary without adding behavior that the current category does not own. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Operator Summary.',
          'Implementation limits for Understanding the macOS Application Bundle keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for operator summary does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding the macOS Application Bundle should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-platform-limit',
        title: 'macOS Application Bundle Platform Limit',
        body: [
          'The macOS bundle uses platform-specific packaging behavior with PyQt6, WGPU, rendercanvas, shader sources, package resources, theme data, and legal material. The fact also tells the reader which evidence to preserve for platform limit: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Platform Limit.',
          'The summary value of Understanding the macOS Application Bundle is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'A public report based on the platform limit part of Understanding the macOS Application Bundle should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-the-macos-application-bundle-closing-check',
        title: 'macOS Application Bundle Closing Check',
        body: [
          'Artifact Scope defines the useful size of Understanding the macOS Application Bundle. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding the macOS Application Bundle / Desktop Artifacts / Platform Packages / Closing Check.',
          'A final check for Understanding the macOS Application Bundle should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Understanding the macOS Application Bundle tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Understanding WGPU Rendering', 'Running Package Checks with Permission', 'Supplying Platform Evidence'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Packaged Components',
    title: 'Understanding Native Extension Fallbacks',
    description:
      'Explains why native and Python implementations must keep the same contracts. This page treats hazard handling as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'understanding-native-extension-fallbacks-artifact-scope',
        title: 'Native Extension Fallbacks Artifact Scope',
        body: [
          'Native acceleration and Python fallback paths must return the same low-level meaning for math, voxel traversal, collision, chunk, or renderer-facing helpers. In Understanding Native Extension Fallbacks, artifact scope is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Artifact Scope. In Understanding Native Extension Fallbacks, artifact scope is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Artifact Scope.',
          'Artifact Scope defines the useful size of Understanding Native Extension Fallbacks. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion.',
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding Native Extension Fallbacks should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-platform-owner',
        title: 'Native Extension Fallbacks Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Understanding Native Extension Fallbacks. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. Understanding Native Extension Fallbacks uses the fact as platform owner evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Platform Owner.',
          'A direct observation for Understanding Native Extension Fallbacks should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'Use platform owner to keep Understanding Native Extension Fallbacks tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-build-command',
        title: 'Native Extension Fallbacks Build Command',
        body: [
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding Native Extension Fallbacks should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for build command: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Build Command.',
          'Understanding Native Extension Fallbacks separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form.',
          'Use build command to keep Understanding Native Extension Fallbacks tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-included-resources',
        title: 'Native Extension Fallbacks Included Resources',
        body: [
          'Understanding Native Extension Fallbacks should be read as conceptual boundary for native extension fallbacks within Desktop Artifacts and Packaged Components. Understanding Native Extension Fallbacks uses the fact as platform owner evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Platform Owner. In Understanding Native Extension Fallbacks, included resources is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Included Resources.',
          'Ownership in Understanding Native Extension Fallbacks is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'If the available evidence for included resources does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding Native Extension Fallbacks should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-native-or-runtime',
        title: 'Native Extension Fallbacks Native or Runtime Path',
        body: [
          'A direct observation for Understanding Native Extension Fallbacks should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for native or runtime path: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Native or Runtime Path.',
          'Visible feedback for Understanding Native Extension Fallbacks should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Packaged Components.',
          'A public report based on the native or runtime path part of Understanding Native Extension Fallbacks should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-legal-materials',
        title: 'Native Extension Fallbacks Legal Materials',
        body: [
          'Use platform owner to keep Understanding Native Extension Fallbacks tied to Desktop Artifacts; use a related page only when the reader needs a different owner. In Understanding Native Extension Fallbacks, legal materials is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Legal Materials.',
          'When Understanding Native Extension Fallbacks touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Understanding Native Extension Fallbacks should not use legal materials to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-check-output',
        title: 'Native Extension Fallbacks Check Output',
        body: [
          'Desktop builds need the correct native extension or a valid fallback path. A missing native module should not silently change gameplay semantics. Understanding Native Extension Fallbacks uses the fact as check output evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Check Output.',
          'The surrounding context for Understanding Native Extension Fallbacks decides which adjacent topic is relevant. Understanding Native Extension Fallbacks should be compared with Running Desktop Builds with Permission, Reading Build Output, Running Resource and Shader Checks with Permission only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use check output to keep Understanding Native Extension Fallbacks tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-local-artifact',
        title: 'Native Extension Fallbacks Local Artifact',
        body: [
          'Understanding Native Extension Fallbacks separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form. That reading gives Understanding Native Extension Fallbacks a public anchor for local artifact without adding behavior that the current category does not own. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Local Artifact.',
          'Recovery or follow-up for Understanding Native Extension Fallbacks should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'The useful result of Understanding Native Extension Fallbacks local artifact is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Packaged Components.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-release-language',
        title: 'Native Extension Fallbacks Release Language',
        body: [
          'Use build command to keep Understanding Native Extension Fallbacks tied to Desktop Artifacts; use a related page only when the reader needs a different owner. Understanding Native Extension Fallbacks uses the fact as release language evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Release Language.',
          'The main confusion risk in Understanding Native Extension Fallbacks is hiding gameplay state behind a generic crash report. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use release language to keep Understanding Native Extension Fallbacks tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-failure-reading',
        title: 'Native Extension Fallbacks Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. In Understanding Native Extension Fallbacks, included resources is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Included Resources. The fact also tells the reader which evidence to preserve for failure reading: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Failure Reading.',
          'Reportable evidence for Understanding Native Extension Fallbacks should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use failure reading to keep Understanding Native Extension Fallbacks tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-privacy',
        title: 'Native Extension Fallbacks Build Privacy',
        body: [
          'Ownership in Understanding Native Extension Fallbacks is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. For Understanding Native Extension Fallbacks, that fact identifies the first concrete boundary for build privacy: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Build Privacy.',
          'Adjacent pages matter for Understanding Native Extension Fallbacks, but adjacency does not move authority. Understanding Native Extension Fallbacks should be compared with Running Desktop Builds with Permission, Reading Build Output, Running Resource and Shader Checks with Permission only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the build privacy part of Understanding Native Extension Fallbacks should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-related-distribution',
        title: 'Native Extension Fallbacks Related Distribution',
        body: [
          'If the available evidence for included resources does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding Native Extension Fallbacks should be treated as an observation rather than a confirmed cause. That reading gives Understanding Native Extension Fallbacks a public anchor for related distribution without adding behavior that the current category does not own. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Related Distribution.',
          'The public boundary for Understanding Native Extension Fallbacks is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Understanding Native Extension Fallbacks related distribution is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Packaged Components.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-policy-limit',
        title: 'Native Extension Fallbacks Policy Limit',
        body: [
          'Verify fallback behavior with import and runtime checks that exercise the actual path. A successful build alone does not prove the native and fallback contracts match. Understanding Native Extension Fallbacks uses the fact as policy limit evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Policy Limit.',
          'An operator reading Understanding Native Extension Fallbacks should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'When Understanding Native Extension Fallbacks crosses from policy limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-operator-summary',
        title: 'Native Extension Fallbacks Operator Summary',
        body: [
          'Visible feedback for Understanding Native Extension Fallbacks should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Packaged Components. The fact also tells the reader which evidence to preserve for operator summary: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Operator Summary.',
          'Implementation limits for Understanding Native Extension Fallbacks keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the operator summary part of Understanding Native Extension Fallbacks should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-platform-limit',
        title: 'Native Extension Fallbacks Platform Limit',
        body: [
          'Native acceleration and Python fallback paths must return the same low-level meaning for math, voxel traversal, collision, chunk, or renderer-facing helpers. In Understanding Native Extension Fallbacks, artifact scope is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Artifact Scope. That reading gives Understanding Native Extension Fallbacks a public anchor for platform limit without adding behavior that the current category does not own. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Platform Limit.',
          'The summary value of Understanding Native Extension Fallbacks is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for platform limit does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Understanding Native Extension Fallbacks should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'understanding-native-extension-fallbacks-closing-check',
        title: 'Native Extension Fallbacks Closing Check',
        body: [
          'Artifact Scope defines the useful size of Understanding Native Extension Fallbacks. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. In Understanding Native Extension Fallbacks, closing check is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Understanding Native Extension Fallbacks / Desktop Artifacts / Packaged Components / Closing Check.',
          'A final check for Understanding Native Extension Fallbacks should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Understanding Native Extension Fallbacks should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Running Desktop Builds with Permission', 'Reading Build Output', 'Running Resource and Shader Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Packaged Components',
    title: 'Including License Text',
    description:
      'Explains how Ludoxel license text belongs with distribution materials. This page treats license interpretation as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'including-license-text-artifact-scope',
        title: 'License Text Artifact Scope',
        body: [
          'The repository LICENSE is the controlling text for Ludoxel original materials. Distribution materials must keep that text available where required by the packaging policy. That reading gives Including License Text a public anchor for artifact scope without adding behavior that the current category does not own. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Artifact Scope.',
          'Artifact Scope defines the useful size of Including License Text. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion.',
          'The useful result of Including License Text artifact scope is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Packaged Components.',
        ],
      },
      {
        id: 'including-license-text-platform-owner',
        title: 'License Text Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Including License Text. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. Including License Text uses the fact as platform owner evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Platform Owner.',
          'A direct observation for Including License Text should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'Use platform owner to keep Including License Text tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'including-license-text-build-command',
        title: 'License Text Build Command',
        body: [
          'The useful result of Including License Text artifact scope is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Packaged Components. For Including License Text, that fact identifies the first concrete boundary for build command: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Build Command.',
          'Including License Text separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form.',
          'A public report based on the build command part of Including License Text should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'including-license-text-included-resources',
        title: 'License Text Included Resources',
        body: [
          'Including License Text should be read as package inclusion for license text within Desktop Artifacts and Packaged Components. Including License Text uses the fact as platform owner evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Platform Owner. That reading gives Including License Text a public anchor for included resources without adding behavior that the current category does not own. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Included Resources.',
          'Ownership in Including License Text is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'The useful result of Including License Text included resources is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Packaged Components.',
        ],
      },
      {
        id: 'including-license-text-native-or-runtime',
        title: 'License Text Native or Runtime Path',
        body: [
          'A direct observation for Including License Text should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. For Including License Text, that fact identifies the first concrete boundary for native or runtime path: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Native or Runtime Path.',
          'Visible feedback for Including License Text should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Packaged Components.',
          'When Including License Text crosses from native or runtime path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'including-license-text-legal-materials',
        title: 'License Text Legal Materials',
        body: [
          'Use platform owner to keep Including License Text tied to Desktop Artifacts; use a related page only when the reader needs a different owner. That reading gives Including License Text a public anchor for legal materials without adding behavior that the current category does not own. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Legal Materials.',
          'When Including License Text touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for legal materials does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Including License Text should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'including-license-text-check-output',
        title: 'License Text Check Output',
        body: [
          'A README paragraph, website page, or package note can orient readers, but it does not replace the license terms or create new permissions. Including License Text uses the fact as check output evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Check Output.',
          'The surrounding context for Including License Text decides which adjacent topic is relevant. Including License Text should be compared with Understanding License Authority, Including Third Party License Text, Running Package Checks with Permission only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use check output to keep Including License Text tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'including-license-text-local-artifact',
        title: 'License Text Local Artifact',
        body: [
          'Including License Text separates the surface that accepts input from the component or document that controls the result. This is especially important when reading rights from controlling text crosses a saved value, a renderer output, or a public form. In Including License Text, local artifact is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Local Artifact.',
          'Recovery or follow-up for Including License Text should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for local artifact does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Including License Text should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'including-license-text-release-language',
        title: 'License Text Release Language',
        body: [
          'A public report based on the build command part of Including License Text should state the action, expected result, actual result, environment, and any redaction needed before sharing. For Including License Text, that fact identifies the first concrete boundary for release language: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Release Language.',
          'The main confusion risk in Including License Text is expanding permissions through explanatory wording. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Including License Text crosses from release language into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'including-license-text-failure-reading',
        title: 'License Text Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. For Including License Text, that fact identifies the first concrete boundary for failure reading: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Failure Reading.',
          'Reportable evidence for Including License Text should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the failure reading part of Including License Text should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'including-license-text-privacy',
        title: 'License Text Build Privacy',
        body: [
          'Ownership in Including License Text is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The fact also tells the reader which evidence to preserve for build privacy: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Build Privacy.',
          'Adjacent pages matter for Including License Text, but adjacency does not move authority. Including License Text should be compared with Understanding License Authority, Including Third Party License Text, Running Package Checks with Permission only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use build privacy to keep Including License Text tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'including-license-text-related-distribution',
        title: 'License Text Related Distribution',
        body: [
          'The useful result of Including License Text included resources is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Packaged Components. The point matters in related distribution because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Related Distribution.',
          'The public boundary for Including License Text is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Including License Text should not use related distribution to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'including-license-text-policy-limit',
        title: 'License Text Policy Limit',
        body: [
          'Package checks should confirm legal material inclusion alongside resources, shaders, and package data. Missing license text is a distribution defect, not a documentation-only issue. The fact also tells the reader which evidence to preserve for policy limit: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Policy Limit.',
          'An operator reading Including License Text should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'Use policy limit to keep Including License Text tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'including-license-text-operator-summary',
        title: 'License Text Operator Summary',
        body: [
          'Visible feedback for Including License Text should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Packaged Components. The fact also tells the reader which evidence to preserve for operator summary: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Operator Summary.',
          'Implementation limits for Including License Text keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the operator summary part of Including License Text should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'including-license-text-platform-limit',
        title: 'License Text Platform Limit',
        body: [
          'The repository LICENSE is the controlling text for Ludoxel original materials. Distribution materials must keep that text available where required by the packaging policy. The point matters in platform limit because reading rights from controlling text can otherwise be mistaken for expanding permissions through explanatory wording. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Platform Limit.',
          'The summary value of Including License Text is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Including License Text platform limit is a bounded explanation of license interpretation: enough detail to act, and enough restraint to avoid claims outside Packaged Components.',
        ],
      },
      {
        id: 'including-license-text-closing-check',
        title: 'License Text Closing Check',
        body: [
          'Artifact Scope defines the useful size of Including License Text. The article should be broad enough to explain license interpretation, but narrow enough that expanding permissions through explanatory wording remains outside the conclusion. In Including License Text, closing check is the difference between reading license interpretation and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Including License Text / Desktop Artifacts / Packaged Components / Closing Check.',
          'A final check for Including License Text should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Including License Text should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Understanding License Authority', 'Including Third Party License Text', 'Running Package Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Packaged Components',
    title: 'Including Third Party License Text',
    description:
      'Explains how third-party license files must remain attached to third-party materials. This page treats material classification as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'including-third-party-license-text-artifact-scope',
        title: 'Third Party License Text Artifact Scope',
        body: [
          'Third-party license text is stored under third-party paths, including the Kaisei Opti OFL license file. The text should remain tied to the material it covers. The fact also tells the reader which evidence to preserve for artifact scope: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Artifact Scope.',
          'Artifact Scope defines the useful size of Including Third Party License Text. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'A public report based on the artifact scope part of Including Third Party License Text should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'including-third-party-license-text-platform-owner',
        title: 'Third Party License Text Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Including Third Party License Text. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. The point matters in platform owner because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Platform Owner.',
          'A direct observation for Including Third Party License Text should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'Including Third Party License Text should not use platform owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'including-third-party-license-text-build-command',
        title: 'Third Party License Text Build Command',
        body: [
          'A public report based on the artifact scope part of Including Third Party License Text should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in build command because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Build Command.',
          'Including Third Party License Text separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'Including Third Party License Text should not use build command to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'including-third-party-license-text-included-resources',
        title: 'Third Party License Text Included Resources',
        body: [
          'Including Third Party License Text should be read as package inclusion for third party license text within Desktop Artifacts and Packaged Components. For Including Third Party License Text, that fact identifies the first concrete boundary for included resources: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Included Resources.',
          'Ownership in Including Third Party License Text is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'When Including Third Party License Text crosses from included resources into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'including-third-party-license-text-native-or-runtime',
        title: 'Third Party License Text Native or Runtime Path',
        body: [
          'A direct observation for Including Third Party License Text should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. In Including Third Party License Text, native or runtime path is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Native or Runtime Path.',
          'Visible feedback for Including Third Party License Text should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Packaged Components.',
          'Including Third Party License Text should not use native or runtime path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'including-third-party-license-text-legal-materials',
        title: 'Third Party License Text Legal Materials',
        body: [
          'Including Third Party License Text should not use platform owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The fact also tells the reader which evidence to preserve for legal materials: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Legal Materials.',
          'When Including Third Party License Text touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the legal materials part of Including Third Party License Text should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'including-third-party-license-text-check-output',
        title: 'Third Party License Text Check Output',
        body: [
          'Packaging must preserve required notices and license files for included third-party materials. Ludoxel license text does not replace those separate terms. In Including Third Party License Text, check output is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Check Output.',
          'The surrounding context for Including Third Party License Text decides which adjacent topic is relevant. Including Third Party License Text should be compared with Understanding Third Party Material Boundaries, Including License Text, Reading Asset Roots only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for check output does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Including Third Party License Text should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'including-third-party-license-text-local-artifact',
        title: 'Third Party License Text Local Artifact',
        body: [
          'Including Third Party License Text separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. Including Third Party License Text uses the fact as local artifact evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Local Artifact.',
          'Recovery or follow-up for Including Third Party License Text should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use local artifact to keep Including Third Party License Text tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'including-third-party-license-text-release-language',
        title: 'Third Party License Text Release Language',
        body: [
          'Including Third Party License Text should not use build command to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in release language because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Release Language.',
          'The main confusion risk in Including Third Party License Text is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Including Third Party License Text should not use release language to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'including-third-party-license-text-failure-reading',
        title: 'Third Party License Text Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. That reading gives Including Third Party License Text a public anchor for failure reading without adding behavior that the current category does not own. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Failure Reading.',
          'Reportable evidence for Including Third Party License Text should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Including Third Party License Text failure reading is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Packaged Components.',
        ],
      },
      {
        id: 'including-third-party-license-text-privacy',
        title: 'Third Party License Text Build Privacy',
        body: [
          'Ownership in Including Third Party License Text is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. That reading gives Including Third Party License Text a public anchor for build privacy without adding behavior that the current category does not own. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Build Privacy.',
          'Adjacent pages matter for Including Third Party License Text, but adjacency does not move authority. Including Third Party License Text should be compared with Understanding Third Party Material Boundaries, Including License Text, Reading Asset Roots only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Including Third Party License Text build privacy is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Packaged Components.',
        ],
      },
      {
        id: 'including-third-party-license-text-related-distribution',
        title: 'Third Party License Text Related Distribution',
        body: [
          'When Including Third Party License Text crosses from included resources into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Including Third Party License Text, that fact identifies the first concrete boundary for related distribution: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Related Distribution.',
          'The public boundary for Including Third Party License Text is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Including Third Party License Text crosses from related distribution into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'including-third-party-license-text-policy-limit',
        title: 'Third Party License Text Policy Limit',
        body: [
          'When changing assets or package data, review both attribution and license inclusion. Do not infer permission from file visibility alone. In Including Third Party License Text, native or runtime path is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Native or Runtime Path. That reading gives Including Third Party License Text a public anchor for policy limit without adding behavior that the current category does not own. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Policy Limit.',
          'An operator reading Including Third Party License Text should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for policy limit does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Including Third Party License Text should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'including-third-party-license-text-operator-summary',
        title: 'Third Party License Text Operator Summary',
        body: [
          'Visible feedback for Including Third Party License Text should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Desktop Artifacts / Packaged Components. In Including Third Party License Text, operator summary is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Operator Summary.',
          'Implementation limits for Including Third Party License Text keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for operator summary does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Including Third Party License Text should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'including-third-party-license-text-platform-limit',
        title: 'Third Party License Text Platform Limit',
        body: [
          'Third-party license text is stored under third-party paths, including the Kaisei Opti OFL license file. The text should remain tied to the material it covers. The fact also tells the reader which evidence to preserve for platform limit: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Platform Limit.',
          'The summary value of Including Third Party License Text is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use platform limit to keep Including Third Party License Text tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'including-third-party-license-text-closing-check',
        title: 'Third Party License Text Closing Check',
        body: [
          'Artifact Scope defines the useful size of Including Third Party License Text. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. Including Third Party License Text uses the fact as closing check evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Including Third Party License Text / Desktop Artifacts / Packaged Components / Closing Check.',
          'A final check for Including Third Party License Text should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Use closing check to keep Including Third Party License Text tied to Desktop Artifacts; use a related page only when the reader needs a different owner.',
        ],
      },
    ],
    relatedTitles: ['Understanding Third Party Material Boundaries', 'Including License Text', 'Reading Asset Roots'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Build Execution',
    title: 'Running a Desktop Build with Permission',
    description:
      'Explains when and how local desktop build output should be treated. This page treats desktop distribution evidence as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'running-a-desktop-build-with-permission-artifact-scope',
        title: 'Desktop Build with Permission Artifact Scope',
        body: [
          'Desktop builds can generate broad local artifacts, invoke packaging tools, and read platform-specific resources. Run them only when the local task authorizes that work. That reading gives Running a Desktop Build with Permission a public anchor for artifact scope without adding behavior that the current category does not own. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Artifact Scope.',
          'Artifact Scope defines the useful size of Running a Desktop Build with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion.',
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running a Desktop Build with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-platform-owner',
        title: 'Desktop Build with Permission Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Running a Desktop Build with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. For Running a Desktop Build with Permission, that fact identifies the first concrete boundary for platform owner: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Platform Owner.',
          'A direct observation for Running a Desktop Build with Permission should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'A public report based on the platform owner part of Running a Desktop Build with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-build-command',
        title: 'Desktop Build with Permission Build Command',
        body: [
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running a Desktop Build with Permission should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for build command: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Build Command.',
          'Running a Desktop Build with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form.',
          'A public report based on the build command part of Running a Desktop Build with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-included-resources',
        title: 'Desktop Build with Permission Included Resources',
        body: [
          'Running a Desktop Build with Permission should be read as authorized operation for a desktop build with permission within Build and Release Checks and Build Execution. In Running a Desktop Build with Permission, included resources is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Included Resources.',
          'Ownership in Running a Desktop Build with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'Running a Desktop Build with Permission should not use included resources to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-native-or-runtime',
        title: 'Desktop Build with Permission Native or Runtime Path',
        body: [
          'A direct observation for Running a Desktop Build with Permission should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. Running a Desktop Build with Permission uses the fact as native or runtime path evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Native or Runtime Path.',
          'Visible feedback for Running a Desktop Build with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Build Execution.',
          'When Running a Desktop Build with Permission crosses from native or runtime path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-legal-materials',
        title: 'Desktop Build with Permission Legal Materials',
        body: [
          'A public report based on the platform owner part of Running a Desktop Build with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in legal materials because reading local build artifacts and package checks can otherwise be mistaken for describing local output as official release authority. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Legal Materials.',
          'When Running a Desktop Build with Permission touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Running a Desktop Build with Permission should not use legal materials to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-check-output',
        title: 'Desktop Build with Permission Check Output',
        body: [
          'Build output can show missing data, dependency issues, packaging defects, or generated artifact paths. It is local evidence, not official release status. For Running a Desktop Build with Permission, that fact identifies the first concrete boundary for check output: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Check Output.',
          'The surrounding context for Running a Desktop Build with Permission decides which adjacent topic is relevant. Running a Desktop Build with Permission should be compared with Reading Build Output, Avoiding Unofficial Release Claims, Running Package Checks with Permission only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the check output part of Running a Desktop Build with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-local-artifact',
        title: 'Desktop Build with Permission Local Artifact',
        body: [
          'Running a Desktop Build with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form. That reading gives Running a Desktop Build with Permission a public anchor for local artifact without adding behavior that the current category does not own. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Local Artifact.',
          'Recovery or follow-up for Running a Desktop Build with Permission should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for local artifact does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running a Desktop Build with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-release-language',
        title: 'Desktop Build with Permission Release Language',
        body: [
          'A public report based on the build command part of Running a Desktop Build with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing. Running a Desktop Build with Permission uses the fact as release language evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Release Language.',
          'The main confusion risk in Running a Desktop Build with Permission is describing local output as official release authority. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Running a Desktop Build with Permission crosses from release language into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-failure-reading',
        title: 'Desktop Build with Permission Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. In Running a Desktop Build with Permission, included resources is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Included Resources. The fact also tells the reader which evidence to preserve for failure reading: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Failure Reading.',
          'Reportable evidence for Running a Desktop Build with Permission should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the failure reading part of Running a Desktop Build with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-privacy',
        title: 'Desktop Build with Permission Build Privacy',
        body: [
          'Ownership in Running a Desktop Build with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The fact also tells the reader which evidence to preserve for build privacy: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Build Privacy.',
          'Adjacent pages matter for Running a Desktop Build with Permission, but adjacency does not move authority. Running a Desktop Build with Permission should be compared with Reading Build Output, Avoiding Unofficial Release Claims, Running Package Checks with Permission only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the build privacy part of Running a Desktop Build with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-related-distribution',
        title: 'Desktop Build with Permission Related Distribution',
        body: [
          'Running a Desktop Build with Permission should not use included resources to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Running a Desktop Build with Permission, related distribution is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Related Distribution.',
          'The public boundary for Running a Desktop Build with Permission is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Running a Desktop Build with Permission should not use related distribution to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-policy-limit',
        title: 'Desktop Build with Permission Policy Limit',
        body: [
          'Inspect generated files before reporting success. Separate source changes from build artifacts and keep license, third-party, resource, and platform notes visible in the result. Running a Desktop Build with Permission uses the fact as native or runtime path evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Native or Runtime Path. For Running a Desktop Build with Permission, that fact identifies the first concrete boundary for policy limit: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Policy Limit.',
          'An operator reading Running a Desktop Build with Permission should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'When Running a Desktop Build with Permission crosses from policy limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-operator-summary',
        title: 'Desktop Build with Permission Operator Summary',
        body: [
          'Visible feedback for Running a Desktop Build with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Build Execution. The fact also tells the reader which evidence to preserve for operator summary: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Operator Summary.',
          'Implementation limits for Running a Desktop Build with Permission keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Use operator summary to keep Running a Desktop Build with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-platform-limit',
        title: 'Desktop Build with Permission Platform Limit',
        body: [
          'Desktop builds can generate broad local artifacts, invoke packaging tools, and read platform-specific resources. Run them only when the local task authorizes that work. That reading gives Running a Desktop Build with Permission a public anchor for platform limit without adding behavior that the current category does not own. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Platform Limit.',
          'The summary value of Running a Desktop Build with Permission is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Running a Desktop Build with Permission platform limit is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Build Execution.',
        ],
      },
      {
        id: 'running-a-desktop-build-with-permission-closing-check',
        title: 'Desktop Build with Permission Closing Check',
        body: [
          'Artifact Scope defines the useful size of Running a Desktop Build with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. In Running a Desktop Build with Permission, closing check is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running a Desktop Build with Permission / Build and Release Checks / Build Execution / Closing Check.',
          'A final check for Running a Desktop Build with Permission should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running a Desktop Build with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Reading Build Output', 'Avoiding Unofficial Release Claims', 'Running Package Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Build Execution',
    title: 'Reading Build Output',
    description:
      'Explains how to interpret logs and artifacts produced by build commands. This page treats material classification as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-build-output-artifact-scope',
        title: 'Build Output Artifact Scope',
        body: [
          'Build logs should be read for actual command names, missing files, dependency errors, package-data warnings, and platform-specific failures. Do not summarize a command as successful unless it exited successfully. The point matters in artifact scope because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Artifact Scope.',
          'Artifact Scope defines the useful size of Reading Build Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion.',
          'The useful result of Reading Build Output artifact scope is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Build Execution.',
        ],
      },
      {
        id: 'reading-build-output-platform-owner',
        title: 'Build Output Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Reading Build Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. For Reading Build Output, that fact identifies the first concrete boundary for platform owner: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Platform Owner.',
          'A direct observation for Reading Build Output should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'A public report based on the platform owner part of Reading Build Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-build-output-build-command',
        title: 'Build Output Build Command',
        body: [
          'The useful result of Reading Build Output artifact scope is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Build Execution. The fact also tells the reader which evidence to preserve for build command: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Build Command.',
          'Reading Build Output separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form.',
          'A public report based on the build command part of Reading Build Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-build-output-included-resources',
        title: 'Build Output Included Resources',
        body: [
          'Reading Build Output should be read as interpretation for build output within Build and Release Checks and Build Execution. In Reading Build Output, included resources is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Included Resources.',
          'Ownership in Reading Build Output is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'Reading Build Output should not use included resources to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-build-output-native-or-runtime',
        title: 'Build Output Native or Runtime Path',
        body: [
          'A direct observation for Reading Build Output should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for native or runtime path: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Native or Runtime Path.',
          'Visible feedback for Reading Build Output should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Build Execution.',
          'Use native or runtime path to keep Reading Build Output tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-build-output-legal-materials',
        title: 'Build Output Legal Materials',
        body: [
          'A public report based on the platform owner part of Reading Build Output should state the action, expected result, actual result, environment, and any redaction needed before sharing. The point matters in legal materials because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Legal Materials.',
          'When Reading Build Output touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Reading Build Output should not use legal materials to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-build-output-check-output',
        title: 'Build Output Check Output',
        body: [
          'Generated artifacts should be inspected as local outputs. Their existence does not prove renderer parity, legal completeness, or official release readiness. Reading Build Output uses the fact as check output evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Check Output.',
          'The surrounding context for Reading Build Output decides which adjacent topic is relevant. Reading Build Output should be compared with Running a Desktop Build with Permission, Running Resource and Shader Checks with Permission, Avoiding Unofficial Release Claims only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Reading Build Output crosses from check output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-build-output-local-artifact',
        title: 'Build Output Local Artifact',
        body: [
          'Reading Build Output separates the surface that accepts input from the component or document that controls the result. This is especially important when separating output, original materials, and third-party materials crosses a saved value, a renderer output, or a public form. That reading gives Reading Build Output a public anchor for local artifact without adding behavior that the current category does not own. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Local Artifact.',
          'Recovery or follow-up for Reading Build Output should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for local artifact does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Reading Build Output should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-build-output-release-language',
        title: 'Build Output Release Language',
        body: [
          'A public report based on the build command part of Reading Build Output should state the action, expected result, actual result, environment, and any redaction needed before sharing. For Reading Build Output, that fact identifies the first concrete boundary for release language: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Release Language.',
          'The main confusion risk in Reading Build Output is inferring permission from visibility. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the release language part of Reading Build Output should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-build-output-failure-reading',
        title: 'Build Output Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. In Reading Build Output, included resources is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Included Resources. Reading Build Output uses the fact as failure reading evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Failure Reading.',
          'Reportable evidence for Reading Build Output should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use failure reading to keep Reading Build Output tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-build-output-privacy',
        title: 'Build Output Build Privacy',
        body: [
          'Ownership in Reading Build Output is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. Reading Build Output uses the fact as build privacy evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Build Privacy.',
          'Adjacent pages matter for Reading Build Output, but adjacency does not move authority. Reading Build Output should be compared with Running a Desktop Build with Permission, Running Resource and Shader Checks with Permission, Avoiding Unofficial Release Claims only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use build privacy to keep Reading Build Output tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-build-output-related-distribution',
        title: 'Build Output Related Distribution',
        body: [
          'Reading Build Output should not use included resources to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in related distribution because separating output, original materials, and third-party materials can otherwise be mistaken for inferring permission from visibility. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Related Distribution.',
          'The public boundary for Reading Build Output is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Reading Build Output related distribution is a bounded explanation of material classification: enough detail to act, and enough restraint to avoid claims outside Build Execution.',
        ],
      },
      {
        id: 'reading-build-output-policy-limit',
        title: 'Build Output Policy Limit',
        body: [
          'When sharing build output, include the command, platform, relevant failure lines, and artifact path. Remove private paths, secrets, and unrelated logs before posting publicly. For Reading Build Output, that fact identifies the first concrete boundary for policy limit: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Policy Limit.',
          'An operator reading Reading Build Output should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'When Reading Build Output crosses from policy limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-build-output-operator-summary',
        title: 'Build Output Operator Summary',
        body: [
          'Visible feedback for Reading Build Output should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Build Execution. Reading Build Output uses the fact as operator summary evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Operator Summary.',
          'Implementation limits for Reading Build Output keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Reading Build Output crosses from operator summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-build-output-platform-limit',
        title: 'Build Output Platform Limit',
        body: [
          'Build logs should be read for actual command names, missing files, dependency errors, package-data warnings, and platform-specific failures. Do not summarize a command as successful unless it exited successfully. In Reading Build Output, platform limit is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Platform Limit.',
          'The summary value of Reading Build Output is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for platform limit does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Reading Build Output should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-build-output-closing-check',
        title: 'Build Output Closing Check',
        body: [
          'Artifact Scope defines the useful size of Reading Build Output. The article should be broad enough to explain material classification, but narrow enough that inferring permission from visibility remains outside the conclusion. In Reading Build Output, closing check is the difference between reading material classification and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading Build Output / Build and Release Checks / Build Execution / Closing Check.',
          'A final check for Reading Build Output should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Reading Build Output should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Running Resource and Shader Checks with Permission', 'Avoiding Unofficial Release Claims'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Release Checks and Claims',
    title: 'Running Package Checks with Permission',
    description:
      'Explains the repository package checks used for packaging and legal boundaries. This page treats desktop distribution evidence as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'running-package-checks-with-permission-artifact-scope',
        title: 'Package Checks with Permission Artifact Scope',
        body: [
          'Package checks inspect expected package data, legal material, resource paths, shader inclusion, native extension relationships, and desktop distribution assumptions. In Running Package Checks with Permission, artifact scope is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Artifact Scope. In Running Package Checks with Permission, artifact scope is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Artifact Scope.',
          'Artifact Scope defines the useful size of Running Package Checks with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion.',
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Package Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-platform-owner',
        title: 'Package Checks with Permission Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Running Package Checks with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. Running Package Checks with Permission uses the fact as platform owner evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Platform Owner.',
          'A direct observation for Running Package Checks with Permission should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'Use platform owner to keep Running Package Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-build-command',
        title: 'Package Checks with Permission Build Command',
        body: [
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Package Checks with Permission should be treated as an observation rather than a confirmed cause. Running Package Checks with Permission uses the fact as build command evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Build Command.',
          'Running Package Checks with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form.',
          'When Running Package Checks with Permission crosses from build command into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-included-resources',
        title: 'Package Checks with Permission Included Resources',
        body: [
          'Running Package Checks with Permission should be read as authorized operation for package checks with permission within Build and Release Checks and Release Checks and Claims. Running Package Checks with Permission uses the fact as platform owner evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Platform Owner. In Running Package Checks with Permission, included resources is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Included Resources.',
          'Ownership in Running Package Checks with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'If the available evidence for included resources does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Package Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-native-or-runtime',
        title: 'Package Checks with Permission Native or Runtime Path',
        body: [
          'A direct observation for Running Package Checks with Permission should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. Running Package Checks with Permission uses the fact as native or runtime path evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Native or Runtime Path.',
          'Visible feedback for Running Package Checks with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Release Checks and Claims.',
          'Use native or runtime path to keep Running Package Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-legal-materials',
        title: 'Package Checks with Permission Legal Materials',
        body: [
          'Use platform owner to keep Running Package Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner. That reading gives Running Package Checks with Permission a public anchor for legal materials without adding behavior that the current category does not own. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Legal Materials.',
          'When Running Package Checks with Permission touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for legal materials does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Package Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-check-output',
        title: 'Package Checks with Permission Check Output',
        body: [
          'A package check is a local repository verification command. It can fail because an expected source file, resource, license file, or package rule is missing. Running Package Checks with Permission uses the fact as build command evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Build Command. For Running Package Checks with Permission, that fact identifies the first concrete boundary for check output: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Check Output.',
          'The surrounding context for Running Package Checks with Permission decides which adjacent topic is relevant. Running Package Checks with Permission should be compared with Including License Text, Including Third Party License Text, Reading Build Output only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Running Package Checks with Permission crosses from check output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-local-artifact',
        title: 'Package Checks with Permission Local Artifact',
        body: [
          'Running Package Checks with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form. In Running Package Checks with Permission, local artifact is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Local Artifact.',
          'Recovery or follow-up for Running Package Checks with Permission should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for local artifact does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Package Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-release-language',
        title: 'Package Checks with Permission Release Language',
        body: [
          'When Running Package Checks with Permission crosses from build command into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for release language: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Release Language.',
          'The main confusion risk in Running Package Checks with Permission is describing local output as official release authority. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the release language part of Running Package Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-failure-reading',
        title: 'Package Checks with Permission Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. In Running Package Checks with Permission, included resources is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Included Resources. The fact also tells the reader which evidence to preserve for failure reading: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Failure Reading.',
          'Reportable evidence for Running Package Checks with Permission should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use failure reading to keep Running Package Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-privacy',
        title: 'Package Checks with Permission Build Privacy',
        body: [
          'Ownership in Running Package Checks with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The fact also tells the reader which evidence to preserve for build privacy: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Build Privacy.',
          'Adjacent pages matter for Running Package Checks with Permission, but adjacency does not move authority. Running Package Checks with Permission should be compared with Including License Text, Including Third Party License Text, Reading Build Output only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use build privacy to keep Running Package Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-related-distribution',
        title: 'Package Checks with Permission Related Distribution',
        body: [
          'If the available evidence for included resources does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Package Checks with Permission should be treated as an observation rather than a confirmed cause. In Running Package Checks with Permission, related distribution is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Related Distribution.',
          'The public boundary for Running Package Checks with Permission is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'If the available evidence for related distribution does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Package Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-policy-limit',
        title: 'Package Checks with Permission Policy Limit',
        body: [
          'Passing package checks does not prove every platform package launches. Use platform-specific build and runtime evidence for executable or bundle claims. Running Package Checks with Permission uses the fact as native or runtime path evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Native or Runtime Path. The fact also tells the reader which evidence to preserve for policy limit: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Policy Limit.',
          'An operator reading Running Package Checks with Permission should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'Use policy limit to keep Running Package Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-operator-summary',
        title: 'Package Checks with Permission Operator Summary',
        body: [
          'Visible feedback for Running Package Checks with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Release Checks and Claims. For Running Package Checks with Permission, that fact identifies the first concrete boundary for operator summary: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Operator Summary.',
          'Implementation limits for Running Package Checks with Permission keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Running Package Checks with Permission crosses from operator summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-platform-limit',
        title: 'Package Checks with Permission Platform Limit',
        body: [
          'Package checks inspect expected package data, legal material, resource paths, shader inclusion, native extension relationships, and desktop distribution assumptions. In Running Package Checks with Permission, artifact scope is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Artifact Scope. In Running Package Checks with Permission, platform limit is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Platform Limit.',
          'The summary value of Running Package Checks with Permission is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Running Package Checks with Permission should not use platform limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-package-checks-with-permission-closing-check',
        title: 'Package Checks with Permission Closing Check',
        body: [
          'Artifact Scope defines the useful size of Running Package Checks with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. The point matters in closing check because reading local build artifacts and package checks can otherwise be mistaken for describing local output as official release authority. The local reading frame is Running Package Checks with Permission / Build and Release Checks / Release Checks and Claims / Closing Check.',
          'A final check for Running Package Checks with Permission should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Running Package Checks with Permission closing check is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Release Checks and Claims.',
        ],
      },
    ],
    relatedTitles: ['Including License Text', 'Including Third Party License Text', 'Reading Build Output'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Release Checks and Claims',
    title: 'Running Resource and Shader Checks with Permission',
    description:
      'Explains checks for runtime resources and renderer shader material. This page treats desktop distribution evidence as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'running-resource-and-shader-checks-with-permission-artifact-scope',
        title: 'Resource and Shader Checks with Permission Artifact Scope',
        body: [
          'Resource checks verify expected runtime path handling, asset root resolution, generated-file ignore rules, and required visual asset root terms. That reading gives Running Resource and Shader Checks with Permission a public anchor for artifact scope without adding behavior that the current category does not own. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Artifact Scope.',
          'Artifact Scope defines the useful size of Running Resource and Shader Checks with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion.',
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Resource and Shader Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-platform-owner',
        title: 'Resource and Shader Checks with Permission Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Running Resource and Shader Checks with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. The fact also tells the reader which evidence to preserve for platform owner: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Platform Owner.',
          'A direct observation for Running Resource and Shader Checks with Permission should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'Use platform owner to keep Running Resource and Shader Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-build-command',
        title: 'Resource and Shader Checks with Permission Build Command',
        body: [
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Resource and Shader Checks with Permission should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for build command: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Build Command.',
          'Running Resource and Shader Checks with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form.',
          'A public report based on the build command part of Running Resource and Shader Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-included-resources',
        title: 'Resource and Shader Checks with Permission Included Resources',
        body: [
          'Running Resource and Shader Checks with Permission should be read as authorized operation for resource and shader checks with permission within Build and Release Checks and Release Checks and Claims. In Running Resource and Shader Checks with Permission, included resources is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Included Resources.',
          'Ownership in Running Resource and Shader Checks with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'Running Resource and Shader Checks with Permission should not use included resources to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-native-or-runtime',
        title: 'Resource and Shader Checks with Permission Native or Runtime Path',
        body: [
          'A direct observation for Running Resource and Shader Checks with Permission should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. Running Resource and Shader Checks with Permission uses the fact as native or runtime path evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Native or Runtime Path.',
          'Visible feedback for Running Resource and Shader Checks with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Release Checks and Claims.',
          'When Running Resource and Shader Checks with Permission crosses from native or runtime path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-legal-materials',
        title: 'Resource and Shader Checks with Permission Legal Materials',
        body: [
          'Use platform owner to keep Running Resource and Shader Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner. That reading gives Running Resource and Shader Checks with Permission a public anchor for legal materials without adding behavior that the current category does not own. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Legal Materials.',
          'When Running Resource and Shader Checks with Permission touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Running Resource and Shader Checks with Permission legal materials is a bounded explanation of desktop distribution evidence: enough detail to act, and enough restraint to avoid claims outside Release Checks and Claims.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-check-output',
        title: 'Resource and Shader Checks with Permission Check Output',
        body: [
          'Shader checks protect renderer shader resources for OpenGL and WGPU paths. They should be read with backend parity in mind. Running Resource and Shader Checks with Permission uses the fact as check output evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Check Output.',
          'The surrounding context for Running Resource and Shader Checks with Permission decides which adjacent topic is relevant. Running Resource and Shader Checks with Permission should be compared with Understanding OpenGL Rendering, Understanding WGPU Rendering, Reading Build Output only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Running Resource and Shader Checks with Permission crosses from check output into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-local-artifact',
        title: 'Resource and Shader Checks with Permission Local Artifact',
        body: [
          'Running Resource and Shader Checks with Permission separates the surface that accepts input from the component or document that controls the result. This is especially important when reading local build artifacts and package checks crosses a saved value, a renderer output, or a public form. In Running Resource and Shader Checks with Permission, local artifact is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Local Artifact.',
          'Recovery or follow-up for Running Resource and Shader Checks with Permission should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Running Resource and Shader Checks with Permission should not use local artifact to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-release-language',
        title: 'Resource and Shader Checks with Permission Release Language',
        body: [
          'A public report based on the build command part of Running Resource and Shader Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing. Running Resource and Shader Checks with Permission uses the fact as release language evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Release Language.',
          'The main confusion risk in Running Resource and Shader Checks with Permission is describing local output as official release authority. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Running Resource and Shader Checks with Permission crosses from release language into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-failure-reading',
        title: 'Resource and Shader Checks with Permission Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. In Running Resource and Shader Checks with Permission, included resources is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Included Resources. Running Resource and Shader Checks with Permission uses the fact as failure reading evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Failure Reading.',
          'Reportable evidence for Running Resource and Shader Checks with Permission should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use failure reading to keep Running Resource and Shader Checks with Permission tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-privacy',
        title: 'Resource and Shader Checks with Permission Build Privacy',
        body: [
          'Ownership in Running Resource and Shader Checks with Permission is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The fact also tells the reader which evidence to preserve for build privacy: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Build Privacy.',
          'Adjacent pages matter for Running Resource and Shader Checks with Permission, but adjacency does not move authority. Running Resource and Shader Checks with Permission should be compared with Understanding OpenGL Rendering, Understanding WGPU Rendering, Reading Build Output only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'A public report based on the build privacy part of Running Resource and Shader Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-related-distribution',
        title: 'Resource and Shader Checks with Permission Related Distribution',
        body: [
          'Running Resource and Shader Checks with Permission should not use included resources to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Running Resource and Shader Checks with Permission, related distribution is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Related Distribution.',
          'The public boundary for Running Resource and Shader Checks with Permission is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Running Resource and Shader Checks with Permission should not use related distribution to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-policy-limit',
        title: 'Resource and Shader Checks with Permission Policy Limit',
        body: [
          'Run these checks only within authorized scope, and report the exact failing resource or shader path instead of generalizing from one backend to the other. Running Resource and Shader Checks with Permission uses the fact as native or runtime path evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Native or Runtime Path. The fact also tells the reader which evidence to preserve for policy limit: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Policy Limit.',
          'An operator reading Running Resource and Shader Checks with Permission should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'A public report based on the policy limit part of Running Resource and Shader Checks with Permission should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-operator-summary',
        title: 'Resource and Shader Checks with Permission Operator Summary',
        body: [
          'Visible feedback for Running Resource and Shader Checks with Permission should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Release Checks and Claims. Running Resource and Shader Checks with Permission uses the fact as operator summary evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Operator Summary.',
          'Implementation limits for Running Resource and Shader Checks with Permission keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Running Resource and Shader Checks with Permission crosses from operator summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-platform-limit',
        title: 'Resource and Shader Checks with Permission Platform Limit',
        body: [
          'Resource checks verify expected runtime path handling, asset root resolution, generated-file ignore rules, and required visual asset root terms. In Running Resource and Shader Checks with Permission, platform limit is the difference between reading desktop distribution evidence and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Platform Limit.',
          'The summary value of Running Resource and Shader Checks with Permission is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for platform limit does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Running Resource and Shader Checks with Permission should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'running-resource-and-shader-checks-with-permission-closing-check',
        title: 'Resource and Shader Checks with Permission Closing Check',
        body: [
          'Artifact Scope defines the useful size of Running Resource and Shader Checks with Permission. The article should be broad enough to explain desktop distribution evidence, but narrow enough that describing local output as official release authority remains outside the conclusion. The point matters in closing check because reading local build artifacts and package checks can otherwise be mistaken for describing local output as official release authority. The local reading frame is Running Resource and Shader Checks with Permission / Build and Release Checks / Release Checks and Claims / Closing Check.',
          'A final check for Running Resource and Shader Checks with Permission should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Running Resource and Shader Checks with Permission should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
    ],
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding WGPU Rendering', 'Reading Build Output'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Release Checks and Claims',
    title: 'Avoiding Unofficial Release Claims',
    description:
      'Explains why local artifacts should not be described as official Ludoxel releases. This page treats hazard handling as a packaging guide for local desktop artifacts and release-adjacent checks, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'avoiding-unofficial-release-claims-artifact-scope',
        title: 'Unofficial Release Claims Artifact Scope',
        body: [
          'A local executable, bundle, ZIP file, screenshot, or build directory is local output. It is not an official release just because a build command produced it. In Avoiding Unofficial Release Claims, artifact scope is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Artifact Scope. In Avoiding Unofficial Release Claims, artifact scope is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Artifact Scope.',
          'Artifact Scope defines the useful size of Avoiding Unofficial Release Claims. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion.',
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Avoiding Unofficial Release Claims should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-platform-owner',
        title: 'Unofficial Release Claims Platform Owner',
        body: [
          'Artifact Scope defines the useful size of Avoiding Unofficial Release Claims. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. For Avoiding Unofficial Release Claims, that fact identifies the first concrete boundary for platform owner: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Platform Owner.',
          'A direct observation for Avoiding Unofficial Release Claims should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state.',
          'When Avoiding Unofficial Release Claims crosses from platform owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-build-command',
        title: 'Unofficial Release Claims Build Command',
        body: [
          'If the available evidence for artifact scope does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Avoiding Unofficial Release Claims should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for build command: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Build Command.',
          'Avoiding Unofficial Release Claims separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form.',
          'Use build command to keep Avoiding Unofficial Release Claims tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-included-resources',
        title: 'Unofficial Release Claims Included Resources',
        body: [
          'Avoiding Unofficial Release Claims should be read as risk avoidance for unofficial release claims within Build and Release Checks and Release Checks and Claims. That reading gives Avoiding Unofficial Release Claims a public anchor for included resources without adding behavior that the current category does not own. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Included Resources.',
          'Ownership in Avoiding Unofficial Release Claims is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies.',
          'The useful result of Avoiding Unofficial Release Claims included resources is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Release Checks and Claims.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-native-or-runtime',
        title: 'Unofficial Release Claims Native or Runtime Path',
        body: [
          'A direct observation for Avoiding Unofficial Release Claims should name what the user or reader actually sees before it assigns cause. That keeps the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result ahead of guesses about hidden state. Avoiding Unofficial Release Claims uses the fact as native or runtime path evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Native or Runtime Path.',
          'Visible feedback for Avoiding Unofficial Release Claims should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Release Checks and Claims.',
          'Use native or runtime path to keep Avoiding Unofficial Release Claims tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-legal-materials',
        title: 'Unofficial Release Claims Legal Materials',
        body: [
          'When Avoiding Unofficial Release Claims crosses from platform owner into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Avoiding Unofficial Release Claims a public anchor for legal materials without adding behavior that the current category does not own. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Legal Materials.',
          'When Avoiding Unofficial Release Claims touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for legal materials does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Avoiding Unofficial Release Claims should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-check-output',
        title: 'Unofficial Release Claims Check Output',
        body: [
          'Official distribution authority remains with the licensor and the governing license. Public repository visibility and local packaging capability do not create release permission. The fact also tells the reader which evidence to preserve for check output: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Check Output.',
          'The surrounding context for Avoiding Unofficial Release Claims decides which adjacent topic is relevant. Avoiding Unofficial Release Claims should be compared with Running a Desktop Build with Permission, Understanding Repository Visibility, Understanding Redistribution Restrictions only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the check output part of Avoiding Unofficial Release Claims should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-local-artifact',
        title: 'Unofficial Release Claims Local Artifact',
        body: [
          'Avoiding Unofficial Release Claims separates the surface that accepts input from the component or document that controls the result. This is especially important when reading health, fall, and void consequences crosses a saved value, a renderer output, or a public form. That reading gives Avoiding Unofficial Release Claims a public anchor for local artifact without adding behavior that the current category does not own. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Local Artifact.',
          'Recovery or follow-up for Avoiding Unofficial Release Claims should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'The useful result of Avoiding Unofficial Release Claims local artifact is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Release Checks and Claims.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-release-language',
        title: 'Unofficial Release Claims Release Language',
        body: [
          'Use build command to keep Avoiding Unofficial Release Claims tied to Build and Release Checks; use a related page only when the reader needs a different owner. Avoiding Unofficial Release Claims uses the fact as release language evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Release Language.',
          'The main confusion risk in Avoiding Unofficial Release Claims is hiding gameplay state behind a generic crash report. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use release language to keep Avoiding Unofficial Release Claims tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-failure-reading',
        title: 'Unofficial Release Claims Failure Reading',
        body: [
          'The relevant state is constrained by the article category: Distribution treats this topic as desktop package and release-evidence behavior. For Avoiding Unofficial Release Claims, that fact identifies the first concrete boundary for failure reading: package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Failure Reading.',
          'Reportable evidence for Avoiding Unofficial Release Claims should be small, concrete, and public. the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the failure reading part of Avoiding Unofficial Release Claims should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-privacy',
        title: 'Unofficial Release Claims Build Privacy',
        body: [
          'Ownership in Avoiding Unofficial Release Claims is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies. The fact also tells the reader which evidence to preserve for build privacy: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Build Privacy.',
          'Adjacent pages matter for Avoiding Unofficial Release Claims, but adjacency does not move authority. Avoiding Unofficial Release Claims should be compared with Running a Desktop Build with Permission, Understanding Repository Visibility, Understanding Redistribution Restrictions only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use build privacy to keep Avoiding Unofficial Release Claims tied to Build and Release Checks; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-related-distribution',
        title: 'Unofficial Release Claims Related Distribution',
        body: [
          'The useful result of Avoiding Unofficial Release Claims included resources is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Release Checks and Claims. The point matters in related distribution because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Related Distribution.',
          'The public boundary for Avoiding Unofficial Release Claims is part of the article, not an afterthought. It does not convert a local artifact or a local check into official release authority. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Avoiding Unofficial Release Claims should not use related distribution to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-policy-limit',
        title: 'Unofficial Release Claims Policy Limit',
        body: [
          'Describe local artifacts as local build output, local test output, or verification evidence. Avoid language that suggests public release, endorsement, redistribution rights, or official packaging status. Avoiding Unofficial Release Claims uses the fact as native or runtime path evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Native or Runtime Path. Avoiding Unofficial Release Claims uses the fact as policy limit evidence, then keeps the explanation inside Distribution rather than turning it into a project-wide claim. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Policy Limit.',
          'An operator reading Avoiding Unofficial Release Claims should follow distribution reading starts with the artifact type and build command, then checks included resources, legal materials, platform assumptions, and public claims. That order prevents a visible result from being treated as the first source of truth.',
          'When Avoiding Unofficial Release Claims crosses from policy limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-operator-summary',
        title: 'Unofficial Release Claims Operator Summary',
        body: [
          'Visible feedback for Avoiding Unofficial Release Claims should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Distribution / Build and Release Checks / Release Checks and Claims. The fact also tells the reader which evidence to preserve for operator summary: the exact command, platform, package type, artifact path, generated output, missing resource, fallback path, legal text inclusion, and check result. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Operator Summary.',
          'Implementation limits for Avoiding Unofficial Release Claims keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the operator summary part of Avoiding Unofficial Release Claims should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-platform-limit',
        title: 'Unofficial Release Claims Platform Limit',
        body: [
          'A local executable, bundle, ZIP file, screenshot, or build directory is local output. It is not an official release just because a build command produced it. In Avoiding Unofficial Release Claims, artifact scope is the difference between reading hazard handling and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Artifact Scope. The point matters in platform limit because reading health, fall, and void consequences can otherwise be mistaken for hiding gameplay state behind a generic crash report. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Platform Limit.',
          'The summary value of Avoiding Unofficial Release Claims is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Avoiding Unofficial Release Claims platform limit is a bounded explanation of hazard handling: enough detail to act, and enough restraint to avoid claims outside Release Checks and Claims.',
        ],
      },
      {
        id: 'avoiding-unofficial-release-claims-closing-check',
        title: 'Unofficial Release Claims Closing Check',
        body: [
          'Artifact Scope defines the useful size of Avoiding Unofficial Release Claims. The article should be broad enough to explain hazard handling, but narrow enough that hiding gameplay state behind a generic crash report remains outside the conclusion. That reading gives Avoiding Unofficial Release Claims a public anchor for closing check without adding behavior that the current category does not own. The local reading frame is Avoiding Unofficial Release Claims / Build and Release Checks / Release Checks and Claims / Closing Check.',
          'A final check for Avoiding Unofficial Release Claims should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify package metadata, desktop build tooling, resource inclusion rules, native-extension packaging, legal-material copying, and platform-specific runtime dependencies, Avoiding Unofficial Release Claims should be treated as an observation rather than a confirmed cause.',
        ],
      },
    ],
    relatedTitles: ['Running a Desktop Build with Permission', 'Understanding Repository Visibility', 'Understanding Redistribution Restrictions'],
  }),
];
