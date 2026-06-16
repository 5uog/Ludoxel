export type ShortcutLink = {
  label: string;
  href: string;
};

export type CategoryCard = {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  visualKind: 'documentation' | 'download' | 'changelog';
};

export type SupportCard = {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  icon: 'message' | 'lifebuoy';
};

export const heroShortcuts: ShortcutLink[] = [
  {
    label: 'Overview',
    href: '/docs/overview',
  },
  {
    label: 'Set Up Your Ludoxel Session',
    href: '/docs/overview#desktop-runtime',
  },
];

export const categoryCards: CategoryCard[] = [
  {
    title: 'Documentation',
    description: 'Guides and best practices to get started.',
    actionLabel: 'Read Guides',
    href: '/docs/overview',
    visualKind: 'documentation',
  },
  {
    title: 'Download',
    description: 'Current public build status without placeholder installer claims.',
    actionLabel: 'Check Download',
    href: '/download',
    visualKind: 'download',
  },
  {
    title: 'Changelog',
    description: 'The latest public updates from your documentation hub.',
    actionLabel: "See What's New",
    href: '/changelog',
    visualKind: 'changelog',
  },
];

export const supportCards: SupportCard[] = [
  {
    title: 'Join the knowledge hub',
    description: 'Connect with Ludoxel development notes and verified documentation.',
    actionLabel: 'Read Docs',
    href: '/docs/overview',
    icon: 'message',
  },
  {
    title: 'Get guided',
    description: 'Use the overview to understand implemented systems before changing the app.',
    actionLabel: 'Open Overview',
    href: '/docs/overview',
    icon: 'lifebuoy',
  },
];
