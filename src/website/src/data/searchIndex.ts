export type SearchIndexEntry = {
  title: string;
  description: string;
  href: string;
  section: string;
};

export const searchIndex: SearchIndexEntry[] = [
  {
    title: 'Overview',
    description: 'Ludoxel desktop app, project layout, and documentation hub.',
    href: '/docs/overview',
    section: 'Docs',
  },
  {
    title: 'Renderer and Backends',
    description: 'OpenGL, WGPU, chunks, fog, shadows, clouds, selections, and HUD output.',
    href: '/docs/overview#renderer-and-backends',
    section: 'Docs',
  },
  {
    title: 'AI NPCs',
    description: 'Movement, combat, placement, status tags, health indicators, and learning modes.',
    href: '/docs/overview#ai-npcs',
    section: 'Docs',
  },
  {
    title: 'Othello Mode',
    description: 'Board state, rules, engines, resources, HUD, settings, and presentation paths.',
    href: '/docs/overview#othello-mode',
    section: 'Docs',
  },
  {
    title: 'Download',
    description: 'Current public build status without placeholder installer claims.',
    href: '/download',
    section: 'Project',
  },
  {
    title: 'Changelog',
    description: 'Public website notes and unreleased documentation hub changes.',
    href: '/changelog',
    section: 'Updates',
  },
];
