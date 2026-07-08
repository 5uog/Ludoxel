/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const gameplayPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Block Construction',
    title: 'Building in My World',
    description: 'Describes how block placement and breaking are accepted in My World: the interaction service picks a target along the view ray, decides between interacting and placing, and commits world edits that also update structural neighbors and mark chunks dirty for the renderer.',
    sections: [
      {
        id: 'building-in-my-world-interaction-service',
        title: 'One Interaction Service Owns Build Actions',
        body: [
          'Building goes through an `InteractionService` constructed for the active world, player, and block registry. It exposes pick, break, and place operations, and it builds a placement policy from the registry so shape-specific rules are available for every action.',
          'The service is the single owner of build edits. The renderer and HUD read world state and draw it; they commit no edit of their own. A placement that looks blocked on screen is therefore resolved by the service pick, placement policy, and intersection checks, and the drawing layer reports only whatever the service committed.',
          '`src/ludoxel/application/sessions/managers/interactions.py` receives the active session and forwards break, pick, direct interaction, placement-from-hit, and ordinary placement into that session’s `InteractionService`. A successful bulk edit advances `WorldState.revision` and dirty-chunk state; the session pipeline later consumes those updates to rebuild face payloads for the active renderer. Input routing, simulation mutation, and visual feedback therefore meet at the session-managed interaction path.',
          '`GameInput` and the viewport controller supply the action ingress, but they carry no authority to change a block coordinate. The active `SessionManager` selects the session-owned interaction service; the service derives a pick from the player eye and view direction, evaluates placement or break rules against world state and collision shapes, and commits an accepted mutation into the world aggregate. Revision and dirty-chunk information then enter snapshot and face-payload preparation, while HUD selection and renderer output consume the resulting state. A cursor highlight, a click event, or a rendered face therefore establishes neither a completed edit nor an independent presentation-side world mutation.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The interaction service is created per world and holds a placement policy.',
            code: `@dataclass
class InteractionService:
  world: WorldState
  player: PlayerEntity
  block_registry: BlockRegistry
  placement_policy: PlacementPolicy = field(init=False, repr=False)

  def __post_init__(self) -> None:
    self.placement_policy = PlacementPolicy(block_registry=self.block_registry)`,
          },
        ],
      },
      {
        id: 'building-in-my-world-pick-target',
        title: 'A Pick Selects the Target Along the View Ray',
        body: [
          'Every build action starts from a pick. The service casts from the player eye position along the view forward direction, with a default reach of five blocks, and returns the hit cell, the hit face, the adjacent placement cell, and the hit point.',
          'The hit cell is what breaking removes; the adjacent cell is the default placement target. Shape-aware bounding boxes determine the face and placement cell for slabs, stairs, fences, and other non-cube shapes.',
          '`src/ludoxel/foundations/mathematics/geometry/ray.py` owns an immutable origin-direction pair. `pick_block` in `src/ludoxel/simulation/rules/picking/block.py` normalizes the supplied direction, refuses a vector whose resulting length is at most `1e-12`, clamps reach to a non-negative value, and moves the origin by `1e-4` along that normalized direction before constructing the `Ray`. `ray_aabb_face` evaluates the parametric point relation. The Ray representation remains separate from interaction rules.',
          '`src/ludoxel/foundations/mathematics/geometry/ray_aabb.py` tests one shape box as three slab intervals. For each axis it treats `abs(d_i) < 1e-12` as parallel. A parallel origin outside `[mn_i, mx_i]` rejects the box immediately; a parallel origin inside does not narrow the accumulated interval. Otherwise the source computes and orders the two boundary parameters, raises `tmin` only when a new later entry is found, lowers `tmax` only when an earlier exit is found, and rejects when the intervals cease to overlap. After all axes, `tmax < 0` rejects a box entirely behind the ray origin. A non-negative `tmin` returns the entering face; an origin already inside returns `tmax` and the exiting face. The returned point is the actual `o + d * t_enter` evaluation.',
          '`src/ludoxel/foundations/mathematics/voxels/dda.py` does not test shape geometry. It enumerates candidate unit-grid cells. It floors the origin divided by `cell_size`, assigns each step sign from the direction component, initializes each next-boundary time with `int_bound`, and advances only one axis per iteration. The x branch requires strict precedence over both other times; otherwise y wins only when it is strictly earlier than z, and z resolves the remaining ties. The generator emits the current `DDAHit` before that recurrence and stops when its accumulated parameter exceeds `t_max`. The picker supplies reach, fetches block-model AABBs, and chooses the nearest accepted shape hit; DDA alone never produces a gameplay outcome.',
          '`src/ludoxel/foundations/mathematics/voxels/faces.py` provides the signed-axis neighbour relation used after the shape hit. Its six face identifiers map to offsets `(+1,0,0)`, `(-1,0,0)`, `(0,+1,0)`, `(0,-1,0)`, `(0,0,+1)`, and `(0,0,-1)`. `pick_block` adds the returned offset to the hit cell to derive a placement candidate, then clears that candidate if it is occupied. Item selection, placement approval, and world mutation remain simulation responsibilities.',
        ],
        mathBlocks: [
          {
            expression: '\\mathbf{p}(t) = \\mathbf{o} + t\\mathbf{d}, \\qquad \\mathbf{o},\\mathbf{d} \\in \\mathbb{R}^{3}',
            displayMode: true,
            caption: '`Ray` in `src/ludoxel/foundations/mathematics/geometry/ray.py` supplies o and d; `ray_aabb_face` in `src/ludoxel/foundations/mathematics/geometry/ray_aabb.py` evaluates the returned hit point.',
          },
          {
            expression: '|d_i| < 10^{-12} \\Rightarrow (o_i < mn_i \\lor o_i > mx_i) \\text{ rejects}; \\qquad t_{i1}=\\frac{mn_i-o_i}{d_i},\\quad t_{i2}=\\frac{mx_i-o_i}{d_i}',
            displayMode: true,
            caption: 'The parallel-axis branch and raw slab parameters in `ray_aabb_face`; the source orders t_i1 and t_i2 before updating the accumulated interval.',
          },
          {
            expression: 't_{\\min}\\leftarrow\\max(t_{\\min},\\min(t_{i1},t_{i2})),\\qquad t_{\\max}\\leftarrow\\min(t_{\\max},\\max(t_{i1},t_{i2})),\\qquad t_{\\min}>t_{\\max}\\Rightarrow\\varnothing',
            displayMode: true,
            caption: 'Equivalent to the conditional interval updates in `ray_aabb_face`, initialized by the source to -10^30 and 10^30.',
          },
          {
            expression:
              't_{\\mathrm{hit}}=\\begin{cases}t_{\\min}&t_{\\min}\\ge0\\\\t_{\\max}&t_{\\min}<0\\le t_{\\max}\\end{cases},\\qquad F_{\\mathrm{hit}}=\\begin{cases}F_{\\mathrm{enter}}&t_{\\min}\\ge0\\\\F_{\\mathrm{exit}}&t_{\\min}<0\\le t_{\\max}\\end{cases},\\qquad \\mathbf{p}=\\mathbf{o}+t_{\\mathrm{hit}}\\mathbf{d}',
            displayMode: true,
            caption: '`ray_aabb_face` in `src/ludoxel/foundations/mathematics/geometry/ray_aabb.py`: `tmax < 0` rejects behind-origin boxes, while an inside origin exits through the face recorded by `_exit_face_for_axis`.',
          },
          {
            expression: 'c_i^{(0)}=\\left\\lfloor\\frac{o_i}{s}\\right\\rfloor,\\quad \\sigma_i=\\begin{cases}1&d_i>0\\\\-1&d_i\\le0\\end{cases},\\quad \\Delta t_i=\\begin{cases}s/|d_i|&|d_i|>10^{-12}\\\\10^{30}&|d_i|\\le10^{-12}\\end{cases}',
            displayMode: true,
            caption: '`dda_grid_traverse` in `src/ludoxel/foundations/mathematics/voxels/dda.py`, with cell size s and its exact zero-component sentinel.',
          },
          {
            expression: 'u_i=\\frac{o_i}{s}-\\left\\lfloor\\frac{o_i}{s}\\right\\rfloor,\\qquad t_{\\max i}^{(0)}=\\begin{cases}(1-u_i)/d_i&d_i>10^{-12}\\\\u_i/(-d_i)&d_i<-10^{-12}\\\\10^{30}&|d_i|\\le10^{-12}\\end{cases}',
            displayMode: true,
            caption: '`int_bound` and the three `tm?` initializers in `dda_grid_traverse`. The source computes the fractional coordinate before choosing the positive or non-positive branch.',
          },
          {
            expression: 'j=\\begin{cases}x&t_{\\max x}<t_{\\max y}\\ \\land\\ t_{\\max x}<t_{\\max z}\\\\y&t_{\\max y}<t_{\\max z}\\\\z&\\text{otherwise}\\end{cases},\\qquad c_j\\leftarrow c_j+\\sigma_j,\\quad t\\leftarrow t_{\\max j},\\quad t_{\\max j}\\leftarrow t_{\\max j}+\\Delta t_j,\\quad t\\le t_{\\max}',
            displayMode: true,
            caption: 'The exact branch order, recurrence, and `while t <= t_max` bound in `dda_grid_traverse`. The final z branch resolves ties.',
          },
          {
            expression: 'F_x=\\begin{cases}1&\\sigma_x>0\\\\0&\\sigma_x\\le0\\end{cases},\\quad F_y=\\begin{cases}3&\\sigma_y>0\\\\2&\\sigma_y\\le0\\end{cases},\\quad F_z=\\begin{cases}5&\\sigma_z>0\\\\4&\\sigma_z\\le0\\end{cases}',
            displayMode: true,
            caption: 'The `enter_face` emitted after each crossed axis in `dda_grid_traverse`; the integer remains a face identifier for the picker, not a block-action decision.',
          },
          {
            expression: '\\delta(0)=(1,0,0),\\ \\delta(1)=(-1,0,0),\\ \\delta(2)=(0,1,0),\\ \\delta(3)=(0,-1,0),\\ \\delta(4)=(0,0,1),\\ \\delta(5)=(0,0,-1)',
            displayMode: true,
            caption: '`face_neighbor_offset` in `src/ludoxel/foundations/mathematics/voxels/faces.py`; these are neighbour offsets, not an invented face-normal API.',
          },
          {
            expression: '\\delta(0)=-\\delta(1),\\qquad \\delta(2)=-\\delta(3),\\qquad \\delta(4)=-\\delta(5)',
            displayMode: true,
            caption: 'The opposite signed-axis pairing follows directly from the six offsets in `src/ludoxel/foundations/mathematics/voxels/faces.py`. The module exposes that mapping, not a separate `opposite_face` function.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Picking uses the eye position and view direction with a default reach.',
            code: `def _pick_target(self, reach: float, *, origin=None, direction=None):
  eye = self.player.eye_pos() if origin is None else origin
  direction = self.player.view_forward() if direction is None else direction
  return pick_block(self.world, origin=eye, direction=direction, reach=float(reach), block_registry=self.block_registry)`,
          },
          {
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/geometry/ray_aabb.py',
            code: `for axis, (o_comp, d_comp, mn, mx) in enumerate(((o.x, d.x, aabb.mn.x, aabb.mx.x), (o.y, d.y, aabb.mn.y, aabb.mx.y), (o.z, d.z, aabb.mn.z, aabb.mx.z))):
  if abs(d_comp) < 1e-12:
    if o_comp < mn or o_comp > mx:
      return None
    continue

  inv = 1.0 / d_comp
  t1 = (mn - o_comp) * inv
  t2 = (mx - o_comp) * inv

  if t1 > t2:
    t1, t2 = t2, t1

  if t1 > tmin:
    tmin = t1
    enter_face = _enter_face_for_axis(int(axis), float(inv))

  if t2 < tmax:
    tmax = t2
    exit_face = _exit_face_for_axis(int(axis), float(inv))

  if tmin > tmax:
    return None

if tmax < 0.0:
  return None

if tmin >= 0.0:
  t_enter = float(tmin)
  face = int(enter_face)
else:
  t_enter = float(tmax)
  face = int(exit_face)`,
          },
          {
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/voxels/dda.py',
            code: `while t <= t_max:
  yield DDAHit(int(x), int(y), int(z), float(t), int(enter_face))

  if tmx < tmy and tmx < tmz:
    x += step_x
    t = tmx
    tmx += tdx
    enter_face = 1 if step_x > 0 else 0
  elif tmy < tmz:
    y += step_y
    t = tmy
    tmy += tdy
    enter_face = 3 if step_y > 0 else 2
  else:
    z += step_z
    t = tmz
    tmz += tdz
    enter_face = 5 if step_z > 0 else 4`,
          },
          {
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/voxels/faces.py',
            code: `def face_neighbor_offset(face_idx: int) -> tuple[int, int, int]:
  fi = int(face_idx)

  if fi == FACE_POS_X:
    return (1, 0, 0)
  if fi == FACE_NEG_X:
    return (-1, 0, 0)
  if fi == FACE_POS_Y:
    return (0, 1, 0)
  if fi == FACE_NEG_Y:
    return (0, -1, 0)
  if fi == FACE_POS_Z:
    return (0, 0, 1)
  return (0, 0, -1)`,
          },
        ],
      },
      {
        id: 'building-in-my-world-session-delegation',
        title: 'The Session Boundary Delegates the Action',
        body: [
          '`src/ludoxel/application/sessions/managers/interactions.py` does not define the pick ray, placement policy, collision rejection, or world-edit rule. Its functions receive the active session and forward break, pick, direct interaction, placement-from-hit, and ordinary placement to the `InteractionService` already constructed for that session. This gives presentation one application-facing action path without relocating simulation authority into the session manager.',
          'An accepted action makes that boundary observable. `SessionManager.break_block` and `SessionManager.place_block` record a player demonstration only after the delegated outcome reports success; a rejected interaction leaves that learning side effect absent. The interaction result still comes from the simulation service, while the application layer decides how a session-level caller records and transports that result.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'src/ludoxel/application/sessions/managers/interactions.py',
            code: `def break_block_for_session(session, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None):
  return session.interaction.break_block(reach=float(reach), origin=origin, direction=direction)

def pick_block_for_session(session, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None):
  return session.interaction.pick_block(reach=float(reach), origin=origin, direction=direction)

def place_block_for_session(session, block_id: str | None, reach: float = 5.0, *, crouching: bool = False, origin: Vec3 | None = None, direction: Vec3 | None = None):
  return session.interaction.place_block(block_id=block_id, reach=float(reach), crouching=bool(crouching), origin=origin, direction=direction)`,
          },
        ],
      },
      {
        id: 'building-in-my-world-breaking',
        title: 'Breaking Removes the Picked Cell',
        body: [
          'Breaking picks a target, reads the block state at the hit cell, and removes it. If nothing is picked or the cell is already empty, the outcome reports failure and the world is unchanged. On success the outcome carries the break action, the removed state, and the position.',
          'Removal is committed through the same world-edit path as placement, so breaking a block can also update connected neighbors such as fences and walls that depended on it.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Breaking reads the previous state, then commits a removal.',
            code: `def break_block_for_service(service, reach=5.0, *, origin=None, direction=None):
  hit = service._pick_target(reach=float(reach), origin=origin, direction=direction)
  if hit is None:
    return InteractionOutcome(success=False)
  hx, hy, hz = hit.hit
  previous_state = service.world.blocks.get((int(hx), int(hy), int(hz)))
  if previous_state is None:
    return InteractionOutcome(success=False)
  service._commit_world_edit(removals=((int(hx), int(hy), int(hz)),))
  return InteractionOutcome(success=True, action=INTERACTION_ACTION_BREAK, target_block_state=str(previous_state), target_position=(int(hx), int(hy), int(hz)))`,
          },
        ],
      },
      {
        id: 'building-in-my-world-interact-then-place',
        title: 'Place Tries Interaction First Unless Crouching',
        body: [
          'A normal place action first tries to interact with the targeted block, for example toggling a fence gate. If interaction succeeds, that is the result and no block is placed. Only when interaction does not apply does the service fall through to placement.',
          'Crouching changes this order: a crouching place skips interaction and goes straight to placement. The crouching route places a block against a gate.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Without crouch, interaction is attempted before placement.',
            code: `def place_block_for_service(service, block_id, reach=5.0, *, crouching=False, origin=None, direction=None):
  hit = service.pick_block(reach=float(reach), origin=origin, direction=direction)
  if hit is None:
    return InteractionOutcome(success=False)
  if bool(crouching):
    return place_from_hit_for_service(service, hit=hit, block_id=block_id)
  interact_outcome = service.interact_block_at_hit(hit.hit)
  if bool(interact_outcome.success):
    return interact_outcome
  return place_from_hit_for_service(service, hit=hit, block_id=block_id)`,
          },
        ],
      },
      {
        id: 'building-in-my-world-placement-cell',
        title: 'Placement Resolves the Cell and State Shape',
        body: [
          'Placement requires a non-empty, registered item. If the hit block is a slab matching the held item, the merge completes that cell to a double at the hit cell, and the exposed pick face supplies the added half, so a held slab packs in half-block steps even while continuous placement is locked to one half. Otherwise the adjacent placement cell is used, and the placement policy resolves the concrete block state from the held item, the hit face, and the player facing, while a held bridge that extends from a slab or stair source inherits that source half or facing.',
          'A placement that would intersect the player is rejected before any edit. `placement_intersects_player` builds the candidate block collision boxes at the target cell and tests them against the player box, so standing too close to the target stops a placement that would otherwise be legal.',
          '`src/ludoxel/foundations/mathematics/geometry/aabb.py` owns the closed-open overlap predicate used by that rejection. Its `intersects` method requires non-empty overlap in every coordinate dimension; faces that meet at a maximum/minimum boundary remain separate. `placement_intersects_player` in `src/ludoxel/simulation/rules/placement/support.py` supplies the player box and candidate block-model boxes, then converts an accepted predicate into a placement rejection. Block shapes, item registration, and world edits remain under their respective simulation owners.',
        ],
        mathBlocks: [
          {
            expression: 'A\\cap B\\ne\\varnothing\\ \\Longleftrightarrow\\ \\bigwedge_{i\\in\\{x,y,z\\}}\\left(A_{\\max,i}>B_{\\min,i}\\ \\land\\ A_{\\min,i}<B_{\\max,i}\\right)',
            displayMode: true,
            caption: '`AABB.intersects` in `src/ludoxel/foundations/mathematics/geometry/aabb.py`; its six negated separation tests use `<=` and `>=`, making equality a non-intersection.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/geometry/aabb.py',
            code: `def intersects(self, o: "AABB") -> bool:
  return not (
    self.mx.x <= o.mn.x
    or self.mn.x >= o.mx.x
    or self.mx.y <= o.mn.y
    or self.mn.y >= o.mx.y
    or self.mx.z <= o.mn.z
    or self.mn.z >= o.mx.z
  )`,
          },
          {
            language: 'py',
            caption: 'A placement that intersects the player is rejected before committing.',
            code: `def apply_place_state_for_service(service, *, cell, place_state):
  px, py, pz = (int(cell[0]), int(cell[1]), int(cell[2]))
  if service.placement_policy.placement_intersects_player(player=service.player, world=service.world, px=px, py=py, pz=pz, place_state=str(place_state)):
    return InteractionOutcome(success=False)
  service._commit_world_edit(updates={(px, py, pz): str(place_state)})
  return InteractionOutcome(success=True, action=INTERACTION_ACTION_PLACE, target_block_state=str(place_state), target_position=(px, py, pz))`,
          },
        ],
      },
      {
        id: 'building-in-my-world-commit',
        title: 'Commits Update Structural Neighbors',
        body: [
          'A committed edit writes the touched cells with its structural neighbor updates. The service collects updates for adjacent fences, walls, and other connected blocks, then applies the combined updates and removals in one bulk write to the world.',
          'A single place or break can change the visible shape of nearby blocks. `collect_structural_neighbor_updates` recomputes connected fences and walls during the same commit, placing neighbor reshaping inside the accepted world edit.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Structural neighbor updates are merged into the bulk world write.',
            code: `def _commit_world_edit(self, *, updates=None, removals=()):
  normalized_updates = {(int(k[0]), int(k[1]), int(k[2])): str(v) for k, v in (updates or {}).items()}
  normalized_removals = tuple((int(k[0]), int(k[1]), int(k[2])) for k in removals)
  touched = set(normalized_updates.keys()) | set(normalized_removals)
  if not touched:
    return
  structural_updates = collect_structural_neighbor_updates(self.world, touched, block_registry=self.block_registry, overlay_updates=normalized_updates, overlay_removals=normalized_removals)
  final_updates = dict(normalized_updates)
  final_updates.update(structural_updates)
  self.world.set_blocks_bulk(updates=final_updates, removals=normalized_removals)`,
          },
        ],
      },
      {
        id: 'building-in-my-world-render-handoff',
        title: 'The Renderer Receives Dirty Chunks',
        body: [
          'Applying the bulk edit advances the world through `set_blocks_bulk`, which fixes the renderer-facing contract. Each mutated cell increments `WorldState.revision`, marks its containing and neighbouring chunk keys dirty, and records a gravity-dirty column at the cell and the cell directly above. A block on a chunk boundary changes adjacent-chunk visible faces, and the gravity system re-scans the recorded columns on the next fixed step.',
          'The session pipeline, not the interaction service, delivers that result to the renderer. It drains the accumulated set through `consume_dirty_chunks` or `consume_dirty_chunks_with_rev`, rebuilds the face payload for those chunk keys, and submits them to the active backend; the per-chunk revision returned by the second form travels with the upload so a stale payload can be rejected. The interaction service itself never touches renderer state.',
          'If a build appears to succeed in the world but not on screen, the question is therefore the dirty-chunk drain and the upload cadence, not the interaction rule. The accepted edit, the revision increment, and the rendered result are three separate steps connected by the session pipeline.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'src/ludoxel/simulation/worlds/state/world.py',
            code: `self.revision += 1
self._mark_chunks_dirty(neighbor_chunk_keys_for_cell(int(x), int(y), int(z)))
self._mark_gravity_dirty_cell(int(x), int(y), int(z))
self._mark_gravity_dirty_cell(int(x), int(y) + 1, int(z))`,
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Block Shapes', 'Reading Placement Rejection', 'Reading Saved World State'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Block Construction',
    title: 'Understanding Block Shapes',
    description: 'Explains how non-cube block models produce different collision, pick, and render geometry: slabs, stairs, fences, fence gates, and walls each build their own boxes in sixteenth-of-a-block units, and structural blocks are raised to a tall hull for collision and picking.',
    sections: [
      {
        id: 'understanding-block-shapes-kinds',
        title: 'A Block Kind Selects the Model',
        body: [
          'Each block definition has a kind, and the model layer dispatches on it. Full cubes, short cubes, slabs, stairs, fences, fence gates, and walls each build a different set of local boxes. A block that is not one of the special kinds falls back to a unit cube.',
          'The boxes are expressed in local coordinates where one block spans from zero to one. The model functions return these boxes; the rest of the system translates them into world-space AABBs as needed.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The render model dispatches on the block kind.',
            code: `def _render_boxes_uncached(state_str, get_state, get_def, x, y, z):
  base, props, kind = _resolve_block_kind(str(state_str), get_def)
  if kind == "slab":
    return tuple(boxes_for_slab(props))
  if kind == "stairs":
    return tuple(boxes_for_stairs(base_id=str(base), props=props, get_state=get_state, get_def=get_def, x=x, y=y, z=z))
  if kind == "fence":
    return tuple(boxes_for_fence(get_state=get_state, get_def=get_def, x=x, y=y, z=z))
  if kind == "fence_gate":
    return tuple(boxes_for_fence_gate(props))
  if kind == "wall":
    return tuple(boxes_for_wall(props=props, get_state=get_state, get_def=get_def, x=x, y=y, z=z))
  if kind == "short_cube":
    return (LocalBox(0.0, 0.0, 0.0, 1.0, 15.0 / 16.0, 1.0),)
  return (LocalBox(0.0, 0.0, 0.0, 1.0, 1.0, 1.0),)`,
          },
        ],
      },
      {
        id: 'understanding-block-shapes-slabs',
        title: 'Slabs Occupy a Half Cell or the Whole Cell',
        body: [
          'A slab builds one box depending on its type. A bottom slab fills the lower half of the cell, a top slab fills the upper half, and a double slab fills the whole cell. This single box is what collision, picking, and rendering all use for the slab.',
          'Because the type determines the box, the same slab block id behaves differently as bottom, top, or double. Placing a second slab into a matching half is what produces the double form.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The slab box is chosen from the type property.',
            code: `def boxes_for_slab(props):
  t = str(props.get("type", "bottom"))
  if t == "top":
    return [LocalBox(0.0, 0.5, 0.0, 1.0, 1.0, 1.0)]
  if t == "double":
    return [LocalBox(0.0, 0.0, 0.0, 1.0, 1.0, 1.0)]
  return [LocalBox(0.0, 0.0, 0.0, 1.0, 0.5, 1.0)]`,
          },
        ],
      },
      {
        id: 'understanding-block-shapes-three-uses',
        title: 'Render, Collision, and Pick Boxes Can Differ',
        body: [
          'The model layer produces three box sets per block: render, collision, and pick. For most blocks these are the same as the render boxes, but structural blocks diverge. The split lets the visible shape, the solid shape, and the targetable shape each be correct for its purpose.',
          'These box sets are cached by a signature of the block state and its neighbors, so recomputing the shape of an unchanged block is cheap. The cache is what keeps shape-aware collision and picking from being expensive per frame.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Pick boxes are built per block and cached by shape signature.',
            code: `def pick_boxes_for_block(state_str, get_state, get_def, x, y, z):
  key = _local_box_cache_key("pick", str(state_str), get_state, get_def, x, y, z)

  def _build():
    _base, _props, kind = _resolve_block_kind(str(state_str), get_def)
    if kind == "fence_gate":
      return _fence_gate_pick_boxes(str(state_str), get_state, get_def, x, y, z)
    if kind in ("fence", "wall"):
      return _tall_structural_boxes(str(state_str), get_state, get_def, x, y, z)
    return tuple(render_boxes_for_block(str(state_str), get_state, get_def, x, y, z))

  return _cache_get_or_build(_PICK_BOX_CACHE, key, _build)`,
          },
        ],
      },
      {
        id: 'understanding-block-shapes-tall-hull',
        title: 'Fences and Walls Use a Tall Collision Hull',
        body: [
          'For collision and picking, fences and walls are raised to a tall hull whose height is at least one and a half blocks. This makes them block movement and accept hits as if they were taller than their visible posts, matching how they behave when you try to walk through or jump over them.',
          'Rendering still uses the shorter visible boxes, while collision and picking use the raised hull. The two box sets are produced by separate model queries, so the taller collision reach is a deliberate property of structural blocks that the renderer does not share.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Structural blocks raise their boxes to a minimum tall height.',
            code: `_TALL_STRUCTURAL_MIN_HEIGHT = 1.5


def _tall_structural_boxes(state_str, get_state, get_def, x, y, z):
  return _raise_boxes_to_min_height(render_boxes_for_block(str(state_str), get_state, get_def, x, y, z), _TALL_STRUCTURAL_MIN_HEIGHT)`,
          },
        ],
      },
      {
        id: 'understanding-block-shapes-fence-gate',
        title: 'An Open Fence Gate Has No Collision',
        body: [
          'A fence gate changes its solid shape when open. A closed gate uses the tall structural hull for collision, while an open gate has no collision boxes at all, so the player can pass through. Picking keeps an interaction hull so the gate can still be toggled.',
          'An open gate therefore stops blocking movement while remaining targetable: its collision set is empty, and its pick set keeps a hull for interaction.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'An open fence gate returns no collision boxes.',
            code: `if kind == "fence_gate":
  if prop_as_bool(props, "open", False):
    return ()
  return _tall_structural_boxes(str(state_str), get_state, get_def, x, y, z)`,
          },
        ],
      },
      {
        id: 'understanding-block-shapes-neighbors',
        title: 'Stairs, Fences, and Walls Read Neighbors',
        body: [
          'Some shapes depend on surrounding blocks. Stairs read their facing and half, and fences and walls connect to neighboring blocks, so their boxes are computed with access to neighbor state. The shape cache key includes a neighbor signature so a neighbor change rebuilds the shape.',
          'Because the shape cache key includes a neighbor signature, placing or breaking one block rebuilds the shape of an adjacent fence or wall, which the structural neighbor updates apply during a commit.',
        ],
      },
      {
        id: 'understanding-block-shapes-top-support',
        title: 'Full Top Support Is a Separate Query',
        body: [
          'Whether a block presents a full flat top is computed by sampling its render boxes over a sixteen-by-sixteen grid and checking that every cell is covered at full height. This is what placement, support, and the player ground check use to decide if a surface can be stood on or built upon.',
          'A slab top, a stair, or a partial shape can therefore fail the full-top-support test even though it occupies the cell, so a block can fill a cell without presenting a surface that placement, support, and the ground check accept as a floor.',
        ],
        mathBlocks: [
          {
            expression: 'Q_{16}(v) = \\mathrm{clamp}\\bigl(\\operatorname{round}(16v),\\, 0,\\, 16\\bigr), \\qquad \\text{full top} \\iff \\bigcup_{b\\,:\\,b_y^{\\max} \\ge 1-\\epsilon} \\bigl[Q_{16}(b_{x_0}), Q_{16}(b_{x_1})\\bigr) \\times \\bigl[Q_{16}(b_{z_0}), Q_{16}(b_{z_1})\\bigr) = \\{0,\\dots,15\\}^2',
            displayMode: true,
            caption: 'The full-top query in src/ludoxel/simulation/blocks/models/api.py snaps each render box to a sixteenth-of-a-block lattice and accepts the surface only when full-height boxes cover every one of the 16×16 cells; the same one-sixteenth grid measures all block-model extents.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Full top support requires complete coverage at full height.',
            code: `for box in render_boxes_for_block(str(state_str), get_state, get_def, x, y, z):
  if float(box.mx_y) < (1.0 - 1e-6):
    continue
  start_x = max(0, min(16, int(round(float(box.mn_x) * 16.0))))
  end_x = max(0, min(16, int(round(float(box.mx_x) * 16.0))))
  # ... mark covered cells; require all 16x16 covered`,
          },
        ],
      },
    ],
    relatedTitles: ['Reading Placement Rejection', 'Understanding Selection Outlines', 'Building in My World'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Placement and Hazards',
    title: 'Reading Placement Rejection',
    description: 'Helps interpret why a placement did not change the world. Placement can be rejected for a missing or unplaceable item, a missing target, an invalid slab merge, an occupied cell, or an intersection with the player, and each rejection returns a failed outcome without editing the world.',
    sections: [
      {
        id: 'reading-placement-rejection-empty-or-unregistered',
        title: 'An Empty or Unregistered Item Fails Early',
        body: [
          'Placement requires a non-empty item id that the block registry knows. An empty hand or an unknown id is rejected before any pick or world check, returning a failed outcome with no edit.',
          'The placement path begins with the selected hotbar slot. An empty slot or an item absent from the placeable-block registry supplies no block identifier to the interaction service, leaving the world state unchanged.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A placeable block must exist in the registry.',
            code: `def has_selected_placeable_block_for_service(service, block_id):
  bid = str(block_id).strip()
  if not bid:
    return False
  return service.block_registry.get(str(bid)) is not None`,
          },
        ],
      },
      {
        id: 'reading-placement-rejection-no-target',
        title: 'No Pick Means No Placement',
        body: [
          'If the view ray does not hit a block within reach, there is no hit cell and no adjacent placement cell, so placement fails. The same is true if the hit cell turns out to be empty when the placement is resolved.',
          'Aiming at the sky, beyond the reach distance, or at a gap leaves placement without a target cell and ends the action silently.',
        ],
      },
      {
        id: 'reading-placement-rejection-slab-merge',
        title: 'Slab Merges Have Strict Conditions',
        body: [
          'When the held item matches an existing slab, placement tries to merge them into a double slab. The merge only succeeds when the existing block is the same slab id, is actually a slab, the desired half is the opposite of the current half, and the current slab is not already double.',
          'If those conditions are not met, the merge returns nothing and the placement falls through to the adjacent cell or fails. A merge attempt that does nothing is usually a half or id mismatch.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A slab merge requires the same id and an opposite half.',
            code: `def resolve_same_slab_merge_state(*, block_registry, existing_state, block_id, desired_type):
  base, props = parse_state(str(existing_state))
  if str(base) != str(block_id):
    return None
  defn = block_registry.get(str(base))
  if defn is None or (not is_slab(defn)):
    return None
  want = str(desired_type)
  if want not in ("bottom", "top"):
    return None
  cur = slab_type_value(props)
  if cur == "double" or cur == want:
    return None
  return format_state(str(base), {"type": "double"})`,
          },
        ],
      },
      {
        id: 'reading-placement-rejection-occupied-cell',
        title: 'An Occupied Cell Blocks Non-Merge Placement',
        body: [
          'The adjacent placement cell must be empty unless a slab merge applies. If the pick reports a placement cell that already contains a block, the pick itself clears the placement target, and a non-merge placement into an occupied cell is rejected.',
          'A non-merge placement into an occupied cell is therefore refused, and only a valid slab merge can change a cell that already holds a block.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The pick drops the placement cell if it is already occupied.',
            code: `ox, oy, oz = face_neighbor_offset(int(face))
if ox == 0 and oy == 0 and oz == 0:
  place = prev_cell
else:
  place = (int(cx + ox), int(cy + oy), int(cz + oz))
if place is not None and place in world.blocks:
  place = None`,
          },
        ],
      },
      {
        id: 'reading-placement-rejection-player-intersect',
        title: 'Placing Into the Player Is Rejected',
        body: [
          'Before committing, placement checks whether the new block shape would intersect the player body. The check builds the would-be block collision boxes at the target cell and tests them against the player AABB; any overlap rejects the placement.',
          'Standing in the cell you are trying to fill, or placing a tall structural shape against yourself, is therefore refused even when everything else is legal.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Placement is refused if the new shape overlaps the player.',
            code: `def placement_intersects_player(*, block_registry, player, world, px, py, pz, place_state):
  pa = player.aabb_at(player.position)
  def get_state(x, y, z):
    if (int(x), int(y), int(z)) == (int(px), int(py), int(pz)):
      return str(place_state)
    return world.blocks.get((int(x), int(y), int(z)))
  for ba in collision_aabbs_for_block(str(place_state), get_state, block_registry.get, px, py, pz):
    if pa.intersects(ba):
      return True
  return False`,
          },
        ],
      },
      {
        id: 'reading-placement-rejection-interaction-first',
        title: 'Interaction Can Consume the Click',
        body: [
          'A place action without crouch first tries to interact with the target. If the block is a fence gate, the click toggles it open or closed and reports success, so no block is placed. The placement rules only run when interaction does not apply.',
          'When a click toggles a gate, interaction has taken priority over placement and reported success, so the placement path never runs. Crouching skips interaction so the same click places a block.',
          'When placement runs, `resolve_place_state` derives a slab `type`, or a stair `facing` and `half`, from the hit face, the hit point, and the player facing. A bridge that extends from a slab or stair source into an adjacent empty cell instead receives that source state through `inherit_state` and copies its half or facing, so a held lower-slab bridge stays lower and an upper-slab bridge stays upper even where the synthesized support-face hit point would read the opposite half. Ordinary single-click placement passes no `inherit_state` and keeps the hit-geometry result.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The placement policy resolves shape state when placement does run.',
            code: `def resolve_place_state(self, *, player, block_id, hit_face, hit_point, inherit_state=None):
  base_sel = str(block_id)
  defn = self.block_registry.get(base_sel)
  if defn is None:
    return None
  inherit_base, inherit_props = (None, {})
  if inherit_state is not None:
    inherit_base, inherit_props = parse_state(str(inherit_state))
  props = {}
  if is_slab(defn):
    inherited_type = None
    if str(inherit_base) == base_sel:
      candidate = slab_type_value(inherit_props)
      if candidate in ("bottom", "top"):
        inherited_type = candidate
    props["type"] = inherited_type if inherited_type is not None else self._choose_half_type(int(hit_face), hit_point)
    return format_state(base_sel, props)
  if is_stairs(defn):
    if str(inherit_base) == base_sel:
      inherited_facing = str(inherit_props.get("facing", "")).strip()
      inherited_half = str(inherit_props.get("half", "")).strip()
      props["facing"] = inherited_facing if inherited_facing in ("north", "east", "south", "west") else self._player_cardinal(player)
      props["half"] = inherited_half if inherited_half in ("bottom", "top") else self._choose_half_type(int(hit_face), hit_point)
    else:
      props["facing"] = self._player_cardinal(player)
      props["half"] = self._choose_half_type(int(hit_face), hit_point)
    return format_state(base_sel, props)
  if is_fence_gate(defn):
    return make_fence_gate_state(base_sel, self._player_cardinal(player), open_state=False)
  if is_wall(defn):
    return make_wall_state(base_sel, waterlogged=False)
  return format_state(base_sel, props)`,
          },
        ],
      },
      {
        id: 'reading-placement-rejection-reporting',
        title: 'What to Note When a Placement Does Nothing',
        body: [
          'A useful description of a stuck placement names the held block id, the targeted face, the player stance and mode, and whether a slab merge or a gate toggle was expected. These map directly to the rejection paths: empty item, missing target, invalid merge, occupied cell, or player intersection.',
          'These are simulation facts, not renderer facts. Avoid attaching private save files; the block id, target, and stance are enough to identify which rule rejected the placement.',
        ],
      },
    ],
    relatedTitles: ['Building in My World', 'Understanding Block Shapes', 'Changing AI Behavior Values'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'Placement and Hazards',
    title: 'Surviving Fall and Void Hazards',
    description: 'Explains the two environmental damage sources in survival play: fall damage past a three-block safe distance, computed from the airborne start height on landing, and void damage that ticks a fixed amount on a fixed interval below the void threshold depth.',
    sections: [
      {
        id: 'surviving-fall-and-void-hazards-airborne-tracking',
        title: 'The Fall Start Height Is Tracked While Airborne',
        body: [
          'Grounded movement records where the player became airborne. On each step that the player is unsupported, the airborne start height is set if it was not already, and it is cleared once the player is supported again.',
          'The movement rule records airborne start height for the later landing calculation. Flight clears that tracking state, leaving creative movement outside the grounded fall-distance path.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The airborne start height is captured when the player leaves the ground.',
            code: `if not bool(report.supported_after):
  if motion.airborne_start_y is None:
    motion.airborne_start_y = float(prev_pos_y)

landed_now = (not prev_on_ground) and bool(report.supported_after) and (float(prev_vy) <= 0.0)
fall_distance_blocks = None
if bool(landed_now):
  start_y = float(prev_pos_y) if motion.airborne_start_y is None else float(motion.airborne_start_y)
  fall_distance_blocks = max(0.0, float(start_y) - float(player.position.y))`,
          },
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-safe-distance',
        title: 'Falls Within Three Blocks Are Safe',
        body: [
          'Fall damage is computed from the distance fallen relative to a safe distance of three blocks. A landing within the safe distance does no damage, and beyond it the damage is the whole number of blocks past the safe distance, rounded up.',
          'So a four-block fall does one point, a five-block fall does two, and short hops do nothing. The damage scales with the excess distance past three blocks; total height alone is outside the formula.',
        ],
        mathBlocks: [
          {
            expression: '\\mathrm{dmg}(d) = \\begin{cases} 0 & d \\le d_{\\mathrm{safe}} \\\\[2pt] \\lceil\\, d - d_{\\mathrm{safe}} \\,\\rceil & d > d_{\\mathrm{safe}} \\end{cases}, \\qquad d_{\\mathrm{safe}} = 3',
            displayMode: true,
            caption: 'fall_damage_amount in src/ludoxel/simulation/actors/player/kinematics.py, with FALL_DAMAGE_SAFE_DISTANCE_BLOCKS fixed at three blocks; the ceiling makes every excess block a whole point.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Fall damage is the rounded-up excess over the safe distance.',
            code: `FALL_DAMAGE_SAFE_DISTANCE_BLOCKS = 3.0


def fall_damage_amount(*, fall_distance_blocks):
  if fall_distance_blocks is None:
    return 0.0
  distance = max(0.0, float(fall_distance_blocks))
  if distance <= float(FALL_DAMAGE_SAFE_DISTANCE_BLOCKS):
    return 0.0
  return float(math.ceil(float(distance) - float(FALL_DAMAGE_SAFE_DISTANCE_BLOCKS)))`,
          },
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-void-threshold',
        title: 'The Void Begins Below a Fixed Depth',
        body: [
          'The void hazard activates below a fixed Y threshold. While the player is alive and below that depth, void damage applies; at or above it, no void damage is taken. The threshold is a hard depth, not a function of the surrounding world.',
          'Falling below the world threshold starts a steady hazard. Climbing back above the threshold ends the damage path.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Void damage only applies below the threshold while alive.',
            code: `VOID_DAMAGE_START_Y = -64.0
VOID_DAMAGE_INTERVAL_S = 0.50
VOID_DAMAGE_AMOUNT = 4.0


def apply_void_damage(*, player, dt, timer_s):
  if (not bool(player.alive())) or float(player.position.y) >= float(VOID_DAMAGE_START_Y):
    return (0.0, 0.0)`,
          },
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-void-interval',
        title: 'Void Damage Ticks on a Fixed Interval',
        body: [
          'Below the threshold, a timer accumulates and applies a fixed damage amount each interval, bypassing the normal damage cooldown so the hits keep coming. The remaining sub-interval time is carried forward so the cadence is steady across frames.',
          'The fixed interval and damage amount create a continuous void drain. Survival time follows current health and the time required to climb above the threshold.',
        ],
        mathBlocks: [
          {
            expression: 'n = \\left\\lfloor \\frac{t + \\Delta t}{T} \\right\\rfloor, \\qquad \\mathrm{damage} = A\\,n, \\qquad t_{\\mathrm{next}} = (t + \\Delta t) - T\\,n',
            displayMode: true,
            caption: 'apply_void_damage in src/ludoxel/simulation/actors/player/damage.py drains the accumulator in whole intervals: VOID_DAMAGE_INTERVAL_S sets the period T = 0.5 s, VOID_DAMAGE_AMOUNT sets A = 4 per tick (bypassing the hurt cooldown), and the sub-interval remainder is carried to the next step.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Each interval applies a fixed amount and carries the remainder.',
            code: `remaining = max(0.0, float(timer_s)) + max(0.0, float(dt))
damage_taken = 0.0
while float(remaining) + 1e-9 >= float(VOID_DAMAGE_INTERVAL_S) and bool(player.alive()):
  remaining -= float(VOID_DAMAGE_INTERVAL_S)
  damage_taken += float(player.apply_damage(float(VOID_DAMAGE_AMOUNT), bypass_cooldown=True))
return (float(damage_taken), max(0.0, float(remaining)))`,
          },
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-session-step',
        title: 'Hazards Are Resolved in the Session Step',
        body: [
          'Both hazards are applied as part of the fixed session step, not by the renderer. Fall damage is decided when a landing is detected during movement integration, and void damage is advanced from the player position and the accumulated timer each step.',
          'Because these run in the simulation, the view only shows the result. Health, hurt flash, and death come from the step, so the renderer cannot be the cause of unexpected damage.',
        ],
      },
      {
        id: 'surviving-fall-and-void-hazards-creative-flight',
        title: 'Creative Flight Changes the Outcome',
        body: [
          'Creative flight bypasses the grounded movement model, so the airborne start height is cleared and fall damage does not accrue. The void check still depends only on depth and aliveness, but a flying player is not subject to the grounded landing that produces fall damage.',
          'When describing unexpected hazard behavior, the game mode and flight state matter as much as the position, because they decide which damage path is active.',
        ],
      },
    ],
    relatedTitles: ['Moving the Player', 'Recovering after Death', 'Reading Saved World State'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Lifecycle',
    title: 'Spawning AI NPCs',
    description: 'Explains the state created when an AI NPC is added to a world: a spawn egg supplies normalized settings, the manager allocates a live actor id, checks that the spawn position is clear, and builds a runtime actor with its own player body, behavior mode, and personality.',
    sections: [
      {
        id: 'spawning-ai-npcs-egg-settings',
        title: 'A Spawn Egg Carries Normalized Settings',
        body: [
          'An AI is created from spawn-egg settings covering mode, personality, name, health-indicator placement, skin source, auto-regeneration, route data, and whether the AI may place blocks. The settings are normalized before use, so out-of-range or unknown values resolve to valid defaults.',
          'These settings define the AI before it exists in the world. The manager turns them into a concrete actor; the egg itself is just the configuration.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'AI player state defaults define the initial behavior and health.',
            code: `@dataclass(frozen=True)
class AiPlayerState:
  actor_id: str
  mode: str = AI_MODE_IDLE
  personality: str = AI_PERSONALITY_AGGRESSIVE
  can_place_blocks: bool = False
  name: str = ""
  health_indicator: str = AI_HEALTH_INDICATOR_ABOVE
  skin_mode: str = AI_SKIN_MODE_PLAYER
  health: float = 20.0
  max_health: float = 20.0`,
          },
        ],
      },
      {
        id: 'spawning-ai-npcs-actor-id',
        title: 'The Manager Allocates a Live Actor Id',
        body: [
          'When a spawn is accepted, the manager assigns the next sequential actor id of the form `ai_player_N` and registers the runtime actor under it. The id is how every later action — settings edits, removal, route planning — addresses that specific AI.',
          'Ids are unique within the session. The manager tracks the next index so reused or loaded ids do not collide with freshly spawned ones.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Actor ids are sequential within the manager.',
            code: `def _allocate_actor_id(self) -> str:
  actor_id = f"ai_player_{int(self._next_actor_index)}"
  self._next_actor_index += 1
  return str(actor_id)`,
          },
        ],
      },
      {
        id: 'spawning-ai-npcs-clear-position',
        title: 'The Spawn Position Must Be Clear',
        body: [
          'A spawn only succeeds if the AI body fits. The manager builds the actor at the spawn cell center, then tests the body against nearby block collision shapes; if it would intersect a block, the spawn is refused and no actor is registered.',
          'The clearance check evaluates the same shape-aware collision used for the player, including partial shapes. A wall or tight space that intersects the body rejects the spawn.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The spawn is rejected when the body intersects nearby blocks.',
            code: `actor = self._state_to_runtime(state)
if not _spawn_position_clear(player=actor.player, world=self.world, block_registry=self.block_registry):
  return None
self._actors[str(actor.actor_id)] = actor
return str(actor.actor_id)`,
          },
        ],
      },
      {
        id: 'spawning-ai-npcs-name-validation',
        title: 'Names Are Validated Against Live AI',
        body: [
          'A requested name is checked for format and for conflicts with other live AI. If the name is invalid or already in use, the manager allocates a default `AI#NNNN` name or suggests a free numbered variant, so a spawn never silently shares a name with a living AI.',
          'Name occupancy only counts living AI, so a defeated or removed AI frees its name. This keeps world-space nametags unambiguous among the AI currently present.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'An invalid or taken spawn name falls back to a default.',
            code: `spawn_name = str(normalized_settings.name).strip()
if not spawn_name or self.ai_name_error(actor_id=None, name=spawn_name) is not None:
  allocated = allocate_default_spawn_ai_name(self._live_name_keys())
  if allocated is None:
    return None
  spawn_name = str(allocated)`,
          },
        ],
      },
      {
        id: 'spawning-ai-npcs-modes',
        title: 'Mode Decides Standby, Roam, or Route',
        body: [
          'The behavior mode selects what the AI does after spawning. Idle keeps it on standby, wander has it free-roam, and route makes it follow a path when at least two route points exist. A route request with fewer than two points is not applied.',
          'Mode is independent of personality. An idle AI is not fighting regardless of personality, while a wandering AI moves on its own.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Route mode requires at least two route points to apply.',
            code: `if normalize_ai_mode(normalized.mode) == AI_MODE_ROUTE and len(normalized.route_points) < 2:
  return False`,
          },
        ],
      },
      {
        id: 'spawning-ai-npcs-personality',
        title: 'Personality Decides Combat Role',
        body: [
          'Personality is aggressive or peaceful. An aggressive AI takes on the combat role, while a peaceful AI avoids it. This is separate from mode, so a wandering aggressive AI can engage while a wandering peaceful one will not.',
          'The default personality is aggressive, so a spawn left at defaults will pursue and attack when conditions allow, subject to the combat rules.',
        ],
      },
      {
        id: 'spawning-ai-npcs-runtime-body',
        title: 'Each AI Gets Its Own Player Body',
        body: [
          'The runtime actor builds a full player entity for the AI with position, velocity, orientation, and health, and its own interaction service. The AI moves and collides with the same kinematics as the human player, so it is subject to gravity, collision, fall damage, and void damage like the player.',
          'Because the AI uses a real player body, its health and combat are simulation state. The renderer displays its nametag and health but does not decide whether it is damaged or defeated.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The AI runtime owns a player entity and an interaction service.',
            code: `player = self._build_player(state=normalized)
interaction = InteractionService.create(world=self.world, player=player, block_registry=self.block_registry)
actor = _AiPlayerRuntime(actor_id=str(actor_id), player=player, interaction=interaction, mode=normalize_ai_mode(normalized.mode), personality=normalize_ai_personality(normalized.personality), ...)`,
          },
        ],
      },
    ],
    relatedTitles: ['Reading AI Nametags and Health', 'Naming an AI NPC', 'Changing AI Behavior Values'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Lifecycle',
    title: 'Reading AI Nametags and Health',
    description: 'Explains the world-space AI nametag and health indicator: a pooled tag widget composites the name and a pixel-heart strip into one image, places it above each AI scaled by distance, and shows health above, below, or not at all according to the AI settings.',
    sections: [
      {
        id: 'reading-ai-nametags-and-health-pool',
        title: 'Tags Are Pooled Per Actor',
        body: [
          'AI tags are managed by a pool keyed on actor id. Each frame the pool begins, shows a tag for every visible AI, and ends, disposing tags for AI that were not seen. This keeps one tag widget alive per visible AI and removes tags for AI that despawned.',
          'Because tags are pooled and reused, the on-screen label for an AI is tied to its actor id, the same id the manager uses for its state.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The pool reuses a tag per actor id and disposes stale ones.',
            code: `def end_frame(self) -> None:
  stale_ids = [actor_id for actor_id in self._entries.keys() if actor_id not in self._seen_ids]
  for actor_id in stale_ids:
    entry = self._entries.pop(str(actor_id), None)
    if entry is not None:
      entry.setVisible(False)
      entry.dispose()`,
          },
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-name-source',
        title: 'The Name Comes From AI Settings',
        body: [
          'The displayed name is the AI’s normalized name from its settings, the same value the manager validates against other live AI. Two living AI cannot share a name, so a nametag identifies a specific actor.',
          'The renderer only displays the name; it does not assign or deduplicate it. Name conflicts are resolved on the simulation side before a tag is shown.',
          'When the F3 Debug HUD is visible and an AI has a confirmed Route Patrol path with at least two points, the AI name text uses the same actor-id-derived color as that AI’s completed route overlay. Hiding the Debug HUD or removing the confirmed route returns the name text to the normal HUD style.',
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-indicator-modes',
        title: 'Health Can Sit Above, Below, or Be Hidden',
        body: [
          'The health indicator has three placements: above the name, below the name, or off. When hearts are shown, the composite stacks the name and the heart strip in the chosen order; when off, only the name is drawn.',
          'A tag is only shown if it has a name or a visible health indicator. An AI with no name and a hidden indicator produces no tag.',
          'Route owner color changes only the rendered name pixmap. The heart fill, outline, and highlight colors remain the health indicator colors.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Hearts are placed above or below the name based on the indicator.',
            code: `if hearts_visible and indicator == AI_HEALTH_INDICATOR_ABOVE:
  hearts_y = 0
  name_y = int(hearts_h + gap)
elif hearts_visible:
  name_y = 0
  hearts_y = int(name_h + gap)`,
          },
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-heart-scale',
        title: 'One Heart Is Two Health Points',
        body: [
          'The heart strip draws one heart per two points of maximum health, and fills each heart in proportion to current health, so half-heart amounts are visible. Numeric health stays in simulation state; the hearts are a display of it.',
          'The AI tag renderer uses the player HUD convention of two health points per heart, allowing the displayed heart count to map directly to actor health.',
        ],
        mathBlocks: [
          {
            expression: 'N = \\max\\!\\bigl(1,\\ \\bigl\\lceil \\tfrac{1}{2}\\max(2, H_{\\max}) \\bigr\\rceil\\bigr), \\qquad F = \\tfrac{1}{2}\\,\\mathrm{clamp}\\bigl(H,\\, 0,\\, \\max(2, H_{\\max})\\bigr)',
            displayMode: true,
            caption: '_heart_count and _paint_heart_strip in src/ludoxel/presentation/interface/hud/ai_status_tags.py: the strip draws N hearts at one heart per two maximum-health points, and the fractional fill F lets a heart render half-full.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Heart count is half of maximum health, and fill is proportional.',
            code: `def _heart_count(max_health):
  return max(1, int(math.ceil(max(2.0, float(max_health)) * 0.5)))


def _paint_heart_strip(painter, *, x, y, health, max_health):
  next_max = max(2.0, float(max_health))
  filled_hearts = float(clampf(float(health), 0.0, float(next_max))) * 0.5`,
          },
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-composite',
        title: 'The Tag Is One Composite Image',
        body: [
          'The name and hearts form one base pixmap. The composite is rebuilt only when the content key — name, health, max health, indicator, and route-owner name color — changes, leaving an unchanged tag outside the redraw path.',
          'A stationary AI’s tag therefore costs almost nothing per frame: the composite image is cached, and only geometry or opacity changes trigger an update.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The composite is rebuilt only when the content key changes.',
            code: `content_key = (text, round(float(next_health), 6), round(float(next_max), 6), str(mode), str(name_color))
if content_key != self._content_key:
  self._content_key = content_key
  self._rebuild_base_pixmap(name=text, health=float(next_health), max_health=float(next_max), indicator=str(mode), name_color_hex=str(name_color))
  self._content_dirty = True`,
          },
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-distance-scale',
        title: 'Distance Scales the Whole Tag',
        body: [
          'When a tag is placed, a scale derived from the camera-to-AI distance is applied to the entire composite, so the name, hearts, padding, and spacing all shrink together with distance. The tag is also clamped to stay within the viewport margins.',
          'A far AI therefore shows a small but complete tag, and a near AI a large one, with the same layout at every distance.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The display size scales the composite by the distance factor.',
            code: `self._display_scale = max(0.05, float(scale))
display_w = max(1, int(round(float(self._base_pixmap.width()) * float(self._display_scale))))
display_h = max(1, int(round(float(self._base_pixmap.height()) * float(self._display_scale))))`,
          },
        ],
      },
      {
        id: 'reading-ai-nametags-and-health-display-only',
        title: 'The Tag Reflects State, It Does Not Decide It',
        body: [
          'The tag receives the AI’s name, health, and indicator for display. It does not decide whether the AI is damaged, defeated, regenerating, or allowed to attack; those are combat and manager decisions in the simulation.',
          'So a tag is evidence of current AI state, not a control over it. A wrong heart count is a display question, while a wrong health value is a simulation question.',
        ],
      },
    ],
    relatedTitles: ['Spawning AI NPCs', 'Understanding AI Combat', 'Understanding Render Snapshots'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Actions',
    title: 'Understanding AI Combat',
    description: 'Describes how aggressive AI fights: it turns toward the target, closes distance, strafes, and times short engagement taps, then applies melee damage with a cooldown and knockback. Peaceful AI avoids the combat role, and damage and defeat are resolved in simulation state.',
    sections: [
      {
        id: 'understanding-ai-combat-personality-gate',
        title: 'Only Aggressive AI Fights',
        body: [
          'Combat is a personality role. Aggressive AI pursues and attacks when conditions allow; peaceful AI does not take on the combat role at all. This gate is independent of behavior mode, so a peaceful wandering or routing AI will not engage.',
          'Visibility, distance, cooldown, health, route state, and movement drive the decision to fight through simulation state.',
        ],
      },
      {
        id: 'understanding-ai-combat-turn-toward',
        title: 'Combat Starts by Facing the Target',
        body: [
          'The combat controller first turns the AI toward the target, producing yaw and pitch deltas and the remaining yaw error and horizontal distance. How much the AI moves forward depends on how closely it is already facing the target.',
          'A large yaw error reduces or stops forward movement so the AI lines up before committing, while a small error lets it advance at full speed. This keeps the AI from charging in the wrong direction.',
        ],
        mathBlocks: [
          {
            expression: '\\mathrm{move}_f(\\varepsilon) = \\begin{cases} 1.00 & \\varepsilon \\le 12^{\\circ} \\\\[1pt] 0.85 & 12^{\\circ} < \\varepsilon \\le 24^{\\circ} \\\\[1pt] 0.45 & 24^{\\circ} < \\varepsilon \\le 42^{\\circ} \\\\[1pt] 0.00 & \\varepsilon > 42^{\\circ} \\end{cases}',
            displayMode: true,
            caption: 'The combat controller in src/ludoxel/simulation/actors/ai_players/combat.py gates the forward component on the absolute yaw error ε = |abs_error_deg|, so the actor only commits full speed once it is nearly aligned.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Forward speed depends on how well the AI faces the target.',
            code: `if float(abs_error_deg) <= 12.0:
  move_f = 1.0
elif float(abs_error_deg) <= 24.0:
  move_f = 0.85
elif float(abs_error_deg) <= 42.0:
  move_f = 0.45
else:
  move_f = 0.0`,
          },
        ],
      },
      {
        id: 'understanding-ai-combat-strafe',
        title: 'It Strafes Within a Distance Window',
        body: [
          'When a strafe timer is active and the AI is within a distance window and roughly facing the target, it adds a sideways component in the current strafe direction. The control vector yields lateral combat movement.',
          'The strafe is bounded by the distance window, so it only happens at engagement range, not while closing from far away or when already on top of the target.',
        ],
        mathBlocks: [
          {
            expression: 's = \\begin{cases} \\sigma\\,M & \\tau_s > 0 \\;\\wedge\\; d_{xz} \\in [d_{\\min}, d_{\\max}] \\;\\wedge\\; \\varepsilon \\le 18^{\\circ} \\\\[2pt] 0 & \\text{otherwise} \\end{cases}, \\quad d_{\\min}=1.45,\\ d_{\\max}=2.75,\\ M=0.18',
            displayMode: true,
            caption: 'src/ludoxel/simulation/actors/ai_players/combat.py with constants from runtime.py: the strafe magnitude M is signed by σ = sign(combat_strafe_sign) and admitted only inside the [d_min, d_max] window while a strafe timer τ_s is active and the yaw error ε stays small.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Strafing is gated by an active timer and the distance window.',
            code: `strafe = 0.0
if (float(actor.combat_strafe_timer_s) > 1e-6
    and float(distance_xz) >= float(_AI_COMBAT_STRAFE_DISTANCE_MIN)
    and float(distance_xz) <= float(_AI_COMBAT_STRAFE_DISTANCE_MAX)
    and float(abs_error_deg) <= 18.0):
  strafe = float(_AI_COMBAT_STRAFE_MAG) * (1.0 if int(actor.combat_strafe_sign) >= 0 else -1.0)`,
          },
        ],
      },
      {
        id: 'understanding-ai-combat-w-tap',
        title: 'Close Range Uses Engagement Taps',
        body: [
          'At very close range and roughly facing the target, the AI uses a short forward-tap pattern, alternating between engaging and easing off based on a tap timer. That control cycle produces hit-and-reposition movement.',
          'The tap phase decides whether the AI sprints in or holds, which shapes the rhythm of a melee exchange.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A tap timer drives close-range engagement.',
            code: `if float(actor.combat_w_tap_s) > 1e-6 and float(distance_xz) <= 2.85 and float(abs_error_deg) <= 18.0:
  engage_ratio = 0.0 if float(actor.combat_w_tap_s) > float(_AI_COMBAT_W_TAP_S) * 0.5 else 1.0
  return PlayerStepInput(move_f=float(engage_ratio), move_s=float(strafe), sprint=bool(engage_ratio > 0.5), ...)`,
          },
        ],
      },
      {
        id: 'understanding-ai-combat-melee-damage',
        title: 'Melee Damage Has a Cooldown',
        body: [
          'A landed melee hit applies damage through the target’s health with a damage cooldown, so repeated contact does not deal damage every frame. The same path is shared by player and AI, so an AI hitting the player and the player hitting an AI use one rule.',
          'Each landed hit starts the half-second `MELEE_DAMAGE_COOLDOWN_S`. The cooldown fixes the damage cadence during overlapping combat bodies.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Melee damage is one point with a half-second cooldown.',
            code: `MELEE_ATTACK_DAMAGE = 1.0
MELEE_DAMAGE_COOLDOWN_S = 0.50
MELEE_HURT_FLASH_S = 0.50
MELEE_HURT_TILT_S = 0.18`,
          },
        ],
      },
      {
        id: 'understanding-ai-combat-knockback',
        title: 'Hits Apply Knockback',
        body: [
          'A successful hit applies knockback to the target along the attack direction, with a sprint bonus and a vertical component when the target is grounded. A sprinting attacker also keeps part of its own horizontal speed, which is the basis of sprint-hit behavior.',
          'Knockback only follows a hit that dealt damage, so a blocked or cooldown-suppressed contact does not push the target.',
        ],
        mathBlocks: [
          {
            expression: '\\begin{aligned} s_{kb} &= v_h + [\\,\\mathrm{sprint}\\,]\\,v_h^{+} \\\\[2pt] (v_x, v_z) &= \\tfrac{1}{2}\\,(v_x^{t}, v_z^{t}) + s_{kb}\\,\\hat{\\mathbf{h}} \\\\[2pt] v_y &= \\min\\!\\bigl(v_v,\\ \\max(0,\\ \\tfrac{1}{2} v_y^{t}) + v_v\\bigr) \\end{aligned}',
            displayMode: true,
            caption:
              'apply_melee_knockback in src/ludoxel/simulation/actors/player/damage.py: ĥ is the normalized horizontal attack direction, the target keeps half its prior velocity, the horizontal push is v_h = 8.0 with a sprint bonus v_h⁺ = 10.0 (0.40 and 0.50 times the 20 Hz tick base), and the vertical push v_v = 8.0 applies only when the target is grounded.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Knockback is applied only after damage is dealt.',
            code: `def apply_melee_damage(*, attacker, target, attack_direction, sprinting, damage=MELEE_ATTACK_DAMAGE):
  damage_taken = target.apply_damage(float(damage), cooldown_s=float(MELEE_DAMAGE_COOLDOWN_S), source_position=attacker.eye_pos(), ...)
  if float(damage_taken) <= 1e-6:
    return 0.0
  apply_melee_knockback(attacker=attacker, target=target, attack_direction=attack_direction, sprinting=bool(sprinting))
  return float(damage_taken)`,
          },
        ],
      },
      {
        id: 'understanding-ai-combat-regen-and-defeat',
        title: 'Health, Regeneration, and Defeat Are Simulation State',
        body: [
          'AI health can regenerate when auto-regeneration is enabled, after a delay since the last damage and at a fixed interval up to a cap. Taking damage resets the regeneration wait, and a defeated AI is removed by the manager after it emits an AI death-log event with the actor name and cause.',
          'All of this is resolved in the session step or in the direct player-attack path. The renderer shows the AI’s health and removes its tag when it is gone, while chat records the terminal event through the same death-log message kind used for player deaths. Combat outcomes are decided in the simulation, not by the display.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Auto-regeneration waits after damage, then ticks up to a cap.',
            code: `actor.regen_wait_s = float(actor.regen_wait_s) + max(0.0, float(dt))
if not bool(actor.auto_regen_enabled):
  actor.regen_tick_s = 0.0
  return
cap = min(float(actor.regen_cap_hp), float(actor.player.max_health))
if float(actor.regen_wait_s) < float(actor.regen_start_delay_s):
  actor.regen_tick_s = 0.0
  return`,
          },
        ],
      },
    ],
    relatedTitles: ['Reading AI Nametags and Health', 'Changing AI Behavior Values', 'Understanding AI Action Selection'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'AI NPC Combat',
    group: 'NPC Actions',
    title: 'Understanding AI Placement Behavior',
    description:
      'Defines AI block placement as a constrained movement aid. Placement supports bridging and footing during navigation, requires the actor to face the target column with an unobstructed line of sight, requires item state, support, clear collision, and an action mask, and is gated by a per-AI placement permission.',
    sections: [
      {
        id: 'understanding-ai-placement-behavior-movement-aid',
        title: 'Placement Serves Navigation',
        body: [
          'AI placement exists to help the AI move: bridging gaps, securing the next footing, escaping a boxed-in position, recovering a route, and defensive placement. The placement owner admits those movement and defense cases only; general construction and decorative self-directed placement stay outside the permission check.',
          'Because placement is tied to navigation, an AI only builds when its movement plan calls for it, which keeps placement purposeful and limited.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-permission',
        title: 'A Per-AI Toggle Enables the Aid',
        body: [
          'Each AI has a can-place-blocks setting. When it is off, the placement aids are unavailable; when it is on, the AI may use them during navigation. Toggling it on or off changes the held item the AI carries for placement.',
          'The placement-aid toggle controls aid availability. Route selection, combat selection, and learned-policy evaluation continue through their respective manager paths, while `InteractionService` applies the shared world-placement predicates to every accepted action.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The held item for placement follows the placement permission.',
            code: `def _held_item_id_for_settings(*, can_place_blocks, held_item_id=None):
  if not bool(can_place_blocks):
    return None
  normalized = None if held_item_id is None else str(held_item_id).strip()
  return str(normalized) if normalized else str(AI_DEFAULT_HELD_ITEM_ID)`,
          },
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-same-rules',
        title: 'AI Placement Uses the Same World Rules',
        body: [
          'An AI places through its own interaction service, the same machinery the player uses. So an AI placement is subject to the same checks: a registered item, an empty or mergeable cell, sufficient support, and no intersection with a body. There is no AI-only placement path that bypasses these.',
          'Because the AI shares the player’s interaction service, its placement behaves consistently with player placement and cannot create blocks the player rules would reject.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Each AI actor owns a standard interaction service.',
            code: `interaction = InteractionService.create(world=self.world, player=player, block_registry=self.block_registry)`,
          },
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-face-targeting',
        title: 'Bridge Placement Targets a Face',
        body: [
          'When the AI bridges, it derives the face to build against from its horizontal step direction and computes a hit point on that face. The mapping supplies a target cell and face along the direction of travel.',
          'The face-from-step mapping is deterministic, so the AI consistently places footing ahead of itself along its movement direction.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The build face is derived from the horizontal step direction.',
            code: `def _face_for_horizontal_step(step_x, step_z):
  if int(step_x) > 0:
    return int(FACE_POS_X)
  if int(step_x) < 0:
    return int(FACE_NEG_X)
  if int(step_z) > 0:
    return int(FACE_POS_Z)
  return int(FACE_NEG_Z)`,
          },
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-preconditions',
        title: 'Placement Has Preconditions',
        body: [
          'A bridge placement is only attempted when the preconditions hold: the actor must face the target column within a horizontal tolerance and hold an unobstructed line of sight to the target cell, alongside an available item, support, clear collision, and an action mask that permits the placement. Forward movement can wait until a footing exists before continuing.',
          'The planner may select a candidate cell, but the final mutation re-checks it: `_placement_ray_clear` compares the actor view direction against the direction to the target face through `_AI_PLACEMENT_FACING_MIN_DOT` and then casts the occlusion ray, so a candidate is refused when the actor has turned away from the face or a block stands between the actor and the anchor.',
          'When those preconditions are unmet, the AI pauses at an edge until a placement becomes valid, then steps forward.',
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-edge-safety',
        title: 'Edge Safety Stops Self-Destructive Steps',
        body: [
          'Grounded AI movement runs an edge-safety check that halts a forward step if there is no landing within a safe drop depth, leaving only turning. The check stops the AI from walking itself into the void, and the halted step is what opens the opportunity for bridge placement.',
          'When the AI is stopped by edge safety, building a bridge footing is one way for it to make the next step safe.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Edge safety halts an unsafe forward step to turning only.',
            code: `def _apply_edge_safety(self, actor, control, *, max_drop):
  if bool(actor.player.flying) or (not bool(actor.player.on_ground)):
    return (control, False)
  if bool(control.jump_pressed):
    return (control, False)
  direction = self._intended_move_direction_xz(actor, control)
  if direction is None:
    return (control, False)
  if self._forward_step_safe(actor, direction=direction, max_drop=int(max_drop)):
    return (control, False)
  return (self._halted_control(control), True)`,
          },
        ],
      },
      {
        id: 'understanding-ai-placement-behavior-no-bypass',
        title: 'Learned Policies Do Not Bypass Placement Rules',
        body: [
          'A learned policy can change how the AI ranks actions, but it cannot make a placement that the world rules reject. Action masks and placement preconditions still apply after policy evaluation, so the final placed block always satisfies the same checks.',
          'Because action masks and placement preconditions apply after policy evaluation, AI building stays bounded regardless of behavior mode or learning: the placement rules are the floor that every AI action path stands on.',
        ],
      },
    ],
    relatedTitles: ['Reading Placement Rejection', 'Understanding AI Action Selection', 'Applying a Learned Policy'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Turns',
    title: 'Starting an Othello Match',
    description: 'Explains the state initialized for a playable Othello match: the controller builds the standard four-disc opening, assigns sides from settings, sets the clocks, and resolves the first turn so legal moves are ready. Othello is its own play space with its own persisted state.',
    sections: [
      {
        id: 'starting-an-othello-match-initial-board',
        title: 'The Board Starts With Four Discs',
        body: [
          'A new match begins from the standard Othello opening: four discs in the center, two black and two white on opposing diagonals of the four central squares. The board is sixty-four cells, each empty, black, or white.',
          'The Othello initializer seeds every match with the same fixed opening. Rule functions derive legal moves, captures, and turn order from that board state.',
        ],
        mathBlocks: [
          {
            expression: 'i = S\\,r + c, \\qquad (r, c) = \\bigl(\\lfloor i / S \\rfloor,\\ i \\bmod S\\bigr), \\qquad S = \\sqrt{64} = 8',
            displayMode: true,
            caption: 'row_col_to_index and index_to_row_col in src/ludoxel/simulation/spaces/othello/game/board.py flatten the 8×8 grid (S = BOARD_SIZE = isqrt(BOARD_CELL_COUNT)); the opening sets indices (3,3) and (4,4) white and (3,4) and (4,3) black.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The initial board places the four central discs.',
            code: `def create_initial_board() -> tuple[int, ...]:
  board = [SIDE_EMPTY] * BOARD_CELL_COUNT
  board[row_col_to_index(3, 3)] = SIDE_WHITE
  board[row_col_to_index(3, 4)] = SIDE_BLACK
  board[row_col_to_index(4, 3)] = SIDE_BLACK
  board[row_col_to_index(4, 4)] = SIDE_WHITE
  return tuple(board)`,
          },
        ],
      },
      {
        id: 'starting-an-othello-match-controller',
        title: 'The Controller Constructs the Match',
        body: [
          'Starting a match builds the game state from the default settings: the initial board, the player and AI sides, the clocks, and a fresh match generation. It then immediately resolves the first turn so the state is never left without legal moves.',
          'The controller is the single owner of match transitions. Board evolution, clock updates, the pass rule, and animation settlement are all expressed as transformations of one normalized state.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Starting a match builds state then resolves the first turn.',
            code: `self._state = OthelloGameState(
  status=OTHELLO_GAME_STATE_IDLE,
  board=create_initial_board(),
  settings=settings,
  player_side=player_side,
  ai_side=ai_side,
  current_turn=int(SIDE_BLACK),
  black_time_remaining_s=time_limit_s,
  white_time_remaining_s=time_limit_s,
  match_generation=int(self._state.match_generation) + 1,
).normalized()
self._state = self._resolve_turn_transition(message_prefix="Match started.", reset_per_move_timer=True)`,
          },
        ],
      },
      {
        id: 'starting-an-othello-match-sides',
        title: 'Black Moves First, Sides Come From Settings',
        body: [
          'Black always moves first. The player side is taken from settings, and the AI takes the other side. So choosing to play white means the AI moves first as black, and the first turn the controller resolves reflects that.',
          'The side assignment is normalized, so an invalid stored side resolves to a valid one, and the player and AI sides are always opposites.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The player side comes from settings; the AI takes the other.',
            code: `settings = self._default_settings.normalized()
player_side = int(settings.player_side)
ai_side = int(other_side(player_side))
current_turn = int(SIDE_BLACK)`,
          },
        ],
      },
      {
        id: 'starting-an-othello-match-settings',
        title: 'Match Settings Configure Difficulty and Clocks',
        body: [
          'The match draws its difficulty, time control, disc animation mode, player side, engine thread count, hash level, sacrifice level, and book-learning thresholds from normalized Othello settings. These determine how the AI plays and how the clocks behave during the match.',
          'Settings are normalized before the match uses them, so out-of-range values are clamped and the match always starts from a valid configuration.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Difficulty levels and time controls are part of normalized settings.',
            code: `OTHELLO_DIFFICULTIES  # weak, medium, strong, insane, insane_plus
OTHELLO_TIME_CONTROLS  # off, per-move 5s/10s/30s, per-side 1m/3m/5m/10m/20m`,
          },
        ],
      },
      {
        id: 'starting-an-othello-match-first-turn',
        title: 'The First Turn Publishes Legal Moves',
        body: [
          'Resolving the turn transition computes the legal moves for the side to move and sets the status to player-turn or AI-turn accordingly. If the side to move cannot play, the transition handles the pass; this is the same machinery used after every move.',
          'After this resolution the match is ready: the status tells whose turn it is, and the legal-move set tells which squares are playable.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The turn transition publishes legal moves and the turn status.',
            code: `current_side = int(state.current_turn)
legal_moves = find_legal_moves(state.board, current_side)
if legal_moves:
  next_status = _turn_status_for_player_side(state.player_side, current_side)
  next_state = replace(state, status=next_status, legal_moves=tuple(legal_moves), thinking=False, ...)`,
          },
        ],
      },
      {
        id: 'starting-an-othello-match-own-space',
        title: 'Othello Is a Separate Play Space',
        body: [
          'Othello has its own persisted space holding the board, match, world, player, and AI data. It does not reuse My World block-building rules for legal disc moves, and switching play spaces does not merge the two.',
          'So an Othello result, board, or clock comes from the Othello schema and controller, not from anything in the My World session. The two spaces only meet at the application aggregate.',
        ],
      },
    ],
    relatedTitles: ['Placing an Othello Move', 'Changing Match Rules', 'Changing Othello AI Strength'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Turns',
    title: 'Placing an Othello Move',
    description: 'Explains how a player move is accepted on the board: it must be the player turn and a legal square, the move flips captured lines in the eight directions, and the controller then schedules flip animations and advances the turn, pass, or finished state.',
    sections: [
      {
        id: 'placing-an-othello-move-gate',
        title: 'A Move Is Accepted Only on a Legal Square',
        body: [
          'A player move is accepted only while the status is player-turn and the chosen square is in the published legal-move set. The same predicate that authorizes a click is the one the submit path checks, so an illegal or out-of-turn click changes nothing.',
          '`can_player_move` decides legality from the published legal-move set. An empty square without a flipping move leaves the board unchanged.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The same legality check authorizes and applies the move.',
            code: `def can_player_move(self, square_index: int) -> bool:
  state = self._state.normalized()
  return bool(state.status == OTHELLO_GAME_STATE_PLAYER_TURN and int(square_index) in set(state.legal_moves))

def submit_player_move(self, square_index: int) -> bool:
  state = self._state.normalized()
  if state.status != OTHELLO_GAME_STATE_PLAYER_TURN:
    return False
  if int(square_index) not in set(state.legal_moves):
    return False
  self._apply_turn_move(side=state.player_side, square_index=int(square_index))
  return True`,
          },
        ],
      },
      {
        id: 'placing-an-othello-move-legal-moves',
        title: 'Legal Moves Are Squares That Capture',
        body: [
          'A square is legal only if placing there captures at least one opposing line. The rule engine scans the eight directions from an empty square, collecting opposing discs until it meets one of its own, and a move with no captures is illegal.',
          '`legal_moves` in the Othello rule path admits a square only when its directional scan yields at least one flanked opposing disc. Empty squares without a capture line remain outside the published legal-move set.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Captures are collected in each of the eight directions.',
            code: `def captures_for_move(board, *, side, index):
  norm_side = normalize_side(side)
  if norm_side not in (SIDE_BLACK, SIDE_WHITE):
    return ()
  materialized = coerce_board(board)
  if materialized[int(index)] != SIDE_EMPTY:
    return ()
  row, col = index_to_row_col(int(index))
  captured = []
  for d_row, d_col in _DIRECTIONS:
    captured.extend(_captures_in_direction(materialized, side=norm_side, row=row, col=col, d_row=d_row, d_col=d_col))
  return tuple(captured)`,
          },
        ],
      },
      {
        id: 'placing-an-othello-move-apply',
        title: 'Applying a Move Flips the Captured Lines',
        body: [
          'Applying a move places the disc and flips every captured square to the mover’s color. The rule engine rejects a move that flips nothing, so by the time apply runs, the captures are known and the board update is deterministic.',
          'The result is a new board plus the exact set of flipped squares, which the controller uses both to update state and to drive the flip animation.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Apply places the disc and flips the captured squares.',
            code: `def apply_move(board, *, side, index):
  captured = captures_for_move(board, side=side, index=index)
  if not captured:
    raise ValueError("The requested Othello move is illegal because it flips no opposing discs.")
  materialized = list(coerce_board(board))
  materialized[int(index)] = normalize_side(side)
  for captured_index in captured:
    materialized[int(captured_index)] = normalize_side(side)
  return (tuple(materialized[:BOARD_CELL_COUNT]), tuple(captured))`,
          },
        ],
      },
      {
        id: 'placing-an-othello-move-animation',
        title: 'Flips Ripple Outward From the Placed Disc',
        body: [
          'The controller orders the flipped squares by distance from the placed disc and assigns each a staggered start delay based on the animation mode. This produces a ripple from the placed disc outward, with the fast and slow modes using different spacing and the off mode using none.',
          'While animations are pending, the match status is animating, and the turn does not advance until they settle.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Flipped squares get staggered delays by animation mode.',
            code: `def _animation_start_delay_s(*, mode, flip_order_index):
  normalized_mode = normalize_animation_mode(mode)
  order_index = max(0, int(flip_order_index))
  if normalized_mode == OTHELLO_ANIMATION_SLOW:
    return float(order_index) * float(_ANIMATION_SLOW_STEP_S)
  if normalized_mode == OTHELLO_ANIMATION_FAST:
    return float(order_index) * float(_ANIMATION_FAST_STEP_S)
  return 0.0`,
          },
        ],
      },
      {
        id: 'placing-an-othello-move-advance',
        title: 'The Turn Advances After the Move Settles',
        body: [
          'After a move (and any animation), the controller inverts the turn and resolves the next transition: it publishes the next side’s legal moves, handles a pass when a side cannot move, or finishes the match when neither side can. The move count increments and the consecutive-pass count resets on a real move.',
          'Placing a move therefore drives the whole turn machine forward to the next playable state, reaching past the board change into turn inversion, legal-move publication, pass handling, and match settlement.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A move inverts the turn and schedules the transition.',
            code: `updated = replace(state, board=next_board, current_turn=other_side(side), move_count=int(state.move_count) + 1, consecutive_passes=0, last_move_index=int(square_index), animations=animations, status=OTHELLO_GAME_STATE_ANIMATING if animations else OTHELLO_GAME_STATE_IDLE, legal_moves=()).normalized()
self._state = updated
if not animations:
  self._state = self._resolve_turn_transition(message_prefix="Move applied.", reset_per_move_timer=True)`,
          },
        ],
      },
      {
        id: 'placing-an-othello-move-highlight',
        title: 'A Square Highlight Is Not Permission',
        body: [
          'The renderer and viewport help locate the selected board square, but the controller decides legality. A visible highlight on a square does not by itself grant a move; the submit path still checks the turn and the legal-move set.',
          'A highlighted square whose move is rejected reflects the controller’s turn or legality decision. The match state supplies that decision.',
        ],
      },
    ],
    relatedTitles: ['Starting an Othello Match', 'Reading Match Results', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Outcomes',
    title: 'Understanding Othello AI Turns',
    description: 'Describes how the AI move is chosen and applied: on an AI turn the controller requests a move from the configured engine, applies it through the same move rule as a player, and falls back to a legal move if the engine result is missing or illegal so the state stays valid.',
    sections: [
      {
        id: 'understanding-othello-ai-turns-request',
        title: 'An AI Turn Requests a Move From the Engine',
        body: [
          'When the status becomes AI-turn, the controller marks itself thinking and requests a move from the configured engine using the current board, difficulty, time budget, and book settings. The request is asynchronous, and the thinking flag is what the HUD and scheduler read.',
          'The engine choice and strength come from the match settings, so the same board can be played differently depending on difficulty and book configuration.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The thinking flag marks an in-progress AI request.',
            code: `def set_ai_thinking(self, thinking: bool) -> None:
  self._state = replace(self._state, thinking=bool(thinking)).normalized()`,
          },
        ],
      },
      {
        id: 'understanding-othello-ai-turns-submit',
        title: 'The AI Move Is Applied Like a Player Move',
        body: [
          'When the engine returns, the controller applies the AI move only while the status is AI-turn, using the same board apply rule as a player move. So an AI move flips captured lines and advances the turn exactly as a player move does.',
          'Because the AI move runs through the same board apply rule as a player move, the AI cannot make a move the rules would reject; it is bound by the same legality as the player.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'AI submission applies through the same turn-move path.',
            code: `def submit_ai_move(self, square_index):
  state = self._state.normalized()
  if state.status != OTHELLO_GAME_STATE_AI_TURN:
    return False
  legal = tuple(state.legal_moves)
  if not legal:
    self._state = replace(state, thinking=False).normalized()
    self._state = self._resolve_turn_transition(message_prefix="AI had no legal move.", reset_per_move_timer=True)
    return False
  move_index = legal[0] if square_index is None else int(square_index)
  if move_index not in set(legal):
    move_index = int(legal[0])
  self._apply_turn_move(side=state.ai_side, square_index=int(move_index))
  return True`,
          },
        ],
      },
      {
        id: 'understanding-othello-ai-turns-fallback',
        title: 'A Missing or Illegal Move Falls Back',
        body: [
          'If the engine returns nothing or an illegal square, the controller uses the first legal move instead. This keeps an asynchronous or failed engine result from leaving the state machine undefined or corrupting the board.',
          'An engine problem routes to the first legal move or a pass. The match advances with a valid board state.',
        ],
      },
      {
        id: 'understanding-othello-ai-turns-no-legal',
        title: 'No Legal Move Triggers a Pass',
        body: [
          'If the AI has no legal move, the controller resolves the transition, which passes to the other side. The pass logic is shared with player turns: a side that cannot move passes, the consecutive-pass count increases, and the other side plays.',
          'A pass keeps the match moving: the rules hand the turn to a side that can still move, and a second consecutive pass becomes the path toward a finished state when both sides are stuck.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'When the current side cannot move, the other side is tried.',
            code: `other = int(other_side(current_side))
other_legal_moves = find_legal_moves(state.board, other)
if other_legal_moves:
  next_status = _turn_status_for_player_side(state.player_side, other)
  next_state = replace(state, current_turn=other, legal_moves=tuple(other_legal_moves), consecutive_passes=min(2, int(state.consecutive_passes) + 1), status=next_status, message=f"{message_prefix} {side_name(current_side).title()} must pass.")`,
          },
        ],
      },
      {
        id: 'understanding-othello-ai-turns-clocks',
        title: 'Clocks Run Only During Turn States',
        body: [
          'During a player or AI turn with a finite time control, the controller subtracts elapsed time from the active side’s clock each tick. If a side’s clock reaches zero, the match finishes with the other side as the winner. Per-move controls reset the active clock on each turn.',
          'So an AI turn that takes time consumes the AI’s clock, and a timeout is a real way for a match to end, separate from running out of moves.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A clock reaching zero finishes the match for the other side.',
            code: `if (timed_state.current_turn == SIDE_BLACK and black_time is not None and black_time <= 1e-9) or (timed_state.current_turn == SIDE_WHITE and white_time is not None and white_time <= 1e-9):
  winner = side_name(other_side(timed_state.current_turn))
  self._state = replace(timed_state, status=OTHELLO_GAME_STATE_FINISHED, legal_moves=(), winner=winner, message=f"{side_name(timed_state.current_turn).title()} ran out of time.").normalized()`,
          },
        ],
      },
      {
        id: 'understanding-othello-ai-turns-state-then-render',
        title: 'State Updates First, the View Follows',
        body: [
          'The chosen AI move updates discs, clocks, messages, legal moves, and optional animation in the match state. Renderer output follows that updated state; the board you see is a projection of the controller’s state, not an independent record.',
          'So an AI move that looks wrong on screen is read from the match state, and the state — not the renderer — is where the move was decided.',
        ],
      },
    ],
    relatedTitles: ['Changing Othello AI Strength', 'Changing Othello Book Behavior', 'Understanding Othello Search'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Othello Play',
    group: 'Match Outcomes',
    title: 'Reading Match Results',
    description: 'Explains how an Othello result is determined: the match finishes when neither side can move or a clock runs out, the winner is decided by disc counts with ties producing a draw, and the controller records the status, winner, message, and counts in the saved state.',
    sections: [
      {
        id: 'reading-match-results-terminal',
        title: 'A Match Finishes When Neither Side Can Move',
        body: [
          'When the side to move has no legal moves, the controller tries the other side; if that side also cannot move, the match is finished. This double-pass condition is the normal way an Othello game ends, independent of the board being full.',
          'So a match can end with empty squares remaining, simply because no legal capturing move exists for either side.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'When neither side can move, the match finishes.',
            code: `winner = winner_for_board(state.board)
black, white = counts_for_board(state.board)
message = f"{message_prefix} Match finished. Black {int(black)} - White {int(white)}."
self._state = replace(state, status=OTHELLO_GAME_STATE_FINISHED, legal_moves=(), winner=winner, thinking=False, animations=(), message=message).normalized()`,
          },
        ],
      },
      {
        id: 'reading-match-results-winner',
        title: 'The Winner Is Decided by Disc Count',
        body: [
          'The winner is whichever color has more discs in the final position. The rule counts black and white and returns the side with the higher count, or a draw when they are equal. There is no preference tiebreak; an equal count is a draw.',
          'So a result reflects the final board, and reading it means comparing the two disc counts, which the finished message also reports.',
        ],
        mathBlocks: [
          {
            expression: 'B = \\bigl|\\{\\, i : \\mathrm{board}[i] = \\mathrm{black} \\,\\}\\bigr|, \\quad W = \\bigl|\\{\\, i : \\mathrm{board}[i] = \\mathrm{white} \\,\\}\\bigr|, \\qquad w = \\begin{cases} \\mathrm{black} & B > W \\\\[1pt] \\mathrm{white} & W > B \\\\[1pt] \\mathrm{draw} & B = W \\end{cases}',
            displayMode: true,
            caption: 'winner_for_board over counts_for_board in src/ludoxel/simulation/spaces/othello/game/board.py decides the result purely by disc tally with no positional tiebreak, so an equal count is a draw.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A higher disc count wins; an equal count draws.',
            code: `def winner_for_board(board):
  black, white = counts_for_board(board)
  if black > white:
    return "black"
  if white > black:
    return "white"
  return OTHELLO_WINNER_DRAW`,
          },
        ],
      },
      {
        id: 'reading-match-results-timeout',
        title: 'A Clock Timeout Ends the Match Too',
        body: [
          'A finite time control gives another terminal path: if the active side’s clock reaches zero during its turn, the match finishes with the other side as the winner, regardless of disc counts. The message states which side ran out of time.',
          'A timeout is a terminal result separate from a disc-count finish. The winner field and message record the terminal cause; the final board alone cannot identify it.',
        ],
      },
      {
        id: 'reading-match-results-recorded-fields',
        title: 'The Result Is Recorded in State',
        body: [
          'A finished match records its status, winner, descriptive message, and move count while clearing legal moves and animations. The normalized game state carries the outcome as explicit data.',
          'Reading a result therefore means reading these fields, not re-deriving the winner from a screenshot of the board.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The finished state clears transient fields and keeps the result.',
            code: `if normalized.status == OTHELLO_GAME_STATE_FINISHED:
  return replace(normalized, legal_moves=(), thinking=False, animations=()).normalized()`,
          },
        ],
      },
      {
        id: 'reading-match-results-counts',
        title: 'Disc Counts Come From the Board',
        body: [
          'The black and white counts are computed by scanning the sixty-four cells and tallying each color. The finished message embeds these counts, so the score shown is exactly the board tally, not a separate running total.',
          'Because counts are derived from the board, they always agree with the visible discs in the final position.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Counts are a direct tally of the board cells.',
            code: `def counts_for_board(board):
  black = 0
  white = 0
  for value in coerce_board(board):
    side = normalize_side(value)
    if side == SIDE_BLACK:
      black += 1
    elif side == SIDE_WHITE:
      white += 1
  return (int(black), int(white))`,
          },
        ],
      },
      {
        id: 'reading-match-results-saved-state',
        title: 'A Saved Result Goes Through the Othello Schema',
        body: [
          'Saved Othello state includes the board, settings, clocks, legal-move state, animations, and message, and a finished match restores as finished with its result intact. Reading a result from a save should go through the Othello state schema, which coerces partial or old payloads back to a valid finished state.',
          'The Othello-space schema persists the result separately from My World data, and the controller restores it through its coercion path.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Loading reconciles a finished state to a clean terminal form.',
            code: `if normalized.status == OTHELLO_GAME_STATE_FINISHED:
  return replace(normalized, legal_moves=(), thinking=False, animations=()).normalized()`,
          },
        ],
      },
    ],
    relatedTitles: ['Placing an Othello Move', 'Reading Saved Othello State', 'Understanding Othello Setting Persistence'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'Chat Commands',
    group: 'Player Commands',
    title: 'Using Teleport and Game Mode Commands',
    description: 'Defines what the /teleport and /tp aliases and the /gamemode chat command change in player and game state, how teleport moves the local player in My World and the Othello play space, how facing resolves a look direction, and how game mode applies through the shared simulation operation.',
    sections: [
      {
        id: 'commands-teleport-effect',
        title: 'Teleport Moves the Local Player Coordinate',
        content: [
          {
            kind: 'paragraph',
            text: 'The `/teleport` command accepts `/teleport <x> <y> <z>` with an optional trailing `chunkForBlocks` boolean, an optional `facing <x y z>` position, and an optional `facing <target>` entity. `/tp` is an alias for the same parser and execution route, so its argument structure, finite-coordinate validation, target resolution, relative execution state, feedback, and errors are identical. The default for `chunkForBlocks` is false. The command moves the local player; in this version it does not move other players. It applies in My World and in the Othello play space, because both sessions hold a player whose position drives the camera. It is a coordinate move of the player and the camera; it leaves Othello board state and disc placement unchanged.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'The coordinator parses the coordinates and the optional facing and chunkForBlocks arguments.',
              'SessionManager.teleport delegates the player change to teleport_player in the simulation layer.',
              'teleport_player sets the position, zeroes velocity, and resets on-ground, step, crouch, auto-jump, and overlap state.',
              'The session resets the player motion and void-damage tracking so prior fall distance does not carry over.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'When `facing <x y z>` or `facing <target>` is present, the look direction is computed from the destination eye toward the resolved point through `yaw_pitch_deg_from_forward`, and an entity target that cannot be resolved produces a command error. A true `chunkForBlocks` arms a world-upload sync around the destination through the existing frame-sync path; generation has already materialized world data, so this prepares the destination rendering and upload only.',
          },
        ],
      },
      {
        id: 'commands-gamemode-effect',
        title: 'Game Mode Applies Through the Shared Operation',
        content: [
          {
            kind: 'paragraph',
            text: 'The `/gamemode` command accepts `survival`, `s`, `0`, `creative`, `c`, and `1`, with an optional trailing player target. The target is parsed for a future player-addressable session but resolves only to the local player in this version, and an unresolvable target produces a command error. Survival and creative are the two modes; the command does not change the game mode of an AI actor.',
          },
          {
            kind: 'paragraph',
            text: 'Both the command and the Settings game-mode toggle route through `apply_game_mode` in `src/ludoxel/application/sessions/game_mode.py`, which writes the runtime creative flag and applies `apply_player_game_mode` to each session player. Leaving creative mode clears player flight. Game mode in this engine is a runtime preference consumed by the session step, not a saved player field, so the command and the Settings surface produce the same simulation-facing transition.',
          },
        ],
      },
    ],
    relatedTitles: ['Moving the Player', 'Understanding the Chat Runtime and Command Routing', 'Using Chat and Commands'],
  }),
  defineDocsArticle({
    category: 'Gameplay',
    subcategory: 'My World Building',
    group: 'World Generation',
    title: 'Creating Seeded My Worlds',
    description: 'Defines Create New World generation-mode and seed selection, the deterministic normal-mode terrain and its ravines and strata, explicit flat mode, the spawn search, and the edit-delta state transitions over base terrain.',
    sections: [
      {
        id: 'creating-seeded-my-worlds-create-form',
        title: 'The Create Form Fixes Mode and Seed',
        content: [
          {
            kind: 'paragraph',
            text: '`WorldCreatePage` in `src/ludoxel/presentation/interface/menu/create_page.py` collects four values: a world name, a game mode, a world type of Normal or Flat, and a seed. The seed field is pre-filled with `1`; `seed_text_error` rejects a non-integer or out-of-range entry and disables Create, `seed_from_text` resolves an empty field to the default seed `1`, and an explicit `0` is emitted as `0`. The confirmed values travel as one signal through `StartupShellOverlay` to `create_world` in the viewport menu controller, which builds a normalized `WorldGenerationSpec` and hands it to `WorldLibraryStore.create_world` inside a default play space.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/viewport/controllers/menu.py',
            code: `def create_world(viewport: "RendererViewportWidget", name: str, game_mode: str, generation_mode: str, seed_text: str) -> None:
  library = _library(viewport)
  generation = WorldGenerationSpec(mode=normalize_generation_mode(generation_mode), version=GENERATION_VERSION_CURRENT, seed=seed_from_text(seed_text)).normalized()
  library.create_world(name=str(name), game_mode=str(game_mode), space=default_new_world_space(generation))
  refresh_library(viewport)
  viewport._menu.show_library()`,
          },
          {
            kind: 'paragraph',
            text: 'Flat is an explicit selection, never an implicit default: a world uses the single-layer grass plane only when the form chose Flat, and every other creation path produces normal seeded terrain. The Othello play space builds its own generation-backed flat floor through `create_othello_session` and `make_othello_world_state` and is not part of this selection. The recorded mode, generation version, and seed persist with the world, so reopening it reproduces the recorded base terrain from that same seed.',
          },
        ],
      },
      {
        id: 'creating-seeded-my-worlds-normal-terrain',
        title: 'Normal Terrain Is a Deterministic Function',
        content: [
          {
            kind: 'paragraph',
            text: 'Normal-mode base terrain is a function of the seed, the generation version, and the world coordinate, implemented identically in `terrain_math.py` and the Rust crate. The continuous surface height is $h(x,z) = 6 + \\sum_i a_i\\,n_i(x,z)$ over four smoothed value-noise octaves with amplitude/wavelength pairs $(16,192)$, $(8,96)$, $(3,36)$, and $(1,16)$; the octave slopes are bounded so adjacent surface columns differ by at most one block. A ravine field carves the surface where a ridge noise crosses zero under a mask noise, lowering the carved height by up to roughly twenty blocks with a meandering floor; carved columns expose stone. A bedrock layer sits at $y = -65$ and the carved surface never descends closer than four blocks above it.',
          },
          {
            kind: 'paragraph',
            text: 'Material selection is layered and noise-broken. The surface block is grass outside ravines; the next two to three blocks are a dirt band mixed from dirt, coarse dirt, and gravel with a patch noise biasing local composition; below that, stone blends into andesite, granite, diorite, and tuff through three-dimensional noise fields, and deepslate replaces the stone family below a noise-varied boundary near $y=-28$. Ore veins are noise-thresholded regions gated by a per-cell hash: coal, copper, iron, gold, redstone, lapis, and diamond occupy depth ranges and switch to their deepslate variants inside the deepslate zone, and emerald appears as rare single cells at or above $y=0$. Every emitted id is a registered block; `validate_terrain_materials` raises at session construction when a terrain material is missing from the registry instead of substituting another block.',
          },
        ],
      },
      {
        id: 'creating-seeded-my-worlds-spawn',
        title: 'Spawn Search Runs in Simulation',
        content: [
          {
            kind: 'paragraph',
            text: '`spawn_for_generation` in `src/ludoxel/simulation/worlds/generation/spawn.py` fixes the initial player position from the spec alone. For normal mode it scans outward from the origin in growing square rings up to radius 48, accepting the first column that is outside every ravine, whose four neighbors differ in height by at most one block and are also ravine-free, and whose surface sits safely above bedrock; the player stands at the column center one block above the surface. Flat mode spawns above the flat ground level, and a static world keeps the legacy fixed position. The renderer and the create form never estimate a spawn height; the simulation owner computes it, a saved world restores its stored player pose, and loading a world also rewrites the session respawn settings from the same function, so a death respawn lands on the loaded world’s spawn column.',
          },
        ],
      },
      {
        id: 'creating-seeded-my-worlds-edit-delta',
        title: 'Edits Resolve Above Base Terrain',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`WorldState` resolves every coordinate in a fixed order: a user-placed block answers first, a recorded broken base-terrain coordinate answers as air, and otherwise the deterministic base terrain answers. Breaking a base-terrain block records its coordinate; breaking a placed block deletes only the placed record and keeps any broken record beneath it, so terrain broken once does not resurface after building and removing a block in the same cell. Placing into open air and breaking that block leaves no broken record, because no base terrain exists there to suppress. Picking, placement, collision, gravity, and AI queries all read this composed state through the same `world.blocks` view, so unmaterialized base terrain is targetable and solid like any explicit block; the persisted form of the delta is fixed by ',
              {
                kind: 'link',
                label: 'world generation data',
                href: '/docs/data/local-and-saved-data/saved-runtime-state/reading-world-generation-data',
              },
              '.',
            ],
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/worlds/state/world.py',
            code: `def state_at(self, x: int, y: int, z: int) -> str | None:
  k = (int(x), int(y), int(z))
  with self._lock:
    placed = self._placed.get(k)
    if placed is not None:
      return placed
    if k in self._broken:
      return None
  return self.base_state_at(int(x), int(y), int(z))`,
          },
          {
            kind: 'paragraph',
            text: 'The ordering is the reason saved edits survive regeneration: base terrain is a source for coordinates the user never touched, not an instruction to rebuild the world. Gravity-affected gravel inside the dirt band participates normally — digging beneath surface gravel lets it fall through the same falling-block system as placed sand or gravel — and a block falling from broken base terrain records the broken origin and lands as a placed block.',
          },
        ],
      },
    ],
    relatedTitles: ['Building in My World', 'Reading World Generation Data', 'Reading Placement Rejection'],
  }),
];
