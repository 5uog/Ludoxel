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
            text: 'Ludoxel derives user data from a runtime data root selected by `default_runtime_data_root` in `src/ludoxel/foundations/locations/roots.py`. Its signature accepts `project_root` and resolves it in an otherwise unused guarded branch, while `LUDOXEL_DATA_ROOT`, platform environment variables, and user-profile data directories select the result. Repository checkout and executable-container locations have no role in that selection.',
          },
          {
            kind: 'paragraph',
            text: '`LUDOXEL_DATA_ROOT` is the only branch that can displace the platform data directory. When it is present, the returned root is the expanded and resolved override path. When it is absent, the resolver selects `LOCALAPPDATA` or `AppData` on Windows, `~/Library/Application Support/Ludoxel` on macOS, `XDG_DATA_HOME/ludoxel` on XDG systems, and finally `~/.local/share/ludoxel`. The path is fixed by those inputs for the running process; neither the source tree nor the website documentation participates in that decision.',
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
            text: 'The environment-override branch is the first hard boundary: `LUDOXEL_DATA_ROOT` relocates the complete runtime tree before any store computes `state` or `cache`. An observed absolute path therefore proves only the final resolver output. It fixes neither the platform branch that produced it nor repository ownership, and it carries no permission to copy the file. Correct reading names the resolver branch, the relative file below `state` or `cache`, and the store that consumes that relative path.',
          },
          {
            kind: 'paragraph',
            text: '`AppStateStore._data_root` in `src/ludoxel/application/persistence/stores/app.py` consumes the selected root and derives `state/player_state.json` and `state/world_state.json` through `_state_path`. `load()` reads each envelope through `_read_runtime_or_previous`, then feeds `PlayerStateFile.from_dict` and `WorldStateFile.from_dict` into one `AppState`; `save()` writes both JSON envelopes before `update_runtime_integrity_manifest` refreshes their protected entries. The resolver output reaches a concrete store, schema admission path, and integrity update sequence.',
          },
          {
            kind: 'paragraph',
            text: '`default_runtime_data_root`, `AppStateStore`, the envelope readers, and the integrity manifest form a consecutive persistence chain. The root resolver admits an override or platform location; `_state_path` turns that root into named state files; `JsonFileStore` supplies the write boundary; schema readers reconstruct typed player and world members; and `update_runtime_integrity_manifest` records the protected-file state after the write. Session construction consumes the resulting `AppState`, while render and simulation code consume the reconstituted runtime objects. A directory listing proves none of the intermediate admissions, schema branches, or later session state without the corresponding resolver, store, and reader evidence.',
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
        id: 'locating-user-data-integrity-leaves',
        title: 'Integrity Leaves Remain Under State',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/locations/roots.py` derives `state_manifest.json` and `integrity_key.bin` below `runtime_state_root(data_root)`; the cache remains a sibling below the same data root. `src/ludoxel/application/persistence/integrity/manifest.py` consumes the state paths to read, write, and verify integrity material, while `src/ludoxel/application/persistence/stores/othello_book.py` places its compiled opening-book cache below `runtime_cache_root`. The location helper composes paths. Manifest bytes, cache contents, schema interpretation, cryptographic semantics, and deletion policy remain with their respective owners.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/locations/roots.py',
            code: `def runtime_state_manifest_path(data_root: Path) -> Path:
  return runtime_state_root(data_root) / "state_manifest.json"


def runtime_integrity_key_path(data_root: Path) -> Path:
  return runtime_state_root(data_root) / "integrity_key.bin"`,
          },
          {
            kind: 'paragraph',
            text: 'The path composition settles location, not disposition. A resolved path can establish that a file belongs beneath the runtime state or cache tree; it cannot establish that the file is expendable, that its contents are valid, or that a path name authorizes copying it elsewhere.',
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
            text: 'The resulting local data tree contains several distinct persistence families: player state, world state, runtime integrity material, AI learning state, demonstration datasets, learned policies, training and evaluation records, Othello user opening-book lines, and rebuildable Othello cache data. A path below the runtime root identifies which store family produced the file, which schema admitted it, and whether deletion removes primary state or only a derived cache. It does not decide whether the contents may be copied, published, or redistributed.',
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
            text: '`AppStateStore._read_runtime_or_previous` makes this sharper than a directory map. Runtime files are read first, protected runtime files are verified before trust, and the old `configs` path is consulted only when the runtime file is absent. Location, integrity admission, and legacy migration are therefore three separate questions. Collapsing them into “where the JSON is” loses the actual control flow.',
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
                'A resolved data path establishes runtime placement. Legal permission, release status, support eligibility, and disclosure treatment remain governed by their respective legal and policy sources.',
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
            text: 'Ludoxel distinguishes a project root from a runtime data root by predicate, not by intuition. A project root is identified by repository markers: `pyproject.toml`, or the joint presence of `assets` and `src`. That predicate classifies a tree as repository material for source and resources, so a checkout it identifies stays out of the persistence target, the user-data namespace, and the cleanup root even when the process was launched from inside it.',
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
            text: 'The fallback is migration evidence, not a current write contract. It proves that older records can be imported when no runtime file exists. It does not prove that modern state belongs in the repository, that repository-local files should be edited to repair runtime state, or that the project root has become mutable application storage.',
          },
          {
            kind: 'paragraph',
            text: 'The write path is one-way in the current implementation. `AppStateStore.save` constructs `PlayerStateFile` and `WorldStateFile`, writes them through `_player_store` and `_world_store`, and then updates the runtime integrity manifest for `state/player_state.json` and `state/world_state.json`. There is no symmetric save branch back into `configs`; legacy data enters the runtime model only as a read fallback.',
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
            text: 'Cleanup must target the active resolver result, not a guessed directory. If `LUDOXEL_DATA_ROOT` is set, the platform default directory is not the active tree. If it is absent, an arbitrary override path is irrelevant. The runtime data-root function therefore controls cleanup before any file is removed, and every later deletion statement must be expressed relative to that resolved root.',
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
            text: 'Bounding cleanup to the resolved data root heads off two common errors: deleting the wrong local directory, and describing source-tree cleanup as saved-data cleanup. Data cleanup reaches the resolved data root and its `state` and `cache` children only; it does not clean Vite output, PyInstaller output, dependency directories, generated thumbnails in the repository, package staging directories, bundled resources, or license files.',
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
  version: int = 8
  current_space_id: str = PLAY_SPACE_MY_WORLD
  settings: PersistedSettings = field(default_factory=PersistedSettings)
  inventory: PersistedInventory = field(default_factory=PersistedInventory)
  othello_settings: OthelloSettings = field(default_factory=OthelloSettings)`,
          },
          {
            kind: 'paragraph',
            text: 'The dataclass composition makes the deletion consequence explicit. Removing `player_state.json` removes every field in the envelope, reaching past the visual preferences into the current play-space id, inventory, and standing Othello settings. The application can construct defaults, but it cannot reconstruct the discarded local values from those defaults.',
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
          {
            kind: 'paragraph',
            text: 'The implementation also normalizes the dataset id before any dataset path is formed. `_safe_name` lowercases the identifier, replaces characters outside `abcdefghijklmnopqrstuvwxyz0123456789_-` with underscores, and falls back to `default` when the result is empty. Dataset cleanup is therefore a bounded unlink against normalized current and legacy dataset file names, with the raw UI-supplied path never reaching the file system directly.',
          },
        ],
      },
      {
        id: 'cleaning-local-user-data-integrity',
        title: 'Integrity Manifest Consequences',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/integrity/manifest.py` owns the runtime-file verification and manifest-update path. Its `state_manifest.json` and `integrity_key.bin` control whether protected runtime files are accepted: verification returns true for a missing target file, true when no manifest entries exist, and false when a listed file exists but the key is missing.',
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
            text: 'Partial integrity deletion can therefore produce non-obvious results. Removing the protected file itself makes the store load defaults. Removing only the key leaves protected files present but unverifiable when manifest entries refer to them. Removing the manifest suppresses manifest-based verification of remaining files. None of those operations repairs data, certifies correctness, or authorizes manual edits; they only change the verification path.',
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
    description:
      'Defines saved preferences through the player-state envelope, `PersistedSettings`, audio vectors, cloud ranges, keybind canonicalization, runtime projection, shadow quality normalization, legacy key migration, and integrity failure.',
    sections: [
      {
        id: 'reading-saved-preferences-envelope',
        title: 'Player-State Envelope',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schema/files.py` owns the versioned `PlayerStateFile` envelope for `player_state.json`. Saved preferences are therefore not stored as a separate preference-only file: `settings` is one envelope member beside the current play-space id, inventory, and standing Othello settings.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/files.py',
            code: `@dataclass(frozen=True)
class PlayerStateFile:
  version: int = 8
  current_space_id: str = PLAY_SPACE_MY_WORLD
  settings: PersistedSettings = field(default_factory=PersistedSettings)
  inventory: PersistedInventory = field(default_factory=PersistedInventory)
  othello_settings: OthelloSettings = field(default_factory=OthelloSettings)`,
          },
          {
            kind: 'paragraph',
            text: 'The schema composition is operationally important. A failure to load `player_state.json` affects more than camera or audio. It can also affect inventory and current-space selection because the file envelope groups those records. `PlayerStateFile` and its persisted fields identify the relevant evidence; a visible UI preference cannot establish which serialized member, coercion path, or fallback branch supplied the runtime value.',
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schema/app.py` owns `AppState`, the in-memory persistence aggregate that joins the current-space id, settings, inventory, standing Othello settings, My World state, and Othello state. It is intentionally not a universal codec: `PlayerStateFile` and `WorldStateFile` divide that aggregate into separately versioned on-disk envelopes, while the subordinate schema modules retain their own conversion rules.',
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schema/inventory.py` owns the persisted hotbar branches as explicit schema. Its reader admits the earlier shared hotbar keys, then constructs creative, survival, Othello, and route branches with each branch’s slot normalization and selected-index bounds. A malformed branch falls back through its own default slots and index while the remaining player-state envelope remains available.',
          },
        ],
      },
      {
        id: 'reading-saved-preferences-schema-coercion',
        title: 'Schema Coercion and Bounds',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schema/settings.py` owns `PersistedSettings`, the saved-data admission point for runtime preferences. It applies the specialized preference normalizers: `AudioPreferences` for category gains, `normalize_cloud_speed_range` and `normalize_cloud_height_settings` for cloud ranges, `KeybindSettings` for portable keyboard bindings, `RuntimePreferences` for default values, and `normalize_shadow_map_quality` for the shadow-specific quality tier.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/settings.py',
            code: `from ludoxel.application.preferences.audio import AudioPreferences
from ludoxel.application.preferences.clouds import normalize_cloud_height_settings, normalize_cloud_speed_range
from ludoxel.application.preferences.keybinds import KeybindSettings
from ludoxel.application.preferences.runtime import RuntimePreferences
from ludoxel.application.preferences.shadow import SHADOW_MAP_QUALITY_DEFAULT, normalize_shadow_map_quality`,
          },
          {
            kind: 'paragraph',
            text: 'The `__post_init__` path is part of the saved-data contract. Even when `PersistedSettings.from_dict` receives numbers from JSON coercion, the dataclass construction still reprojects cloud speeds, cloud heights, and shadow quality into the ranges maintained by the preference modules. Stored JSON is therefore not a direct renderer or input parameter; it is an input to a normalization boundary.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Preference construction reuses the same normalization functions as runtime code.',
            code: `speed_min, speed_max = normalize_cloud_speed_range(self.cloud_speed_min_blocks_per_second, self.cloud_speed_max_blocks_per_second)
fixed_y, spawn_y_min, spawn_y_max, preferred_y_min, preferred_y_max, probability = normalize_cloud_height_settings(
  self.cloud_fixed_y, self.cloud_spawn_y_min, self.cloud_spawn_y_max, self.cloud_preferred_y_min, self.cloud_preferred_y_max, self.cloud_preferred_y_probability_percent
)
object.__setattr__(self, "shadow_map_quality", normalize_shadow_map_quality(self.shadow_map_quality))`,
          },
        ],
      },
      {
        id: 'reading-saved-preferences-audio-vector',
        title: 'Audio Preference Vector',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/audio.py` defines a four-component gain vector: `master`, `ambient`, `block`, and `player`. Each component is projected onto the closed interval `[0, 1]` by `_clamp_volume`. Failed `float` conversion selects the provided default, itself `1.0` by default, before clamping supplies the persisted category gain.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Audio gain values are finite category coefficients before playback consumes them.',
            code: `def _clamp_volume(value: object, *, default: float = 1.0) -> float:
  try:
    numeric = float(value)
  except Exception:
    numeric = float(default)
  return float(clampf(float(numeric), 0.0, 1.0))

@dataclass(frozen=True)
class AudioPreferences:
  master: float = 1.0
  ambient: float = 1.0
  block: float = 1.0
  player: float = 1.0`,
          },
          {
            kind: 'paragraph',
            text: 'The effective category gain is multiplicative. `volume_for("ambient")` returns `master * ambient`, `volume_for("block")` returns `master * block`, and `volume_for("player")` returns `master * player`. Asking for `master` itself, or for an unknown category, returns only `master`; unknown category text remains outside the saved category set. `to_dict` serializes the flat four-key vector, while `from_dict` treats a non-dictionary input as default audio preferences.',
          },
        ],
      },
      {
        id: 'reading-saved-preferences-cloud-ranges',
        title: 'Cloud Speed and Height Ranges',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/clouds.py` gives cloud movement and cloud height data explicit numerical domains. Per-cloud horizontal speed is a block-per-second interval. Both endpoints are clamped to `[0, 4]`, and an inverted interval is swapped so persistence, the Settings UI, and the renderer receive the shared invariant `min_speed <= max_speed`.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Cloud speed endpoints are clamped and then ordered.',
            code: `def normalize_cloud_speed_range(min_speed: object, max_speed: object) -> tuple[float, float]:
  lo = clampf(float(min_speed), float(CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND), float(CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND))
  hi = clampf(float(max_speed), float(CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND), float(CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND))
  if float(lo) > float(hi):
    lo, hi = float(hi), float(lo)
  return (float(lo), float(hi))`,
          },
          {
            kind: 'paragraph',
            text: 'Cloud altitude settings use the same boundary discipline. Fixed height, spawn range, and preferred height range are integer Y coordinates clamped to `[28, 250]`. Inverted spawn and preferred intervals are exchanged, and the preferred interval is then projected inside the normalized spawn interval. The preferred-Y probability is not a raw percentage string or unbounded integer; it is clamped to `[0, 100]` before the tuple is returned.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The preferred cloud band is constrained by both global Y limits and the spawn band.',
            code: `fixed = clampi(int(fixed_y), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
spawn_lo = clampi(int(spawn_y_min), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
spawn_hi = clampi(int(spawn_y_max), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
if int(spawn_lo) > int(spawn_hi):
  spawn_lo, spawn_hi = int(spawn_hi), int(spawn_lo)

preferred_lo = clampi(int(preferred_y_min), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
preferred_hi = clampi(int(preferred_y_max), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
if int(preferred_lo) > int(preferred_hi):
  preferred_lo, preferred_hi = int(preferred_hi), int(preferred_lo)
preferred_lo = clampi(int(preferred_lo), int(spawn_lo), int(spawn_hi))
preferred_hi = clampi(int(preferred_hi), int(spawn_lo), int(spawn_hi))

probability = clampi(int(preferred_y_probability_percent), 0, 100)`,
          },
        ],
      },
      {
        id: 'reading-saved-preferences-keybind-canonicalization',
        title: 'Keybind Canonicalization',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/keybinds.py` treats keybinds as a fixed action-to-portable-text mapping. `keybind_actions()` returns the stable action order used by persistence, the settings surface, and duplicate-binding resolution; hotbar actions appear at the end in slot order from 1 through 9. `default_keybinds_map()` returns a new dictionary so callers cannot mutate the module constant by accident.',
          },
          {
            kind: 'paragraph',
            text: 'The portable binding language is intentionally narrow. It accepts known single-key names, aliases such as `Esc` / `Escape` and `Ctrl` / `Control`, ASCII letters and digits, function keys, navigation keys, and modifier keys as single keys. It rejects modifier sequences, multi-key sequences, comma-separated alternatives, and unknown names by normalizing them to the empty binding. An empty binding is runtime `None` and displays as `Unbound`.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Binding text is normalized before it can become a runtime key code.',
            code: `def _normalize_binding_text_cached(raw: str) -> str:
  source = str(raw).strip()
  if not source:
    return ""
  if "+" in source or "," in source:
    return ""
  compact = " ".join(source.replace("_", " ").replace("-", " ").split()).lower()
  collapsed = compact.replace(" ", "")
  return str(_KEY_ALIASES.get(compact, _KEY_ALIASES.get(collapsed, ""))).strip()

def _binding_to_key_cached(normalized_binding: str) -> int | None:
  if not normalized_binding:
    return None
  key = _KEY_CODE_BY_NAME.get(str(normalized_binding))
  return int(key) if key is not None and int(key) > 0 else None`,
          },
          {
            kind: 'paragraph',
            text: '`_normalized_bindings_from_items` resolves duplicate bindings during canonicalization. It starts with every known action, ignores unknown action identifiers, and gives the later action the key when the same normalized binding appears twice. The earlier action is cleared, preserving a one-key-to-one-action runtime lookup. `KeybindSettings.__post_init__` then builds both `action -> key` and `key -> action` maps, so viewport, inventory, HUD, and hotbar input paths share the same comparison rule.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Duplicate binding resolution clears the older action and records the later owner.',
            code: `if normalized_binding:
  previous_action = seen_by_binding.get(str(normalized_binding))
  if previous_action is not None and previous_action in normalized:
    normalized[str(previous_action)] = ""
  seen_by_binding[str(normalized_binding)] = str(normalized_action)

normalized[str(normalized_action)] = str(normalized_binding)`,
          },
        ],
      },
      {
        id: 'reading-saved-preferences-runtime-projection',
        title: 'Runtime Projection and Hotbar Branches',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/runtime.py` is the mutable runtime form that consumes persisted settings after schema admission. Its `normalize()` method reprojects booleans, finite numeric ranges, hotbar branches, play-space identifiers, Othello settings, keybinds, and audio preferences into one canonical object before renderer state, session code, or input handling consumes them. `clone()` and `coerce_runtime_preferences()` return a normalized structural copy, isolating the source object from partial mutation.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Runtime normalization gathers saved preference families into one mutable contract.',
            code: `self.current_space_id = normalize_play_space_id(self.current_space_id)
self.shadow_map_quality = normalize_shadow_map_quality(self.shadow_map_quality)
self.player_name = normalize_player_name(self.player_name)
self.crosshair_mode = normalize_crosshair_mode(self.crosshair_mode)
self.camera_perspective = normalize_camera_perspective(self.camera_perspective)
self.keybinds = self.keybinds.normalized()
self.audio = self.audio.normalized()`,
          },
          {
            kind: 'paragraph',
            text: 'Window position fields deliberately use partial integer coercion. `_coerce_optional_int` keeps `None` as `None`, converts valid integers, and returns `None` on failed conversion. Invalid saved window geometry is therefore treated as absent placement information, not as coordinate zero. This matters because coordinate zero is a real desktop position while absence means the runtime may choose another placement.',
          },
          {
            kind: 'paragraph',
            text: 'Hotbar state contains dedicated Othello, route-edit, creative, and survival branches. Runtime selects the active branch in that order. The active branch controls `active_hotbar_index`, `hotbar_snapshot`, `current_item_id`, `current_block_id`, `current_special_item_id`, assignment, selection, cycling, and clearing. Each mutating operation normalizes before it writes, keeping malformed saved indices and slot sequences outside runtime lookup.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The active hotbar branch is selected before item identity is interpreted.',
            code: `def _active_hotbar_state_attrs(self) -> tuple[str, str]:
  if self.is_othello_space():
    return ("othello_hotbar_slots", "othello_selected_hotbar_index")
  if bool(self.route_edit_active):
    return ("route_hotbar_slots", "route_selected_hotbar_index")
  if bool(self.creative_mode):
    return ("creative_hotbar_slots", "creative_selected_hotbar_index")
  return ("survival_hotbar_slots", "survival_selected_hotbar_index")

def current_block_id(self) -> str | None:
  item_id = self.current_item_id()
  if item_id is None or is_special_item_id(item_id):
    return None
  return item_id`,
          },
          {
            kind: 'paragraph',
            text: 'My World carries a per-mode upper inventory beneath the hotbar. `creative_upper_slots` and `survival_upper_slots` each hold a twenty-seven-slot upper inventory ordered row-major. `_my_world_upper_attr` resolves the active branch from `creative_mode`, so the runtime reads `my_world_upper_snapshot` and rewrites it through `set_my_world_upper_slots`. `normalize()` reprojects each branch through `normalize_upper_inventory_slots`, padding or truncating a saved sequence to its fixed length, and `PersistedInventory` serializes the per-mode hotbar and upper branches into `player_state.json`. The inventory crafting grid is a transient presentation working area: the overlay empties it into the storage when it closes, so no crafting field reaches the runtime or the saved envelope.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The active My World upper-inventory branch resolves from the game mode.',
            code: `def _my_world_upper_attr(self) -> str:
  return "creative_upper_slots" if bool(self.creative_mode) else "survival_upper_slots"`,
          },
          {
            kind: 'paragraph',
            text: '`view_model_visible` is also a runtime projection, not a saved Boolean. The renderer draws the first-person arm, held block, and special item only when the normalized perspective is first person and `hide_hand` is false. Cycling the camera perspective goes through the finite order in the camera preference module, so keybind and UI paths cannot invent an unsupported camera identifier.',
          },
        ],
      },
      {
        id: 'reading-saved-preferences-shadow-quality',
        title: 'Shadow Quality Contract',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/shadow.py` defines shadow-map quality as a discrete five-step value, not as render distance and not as a free numeric multiplier. The allowed values are 1 `Lowest`, 2 `Low`, 3 `Standard`, 4 `High`, and 5 `Ultra`. The tier controls the shadow-map and shadow-shader quality policy, while render distance remains a separate chunk-visibility setting.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Shadow quality admits only the five declared tiers.',
            code: `SHADOW_MAP_QUALITY_LABELS: dict[int, str] = {
  SHADOW_MAP_QUALITY_LOWEST: "Lowest",
  SHADOW_MAP_QUALITY_LOW: "Low",
  SHADOW_MAP_QUALITY_STANDARD: "Standard",
  SHADOW_MAP_QUALITY_HIGH: "High",
  SHADOW_MAP_QUALITY_ULTRA: "Ultra",
}

def normalize_shadow_map_quality(value: object) -> int:
  try:
    quality = int(value)
  except (TypeError, ValueError):
    return int(SHADOW_MAP_QUALITY_DEFAULT)
  if quality < int(SHADOW_MAP_QUALITY_MIN) or quality > int(SHADOW_MAP_QUALITY_MAX):
    return int(SHADOW_MAP_QUALITY_DEFAULT)
  return int(quality)`,
          },
          {
            kind: 'paragraph',
            text: 'Missing, old-format, type-invalid, and out-of-range saved values converge to the `Standard` tier, tier 3. Render-distance changes leave that value intact. Renderer state admits the normalized tier and excludes `Lowest`, `Ultra`, and every unassigned quality level when saved input falls outside the domain.',
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
              'A stored preference changes runtime behavior only when the consumer reads the loaded settings object. Camera, audio, keybind, render-distance, cloud, and shadow systems consume values after schema normalization and runtime projection. Visible adjustment belongs to Settings surfaces such as ',
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
            text: '`player_state.json` is also protected by runtime integrity. A manually modified file can fail verification before its JSON is trusted. A missing, unreadable, non-object, or unverifiable file falls back through default construction. The data boundary is therefore stricter than “JSON exists”: the record must be in the active runtime path, pass the store read path, survive integrity admission where applicable, and then survive schema normalization.',
          },
          {
            kind: 'paragraph',
            text: '`verify_runtime_file` applies HMAC verification when a manifest entry exists. An absent protected file, an absent or empty manifest, and a path without a manifest entry remain accepted states; an existing entry requires a readable integrity key and an exact path-bound HMAC match. The HMAC input contains the relative path, a NUL separator, and file bytes, binding each digest to its protected relative path.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/integrity/manifest.py',
            code: `if not path.exists():
  return True

files = manifest.get("files", {})
if not isinstance(files, dict) or not files:
  return True

if not key_path.is_file():
  return False

expected_entry = files.get(_display_relative(relative_path))
if not isinstance(expected_entry, dict):
  return True`,
          },
        ],
      },
      {
        id: 'reading-saved-preferences-paired-store-admission',
        title: 'Paired Store Admission and Atomic Commit',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/stores/app.py` owns paired player/world state load and save; it does not treat a legacy file as a repair source for an invalid active runtime file. `_read_runtime_or_previous` reads `state/player_state.json` or `state/world_state.json` from the runtime root when that path exists, and returns no record when the corresponding HMAC verification fails. It visits the previous configuration root only when the active runtime path is absent. `load` returns `None` only when both envelopes are unavailable; otherwise it passes each missing half as an empty mapping to the appropriate envelope reader and reconstitutes one `AppState` aggregate from the current-space, settings, inventory, standing Othello settings, My World, and Othello members. The result is a partial state reconstruction with explicit defaults, not a splice of untrusted active data and legacy data.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/app.py',
            code: `if runtime_path.exists():
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
            text: '`src/ludoxel/application/persistence/stores/json_file.py` owns dictionary-only JSON reads and the temporary-file write protocol. `JsonFileStore.write` gives each accepted dictionary a temporary sibling path, flushes and fsyncs the encoded JSON, replaces the target, and then removes a surviving temporary path. `AppStateStore.save` writes the player and world envelopes before refreshing the protected-file manifest. This sequence reduces a torn JSON write, but it does not make hand-edited data trustworthy: integrity verification and each envelope reader remain separate admission stages on the next load.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/json_file.py',
            code: `f = None
try:
  f = open(tmp, "w", encoding="utf-8", newline="\\n")
  f.write(data)
  f.flush()
  os.fsync(f.fileno())
finally:
  if f is not None:
    try:
      f.close()
    except OSError:
      pass`,
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
            text: '`WorldState` persists blocks as explicit coordinate/state rows. The saved representation contains user-visible block states keyed by integer coordinates and a revision counter that records world mutation. Procedural seeds, chunk caches, and renderer meshes remain runtime representations outside that saved shape.',
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
            text: 'That representation has two consequences. First, the saved world is exactly the surviving explicit cell map, not an instruction to regenerate the same terrain. Second, the revision number belongs to mutation tracking inside `WorldState`; it is not a release version, schema version, proof of content authorship, or substitute for the `WorldStateFile.version` envelope.',
          },
        ],
      },
      {
        id: 'reading-saved-world-state-play-space-composition',
        title: 'Play-Space Composition',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schema/play_space.py` owns `PersistedPlaySpace`, the common My World envelope composed from a player record, a world record, and AI actor rows. The block list does not contain the player pose or AI configuration; the AI records do not contain the world block map. The generic play-space envelope deliberately does not carry Othello match state, so loading it cannot be treated as a substitute for the Othello persistence envelope.',
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
            text: 'The composition explains why deleting or corrupting one subrecord does not have the same meaning as deleting a whole world. A valid block map without the prior player pose is not the original play space. A valid Othello match without its surrounding space data is not the complete saved state. A save-file analysis must preserve the envelope, the space key, and the member record that actually failed.',
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schema/player.py` owns the persisted player codec: position and velocity triples, yaw and pitch, on-ground and flight flags, movement cooldown and crouch offset, and health. Its triplet coercion falls back to declared defaults for a non-three-element value, and its reader keeps `max_health` at least one. This is a player-state repair boundary, not a world generator or a renderer pose implementation.',
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schema/world.py` owns the adapter between the persisted `revision` and explicit block map and simulation `WorldState` serialization. It delegates decoding to the world-state persistence reader and snapshots the blocks back into the application schema; it does not serialize player, AI, inventory, or view state.',
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schema/ai_player.py` owns the persisted AI actor row and its conversion to and from normalized `AiPlayerState`. It admits actor identity, behavior and regeneration settings, skin selection, position and velocity, health, and route data; notably, a custom skin mode without a normalized skin id retreats to the shared player-skin mode. An AI row is therefore neither the common play-space envelope nor the learning-artifact store.',
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
            text: 'The row decoder preserves valid saved state and discards malformed coordinates or block states. A world loaded after row removal may remain usable, yet its accepted rows define a different state from the file that valid rows would have produced; skipped rows remain lost data.',
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
      {
        id: 'reading-saved-world-state-session-rehydration',
        title: 'Session Rehydration Is Not World Generation',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/schedulers/state.py` owns application-level restore and save sequencing between persisted state, prepared sessions, runtime preferences, and renderer projection. Its `apply_persisted_state_if_present` restores a saved player, block map, and AI tuple into a session that has already been constructed by its factory. Its My World path does not replace a newly generated world when the persisted map is empty and its revision is non-positive; otherwise it replaces the complete block snapshot at a revision of at least one. The Othello path follows the same restore sequence, then ensures the board layout and removes an invalid below-board player position. Loading is therefore a controlled mutation of a prepared session, not a second generator and not an instruction for the renderer to reconstruct world state.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schedulers/state.py',
            code: `def _maybe_replace_world(session: SessionManager, persisted_world: PersistedWorld) -> None:
  if not persisted_world.blocks and int(persisted_world.revision) <= 0:
    return
  session.world.replace_all(blocks={key: str(value) for (key, value) in persisted_world.blocks.items()}, revision=int(max(1, int(persisted_world.revision))))`,
          },
          {
            kind: 'paragraph',
            text: '`PersistedPlayer.from_dict` supplies typed position, velocity, orientation, health, flight, cooldown, and crouch values to the scheduler; malformed coordinate triples fall back to their declared defaults and maximum health is never restored below one. `PersistedPlaySpace` keeps that player record, `PersistedWorld`, and normalized `PersistedAiPlayer` rows together. The enclosing `WorldStateFile` remains the source that distinguishes the My World and Othello keys, including the older one-space migration path.',
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
      'Separates persisted AI actors, learning settings, demonstration datasets, learned policies, evaluation summaries, and training histories through the schema module that admits values and the store module that owns runtime files.',
    sections: [
      {
        id: 'reading-saved-ai-state-artifact-families',
        title: 'AI Artifact Families',
        content: [
          {
            kind: 'paragraph',
            text: 'Saved AI learning data spans several files under two authorities. `src/ludoxel/application/persistence/schema/ai_learning.py` owns the admitted value domains and JSON envelope. `src/ludoxel/application/persistence/stores/ai_learning.py` owns the runtime file family below the user data root: `state/ai_learning.json`, `state/learning/demonstrations/<dataset>.jsonl`, `state/learning/policies/<policy_id>.json`, `state/learning/evaluations/<policy_id>.json`, and `state/learning/training_runs/<run_id>.json`. The schema tells the reader which values are admitted; the store tells the reader where admitted data is retained.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/ai_learning.py',
            code: `@dataclass(frozen=True)
class PersistedAiLearningState:
  settings: PersistedAiLearningSettings = field(default_factory=PersistedAiLearningSettings)
  dataset_summary: dict[str, Any] = field(default_factory=dict)
  last_training_summary: dict[str, Any] = field(default_factory=dict)
  last_evaluation_summary: dict[str, Any] = field(default_factory=dict)
  policy_version: int = 0
  schema_version: int = AI_LEARNING_SCHEMA_VERSION`,
          },
          {
            kind: 'paragraph',
            text: 'The learning-state envelope records settings and summaries. It is not the demonstration dataset and not the policy corpus. `dataset_summary`, `last_training_summary`, and `last_evaluation_summary` are mapping-shaped reports admitted as shallow copies; their presence does not prove that every underlying dataset row is clean or that the selected policy is usable at runtime.',
          },
        ],
      },
      {
        id: 'reading-saved-ai-state-settings-schema',
        title: 'Learning Settings Schema',
        content: [
          {
            kind: 'paragraph',
            text: '`PersistedAiLearningSettings` stores the editable learning contract: five-value learning mode, record-kind capture flags, skill-category flags, selected policy kind, selected policy id, and dataset id. Defaults are restrictive where mutation would be dangerous: capture flags default to false, so a missing settings file does not begin recording demonstrations; skill flags default to true, preserving the full skill domain for learning and evaluation unless explicitly narrowed.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/ai_learning.py',
            code: `@dataclass(frozen=True)
class PersistedAiLearningSettings:
  learning_mode: str = LEARNING_MODE_OFF
  capture_flags: dict[str, bool] = field(default_factory=dict)
  skill_flags: dict[str, bool] = field(default_factory=dict)
  selected_policy_kind: str = POLICY_KIND_BUILTIN
  selected_policy_id: str = ""
  dataset_id: str = "default"`,
          },
          {
            kind: 'paragraph',
            text: 'Normalization is a value-domain filter, not a cosmetic cleanup. `learning_mode` is restricted to the five learning constants; selected policy kind is restricted to the known policy families; capture flags are rebuilt against `RECORD_KINDS` with default `False`; skill flags are rebuilt against `skill_category_ids()` with default `True`; and an empty dataset id becomes `default`. Unknown keys do not survive into the normalized object.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/ai_learning.py',
            code: `return PersistedAiLearningSettings(
  learning_mode=normalize_learning_mode(self.learning_mode),
  capture_flags=_normalize_flag_map(self.capture_flags, keys=RECORD_KINDS, default=False),
  skill_flags=_normalize_flag_map(self.skill_flags, keys=skill_category_ids(), default=True),
  selected_policy_kind=normalize_policy_kind(self.selected_policy_kind),
  selected_policy_id=str(self.selected_policy_id).strip(),
  dataset_id=str(dataset_id),
)`,
          },
        ],
      },
      {
        id: 'reading-saved-ai-state-mode-derived-values',
        title: 'Mode-Derived Values',
        content: [
          {
            kind: 'paragraph',
            text: 'The saved mapping includes the derived key `observe_only`, but the truth source remains `learning_mode`. `recording_enabled()` returns true only for `observe_only`; `captured_kinds()` returns an empty tuple when recording is disabled and otherwise returns enabled record kinds in `RECORD_KINDS` order. Restoring a stale derived key cannot force recording when the normalized mode is not observe-only.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/ai_learning.py',
            code: `def to_dict(self) -> dict[str, Any]:
  normalized = self.normalized()
  return {
    "learning_mode": str(normalized.learning_mode),
    "capture_flags": dict(normalized.capture_flags),
    "skill_flags": dict(normalized.skill_flags),
    "selected_policy_kind": str(normalized.selected_policy_kind),
    "selected_policy_id": str(normalized.selected_policy_id),
    "dataset_id": str(normalized.dataset_id),
    "observe_only": bool(normalized.recording_enabled()),
  }`,
          },
          {
            kind: 'paragraph',
            text: 'Reading a saved file by inspecting one boolean therefore misstates it. The correct data reading is the normalized settings object, the derived recording predicate, and the capture flag map after unknown keys have been discarded. A hand-edited `observe_only` key is at most stale metadata.',
          },
        ],
      },
      {
        id: 'reading-saved-ai-state-store-paths',
        title: 'Store Paths and Safe Identifiers',
        content: [
          {
            kind: 'paragraph',
            text: '`AiLearningStore` writes only below the runtime data root. It does not write datasets, policies, evaluations, or training histories into `assets`, `src`, `resources`, `third-party`, or the repository root. Logical identifiers are converted by `_safe_name`, which lowercases the string, retains only ASCII letters, digits, underscore, and hyphen, replaces every other character with underscore, strips edge underscores, and falls back to `default` or the supplied fallback when the result is empty. Path separators and dot segments are therefore not identifier semantics.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/ai_learning.py',
            code: `def _safe_name(identifier: str, *, fallback: str = "default") -> str:
  lowered = str(identifier).strip().lower()
  filtered = "".join(character if character in _SAFE_NAME_CHARS else "_" for character in lowered).strip("_")
  return filtered or str(fallback)

def dataset_path(self, dataset_id: str) -> Path:
  return self._learning_root() / _DEMONSTRATIONS_DIR_NAME / f"{_safe_name(dataset_id)}.jsonl"

def policy_path(self, policy_id: str) -> Path:
  return self._learning_root() / _POLICIES_DIR_NAME / f"{_safe_name(policy_id)}.json"`,
          },
          {
            kind: 'paragraph',
            text: 'Legacy demonstration files at `state/learning/<dataset>.jsonl` remain readable only as compatibility input. New writes go to `state/learning/demonstrations/<dataset>.jsonl`. Summary, export, and decode paths choose the new file when it exists, the legacy file when only it exists, and the new path otherwise. Compatibility reading does not make the legacy path a current write target.',
          },
        ],
      },
      {
        id: 'reading-saved-ai-state-default-and-corruption',
        title: 'Default and Corruption Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`PersistedAiLearningState.default()` returns off mode, an empty recorded-kind set, all skill categories admitted, built-in deterministic policy selection, empty summaries, and policy version zero. `load_state()` selects that default when the JSON file is absent or unreadable. The default keeps recording off, selects the known baseline policy, and leaves training behavior disabled.',
          },
          {
            kind: 'paragraph',
            text: 'The data consequence is strict. A saved AI-learning state file can be read as local state only after schema admission, and that local-state reading is all it supports; public-dataset status, proof of policy quality, and distribution authority come from none of it. Demonstration rows, learned policies, evaluations, and training histories each have their own articles because each file family has a different producer, reader, corruption mode, and evidentiary limit.',
          },
        ],
      },
      {
        id: 'reading-saved-ai-state-actor-rows-and-writers',
        title: 'Actor Rows and Demonstration Writes Fail Independently',
        content: [
          {
            kind: 'paragraph',
            text: '`PersistedAiPlayer` serializes a session actor’s identity, mode, personality, held item, appearance, regeneration values, pose, health, flight flag, and route state, separate from the learning-state envelope; its conversion to `AiPlayerState` re-applies the simulation normalizers. A custom AI skin mode without a normalized skin identifier is reduced to the player-skin mode, and malformed route points or out-of-range regeneration values are filtered by that conversion. These rows belong to each saved play space, whereas the learning-state file selects recording and policy behavior across the runtime.',
          },
          {
            kind: 'paragraph',
            text: 'The demonstration writer has a different failure boundary. It serializes each candidate mapping independently, skips rows that cannot become JSON, and emits no dataset write when no rows survive. Valid lines are appended, flushed, and fsynced. One non-serializable record leaves accepted rows intact and remains excluded from the dataset.',
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
    continue
if not lines:
  return 0

target = Path(self.path)
target.parent.mkdir(parents=True, exist_ok=True)
with open(target, "a", encoding="utf-8", newline="\\n") as handle:
  for line in lines:
    handle.write(line)
    handle.write("\\n")
  handle.flush()
  os.fsync(handle.fileno())
return len(lines)`,
          },
        ],
      },
    ],
    relatedTitles: ['Reading Demonstration Data', 'Reading Learned Policies', 'Choosing a Learning Mode'],
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
            text: '`src/ludoxel/application/persistence/schema/othello.py` owns `PersistedOthelloSpace`, the application persistence envelope for the Othello play space. It combines the player, world, AI actor tuple, and `OthelloGameState`; it is not interchangeable with the common `PersistedPlaySpace` because the latter has no match-state field. Othello match state is therefore stored inside this play-space envelope, not in a separate match-only file. The `OthelloGameState` member contains board state, lifecycle status, per-match settings, sides, side to move, clocks, move and pass counts, winner, last move, legal moves, thinking state, and pending animations.',
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
            text: 'The normalization shows that saved Othello state is not a passive JSON dump. A finished game cannot persist active thinking or animation state as if the engine were still calculating. Load-time coercion clears transient active-state fields and returns a state that the match controller can consume without inheriting stale engine work.',
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
            text: '`save_user_opening_book_lines` establishes the relevant material-classification operation. It normalizes the effective line corpus, loads bundled lines, builds a bundled set, and writes the user delta through the application-provided hook. The resulting opening-book file records lines absent from the bundled set even when the effective in-memory book merges both sources; repository-resource duplication remains outside this storage path.',
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/persistence/stores/othello_book.py` supplies that hook. It writes the user-only payload to `state/othello_opening_book.json` and refreshes that file’s manifest entry; its compiled representation is read and written separately below the runtime cache root. A failed user-delta integrity check returns no payload to the opening-book layer, while a missing or deleted compiled cache affects only cache lookup. The two files are not interchangeable copies and must not be deleted, copied, or edited as if they had the same restoration consequence.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/othello_book.py',
            code: `def _save_user_opening_book_lines(project_root_key: str, lines: tuple[tuple[int, ...], ...]) -> None:
  data_root = Path(normalize_opening_book_root(project_root_key))
  _write_json_file(user_opening_book_file_path(data_root), opening_book_lines_payload(tuple(lines)))
  update_runtime_integrity_manifest(data_root, ("state/othello_opening_book.json",))

