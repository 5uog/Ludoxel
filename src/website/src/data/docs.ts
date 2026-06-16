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

export type DocsPageContent = {
  slug: string;
  navigationTitle: string;
  eyebrow: string;
  title: string;
  description: string;
  searchSection: 'Application' | 'Systems' | 'Project';
  sections: DocsSection[];
};

export const docsDefaultSlug = 'introduction';

export const docsPages: DocsPageContent[] = [
  {
    slug: 'introduction',
    navigationTitle: 'Introduction',
    eyebrow: 'Application',
    title: 'Introduction',
    description: 'A direct entry point for understanding what Ludoxel is, what this website documents, and what the public documentation does not claim.',
    searchSection: 'Application',
    sections: [
      {
        id: 'purpose',
        title: 'Purpose',
        body: [
          'Ludoxel is a desktop voxel sandbox project. The website documents the application surface, runtime systems, renderer paths, AI NPC behavior, Othello mode, settings, and repository-facing notes.',
          'This documentation is a public orientation layer. It must stay tied to implemented project structure and must not invent installer availability, release artifacts, unsupported platforms, or copied reference-site assets.',
        ],
      },
      {
        id: 'application-scope',
        title: 'Application scope',
        body: ['The current public documentation should direct readers toward the major application areas that actually exist in the repository:'],
        items: [
          'World runtime and block interaction paths',
          'OpenGL and WGPU rendering backends',
          'AI NPC movement, combat, placement, status, and learning systems',
          'Othello mode, rules, engines, HUD, and settings',
          'Project structure, legal boundary, and support routes',
        ],
      },
      {
        id: 'documentation-boundary',
        title: 'Documentation boundary',
        body: [
          'The website is not a download mirror and not a release archive. It should describe the project without presenting unverified binary distribution claims.',
          'When a page discusses implementation details, it should describe source-owned systems and avoid placeholder marketing sections that are not backed by the project files.',
        ],
      },
    ],
  },
  {
    slug: 'world-runtime',
    navigationTitle: 'World Runtime',
    eyebrow: 'Application',
    title: 'World Runtime',
    description: 'World session behavior, block interaction, player state, collision, persistence, and runtime stepping.',
    searchSection: 'Application',
    sections: [
      {
        id: 'session-runtime',
        title: 'Session runtime',
        body: [
          'The world runtime is organized around session state, fixed-step updates, player state, AI actors, inventory state, and render snapshots consumed by the presentation layer.',
          'Runtime behavior should remain separated from UI styling and renderer-specific implementation details.',
        ],
      },
      {
        id: 'block-interaction',
        title: 'Block interaction',
        body: ['Block interaction documentation should cover the paths users actually touch during play:'],
        items: ['Picking blocks', 'Breaking blocks', 'Placing blocks', 'Collision and stepping', 'Sneak and support behavior', 'Persistent world state'],
      },
      {
        id: 'state-ownership',
        title: 'State ownership',
        body: ['Simulation state belongs to the simulation and application layers. Presentation code should consume snapshots and dispatch user intent rather than owning authoritative world rules.'],
      },
    ],
  },
  {
    slug: 'rendering',
    navigationTitle: 'Rendering Backends',
    eyebrow: 'Systems',
    title: 'Rendering Backends',
    description: 'OpenGL, WGPU, world drawing, fog, shadow maps, clouds, selections, HUD output, and backend parity.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'backend-scope',
        title: 'Backend scope',
        body: [
          'Ludoxel contains backend-specific rendering paths for OpenGL and WGPU. Shared renderer behavior should remain consistent unless a backend-specific limitation is explicitly documented.',
        ],
      },
      {
        id: 'world-visuals',
        title: 'World visuals',
        body: ['Renderer documentation should cover visual systems as implementation-backed systems rather than decorative website claims:'],
        items: ['World chunk drawing', 'Distance fog', 'Shadow maps', 'Cloud fields', 'Selection outlines', 'Held blocks and first-person arm rendering', 'Player and AI model rendering'],
      },
      {
        id: 'parity-rule',
        title: 'Parity rule',
        body: ['When OpenGL and WGPU both implement a feature, documentation and implementation should preserve the same user-visible behavior across both backends.'],
      },
    ],
  },
  {
    slug: 'ai-npcs',
    navigationTitle: 'AI NPC Systems',
    eyebrow: 'Systems',
    title: 'AI NPC Systems',
    description: 'AI NPC movement, combat, placement, route behavior, status tags, health indicators, and learning controls.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'behavior-scope',
        title: 'Behavior scope',
        body: [
          'AI NPC documentation should describe the implemented behavior areas: movement, navigation, avoidance, combat, block placement, recovery, route behavior, spawning, naming, and settings.',
        ],
      },
      {
        id: 'learning-system',
        title: 'Learning system',
        body: [
          'The learning surface should be described as a controlled extension to existing AI behavior rather than as a vague autonomous black box.',
          'Relevant concepts include observation, action masks, demonstrations, policy evaluation, training data, sandbox evaluation, and selected policy use.',
        ],
      },
      {
        id: 'status-output',
        title: 'Status output',
        body: [
          'AI status tags and health indicators are world-anchored presentation elements. They should remain visually attached to actor positions and should not inherit unrelated first-person camera effects.',
        ],
      },
    ],
  },
  {
    slug: 'othello',
    navigationTitle: 'Othello Mode',
    eyebrow: 'Application',
    title: 'Othello Mode',
    description: 'Othello board state, move rules, engine profiles, search behavior, opening resources, HUD output, and mode settings.',
    searchSection: 'Application',
    sections: [
      {
        id: 'mode-scope',
        title: 'Mode scope',
        body: ['Othello mode is a separate play space with its own board state, rules, settings, engine paths, inventory behavior, HUD, viewport, and worker integration.'],
      },
      {
        id: 'engine-paths',
        title: 'Engine paths',
        body: ['The public documentation should separate user-visible Othello behavior from implementation-specific engine responsibilities:'],
        items: ['Classic and advanced engine paths', 'Board and side state', 'Move ordering and search', 'Evaluation profiles', 'Opening resources', 'Worker execution'],
      },
      {
        id: 'presentation-path',
        title: 'Presentation path',
        body: [
          'Othello UI and HUD documentation should remain specific to implemented presentation paths and should not describe unrelated voxel-world HUD behavior as if it were shared automatically.',
        ],
      },
    ],
  },
  {
    slug: 'settings',
    navigationTitle: 'Settings Surface',
    eyebrow: 'Systems',
    title: 'Settings Surface',
    description: 'Display, world, player, audio, camera, cloud, shadow, AI, Othello, and shared settings UI behavior.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'settings-areas',
        title: 'Settings areas',
        body: ['Settings documentation should follow the actual application setting surfaces and avoid merging unrelated controls into decorative website cards.'],
        items: ['Display', 'World', 'Player', 'Audio', 'Camera', 'Clouds', 'Shadows', 'AI', 'Othello'],
      },
      {
        id: 'ui-consistency',
        title: 'UI consistency',
        body: [
          'Settings pages should preserve consistent layout, spacing, control behavior, and style ownership. Visual styling belongs in the theme stylesheet, not in scattered inline widget rules.',
        ],
      },
      {
        id: 'performance-boundary',
        title: 'Performance boundary',
        body: ['Settings changes should not make normal gameplay, dialog opening, dialog closing, or renderer updates block on unnecessary heavy work.'],
      },
    ],
  },
  {
    slug: 'project-structure',
    navigationTitle: 'Project Structure',
    eyebrow: 'Project',
    title: 'Project Structure',
    description: 'Repository layout, responsibility boundaries, documentation ownership, and public website constraints.',
    searchSection: 'Project',
    sections: [
      {
        id: 'source-layout',
        title: 'Source layout',
        body: [
          'The desktop application source is separated into foundations, application, simulation, and presentation responsibilities. The website is a separate React documentation surface under src/website.',
        ],
      },
      {
        id: 'responsibility-boundaries',
        title: 'Responsibility boundaries',
        body: ['Project documentation should preserve the practical boundaries used by the source tree:'],
        items: [
          'Foundations for reusable low-level types and math',
          'Application for persistence, sessions, preferences, and orchestration',
          'Simulation for gameplay rules, actors, worlds, inventories, and play spaces',
          'Presentation for PyQt UI, audio, rendering, resources, and website-facing surfaces',
        ],
      },
      {
        id: 'website-boundary',
        title: 'Website boundary',
        body: [
          'The website should explain source-owned systems and public notes. It should not create a second product surface that claims features, downloads, or support channels that are not actually present.',
        ],
      },
    ],
  },
  {
    slug: 'support',
    navigationTitle: 'Support and Reports',
    eyebrow: 'Project',
    title: 'Support and Reports',
    description: 'Where users should look before reporting problems and how public issue content should stay bounded.',
    searchSection: 'Project',
    sections: [
      {
        id: 'before-reporting',
        title: 'Before reporting',
        body: [
          'Before reporting a problem, inspect the relevant documentation page, changelog entry, and repository files when available. Reports should identify the observed behavior and the expected behavior directly.',
        ],
      },
      {
        id: 'report-boundary',
        title: 'Report boundary',
        body: [
          'Public reports should avoid credentials, tokens, private local files, vulnerability details, and unrelated redesign requests. Security-sensitive details require a private reporting channel.',
        ],
      },
      {
        id: 'useful-report-content',
        title: 'Useful report content',
        body: ['A useful report keeps the problem reproducible and bounded:'],
        items: [
          'Affected page or application area',
          'Exact observed behavior',
          'Expected behavior',
          'Steps to reproduce',
          'Relevant logs or screenshots without secrets',
          'Environment details when they affect the result',
        ],
      },
    ],
  },
];

export function getDocsPage(slug: string | undefined): DocsPageContent | undefined {
  const requestedSlug = slug ?? docsDefaultSlug;
  return docsPages.find((page) => page.slug === requestedSlug);
}

export function getDocsPageHref(page: DocsPageContent): string {
  return `/docs/${page.slug}`;
}

export function getOnThisPage(page: DocsPageContent): { label: string; href: string }[] {
  return page.sections.map((section) => ({
    label: section.title,
    href: `#${section.id}`,
  }));
}
