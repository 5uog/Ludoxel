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
        title: 'Reference-style public website',
        items: [
          'The website is rebuilt as a documentation hub matching the captured reference layout while replacing Compass copy with Ludoxel documentation content.',
          'Home keeps the fixed header, centered hero, gradient search field, shortcut row, category cards, support section, assistant section, and footer.',
          'Docs keeps the overview page structure and removes the standalone Architecture page.',
          'Changelog keeps public website notes only and does not invent release artifacts.',
        ],
      },
    ],
  },
];
