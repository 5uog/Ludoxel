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
    relatedTitles: ['Running Package Checks with Permission', 'Including License Text', 'Supplying Platform Evidence'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Platform Packages',
    title: 'Understanding the macOS Application Bundle',
    relatedTitles: ['Understanding WGPU Rendering', 'Running Package Checks with Permission', 'Supplying Platform Evidence'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Packaged Components',
    title: 'Understanding Native Extension Fallbacks',
    relatedTitles: ['Running Desktop Builds with Permission', 'Reading Build Output', 'Running Resource and Shader Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Packaged Components',
    title: 'Including License Text',
    relatedTitles: ['Understanding License Authority', 'Including Third Party License Text', 'Running Package Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Desktop Artifacts',
    group: 'Packaged Components',
    title: 'Including Third Party License Text',
    relatedTitles: ['Understanding Third Party Material Boundaries', 'Including License Text', 'Reading Asset Roots'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Build Execution',
    title: 'Running a Desktop Build with Permission',
    relatedTitles: ['Reading Build Output', 'Avoiding Unofficial Release Claims', 'Running Package Checks with Permission'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Build Execution',
    title: 'Reading Build Output',
    relatedTitles: ['Running a Desktop Build with Permission', 'Running Resource and Shader Checks with Permission', 'Avoiding Unofficial Release Claims'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Release Checks and Claims',
    title: 'Running Package Checks with Permission',
    relatedTitles: ['Including License Text', 'Including Third Party License Text', 'Reading Build Output'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Release Checks and Claims',
    title: 'Running Resource and Shader Checks with Permission',
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding WGPU Rendering', 'Reading Build Output'],
  }),
  defineDocsArticle({
    category: 'Distribution',
    subcategory: 'Build and Release Checks',
    group: 'Release Checks and Claims',
    title: 'Avoiding Unofficial Release Claims',
    relatedTitles: ['Running a Desktop Build with Permission', 'Understanding Repository Visibility', 'Understanding Redistribution Restrictions'],
  }),
];
