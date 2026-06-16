/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { dataPages } from './data';
import { developerPages } from './developer';
import { distributionPages } from './distribution';
import { gameplayPages } from './gameplay';
import { legalPages } from './legal';
import { manualPages } from './manual';
import { settingsPages } from './settings';
import { supportPages } from './support';
import { systemsPages } from './systems';
import type { DocsPageContent } from './types';

export const docsPages: DocsPageContent[] = [
  ...manualPages,
  ...gameplayPages,
  ...systemsPages,
  ...settingsPages,
  ...dataPages,
  ...distributionPages,
  ...legalPages,
  ...supportPages,
  ...developerPages,
];
