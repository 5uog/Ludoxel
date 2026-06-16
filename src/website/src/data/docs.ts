/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type DocsSection = {
  id: string;
  title: string;
  body: string[];
  items?: string[];
};

export const docsIntro = {
  eyebrow: 'Getting Started',
  title: 'Overview',
  description: 'Get a high-level understanding of the Ludoxel project and its core application paths.',
};

export const docsSections: DocsSection[] = [
  {
    id: 'what-is-ludoxel',
    title: 'What is Ludoxel?',
    body: [
      'Ludoxel is a desktop voxel sandbox built around a Python application core, a PyQt6 interface layer, and backend-specific rendering paths for OpenGL and WGPU.',
      'The public website is a documentation hub for understanding the application structure, renderer behavior, AI NPC systems, Othello mode, settings, and release notes.',
    ],
  },
  {
    id: 'core-features',
    title: 'Core Features',
    body: ['Explore the fundamental systems that define the current Ludoxel desktop application:'],
    items: [
      'Voxel sandbox runtime with world chunks, block interaction, player control, and persistent session data',
      'Renderer paths for OpenGL and WGPU, including fog, shadows, clouds, selections, HUD output, and player models',
      'AI NPC behavior covering movement, combat, block placement, route behavior, status tags, health indicators, and learning modes',
      'Othello mode with board state, rules, engines, opening resources, HUD output, settings, and presentation paths',
    ],
  },
  {
    id: 'project-architecture',
    title: 'Project Architecture',
    body: [
      'The desktop application lives under src/ludoxel and is separated into foundations, application, simulation, and presentation responsibilities.',
      'The website lives under src/website and remains a documentation surface. It must not publish copied reference-site assets, mirrored third-party source output, or unverified release artifacts.',
    ],
  },
  {
    id: 'settings-and-backends',
    title: 'Settings and Backends',
    body: [
      'Settings cover display, world, player, audio, camera, clouds, shadows, AI, and Othello controls.',
      'Renderer behavior must preserve backend parity when a feature has both OpenGL and WGPU paths.',
    ],
  },
  {
    id: 'getting-help',
    title: 'Getting Help',
    body: [
      'Use the documentation overview and changelog to understand the implemented systems before changing the application.',
      'For repository inspection, review the source tree and project instructions first, then verify changes against the actual files and available checks.',
    ],
  },
];

export const onThisPage = docsSections.map((section: DocsSection) => ({
  label: section.title,
  href: `#${section.id}`,
}));
