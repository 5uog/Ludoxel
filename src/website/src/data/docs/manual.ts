/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const manualPages: DocsPageContent[] = [
  {
    slug: 'application-overview',
    navigationTitle: 'Application Overview',
    eyebrow: 'Manual',
    title: 'Application Overview',
    description: 'What Ludoxel is, which play spaces it exposes, and how the manual describes the application without overstating it.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'what-ludoxel-is',
        title: 'What Ludoxel is',
        body: [
          'Ludoxel is a desktop voxel application built on PyQt6. A single window hosts a real-time 3D viewport, a heads-up display, settings surfaces, and two play spaces: a voxel world called My World and a separate Othello board game. The application runs locally and stores its data on the same machine.',
          'This manual describes only behavior that exists in the application. It does not promise installers, store listings, network features, or other capabilities that the source does not implement.',
        ],
      },
      {
        id: 'play-spaces',
        title: 'Play spaces',
        body: [
          'The voxel play space, identified internally as My World, owns a block world, the player, AI NPCs, an inventory hotbar, movement and collision, and a render snapshot consumed by the renderer. The Othello play space owns its own board state, clocks, a search engine, an opening book, and an Othello-specific hotbar.',
          'The two play spaces keep separate saved state and separate settings surfaces. Switching between them is a runtime operation; it does not delete the other space.',
        ],
      },
      {
        id: 'renderer-by-platform',
        title: 'Renderer by platform',
        body: [
          'The viewport uses a different renderer backend depending on the operating system. On Windows and other non-macOS platforms the viewport is an OpenGL widget; on macOS it is a wgpu-native widget that targets Metal. Both backends draw the same world, but visual reports should name the backend because parity defects can exist between them.',
        ],
      },
    ],
    references: [
      {
        title: 'Starting and Main Window',
        href: '/docs/starting-and-main-window',
        description: 'How the application launches and what the first window shows.',
      },
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'How the OpenGL and wgpu backends relate.',
      },
      {
        title: 'License Authority',
        href: '/docs/license-authority',
        description: 'The controlling legal text for the application.',
      },
    ],
  },
  {
    slug: 'starting-and-main-window',
    navigationTitle: 'Starting and Main Window',
    eyebrow: 'Manual',
    title: 'Starting and Main Window',
    description: 'How Ludoxel launches, the name prompt on first launch, the splash status, and how the main window restores its geometry.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'launch-sequence',
        title: 'Launch sequence',
        body: [
          'When Ludoxel starts it registers its bundled fonts, applies the combined theme stylesheet, and checks for an already-running instance. If another instance is already running, the new launch activates the existing window instead of opening a second one.',
          'If no player name has been saved yet, a name dialog appears before the main window. A saved name skips this dialog on later launches. Player identity can be changed later from the Player settings.',
        ],
      },
      {
        id: 'splash-and-viewport',
        title: 'Splash and viewport loading',
        body: [
          'A splash panel titled Ludoxel shows a loading status such as `Preparing viewport...` while the viewport initializes. The splash closes when viewport loading finishes, and the in-window loading overlay hides at the same time. Loading status text is updated by the viewport, not by a fixed timer.',
        ],
      },
      {
        id: 'window-geometry',
        title: 'Window geometry',
        body: [
          'The main window restores its previous size, position, and screen when those values were saved, clamped to the target screen and to a minimum size. Moving or resizing the window records the new geometry; fullscreen is restored from the saved preference. The window title shows the application version, for example `Ludoxel v3.6.1`.',
        ],
      },
    ],
    references: [
      {
        title: 'Player Identity and Skin',
        href: '/docs/player-identity-and-skin',
        description: 'How the name dialog and player identity work.',
      },
      {
        title: 'Saved Session State',
        href: '/docs/saved-session-state',
        description: 'Where window geometry and other state are written.',
      },
      {
        title: 'Settings Entry Points',
        href: '/docs/settings-entry-points',
        description: 'How to reach the settings surfaces from the window.',
      },
    ],
  },
  {
    slug: 'session-operation',
    navigationTitle: 'Session Operation',
    eyebrow: 'Manual',
    title: 'Session Operation',
    description: 'How the live session runs, how the active play space is chosen, and how the viewport drives the world each frame.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'active-space',
        title: 'Active play space',
        body: [
          'The active play space is part of the runtime preferences and is restored on launch. My World and Othello each keep their own player position, world blocks, and AI actors, so changing the active space does not discard the other space.',
        ],
      },
      {
        id: 'stepping',
        title: 'Stepping and snapshots',
        body: [
          'The session advances on a fixed step and produces a render snapshot that the renderer consumes. Authoritative state, such as the world blocks, player position, and AI actors, lives in the session, not in the renderer. The renderer draws a view of that state and does not own the rules.',
        ],
      },
      {
        id: 'save-points',
        title: 'When state is written',
        body: [
          'Player position, world edits, AI actors, settings, the inventory, and the Othello match are written to the runtime data root as saved state. The application saves on shutdown and at runtime save points; closing the window persists the current window geometry and stops the viewport cleanly.',
        ],
      },
    ],
    references: [
      {
        title: 'World Runtime',
        href: '/docs/world-runtime',
        description: 'The technical model behind the live session.',
      },
      {
        title: 'Session State Ownership',
        href: '/docs/session-state-ownership',
        description: 'Which layer owns which part of the session.',
      },
      {
        title: 'Saved Session State',
        href: '/docs/saved-session-state',
        description: 'The files that hold the saved session.',
      },
    ],
  },
  {
    slug: 'basic-controls-and-input',
    navigationTitle: 'Basic Controls and Input',
    eyebrow: 'Manual',
    title: 'Basic Controls and Input',
    description: 'Default key bindings, mouse-look capture, and how held actions differ from single actions in the voxel play space.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'default-bindings',
        title: 'Default key bindings',
        body: [
          'Movement defaults to `W`, `S`, `A`, and `D`, with `Space` to jump, `Shift` to crouch, and `Control` to sprint. `E` opens the inventory, `B` toggles creative mode, `F5` cycles the camera perspective, `F1` hides or shows the HUD, `Q` clears the selected hotbar slot, and the digit keys `1` through `9` select hotbar slots.',
          '`F3` toggles the debug HUD and `F4` toggles the debug shadow view. Every binding is a single key; modifier combinations and multi-key sequences are not stored as bindings, and assigning a key already used by another action moves the binding rather than duplicating it.',
        ],
      },
      {
        id: 'mouse-look',
        title: 'Mouse-look capture',
        body: [
          'While the viewport holds mouse capture, the cursor is hidden and the viewport grabs both mouse and keyboard input. On Windows and Linux the cursor is recentered every poll to produce relative motion; on macOS a native relative-mouse path and cursor recenter helper are used together with a keyboard event guard. Releasing capture restores the normal cursor.',
        ],
      },
      {
        id: 'held-vs-single',
        title: 'Held actions and single actions',
        body: [
          'Breaking, placing, and interacting are continuous held actions governed by repeat intervals that can be tuned in Player settings. Selecting a hotbar slot, toggling overlays, and cycling the camera are single actions. The manual keeps these separate because the repeat intervals only apply to the held block actions.',
        ],
      },
    ],
    references: [
      {
        title: 'Keybind Settings',
        href: '/docs/keybind-settings',
        description: 'How to rebind movement, gameplay, and hotbar keys.',
      },
      {
        title: 'Input and Mouse Capture',
        href: '/docs/input-and-mouse-capture',
        description: 'The technical model for mouse capture.',
      },
      {
        title: 'World Interaction',
        href: '/docs/world-interaction',
        description: 'How breaking, placing, and interaction behave.',
      },
    ],
  },
  {
    slug: 'world-interaction',
    navigationTitle: 'World Interaction',
    eyebrow: 'Manual',
    title: 'World Interaction',
    description: 'Targeting, breaking, placing, and interacting with blocks in the voxel world, and the visible feedback those actions produce.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'targeting',
        title: 'Targeting a block',
        body: [
          'The crosshair selects the block face under the view ray within the configured reach distance. When selection outlines are enabled, the targeted block is outlined so the player can see exactly which block will be broken, placed against, or interacted with.',
        ],
      },
      {
        id: 'break-place-interact',
        title: 'Breaking, placing, and interacting',
        body: [
          'Breaking removes the targeted block and emits break particles and a block-break sound. Placing puts the currently selected hotbar block against the targeted face when the target cell is valid. Interacting toggles a stateful block, such as opening or closing a fence gate, and plays the matching open or close sound.',
          'Held break, held place, and held interact repeat at their configured intervals. Placement requires a valid target cell, and the placed shape follows the block model rather than always being a full cube.',
        ],
      },
      {
        id: 'feedback',
        title: 'Visible and audible feedback',
        body: [
          'Block actions produce sound from the block sound group and, for breaking, a particle burst whose spawn rate and speed are configurable. Footsteps and landing sounds depend on the surface block underfoot, with louder landing sounds at larger fall distances.',
        ],
      },
    ],
    references: [
      {
        title: 'Block Breaking and Placement',
        href: '/docs/block-breaking-and-placement',
        description: 'The gameplay rules behind breaking and placing.',
      },
      {
        title: 'Block Shapes and Support',
        href: '/docs/block-shapes-and-support',
        description: 'How block shapes affect placement and collision.',
      },
      {
        title: 'Audio and Visual Feedback',
        href: '/docs/audio-and-visual-feedback',
        description: 'How block sounds and particles are produced.',
      },
    ],
  },
  {
    slug: 'inventory-and-hotbar',
    navigationTitle: 'Inventory and Hotbar',
    eyebrow: 'Manual',
    title: 'Inventory and Hotbar',
    description: 'The nine-slot hotbar, the inventory overlay, and how separate hotbars are kept for creative, survival, Othello, and route editing.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'hotbar',
        title: 'The hotbar',
        body: [
          'The hotbar holds nine slots. The selected slot is chosen with the digit keys `1` through `9` or by cycling, and the selected slot determines which block is placed or which special item is active. `Q` clears the selected slot.',
          'The application keeps separate hotbars for survival mode, creative mode, the Othello play space, and AI route editing. The active hotbar is chosen automatically from the current play space and mode, so switching context shows the correct items.',
        ],
      },
      {
        id: 'inventory-overlay',
        title: 'The inventory overlay',
        body: [
          'The inventory overlay, opened with `E`, lets the player assign blocks and catalog items to hotbar slots. Blocks come from the registered block catalog; special items, such as the AI spawn egg, are also available where they apply.',
        ],
      },
      {
        id: 'block-vs-special',
        title: 'Blocks and special items',
        body: [
          'A hotbar slot can hold either a placeable block or a special item. A placeable block is placed into the world; a special item triggers a dedicated behavior, such as spawning an AI or editing a route, instead of placing a cube.',
        ],
      },
    ],
    references: [
      {
        title: 'Inventory Items',
        href: '/docs/inventory-items',
        description: 'Which blocks and items can occupy hotbar slots.',
      },
      {
        title: 'Special Items',
        href: '/docs/special-items',
        description: 'The non-block items and their behavior.',
      },
      {
        title: 'AI NPC Operation',
        href: '/docs/ai-npc-operation',
        description: 'How the AI spawn egg item is used.',
      },
    ],
  },
  {
    slug: 'player-identity-and-skin',
    navigationTitle: 'Player Identity and Skin',
    eyebrow: 'Manual',
    title: 'Player Identity and Skin',
    description: 'The player name, the random-name fallback, and the choice between the bundled Alex skin and a custom skin.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'player-name',
        title: 'Player name',
        body: [
          'The player name is set in the name dialog on first launch and in Player settings afterward. A name is normalized and limited to 32 characters. Leaving the name blank uses a generated random identity for the launch, shown as the resolved name in the settings hint.',
        ],
      },
      {
        id: 'player-skin',
        title: 'Player skin',
        body: [
          'The player skin is either the bundled Alex skin or a custom imported skin. The selected skin is shown on the third-person player model and in the first-person view model when a hand is visible.',
        ],
      },
      {
        id: 'identity-scope',
        title: 'Scope of identity',
        body: [
          'The player name and skin selection are user data. They are stored with the saved state and do not change the rules of the world. A custom skin image is a user-created material; importing it does not transfer rights in any included third-party content.',
        ],
      },
    ],
    references: [
      {
        title: 'Player Name Settings',
        href: '/docs/player-name-settings',
        description: 'The setting that stores the player name.',
      },
      {
        title: 'Player Skin Settings',
        href: '/docs/player-skin-settings',
        description: 'The setting that selects the player skin.',
      },
      {
        title: 'User-Created Materials',
        href: '/docs/user-created-materials',
        description: 'The legal treatment of imported skins and other user content.',
      },
    ],
  },
  {
    slug: 'pause-death-and-recovery',
    navigationTitle: 'Pause, Death, and Recovery',
    eyebrow: 'Manual',
    title: 'Pause, Death, and Recovery',
    description: 'The pause overlay, the death overlay with its respawn action, and the hurt feedback that precedes death.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'pause',
        title: 'Pause overlay',
        body: [
          'The pause overlay is a presentation surface that suspends interactive play and exposes navigation, such as opening settings. While the pause overlay is shown, mouse capture is released so the cursor is usable.',
        ],
      },
      {
        id: 'damage-and-death',
        title: 'Damage and death',
        body: [
          'The player has 20 health points, equivalent to ten hearts. Taking damage produces a hurt flash and a brief camera tilt away from the damage source, with a short damage cooldown between hits. When health reaches zero the player is dead.',
        ],
      },
      {
        id: 'death-overlay',
        title: 'Death overlay and respawn',
        body: [
          'On death a panel titled `YOU DIED` appears with a death message and a Respawn button. The death message describes the cause; pressing Respawn returns the player to a recovered state. The message defaults to a generic line when no specific cause text is set.',
        ],
      },
    ],
    references: [
      {
        title: 'Player Combat and Damage',
        href: '/docs/player-combat-and-damage',
        description: 'How damage, hearts, and hurt feedback work.',
      },
      {
        title: 'Death Messages and Respawn',
        href: '/docs/death-messages-and-respawn',
        description: 'How death messages and respawn are produced.',
      },
      {
        title: 'HUD and Overlay State',
        href: '/docs/hud-and-overlay-state',
        description: 'How overlays own their state.',
      },
    ],
  },
  {
    slug: 'othello-mode-operation',
    navigationTitle: 'Othello Mode Operation',
    eyebrow: 'Manual',
    title: 'Othello Mode Operation',
    description: 'How to start and play an Othello match, place discs, and reach the Othello-specific settings.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'starting-a-match',
        title: 'Starting a match',
        body: [
          'Othello is a separate play space with an 8 by 8 board. A match begins from the idle state; the on-board message prompts the player to start a match and place a disc. The standard four starting discs are placed in the center before play.',
        ],
      },
      {
        id: 'placing-discs',
        title: 'Placing discs',
        body: [
          'A move is legal only when it flips at least one opposing disc in a straight line. Placing a disc captures the flanked discs of the opponent. The board tracks the side to move, legal moves, move count, passes, and the winner when the match ends.',
        ],
      },
      {
        id: 'othello-settings-access',
        title: 'Othello settings',
        body: [
          'Othello has its own settings dialog with Match, AI, Book, and Learning tabs. These control opponent strength, time control, disc animation, player order, engine parameters, and the opening book, and are separate from the voxel-world settings.',
        ],
      },
    ],
    references: [
      {
        title: 'Othello Match Flow',
        href: '/docs/othello-match-flow',
        description: 'The full match rules and lifecycle.',
      },
      {
        title: 'Othello Settings',
        href: '/docs/othello-settings',
        description: 'Every Othello setting and its range.',
      },
      {
        title: 'Othello Engine',
        href: '/docs/othello-engine',
        description: 'How the opponent search engine works.',
      },
    ],
  },
  {
    slug: 'ai-npc-operation',
    navigationTitle: 'AI NPC Operation',
    eyebrow: 'Manual',
    title: 'AI NPC Operation',
    description: 'Spawning AI NPCs with the spawn egg, editing one AI through its settings dialog, and the role and personality choices.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'spawning',
        title: 'Spawning an AI',
        body: ['The AI spawn egg is a special hotbar item. Using it spawns one standby AI at a valid placement cell. A newly spawned AI stays on standby until a role is chosen for it.'],
      },
      {
        id: 'editing-one-ai',
        title: 'Editing one AI',
        body: [
          'Right-clicking an existing AI opens its AI Settings dialog. The dialog has Identity, Display, Skin, Health, Behavior, and Block Placement pages, and a Learning page when the learning controller is available. Each change is applied to the live AI immediately; the dialog has no separate save button.',
        ],
      },
      {
        id: 'roles',
        title: 'Roles and personality',
        body: [
          'The Behavior page sets the role: Standby, Free Roam / PVP, or Route Patrol. Personality is Aggressive or Peaceful, which controls whether the AI seeks combat. Route Patrol requires at least two route points authored in the world before it applies.',
        ],
      },
    ],
    references: [
      {
        title: 'AI Settings',
        href: '/docs/ai-settings',
        description: 'Every per-AI setting and its range.',
      },
      {
        title: 'AI NPC Behavior',
        href: '/docs/ai-npc-behavior',
        description: 'The behavior systems that drive each AI.',
      },
      {
        title: 'AI NPC Combat and Navigation',
        href: '/docs/ai-npc-combat-and-navigation',
        description: 'How AI movement and combat work in play.',
      },
    ],
  },
  {
    slug: 'settings-entry-points',
    navigationTitle: 'Settings Entry Points',
    eyebrow: 'Manual',
    title: 'Settings Entry Points',
    description: 'Where each settings surface lives: the main settings dialog, the per-AI settings dialog, and the Othello settings dialog.',
    searchSection: 'Manual',
    sections: [
      {
        id: 'main-settings',
        title: 'Main settings dialog',
        body: [
          'The main settings dialog uses a sidebar with Display, World, Player, Controls, Audio, and About tabs. Display covers camera and crosshair; World covers render distance, particles, clouds, shadows, and the sun; Player covers game mode, identity, interaction timing, movement, and flight; Controls covers key bindings; Audio covers the mixer.',
        ],
      },
      {
        id: 'ai-settings',
        title: 'Per-AI settings dialog',
        body: [
          'The per-AI settings dialog is reached by right-clicking an AI in the world. It edits one AI instance and, when the learning controller is present, exposes the shared AI Learning settings on its Learning page.',
        ],
      },
      {
        id: 'othello-settings',
        title: 'Othello settings dialog',
        body: ['The Othello settings dialog is separate from the voxel-world settings. It has Match, AI, Book, and Learning tabs and is reached from the Othello play space.'],
      },
    ],
    references: [
      {
        title: 'Settings Overview',
        href: '/docs/settings-overview',
        description: 'A full map of every settings surface.',
      },
      {
        title: 'AI Settings',
        href: '/docs/ai-settings',
        description: 'The per-AI settings detail.',
      },
      {
        title: 'Othello Settings',
        href: '/docs/othello-settings',
        description: 'The Othello settings detail.',
      },
    ],
  },
];
