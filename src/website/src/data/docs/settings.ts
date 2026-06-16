/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const settingsPages: DocsPageContent[] = [
  {
    slug: 'settings-overview',
    navigationTitle: 'Settings Overview',
    eyebrow: 'Settings',
    title: 'Settings Overview',
    description: 'A map of the three settings surfaces in Ludoxel and which groups of settings each one owns.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'surfaces',
        title: 'Settings surfaces',
        body: [
          'Ludoxel has three settings surfaces. The main settings dialog covers the player and world; the per-AI settings dialog covers one AI plus the shared AI Learning controls; and the Othello settings dialog covers the Othello match and engine. Each is a sidebar dialog with named tabs.',
        ],
      },
      {
        id: 'main-tabs',
        title: 'Main dialog tabs',
        body: [
          'The main settings dialog has Display, World, Player, Controls, Audio, and About tabs. Display owns the camera, the window and HUD visibility, the player model, view motion, and the crosshair. World owns render distance, world rendering toggles, shadows, particles, clouds, and the sun. Player owns game mode, identity, interaction timing, movement, and flight. Controls owns key bindings, and Audio owns the mixer.',
        ],
      },
      {
        id: 'normalization',
        title: 'Normalization',
        body: [
          'Every saved setting is normalized before use, so an out-of-range or malformed value is clamped or reset to a safe value rather than trusted. Allowed ranges and discrete values described in these pages are the values the normalizers enforce.',
        ],
      },
    ],
    references: [
      {
        title: 'Settings Entry Points',
        href: '/docs/settings-entry-points',
        description: 'How each surface is reached.',
      },
      {
        title: 'Settings Persistence',
        href: '/docs/settings-persistence',
        description: 'How settings are stored.',
      },
      {
        title: 'Settings Apply Timing',
        href: '/docs/settings-apply-timing',
        description: 'When changes take effect.',
      },
    ],
  },
  {
    slug: 'runtime-settings',
    navigationTitle: 'Runtime Settings',
    eyebrow: 'Settings',
    title: 'Runtime Settings',
    description: 'World rendering toggles, render distance, particles, the sun, game mode, interaction timing, movement, and flight parameters.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'world-rendering',
        title: 'World rendering',
        body: [
          'The World tab exposes render distance and world rendering toggles. Render distance is a chunk radius around the player; it is clamped to the range 2 to 6 chunks and defaults to 6. The toggles control animated textures, the selection outline, and the world wireframe.',
        ],
        items: [
          'Render distance — field `render_distance_chunks`; integer; range 2 to 6 chunks; default 6; World tab; affects upload load and visible range.',
          'Animated Textures — field `animated_textures_enabled`; boolean; default on; World tab.',
          'Outline selection — field `outline_selection`; boolean; default on; World tab; draws the targeted block outline.',
          'World wireframe — field `world_wire`; boolean; default off; World tab; debug-style world rendering.',
        ],
      },
      {
        id: 'particles-and-sun',
        title: 'Particles and sun',
        body: ['The World tab also controls break particles and the sun direction used by lighting. Particle controls scale the break burst; the sun controls set the lighting direction.'],
        items: [
          'Break particle spawn rate — field `block_break_particle_spawn_rate`; float; range 0.0 to 2.0; default 1.0; World tab.',
          'Break particle speed — field `block_break_particle_speed_scale`; float; range 0.1 to 3.0; default 1.0; World tab.',
          'Sun azimuth — field `sun_az_deg`; float; wrapped to 0 to 360 degrees; default 45; World tab.',
          'Sun elevation — field `sun_el_deg`; float; clamped to 0 to 90 degrees; default 60; World tab.',
        ],
      },
      {
        id: 'player-mode-and-interaction',
        title: 'Game mode and interaction timing',
        body: [
          'The Player tab switches between survival and creative game modes and sets the repeat intervals for held block actions. The mode also selects which hotbar is active and whether flight is allowed.',
        ],
        items: [
          'Game mode — field `creative_mode`; boolean; default off (survival); Player tab; creative enables flight and the creative hotbar.',
          'Auto-Jump — field `auto_jump_enabled`; boolean; default off; Player tab.',
          'Auto-Sprint — field `auto_sprint_enabled`; boolean; default off; Player tab.',
          'Break repeat interval — field `block_break_repeat_interval_s`; seconds; range 0.0 to 1.0; default 0.30; Player tab.',
          'Place repeat interval — field `block_place_repeat_interval_s`; seconds; range 0.0 to 1.0; default about 0.0083; Player tab.',
          'Interact repeat interval — field `block_interact_repeat_interval_s`; seconds; range 0.0 to 1.0; default 0.20; Player tab.',
        ],
      },
      {
        id: 'movement-and-flight',
        title: 'Movement and flight',
        body: [
          'The Player tab includes the movement parameters and the creative flight speeds. These values feed the movement system and can be returned to their defaults with the Advanced Reset action.',
        ],
        items: [
          'Gravity — default 32.0; Player tab; downward acceleration when not grounded or flying.',
          'Walk speed — default 4.317; Player tab.',
          'Sprint speed — default 5.612; Player tab.',
          'Jump velocity — default 8.4; Player tab.',
          'Auto-jump cooldown — default 0.12 s; Player tab.',
          'Flight speed, ascend speed, and descend speed — default 10.92 each; Player tab; creative mode only.',
        ],
      },
    ],
    references: [
      {
        title: 'Movement and Collision',
        href: '/docs/movement-and-collision',
        description: 'How these parameters drive movement.',
      },
      {
        title: 'Shadow Settings',
        href: '/docs/shadow-settings',
        description: 'The shadow controls on the World tab.',
      },
      {
        title: 'Performance Boundaries',
        href: '/docs/performance-boundaries',
        description: 'How render distance affects performance.',
      },
    ],
  },
  {
    slug: 'camera-settings',
    navigationTitle: 'Camera Settings',
    eyebrow: 'Settings',
    title: 'Camera Settings',
    description: 'Field of view, perspective, mouse sensitivity, axis inversion, view motion, the player model arm, and HUD visibility on the Display tab.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'camera',
        title: 'Camera and look',
        body: ['The Display tab sets the field of view, the camera perspective, mouse sensitivity, and axis inversion. The perspective is also cycled in the world with the camera key.'],
        items: [
          'Field of view — Display tab; vertical FOV in degrees; shown with a default of 80 degrees.',
          'Camera perspective — field `camera_perspective`; one of `first_person`, `third_person_back`, `third_person_front`; default `first_person`; Display tab.',
          'Mouse sensitivity — Display tab; degrees per relative mouse pixel; shown with a default near 0.090.',
          'Invert X — field `invert_x`; boolean; default off; Display tab.',
          'Invert Y — field `invert_y`; boolean; default off; Display tab.',
        ],
      },
      {
        id: 'window-and-hud',
        title: 'Window and HUD visibility',
        body: [
          'The Display tab toggles fullscreen and first-person presentation visibility. Hiding the hand removes the first-person view model, and the view model is only drawn in first person when the hand is visible.',
        ],
        items: [
          'Fullscreen — field `fullscreen`; boolean; default off; Display tab.',
          'Hide HUD — field `hide_hud`; boolean; default off; Display tab.',
          'Hide Hand — field `hide_hand`; boolean; default off; Display tab.',
        ],
      },
      {
        id: 'player-model-and-motion',
        title: 'Player model and view motion',
        body: [
          'The Display tab limits first-person arm rotation and swing timing and controls view bobbing and camera shake. View bobbing and camera shake each have an on or off toggle and a strength slider; the strength slider is enabled only when its effect is on.',
        ],
        items: [
          'Arm rotation minimum and maximum — fields `arm_rotation_limit_min_deg` and `arm_rotation_limit_max_deg`; degrees; range -180 to 180; defaults -180 and 180; Display tab.',
          'Arm swing duration — field `arm_swing_duration_s`; seconds; range 0.05 to 1.50; default 0.30; Display tab.',
          'View bobbing — field `view_bobbing_enabled`; boolean; default on; with strength `view_bobbing_strength`; range 0.0 to 1.0; default 0.35; Display tab.',
          'Camera shake — field `camera_shake_enabled`; boolean; default on; with strength `camera_shake_strength`; range 0.0 to 1.0; default 0.20; Display tab.',
        ],
      },
    ],
    references: [
      {
        title: 'Crosshair Settings',
        href: '/docs/crosshair-settings',
        description: 'The crosshair editor on the Display tab.',
      },
      {
        title: 'Input and Mouse Capture',
        href: '/docs/input-and-mouse-capture',
        description: 'How sensitivity and inversion are applied.',
      },
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'How the player model is drawn.',
      },
    ],
  },
  {
    slug: 'audio-settings',
    navigationTitle: 'Audio Settings',
    eyebrow: 'Settings',
    title: 'Audio Settings',
    description: 'The four mixer gains: master, ambient, block, and player, and how category gain combines with master gain.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'mixer',
        title: 'Mixer',
        body: [
          'The Audio tab has four gains. Each gain is a value from zero to one, shown in the UI as a percentage from 0 to 100, and all default to full. The effective gain of a category is its own gain multiplied by the master gain.',
        ],
        items: [
          'Master volume — field `master`; range 0.0 to 1.0; default 1.0; Audio tab; applied before category gain.',
          'Ambient volume — field `ambient`; range 0.0 to 1.0; default 1.0; Audio tab; ambient loop gain.',
          'Block volume — field `block`; range 0.0 to 1.0; default 1.0; Audio tab; placement, breaking, and interaction effects.',
          'Player volume — field `player`; range 0.0 to 1.0; default 1.0; Audio tab; player and actor effects.',
        ],
      },
      {
        id: 'storage',
        title: 'Storage and effect',
        body: [
          'The mixer values are stored in the audio preference schema and applied to the playback manager when changed. Setting a category to zero silences that category; setting the master to zero silences all categories.',
        ],
      },
    ],
    references: [
      {
        title: 'Audio and Visual Feedback',
        href: '/docs/audio-and-visual-feedback',
        description: 'The sounds these gains control.',
      },
      {
        title: 'Settings Persistence',
        href: '/docs/settings-persistence',
        description: 'How the mixer is saved.',
      },
      {
        title: 'Saved Settings',
        href: '/docs/saved-settings',
        description: 'The settings file that holds the mixer.',
      },
    ],
  },
  {
    slug: 'cloud-settings',
    navigationTitle: 'Cloud Settings',
    eyebrow: 'Settings',
    title: 'Cloud Settings',
    description: 'Cloud visibility, density, seed, per-cloud speed range, and height behavior on the World tab.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'visibility-and-shape',
        title: 'Visibility, density, and seed',
        body: ['The Clouds card controls whether clouds are drawn, their density and placement seed, and a wireframe mode. The density and seed controls are disabled while clouds are off.'],
        items: [
          'Show clouds — field `cloud_enabled`; boolean; default on; World tab.',
          'Cloud wireframe — field `cloud_wire`; boolean; default off; World tab.',
          'Cloud density — field `cloud_density`; integer; range 0 to 4; default 1; World tab.',
          'Cloud seed — field `cloud_seed`; integer; range 0 to 9999; default 1337; World tab.',
        ],
      },
      {
        id: 'speed',
        title: 'Speed variation',
        body: [
          'Per-cloud speed variation gives each cloud a horizontal speed within a configured range. The minimum and maximum speed controls are enabled only when speed variation and clouds are both on, and the range is normalized so the minimum never exceeds the maximum.',
        ],
        items: [
          'Per-cloud speed variation — field `cloud_speed_variation_enabled`; boolean; default on; World tab.',
          'Slowest cloud speed — field `cloud_speed_min_blocks_per_second`; blocks per second; range 0.0 to 4.0; default 0.50; World tab.',
          'Fastest cloud speed — field `cloud_speed_max_blocks_per_second`; blocks per second; range 0.0 to 4.0; default 0.90; World tab.',
        ],
      },
      {
        id: 'height',
        title: 'Height behavior',
        body: [
          'Cloud height variation distributes clouds across a spawn range with a preferred sub-range and probability. When height variation is off, clouds use a single fixed Y. The height controls are enabled or disabled to match whether height variation is on, and the preferred interval is projected into the spawn range.',
        ],
        items: [
          'Cloud height variation — field `cloud_height_variation_enabled`; boolean; default on; World tab.',
          'Fixed cloud Y — field `cloud_fixed_y`; integer; range 28 to 250; default 28; used when height variation is off.',
          'Random spawn Y minimum and maximum — fields `cloud_spawn_y_min` and `cloud_spawn_y_max`; range 28 to 250; defaults 28 and 35.',
          'Preferred Y minimum and maximum — fields `cloud_preferred_y_min` and `cloud_preferred_y_max`; range 28 to 250; defaults 28 and 30.',
          'Preferred Y probability — field `cloud_preferred_y_probability_percent`; integer; range 0 to 100; default 70.',
        ],
      },
    ],
    references: [
      {
        title: 'Cloud Flow Settings',
        href: '/docs/cloud-flow-settings',
        description: 'The cloud flow direction.',
      },
      {
        title: 'Shadows and Distance Fog',
        href: '/docs/shadows-and-distance-fog',
        description: 'How clouds fit the scene.',
      },
      {
        title: 'Performance Boundaries',
        href: '/docs/performance-boundaries',
        description: 'How cloud density affects performance.',
      },
    ],
  },
  {
    slug: 'cloud-flow-settings',
    navigationTitle: 'Cloud Flow Settings',
    eyebrow: 'Settings',
    title: 'Cloud Flow Settings',
    description: 'The horizontal flow direction used by cloud motion.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'direction',
        title: 'Flow direction',
        body: ['The cloud flow direction sets the horizontal direction clouds drift. It is one of four directions, defaulting to west to east, and an unknown stored value falls back to the default.'],
        items: ['Cloud flow direction — field `cloud_flow_direction`; one of `east_to_west`, `west_to_east`, `south_to_north`, `north_to_south`; default `west_to_east`; World tab.'],
      },
      {
        id: 'relationship',
        title: 'Relationship to speed',
        body: ['Flow direction sets which way clouds move; the per-cloud speed range sets how fast. The two combine to produce cloud motion across the sky.'],
      },
    ],
    references: [
      {
        title: 'Cloud Settings',
        href: '/docs/cloud-settings',
        description: 'Cloud density, speed, and height.',
      },
      {
        title: 'Shadows and Distance Fog',
        href: '/docs/shadows-and-distance-fog',
        description: 'Clouds and scene depth.',
      },
    ],
  },
  {
    slug: 'shadow-settings',
    navigationTitle: 'Shadow Settings',
    eyebrow: 'Settings',
    title: 'Shadow Settings',
    description: 'The shadow map toggle and the five-level shadow quality, which is independent of render distance.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'shadow-map',
        title: 'Shadow map and quality',
        body: [
          'The World tab toggles the shadow map and selects a shadow quality. Quality has five discrete levels; a higher level raises the effective shadow-map texel density and filtering sharpness. The quality control is disabled while the shadow map is off.',
        ],
        items: [
          'Shadow map — field `shadow_enabled`; boolean; default on; World tab.',
          'Shadow map quality — field `shadow_map_quality`; integer 1 to 5 as Lowest, Low, Standard, High, Ultra; default 3 (Standard); World tab.',
        ],
      },
      {
        id: 'independence',
        title: 'Independent of render distance',
        body: [
          'Shadow quality is a shadow-only policy and is independent of render distance. Changing the render distance does not change the shadow level, and an invalid stored quality falls back to Standard.',
        ],
      },
    ],
    references: [
      {
        title: 'Shadows and Distance Fog',
        href: '/docs/shadows-and-distance-fog',
        description: 'How shadows are produced.',
      },
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'How both backends draw shadows.',
      },
      {
        title: 'Performance Boundaries',
        href: '/docs/performance-boundaries',
        description: 'The cost of higher shadow quality.',
      },
    ],
  },
  {
    slug: 'crosshair-settings',
    navigationTitle: 'Crosshair Settings',
    eyebrow: 'Settings',
    title: 'Crosshair Settings',
    description: 'The built-in crosshair and the custom 16 by 16 bitmap editor on the Display tab.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'mode',
        title: 'Crosshair mode',
        body: ['The crosshair is either the built-in art or a custom bitmap. The Display tab provides a preview, a 16 by 16 pixel editor, and a reset that returns to the built-in crosshair.'],
        items: [
          'Crosshair mode — field `crosshair_mode`; one of `default` or `custom`; default `default`; Display tab.',
          'Crosshair pixels — field `crosshair_pixels`; a 16 by 16 grid of on or off pixels; Display tab; used when the mode is custom.',
        ],
      },
      {
        id: 'normalization',
        title: 'Bitmap normalization',
        body: ['A stored bitmap is normalized to a 16 by 16 grid of on or off pixels, padding missing rows and columns. Resetting clears the custom bitmap and restores the built-in crosshair.'],
      },
    ],
    references: [
      {
        title: 'HUD and Overlay State',
        href: '/docs/hud-and-overlay-state',
        description: 'Where the crosshair is drawn.',
      },
      {
        title: 'Camera Settings',
        href: '/docs/camera-settings',
        description: 'The Display tab that hosts the editor.',
      },
    ],
  },
  {
    slug: 'keybind-settings',
    navigationTitle: 'Keybind Settings',
    eyebrow: 'Settings',
    title: 'Keybind Settings',
    description: 'Movement, gameplay, and hotbar key bindings, their defaults, the single-key rule, and duplicate resolution.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'sections',
        title: 'Binding sections',
        body: ['The Controls tab groups bindings into Movement keys, Gameplay keys, and Hotbar keys, plus a reset. Each action has one binding, edited per row.'],
        items: [
          'Movement — Move Forward `W`, Move Backward `S`, Move Left `A`, Move Right `D`, Jump `Space`, Crouch `Shift`, Sprint `Control`.',
          'Gameplay — Inventory `E`, Creative Mode `B`, Cycle Camera Perspective `F5`, Hide or Show HUD `F1`, Clear Selected Slot `Q`, Debug HUD `F3`, Debug Shadow `F4`.',
          'Hotbar — Hotbar Slot 1 through 9 bound to the digit keys `1` through `9`.',
        ],
      },
      {
        id: 'rules',
        title: 'Binding rules',
        body: [
          'A binding is a single key; modifier combinations and multi-key sequences are not stored. Assigning a key that another action already uses moves the binding to the new action and clears it from the old one, so bindings stay one to one. An unrecognized key is treated as unbound.',
        ],
      },
      {
        id: 'reset',
        title: 'Reset',
        body: ['The Keybind Reset action restores every movement, gameplay, and hotbar binding to its built-in default.'],
      },
    ],
    references: [
      {
        title: 'Basic Controls and Input',
        href: '/docs/basic-controls-and-input',
        description: 'The default controls in play.',
      },
      {
        title: 'Input and Mouse Capture',
        href: '/docs/input-and-mouse-capture',
        description: 'How bindings reach the input adapter.',
      },
    ],
  },
  {
    slug: 'player-name-settings',
    navigationTitle: 'Player Name Settings',
    eyebrow: 'Settings',
    title: 'Player Name Settings',
    description: 'The player name field, its length limit, and the random-name fallback when it is blank.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'name-field',
        title: 'Name field',
        body: [
          'The player name is set in the launch dialog and on the Player tab. The name is normalized and limited to 32 characters. A blank name uses a generated random identity for the launch, shown as the resolved name in the settings hint.',
        ],
        items: [
          'Player name — field `player_name`; string; up to 32 characters; default blank; Player tab and launch dialog.',
          'Resolved name — field `resolved_player_name`; the effective name used when the player name is blank.',
        ],
      },
      {
        id: 'random',
        title: 'Random fallback',
        body: ['When no explicit name is set, a random name is generated from a built-in word list. A saved explicit name takes precedence over the random fallback on later launches.'],
      },
    ],
    references: [
      {
        title: 'Player Identity and Skin',
        href: '/docs/player-identity-and-skin',
        description: 'The player-facing identity manual.',
      },
      {
        title: 'Player Skin Settings',
        href: '/docs/player-skin-settings',
        description: 'The skin selection.',
      },
    ],
  },
  {
    slug: 'player-skin-settings',
    navigationTitle: 'Player Skin Settings',
    eyebrow: 'Settings',
    title: 'Player Skin Settings',
    description: 'The choice between the bundled Alex skin and a custom imported skin.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'skin-kind',
        title: 'Skin kind',
        body: ['The player skin is either the bundled Alex skin or a custom imported skin. The selected skin is applied to the player model and the first-person view model.'],
        items: ['Player skin — field `player_skin_kind`; one of `alex` or `custom`; default `alex`.'],
      },
      {
        id: 'custom-skin',
        title: 'Custom skin',
        body: ['A custom skin is an imported image stored as user data. It is a user-created material; using it does not transfer rights in any included third-party content.'],
      },
    ],
    references: [
      {
        title: 'Player Identity and Skin',
        href: '/docs/player-identity-and-skin',
        description: 'The player-facing identity manual.',
      },
      {
        title: 'User-Created Materials',
        href: '/docs/user-created-materials',
        description: 'The legal treatment of imported skins.',
      },
    ],
  },
  {
    slug: 'ai-settings',
    navigationTitle: 'AI Settings',
    eyebrow: 'Settings',
    title: 'AI Settings',
    description: 'The per-AI settings: identity, display, skin, automatic regeneration, behavior role, route patrol, and block placement.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'identity-display-skin',
        title: 'Identity, display, and skin',
        body: [
          'The per-AI dialog edits one AI. Identity sets the nametag name; Display sets the health indicator position; Skin selects the skin source. Each change applies to the live AI immediately.',
        ],
        items: [
          'Name — field `name`; 1 to 16 letters or digits beginning with a letter, with an optional suffix from #0001 to #9999; live AI names must be unique.',
          'Health indicator — field `health_indicator`; one of Above nametag, Below nametag, or Off; default Above; the name is always shown.',
          'Skin source — field `skin_mode`; one of Same as player, Bundled Alex, or Imported PNG; Imported PNG uses a per-AI 64 by 64 image.',
        ],
      },
      {
        id: 'health',
        title: 'Automatic regeneration',
        body: [
          'The Health page configures optional automatic regeneration, which is disabled by default. Damage restarts the start delay, and regeneration never exceeds the lower of the health cap and the AI maximum health. The interval is edited as the time to fully restore the cap.',
        ],
        items: [
          'Auto regeneration — field `auto_regen_enabled`; boolean; default off.',
          'Start delay — field `regen_start_delay_s`; seconds; UI range 0.0 to 60.0.',
          'Health cap — field `regen_cap_hp`; UI range 1 to 20.',
          'Time to cap — UI range 0.5 to 3600 seconds; mapped to the stored regeneration interval.',
        ],
      },
      {
        id: 'behavior-placement',
        title: 'Behavior and block placement',
        body: [
          'The Behavior page sets the role, personality, and route patrol options; the Block Placement page sets placement permission and explains the always-active movement safety. Route Patrol applies only after at least two route points are confirmed in the world.',
        ],
        items: [
          'Mode — field `mode`; one of Standby, Free Roam / PVP, or Route Patrol.',
          'Personality — field `personality`; one of Aggressive or Peaceful.',
          'Route style — field `route_style`; one of Strict or Flexible; route run and closed-loop toggles also apply.',
          'Block placement — field `can_place_blocks`; boolean; enables bridging, securing footing, escaping, and defensive placement.',
        ],
      },
    ],
    references: [
      {
        title: 'AI NPC Operation',
        href: '/docs/ai-npc-operation',
        description: 'The player-facing AI manual.',
      },
      {
        title: 'AI Learning Settings',
        href: '/docs/ai-learning-settings',
        description: 'The shared Learning tab.',
      },
      {
        title: 'AI NPC Placement Behavior',
        href: '/docs/ai-npc-placement-behavior',
        description: 'How placement permission affects movement.',
      },
    ],
  },
  {
    slug: 'ai-learning-settings',
    navigationTitle: 'AI Learning Settings',
    eyebrow: 'Settings',
    title: 'AI Learning Settings',
    description: 'The Learning tab controls: learning mode, data capture, skill categories, policy selection, evaluation, and data management.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'mode-and-capture',
        title: 'Mode and data capture',
        body: [
          'The Learning tab configures the whole learning foundation, not one AI. The learning mode selects how learning participates, and the data capture controls choose which kinds of demonstration are recorded while the mode is Observe Only.',
        ],
        items: [
          'Learning mode — field `learning_mode`; one of `off`, `observe_only`, `use_learned_policy`, `train_from_player_data`, `train_in_sandbox`; default `off`.',
          'Data capture — field `capture_flags`; per-kind booleans for player movement, combat, placement, breaking, parkour, and trap, and AI decisions, failures, deaths, route failures, and escape attempts; default off.',
          'Skill categories — field `skill_flags`; per-skill booleans; default on.',
        ],
      },
      {
        id: 'policy-and-eval',
        title: 'Policy selection and evaluation',
        body: [
          'The policy source selects which policy the AI uses, and the selected policy chooses a specific bundled or user policy. Run evaluation validates the selected policy against the engine and the headless sandbox and reports a pass or fail.',
        ],
        items: [
          'Policy source — field `selected_policy_kind`; one of built-in deterministic, bundled, or user; default built-in deterministic.',
          'Selected policy — field `selected_policy_id`; the bundled or user policy identifier; default automatic.',
          'Run evaluation — validates schema, compatibility, mask compliance, and sandbox behavior for the selected policy.',
        ],
      },
      {
        id: 'data-management',
        title: 'Data management',
        body: [
          'Data Management exports, imports, and clears recorded demonstrations and manages the learned policy. Clear and Reset are destructive actions, while Export, Import, and Restore are not. Training and evaluation run on a background worker and disable these controls while running.',
        ],
        items: [
          'Export and Import — write or append demonstrations as a JSON Lines file.',
          'Clear player demonstration data — delete all recorded demonstrations for the dataset.',
          'Reset learned policy — return to the built-in deterministic baseline.',
          'Restore bundled policy — use a bundled learned policy as the source.',
        ],
      },
    ],
    references: [
      {
        title: 'AI Learning',
        href: '/docs/ai-learning',
        description: 'The full system this tab controls.',
      },
      {
        title: 'AI Learning Data Files',
        href: '/docs/ai-learning-data-files',
        description: 'Where this data is stored.',
      },
      {
        title: 'AI Use Restrictions',
        href: '/docs/ai-use-restrictions',
        description: 'The legal boundary on learning.',
      },
    ],
  },
  {
    slug: 'othello-settings',
    navigationTitle: 'Othello Settings',
    eyebrow: 'Settings',
    title: 'Othello Settings',
    description: 'Match, AI, and opening-book settings for the Othello play space, with their ranges and defaults.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'match',
        title: 'Match',
        body: ['The Match tab sets opponent strength, the clock, disc animation, and player order. Changes are applied immediately to the persisted Othello settings.'],
        items: [
          'AI difficulty — field `difficulty`; one of Weak, Medium, Strong, Insane, Insane+; default Medium.',
          'Time control — field `time_control`; timer off, per-move 5, 10, or 30 seconds, or per-side 1, 3, 5, 10, or 20 minutes; default 20 minutes per side.',
          'Disc animation — field `animation_mode`; one of Animation off, Ripple fast, or Ripple slow; default off.',
          'Player order — field `player_side`; player moves first (black) or second (white); default first.',
        ],
      },
      {
        id: 'engine',
        title: 'AI engine',
        body: ['The AI tab sets the engine worker, hash, and sacrifice parameters. Each is clamped to a calibrated range.'],
        items: [
          'Worker count — field `thread_count`; integer 1 to 8; default 1.',
          'Hash level — field `hash_level`; integer 0 to 6; default 2.',
          'Sacrifice level — field `sacrifice_level`; integer 0 to 4; default 2.',
        ],
      },
      {
        id: 'book',
        title: 'Opening book',
        body: ['The Book tab inspects, imports, and exports the opening book, and the Learning tab sets the book learning depth and error limits. Import and export are explicit user actions.'],
        items: [
          'Book depth — field `book_learning_depth`; integer 0 to 60; default 55.',
          'Per-move error — field `book_per_move_error`; float 0 to 24; default 22.',
          'Cumulative error — field `book_cumulative_error`; float 0 to 24; default 19.',
          'Leaf error — field `book_leaf_error`; float 0 to 24; default 20.',
        ],
      },
    ],
    references: [
      {
        title: 'Othello Match Flow',
        href: '/docs/othello-match-flow',
        description: 'The match these settings configure.',
      },
      {
        title: 'Othello Engine',
        href: '/docs/othello-engine',
        description: 'How the engine uses these values.',
      },
      {
        title: 'Othello Data Files',
        href: '/docs/othello-data-files',
        description: 'Where the opening book is stored.',
      },
    ],
  },
  {
    slug: 'settings-persistence',
    navigationTitle: 'Settings Persistence',
    eyebrow: 'Settings',
    title: 'Settings Persistence',
    description: 'How settings are normalized, where they are stored, and how the runtime preferences are restored on launch.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'storage',
        title: 'Where settings are stored',
        body: [
          'Runtime preferences, the keybinds, the audio mixer, and the Othello settings are written into the saved player state under the runtime data root. AI Learning settings are written to their own learning state file. Settings are not written into the repository.',
        ],
      },
      {
        id: 'normalization',
        title: 'Normalization on load and save',
        body: [
          'On load and on save, the runtime preferences are normalized: booleans are coerced, numeric ranges are clamped, hotbar slots and indices are reconciled, and the play-space identifier, Othello settings, keybinds, and audio are normalized. A malformed stored value becomes a safe value rather than an error.',
        ],
      },
      {
        id: 'restore',
        title: 'Restore on launch',
        body: [
          'On launch the saved settings are applied to the sessions and to the renderer, and the active play space is restored. When no saved state exists, the application starts from the built-in defaults.',
        ],
      },
    ],
    references: [
      {
        title: 'Saved Settings',
        href: '/docs/saved-settings',
        description: 'The settings file in the data root.',
      },
      {
        title: 'Persistence and Saved State',
        href: '/docs/persistence-and-saved-state',
        description: 'The persistence system.',
      },
      {
        title: 'Settings Apply Timing',
        href: '/docs/settings-apply-timing',
        description: 'When a change takes effect.',
      },
    ],
  },
  {
    slug: 'settings-apply-timing',
    navigationTitle: 'Settings Apply Timing',
    eyebrow: 'Settings',
    title: 'Settings Apply Timing',
    description: 'When settings changes take effect: immediate runtime application, dialog-close application, and the values that are written with the saved state.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'immediate',
        title: 'Immediate application',
        body: [
          'Most main-dialog controls emit a change that is applied to the live runtime as the control is moved, so a slider or toggle takes effect without confirmation. The per-AI dialog applies each valid change to the live AI immediately and has no separate save button.',
        ],
      },
      {
        id: 'learning-close',
        title: 'Learning and dialog close',
        body: [
          'AI Learning settings are saved immediately and reflected in the live session when the dialog is closed. A Train mode starts a background run rather than taking effect as a steady state, and on success the mode switches to Use Learned Policy.',
        ],
      },
      {
        id: 'persistence',
        title: 'Persistence timing',
        body: ['A live change updates the runtime state, and the saved state is written at runtime save points and on shutdown. Window geometry is recorded as the window is moved or resized.'],
      },
    ],
    references: [
      {
        title: 'Settings Persistence',
        href: '/docs/settings-persistence',
        description: 'How settings are stored.',
      },
      {
        title: 'Session Operation',
        href: '/docs/session-operation',
        description: 'When the session writes state.',
      },
      {
        title: 'AI Learning Settings',
        href: '/docs/ai-learning-settings',
        description: 'The close-to-apply learning controls.',
      },
    ],
  },
  {
    slug: 'performance-boundaries',
    navigationTitle: 'Performance Boundaries',
    eyebrow: 'Settings',
    title: 'Performance Boundaries',
    description: 'Which settings carry a real performance cost and why opening the settings should not rebuild the world.',
    searchSection: 'Settings',
    sections: [
      {
        id: 'costly-settings',
        title: 'Performance-sensitive settings',
        body: [
          'Render distance, shadow quality, cloud density, the number of AI NPCs, and the learning training operations carry a real cost. Render distance scales how many chunks are uploaded; shadow quality scales the shadow map; cloud density scales the cloud layers; more AI means more per-step work; training is heavy compute.',
        ],
      },
      {
        id: 'background-work',
        title: 'Background work',
        body: [
          'Learning training and evaluation, and the Othello engine search and book learning, run on background workers so the frame loop and UI thread are not blocked. Demonstration recording is buffered and written at an interval rather than every frame.',
        ],
      },
      {
        id: 'no-rebuild',
        title: 'No unnecessary rebuilds',
        body: [
          'Opening, closing, or changing settings should not trigger world regeneration or a full renderer rebuild. Decorative settings such as toggles are cheap; the costly settings above are the ones to weigh against frame rate.',
        ],
      },
    ],
    references: [
      {
        title: 'Runtime Settings',
        href: '/docs/runtime-settings',
        description: 'Render distance and movement.',
      },
      {
        title: 'Shadow Settings',
        href: '/docs/shadow-settings',
        description: 'The shadow quality cost.',
      },
      {
        title: 'AI Learning',
        href: '/docs/ai-learning',
        description: 'The cost of training operations.',
      },
    ],
  },
];
