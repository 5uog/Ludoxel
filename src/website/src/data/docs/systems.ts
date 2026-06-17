/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from './types';

export const systemsPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime',
    group: 'Sessions',
    title: 'Understanding Fixed Step Sessions',
    relatedTitles: ['Understanding Render Snapshots', 'Understanding Saved Preferences', 'Switching Play Spaces'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime',
    group: 'Sessions',
    title: 'Understanding Render Snapshots',
    relatedTitles: ['Understanding Fixed Step Sessions', 'Understanding OpenGL Rendering', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime',
    group: 'Sessions',
    title: 'Understanding Saved Preferences',
    relatedTitles: ['Reading Saved Preferences', 'Locating User Data', 'Changing Camera Preferences'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering',
    group: 'Backend and World Rendering',
    title: 'Understanding OpenGL Rendering',
    relatedTitles: ['Understanding WGPU Rendering', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering',
    group: 'Backend and World Rendering',
    title: 'Understanding WGPU Rendering',
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering',
    group: 'Backend and World Rendering',
    title: 'Understanding Render Distance Fog and Shadows',
    relatedTitles: ['Changing Shadow Preferences', 'Changing Cloud Preferences', 'Understanding OpenGL Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering',
    group: 'Backend and World Rendering',
    title: 'Understanding Selection Outlines',
    relatedTitles: ['Understanding Block Shapes', 'Reading Placement Rejection', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Audio and Input',
    group: 'Feedback and Capture',
    title: 'Understanding Material Sounds',
    relatedTitles: ['Changing Audio Preferences', 'Supplying Platform Evidence', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Audio and Input',
    group: 'Feedback and Capture',
    title: 'Understanding Ambient Sounds',
    relatedTitles: ['Changing Audio Preferences', 'Supplying Platform Evidence', 'Understanding Material Sounds'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Audio and Input',
    group: 'Feedback and Capture',
    title: 'Understanding Keybind Resolution',
    relatedTitles: ['Changing Keybind Preferences', 'Using Mouse Capture', 'Understanding Overlay Input Blocking'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Audio and Input',
    group: 'Feedback and Capture',
    title: 'Understanding Overlay Input Blocking',
    relatedTitles: ['Using the Inventory Overlay', 'Recovering after Death', 'Understanding Keybind Resolution'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Intelligence',
    group: 'AI and Othello Systems',
    title: 'Understanding AI Action Selection',
    relatedTitles: ['Understanding AI Learning Records', 'Understanding Policy Evaluation', 'Understanding AI Combat'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Intelligence',
    group: 'AI and Othello Systems',
    title: 'Understanding AI Learning Records',
    relatedTitles: ['Reading Demonstration Data', 'Handling Corrupt Learning Rows', 'Training a Policy'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Intelligence',
    group: 'AI and Othello Systems',
    title: 'Understanding Policy Evaluation',
    relatedTitles: ['Applying a Learned Policy', 'Reading Learned Policies', 'Understanding AI Action Selection'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Intelligence',
    group: 'AI and Othello Systems',
    title: 'Understanding Othello Search',
    relatedTitles: ['Understanding Othello AI Turns', 'Changing Othello AI Strength', 'Changing Othello Book Behavior'],
  }),
];
