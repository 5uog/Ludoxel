/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const legalPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Authority Text',
    title: 'Understanding License Authority',
    relatedTitles: ['Understanding Controlling Text', 'Including License Text', 'Understanding Repository Visibility'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Authority Text',
    title: 'Understanding Controlling Text',
    relatedTitles: ['Understanding License Authority', 'Including License Text', 'Understanding Original Materials'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Repository Visibility',
    relatedTitles: ['Understanding License Authority', 'Understanding Public Issue Limits', 'Avoiding Unofficial Release Claims'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Original Materials',
    relatedTitles: ['Separating Original Materials from Output', 'Understanding Third Party Material Boundaries', 'Understanding License Authority'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'License Authority and Materials',
    group: 'Material Scope',
    title: 'Understanding Distribution Materials',
    relatedTitles: ['Including License Text', 'Avoiding Unofficial Release Claims', 'Understanding Redistribution Restrictions'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Ordinary Use and Output',
    title: 'Understanding Ordinary Application Use',
    relatedTitles: ['Understanding User-Created Materials', 'Understanding Generated Output', 'Understanding Redistribution Restrictions'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Ordinary Use and Output',
    title: 'Understanding Generated Output',
    relatedTitles: ['Understanding Application Output', 'Understanding User-Created Materials', 'Separating Original Materials from Output'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding Redistribution Restrictions',
    relatedTitles: ['Understanding License Authority', 'Avoiding Unofficial Release Claims', 'Understanding Distribution Materials'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding Derivative Work Restrictions',
    relatedTitles: ['Understanding Original Materials', 'Understanding Redistribution Restrictions', 'Understanding Contribution Refusal'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Use Permissions and Restrictions',
    group: 'Restricted Uses',
    title: 'Understanding AI Use Restrictions',
    relatedTitles: ['Understanding Contribution Refusal', 'Understanding Original Materials', 'Understanding User-Created Materials'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Public and Private Reporting',
    title: 'Understanding Public Issue Limits',
    relatedTitles: ['Writing a Problem Report', 'Asking a Limited Question', 'Understanding Private Security Reporting'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Public and Private Reporting',
    title: 'Understanding Private Security Reporting',
    relatedTitles: ['Requesting a Private Security Channel', 'Avoiding Public Exploit Details', 'Reading Security Policy'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Contribution Boundaries',
    title: 'Understanding Contribution Refusal',
    relatedTitles: ['Understanding Pull Request Boundaries', 'Reading Contribution Policy', 'Avoiding Feature Requests'],
  }),
  defineDocsArticle({
    category: 'Legal',
    subcategory: 'Reporting and Contributions',
    group: 'Contribution Boundaries',
    title: 'Understanding Pull Request Boundaries',
    relatedTitles: ['Understanding Contribution Refusal', 'Reading Issue Template Boundaries', 'Avoiding Unauthorized Repository Operations'],
  }),
];
