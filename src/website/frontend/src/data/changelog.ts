/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import changelogData from './changelog.data.json';

export type ChangelogSection = {
  title: string;
  items: string[];
};

export type ChangelogEntry = {
  date: string;
  tags: string[];
  sections: ChangelogSection[];
};

export const changelogEntries: ChangelogEntry[] = (changelogData as { entries: ChangelogEntry[] }).entries;
