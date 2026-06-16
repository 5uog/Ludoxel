export type NavigationItem = {
  label: string;
  href: string;
};

export type DocsSidebarItem = {
  title: string;
  href: string;
  icon: 'file' | 'wrench' | 'layers' | 'settings' | 'sparkles' | 'shield';
};

export type DocsSidebarSection = {
  title: string;
  items: DocsSidebarItem[];
};

export const mainNavigation: NavigationItem[] = [
  {
    label: 'Docs',
    href: '/docs/overview',
  },
  {
    label: 'Download',
    href: '/download',
  },
  {
    label: 'Changelog',
    href: '/changelog',
  },
];

export const docsSidebarSections: DocsSidebarSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Overview',
        href: '/docs/overview',
        icon: 'file',
      },
      {
        title: 'Set Up Your Ludoxel Session',
        href: '/docs/overview#desktop-runtime',
        icon: 'wrench',
      },
      {
        title: 'Renderer and Backends',
        href: '/docs/overview#renderer-and-backends',
        icon: 'layers',
      },
      {
        title: 'Settings',
        href: '/docs/overview#settings',
        icon: 'settings',
      },
      {
        title: 'AI NPCs',
        href: '/docs/overview#ai-npcs',
        icon: 'sparkles',
      },
    ],
  },
  {
    title: 'Modes & Runtime',
    items: [
      {
        title: 'Othello Mode',
        href: '/docs/overview#othello-mode',
        icon: 'layers',
      },
      {
        title: 'Assets and Legal Notes',
        href: '/docs/overview#assets-and-legal-notes',
        icon: 'shield',
      },
    ],
  },
];

export const getStartedHref = '/docs/overview';
