/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from './types';

export const supportPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Problem Reports',
    group: 'Public Issue Reports',
    title: 'Writing a Problem Report',
    relatedTitles: ['Supplying Reproduction Steps', 'Supplying Platform Evidence', 'Understanding Public Issue Limits'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Problem Reports',
    group: 'Public Issue Reports',
    title: 'Supplying Reproduction Steps',
    relatedTitles: ['Writing a Problem Report', 'Supplying Platform Evidence', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Problem Reports',
    group: 'Public Issue Reports',
    title: 'Supplying Platform Evidence',
    relatedTitles: ['Supplying Logs Without Secrets', 'Understanding the Windows Executable', 'Understanding the macOS Application Bundle'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Problem Reports',
    group: 'Public Issue Reports',
    title: 'Supplying Logs Without Secrets',
    relatedTitles: ['Writing a Problem Report', 'Avoiding Public Exploit Details', 'Understanding Private Security Reporting'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Limited Questions',
    group: 'Scope',
    title: 'Asking a Limited Question',
    relatedTitles: ['Keeping a Question Within Scope', 'Avoiding Feature Requests', 'Understanding Public Issue Limits'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Limited Questions',
    group: 'Scope',
    title: 'Keeping a Question Within Scope',
    relatedTitles: ['Asking a Limited Question', 'Understanding Unsupported Requests', 'Reading Issue Template Boundaries'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Limited Questions',
    group: 'Scope',
    title: 'Avoiding Feature Requests',
    relatedTitles: ['Understanding Contribution Refusal', 'Understanding Pull Request Boundaries', 'Keeping a Question Within Scope'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security Contact',
    group: 'Safety',
    title: 'Requesting a Private Security Channel',
    relatedTitles: ['Avoiding Public Exploit Details', 'Understanding Private Security Reporting', 'Reading Security Policy'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security Contact',
    group: 'Safety',
    title: 'Avoiding Public Exploit Details',
    relatedTitles: ['Requesting a Private Security Channel', 'Supplying Logs Without Secrets', 'Separating Security Reports from Problem Reports'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Security Contact',
    group: 'Safety',
    title: 'Separating Security Reports from Problem Reports',
    relatedTitles: ['Writing a Problem Report', 'Requesting a Private Security Channel', 'Understanding Private Security Reporting'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Unsupported Requests',
    group: 'Closure',
    title: 'Understanding Closure Without Review',
    relatedTitles: ['Understanding Unsupported Requests', 'Understanding Contribution Refusal', 'Reading Issue Template Boundaries'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Unsupported Requests',
    group: 'Closure',
    title: 'Understanding Unsafe Public Content',
    relatedTitles: ['Avoiding Public Exploit Details', 'Supplying Logs Without Secrets', 'Requesting a Private Security Channel'],
  }),
  defineDocsArticle({
    category: 'Support',
    subcategory: 'Unsupported Requests',
    group: 'Closure',
    title: 'Understanding Unsupported Requests',
    relatedTitles: ['Avoiding Feature Requests', 'Understanding Closure Without Review', 'Understanding Contribution Refusal'],
  }),
];
