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
