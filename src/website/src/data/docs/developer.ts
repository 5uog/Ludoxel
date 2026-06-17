/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from './types';

export const developerPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Structure',
    group: 'Source Boundaries',
    title: 'Reading the Four Layer Boundary',
    relatedTitles: ['Keeping Simulation Independent', 'Keeping Presentation Styling Out of Python Logic', 'Reading Asset Roots'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Structure',
    group: 'Source Boundaries',
    title: 'Keeping Simulation Independent',
    relatedTitles: ['Reading the Four Layer Boundary', 'Understanding AI Action Selection', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Structure',
    group: 'Source Boundaries',
    title: 'Keeping Presentation Styling Out of Python Logic',
    relatedTitles: ['Reading the Four Layer Boundary', 'Running Web Formatting with Permission', 'Reading Documentation Check Failures'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Repository Structure',
    group: 'Source Boundaries',
    title: 'Reading Asset Roots',
    relatedTitles: ['Understanding Third Party Material Boundaries', 'Including Third Party License Text', 'Separating User Data from Source Files'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Documentation Sources',
    group: 'Docs Responsibilities',
    title: 'Reading README Responsibilities',
    relatedTitles: ['Reading License Responsibilities', 'Reading Website Docs Responsibilities', 'Understanding Controlling Text'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Documentation Sources',
    group: 'Docs Responsibilities',
    title: 'Reading License Responsibilities',
    relatedTitles: ['Understanding License Authority', 'Reading README Responsibilities', 'Including License Text'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Documentation Sources',
    group: 'Docs Responsibilities',
    title: 'Reading Website Docs Responsibilities',
    relatedTitles: ['Reading README Responsibilities', 'Avoiding Internal Instruction Leakage', 'Understanding Public Issue Limits'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling',
    group: 'Commands and Checks',
    title: 'Running Project Checks with Permission',
    relatedTitles: ['Reading Documentation Check Failures', 'Running Web Formatting with Permission', 'Running Desktop Builds with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling',
    group: 'Commands and Checks',
    title: 'Reading Documentation Check Failures',
    relatedTitles: ['Running Project Checks with Permission', 'Reading Website Docs Responsibilities', 'Running Package Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling',
    group: 'Commands and Checks',
    title: 'Running Web Formatting with Permission',
    relatedTitles: ['Running Project Checks with Permission', 'Keeping Presentation Styling Out of Python Logic', 'Changing Shadow Preferences'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'Tooling',
    group: 'Commands and Checks',
    title: 'Running Desktop Builds with Permission',
    relatedTitles: ['Running a Desktop Build with Permission', 'Reading Build Output', 'Avoiding Unofficial Release Claims'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'GitHub Policy',
    group: 'Repository Operations',
    title: 'Reading Contribution Policy',
    relatedTitles: ['Understanding Contribution Refusal', 'Understanding Pull Request Boundaries', 'Reading Issue Template Boundaries'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'GitHub Policy',
    group: 'Repository Operations',
    title: 'Reading Security Policy',
    relatedTitles: ['Understanding Private Security Reporting', 'Requesting a Private Security Channel', 'Avoiding Public Exploit Details'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'GitHub Policy',
    group: 'Repository Operations',
    title: 'Reading Issue Template Boundaries',
    relatedTitles: ['Writing a Problem Report', 'Asking a Limited Question', 'Requesting a Private Security Channel'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'GitHub Policy',
    group: 'Repository Operations',
    title: 'Writing Commit Messages After Authorized Changes',
    relatedTitles: ['Avoiding Internal Instruction Leakage', 'Avoiding Unauthorized Repository Operations', 'Running Project Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'GitHub Policy',
    group: 'Repository Operations',
    title: 'Avoiding Internal Instruction Leakage',
    relatedTitles: ['Writing Commit Messages After Authorized Changes', 'Reading Website Docs Responsibilities', 'Understanding Public Issue Limits'],
  }),
  defineDocsArticle({
    category: 'Developer',
    subcategory: 'GitHub Policy',
    group: 'Repository Operations',
    title: 'Avoiding Unauthorized Repository Operations',
    relatedTitles: ['Writing Commit Messages After Authorized Changes', 'Running Desktop Builds with Permission', 'Avoiding Unofficial Release Claims'],
  }),
];
