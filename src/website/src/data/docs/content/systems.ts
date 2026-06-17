/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const systemsPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Session Loop',
    title: 'Understanding Fixed Step Sessions',
    relatedTitles: ['Understanding Render Snapshots', 'Understanding Saved Preferences', 'Switching Play Spaces'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Session Loop',
    title: 'Understanding Render Snapshots',
    relatedTitles: ['Understanding Fixed Step Sessions', 'Understanding OpenGL Rendering', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Saved Preferences',
    relatedTitles: ['Reading Saved Preferences', 'Locating User Data', 'Changing Camera Preferences'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Keybind Resolution',
    relatedTitles: ['Changing Keybind Preferences', 'Using Mouse Capture', 'Understanding Overlay Input Blocking'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Overlay Input Blocking',
    relatedTitles: ['Using the Inventory Overlay', 'Recovering after Death', 'Understanding Keybind Resolution'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'Backend Implementations',
    title: 'Understanding OpenGL Rendering',
    relatedTitles: ['Understanding WGPU Rendering', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'Backend Implementations',
    title: 'Understanding WGPU Rendering',
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding Render Distance Fog and Shadows',
    relatedTitles: ['Changing Shadow Preferences', 'Changing Cloud Preferences', 'Understanding OpenGL Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding Selection Outlines',
    relatedTitles: ['Understanding Block Shapes', 'Reading Placement Rejection', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Audio Feedback',
    title: 'Understanding Material Sounds',
    relatedTitles: ['Changing Audio Preferences', 'Supplying Platform Evidence', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Audio Feedback',
    title: 'Understanding Ambient Sounds',
    relatedTitles: ['Changing Audio Preferences', 'Supplying Platform Evidence', 'Understanding Material Sounds'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'AI Decision Records',
    title: 'Understanding AI Action Selection',
    relatedTitles: ['Understanding AI Learning Records', 'Understanding Policy Evaluation', 'Understanding AI Combat'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'AI Decision Records',
    title: 'Understanding AI Learning Records',
    relatedTitles: ['Reading Demonstration Data', 'Handling Corrupt Learning Rows', 'Training a Policy'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Policy and Search',
    title: 'Understanding Policy Evaluation',
    relatedTitles: ['Applying a Learned Policy', 'Reading Learned Policies', 'Understanding AI Action Selection'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Policy and Search',
    title: 'Understanding Othello Search',
    relatedTitles: ['Understanding Othello AI Turns', 'Changing Othello AI Strength', 'Changing Othello Book Behavior'],
  }),
];
