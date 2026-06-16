/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type DocsSearchSection = 'Manual' | 'Gameplay' | 'Systems' | 'Settings' | 'Data' | 'Distribution' | 'Legal' | 'Support' | 'Developer';

export type DocsReference = {
  title: string;
  href: string;
  description: string;
};

export type DocsSection = {
  id: string;
  title: string;
  body: string[];
  items?: string[];
};

export type DocsPageContent = {
  slug: string;
  navigationTitle: string;
  eyebrow: string;
  title: string;
  description: string;
  searchSection: DocsSearchSection;
  sections: DocsSection[];
  references?: DocsReference[];
};
