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
    id: 'overview',
    title: 'Overview',
    body: ['Ludoxel is a desktop voxel sandbox built with Python, PyQt6, OpenGL, and WGPU.'],
  },
  {
    id: 'project-layout',
    title: 'Project Layout',
    body: ['The desktop application lives under src/ludoxel. The public website lives under src/website.'],
  },
  {
    id: 'desktop-runtime',
    title: 'Desktop Runtime',
    body: ['Ludoxel is launched as a desktop application, not as a browser game.'],
  },
  {
    id: 'renderer-and-backends',
    title: 'Renderer and Backends',
    body: ['The renderer covers OpenGL, WGPU, world chunks, fog, shadows, clouds, selections, player models, HUD output, and Othello rendering.'],
  },
  {
    id: 'ai-npcs',
    title: 'AI NPCs',
    body: ['AI players are simulation actors with movement, combat, placement, route behavior, status tags, health indicators, and learning modes.'],
  },
  {
    id: 'othello-mode',
    title: 'Othello Mode',
    body: ['Othello mode has board state, rules, engines, opening resources, HUD, settings, and presentation paths.'],
  },
  {
    id: 'settings',
    title: 'Settings',
    body: ['Settings cover display, world, player, audio, camera, clouds, shadow, AI, and Othello controls.'],
  },
  {
    id: 'assets-and-legal-notes',
    title: 'Assets and Legal Notes',
    body: ['The website must not publish copied reference-site assets, mirrored source output, or unverified release claims.'],
  },
];

export const onThisPage = docsSections.map((section: DocsSection) => ({
  label: section.title,
  href: `#${section.id}`,
}));
