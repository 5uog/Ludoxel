/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
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
    date: 'v3.6.6 Beta 1',
    tags: ['Desktop Application', 'Audio', 'Gameplay', 'Collision', 'Block Placement'],
    sections: [
      {
        title: 'Audio Sample Voices',
        items: [
          'Stopped pooled sound effects from cutting an in-progress voice to replay the same sample: `next_effect_slot` now returns a loaded effect slot only when it is not already playing, and `_play_pool` no longer stops and restarts a playing slot, so a play request that finds every voice in a pool busy is dropped instead of truncating an audible sample.',
          'Raised the weak attack-swing pool from two to eight voices so repeated swing-through-air sounds overlap across the four weak samples without falling back to dropped requests, while leaving the other player, block, surface, and ambient pool polyphony, cooldown, spatial cutoff, and volume categories unchanged.',
        ],
      },
      {
        title: 'Fall Damage Audio',
        items: [
          'Counted fall damage when deciding whether to play the damage sound: the session step now reports `play_damage_sound` for any fall damage past the safe distance, not only void and combat damage.',
          'Added a `play_landing_sound` field to the session step result and suppressed the landing sound on a step that applied fall damage, so a damaging landing plays the damage hit while a non-damaging landing still plays its surface landing sample.',
        ],
      },
      {
        title: 'Structural Hull Collision',
        items: [
          'Resolved each horizontal collision axis against every overlapping box: `_axis_collision_position` now clamps the player to the nearest blocking face across all intersecting boxes and re-tests with the updated box until it is clear, replacing the single-pass resolution that could leave the player inside the tall structural hull of a fence, wall, or closed fence gate.',
          'Added a final depenetration pass after the X, Y, and Z moves in `integrate_with_collisions`, pushing a player that would otherwise remain inside a collision box back out before the position is committed, zeroing the corrected velocity components and treating an upward correction as ground contact.',
        ],
      },
      {
        title: 'Held Fence Gate Placement',
        items: [
          'Made the right-click placement repeat prefer interaction for a held fence gate: when the held block is a fence gate, the player is not crouching, and the current target is a fence gate, the repeat toggles that gate and stops rather than continuing to place gates in the adjacent cells, while a crouching hold still places gates and single placement is unchanged.',
        ],
      },
      {
        title: 'Held Slab and Stair Placement',
        items: [
          'Locked the resolved block state of a held placement repeat to its first committed result: the repeat reuses the initial slab type and the initial stair facing and half (and fence gate facing) for the rest of the hold by threading a forced place state through `place_block_from_hit`, so changing aim no longer flips slabs between top and bottom or rotates stairs mid-hold.',
          'Kept the placement target cell advancing during the locked hold and limited same-slab opposite-half merging to the locked type, and released the lock when the selected hotbar item changes or the right mouse button is released.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.5',
    tags: ['Desktop Application', 'Rendering', 'First-Person Rendering', 'Third-Person Rendering', 'Player Animation'],
    sections: [
      {
        title: 'Dynamic Face Upload',
        items: [
          'Stopped the shared textured face pass from reusing a previous frame’s GPU instance buffer when falling blocks, first-person held blocks, arms, special items, block-break particles, player skins, or player-held blocks rebuild their per-face transform rows with the same row count, by removing the object-identity and row-count upload-skip condition so every non-empty face uploads the current transform and UV rows before drawing.',
          'Applied the same per-frame upload to the player-model shadow pass so the ground shadow uploads the current instance rows rather than caching them by object identity.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.5 Beta 2 Hotfix',
    tags: ['Desktop Application', 'Audio', 'Windows'],
    sections: [
      {
        title: 'Windows Audio Device Recovery',
        items: [
          'Rebound pooled sound effects and the ambient effect to the current default audio output when Windows reports an output-device change, preventing stale WASAPI streams from continuing after the endpoint is invalidated.',
          'Scheduled the rebinding through the Qt event loop and resumed the ambient loop only when ambient audio is still active and audible, leaving material-sound routing, polyphony, cooldown, and mixer semantics unchanged.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.5 Beta 2',
    tags: ['Desktop Application', 'AI Settings', 'Third-Person Rendering', 'HUD', 'Player Animation'],
    sections: [
      {
        title: 'AI Settings Overlay Layering',
        items: [
          'Hid the third-person player name tag while the AI settings overlay is open, preventing the world-projected player label from rendering above the AI settings surface.',
          'Applied the same overlay-open gate to AI status tags so renderer-projected AI nametags and health indicators cannot remain above the AI settings surface.',
        ],
      },
      {
        title: 'Arm Swing Timing',
        items: [
          'Reverted the Beta 1 arm swing timing change by restoring the default runtime arm swing, first-person swing playback, and AI attack swing playback from 0.60 seconds back to 0.30 seconds.',
          'Kept the revert limited to the three Beta 1 timing constants so attack, breaking, placing, first-person swing, and AI attack cadence return to the previous 6-tick feel without changing the surrounding animation pipeline.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.5 Beta 1',
    tags: ['Desktop Application', 'Player Animation', 'First-Person Rendering', 'AI Animation'],
    sections: [
      {
        title: 'Arm Swing Timing',
        items: [
          'Changed the default arm swing duration from 0.30 seconds to 0.60 seconds by restoring the 12-tick timing used by runtime preferences, first-person swing playback, and AI attack swing playback.',
          'Kept the beta scope limited to swing timing so the slower attack, breaking, placing, and AI swing cadence can be verified without introducing a broader animation rewrite.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.4',
    tags: ['Desktop Application', 'Player Animation', 'Third-Person Rendering', 'First-Person Rendering'],
    sections: [
      {
        title: 'Head and Body Turning',
        items: [
          'Sped up the third-person body turn so it catches up to the look direction sooner while still trailing a fast turn instead of snapping instantly.',
          'Gave the visible head its own slight yaw and pitch lag so it trails the camera by a few degrees, while keeping camera control, picking, placement, and the first-person view responding to the look direction with no delay.',
        ],
      },
      {
        title: 'First-Person Idle',
        items: [
          'Added a faint idle sway to the first-person held item, bare arm, and special item so the hands are not perfectly frozen while standing still.',
          'Faded the first-person idle out while walking, swinging, or switching items so it never stacks onto the view bob or a swing.',
        ],
      },
      {
        title: 'Movement Swing',
        items: [
          'Reduced the third-person arm and leg swing when moving backward so a reverse step reads as a shorter stride than walking forward.',
          'Added a sidestep to the third-person legs when strafing, rolling the legs laterally toward the step direction instead of only swinging them forward and back, and reflected the same motion in the ground shadow.',
          'Balanced forward, backward, and strafe weighting so a diagonal move does not swing the arms and legs more than a straight forward stride at the same speed.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.3',
    tags: ['Desktop Application', 'Player Animation', 'Third-Person Rendering'],
    sections: [
      {
        title: 'Third-Person Swing',
        items: [
          'Reshaped the attacking, breaking, and placing swing of the third-person player so the main-hand arm now pitches forward from the shoulder instead of being drawn across the body.',
          'Kept the swinging arm, hand, held block, and special item on the outward side of the torso so they no longer pass through the chest in the front view or the back in the rear view.',
          'Aligned the ground shadow with the corrected swing so the cast shadow follows the same arm and held-item motion as the visible body.',
        ],
      },
      {
        title: 'Idle Arm Motion',
        items: [
          'Added a gentle idle sway to both arms while the player is standing still, pivoting each arm at the shoulder so only the lower arm drifts outward and the shoulder stays in place.',
          'Faded the idle sway out while walking or swinging so it never fights the walk cycle or an attack.',
        ],
      },
      {
        title: 'Head and Body Turning',
        items: [
          'Made the third-person body turn follow the look direction with a short delay, so a fast turn lets the head lead while the body catches up and then settles.',
          'Bounded how far the head can turn ahead of the body and kept camera control, picking, placement, and collision responding to the look direction without delay.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.2',
    tags: ['Desktop Application', 'Startup'],
    sections: [
      {
        title: 'Viewport Loading',
        items: [
          'Continued viewport preparation when Ludoxel loses desktop focus during startup, so loading status can advance while visible chunks are prepared.',
          'Completed startup loading by closing the splash, restoring the active main window when appropriate, and then returning focus to the loaded viewport.',
        ],
      },
    ],
  },
];