def _load_compiled_opening_book_cache(project_root_key: str, _fingerprint: str) -> object:
  return _read_json_file(compiled_opening_book_cache_file_path(project_root_key))`,
          },
        ],
      },
      {
        id: 'reading-saved-othello-state-cache-deletion',
        title: 'Compiled Cache Deletion',
        content: [
          {
            kind: 'paragraph',
            text: 'The compiled book cache is a derived index keyed by the effective line fingerprint. Removing the cache forces recompilation from surviving bundled and user lines. Removing the user delta discards user contribution. Removing the bundled resource damages shipped material. These three operations have different effects despite all being connected to “the opening book.”',
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
            text: 'A demonstration row is a `DemonstrationRecord`, not a video frame, replay file, save replay, or opaque neural input. The schema pairs an observation mapping with an action id and supplements it with kind, tick, actor id, success, reward, detail, and schema version. The row is therefore a typed learning datum whose meaning depends on both the outer kind and the inner observation/action fields.',
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
            text: 'A row count derived from the physical file is therefore not the training count. Training receives decoded records, not physical lines. Corrupt physical lines remain evidence of discarded input, not usable examples and not negative examples.',
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
              'A demonstration dataset establishes that examples were recorded and decoded. Training success, model quality, and permission to repurpose data outside the application require their respective governing evidence. Rows that fail decoding are handled in ',
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
  negative_modifiers: dict[str, float] = field(default_factory=dict)
  utility_score_modifiers: dict[str, float] = field(default_factory=dict)
  evaluation: dict[str, Any] = field(default_factory=dict)
  schema_version: int = POLICY_SCHEMA_VERSION
  compatibility_target: str = POLICY_COMPATIBILITY_TARGET`,
          },
          {
            kind: 'paragraph',
            text: 'The record shape rejects inflated descriptions of learning. A policy modifies scores and weights. Executable behavior remains in the planner, physics, placement policy, collision system, and combat-eligibility checks.',
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
            text: '`is_usable` is the hard boundary between readable policy data and a policy permitted to influence runtime. A JSON file can be syntactically readable and still be barred from behavior because its schema version, compatibility target, feature encoder version, action catalog version, or evaluation result fails the gate.',
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
            text: 'Policy modifiers cannot make forbidden actions legal. The planner and action mask decide which actions are candidates. Policy weights can bias candidate scoring, but they do not revive actions that the action mask has excluded, so simulation constraints hold even when a learned artifact is active.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Action-mask construction remains separate from policy scoring.',
            code: `@dataclass(frozen=True)
class AiActionMask:
  allowed: frozenset[str] = field(default_factory=frozenset)
  forbidden: dict[str, str] = field(default_factory=dict)`,
          },
          {
            kind: 'paragraph',
            text: 'The engineering conclusion is narrow: learned data modifies preference within the permitted action set after `build_action_mask` and the deterministic baseline have constructed the candidate space. It is not an authority to bypass collision, route, placement, reach, combat, survival gates, or the deterministic fallback path.',
          },
          {
            kind: 'paragraph',
            text: '`DeterministicPolicy.decide` confirms the limit. It builds or receives an action mask, scores only allowed actions, optionally applies policy weights to those scores, and chooses by ranked utility with deterministic tie-breaking. The learned artifact changes numeric preference; it does not insert new executable action code into the simulation.',
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
            text: 'A learning row is corrupt when it cannot decode into a `DemonstrationRecord`. The decoder rejects empty text, invalid JSON, and payloads that do not survive record construction. It does not diagnose the cause of corruption, infer intent, or repair the value. It only determines that the line is not usable as a learning row.',
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
            text: 'That behavior means training and summaries must use decoded-record counts. A file with one thousand physical lines and one hundred corrupt lines loads as a nine-hundred-record dataset plus one hundred rejected lines, short of the one thousand records a line tally would suggest.',
          },
        ],
      },
      {
        id: 'handling-corrupt-learning-rows-serialization',
        title: 'Serialization Failure Isolation',
        content: [
          {
            kind: 'paragraph',
            text: 'The writer also isolates bad rows. `DemonstrationDatasetWriter.write_records` serializes each row independently and drops rows that cannot be converted to JSON. A serialization failure for one row does not prevent later rows from being written, and the returned count is the number actually appended.',
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
            text: 'Application output includes generated local records such as saved JSON state, learning rows, and cache files. The store layer writes those records through explicit serializers such as `JsonFileStore.write`, `DemonstrationDatasetWriter.write_records`, and opening-book storage hooks. A generated file is therefore evidence of a writer, schema, relative path, and embedded identifiers, not an independent grant of permission or a source-file transformation.',
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
            text: 'The temporary-write pattern is a persistence mechanism. `JsonFileStore.write` emits sorted compact JSON to a `.tmp` sibling, fsyncs it, and replaces the target path. That reduces partial-write risk for JSON files, but it does not classify the contents as source, authorize redistribution, or strip embedded protected material. The output must still be analyzed by its writer, schema, and embedded material.',
          },
        ],
      },
      {
        id: 'understanding-application-output-rendered-output',
        title: 'Rendered Output',
        content: [
          {
            kind: 'paragraph',
            text: 'Rendered output includes screenshots, recordings, and visible display state. It can combine user arrangement, runtime state, UI presentation, first-party assets, third-party material, and provenance-sensitive material. Rendering preserves the origin and legal status of each embedded material.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'The renderer selects a visual asset family before output can contain it.',
            code: `family = "ludoxel" if names and _has_required_block_textures(ludoxel_root / "textures" / "block", names) else "minecraft"`,
          },
          {
            kind: 'paragraph',
            text: 'The asset-family selection is an output precondition. It controls which texture family can appear in rendered output. Provenance-sensitive material retains its classification, and reuse authority follows its governing legal source.',
          },
          {
            kind: 'paragraph',
            text: 'Build artifacts require separate treatment. A packaged application, copied license file, generated thumbnail, compiled native extension, or Vercel deployment output can be an implementation result without becoming ordinary application output. Data classification stops at the writer and material composition; release authority belongs to Distribution and Legal analysis.',
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
            text: 'User-created material is evidenced by local records the user creates, imports, arranges, or records through ordinary use, but the evidence remains file- and schema-specific. World edits appear as explicit block rows. Imported skins appear as local skin files. Preferences appear inside the player-state envelope. Demonstration rows appear as JSON Lines records. Othello book contributions appear as user-only opening-book lines after bundled lines are subtracted.',
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
            text: 'The block-row form is precise: the user-created contribution in a world is an arrangement over coordinates and block-state strings, which leaves it short of a new source file, a renderer mesh, or a clean-room replacement for the block definitions or textures the application uses to interpret and display those states.',
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
            code: `player_skin_kind: str = PLAYER_SKIN_KIND_ALEX
player_name: str = ""`,
          },
          {
            kind: 'paragraph',
            text: 'The stored `player_skin_kind` and local image file are data facts. They prove configuration and file presence, not external provenance. Documentation must not convert “imported by the user” into “created by the user” without evidence from the actual material.',
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
            text: '`save_user_opening_book_lines` enforces the implementation-level separation between shipped resource and user contribution. Its stored file contains the user delta admitted by the storage hook after bundled lines have been removed. Subsequent material analysis still evaluates permission and provenance through their governing sources, while the storage operation identifies the file’s intended content.',
          },
          {
            kind: 'paragraph',
            text: 'The same caution applies to imported skins and demonstrations. `player_skin.png` can evidence an imported local image, and a JSON Lines record can evidence a captured observation/action pair, but neither file proves external authorship or clean rights. Data records show what Ludoxel accepted and where it stored it; they do not certify provenance outside the application.',
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
              content: 'The phrase user-created identifies local origin. User arrangement, imported-file presence, and rights clearance remain separate facts.',
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
            text: 'Repository-controlled material includes project source, website source, documentation data, shaders, QSS, first-party assets, build tooling, package resources, and project-authored explanatory text. It can be read, rendered, packaged, displayed, or copied into an artifact, but those operations do not convert it into user-created material.',
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
            text: 'The source predicate supplies classification evidence. Material found through a project-root or resource-root path retains repository/resource status when later output includes, renders, copies, or refers to it; permission remains a separate legal question.',
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
            text: 'The block-state string is an identifier inside the Ludoxel simulation. It is user-arranged when placed in a saved world, but it still depends on application definitions, block registries, model selection, texture names, and rendered assets for interpretation and presentation. Data classification must retain both sides of that composite structure.',
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
              'The producer/store separation identifies what material is present and where it came from. Controlling legal text determines copying, redistribution, mirroring, packaging, and deployment authority, including ',
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
            text: 'Third-party material has a rights holder distinct from the Ludoxel licensor. The repository includes third-party license text, including the Kaisei Opti font license under `third-party/kaisei-opti/LICENSE.txt`. Retained text preserves upstream notice and licensing context; the Ludoxel license continues to govern Ludoxel Original Materials.',
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
            text: 'The directory shape is evidence of retained third-party notice. It is not evidence that every asset, font, texture, sound, screenshot, save file, or output in the application may be reused under that one license. Each material category retains its own source and authority.',
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
            text: 'Output can embed third-party or provenance-sensitive material. A screenshot may contain texture-derived visual material. A recording may contain font rendering, sound, UI presentation, and world rendering. A saved file may contain identifiers that cause later rendering through such assets. Output generation does not clean those embedded restrictions, and the data file’s user-controlled arrangement does not launder the material used to display it.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'Saved output can carry application-defined block-state identifiers.',
            code: `items.append([int(x), int(y), int(z), str(s)])`,
          },
          {
            kind: 'paragraph',
            text: 'The saved row carries block-state identifiers that can later select an asset family for rendering. The resulting dependency between saved identifiers and provenance-sensitive resources prevents a user-save classification from resolving asset ownership or legal clearance.',
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
              'Including retained third-party license text in a build or package is a notice-retention operation. Third-party terms continue to govern third-party material, and the Ludoxel license continues to govern Ludoxel material. Distribution handling of retained text belongs to ',
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
