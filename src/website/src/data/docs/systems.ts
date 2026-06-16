/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import type { DocsPageContent } from './types';

export const systemsPages: DocsPageContent[] = [
  {
    slug: 'world-runtime',
    navigationTitle: 'World Runtime',
    eyebrow: 'Systems',
    title: 'World Runtime',
    description: 'How the voxel session is organized: fixed-step stepping, world state, the player, AI actors, and the render snapshot.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'session-model',
        title: 'Session model',
        body: [
          'The world runtime is built around a session that owns the world state, the player, AI actors, the hotbar, and block interaction services. Each step advances the simulation by a fixed amount, and the runtime produces a render snapshot for the renderer to draw.',
        ],
      },
      {
        id: 'authority',
        title: 'Authoritative state',
        body: [
          'Gameplay state belongs to the simulation and application layers, not to the renderer. The renderer reads snapshots of that state and presents them; it does not change block placement, collision, or AI decisions. Settings adjust runtime parameters, which are normalized before use.',
        ],
      },
      {
        id: 'two-spaces',
        title: 'Two play spaces',
        body: [
          'The runtime hosts both My World and the Othello space as separate sessions. Each keeps its own world, player, and actors, and the active space is chosen from the runtime preferences. The inactive space retains its state.',
        ],
      },
    ],
    references: [
      {
        title: 'Session State Ownership',
        href: '/docs/session-state-ownership',
        description: 'Which layer owns which part of the session.',
      },
      {
        title: 'Persistence and Saved State',
        href: '/docs/persistence-and-saved-state',
        description: 'How runtime state is saved.',
      },
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'How snapshots become visual output.',
      },
    ],
  },
  {
    slug: 'session-state-ownership',
    navigationTitle: 'Session State Ownership',
    eyebrow: 'Systems',
    title: 'Session State Ownership',
    description: 'The boundary between simulation rules, application orchestration, and presentation, and why it matters for correctness.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'layers',
        title: 'Layered ownership',
        body: [
          'Simulation owns world state, blocks, actors, inventories, and rules. Application owns bootstrap, preferences, persistence, sessions, and the render-facing snapshot data. Presentation owns the window, input, the renderer, and audio. Lower layers do not depend on higher layers.',
        ],
      },
      {
        id: 'snapshot-dto',
        title: 'The render snapshot',
        body: [
          'The render snapshot is an application-level data contract that carries what the renderer needs, such as falling blocks and break particles, without embedding renderer code or widgets. This keeps the renderer replaceable per platform while the rules stay fixed.',
        ],
      },
      {
        id: 'why-it-matters',
        title: 'Why ownership matters',
        body: [
          'Because the simulation owns the rules, a visual defect in one renderer cannot change gameplay, and a settings change that affects appearance does not silently rewrite saved rules. Reports are clearer when they distinguish a rule problem from a rendering problem.',
        ],
      },
    ],
    references: [
      {
        title: 'World Runtime',
        href: '/docs/world-runtime',
        description: 'The session this ownership describes.',
      },
      {
        title: 'Runtime Responsibility Boundaries',
        href: '/docs/runtime-responsibility-boundaries',
        description: 'The source-level layer boundaries.',
      },
      {
        title: 'Persistence and Saved State',
        href: '/docs/persistence-and-saved-state',
        description: 'How state is written and restored.',
      },
    ],
  },
  {
    slug: 'block-and-placement-rules',
    navigationTitle: 'Block and Placement Rules',
    eyebrow: 'Systems',
    title: 'Block and Placement Rules',
    description: 'How block models, state, support, and connectivity drive collision, placement, breaking, and rendering.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'models-and-state',
        title: 'Models and state',
        body: [
          'A block has a definition, a model, and an encoded state. The model defines the shape geometry in sixteenths of a block; the state encodes variant properties such as stair facing, slab half, fence connections, and whether a fence gate is open.',
        ],
      },
      {
        id: 'support-connectivity',
        title: 'Support and connectivity',
        body: [
          'Placement and breaking consult support and connectivity rules. Fences, walls, and fence gates connect to neighbors, gravity-affected blocks fall when unsupported, and partial shapes contribute their own collision boxes. The same shape data feeds collision, selection outlines, and visible-face generation.',
        ],
      },
      {
        id: 'shared-source',
        title: 'A single source of shape',
        body: [
          'Collision, picking, placement, AI observation, and rendering all read the same block model and state. Keeping one source of shape avoids divergence where, for example, the renderer draws a slab but collision treats it as a full cube.',
        ],
      },
    ],
    references: [
      {
        title: 'Block Shapes and Support',
        href: '/docs/block-shapes-and-support',
        description: 'The gameplay view of shapes and support.',
      },
      {
        title: 'Block Breaking and Placement',
        href: '/docs/block-breaking-and-placement',
        description: 'How these rules apply during play.',
      },
      {
        title: 'World Runtime',
        href: '/docs/world-runtime',
        description: 'Where these rules run.',
      },
    ],
  },
  {
    slug: 'rendering-backends',
    navigationTitle: 'Rendering Backends',
    eyebrow: 'Systems',
    title: 'Rendering Backends',
    description: 'The renderer contract, the OpenGL and wgpu backends, and the parity expectation between them.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'contract',
        title: 'Renderer contract',
        body: [
          'Both backends implement a single renderer contract that submits chunks, renders the world and actors, applies runtime state, and reports renderer and shadow information. The contract is platform-neutral; the backend behind it is chosen by the operating system.',
        ],
      },
      {
        id: 'backends',
        title: 'OpenGL and wgpu',
        body: [
          'On Windows and other non-macOS platforms the viewport uses the OpenGL backend. On macOS it uses the wgpu-native backend targeting Metal. Each backend draws world chunks, the texture atlas, clouds, shadows, selections, falling blocks, break particles, the held block, first-person arms, player and AI models, and Othello output.',
        ],
      },
      {
        id: 'parity',
        title: 'Parity expectation',
        body: [
          'Where both backends implement the same visible feature, the user-visible result should match: UV mapping, face culling, world orientation, first-person geometry, third-person orientation, fog and shadow boundaries, selection outlines, actor tags, and HUD composition should not diverge without a documented reason. A visual defect report should name the backend.',
        ],
      },
    ],
    references: [
      {
        title: 'OpenGL Renderer',
        href: '/docs/opengl-renderer',
        description: 'The Windows and Linux backend.',
      },
      {
        title: 'WGPU Renderer',
        href: '/docs/wgpu-renderer',
        description: 'The macOS backend.',
      },
      {
        title: 'Shadows and Distance Fog',
        href: '/docs/shadows-and-distance-fog',
        description: 'Shared visual systems across backends.',
      },
    ],
  },
  {
    slug: 'opengl-renderer',
    navigationTitle: 'OpenGL Renderer',
    eyebrow: 'Systems',
    title: 'OpenGL Renderer',
    description: 'The OpenGL backend used on Windows and other non-macOS platforms, and the passes it runs.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'scope',
        title: 'Scope',
        body: [
          'The OpenGL backend is selected on every non-macOS platform. It drives chunk uploads, a textured world pass, a shadow-map pass, cloud and sun passes, falling-block and break-particle passes, selection outlines, first-person arm and held-block passes, and player and Othello rendering.',
        ],
      },
      {
        id: 'world-pass',
        title: 'World and shadow passes',
        body: [
          'World chunks are submitted as face payloads and drawn with a texture atlas. A shadow-map pass produces shadows whose resolution and filtering follow the shadow quality setting, independently of render distance.',
        ],
      },
      {
        id: 'reporting',
        title: 'Reporting',
        body: ['A rendering defect seen on Windows or Linux should be reported as an OpenGL backend issue, because parity defects can exist even when gameplay state is correct.'],
      },
    ],
    references: [
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'The shared renderer contract.',
      },
      {
        title: 'WGPU Renderer',
        href: '/docs/wgpu-renderer',
        description: 'The macOS counterpart.',
      },
      {
        title: 'Shadow Settings',
        href: '/docs/shadow-settings',
        description: 'The shadow quality control.',
      },
    ],
  },
  {
    slug: 'wgpu-renderer',
    navigationTitle: 'WGPU Renderer',
    eyebrow: 'Systems',
    title: 'WGPU Renderer',
    description: 'The wgpu-native backend used on macOS, its Metal target, and the parity it must keep with OpenGL.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'scope',
        title: 'Scope',
        body: [
          'On macOS the viewport uses a wgpu-native backend targeting Metal. The macOS desktop build collects the wgpu and rendercanvas runtimes and includes the macOS cursor recenter helper used by gameplay mouse capture.',
        ],
      },
      {
        id: 'parity',
        title: 'Parity with OpenGL',
        body: [
          'The wgpu path must match the OpenGL path for shared features. World wireframe, cloud wireframe, selection outlines, UV mapping, backface culling, shadows, first-person arms, the held block, the third-person camera, the skin preview, and the pause overlay are parity surfaces; a difference there is a renderer parity defect.',
        ],
      },
      {
        id: 'reporting',
        title: 'Reporting',
        body: ['A rendering defect seen on macOS should be reported as a wgpu backend issue and compared against the OpenGL path so the difference can be evaluated as a parity problem.'],
      },
    ],
    references: [
      {
        title: 'Rendering Backends',
        href: '/docs/rendering-backends',
        description: 'The shared renderer contract.',
      },
      {
        title: 'OpenGL Renderer',
        href: '/docs/opengl-renderer',
        description: 'The non-macOS counterpart.',
      },
      {
        title: 'macOS Application Bundle',
        href: '/docs/macos-application-bundle',
        description: 'How the macOS renderer is packaged.',
      },
    ],
  },
  {
    slug: 'shadows-and-distance-fog',
    navigationTitle: 'Shadows and Distance Fog',
    eyebrow: 'Systems',
    title: 'Shadows and Distance Fog',
    description: 'How shadows, the sun direction, clouds, and the view distance shape the scene, and which settings control them.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'shadows',
        title: 'Shadows',
        body: [
          'Shadows are produced by a shadow-map pass. The shadow quality setting has five discrete levels from Lowest to Ultra that raise the effective shadow-map texel density and filtering sharpness. Shadow quality is independent of render distance; changing the render distance does not change the shadow level.',
        ],
      },
      {
        id: 'sun-and-clouds',
        title: 'Sun and clouds',
        body: [
          'The sun direction is set by an azimuth and elevation that drive scene lighting. Clouds are an optional layer with configurable density, seed, horizontal flow direction, per-cloud speed range, and height behavior. Both contribute to the look of distance in the scene.',
        ],
      },
      {
        id: 'render-distance',
        title: 'Render distance',
        body: [
          'Render distance is a chunk radius uploaded around the player. A larger radius shows more of the world at a higher per-frame cost; it is a performance-sensitive setting and is separate from shadow quality.',
        ],
      },
    ],
    references: [
      {
        title: 'Shadow Settings',
        href: '/docs/shadow-settings',
        description: 'The shadow quality control.',
      },
      {
        title: 'Cloud Settings',
        href: '/docs/cloud-settings',
        description: 'Cloud density, height, and speed.',
      },
      {
        title: 'Performance Boundaries',
        href: '/docs/performance-boundaries',
        description: 'How these settings affect performance.',
      },
    ],
  },
  {
    slug: 'audio-and-visual-feedback',
    navigationTitle: 'Audio and Visual Feedback',
    eyebrow: 'Systems',
    title: 'Audio and Visual Feedback',
    description: 'The audio mixer categories, block and player sounds, ambient loops, and the visual feedback that accompanies actions.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'mixer',
        title: 'Mixer categories',
        body: [
          'Audio is mixed in four categories: master, ambient, block, and player. The effective gain of a category is the product of its own gain and the master gain, each clamped to the range zero to one. The mixer values are stored in the audio preference schema.',
        ],
      },
      {
        id: 'sound-events',
        title: 'Sound events',
        body: [
          'Block sounds cover placement, breaking, and fence-gate open and close, chosen by the block sound group. Player sounds cover footsteps and landings, with louder landing sounds beyond fall-distance thresholds. An ambient loop plays per play space when ambient audio is enabled and audible.',
        ],
      },
      {
        id: 'visual-feedback',
        title: 'Visual feedback',
        body: [
          'Visual feedback includes break particles, the hurt flash and camera tilt on damage, selection outlines, and the held-block and arm view models. Particle spawn rate and speed are configurable, and feedback follows the same world state the renderer draws.',
        ],
      },
    ],
    references: [
      {
        title: 'Audio Settings',
        href: '/docs/audio-settings',
        description: 'The mixer controls.',
      },
      {
        title: 'World Interaction',
        href: '/docs/world-interaction',
        description: 'The actions that produce feedback.',
      },
      {
        title: 'Player Combat and Damage',
        href: '/docs/player-combat-and-damage',
        description: 'The hurt feedback on damage.',
      },
    ],
  },
  {
    slug: 'input-and-mouse-capture',
    navigationTitle: 'Input and Mouse Capture',
    eyebrow: 'Systems',
    title: 'Input and Mouse Capture',
    description: 'How the viewport captures the mouse and keyboard, produces relative mouse motion, and differs between platforms.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'capture',
        title: 'Capture',
        body: [
          'When the viewport captures input it activates the window, takes focus, hides the cursor with a blank cursor, and grabs both the mouse and the keyboard. Releasing capture restores the normal cursor and releases the grabs.',
        ],
      },
      {
        id: 'relative-motion',
        title: 'Relative motion',
        body: [
          'On Windows and Linux the cursor is recentered each poll, and the offset from center becomes the relative mouse delta used for camera rotation. The invert-x and invert-y settings flip the horizontal or vertical delta when the frame is consumed.',
        ],
      },
      {
        id: 'macos',
        title: 'macOS specifics',
        body: [
          'On macOS a native relative-mouse path and a cursor recenter helper provide mouse motion, and a keyboard event guard supports gameplay capture. The mouse-capture path and the keyboard guard are distinct responsibilities and are not interchangeable.',
        ],
      },
    ],
    references: [
      {
        title: 'Basic Controls and Input',
        href: '/docs/basic-controls-and-input',
        description: 'The player-facing controls.',
      },
      {
        title: 'Keybind Settings',
        href: '/docs/keybind-settings',
        description: 'How bindings are stored.',
      },
      {
        title: 'HUD and Overlay State',
        href: '/docs/hud-and-overlay-state',
        description: 'How overlays release capture.',
      },
    ],
  },
  {
    slug: 'hud-and-overlay-state',
    navigationTitle: 'HUD and Overlay State',
    eyebrow: 'Systems',
    title: 'HUD and Overlay State',
    description: 'The HUD, the crosshair and hotbar, the route and AI-status overlays, and how overlay state stays world-anchored.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'hud',
        title: 'The HUD',
        body: [
          'The HUD draws the crosshair, the hotbar, health, route editing overlays, and debug metrics. The gameplay HUD can be hidden with a key, and the debug HUD and debug shadow view are separate toggles.',
        ],
      },
      {
        id: 'overlays',
        title: 'Overlays',
        body: [
          'Pause, inventory, death, settings, AI settings, and AI learning are overlay surfaces. They own their own visible state and, where relevant, release mouse capture so the cursor is usable while they are shown.',
        ],
      },
      {
        id: 'world-anchored',
        title: 'World-anchored tags',
        body: [
          'AI nametags, status tags, and health indicators are anchored to actor positions in the world, not to the camera. They follow the AI in space; a projection defect that moves them incorrectly is a rendering and presentation issue as well as an AI status issue.',
        ],
      },
    ],
    references: [
      {
        title: 'Crosshair Settings',
        href: '/docs/crosshair-settings',
        description: 'The crosshair control.',
      },
      {
        title: 'AI NPC Behavior',
        href: '/docs/ai-npc-behavior',
        description: 'The status tags the HUD anchors.',
      },
      {
        title: 'Pause, Death, and Recovery',
        href: '/docs/pause-death-and-recovery',
        description: 'The overlays that suspend play.',
      },
    ],
  },
  {
    slug: 'ai-npc-behavior',
    navigationTitle: 'AI NPC Behavior',
    eyebrow: 'Systems',
    title: 'AI NPC Behavior',
    description: 'The deterministic behavior layer for AI NPCs: roles, navigation, recovery, combat, placement, and status output.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'behavior-areas',
        title: 'Behavior areas',
        body: [
          'AI NPC behavior is built from concrete systems: spawning, naming, idle behavior, wandering, routing, navigation, parkour, stuck recovery, avoidance, combat, block placement, serialization, settings, worker execution, status tags, and health indicators. The baseline is deterministic; it is not an open-ended autonomous intelligence.',
        ],
      },
      {
        id: 'world-integration',
        title: 'World integration',
        body: [
          'AI actors operate inside the same world rules used by the player session: block shapes, collision, navigation, support checks, breaking and placing constraints, target selection, and damage. They are part of the simulation, not an external service.',
        ],
      },
      {
        id: 'status-output',
        title: 'Status output',
        body: [
          'Each AI exposes a world-anchored nametag and an optional health indicator above or below the nametag. The deterministic baseline already prefers retreat and sideways movement at low health, which is a bounded improvement rather than human-level tactics.',
        ],
      },
    ],
    references: [
      {
        title: 'AI Learning',
        href: '/docs/ai-learning',
        description: 'The optional layer that can bias these decisions.',
      },
      {
        title: 'AI NPC Combat and Navigation',
        href: '/docs/ai-npc-combat-and-navigation',
        description: 'The combat and movement detail.',
      },
      {
        title: 'AI Settings',
        href: '/docs/ai-settings',
        description: 'The per-AI configuration.',
      },
    ],
  },
  {
    slug: 'ai-learning',
    navigationTitle: 'AI Learning',
    eyebrow: 'Systems',
    title: 'AI Learning',
    description: 'The lightweight AI Learning system: demonstration capture, policy training, evaluation, and the strict boundary on how a learned policy affects live play.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'what-it-is',
        title: 'What AI Learning is',
        body: [
          'AI Learning records demonstrations of behavior, trains a policy artifact, evaluates it, and permits only an evaluated policy to bias live AI decisions. It is a lightweight, feature-conditioned preference layer that adjusts the utility scores of the deterministic AI; it does not replace the deterministic AI with an unconstrained black box and does not use a large neural network or an external machine-learning framework.',
          'The system is built from observation, feature encoding, action masks, demonstration datasets, a policy registry, a trainer, a headless sandbox, an evaluator, a controller, and a persistence store. It is completed entirely within the Ludoxel simulation rules.',
        ],
      },
      {
        id: 'where-it-lives',
        title: 'Where the Learning tab lives',
        body: [
          'The Learning settings are on the Learning tab of the AI Settings dialog, alongside Identity, Display, Skin, Health, Behavior, and Block Placement. The Learning tab configures the whole learning foundation rather than one AI. Changes are saved immediately and apply to the live session when the dialog is closed.',
        ],
      },
      {
        id: 'modes',
        title: 'Learning Mode values',
        body: [
          'The stored learning mode has five values. The active play modes are Off, Observe Only, and Use Learned Policy. The two Train modes are operations that start one background training run rather than continuous play states, and the UI suppresses a second start while one is running.',
        ],
        items: [
          'Off: no demonstration recording and no learned-policy use; the AI runs on its deterministic baseline.',
          'Observe Only: record player and AI demonstration data without changing how the AI behaves.',
          'Use Learned Policy: let the selected evaluated policy bias deterministic AI utility, within the action mask; it adjusts scores rather than replacing the baseline.',
          'Train From Player Data: train a policy from recorded demonstrations, evaluate it, then switch to Use Learned Policy.',
          'Train In Sandbox: run headless sandbox training that improves a policy against the deterministic baseline, then switch to Use Learned Policy.',
        ],
      },
      {
        id: 'capture',
        title: 'Demonstration capture',
        body: [
          'Recording happens only while the mode is Observe Only. Records are game state observations and actions, never screen images. The Data Capture controls choose which kinds are recorded, including player movement, combat, block placement, block breaking, parkour, and trap behavior, and AI decisions, failures, deaths, route failures, and escape attempts.',
          'Records are buffered and written at an interval rather than every frame, so recording does not stall the frame loop. The Dataset size readout shows the accumulated record count and byte size.',
        ],
      },
      {
        id: 'policy-and-evaluation',
        title: 'Policy selection and evaluation',
        body: [
          'The policy source is the built-in deterministic baseline, a bundled learned policy, or a user learned policy. Run evaluation checks the selected policy for schema compatibility, action-catalog compatibility, feature-encoder compatibility, action-mask compliance, and sandbox behavior, and reports a pass or fail with a score compared against the deterministic baseline.',
          'A generated user policy is not usable in live play until evaluation marks it usable. A broken policy, a schema mismatch, an incompatible version, or an unevaluated policy is never used, and the AI falls back to the deterministic baseline without interrupting startup.',
        ],
      },
      {
        id: 'training',
        title: 'Training from data and in the sandbox',
        body: [
          'Train From Player Data reads the selected dataset, skips corrupt rows and reports their count, and generates a feature-conditioned policy; an empty dataset or one with no usable preference yields a failure and no policy. Train In Sandbox runs rule-driven headless scenarios and produces a policy only when it beats the deterministic baseline score.',
          'On success the generated policy is evaluated automatically, saved with its evaluation embedded, and selected as the active user policy. Training and evaluation run on a background worker so the frame loop and UI thread are not blocked, with a busy indicator while a run is in progress.',
        ],
      },
      {
        id: 'safety',
        title: 'Action mask and unsafe-action blocking',
        body: [
          'Every action a policy prefers passes through the action mask. Dangerous actions, such as walking into the void, breaking the block under the AI, placing where placement is not feasible, attacking out of range, or ignoring a cooldown, are not executed no matter how strongly a policy prefers them. Edge-safety checks are reapplied after any retreat or sideways adjustment, so a learned preference cannot push an AI off a ledge.',
          'Partial shapes such as slabs, stairs, fences, fence gates, and walls are handled by their real shape rules in observation and safety, not simplified to full cubes.',
        ],
      },
      {
        id: 'boundaries',
        title: 'Live application, performance, and limits',
        body: [
          'A learned policy only adjusts the utility scores of the existing deterministic navigation, combat, placement, parkour, recovery, and routing; it does not replace those systems and cannot override safety rules. While the mode is Off, no observation is built and no recording occurs, so AI Learning adds no load.',
          'AI Learning is a bounded preference layer, not a path to human-level tactics or dramatic capability gain from long training. AI Learning is a gameplay system for AI NPC behavior; it is not permission to use protected materials for any external AI or machine-learning purpose.',
        ],
      },
      {
        id: 'data-and-debug',
        title: 'Data management and debug output',
        body: [
          'Data Management can export demonstrations to a JSON Lines file, import demonstrations from one, clear recorded demonstrations, reset the learned policy back to the deterministic baseline, and restore a bundled policy. All learning data is written under the runtime data root, never into the repository.',
          'For development, launching with the environment variable `LUDOXEL_AI_DEBUG=1` prints a per-decision debug log to standard output, including the actor, mode, selected policy, observed features, allowed and blocked actions, and the final action. It is off by default and produces no output during ordinary play.',
        ],
      },
    ],
    references: [
      {
        title: 'AI NPC Behavior',
        href: '/docs/ai-npc-behavior',
        description: 'The deterministic layer a policy biases.',
      },
      {
        title: 'AI Learning Settings',
        href: '/docs/ai-learning-settings',
        description: 'The Learning tab controls in detail.',
      },
      {
        title: 'AI Learning Data Files',
        href: '/docs/ai-learning-data-files',
        description: 'Where datasets, policies, and evaluations are stored.',
      },
      {
        title: 'AI Use Restrictions',
        href: '/docs/ai-use-restrictions',
        description: 'The legal boundary separating this from prohibited AI Use.',
      },
    ],
  },
  {
    slug: 'persistence-and-saved-state',
    navigationTitle: 'Persistence and Saved State',
    eyebrow: 'Systems',
    title: 'Persistence and Saved State',
    description: 'How settings, world, player, AI, and Othello state are saved, and how an integrity manifest guards the protected files.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'schema',
        title: 'Saved schema',
        body: [
          'Saved state is split across schema modules for settings, inventory, player, world, AI players, the play space, and the Othello space, with a file envelope per stored file. Player state is written as a versioned player-state file and world state as a versioned world-state file under the runtime state directory.',
        ],
      },
      {
        id: 'integrity',
        title: 'Integrity manifest',
        body: [
          'Protected runtime files, including the player state, world state, player skin, and Othello opening book, are covered by an HMAC-SHA256 integrity manifest with a locally generated key. On load, a file that fails verification is treated as absent rather than trusted, so tampered or corrupt state does not load as authoritative.',
        ],
      },
      {
        id: 'data-root',
        title: 'Runtime data root',
        body: [
          'All saved state lives under a per-user runtime data root, separated into a state directory for durable data and a cache directory for regenerable data. Saved user state is never written into the repository source tree or into immutable packaged resources.',
        ],
      },
    ],
    references: [
      {
        title: 'User Data Root',
        href: '/docs/user-data-root',
        description: 'Where the runtime data root resolves.',
      },
      {
        title: 'Saved Session State',
        href: '/docs/saved-session-state',
        description: 'The player and world state files.',
      },
      {
        title: 'Data Failure Handling',
        href: '/docs/data-failure-handling',
        description: 'What happens when state is invalid.',
      },
    ],
  },
  {
    slug: 'othello-engine',
    navigationTitle: 'Othello Engine',
    eyebrow: 'Systems',
    title: 'Othello Engine',
    description: 'The Othello search engine, its difficulty profiles, worker execution, transposition handling, and opening book.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'search',
        title: 'Search',
        body: [
          'The Othello opponent uses board logic, move legality, evaluation profiles, move ordering, search, and transposition handling. The engine reports an analysis snapshot, including the best move, principal variation, score, solved flag, and depth samples, used by the HUD.',
        ],
      },
      {
        id: 'difficulty-and-workers',
        title: 'Difficulty and workers',
        body: [
          'Difficulty ranges across Weak, Medium, Strong, Insane, and Insane+. The engine runs with a configurable worker count, hash level for the transposition table, and sacrifice level for the evaluation profile, each clamped to a calibrated range. Heavier search runs on workers so the UI is not blocked.',
        ],
      },
      {
        id: 'opening-book',
        title: 'Opening book',
        body: [
          'An opening book can be inspected, imported, and exported, and an opening-book learning operation expands lines within a configured depth and error limits. The opening book is stored under the runtime data root and is a protected runtime file.',
        ],
      },
    ],
    references: [
      {
        title: 'Othello Match Flow',
        href: '/docs/othello-match-flow',
        description: 'The match the engine plays.',
      },
      {
        title: 'Othello Settings',
        href: '/docs/othello-settings',
        description: 'Engine and book parameters.',
      },
      {
        title: 'Othello Data Files',
        href: '/docs/othello-data-files',
        description: 'Where the opening book is stored.',
      },
    ],
  },
  {
    slug: 'native-extensions',
    navigationTitle: 'Native Extensions',
    eyebrow: 'Systems',
    title: 'Native Extensions',
    description: 'How compiled native extensions and their Python fallbacks share a single numeric contract.',
    searchSection: 'Systems',
    sections: [
      {
        id: 'role',
        title: 'Role',
        body: [
          'Some low-level numeric and geometric routines can be provided as compiled native extensions with a Python fallback. The compiled module and the Python implementation share the same input, output, value range, and boundary behavior, so the result is identical whether or not the extension is built.',
        ],
      },
      {
        id: 'contract',
        title: 'Shared contract',
        body: [
          'Because both paths must agree, the contract covers numeric edge cases such as zero values, parallel axes, and out-of-range inputs. The native extension is an optimization, not a different rule, so gameplay does not depend on whether it is present.',
        ],
      },
      {
        id: 'build',
        title: 'Building extensions',
        body: ['Native extensions are built by a dedicated repository tool and can be verified separately. When an extension is not built, the application runs on the Python fallback.'],
      },
    ],
    references: [
      {
        title: 'Native Extensions in Distribution',
        href: '/docs/native-extensions-distribution',
        description: 'How extensions are handled in a build.',
      },
      {
        title: 'Build Tools',
        href: '/docs/build-tools',
        description: 'The tool that builds extensions.',
      },
      {
        title: 'Runtime Responsibility Boundaries',
        href: '/docs/runtime-responsibility-boundaries',
        description: 'Where the foundations layer sits.',
      },
    ],
  },
];
