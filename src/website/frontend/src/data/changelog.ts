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
    date: 'v3.7.2 Beta 1',
    tags: ['Desktop Application', 'Audio', 'AI'],
    sections: [
      {
        title: 'Audio Playback',
        items: [
          'Restored block, footstep, landing, damage, and Othello one-shot sounds to the prepared `QSoundEffect` pool instead of routing them through the PCM attack mixer, leaving `QAudioSink` mixing limited to weak and strong player attack swings.',
          '`AudioManager._play_pool` now keeps listener-distance admission inside callers that explicitly request remote attenuation: AI block-action audio and AI damage-hit audio use `distance_cutoff` and `spatial_distance_gain`, while player block actions, footsteps, landings, local damage, attacks, and Othello feedback remain local playback requests.',
          'Pooled `QSoundEffect` slots now keep the unscaled request volume on the slot and apply active-voice headroom across currently reserved one-shot slots before starting a new voice, reducing dense material and damage bursts without adding a streamed-output buffer or dropping an admitted event.',
        ],
      },
    ],
  },
  {
    date: 'v3.7.1',
    tags: ['Desktop Application', 'AI', 'Audio', 'Rendering', 'Settings'],
    sections: [
      {
        title: 'AI Action Sounds',
        items: [
          'AI block placement, breaking, and fence-gate interaction now emit the same material sound events as the player. `AiPlayerManager` records each successful `InteractionOutcome` from its placement, break, and interact paths as an `AiBlockSoundEvent` holding the action, block state, and cell, returns them on `AiStepReport.block_sound_events`, and the render loop replays them through `AudioManager.play_ai_interaction` after the session step.',
          'AI action sounds attenuate with listener distance. `play_ai_interaction` reuses the player block sound pools with attenuation enabled, and `_play_pool` scales the resolved volume by `spatial_distance_gain`, a linear rolloff from the listener to the pool `distance_cutoff`. The sound is loudest at the source, falls off with distance, and is dropped once the listener is past the audible radius.',
        ],
      },
      {
        title: 'AI Placement Line of Sight',
        items: [
          'AI block placement requires the actor to face the target column with a clear line to it. `_placement_ray_clear` adds a horizontal facing test against `actor.player.view_forward()` bounded by `_AI_PLACEMENT_FACING_MIN_DOT` (cosine of 55 degrees) ahead of the existing occlusion ray, so a planner candidate is refused at the final mutation when the actor has turned away from the face or a block stands between the actor and the anchor.',
        ],
      },
      {
        title: 'Strafe Model Pose',
        items: [
          'Player and AI models keep the forward and backward foot animation while strafing and turn the rendered body toward a pure left or right movement input without rotating the head. `PlayerMotionState.strafe_turn_deg` eases toward a bounded 18-degree yaw only when the current movement input has a lateral component and no forward or backward component; `build_player_model_snapshot` adds that offset to `body_yaw_deg` and counter-resolves `head_yaw_deg` so the visible head keeps its world-facing direction while the body, arms, legs, held item, and shadow rows follow the body turn.',
        ],
      },
      {
        title: 'Rapid Placement Sound Selection',
        items: [
          'Rapid block placement plays the placed block material instead of dropping to the stone sound. `AudioManager.play_block_action` commits to the first sound group in `iter_sound_group_candidates` that defines a pool for the action and stops there, so an exhausted voice budget on the placed material no longer advances the candidate chain to the default stone pool.',
        ],
      },
      {
        title: 'Player Health Regeneration',
        items: [
          'The Settings Player tab adds a Health Regeneration card with Regeneration, Start delay, Health cap, and Time to cap controls. `PlayerRegenParams` on `SessionSettings` owns the values, `PersistedSettings` persists them, and saves without the fields load disabled so existing worlds keep their current behavior.',
          'After the player avoids damage for the start delay, `advance_player_regeneration` heals at `cap_hp / time_to_cap_s` per second up to the lesser of the cap and `max_health`. Damage resets the delay timer, and a disabled toggle leaves health unchanged.',
        ],
      },
    ],
  },
  {
    date: 'v3.7.0',
    tags: ['Desktop Application', 'Inventory'],
    sections: [
      {
        title: 'Inventory Preview Clearance',
        items: [
          'Increased the visible gap below the player preview by adding one storage gutter to the existing top-area clearance. `_TOP_AREA_TO_UPPER_GAP` now derives from `_TOP_AREA_CLEARANCE + _SLOT_GAP`, so `_TOP_AREA_HEIGHT` shortens the preview and crafting row while the 9x4 storage coordinates remain fixed.',
        ],
      },
    ],
  },
  {
    date: 'v3.7.0 Beta 3',
    tags: ['Desktop Application', 'Inventory', 'Rendering'],
    sections: [
      {
        title: 'Inventory Layout Alignment',
        items: [
          '`_build_top_area` centers a storage-width row above the 9x4 storage, so the black-background player preview shares the storage left edge, spans the first three storage columns and the two gaps between them, and opens one panel margin below the box top, the same gap the hotbar row leaves above the box bottom.',
          'The 2x2 crafting input, the arrow, and the read-only output sit centered between the preview box right edge and the storage right edge, and the 30x30 `closeBtn` moved to the top-right of that row with its right edge on the storage right edge. The crafting cluster is the only element that drops below the close button, so the preview and the 9x4 storage keep their positions.',
          'Removed the full-width close-button header. The inventory preview widget now fills its black box at the box width and height, and the third-person model stays centered in it at that larger size.',
        ],
      },
      {
        title: 'All Items Catalog and Survival Startup',
        items: [
          'Set the Creative All Items box to seven columns with a vertical-only scroll. Its fixed width holds the seven catalog columns beside the vertical scrollbar, and `_apply_filter` lays the entries out across seven columns with no horizontal scroll.',
          'Stopped a stray AI Spawning Egg slot from drawing at the window top-left when Survival opened the inventory. Catalog buttons are now parented to the All Items scroll host, and `_apply_filter` hides every catalog button before placing the matches, so the Survival inventory and the filtered-out entries leave no button at the overlay origin.',
        ],
      },
      {
        title: 'Inventory Preview Pointer Tracking',
        items: [
          'The inventory preview follows the pointer. The overlay event filter forwards mouse motion to `move_pointer`, and the inventory preview widget enables hover body tracking, so the model turns its head toward the cursor and adjusts its body yaw by a smaller amount; the composed preview state reads those angles through `preview_angles()`.',
        ],
      },
      {
        title: 'macOS WGPU Inventory Preview Held Block',
        items: [
          'Added the third-person held block to the WGPU offscreen preview pass. `render_player_preview_frame` now draws `_third_person_held_block_face_rows(pose.held_block_pose)` with the atlas bind group after the skin, so the block in the selected hotbar slot appears and updates in the macOS inventory preview as it already did on the OpenGL preview path.',
        ],
      },
    ],
  },
  {
    date: 'v3.7.0 Beta 2',
    tags: ['Desktop Application', 'Inventory', 'My World'],
    sections: [
      {
        title: 'Shared My World Storage',
        items: [
          'Unified the My World hotbar and 9x3 upper inventory into one shared thirty-six-slot storage state. Creative Mode now exposes the All Items catalog while Survival Mode hides it; switching modes retains the same central inventory, selected hotbar index, and HUD projection.',
          'Replaced the duplicated Creative and Survival persistence branches with `my_world_hotbar_slots`, `my_world_selected_hotbar_index`, and `my_world_upper_slots`. The player-state reader normalizes a Beta 1 save once from the branch selected by its stored game mode, then subsequent saves emit only the shared My World fields while Othello and route-edit hotbars remain separate.',
        ],
      },
      {
        title: 'Inventory Operations and Preview',
        items: [
          'Reserved a dedicated 30x30 close-button header in the central inventory box. The `close.svg` button remains fixed at the box top-right while the player preview and the 2x2 crafting input, arrow, and read-only output occupy the row below it.',
          'Number keys now distinguish an infinite All Items catalog source from finite central storage. Catalog entries replace the target hotbar slot; hotbar, upper-inventory, and crafting-input sources move or swap atomically with the target, so the source no longer remains as a duplicate. The read-only crafting output is excluded from number-key assignment.',
          'Inventory preview cache keys now include the skin and the held block or special-item fields consumed by the preview pose. Storage commits synchronize the first-person target, invalidate the inventory preview cache, and queue a repaint so held items disappear or appear in the preview as their selected hotbar slot changes.',
          'Closing the inventory moves each crafting input item to the hotbar and then the upper inventory when space exists. A full central storage leaves the unplaced input item in the transient crafting grid instead of clearing it.',
        ],
      },
    ],
  },
  {
    date: 'v3.7.0 Beta 1',
    tags: ['Desktop Application', 'Inventory', 'My World'],
    sections: [
      {
        title: '9x4 My World Inventory Storage',
        items: [
          'Expanded the My World inventory from a nine-slot hotbar to thirty-six storage slots per game mode: the nine-slot hotbar plus a 9x3 upper inventory of twenty-seven slots that stays hidden until the inventory opens. `RuntimePreferences` now carries `creative_upper_slots` and `survival_upper_slots` next to the existing per-mode hotbars, and the upper inventory orders its slots row-major from the top-left while the hotbar keeps indices 0 through 8 left to right.',
          'Each storage slot still holds a single item id; the change adds slots rather than stack counts. `PersistedInventory` now serializes `creative_upper_slots` and `survival_upper_slots`, `runtime_state` carries those fields in both directions, and `PlayerStateFile` advanced to version 8.',
          'Added a 2x2 crafting input and a 1x1 crafting output to the central box, kept apart from the thirty-six storage slots. The crafting input is a transient working area: closing the inventory moves each crafting item into the storage by hotbar-then-upper priority and leaves the grid empty, so the crafting grid is never persisted. The 1x1 output is read-only and resolves to empty because Ludoxel implements no crafting recipe resolution.',
        ],
      },
      {
        title: 'Survival and Creative Inventory Layout',
        items: [
          'Rebuilt `InventoryOverlay` around a square central box that stacks the 9x3 upper inventory above the 9x1 hotbar row, places a black-background player preview on the upper left and the 2x2 crafting input and 1x1 output on the upper right, and carries a close button driven by `assets/ui/inventory/close.svg` in the top-right corner. Creative Mode adds an All Items box to the left of the central box that supplies every block and special item.',
          'Search in the All Items box keeps filtered results in the same top-left row-major order as the full catalog, filling each row left to right before wrapping to the next.',
          'Replaced the inventory title, subtitle, Survival-Mode notice, and the text close control with the slot layout and the `close.svg` icon button.',
        ],
      },
      {
        title: 'Cursor Carry, Shift Transfer, and Slot Keys',
        items: [
          'A left click now lifts an item onto the cursor as a carried item, and the destination is fixed only when the player clicks a slot again. An empty destination moves the item, an occupied destination swaps it with the carry source, and a Creative All Items source replaces the destination. Closing the inventory while carrying returns the item to its source.',
          'Shift and left click moves an item immediately through `place_into_storage_priority` and the per-region rules in `InventoryOverlay`: an All Items source fills the first empty hotbar slot and then the upper inventory, a hotbar item descends to the first empty upper slot, an upper item rises to the first empty hotbar slot, and a crafting slot returns to the hotbar and then the upper inventory.',
          'Hovering an item and pressing `1` through `9` outside the search box assigns it to the matching hotbar slot. Creative Mode replaces the hotbar slot with the hovered item; Survival Mode swaps the hovered storage slot with the hotbar slot. The search field keeps `1` through `9` as text while it holds focus.',
          'Pressing the drop key (default `Q`) while hovering a slot in the 9x4 storage empties that slot. The drop key acts on the hovered hotbar or upper slot, leaving the crafting and All Items regions untouched.',
        ],
      },
      {
        title: 'Inventory Player Preview and Drag Image',
        items: [
          'Added a live player preview inside the inventory through `_update_inventory_preview_frame`, which composes a third-person preview state from the running render snapshot and reflects the current skin and hurt tint. The fixed-step runtime keeps advancing while the inventory stays open, so the preview tracks the player state in real time.',
          'Scaled the drag image in `start_item_drag` down to the slot icon size with a centered hotspot, matching a block thumbnail to its in-slot appearance during a drag instead of the 300x300 thumbnail source.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.9',
    tags: ['Desktop Application', 'AI NPCs', 'Chat'],
    sections: [
      {
        title: 'AI Death Logs',
        items: [
          'Added chat death-log rows for AI actors. Direct player kills now return `AiLocalAttackResult.target_death_log`, and fall, void, or generic AI deaths produced during `AiPlayerManager.step` now travel through `SessionStepResult.ai_death_logs` into the same runtime chat history used by local-player death messages.',
          'Removed defeated AI actors immediately on direct player kills and continued cancelling their pending navigation plans, so the actor disappears from the simulation and the chat row records the terminal event without waiting for a later manager sweep.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.8',
    tags: ['Desktop Application', 'Chat', 'Commands', 'Interface'],
    sections: [
      {
        title: 'Chat Input and History Review',
        items: [
          'Finalized the Chat and Commands input boundary: clicks and wheel input inside the open chat surface no longer restore gameplay mouse capture, camera control, block interaction, hotbar selection, Othello input, or viewport focus.',
          'Added a right-side history scrollbar, synchronized the message field with the settings and send controls at the bottom-bar height, restored the settings cog from `assets/ui/settings/cog.svg`, and aligned the Chat Settings Back control with the Send button family.',
          'Added runtime-only sent-input recall for the focused message field. Up traverses the newest submitted messages and commands first; Down returns toward the current draft. Submitted validation-error commands remain recallable because the existing submission path accepts every nonempty command string before routing.',
          'Added a thirty-second idle fade for the lower-left recent chat feed after the chat screen closes. The next display message restores the feed, and the existing F3 suppression and runtime history retention remain in force.',
        ],
      },
      {
        title: 'Command Alias',
        items: [
          'Added `/tp` as an alias for `/teleport`, including command candidates. Both spellings share the same parser, validation, target resolution, coordinate handling, execution result, and command-error route.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.8 Beta 1',
    tags: ['Desktop Application', 'Chat', 'Commands'],
    sections: [
      {
        title: 'Chat and Commands Screen',
        items: [
          'Added a shared chat-and-commands screen for My World and Othello opened with the new `toggle_chat` keybind defaulting to `T`: `chat_controller.bind_chat` attaches a `ChatController` to both the OpenGL and WGPU viewport widgets, `interaction.handle_key_press` opens it through `ACTION_TOGGLE_CHAT`, and `Esc` or the title-bar `< Back` button closes it and restores gameplay capture for the active play space.',
          'Kept the screen non-pausing: opening chat releases mouse capture and resets held input through `ViewportInput` without entering the dead, paused, settings, or transient-modal states, so `_tick_sim` and `_on_step` keep advancing the fixed-step runtime, the Othello clock, and cloud and AI motion while the input field holds focus; the screen background reuses the pause-screen `rgba(0,0,0,150)` fill without reusing the pause stop path.',
          'Built the title bar and bottom bar as equal-height, full-width bars: the title bar carries a left `< Back` control, a fixed-width right balancing slot, and a stretched center label so `Chat and Commands` stays centered on the whole window width across resizes, and the bottom bar carries a 1:1 settings button, a stretched message field, and a 2:1 send button that submits on click or `Enter` while empty and whitespace-only input is dropped.',
        ],
      },
      {
        title: 'Heads-Up Recent Chat Feed',
        items: [
          'Added a lower-left heads-up recent chat feed above the hotbar that shows the newest display messages after the chat screen closes: `ChatController.sync_visibility` shows it only while the gameplay HUD is active, the F3 Debug HUD is inactive, Mute All Chat is disabled, and the chat screen is closed, and `ChatFeedWidget` is transparent to mouse events so it never takes camera control, hotbar selection, or block interaction.',
          'Suppressed the feed while the F3 Debug HUD is shown and restored it once the Debug HUD closes, the chat screen is closed, and Mute All Chat is disabled, limiting the box to the newest ten display rows while the runtime history retains up to one hundred messages.',
        ],
      },
      {
        title: 'Section Formatting and Message Model',
        items: [
          'Added a Qt-free section-formatting contract under `src/ludoxel/foundations/text/`: `palette.py` holds the color table, `format_codes.py` parses `§` codes into style segments where a color code sets foreground and background and only `§r` clears the bold, italic, underline, strikethrough, and obfuscated flags, and `obfuscation.py` supplies same-width-class replacement characters for `§k` text.',
          'Rendered chat text through the `ChatTextView` painter shared by the chat screen, the heads-up feed, command feedback, command errors, the periodic support message, and death-log rows, pinning each obfuscated glyph to the original character advance so cycling does not shift the layout, and limiting clickable external links to explicitly authored trusted spans.',
        ],
      },
      {
        title: 'Chat Settings and Runtime History',
        items: [
          'Added an embedded Chat Settings surface opened from the bottom-bar settings button with the chat screen visible behind it; its single control is the runtime-only Mute All Chat toggle owned by the application `ChatRuntime`, held only for the running game and never written to saved preferences, the app-state schema, or any world or Othello save.',
          'Kept the chat history runtime-only with a one-hundred-message cap in `ChatHistory`: messages always accumulate, Mute All Chat hides every kind in both the chat screen and the heads-up feed without deleting them, unmuting shows the retained messages again, and messages dropped by the cap are not restored.',
          'Added a one-hundred-twenty-second support message that appends `§6[§e!§6] §7Project support: 5uog` to the history, where the `5uog` span is the only link and opens `https://github.com/5uog/` through the Qt desktop URL service while the rest of the message text carries no link.',
        ],
      },
      {
        title: 'Teleport and Game Mode Commands',
        items: [
          'Added command candidate display and parsing under `src/ludoxel/application/chat/commands/`: a leading slash hides the message list and shows `/teleport` candidates for `/t` and `/gamemode` candidates for `/g`, an unknown prefix shows an empty candidate list rather than repeated errors, and the command coordinator routes execution through the simulation player operations.',
          'Added `/teleport <x> <y> <z>` with an optional `chunkForBlocks` boolean, an optional `facing <x y z>` position, and an optional `facing <target>` entity: finite coordinates move the local player in My World and in the Othello play space, `teleport_player` zeroes velocity and resets fall-related player state, facing resolves a look direction through `yaw_pitch_deg_from_forward`, and a true `chunkForBlocks` arms a world-upload sync around the destination.',
          'Added `/gamemode` accepting `survival`, `s`, `0`, `creative`, `c`, and `1` with an optional trailing player target resolved to the local player only, routed through the shared `apply_game_mode` operation that the Settings game-mode toggle now also uses.',
          'Removed the `B` survival and creative toggle: the `toggle_creative_mode` keybind action is gone from the keybind catalog, defaults, display names, and the Controls tab, and game-mode changes now flow through the Settings surface and the `/gamemode` command.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.7',
    tags: ['Desktop Application', 'Debug HUD', 'Crosshair'],
    sections: [
      {
        title: 'Debug HUD Axis Crosshair',
        items: [
          'Made the Debug HUD toggle swap the center crosshair for a world-axis crosshair: `_sync_gameplay_hud_visibility` calls `set_axis_crosshair_enabled(self._debug_hud_active())` on `CrosshairWidget`, so while the Debug HUD is active the widget paints three short arms for world `+X` in red, world `+Y` in green, and world `+Z` in blue, and the built-in or custom bitmap returns through the existing `set_pattern` path when the Debug HUD closes.',
          'Projected the axis arms from the renderer effective camera every frame: the shared `paintGL` forwards `render_yaw_deg`, `render_pitch_deg`, and `render_roll_deg` to `set_axis_camera` for both the OpenGL and WGPU viewport widgets, and `axis_screen_offsets` resolves each world axis through the same look-direction basis and roll the world overlays use, so the arms turn with the camera and shorten as an axis rotates toward the view direction; a degenerate or non-finite axis is skipped to keep the drawn frame finite.',
          'Kept the axis crosshair a transient diagnostic of the first-person gameplay HUD: it obeys the same visibility gate as the bitmap crosshair, draws its colors through `QPainter` pens instead of theme stylesheets, and leaves the saved `crosshair_mode` and `crosshair_pixels` and the Settings crosshair editor untouched.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.6',
    tags: ['Desktop Application', 'Audio'],
    sections: [
      {
        title: 'Player Attack Audio Mixer',
        items: [
          'Moved weak and strong attack one-shot playback off the `QSoundEffect` pool and into a bounded PCM mixer backed by `QAudioSink`, so rapid air-punch and attack samples overlap inside one continuous output stream instead of relying on multiple backend effect voices.',
          'Kept material, landing, damage, Othello, and ambient audio on the existing playback paths; the mixer is limited to rapid player attack events and still obeys player volume, pool cooldown, sample selection, output-device refresh, and bounded voice count.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.6 Beta 3',
    tags: ['Desktop Application', 'Audio'],
    sections: [
      {
        title: 'Player Audio Overlap',
        items: [
          'Kept rapid player voices reserved for the measured WAV duration plus a small release pad, so a `QSoundEffect` slot is not considered reusable merely because Qt reports the queued effect as no longer playing before the audible tail has cleared.',
          'Raised weak and strong attack swings to a twelve-voice bounded pool with no attack-event cooldown, preserving overlap for repeated air-punch and attack input while still dropping only when every reserved voice is busy.',
        ],
      },
    ],
  },
  {
    date: 'v3.6.6 Beta 2',
    tags: ['Desktop Application', 'Audio', 'Block Placement'],
    sections: [
      {
        title: 'Audio Sample Voices',
        items: [
          'Allocated rapid one-shot player sounds across the whole event pool instead of a single randomly selected sample source: `_play_pool` now ensures the voice slots of every prepared source, gathers the sources that still hold an idle voice through `has_idle_voice`, and selects among only those, so a busy sample source no longer drops a request while other voices in the pool are idle.',
          'Kept the pool bounded and overlap-only: when every voice in the pool is already playing, `_play_pool` drops the request rather than stopping an active voice, which lets repeated weak and strong attack swings overlap across their samples within the existing per-pool polyphony.',
        ],
      },
      {
        title: 'Held Slab and Stair Placement',
        items: [
          'Fixed the first state of a held slab or stair bridge: when a placement extends from a slab or stair source into an adjacent empty cell through the support-face path, `resolve_place_state` now inherits the source slab `type`, or the source stair `facing` and `half`, through a new inherit-state context, so a lower-slab bridge starts as a lower slab and an upper-slab bridge starts as an upper slab even though the synthesized support-face hit point would otherwise read the opposite half.',
          'Left ordinary single-click placement on hit geometry and same-cell opposite-half slab merging unchanged, and continued to lock the first committed state for the rest of the hold so the bridge keeps its slab type, or its stair facing and half, as the target cell advances and the camera turns.',
        ],
      },
    ],
  },
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
