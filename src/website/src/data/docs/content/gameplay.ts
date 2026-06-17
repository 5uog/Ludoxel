/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const gameplayPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Block Construction',
    title: 'Building in My World',
    relatedTitles: ['Understanding Block Shapes', 'Reading Placement Rejection', 'Reading Saved World State'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Block Construction',
    title: 'Understanding Block Shapes',
    relatedTitles: ['Reading Placement Rejection', 'Understanding Selection Outlines', 'Building in My World'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Placement and Hazards',
    title: 'Reading Placement Rejection',
    relatedTitles: ['Building in My World', 'Understanding Block Shapes', 'Changing AI Behavior Values'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Placement and Hazards',
    title: 'Surviving Fall and Void Hazards',
    relatedTitles: ['Moving the Player', 'Recovering after Death', 'Reading Saved World State'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Lifecycle',
    title: 'Spawning AI NPCs',
    relatedTitles: ['Reading AI Nametags and Health', 'Naming an AI NPC', 'Changing AI Behavior Values'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Lifecycle',
    title: 'Reading AI Nametags and Health',
    relatedTitles: ['Spawning AI NPCs', 'Understanding AI Combat', 'Understanding Render Snapshots'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Actions',
    title: 'Understanding AI Combat',
    relatedTitles: ['Reading AI Nametags and Health', 'Changing AI Behavior Values', 'Understanding AI Action Selection'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Actions',
    title: 'Understanding AI Placement Behavior',
    relatedTitles: ['Reading Placement Rejection', 'Understanding AI Action Selection', 'Applying a Learned Policy'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Turns',
    title: 'Starting an Othello Match',
    relatedTitles: ['Placing an Othello Move', 'Changing Match Rules', 'Changing Othello AI Strength'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Turns',
    title: 'Placing an Othello Move',
    relatedTitles: ['Starting an Othello Match', 'Reading Match Results', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Outcomes',
    title: 'Understanding Othello AI Turns',
    relatedTitles: ['Changing Othello AI Strength', 'Changing Othello Book Behavior', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Outcomes',
    title: 'Reading Match Results',
    relatedTitles: ['Placing an Othello Move', 'Reading Saved Othello State', 'Understanding Othello Setting Persistence'],
  }),
];
