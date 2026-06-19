/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const dataPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'User Data Location',
    title: 'Locating User Data',
    description: 'Defines the runtime data-root resolver, the state/cache split, the application persistence paths, and the evidentiary limit of a resolved local path.',
    sections: [
      {
        id: 'locating-user-data-runtime-root-resolution',
        title: 'Runtime Root Resolution',
        content: [
          {
            kind: 'paragraph',
            text: 'Ludoxel derives user data from a runtime data root, not from the repository checkout and not from the directory that happens to contain the executable. The controlling function is `default_runtime_data_root` in `src/ludoxel/foundations/locations/roots.py`. Its order is exact: an explicit environment override wins; absent that override, the resolver falls through to platform-specific user data locations. The result is a local persistence root whose value is computed at runtime rather than hard-coded in the website documentation.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/locations/roots.py',
            code: `def default_runtime_data_root(project_root: Path | None = None) -> Path:
  env_root = os.environ.get("LUDOXEL_DATA_ROOT", "").strip()
  if env_root:
    return Path(env_root).expanduser().resolve()

  if sys.platform.startswith("win"):
    base = os.environ.get("LOCALAPPDATA", "").strip() or os.environ.get("AppData", "").strip()
    if base:
      return (Path(base).expanduser() / "Ludoxel").resolve()

  if sys.platform == "darwin":
    return (Path.home() / "Library" / "Application Support" / "Ludoxel").resolve()

  xdg_data_home = os.environ.get("XDG_DATA_HOME", "").strip()
  if xdg_data_home:
    return (Path(xdg_data_home).expanduser() / "ludoxel").resolve()

  return (Path.home() / ".local" / "share" / "ludoxel").resolve()`,
          },
          {
            kind: 'paragraph',
            text: 'The first branch is legally and operationally significant for Data documentation: `LUDOXEL_DATA_ROOT` does not merely redirect one file; it relocates the entire local data tree. A screenshot of an absolute path cannot prove the platform branch by itself, because the same state files can appear below a custom override. Correct analysis starts from the resolver branch and only then names the file that was read or written.',
          },
        ],
      },
      {
        id: 'locating-user-data-state-cache-split',
        title: 'State and Cache Split',
        content: [
          {
            kind: 'paragraph',
            text: 'The runtime data root is divided into `state` and `cache` subtrees. The two helper functions are deliberately small, but their consequence is large: everything later stored beneath `state` is treated as primary local state, while cache files are derived artifacts that can be regenerated when their source material still exists.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/locations/roots.py',
            code: `def runtime_state_root(data_root: Path) -> Path:
  return Path(data_root) / "state"


def runtime_cache_root(data_root: Path) -> Path:
  return Path(data_root) / "cache"`,
          },
          {
            kind: 'paragraph',
            text: 'That split is the first deletion boundary. Removing `state/world_state.json` discards primary play-space state. Removing `state/othello_opening_book.json` discards user opening-book lines. Removing `cache/othello_opening_book_cache.json` forces recompilation from remaining source lines. The implementation does not treat all JSON files beneath the data root as equivalent simply because they share a root path.',
          },
        ],
      },
      {
        id: 'locating-user-data-application-store-paths',
        title: 'Application Store Paths',
        content: [
          {
            kind: 'paragraph',
            text: 'The application state store constructs its principal paths from the runtime state root. `player_state.json` and `world_state.json` are not found through source-tree traversal. They are reached through `_state_path`, which appends the file name below `runtime_state_root(self._data_root())`. That expression is the concrete owner of those two JSON files.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/app.py',
            code: `def _state_path(self, name: str) -> Path:
  return runtime_state_root(self._data_root()) / str(name)

def _player_store(self) -> JsonFileStore:
  return JsonFileStore(path=self._state_path("player_state.json"))

def _world_store(self) -> JsonFileStore:
  return JsonFileStore(path=self._state_path("world_state.json"))`,
          },
          {
            kind: 'paragraph',
            text: 'The resulting local data tree contains several distinct persistence families: player state, world state, runtime integrity material, AI learning state, demonstration datasets, learned policies, training and evaluation records, Othello user opening-book lines, and rebuildable Othello cache data. A path below the runtime root identifies which store family produced the file; it does not decide whether the contents may be copied, published, or redistributed.',
          },
        ],
      },
      {
        id: 'locating-user-data-path-evidence',
        title: 'Path Evidence and Disclosure Limit',
        content: [
          {
            kind: 'paragraph',
            text: 'A resolved path is evidence of placement, resolver branch, and store ownership. It is not evidence of permission. A file under `<data_root>/state/learning/` is a learning artifact because the learning store writes it there; it is not a public dataset because it is located under that path. A file under `<data_root>/state/world_state.json` is saved local state because the application state store reads it there; it is not a distribution package because it serializes a world.',
          },
          {
            kind: 'paragraph',
            text: [
              'Absolute data-root paths can expose account names and local directory structure. A public problem report that includes runtime paths must apply ',
              {
                kind: 'link',
                label: 'log redaction',
                href: '/docs/support/public-problem-support/evidence-handling/supplying-logs-without-secrets',
              },
              ' before publication. The Data article can identify the path class; it must not normalize disclosure of private local paths.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Do not infer legal permission, official release status, public support suitability, or safe disclosure from the existence of a resolved data path. The path identifies where the runtime placed data; it does not authorize what may be done with that data.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Separating User Data from Source Files', 'Cleaning Local User Data Safely', 'Reading Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'User Data Location',
    title: 'Separating User Data from Source Files',
    description: 'Separates repository source and packaged resources from mutable runtime data by resolver, marker search, write target, migration fallback, and material-classification consequence.',
    sections: [
      {
        id: 'separating-user-data-project-root-predicate',
        title: 'Project Root Predicate',
        content: [
          {
            kind: 'paragraph',
            text: 'Ludoxel distinguishes a project root from a runtime data root by predicate, not by intuition. A project root is identified by repository markers: `pyproject.toml`, or the joint presence of `assets` and `src`. That predicate identifies source and resource material. It is not a persistence target and does not become one because a user is running from a checkout.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/locations/roots.py',
            code: `def is_project_root(path: Path) -> bool:
  root = Path(path).resolve()
  if (root / "pyproject.toml").is_file():
    return True
  return (root / "assets").is_dir() and (root / "src").is_dir()`,
          },
          {
            kind: 'paragraph',
            text: 'The predicate is intentionally structural. It does not inspect saved settings, saved worlds, AI learning files, or Othello book deltas. Those records are resolved through the runtime data-root functions and store implementations. A directory can contain source markers without being the local user-data root, and a local user-data root can contain no source markers at all.',
          },
        ],
      },
      {
        id: 'separating-user-data-resource-root',
        title: 'Resource Root and Runtime Data Root',
        content: [
          {
            kind: 'paragraph',
            text: 'Packaged resource resolution is also separate from saved-data resolution. A resource root points at material shipped with the application or available through the project root. A runtime data root points at mutable local state. The fact that both may be read during one session does not merge their material class or their lifecycle.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Resource and data roots remain different owner concepts.',
            code: `def runtime_state_root(data_root: Path) -> Path:
  return Path(data_root) / "state"


def runtime_cache_root(data_root: Path) -> Path:
  return Path(data_root) / "cache"`,
          },
          {
            kind: 'paragraph',
            text: 'The engineering consequence is direct. Source files, shaders, QSS, website source, bundled textures, bundled fonts, Othello package resources, and third-party license text are not save files. Conversely, `player_state.json`, `world_state.json`, `ai_learning.json`, learning datasets, learned policies, and user opening-book lines are not source files merely because the application serialized them.',
          },
        ],
      },
      {
        id: 'separating-user-data-legacy-configs',
        title: 'Legacy Configuration Fallback',
        content: [
          {
            kind: 'paragraph',
            text: 'A legacy `configs` path is consulted only after the runtime file is absent. The store reads runtime state first, verifies protected runtime files, and only then considers the old project-local configuration path. That branch order prevents a legacy source-adjacent file from overriding current runtime state.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/app.py',
            code: `def _read_runtime_or_previous(self, name: str) -> dict | None:
  runtime_path = self._state_path(name)
  if runtime_path.exists():
    relative_path = f"state/{name}"
    if not verify_runtime_file(self._data_root(), relative_path):
      return None
    return JsonFileStore(path=runtime_path).read()

  previous_path = self._previous_config_path(name)
  if previous_path.exists():
    return JsonFileStore(path=previous_path).read()

  return None`,
          },
          {
            kind: 'paragraph',
            text: 'The fallback is migration evidence, not a current write contract. It proves that older records can be imported when no runtime file exists. It does not prove that modern state belongs in the repository or that editing repository-local files is a supported way to repair runtime state.',
          },
        ],
      },
      {
        id: 'separating-user-data-classification-after-root',
        title: 'Classification After Root Separation',
        content: [
          {
            kind: 'paragraph',
            text: [
              'Root separation decides whether a file is source/resource material or runtime data. It does not clean embedded material. A saved world can be runtime data and still refer to Ludoxel block definitions. An imported skin can be user-supplied data and still carry outside rights. A generated screenshot can be output and still contain application presentation. The material boundary is treated through ',
              {
                kind: 'link',
                label: 'original materials and output',
                href: '/docs/data/learning-and-material-data/output-and-material-boundaries/separating-original-materials-from-output',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Locating User Data', 'Cleaning Local User Data Safely', 'Separating Original Materials from Output'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'User Data Location',
    title: 'Cleaning Local User Data Safely',
    description:
      'Defines cleanup as an operation against the active runtime data root, separating primary state deletion, rebuildable cache deletion, integrity-manifest effects, and unrelated build-artifact cleanup.',
    sections: [
      {
        id: 'cleaning-local-user-data-active-target',
        title: 'Active Cleanup Target',
        content: [
          {
            kind: 'paragraph',
            text: 'Cleanup must target the active resolver result. If `LUDOXEL_DATA_ROOT` is set, the platform default directory is not the active tree. If it is absent, a guessed override path is irrelevant. The runtime data-root function therefore controls cleanup before any file is removed.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The override branch relocates the entire runtime data tree.',
            code: `env_root = os.environ.get("LUDOXEL_DATA_ROOT", "").strip()
if env_root:
  return Path(env_root).expanduser().resolve()`,
          },
          {
            kind: 'paragraph',
            text: 'This distinction prevents two common errors: deleting the wrong local directory and describing source-tree cleanup as saved-data cleanup. Data cleanup is bounded to the resolved data root and its `state` and `cache` children. It does not clean Vite output, PyInstaller output, dependency directories, generated thumbnails in the repository, or package staging directories.',
          },
        ],
      },
      {
        id: 'cleaning-local-user-data-primary-state',
        title: 'Primary State Deletion',
        content: [
          {
            kind: 'paragraph',
            text: 'Files below `state` preserve primary local records. `player_state.json` contains persisted settings, inventory, current play-space selection, and standing Othello settings. `world_state.json` contains My World and Othello play-space records. `ai_learning.json` contains learning settings and summaries. `state/learning/` contains datasets and policy artifacts. `state/othello_opening_book.json` contains user opening-book lines.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Player state shows why deleting one file discards multiple saved domains.',
            code: `@dataclass(frozen=True)
class PlayerStateFile:
  version: int = 7
  current_space_id: str = PLAY_SPACE_MY_WORLD
  settings: PersistedSettings = field(default_factory=PersistedSettings)
  inventory: PersistedInventory = field(default_factory=PersistedInventory)
  othello_settings: OthelloSettings = field(default_factory=OthelloSettings)`,
          },
          {
            kind: 'paragraph',
            text: 'The dataclass composition makes the deletion consequence explicit. Removing `player_state.json` is not only a visual-preference reset. It removes all fields in the envelope. The application can construct defaults, but it cannot reconstruct the discarded local values from those defaults.',
          },
        ],
      },
      {
        id: 'cleaning-local-user-data-bounded-learning-removal',
        title: 'Bounded Learning Removal',
        content: [
          {
            kind: 'paragraph',
            text: 'Some cleanup operations are narrower than deleting a subtree. The AI learning store can remove one dataset id without removing all policies, all evaluations, or the learning settings file. That method checks both current and legacy dataset paths and unlinks only matching dataset files.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/ai_learning.py',
            code: `def clear_dataset(self, dataset_id: str) -> bool:
  removed = False
  for path in (self.dataset_path(dataset_id), self._legacy_dataset_path(dataset_id)):
    if path.is_file():
      try:
        path.unlink()
        removed = True
      except OSError:
        continue
  return bool(removed)`,
          },
          {
            kind: 'paragraph',
            text: 'The method proves that learning cleanup has internal granularity. Clearing one dataset does not imply a reset of learning settings, policy selection, bundled policies, or unrelated training records. A report that says “learning data was cleared” is technically incomplete unless it names the exact dataset id, policy id, or state file that was removed.',
          },
        ],
      },
      {
        id: 'cleaning-local-user-data-integrity',
        title: 'Integrity Manifest Consequences',
        content: [
          {
            kind: 'paragraph',
            text: 'Runtime integrity files are not decorative metadata. `state_manifest.json` and `integrity_key.bin` control whether protected runtime files are accepted. Verification returns true for a missing target file, true when no manifest entries exist, and false when a listed file exists but the key is missing.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/integrity/manifest.py',
            code: `def verify_runtime_file(data_root: Path, relative_path: str | Path) -> bool:
  path = _runtime_file_path(Path(data_root), relative_path)
  if not path.exists():
    return True

  manifest = _read_manifest(Path(data_root))
  files = manifest.get("files", {})
  if not isinstance(files, dict) or not files:
    return True

  key_path = runtime_integrity_key_path(Path(data_root))
  if not key_path.is_file():
    return False`,
          },
          {
            kind: 'paragraph',
            text: 'Partial integrity deletion can therefore produce non-obvious results. Removing the protected file itself makes the store load defaults. Removing only the key leaves protected files present but unverifiable. Removing the manifest suppresses manifest-based verification of remaining files. None of those operations repairs data or certifies correctness; they only change the verification path.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Deleting runtime state and deleting integrity material are different operations. A cleanup instruction that does not distinguish the state file, manifest, and key can destroy evidence while leaving the application in a fallback state that conceals what was removed.',
            },
          },
        ],
      },
      {
        id: 'cleaning-local-user-data-cache-and-distribution',
        title: 'Cache and Distribution Separation',
        content: [
          {
            kind: 'paragraph',
            text: [
              'Cache cleanup is local runtime maintenance. Distribution cleanup concerns generated packages, executables, website output, copied legal material, and release staging. A local cache deletion does not invalidate or authorize a ',
              {
                kind: 'link',
                label: 'distribution artifact',
                href: '/docs/distribution/desktop-artifacts/platform-packages/understanding-the-windows-executable',
              },
              ', and deleting a build artifact does not reset saved worlds or preferences.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Locating User Data', 'Reading Saved Preferences', 'Reading Saved World State'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved Preferences',
    description: 'Defines saved preferences through the player-state envelope, `PersistedSettings`, default construction, coercion, legacy key migration, runtime consumption, and integrity failure.',
    sections: [
      {
        id: 'reading-saved-preferences-envelope',
        title: 'Player-State Envelope',
        content: [
          {
            kind: 'paragraph',
            text: 'Saved preferences live inside `player_state.json`. They are not stored as a separate preference-only file. The envelope is `PlayerStateFile`, and the `settings` field is only one member of that envelope beside current play-space id, inventory, and standing Othello settings.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/files.py',
            code: `@dataclass(frozen=True)
class PlayerStateFile:
  version: int = 7
  current_space_id: str = PLAY_SPACE_MY_WORLD
  settings: PersistedSettings = field(default_factory=PersistedSettings)
  inventory: PersistedInventory = field(default_factory=PersistedInventory)
  othello_settings: OthelloSettings = field(default_factory=OthelloSettings)`,
          },
          {
            kind: 'paragraph',
            text: 'The schema composition is operationally important. A failure to load `player_state.json` affects more than camera or audio. It can also affect inventory and current space selection because the file envelope groups those records. Data documentation must therefore name the file and field, not just the visible UI preference.',
          },
        ],
      },
      {
        id: 'reading-saved-preferences-schema-coercion',
        title: 'Schema Coercion and Bounds',
        content: [
          {
            kind: 'paragraph',
            text: '`PersistedSettings` supplies typed defaults and load-time normalization. The loader reads JSON through coercion helpers and clamps values that have runtime bounds. Render distance is passed through the render-distance clamp, window size is floored, and shadow-map quality is normalized to a supported level.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Representative preference coercion and normalization.',
            code: `rd = clamp_render_distance_chunks(mapping_int(d, "render_distance_chunks", 6))
...
window_width=max(320, coerce_int(d.get("window_width", 1280), 1280)),
window_height=max(240, coerce_int(d.get("window_height", 720), 720)),
shadow_map_quality=normalize_shadow_map_quality(d.get("shadow_map_quality", SHADOW_MAP_QUALITY_DEFAULT)),`,
          },
          {
            kind: 'paragraph',
            text: 'This is not a loose JSON bag. The schema converts untrusted raw values into a bounded runtime contract. A malformed numeric value does not automatically become a renderer parameter; it first passes through the persisted-settings reader. That reader is the engineering boundary between local JSON and live runtime state.',
          },
        ],
      },
      {
        id: 'reading-saved-preferences-legacy-keys',
        title: 'Legacy Key Migration',
        content: [
          {
            kind: 'paragraph',
            text: 'The reader preserves older key names where the project renamed settings. `cloud_wire` can feed `cloud_wireframe`, `world_wire` can feed `world_wireframe`, and `build_mode` can feed `creative_mode` when the current key is absent. The current key remains authoritative when present.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Legacy-key fallback pattern.',
            code: `cloud_wireframe=mapping_bool(d, "cloud_wireframe", mapping_bool(d, "cloud_wire", False)),
world_wireframe=mapping_bool(d, "world_wireframe", mapping_bool(d, "world_wire", False)),
creative_mode=mapping_bool(d, "creative_mode", mapping_bool(d, "build_mode", False)),`,
          },
          {
            kind: 'paragraph',
            text: 'The fallback is a saved-data compatibility rule. It lets older files survive without requiring the Settings UI to preserve obsolete names. The migration occurs where serialized data is interpreted, not in the visual control surface.',
          },
        ],
      },
      {
        id: 'reading-saved-preferences-runtime-and-integrity',
        title: 'Runtime Consumption and Integrity',
        content: [
          {
            kind: 'paragraph',
            text: [
              'A stored preference changes runtime behavior only when the consumer reads the loaded settings object. Camera, audio, keybind, render-distance, cloud, and shadow systems consume values after schema normalization. Visible adjustment belongs to Settings surfaces such as ',
              {
                kind: 'link',
                label: 'camera preferences',
                href: '/docs/settings/visual-and-audio-settings/camera-and-crosshair/changing-camera-preferences',
              },
              ', but the stored value and its validation boundary remain a Data concern.',
            ],
          },
          {
            kind: 'paragraph',
            text: '`player_state.json` is also protected by runtime integrity. A manually modified file can fail verification before its JSON is trusted. A missing, unreadable, non-object, or unverifiable file falls back through default construction. The application does not treat manual JSON editing as an authorized preference-update channel.',
          },
        ],
      },
    ],
    relatedTitles: ['Locating User Data', 'Cleaning Local User Data Safely', 'Reading Saved Othello State'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved World State',
    description:
      'Defines saved world state through the world-state envelope, play-space composition, explicit block rows, revision semantics, corruption skipping, migration behavior, and material-classification limits.',
    sections: [
      {
        id: 'reading-saved-world-state-envelope',
        title: 'World-State Envelope',
        content: [
          {
            kind: 'paragraph',
            text: 'Saved world state is stored in `world_state.json`. The current envelope is `WorldStateFile`, whose serialized form contains a `spaces` mapping with `my_world` and `othello` entries. A world save is therefore a play-space container, not a flat block dump.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/files.py',
            code: `def to_dict(self) -> dict[str, Any]:
  return {
    "version": int(self.version),
    "spaces": {
      "my_world": self.my_world.to_dict(),
      "othello": self.othello_space.to_dict(),
    },
  }`,
          },
          {
            kind: 'paragraph',
            text: 'The `spaces` mapping is the outer structural boundary. It prevents My World state and Othello state from being read as one undifferentiated world. Each space can carry its own player, world, AI actors, and Othello-specific game state where applicable.',
          },
        ],
      },
      {
        id: 'reading-saved-world-state-block-rows',
        title: 'Block Rows and Revision',
        content: [
          {
            kind: 'paragraph',
            text: '`WorldState` persists blocks as explicit coordinate/state rows. The saved representation is not a procedural seed, not a chunk cache, and not a renderer mesh. It is a list of user-visible block states keyed by integer coordinates, plus a revision counter that records world mutation.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/worlds/state/world.py',
            code: `def to_persisted_dict(self) -> dict[str, Any]:
  with self._lock:
    items: list[list[Any]] = []
    for (x, y, z), s in self.blocks.items():
      items.append([int(x), int(y), int(z), str(s)])
    return {"revision": int(self.revision), "blocks": items}`,
          },
          {
            kind: 'paragraph',
            text: 'That representation has two consequences. First, the saved world is exactly the surviving explicit cell map, not an instruction to regenerate the same terrain. Second, the revision number belongs to mutation tracking; it is not a release version, schema version, or proof of content authorship.',
          },
        ],
      },
      {
        id: 'reading-saved-world-state-play-space-composition',
        title: 'Play-Space Composition',
        content: [
          {
            kind: 'paragraph',
            text: 'A persisted play space is a composition of player state, world state, and AI actor state. The block list does not contain the player pose or AI configuration. The AI records do not contain the world block map. The player record does not contain the Othello match state. Reading a save requires keeping those subrecords distinct.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Representative play-space structure.',
            code: `@dataclass(frozen=True)
class PersistedPlaySpace:
  player: PersistedPlayer = field(default_factory=PersistedPlayer)
  world: PersistedWorld = field(default_factory=PersistedWorld)
  ai_players: tuple[PersistedAiPlayer, ...] = ()`,
          },
          {
            kind: 'paragraph',
            text: 'The composition explains why deleting or corrupting one subrecord does not have the same meaning as deleting a whole world. A valid block map without the prior player pose is not the original play space. A valid Othello match without its surrounding space data is not the complete saved state.',
          },
        ],
      },
      {
        id: 'reading-saved-world-state-corrupt-rows',
        title: 'Malformed Block Rows',
        content: [
          {
            kind: 'paragraph',
            text: 'The block reader is row-tolerant. A malformed block row is skipped, and the scan continues. A row must be a four-element list and must coerce its coordinates to integers. A corrupt row is not repaired; it is excluded from the reconstructed map.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Malformed block rows are rejected without aborting the whole map.',
            code: `raw = d.get("blocks", [])
if isinstance(raw, list):
  for it in raw:
    if not isinstance(it, list) or len(it) != 4:
      continue
    try:
      x = int(it[0]); y = int(it[1]); z = int(it[2]); s = str(it[3])
    except Exception:
      continue
    out[(x, y, z)] = s`,
          },
          {
            kind: 'paragraph',
            text: 'This is an engineering compromise. It preserves the valid part of a save while refusing to invent missing coordinates or block states. A world that loads after skipping malformed rows may be usable, but it is not identical to the file that would have loaded if those rows had been valid.',
          },
        ],
      },
      {
        id: 'reading-saved-world-state-classification',
        title: 'State Classification and Sharing Limit',
        content: [
          {
            kind: 'paragraph',
            text: [
              'A saved world is a runtime state record and a material-classification subject. It can contain user-authored arrangement over application-defined block states. It can also contain embedded references to Ludoxel material. The user-contribution analysis belongs to ',
              {
                kind: 'link',
                label: 'user-created materials',
                href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-user-created-materials',
              },
              '; the existence of `world_state.json` alone does not authorize publication or redistribution.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Cleaning Local User Data Safely', 'Reading Saved AI State', 'Understanding User-Created Materials'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved AI State',
    description:
      'Separates persisted AI actors, learning settings, demonstration datasets, learned policies, and evaluation summaries, refusing to treat saved AI data as proof of autonomous intelligence.',
    sections: [
      {
        id: 'reading-saved-ai-state-artifact-families',
        title: 'AI Artifact Families',
        content: [
          {
            kind: 'paragraph',
            text: 'Saved AI data spans multiple artifact families. Per-actor state is embedded in play spaces inside `world_state.json`. Learning settings and summary records are stored in `state/ai_learning.json`. Demonstration datasets, learned policies, evaluations, and training-run records live under `state/learning/`. The phrase “AI state” is therefore ambiguous unless the file family is named.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Learning-state envelope separates settings from dataset/policy files.',
            code: `@dataclass(frozen=True)
class PersistedAiLearningState:
  settings: PersistedAiLearningSettings = field(default_factory=PersistedAiLearningSettings)
  dataset_summary: PersistedAiLearningDatasetSummary = field(default_factory=PersistedAiLearningDatasetSummary)
  last_training_summary: dict[str, Any] = field(default_factory=dict)
  last_evaluation_summary: dict[str, Any] = field(default_factory=dict)`,
          },
          {
            kind: 'paragraph',
            text: 'The learning-state envelope records configuration and summaries; it is not the dataset and not the policy corpus. A small `ai_learning.json` file can point at large external rows under `state/learning/demonstrations/`, and a missing policy file can make a selected policy id unusable without deleting the learning settings.',
          },
        ],
      },
      {
        id: 'reading-saved-ai-state-actor-schema',
        title: 'Persisted Actor Schema',
        content: [
          {
            kind: 'paragraph',
            text: 'A persisted AI actor is a runtime actor record. It contains identity, behavior mode, personality, skin mode, skin id, automatic-regeneration settings, held item, pose, velocity, orientation, health, patrol route, and behavior-related flags. It does not contain learned weights.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Skin-mode normalization prevents a custom-skin mode without a skin id.',
            code: `skin_id = normalize_ai_skin_id(data.get("skin_id", ""))
skin_mode = normalize_ai_skin_mode(data.get("skin_mode", AI_SKIN_MODE_PLAYER))
if skin_mode == AI_SKIN_MODE_CUSTOM and not skin_id:
  skin_mode = AI_SKIN_MODE_PLAYER`,
          },
          {
            kind: 'paragraph',
            text: 'The normalization step matters because it proves that saved actor data is not blindly replayed. An invalid custom-skin configuration is reduced to player-skin mode during load. The saved file is interpreted through schema code before it becomes a live actor.',
          },
        ],
      },
      {
        id: 'reading-saved-ai-state-learning-settings',
        title: 'Learning Settings',
        content: [
          {
            kind: 'paragraph',
            text: 'Learning settings control capture and policy selection. They do not create rows by their mere existence. Capture depends on learning mode and capture flags. Policy use depends on selected policy kind and id, plus the availability and usability of the corresponding artifact.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Representative learning settings fields.',
            code: `@dataclass(frozen=True)
class PersistedAiLearningSettings:
  learning_mode: str = AI_LEARNING_MODE_OFF
  capture_player_demonstrations: bool = False
  capture_ai_decisions: bool = False
  capture_failures: bool = False
  capture_deaths: bool = False
  capture_route_failures: bool = False
  selected_policy_kind: str = AI_POLICY_KIND_BUILTIN
  selected_policy_id: str = AI_POLICY_ID_BUILTIN`,
          },
          {
            kind: 'paragraph',
            text: 'A saved setting can therefore describe an intent to record or use a policy without proving that rows or policies exist. The data interpretation must follow the chain from learning settings to dataset path to policy registry rather than collapsing all learning-related JSON into a single capability claim.',
          },
        ],
      },
      {
        id: 'reading-saved-ai-state-behavior-limit',
        title: 'Behavioral Limit',
        content: [
          {
            kind: 'paragraph',
            text: [
              'Saved AI state is not evidence of autonomous intelligence, stable competence, or model quality. Live behavior is produced by simulation code, action masks, baseline scoring, and optional policy modifiers. The policy artifact contract is examined in ',
              {
                kind: 'link',
                label: 'reading learned policies',
                href: '/docs/data/learning-and-material-data/learning-artifacts/reading-learned-policies',
              },
              '.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Do not describe a saved AI actor record as a trained model. Actor state, learning settings, demonstration rows, and policy artifacts are different records with different readers and different failure modes.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Reading Demonstration Data', 'Reading Learned Policies', 'Handling Corrupt Learning Rows'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Local and Saved Data',
    group: 'Saved Runtime State',
    title: 'Reading Saved Othello State',
    description: 'Defines Othello persistence across match state, standing settings, per-match settings, bundled opening-book resources, user opening-book deltas, and compiled cache.',
    sections: [
      {
        id: 'reading-saved-othello-state-match-record',
        title: 'Match-State Record',
        content: [
          {
            kind: 'paragraph',
            text: 'Othello match state is stored inside the Othello play space, not in a separate match-only file. The record is `OthelloGameState`. It contains board state, lifecycle status, per-match settings, sides, side to move, clocks, move and pass counts, winner, last move, legal moves, thinking state, and pending animations.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Terminal match normalization clears transient active-state fields.',
            code: `if normalized.status == OTHELLO_GAME_STATE_FINISHED:
  return replace(normalized, legal_moves=(), thinking=False, animations=()).normalized()`,
          },
          {
            kind: 'paragraph',
            text: 'The normalization shows that saved Othello state is not a passive JSON dump. A finished game cannot persist active thinking or animation state as if the engine were still calculating. The record is coerced into a consistent lifecycle state during load.',
          },
        ],
      },
      {
        id: 'reading-saved-othello-state-board-codec',
        title: 'Board Codec and Settings Layers',
        content: [
          {
            kind: 'paragraph',
            text: 'The board is serialized as a compact 64-cell representation and restored through a coercion path. Standing Othello settings live in `player_state.json`; per-match Othello settings live inside the saved match. These layers must not be conflated. Changing a standing preference does not rewrite the historical configuration under which an already saved match was created.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Representative Othello game-state serialization shape.',
            code: `return {
  "status": str(normalized.status),
  "board": encode_board(normalized.board),
  "settings": normalized.settings.to_dict(),
  "player_side": str(side_name(normalized.player_side)),
  "ai_side": str(side_name(normalized.ai_side)),
}`,
          },
          {
            kind: 'paragraph',
            text: [
              'The visible settings surface is separate from the data layer. Saved-data analysis identifies where the standing and per-match settings are serialized. Control-surface behavior is treated under ',
              {
                kind: 'link',
                label: 'Othello setting persistence',
                href: '/docs/settings/player-and-match-settings/player-and-othello-state/understanding-othello-setting-persistence',
              },
              '.',
            ],
          },
        ],
      },
      {
        id: 'reading-saved-othello-state-book-layering',
        title: 'Opening-Book Layering',
        content: [
          {
            kind: 'paragraph',
            text: 'The Othello opening book has three data layers: a bundled resource, a user delta, and a compiled cache. The user delta is not a copy of the bundled book. The save path subtracts bundled lines and persists only the user-only remainder.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/books/opening.py',
            code: `merged_lines = _normalize_lines(list(lines))
bundled_lines = load_bundled_opening_book_lines()
bundled_set = set(bundled_lines)
user_only_lines = tuple(line for line in merged_lines if line not in bundled_set)`,
          },
          {
            kind: 'paragraph',
            text: 'This subtraction is the central engineering fact for material classification. A user opening-book file is not allowed to become a redundant repository-resource copy simply because the effective book merges bundled and user lines in memory. The saved delta records only what remains after bundled lines are removed.',
          },
        ],
      },
      {
        id: 'reading-saved-othello-state-cache-deletion',
        title: 'Compiled Cache Deletion',
        content: [
          {
            kind: 'paragraph',
            text: 'The compiled book cache is a derived index. Removing the cache forces recompilation from surviving source lines. Removing the user delta discards user contribution. Removing the bundled resource damages shipped material. These three operations have different effects despite all being connected to “the opening book.”',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The compiled cache belongs under the runtime cache root.',
            code: `def runtime_cache_root(data_root: Path) -> Path:
  return Path(data_root) / "cache"`,
          },
          {
            kind: 'paragraph',
            text: [
              'Bundled resources do not become user-created because they are merged with user deltas during runtime. Their material status remains relevant under ',
              {
                kind: 'link',
                label: 'third-party material boundaries',
                href: '/docs/data/learning-and-material-data/output-and-material-boundaries/understanding-third-party-material-boundaries',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Reading Saved Preferences', 'Cleaning Local User Data Safely', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Reading Demonstration Data',
    description:
      'Defines demonstration data as append-only JSON Lines records with observations, actions, rewards, success flags, details, schema versioning, corrupt-line accounting, and training-evidence limits.',
    sections: [
      {
        id: 'reading-demonstration-data-record-schema',
        title: 'Record Schema',
        content: [
          {
            kind: 'paragraph',
            text: 'A demonstration row is a `DemonstrationRecord`, not a video frame, replay file, or opaque neural input. The schema pairs an observation mapping with an action id and supplements it with kind, tick, actor id, success, reward, detail, and schema version. The row is therefore a typed learning datum whose meaning depends on both the outer kind and the inner observation/action fields.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/dataset.py',
            code: `@dataclass(frozen=True)
class DemonstrationRecord:
  kind: str
  tick: int = 0
  actor_id: str = ""
  observation: dict[str, Any] = field(default_factory=dict)
  action: str | None = None
  success: bool | None = None
  reward: float | None = None
  detail: dict[str, Any] = field(default_factory=dict)
  schema_version: int = DATASET_SCHEMA_VERSION`,
          },
          {
            kind: 'paragraph',
            text: 'The `kind` field is not a label for display. It determines how the record contributes to summary counts and training interpretation. Player demonstrations, AI decisions, failures, deaths, route failures, and escape attempts can share the same outer dataclass while retaining different semantics through `kind` and `detail`.',
          },
        ],
      },
      {
        id: 'reading-demonstration-data-json-lines',
        title: 'JSON Lines Storage',
        content: [
          {
            kind: 'paragraph',
            text: 'Demonstration datasets are stored as JSON Lines files under the learning state tree. Each valid row is encoded independently and terminated with a newline. The append-only storage model means that adding rows does not rewrite the entire dataset and that damage can be localized to a single line.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Encoding a record as one JSON line.',
            code: `def encode_record_line(record: DemonstrationRecord) -> str:
  return json.dumps(record.to_dict(), ensure_ascii=False, sort_keys=True, separators=(",", ":"))`,
          },
          {
            kind: 'paragraph',
            text: 'The line-oriented format is an engineering choice, not a presentation detail. It favors incremental recording, partial recovery, and corrupt-line accounting. A monolithic JSON array would fail differently: one structural break could invalidate the entire file. JSON Lines allows the reader to preserve valid rows before and after a bad line.',
          },
        ],
      },
      {
        id: 'reading-demonstration-data-reader',
        title: 'Reader and Corrupt-Line Count',
        content: [
          {
            kind: 'paragraph',
            text: 'The dataset reader returns two values: valid records and corrupt-line count. It skips blank lines, decodes each nonblank line independently, increments `corrupt` when decoding fails, and returns the surviving records. That return shape prevents a dataset from appearing clean when corrupted lines were discarded.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/ai_learning.py',
            code: `records: list[DemonstrationRecord] = []
corrupt = 0
with open(path, "r", encoding="utf-8") as handle:
  for line in handle:
    if not str(line).strip():
      continue
    record = decode_record_line(line)
    if record is None:
      corrupt += 1
      continue
    records.append(record)
return (records, int(corrupt))`,
          },
          {
            kind: 'paragraph',
            text: 'A row count derived from the physical file is therefore not the training count. Training receives the decoded records. Corrupt physical lines remain evidence of loss, not usable examples.',
          },
        ],
      },
      {
        id: 'reading-demonstration-data-evidence-limit',
        title: 'Evidence Limit',
        content: [
          {
            kind: 'paragraph',
            text: [
              'A demonstration dataset proves that examples were recorded and decoded. It does not prove that training produced a usable policy. It does not prove model quality. It does not grant permission to repurpose the data outside the application. Rows that fail decoding are handled in ',
              {
                kind: 'link',
                label: 'corrupt learning rows',
                href: '/docs/data/learning-and-material-data/learning-artifacts/handling-corrupt-learning-rows',
              },
              ', and derived policies are analyzed under ',
              {
                kind: 'link',
                label: 'learned policies',
                href: '/docs/data/learning-and-material-data/learning-artifacts/reading-learned-policies',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Handling Corrupt Learning Rows', 'Reading Learned Policies', 'Reading Saved AI State'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Reading Learned Policies',
    description: 'Defines learned policies as versioned utility-modifier artifacts with source families, usability gates, fallback behavior, action-mask limits, and evaluation limits.',
    sections: [
      {
        id: 'reading-learned-policies-policy-record',
        title: 'Policy Record',
        content: [
          {
            kind: 'paragraph',
            text: 'A learned policy is a versioned policy artifact. It is not a neural-network checkpoint. The policy record stores identity, compatibility target, skill categories, feature encoder version, action catalog version, action weight overrides, negative modifiers, utility score modifiers, and an evaluation mapping. Runtime behavior is affected only through those structured modifiers.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/policy.py',
            code: `@dataclass(frozen=True)
class Policy:
  policy_id: str
  policy_name: str
  skill_categories: tuple[str, ...] = ()
  action_weight_overrides: dict[str, float] = field(default_factory=dict)
  negative_modifiers: dict[str, dict[str, float]] = field(default_factory=dict)
  utility_score_modifiers: dict[str, float] = field(default_factory=dict)
  evaluation: dict[str, Any] = field(default_factory=dict)
  schema_version: int = POLICY_SCHEMA_VERSION
  compatibility_target: str = POLICY_COMPATIBILITY_TARGET`,
          },
          {
            kind: 'paragraph',
            text: 'The record shape rejects inflated descriptions of learning. A policy can modify scores and weights. It does not contain executable behavior code and does not replace the planner, physics, placement policy, collision system, or combat eligibility checks.',
          },
        ],
      },
      {
        id: 'reading-learned-policies-usability-gate',
        title: 'Usability Gate',
        content: [
          {
            kind: 'paragraph',
            text: 'A policy artifact can exist on disk and still be unusable. `is_usable` rejects mismatched schema versions, mismatched compatibility targets, incompatible feature encoder versions, incompatible action catalog versions, and artifacts whose evaluation does not report a passed result.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Policy usability gate.',
            code: `def is_usable(self) -> bool:
  if int(self.schema_version) != int(POLICY_SCHEMA_VERSION):
    return False
  if str(self.compatibility_target) != str(POLICY_COMPATIBILITY_TARGET):
    return False
  if int(self.feature_encoder_version) not in (0, int(FEATURE_ENCODER_VERSION)):
    return False
  if int(self.action_catalog_version) not in (0, int(ACTION_SCHEMA_VERSION)):
    return False
  return bool(self.evaluation.get("passed", False))`,
          },
          {
            kind: 'paragraph',
            text: 'This method is the hard boundary between readable policy data and a policy permitted to influence runtime. Documentation must not say that a policy “works” because a JSON file exists. The artifact must survive version compatibility and evaluation gates.',
          },
        ],
      },
      {
        id: 'reading-learned-policies-source-families',
        title: 'Source Families and Fallback',
        content: [
          {
            kind: 'paragraph',
            text: 'Policy sources are distinct. Bundled policies ship as package resources. User-learned policies are saved under the runtime learning state tree. A deterministic built-in policy remains available as fallback. Resolution can therefore return the built-in baseline even when a selected user policy id is present but unusable.',
          },
          {
            kind: 'code',
            language: 'json',
            caption: 'Representative bundled policy resource.',
            code: `{
  "schema_version": 1,
  "policy_id": "bundled_route_v1",
  "policy_name": "Bundled Route Policy",
  "compatibility_target": "ludoxel.ai.v1",
  "skill_categories": ["route_finding", "visual_awareness"],
  "evaluation_summary": { "passed": true },
  "action_weight_overrides": { "replan_route": 0.1, "follow_route": 0.06 },
  "utility_score_modifiers": { "route": 0.08, "route_finding": 0.06 }
}`,
          },
          {
            kind: 'paragraph',
            text: 'The JSON shape shows the scale of the artifact: narrow modifiers, identity fields, compatibility metadata, and evaluation summary. It does not contain an opaque trained model. Bundled presence also does not prove user learning; it proves package inclusion.',
          },
        ],
      },
      {
        id: 'reading-learned-policies-action-mask',
        title: 'Action-Mask Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'Policy modifiers cannot make forbidden actions legal. The planner and action mask decide which actions are candidates. Policy weights can bias candidate scoring, but they do not revive actions that the action mask has excluded. This preserves simulation constraints even when a learned artifact is active.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Action-mask construction remains separate from policy scoring.',
            code: `@dataclass(frozen=True)
class AiActionMask:
  allowed_action_ids: tuple[str, ...]
  blocked_reasons: dict[str, str] = field(default_factory=dict)`,
          },
          {
            kind: 'paragraph',
            text: 'The engineering conclusion is narrow: learned data modifies preference within the permitted action set. It is not an authority to bypass collision, route, placement, reach, combat, or survival gates.',
          },
        ],
      },
      {
        id: 'reading-learned-policies-quality-limit',
        title: 'Quality Limit',
        content: [
          {
            kind: 'paragraph',
            text: 'A passed evaluation records success under the project evaluator’s bounded conditions. It is not proof of optimality, general safety, human-like reasoning, or stable behavior in every world. A policy remains a data artifact whose runtime role is limited by schema, compatibility, evaluation, registry resolution, action masking, and the baseline decision system.',
          },
        ],
      },
    ],
    relatedTitles: ['Reading Demonstration Data', 'Handling Corrupt Learning Rows', 'Reading Saved AI State'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Learning Artifacts',
    title: 'Handling Corrupt Learning Rows',
    description: 'Defines corrupt learning rows through decode failure, skip/count behavior, JSON Lines isolation, serialization failure handling, training consequences, and absence of repair.',
    sections: [
      {
        id: 'handling-corrupt-learning-rows-decoder',
        title: 'Decode Failure',
        content: [
          {
            kind: 'paragraph',
            text: 'A learning row is corrupt when it cannot decode into a `DemonstrationRecord`. The decoder rejects empty text, invalid JSON, and payloads that do not survive record construction. It does not diagnose the cause of corruption. It only determines that the line is not usable as a learning row.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/dataset.py',
            code: `def decode_record_line(line: str) -> DemonstrationRecord | None:
  text = str(line).strip()
  if not text:
    return None
  try:
    payload = json.loads(text)
  except json.JSONDecodeError:
    return None
  return DemonstrationRecord.from_dict(payload)`,
          },
          {
            kind: 'paragraph',
            text: 'The returned `None` has strict meaning. It does not prove whether the writer, a text editor, an interrupted transfer, or a manual merge caused the bad line. It proves only that the row is excluded from the decoded dataset.',
          },
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-reader',
        title: 'Reader Accounting',
        content: [
          {
            kind: 'paragraph',
            text: 'The dataset reader does not abort at the first corrupt line. It counts rejected lines and returns surviving records. This is a data-retention design: usable examples are preserved, but loss is still visible through the corrupt count.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Corrupt rows are skipped and counted.',
            code: `record = decode_record_line(line)
if record is None:
  corrupt += 1
  continue
records.append(record)`,
          },
          {
            kind: 'paragraph',
            text: 'That behavior means training and summaries must use decoded-record counts. A file with one thousand physical lines and one hundred corrupt lines is not a one-thousand-record dataset. It is a nine-hundred-record dataset plus one hundred rejected lines.',
          },
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-serialization',
        title: 'Serialization Failure Isolation',
        content: [
          {
            kind: 'paragraph',
            text: 'The writer also isolates bad rows. It serializes each row independently and drops rows that cannot be converted to JSON. A serialization failure for one row does not prevent later rows from being written.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/ai_learning.py',
            code: `lines: list[str] = []
for row in rows:
  try:
    lines.append(json.dumps(dict(row), ensure_ascii=False, sort_keys=True, separators=(",", ":")))
  except (TypeError, ValueError):
    continue`,
          },
          {
            kind: 'paragraph',
            text: 'The isolation is symmetric with the reader. Write-time failures do not poison the batch, and read-time failures do not poison the entire file. The cost is that a rejected row is not reconstructed later. It never becomes training evidence.',
          },
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-training',
        title: 'Training Consequence',
        content: [
          {
            kind: 'paragraph',
            text: 'Training receives decoded records. Corrupt rows do not become low-weight examples, negative examples, or repair candidates. They are absent from the training input. If a training summary records corrupt-line count, that count is diagnostic metadata about discarded data, not a recovered feature vector.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Do not describe corrupt-row handling as data recovery. The implementation rejects invalid lines and preserves surrounding valid lines. It does not infer the missing observation, action, reward, success flag, or detail mapping.',
            },
          },
          {
            kind: 'paragraph',
            text: [
              'The valid-row schema is defined under ',
              {
                kind: 'link',
                label: 'reading demonstration data',
                href: '/docs/data/learning-and-material-data/learning-artifacts/reading-demonstration-data',
              },
              ', and policy artifacts produced from surviving records are separately constrained by ',
              {
                kind: 'link',
                label: 'learned policy',
                href: '/docs/data/learning-and-material-data/learning-artifacts/reading-learned-policies',
              },
              ' gates.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Reading Demonstration Data', 'Reading Learned Policies', 'Reading Saved AI State'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding Application Output',
    description: 'Classifies ordinary application output as generated data and material evidence, separating serialized state, rendered output, logs, screenshots, recordings, and build artifacts.',
    sections: [
      {
        id: 'understanding-application-output-generated-records',
        title: 'Serialized Output Records',
        content: [
          {
            kind: 'paragraph',
            text: 'Application output includes generated local records such as saved JSON state, learning rows, and cache files. The store layer writes those records through explicit serializers. A generated file is therefore evidence of a writer and schema, not an independent grant of permission or a source-file transformation.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Representative JSON-store write behavior.',
            code: `def write(self, data: dict[str, Any]) -> None:
  self.path.parent.mkdir(parents=True, exist_ok=True)
  tmp = self.path.with_suffix(self.path.suffix + ".tmp")
  tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
  tmp.replace(self.path)`,
          },
          {
            kind: 'paragraph',
            text: 'The temporary-write pattern is a persistence mechanism. It reduces partial-write risk for JSON files, but it does not classify the contents as source, authorize redistribution, or strip embedded protected material. The output must still be analyzed by its writer, schema, and embedded material.',
          },
        ],
      },
      {
        id: 'understanding-application-output-rendered-output',
        title: 'Rendered Output',
        content: [
          {
            kind: 'paragraph',
            text: 'Rendered output includes screenshots, recordings, and visible display state. It can combine user arrangement, runtime state, UI presentation, first-party assets, third-party material, and provenance-sensitive material. The fact that pixels were generated by the renderer does not mean that all embedded material became user-created or legally clean.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The renderer selects a visual asset family before output can contain it.',
            code: `family = "ludoxel" if names and _has_required_block_textures(ludoxel_root / "textures" / "block", names) else "minecraft"`,
          },
          {
            kind: 'paragraph',
            text: 'The asset-family selection is an output precondition. It controls which texture family can appear in rendered output. It does not reclassify provenance-sensitive material as first-party and does not authorize reuse of material visible in the output.',
          },
        ],
      },
      {
        id: 'understanding-application-output-logs',
        title: 'Logs and Reports',
        content: [
          {
            kind: 'paragraph',
            text: [
              'Logs are application output, but they may expose local paths, configuration values, user-authored strings, dataset ids, policy ids, or failure traces. Their evidentiary value for support does not make every field safe for publication. A public report must apply ',
              {
                kind: 'link',
                label: 'secret redaction',
                href: '/docs/support/public-problem-support/evidence-handling/supplying-logs-without-secrets',
              },
              ' before pasting logs or file paths.',
            ],
          },
        ],
      },
      {
        id: 'understanding-application-output-build-artifacts',
        title: 'Build Artifacts Are Not Ordinary Output',
        content: [
          {
            kind: 'paragraph',
            text: [
              'Executables, application bundles, static website output, packaged legal text, and deployment artifacts are generated artifacts, but they are not ordinary gameplay or runtime output. Producing one locally does not create official release authority. Release identification is constrained by ',
              {
                kind: 'link',
                label: 'unofficial release claims',
                href: '/docs/distribution/release-language/public-identification/avoiding-unofficial-release-claims',
              },
              '.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Do not collapse ordinary runtime output and build output into one category. A screenshot, a saved world, a JSON learning row, a Windows executable, and a Vercel static build are all generated in some sense, but they have different owners, retention rules, and authority consequences.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding User-Created Materials', 'Separating Original Materials from Output', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding User-Created Materials',
    description: 'Defines user-created materials through saved state, imported material, world edits, Othello deltas, preferences, learning records, and embedded-material limits.',
    sections: [
      {
        id: 'understanding-user-created-materials-saved-evidence',
        title: 'Saved Evidence',
        content: [
          {
            kind: 'paragraph',
            text: 'User-created material is evidenced by local records the user creates, imports, arranges, or records through ordinary use. World edits appear as explicit block rows. Imported skins appear as local skin files. Preferences appear inside the player-state envelope. Demonstration rows appear as JSON Lines records. Othello book contributions appear as user-only opening-book lines after bundled lines are subtracted.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'World edits are explicit saved block rows.',
            code: `for (x, y, z), s in self.blocks.items():
  items.append([int(x), int(y), int(z), str(s)])`,
          },
          {
            kind: 'paragraph',
            text: 'The block-row form is precise: the user-created contribution in a world is an arrangement over coordinates and block-state strings. It is not a new source file, not a renderer mesh, and not a clean-room replacement for the block definitions or textures the application uses to interpret and display those states.',
          },
        ],
      },
      {
        id: 'understanding-user-created-materials-imported-skin',
        title: 'Imported Material',
        content: [
          {
            kind: 'paragraph',
            text: 'Imported material can be user-created, third-party, or otherwise outside the project’s control. A local `player_skin.png` records that the user supplied an image to the application. It does not prove the user owns the image or that the image is free of outside restrictions.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Player-state schema stores the skin mode that decides whether a custom skin participates.',
            code: `player_skin_mode: str = PLAYER_SKIN_MODE_DEFAULT
player_name: str = ""`,
          },
          {
            kind: 'paragraph',
            text: 'The stored mode and local image path are data facts. They prove configuration and file presence, not external provenance. Documentation must not convert “imported by the user” into “created by the user” without evidence from the actual material.',
          },
        ],
      },
      {
        id: 'understanding-user-created-materials-othello-delta',
        title: 'Othello User Delta',
        content: [
          {
            kind: 'paragraph',
            text: 'The Othello opening-book save path preserves a concrete user-created boundary by subtracting bundled lines. The resulting file is a delta, not a repackaged copy of the bundled opening book.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Bundled lines are removed before user lines are saved.',
            code: `bundled_lines = load_bundled_opening_book_lines()
bundled_set = set(bundled_lines)
user_only_lines = tuple(line for line in merged_lines if line not in bundled_set)`,
          },
          {
            kind: 'paragraph',
            text: 'This is the strongest example of Data-level classification by implementation. The code itself enforces the separation between shipped resource and user contribution. A later material analysis still remains necessary, but the saved file’s intended content is not ambiguous.',
          },
        ],
      },
      {
        id: 'understanding-user-created-materials-embedded-limits',
        title: 'Embedded-Material Limits',
        content: [
          {
            kind: 'paragraph',
            text: [
              'User-created classification describes the user contribution. It does not erase embedded Ludoxel original material, third-party material, or provenance-sensitive material. A save file can be local and user-specific while still referencing application-defined block states. A screenshot can contain user arrangement and protected visual presentation. The separation from repository-controlled material is treated in ',
              {
                kind: 'link',
                label: 'original materials and output',
                href: '/docs/data/learning-and-material-data/output-and-material-boundaries/separating-original-materials-from-output',
              },
              '.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'Do not infer legal cleanliness from the phrase user-created. Local origin, user arrangement, imported file presence, and rights clearance are separate facts.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Application Output', 'Separating Original Materials from Output', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Separating Original Materials from Output',
    description:
      'Separates repository-controlled originals, provenance-sensitive resources, third-party material, ordinary output, and build output by source path, resolver behavior, and embedded-material evidence.',
    sections: [
      {
        id: 'separating-original-materials-repository-material',
        title: 'Repository-Controlled Material',
        content: [
          {
            kind: 'paragraph',
            text: 'Repository-controlled material includes project source, website source, documentation data, shaders, QSS, first-party assets, build tooling, and project-authored explanatory text. It can be read, rendered, packaged, or displayed, but those operations do not convert it into user-created material.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Project-root detection identifies source/resource material by repository markers.',
            code: `def is_project_root(path: Path) -> bool:
  root = Path(path).resolve()
  if (root / "pyproject.toml").is_file():
    return True
  return (root / "assets").is_dir() and (root / "src").is_dir()`,
          },
          {
            kind: 'paragraph',
            text: 'The source predicate is not a permission rule, but it is classification evidence. Material found through a project-root or resource-root path is not local user data merely because the running application later emits output that includes or refers to it.',
          },
        ],
      },
      {
        id: 'separating-original-materials-asset-family',
        title: 'Asset-Family Selection',
        content: [
          {
            kind: 'paragraph',
            text: 'The visual asset resolver demonstrates why output analysis must preserve source family. It selects the first-party `assets/ludoxel` family only when required block textures exist there; otherwise it falls back to the `assets/minecraft` family. The selected family can affect rendered output, thumbnails, and block presentation.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/resources/asset_roots.py',
            code: `family = "ludoxel" if names and _has_required_block_textures(ludoxel_root / "textures" / "block", names) else "minecraft"`,
          },
          {
            kind: 'paragraph',
            text: 'The resolver is a loading mechanism, not a laundering mechanism. Falling back to the Minecraft-named family can make that material visible in output; it does not make the material first-party, public, or reusable without separate authority.',
          },
        ],
      },
      {
        id: 'separating-original-materials-output-composition',
        title: 'Output Composition',
        content: [
          {
            kind: 'paragraph',
            text: 'Ordinary output can be composite. A screenshot can combine user camera position, saved world arrangement, UI presentation, fonts, textures, and renderer output. A saved file can combine user decisions with application-defined identifiers. A recording can include asset-derived audio and visual presentation. Composite output must be decomposed before classification.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Saved world output stores block-state identifiers, not independent asset copies.',
            code: `items.append([int(x), int(y), int(z), str(s)])`,
          },
          {
            kind: 'paragraph',
            text: 'The block-state string is an identifier inside the Ludoxel simulation. It is user-arranged when placed in a saved world, but it still depends on application definitions and rendered assets for interpretation and presentation. Data classification must retain both sides of that composite structure.',
          },
        ],
      },
      {
        id: 'separating-original-materials-permission-limit',
        title: 'Permission Limit',
        content: [
          {
            kind: 'paragraph',
            text: [
              'This Data separation identifies what material is present and where it came from. It does not authorize copying, redistribution, mirroring, packaging, or deployment. Permission remains tied to controlling legal text, including ',
              {
                kind: 'link',
                label: 'original materials',
                href: '/docs/legal/license-authority-and-materials/material-scope/understanding-original-materials',
              },
              ' and ',
              {
                kind: 'link',
                label: 'distribution materials',
                href: '/docs/legal/license-authority-and-materials/material-scope/understanding-distribution-materials',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Application Output', 'Understanding User-Created Materials', 'Understanding Third Party Material Boundaries'],
  }),
  defineDocsArticle({
    category: 'Data',
    subcategory: 'Learning and Material Data',
    group: 'Output and Material Boundaries',
    title: 'Understanding Third Party Material Boundaries',
    description:
      'Defines third-party and provenance-sensitive boundaries through retained license text, dependency/resource categories, asset-family selection, repository presence, runtime loading, and output embedding.',
    sections: [
      {
        id: 'understanding-third-party-material-boundaries-retained-text',
        title: 'Retained Third-Party Text',
        content: [
          {
            kind: 'paragraph',
            text: 'Third-party material is material whose rights holder is not the Ludoxel licensor. The repository includes third-party license text, including the Kaisei Opti font license under `third-party/kaisei-opti/LICENSE.txt`. Retaining that text preserves upstream notice and licensing context for the upstream material; it does not transform the upstream text into the Ludoxel license and does not place Ludoxel originals under the upstream font license.',
          },
          {
            kind: 'code',
            language: 'sh',
            caption: 'Retained license-text location.',
            code: `third-party/
└── kaisei-opti/
    └── LICENSE.txt`,
          },
          {
            kind: 'paragraph',
            text: 'The directory shape is evidence of retained third-party notice. It is not evidence that every asset or output in the application may be reused under that one license. Each material category retains its own source and authority.',
          },
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-provenance-sensitive-assets',
        title: 'Provenance-Sensitive Assets',
        content: [
          {
            kind: 'paragraph',
            text: 'The Minecraft-named asset family and Minecraft-named fonts are provenance-sensitive material. The renderer can load or display such material when the resolver selects that family, but runtime loading is not a rights grant. The implementation can decide what to load; it cannot by that loading decision relicense upstream or provenance-sensitive material.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Asset-family selection can route output through provenance-sensitive material.',
            code: `family = "ludoxel" if names and _has_required_block_textures(ludoxel_root / "textures" / "block", names) else "minecraft"`,
          },
          {
            kind: 'paragraph',
            text: 'The resolver’s fallback logic is exactly why Data documentation must preserve asset family. If output was produced using the fallback family, that fact matters for material classification even when the user’s world arrangement is independently authored.',
          },
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-output-embedding',
        title: 'Output Embedding',
        content: [
          {
            kind: 'paragraph',
            text: 'Output can embed third-party or provenance-sensitive material. A screenshot may contain texture-derived visual material. A recording may contain font rendering, sound, UI presentation, and world rendering. A saved file may contain identifiers that cause later rendering through such assets. Output generation does not clean those embedded restrictions.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Saved output can carry application-defined block-state identifiers.',
            code: `items.append([int(x), int(y), int(z), str(s)])`,
          },
          {
            kind: 'paragraph',
            text: 'The saved row does not copy the texture file, but it can cause a block state to be rendered through an asset family later. That indirect relation is enough to prevent a simplistic “user save equals user-owned clean material” conclusion.',
          },
        ],
      },
      {
        id: 'understanding-third-party-material-boundaries-distribution-notice',
        title: 'Distribution Notice Limit',
        content: [
          {
            kind: 'paragraph',
            text: [
              'Including retained third-party license text in a build or package is a notice-retention operation. It does not relicense third-party material and does not relicense Ludoxel material. Distribution handling of retained text belongs to ',
              {
                kind: 'link',
                label: 'third-party license inclusion',
                href: '/docs/distribution/runtime-inclusions/legal-material-inclusion/including-third-party-license-text',
              },
              '.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Repository presence, runtime loading, output embedding, and notice inclusion are four different facts. None of them alone grants reuse authority over third-party or provenance-sensitive material.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Separating Original Materials from Output', 'Understanding Application Output', 'Understanding User-Created Materials'],
  }),
];
