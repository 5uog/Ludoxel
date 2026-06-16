/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type ChangelogSection = {
  title: string;
  items: string[];
};

export type ChangelogEntry = {
  date: string;
  tags: string[];
  sections: ChangelogSection[];
};

export const changelogEntries: ChangelogEntry[] = [
  {
    date: 'Unreleased',
    tags: ['Website', 'Documentation'],
    sections: [
      {
        title: 'Public website updates',
        items: [
          'Removed the standalone Download page from routing, navigation, and search.',
          'Changed the Get started action to open the Ludoxel GitHub repository.',
          'Removed the home category, support, assistant preview, application image, and custom visual sections.',
          'Restored the documentation navigation layout, active section indicators, mobile navigation access, and search dialog behavior.',
        ],
      },
    ],
  },
];
