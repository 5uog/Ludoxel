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
    relatedTitles: ['Keeping Simulation Independent', 'Keeping Presentation Styling Out of Python Logic', 'Reading Asset Roots'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Source Architecture',
    group: 'Layer Boundaries',
    title: 'Keeping Simulation Independent',
    relatedTitles: ['Reading the Four Layer Boundary', 'Understanding AI Action Selection', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Source Architecture',
    group: 'Presentation and Assets',
    title: 'Keeping Presentation Styling Out of Python Logic',
    relatedTitles: ['Reading the Four Layer Boundary', 'Running Web Formatting with Permission', 'Reading Documentation Check Failures'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Source Architecture',
    group: 'Presentation and Assets',
    title: 'Reading Asset Roots',
    relatedTitles: ['Understanding Third Party Material Boundaries', 'Including Third Party License Text', 'Separating User Data from Source Files'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Runtime Integration',
    group: 'Session Assembly',
    title: 'Reading Application Bootstrap Flow',
    relatedTitles: ['Reading Play Space Factories', 'Understanding Fixed Step Sessions', 'Switching Play Spaces'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Runtime Integration',
    group: 'Session Assembly',
    title: 'Reading Play Space Factories',
    relatedTitles: ['Reading Application Bootstrap Flow', 'Switching Play Spaces', 'Understanding Fixed Step Sessions'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Runtime Integration',
    group: 'Persistence Boundaries',
    title: 'Reading Persistence Schemas',
    relatedTitles: ['Reading Store Responsibilities', 'Reading Saved Preferences', 'Understanding Othello Setting Persistence'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Runtime Integration',
    group: 'Persistence Boundaries',
    title: 'Reading Store Responsibilities',
    relatedTitles: ['Reading Persistence Schemas', 'Reading Saved World State', 'Reading Saved AI State'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling and Checks',
    group: 'Repository Checks',
    title: 'Running Project Checks with Permission',
    relatedTitles: ['Reading Documentation Check Failures', 'Running Web Formatting with Permission', 'Running Desktop Builds with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling and Checks',
    group: 'Repository Checks',
    title: 'Reading Documentation Check Failures',
    relatedTitles: ['Running Project Checks with Permission', 'Running Package Checks with Permission', 'Running Web Formatting with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling and Checks',
    group: 'Formatting and Builds',
    title: 'Running Web Formatting with Permission',
    relatedTitles: ['Running Project Checks with Permission', 'Keeping Presentation Styling Out of Python Logic', 'Changing Shadow Preferences'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling and Checks',
    group: 'Formatting and Builds',
    title: 'Running Desktop Builds with Permission',
    relatedTitles: ['Running a Desktop Build with Permission', 'Reading Build Output', 'Avoiding Unofficial Release Claims'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Public Policy Files',
    title: 'Reading Contribution Policy',
    relatedTitles: ['Understanding Contribution Refusal', 'Understanding Pull Request Boundaries', 'Reading Issue Template Boundaries'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Public Policy Files',
    title: 'Reading Security Policy',
    relatedTitles: ['Understanding Private Security Reporting', 'Requesting a Private Security Channel', 'Avoiding Public Exploit Details'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Issue and Commit Operations',
    title: 'Reading Issue Template Boundaries',
    relatedTitles: ['Writing a Problem Report', 'Asking a Limited Question', 'Requesting a Private Security Channel'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Issue and Commit Operations',
    title: 'Writing Commit Messages After Authorized Changes',
    relatedTitles: ['Avoiding Unauthorized Repository Operations', 'Reading Issue Template Boundaries', 'Running Project Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Policy',
    group: 'Issue and Commit Operations',
    title: 'Avoiding Unauthorized Repository Operations',
    relatedTitles: ['Writing Commit Messages After Authorized Changes', 'Running Desktop Builds with Permission', 'Avoiding Unofficial Release Claims'],
  }),
];
