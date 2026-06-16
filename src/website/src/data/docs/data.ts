/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const dataPages: DocsPageContent[] = [
  {
    slug: 'user-data-root',
    navigationTitle: 'User Data Root',
    eyebrow: 'Data',
    title: 'User Data Root',
    description: 'Where Ludoxel stores per-user data, how the location is resolved per operating system, and how it is overridden.',
    searchSection: 'Data',
    sections: [
      {
        id: 'location',
        title: 'Location',
        body: [
          'All per-user data is stored under a runtime data root that is separate from the repository. On Windows it resolves under the local application data directory as `Ludoxel`; on macOS it resolves to `~/Library/Application Support/Ludoxel`; otherwise it follows the XDG data directory or `~/.local/share/ludoxel`.',
          'The environment variable `LUDOXEL_DATA_ROOT` overrides the location; when set, that path takes precedence over the operating-system default.',
        ],
      },
      {
        id: 'structure',
        title: 'Structure',
        body: [
          'The data root is split into a `state` directory for durable data and a `cache` directory for regenerable data. Durable saved state lives under `state`; data that can be rebuilt, such as a compiled opening-book cache, lives under `cache`.',
        ],
      },
      {
        id: 'separation',
        title: 'Separation from the application',
        body: [
          'User data is never written into the repository source tree or into immutable packaged resources. Source-tree execution and a frozen application may resolve packaged resources differently, but the runtime data root stays distinct from those resources.',
        ],
      },
    ],
    references: [
      {
        title: 'Saved Session State',
        href: '/docs/saved-session-state',
        description: 'The player and world state files.',
      },
      {
        title: 'Persistence and Saved State',
        href: '/docs/persistence-and-saved-state',
        description: 'The persistence system.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'How saved data relates to the license.',
      },
    ],
  },
  {
    slug: 'saved-settings',
    navigationTitle: 'Saved Settings',
    eyebrow: 'Data',
    title: 'Saved Settings',
    description: 'Where settings are persisted, including the runtime preferences, keybinds, the audio mixer, and the Othello settings.',
    searchSection: 'Data',
    sections: [
      {
        id: 'settings-in-player-state',
        title: 'Settings in the player state',
        body: [
          'The runtime preferences, the keybinds, the audio mixer, and the Othello settings are written into the saved player-state file under the `state` directory. They are restored on launch and applied to the sessions and the renderer.',
        ],
      },
      {
        id: 'learning-settings',
        title: 'Learning settings',
        body: [
          'AI Learning settings are stored separately in their own learning state file, `state/ai_learning.json`, rather than in the player state. This keeps the learning configuration independent of the world save.',
        ],
      },
      {
        id: 'normalization',
        title: 'Normalization',
        body: [
          'Saved settings are normalized on load and save, so an out-of-range or malformed value is clamped or reset rather than trusted. A missing settings file means the application uses its built-in defaults.',
        ],
      },
    ],
    references: [
      {
        title: 'Settings Persistence',
        href: '/docs/settings-persistence',
        description: 'How settings are normalized and restored.',
      },
      {
        title: 'AI Learning Data Files',
        href: '/docs/ai-learning-data-files',
        description: 'The learning state file.',
      },
      {
        title: 'User Data Root',
        href: '/docs/user-data-root',
        description: 'Where the settings file lives.',
      },
    ],
  },
  {
    slug: 'saved-session-state',
    navigationTitle: 'Saved Session State',
    eyebrow: 'Data',
    title: 'Saved Session State',
    description: 'The player and world state files, the integrity manifest that protects them, and what is restored on launch.',
    searchSection: 'Data',
    sections: [
      {
        id: 'state-files',
        title: 'State files',
        body: [
          'Session state is written as `state/player_state.json` and `state/world_state.json`. The player-state file holds the active space, settings, inventory, Othello settings, and player data; the world-state file holds the My World and Othello world contents and the Othello match. Each file is versioned.',
        ],
      },
      {
        id: 'integrity',
        title: 'Integrity manifest',
        body: [
          'Protected runtime files, the player state, world state, player skin, and Othello opening book, are covered by an HMAC-SHA256 integrity manifest stored as `state/state_manifest.json` with a locally generated key at `state/integrity_key.bin`. On load, a file that fails verification is treated as absent rather than authoritative.',
        ],
      },
      {
        id: 'restore',
        title: 'Restore',
        body: [
          'On launch, the player and world are restored into both the My World and Othello sessions, AI actors are reattached, and the active play space is set from the saved preference. When neither state file exists, the application starts a fresh session.',
        ],
      },
    ],
    references: [
      {
        title: 'Persistence and Saved State',
        href: '/docs/persistence-and-saved-state',
        description: 'The persistence system and integrity model.',
      },
      {
        title: 'Data Failure Handling',
        href: '/docs/data-failure-handling',
        description: 'What happens when a file is invalid.',
      },
      {
        title: 'User Data Root',
        href: '/docs/user-data-root',
        description: 'Where these files live.',
      },
    ],
  },
  {
    slug: 'ai-learning-data-files',
    navigationTitle: 'AI Learning Data Files',
    eyebrow: 'Data',
    title: 'AI Learning Data Files',
    description: 'The learning settings, demonstration datasets, policies, evaluations, and training runs written under the data root.',
    searchSection: 'Data',
    sections: [
      {
        id: 'files',
        title: 'Learning files',
        body: [
          'AI Learning writes under the `state` directory of the data root. The learning settings are stored in `state/ai_learning.json`; datasets, policies, evaluations, and training runs are stored under `state/learning`.',
        ],
        items: [
          'Settings — `state/ai_learning.json`.',
          'Demonstrations — `state/learning/demonstrations/<dataset>.jsonl` in JSON Lines.',
          'Policies — `state/learning/policies/<policy_id>.json`.',
          'Evaluations — `state/learning/evaluations/<policy_id>.json`.',
          'Training runs — `state/learning/training_runs/<run_id>.json`.',
        ],
      },
      {
        id: 'naming-and-legacy',
        title: 'Naming and legacy data',
        body: [
          'Identifier strings are normalized into safe file-name elements before they are used as artifact names; this is a file-system safety measure, not a naming feature. Older demonstrations stored directly under `state/learning` are still read for compatibility and are not destroyed.',
        ],
      },
      {
        id: 'never-in-repo',
        title: 'Never in the repository',
        body: ['Learning data is written under the runtime data root, never into `src`, `assets`, `resources`, or `third-party`. Recorded data is game state and actions, not screen images.'],
      },
    ],
    references: [
      {
        title: 'AI Learning',
        href: '/docs/ai-learning',
        description: 'The system that writes these files.',
      },
      {
        title: 'AI Learning Settings',
        href: '/docs/ai-learning-settings',
        description: 'The controls that manage this data.',
      },
      {
        title: 'User-Created Materials',
        href: '/docs/user-created-materials',
        description: 'The legal treatment of user data.',
      },
    ],
  },
  {
    slug: 'othello-data-files',
    navigationTitle: 'Othello Data Files',
    eyebrow: 'Data',
    title: 'Othello Data Files',
    description: 'The Othello match within the saved world state and the opening-book storage under the data root.',
    searchSection: 'Data',
    sections: [
      {
        id: 'match-state',
        title: 'Match state',
        body: [
          'The Othello match is part of the saved world state. The board, settings, sides, clocks, move count, and result are normalized and stored so the match can be restored after a restart.',
        ],
      },
      {
        id: 'opening-book',
        title: 'Opening book',
        body: [
          'The user opening book is stored as `state/othello_opening_book.json` and is one of the protected runtime files covered by the integrity manifest. A compiled opening-book cache may live under the `cache` directory because it can be rebuilt.',
        ],
      },
      {
        id: 'import-export',
        title: 'Import and export',
        body: ['The Othello settings dialog can import and export the opening book as explicit user actions. Import and export operate on the user book and do not depend on the repository.'],
      },
    ],
    references: [
      {
        title: 'Othello Engine',
        href: '/docs/othello-engine',
        description: 'How the book is used.',
      },
      {
        title: 'Othello Settings',
        href: '/docs/othello-settings',
        description: 'Book import and export.',
      },
      {
        title: 'Saved Session State',
        href: '/docs/saved-session-state',
        description: 'How the match state is saved.',
      },
    ],
  },
  {
    slug: 'generated-application-output',
    navigationTitle: 'Generated Application Output',
    eyebrow: 'Data',
    title: 'Generated Application Output',
    description: 'Output produced by ordinary use, such as screenshots, recordings, save files, logs, and configuration files.',
    searchSection: 'Data',
    sections: [
      {
        id: 'output-kinds',
        title: 'Kinds of output',
        body: [
          'Ordinary application output includes screenshots, screen recordings, save files, logs, configuration files, and rendered states. These are produced as a result of using the application normally.',
        ],
      },
      {
        id: 'ownership',
        title: 'Ownership',
        body: ['The part of the output that the user independently creates is user-specific and is not treated as a project source file merely because the application produced or displayed it.'],
      },
      {
        id: 'embedded-material',
        title: 'Embedded protected material',
        body: [
          'When output contains protected material, such as project UI, textures, third-party materials, or provenance-sensitive assets, that embedded material keeps its own legal restrictions. This is a legal boundary; the Application Output legal page is the controlling description.',
        ],
      },
    ],
    references: [
      {
        title: 'Application Output',
        href: '/docs/application-output',
        description: 'The legal treatment of application output.',
      },
      {
        title: 'User-Created Materials',
        href: '/docs/user-created-materials',
        description: 'The legal treatment of user-created content.',
      },
      {
        title: 'Application Output Boundary',
        href: '/docs/application-output-boundary',
        description: 'What the application writes and does not write.',
      },
    ],
  },
  {
    slug: 'data-user-created-materials',
    navigationTitle: 'User-Created Materials',
    eyebrow: 'Data',
    title: 'User-Created Materials',
    description: 'The user-created data Ludoxel manages, such as the name, settings, world edits, and imported skins, and how it is stored.',
    searchSection: 'Data',
    sections: [
      {
        id: 'what-counts',
        title: 'What user-created data is',
        body: [
          'User-created data includes the player name, settings, key bindings, window state, save data, world edits, imported skins, and recorded demonstrations. The application stores these under the runtime data root as part of ordinary use.',
        ],
      },
      {
        id: 'storage',
        title: 'Storage',
        body: ['This data is written to the `state` directory of the data root, not to the repository. The presence of this data inside Ludoxel does not convert it into a project-owned source file.'],
      },
      {
        id: 'legal-boundary',
        title: 'Legal boundary',
        body: [
          'If user-created data includes protected project material, third-party materials, or provenance-sensitive assets, the rights and restrictions on that included material remain in force. The User-Created Materials legal page is the controlling description.',
        ],
      },
    ],
    references: [
      {
        title: 'User-Created Materials',
        href: '/docs/user-created-materials',
        description: 'The legal treatment of user-created materials.',
      },
      {
        title: 'Saved Settings',
        href: '/docs/saved-settings',
        description: 'Where settings are stored.',
      },
      {
        title: 'AI Learning Data Files',
        href: '/docs/ai-learning-data-files',
        description: 'Where recorded demonstrations are stored.',
      },
    ],
  },
  {
    slug: 'application-output-boundary',
    navigationTitle: 'Application Output Boundary',
    eyebrow: 'Data',
    title: 'Application Output Boundary',
    description: 'What the application writes to the data root and why it does not edit repository internals as a normal operation.',
    searchSection: 'Data',
    sections: [
      {
        id: 'what-is-written',
        title: 'What the application writes',
        body: [
          'The application writes saved state, settings, learning data, and the Othello book under the runtime data root, and it records window geometry. Regenerable data is written under the `cache` directory.',
        ],
      },
      {
        id: 'no-repo-edits',
        title: 'No repository edits',
        body: [
          'Editing repository internals is not a normal application operation. Documentation does not instruct users to modify repository files as part of ordinary use, and runtime artifacts are not treated as distributable project assets.',
        ],
      },
      {
        id: 'immutable-resources',
        title: 'Immutable resources',
        body: [
          'Packaged resources such as bundled assets, shaders, and theme stylesheets are read-only inputs resolved from the resource root. They are distinct from user data written to the data root.',
        ],
      },
    ],
    references: [
      {
        title: 'User Data Root',
        href: '/docs/user-data-root',
        description: 'Where output is written.',
      },
      {
        title: 'Generated Application Output',
        href: '/docs/generated-application-output',
        description: 'The kinds of output produced.',
      },
      {
        title: 'Desktop Distribution Overview',
        href: '/docs/desktop-distribution-overview',
        description: 'How packaged resources are bundled.',
      },
    ],
  },
  {
    slug: 'data-failure-handling',
    navigationTitle: 'Data Failure Handling',
    eyebrow: 'Data',
    title: 'Data Failure Handling',
    description: 'How invalid, missing, or tampered saved data is handled without breaking startup.',
    searchSection: 'Data',
    sections: [
      {
        id: 'integrity-failure',
        title: 'Integrity failure',
        body: [
          'A protected runtime file that fails its HMAC verification is treated as absent rather than loaded as authoritative. This prevents tampered or corrupt state from loading as if it were trusted.',
        ],
      },
      {
        id: 'malformed-values',
        title: 'Malformed values',
        body: [
          'Malformed or out-of-range settings are normalized to safe values. A corrupt demonstration row is skipped during training, and an empty dataset yields a training failure rather than a crash. A broken or unevaluated policy is not used; the AI falls back to the deterministic baseline.',
        ],
      },
      {
        id: 'missing-files',
        title: 'Missing files',
        body: [
          'When a saved file is missing, the application uses defaults: a missing settings file means built-in settings, and missing session state means a fresh session. Startup is not blocked by missing or invalid data.',
        ],
      },
    ],
    references: [
      {
        title: 'Saved Session State',
        href: '/docs/saved-session-state',
        description: 'The protected state files.',
      },
      {
        title: 'AI Learning',
        href: '/docs/ai-learning',
        description: 'Corrupt-row and empty-dataset handling.',
      },
      {
        title: 'Persistence and Saved State',
        href: '/docs/persistence-and-saved-state',
        description: 'The integrity model.',
      },
    ],
  },
];
