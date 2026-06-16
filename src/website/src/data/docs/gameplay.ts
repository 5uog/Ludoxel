/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const gameplayPages: DocsPageContent[] = [
  {
    slug: 'my-world-mode',
    navigationTitle: 'My World Mode',
    eyebrow: 'Gameplay',
    title: 'My World Mode',
    description: 'The voxel play space: its persistent world, player, AI actors, and the survival and creative game modes.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        body: [
          'My World is the voxel play space. It owns a block world, the player entity, AI NPCs, and the hotbar inventory, and it is restored from saved state on launch. Edits made to the world persist with the session.',
        ],
      },
      {
        id: 'game-modes',
        title: 'Survival and creative',
        body: [
          'My World runs in either survival or creative mode, toggled in Player settings or with the creative-mode key. Creative mode allows flight and uses a separate creative hotbar; survival mode uses the survival hotbar. Flight is only allowed in creative mode, and the saved flying state is ignored when the mode does not permit it.',
        ],
      },
      {
        id: 'actors-in-the-world',
        title: 'Actors in the world',
        body: [
          'The player and any AI NPCs share the same world rules: the same collision, the same block shapes, and the same placement constraints. AI NPCs are spawned by the player and saved with the world so they return after a restart.',
        ],
      },
    ],
    references: [
      {
        title: 'World Generation and Spawn',
        href: '/docs/world-generation-and-spawn',
        description: 'How the world is generated and where the player starts.',
      },
      {
        title: 'World Runtime',
        href: '/docs/world-runtime',
        description: 'The technical model behind My World.',
      },
      {
        title: 'AI NPC Combat and Navigation',
        href: '/docs/ai-npc-combat-and-navigation',
        description: 'How AI actors move and fight in the world.',
      },
    ],
  },
  {
    slug: 'world-generation-and-spawn',
    navigationTitle: 'World Generation and Spawn',
    eyebrow: 'Gameplay',
    title: 'World Generation and Spawn',
    description: 'How the voxel world is generated from a seed and where the player spawns when a new world is created.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'generation',
        title: 'Seeded generation',
        body: [
          'A new My World is generated from an integer seed through a deterministic test-map generator. The same seed produces the same starting world, so generation is reproducible rather than random per launch.',
        ],
      },
      {
        id: 'spawn',
        title: 'Spawn position',
        body: [
          'The default My World spawn is the world coordinate `(0.0, 1.0, -10.0)` with a yaw and pitch of zero. When saved state exists, the player is restored to its saved position instead of the default spawn.',
        ],
      },
      {
        id: 'persistence-boundary',
        title: 'Generated versus saved',
        body: [
          'Generation provides the initial world. Once the player edits the world, the edited blocks are saved and restored, so a returning session sees the saved world rather than a freshly generated one.',
        ],
      },
    ],
    references: [
      {
        title: 'My World Mode',
        href: '/docs/my-world-mode',
        description: 'The play space that uses this world.',
      },
      {
        title: 'Saved Session State',
        href: '/docs/saved-session-state',
        description: 'How the world is saved and restored.',
      },
      {
        title: 'World Runtime',
        href: '/docs/world-runtime',
        description: 'How the world is held at runtime.',
      },
    ],
  },
  {
    slug: 'movement-and-collision',
    navigationTitle: 'Movement and Collision',
    eyebrow: 'Gameplay',
    title: 'Movement and Collision',
    description: 'Walking, sprinting, jumping, crouching, gravity, flight, and how the player collides with block shapes.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'kinematics',
        title: 'Walking, sprinting, and jumping',
        body: [
          'The player moves with configurable walk speed, sprint speed, jump velocity, and gravity. Auto-jump and auto-sprint can be enabled to assist movement. The player body is an axis-aligned box; the eye height drops slightly while crouching.',
        ],
      },
      {
        id: 'collision',
        title: 'Collision with block shapes',
        body: [
          'Collision resolves the player box against the collision boxes of nearby blocks. Non-cube shapes such as slabs, stairs, fences, fence gates, and walls use their own collision boxes rather than being treated as full cubes, so the player can stand on a slab or be stopped by a wall correctly.',
        ],
      },
      {
        id: 'gravity-and-flight',
        title: 'Gravity and flight',
        body: [
          'Gravity pulls the player down when not on the ground and not flying. Flight is available only in creative mode and uses its own ascend, descend, and horizontal speeds. Falling far enough produces a louder landing sound on contact.',
        ],
      },
    ],
    references: [
      {
        title: 'Block Shapes and Support',
        href: '/docs/block-shapes-and-support',
        description: 'The shapes that collision uses.',
      },
      {
        title: 'Runtime Settings',
        href: '/docs/runtime-settings',
        description: 'Movement, flight, and interaction parameters.',
      },
      {
        title: 'World Runtime',
        href: '/docs/world-runtime',
        description: 'How movement is stepped each frame.',
      },
    ],
  },
  {
    slug: 'block-breaking-and-placement',
    navigationTitle: 'Block Breaking and Placement',
    eyebrow: 'Gameplay',
    title: 'Block Breaking and Placement',
    description: 'How blocks are targeted, broken, and placed, and the conditions that make a placement valid.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'picking',
        title: 'Picking a target',
        body: [
          'The picking system casts the view ray to the first block face within reach. The result identifies both the block being looked at and the adjacent cell where a new block would be placed.',
        ],
      },
      {
        id: 'breaking',
        title: 'Breaking',
        body: [
          'Breaking removes the targeted block, updates the world revision, emits break particles, and plays the block-break sound for that block sound group. Held breaking repeats at the configured break interval.',
        ],
      },
      {
        id: 'placing',
        title: 'Placing',
        body: [
          'Placing inserts the selected hotbar block into the adjacent cell when that cell is valid for the block. The placed shape and its state, such as the facing of stairs or the connections of a fence, follow the block model. Held placing repeats at the configured place interval.',
        ],
      },
    ],
    references: [
      {
        title: 'World Interaction',
        href: '/docs/world-interaction',
        description: 'The player-facing manual for these actions.',
      },
      {
        title: 'Block and Placement Rules',
        href: '/docs/block-and-placement-rules',
        description: 'The technical model for placement and support.',
      },
      {
        title: 'Block Shapes and Support',
        href: '/docs/block-shapes-and-support',
        description: 'Shapes, support, and connectivity.',
      },
    ],
  },
  {
    slug: 'block-shapes-and-support',
    navigationTitle: 'Block Shapes and Support',
    eyebrow: 'Gameplay',
    title: 'Block Shapes and Support',
    description: 'The block families and shapes Ludoxel implements, and how shape affects collision, connection, and support.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'families',
        title: 'Block families',
        body: [
          'Blocks are registered from wood and stone catalogs. Stone-like materials include stone types, decorative stone, sandstone, ore, special stone, and special dirt; wood materials provide their own planks and variants. Each material registers several variants from the same texture set.',
        ],
      },
      {
        id: 'shapes',
        title: 'Shapes',
        body: [
          'A material can appear as a full block, a slab, stairs, a wall, or a fence, and fence gates exist as a separate interactive shape. Only the full block is a full cube; slabs, stairs, walls, fences, and fence gates have partial collision and visual geometry.',
        ],
      },
      {
        id: 'connection-and-support',
        title: 'Connection and support',
        body: [
          'Fences, walls, and fence gates connect to neighbors, so their visible posts and arms depend on the surrounding blocks. Placement and breaking respect support and connectivity rules, and gravity-affected blocks fall when unsupported. These distinctions matter to collision, selection outlines, and AI observation.',
        ],
      },
    ],
    references: [
      {
        title: 'Block and Placement Rules',
        href: '/docs/block-and-placement-rules',
        description: 'How support and connectivity are computed.',
      },
      {
        title: 'Movement and Collision',
        href: '/docs/movement-and-collision',
        description: 'How shapes affect player collision.',
      },
      {
        title: 'Inventory Items',
        href: '/docs/inventory-items',
        description: 'How these blocks reach the hotbar.',
      },
    ],
  },
  {
    slug: 'inventory-items',
    navigationTitle: 'Inventory Items',
    eyebrow: 'Gameplay',
    title: 'Inventory Items',
    description: 'Which blocks and catalog items can occupy hotbar slots in the voxel play space.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'block-items',
        title: 'Block items',
        body: [
          'Hotbar slots can hold any registered block variant, including the full block, slab, stairs, wall, and fence forms of each material. Selecting a block slot makes that block the one placed by the place action.',
        ],
      },
      {
        id: 'catalog-visibility',
        title: 'Catalog visibility',
        body: [
          'The inventory overlay lists the blocks available for assignment. Special items that are marked catalog-visible, such as the AI spawn egg, also appear so they can be assigned to a slot.',
        ],
      },
      {
        id: 'separate-hotbars',
        title: 'Separate hotbars',
        body: [
          'Survival and creative modes keep separate hotbar contents, and the Othello play space and AI route editing keep their own hotbars. The active hotbar follows the current context, so assignments made in one context do not overwrite another.',
        ],
      },
    ],
    references: [
      {
        title: 'Inventory and Hotbar',
        href: '/docs/inventory-and-hotbar',
        description: 'The player-facing hotbar manual.',
      },
      {
        title: 'Special Items',
        href: '/docs/special-items',
        description: 'The non-block items in the catalog.',
      },
      {
        title: 'Block Shapes and Support',
        href: '/docs/block-shapes-and-support',
        description: 'The block variants that can be held.',
      },
    ],
  },
  {
    slug: 'special-items',
    navigationTitle: 'Special Items',
    eyebrow: 'Gameplay',
    title: 'Special Items',
    description: 'The non-block special items: the AI spawn egg and the route editing tools, and the Othello-specific special items.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'core-special-items',
        title: 'Core special items',
        body: [
          'The core special items are the AI spawn egg, which spawns one standby AI at a valid cell, and three route-editing tools: Check confirms the current route draft, Eraser deletes a route point under the crosshair, and Cancel discards the route draft. Only the AI spawn egg is catalog-visible; the route tools appear while editing a route.',
        ],
      },
      {
        id: 'item-vs-block',
        title: 'Items versus blocks',
        body: [
          'A special item triggers a behavior instead of placing a block. When the selected hotbar slot holds a special item, the placement action runs that item behavior rather than inserting a cube into the world.',
        ],
      },
      {
        id: 'othello-special-items',
        title: 'Othello special items',
        body: [
          'The Othello play space contributes its own special items used inside an Othello match. They are registered separately from the voxel-world special items and appear in the Othello hotbar.',
        ],
      },
    ],
    references: [
      {
        title: 'AI NPC Placement Behavior',
        href: '/docs/ai-npc-placement-behavior',
        description: 'How routes and placement interact with AI.',
      },
      {
        title: 'Othello Items and Hotbar',
        href: '/docs/othello-items-and-hotbar',
        description: 'The Othello-specific items.',
      },
      {
        title: 'Inventory and Hotbar',
        href: '/docs/inventory-and-hotbar',
        description: 'How items occupy hotbar slots.',
      },
    ],
  },
  {
    slug: 'player-combat-and-damage',
    navigationTitle: 'Player Combat and Damage',
    eyebrow: 'Gameplay',
    title: 'Player Combat and Damage',
    description: 'The player health pool, damage application, the hurt cooldown, and the hurt flash and camera tilt feedback.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'health',
        title: 'Health',
        body: [
          'The player has 20 health points by default, shown as ten hearts where one heart is two points. Health is clamped between zero and the maximum, and the player is alive while health is above zero.',
        ],
      },
      {
        id: 'damage',
        title: 'Damage and cooldown',
        body: [
          'Applying damage reduces health and starts a short hurt cooldown that suppresses repeated damage until it elapses, unless the damage explicitly bypasses the cooldown. Damage at or below zero, or to a dead player, has no effect.',
        ],
      },
      {
        id: 'feedback',
        title: 'Hurt feedback',
        body: [
          'Damage triggers a hurt flash and a brief camera tilt. The tilt direction is derived from the position of the damage source relative to the view, so hits from the left and right tilt the camera in opposite directions. When health reaches zero the death overlay appears.',
        ],
      },
    ],
    references: [
      {
        title: 'Pause, Death, and Recovery',
        href: '/docs/pause-death-and-recovery',
        description: 'The player-facing death and respawn flow.',
      },
      {
        title: 'Death Messages and Respawn',
        href: '/docs/death-messages-and-respawn',
        description: 'How death messages are produced.',
      },
      {
        title: 'AI NPC Combat and Navigation',
        href: '/docs/ai-npc-combat-and-navigation',
        description: 'The combat that can damage the player.',
      },
    ],
  },
  {
    slug: 'ai-npc-combat-and-navigation',
    navigationTitle: 'AI NPC Combat and Navigation',
    eyebrow: 'Gameplay',
    title: 'AI NPC Combat and Navigation',
    description: 'How AI NPCs wander, navigate, recover from being stuck, and engage in combat, and the edge-safety rules that bound their movement.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'movement',
        title: 'Movement and navigation',
        body: [
          'AI NPCs use the same kinematics, collision, and jump rules as the player. They can wander, follow routes, navigate around obstacles, perform parkour jumps, recover when stuck, and avoid hazards. Before walking forward near an edge, an AI checks the next footing.',
        ],
      },
      {
        id: 'edge-safety',
        title: 'Edge safety',
        body: [
          'In Free Roam and PVP, an AI allows drops of up to three blocks onto solid ground, while deeper gaps and the void stop or redirect movement. Route Patrol permits deeper descents only when ground exists below the next step. If placement is permitted, the AI may bridge a gap rather than stop.',
        ],
      },
      {
        id: 'combat',
        title: 'Combat',
        body: [
          'An Aggressive AI seeks combat with the player and attacks in range, and can use spacing tactics such as backpedalling or strafing while attacking. A Peaceful AI does not seek combat. Combat respects the same attack-range and movement-safety rules used elsewhere.',
        ],
      },
    ],
    references: [
      {
        title: 'AI NPC Behavior',
        href: '/docs/ai-npc-behavior',
        description: 'The full behavior system.',
      },
      {
        title: 'AI NPC Placement Behavior',
        href: '/docs/ai-npc-placement-behavior',
        description: 'How AI placement and bridging work.',
      },
      {
        title: 'AI Settings',
        href: '/docs/ai-settings',
        description: 'The role, personality, and safety settings.',
      },
    ],
  },
  {
    slug: 'ai-npc-placement-behavior',
    navigationTitle: 'AI NPC Placement Behavior',
    eyebrow: 'Gameplay',
    title: 'AI NPC Placement Behavior',
    description: 'When an AI is allowed to place blocks, how bridging works, and how placement permission interacts with movement safety.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'permission',
        title: 'Placement permission',
        body: [
          'Block placement for an AI is a movement aid rather than unrestricted building permission. It is enabled per AI on the Block Placement page and allows bridging, securing the next footing, escaping a boxed position, and defensive placement.',
        ],
      },
      {
        id: 'bridging',
        title: 'Bridging and line of sight',
        body: [
          'Placement requires a clear line of sight to the support face. During bridging, forward movement waits until the next footing exists rather than advancing ahead of an unfinished bridge, which keeps the AI from stepping into the gap it is trying to cross.',
        ],
      },
      {
        id: 'safety-dependency',
        title: 'Safety dependency',
        body: [
          'Movement safety is always active and has no independent toggle, because its fallback depends on whether placement is permitted. With placement enabled the AI may secure a gap with a bridge; without it the AI stops or turns away from an unsafe edge.',
        ],
      },
    ],
    references: [
      {
        title: 'AI NPC Combat and Navigation',
        href: '/docs/ai-npc-combat-and-navigation',
        description: 'The movement and edge-safety rules.',
      },
      {
        title: 'AI Settings',
        href: '/docs/ai-settings',
        description: 'The placement permission setting.',
      },
      {
        title: 'Block and Placement Rules',
        href: '/docs/block-and-placement-rules',
        description: 'The shared placement rules.',
      },
    ],
  },
  {
    slug: 'othello-match-flow',
    navigationTitle: 'Othello Match Flow',
    eyebrow: 'Gameplay',
    title: 'Othello Match Flow',
    description: 'The Othello board, legal moves, captures, passes, clocks, and how a match reaches its result.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'board-and-moves',
        title: 'Board and legal moves',
        body: [
          'The board is 8 by 8 with the four central starting discs placed before play. A move is legal only when it flanks and flips at least one line of opposing discs; placing a disc captures all flanked opponents in those lines.',
        ],
      },
      {
        id: 'turns-and-passes',
        title: 'Turns, passes, and result',
        body: [
          'Play alternates between black and white. A side with no legal move passes, and two consecutive passes end the match. The result is decided by disc count: more black discs is a black win, more white discs is a white win, and an equal count is a draw.',
        ],
      },
      {
        id: 'clocks',
        title: 'Clocks',
        body: [
          'The match can run with no timer or with a per-move or per-side time control. When a finite timer is active, each side keeps a remaining time that is clamped to the configured limit. The time control is chosen in Othello settings.',
        ],
      },
    ],
    references: [
      {
        title: 'Othello Mode Operation',
        href: '/docs/othello-mode-operation',
        description: 'The player-facing manual for matches.',
      },
      {
        title: 'Othello Settings',
        href: '/docs/othello-settings',
        description: 'Difficulty, time control, and engine settings.',
      },
      {
        title: 'Othello Engine',
        href: '/docs/othello-engine',
        description: 'How the opponent computes its move.',
      },
    ],
  },
  {
    slug: 'othello-items-and-hotbar',
    navigationTitle: 'Othello Items and Hotbar',
    eyebrow: 'Gameplay',
    title: 'Othello Items and Hotbar',
    description: 'The Othello-specific hotbar and special items used inside an Othello match.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'othello-hotbar',
        title: 'Othello hotbar',
        body: [
          'The Othello play space uses its own hotbar with its own default contents. The active hotbar switches to the Othello set when the Othello space is active, separately from the survival and creative hotbars.',
        ],
      },
      {
        id: 'othello-items',
        title: 'Othello special items',
        body: [
          'Othello contributes its own special items, registered separately from the voxel-world special items and combined into the shared special-item registry. They are used within the Othello match context.',
        ],
      },
      {
        id: 'separation',
        title: 'Separation from the voxel world',
        body: ['Othello items and the Othello hotbar do not mix with the voxel-world inventory. The two play spaces keep distinct hotbar state so each context shows only its relevant items.'],
      },
    ],
    references: [
      {
        title: 'Othello Match Flow',
        href: '/docs/othello-match-flow',
        description: 'The match these items are used in.',
      },
      {
        title: 'Special Items',
        href: '/docs/special-items',
        description: 'The shared special-item registry.',
      },
      {
        title: 'Inventory and Hotbar',
        href: '/docs/inventory-and-hotbar',
        description: 'How separate hotbars are kept.',
      },
    ],
  },
  {
    slug: 'death-messages-and-respawn',
    navigationTitle: 'Death Messages and Respawn',
    eyebrow: 'Gameplay',
    title: 'Death Messages and Respawn',
    description: 'The death overlay, its message, and the respawn action that recovers the player.',
    searchSection: 'Gameplay',
    sections: [
      {
        id: 'death-overlay',
        title: 'Death overlay',
        body: [
          'When the player dies, a `YOU DIED` panel appears with a message and a Respawn button. The message describes the death; when no specific message is set it falls back to a generic line such as `Player died.`',
        ],
      },
      {
        id: 'respawn',
        title: 'Respawn',
        body: ['Pressing Respawn requests a recovery that restores the player to a living state. Respawn is a presentation-driven request; the session applies the recovery to the player entity.'],
      },
      {
        id: 'cause',
        title: 'Cause of death',
        body: ['Death follows the player health reaching zero from accumulated damage. The cause text shown in the overlay describes that event and is set by the session that detected the death.'],
      },
    ],
    references: [
      {
        title: 'Player Combat and Damage',
        href: '/docs/player-combat-and-damage',
        description: 'How damage leads to death.',
      },
      {
        title: 'Pause, Death, and Recovery',
        href: '/docs/pause-death-and-recovery',
        description: 'The player-facing recovery flow.',
      },
      {
        title: 'HUD and Overlay State',
        href: '/docs/hud-and-overlay-state',
        description: 'How the death overlay owns its state.',
      },
    ],
  },
];
