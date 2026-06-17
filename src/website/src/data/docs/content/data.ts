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
    relatedTitles: ['Separating User Data from Source Files', 'Cleaning Local User Data Safely', 'Reading Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'User Data Location',
    title: 'Separating User Data from Source Files',
    relatedTitles: ['Locating User Data', 'Separating Original Materials from Output', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'User Data Location',
    title: 'Cleaning Local User Data Safely',
    relatedTitles: ['Locating User Data', 'Reading Saved World State', 'Reading Saved AI State'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved Preferences',
    relatedTitles: ['Understanding Saved Preferences', 'Changing Camera Preferences', 'Changing Audio Preferences'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved World State',
    relatedTitles: ['Building in My World', 'Cleaning Local User Data Safely', 'Understanding User-Created Materials'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved AI State',
    relatedTitles: ['Naming an AI NPC', 'Choosing an AI Skin Source', 'Reading Learned Policies'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved Othello State',
    relatedTitles: ['Reading Match Results', 'Understanding Othello Setting Persistence', 'Changing Othello Book Behavior'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Reading Demonstration Data',
    relatedTitles: ['Understanding AI Learning Records', 'Training a Policy', 'Handling Corrupt Learning Rows'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Reading Learned Policies',
    relatedTitles: ['Applying a Learned Policy', 'Understanding Policy Evaluation', 'Training a Policy'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Handling Corrupt Learning Rows',
    relatedTitles: ['Reading Demonstration Data', 'Training a Policy', 'Understanding AI Learning Records'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding Application Output',
    relatedTitles: ['Understanding Generated Output', 'Separating Original Materials from Output', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding User-Created Materials',
    relatedTitles: ['Understanding Application Output', 'Understanding Ordinary Application Use', 'Separating Original Materials from Output'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Separating Original Materials from Output',
    relatedTitles: ['Understanding Original Materials', 'Understanding Generated Output', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding Third Party Material Boundaries',
    relatedTitles: ['Including Third Party License Text', 'Reading Asset Roots'],
  }),
];
