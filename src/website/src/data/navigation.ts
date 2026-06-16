/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type NavigationItem = {
  label: string;
  href: string;
};

export type DocsSidebarItem = {
  title: string;
  href: string;
  icon: 'file' | 'wrench' | 'layers' | 'settings' | 'sparkles' | 'shield';
};

export type DocsSidebarSection = {
  title: string;
  items: DocsSidebarItem[];
};

export const docsHomeHref = '/docs/application-overview';

export const mainNavigation: NavigationItem[] = [
  {
    label: 'Docs',
    href: docsHomeHref,
  },
  {
    label: 'Changelog',
    href: '/changelog',
  },
];

export const docsSidebarSections: DocsSidebarSection[] = [
  {
    title: 'Manual',
    items: [
      { title: 'Application Overview', href: '/docs/application-overview', icon: 'file' },
      { title: 'Starting and Main Window', href: '/docs/starting-and-main-window', icon: 'file' },
      { title: 'Session Operation', href: '/docs/session-operation', icon: 'layers' },
      { title: 'Basic Controls and Input', href: '/docs/basic-controls-and-input', icon: 'settings' },
      { title: 'World Interaction', href: '/docs/world-interaction', icon: 'sparkles' },
      { title: 'Inventory and Hotbar', href: '/docs/inventory-and-hotbar', icon: 'file' },
      { title: 'Player Identity and Skin', href: '/docs/player-identity-and-skin', icon: 'file' },
      { title: 'Pause, Death, and Recovery', href: '/docs/pause-death-and-recovery', icon: 'shield' },
      { title: 'Othello Mode Operation', href: '/docs/othello-mode-operation', icon: 'sparkles' },
      { title: 'AI NPC Operation', href: '/docs/ai-npc-operation', icon: 'wrench' },
      { title: 'Settings Entry Points', href: '/docs/settings-entry-points', icon: 'settings' },
    ],
  },
  {
    title: 'Gameplay',
    items: [
      { title: 'My World Mode', href: '/docs/my-world-mode', icon: 'sparkles' },
      { title: 'World Generation and Spawn', href: '/docs/world-generation-and-spawn', icon: 'layers' },
      { title: 'Movement and Collision', href: '/docs/movement-and-collision', icon: 'layers' },
      { title: 'Block Breaking and Placement', href: '/docs/block-breaking-and-placement', icon: 'layers' },
      { title: 'Block Shapes and Support', href: '/docs/block-shapes-and-support', icon: 'layers' },
      { title: 'Inventory Items', href: '/docs/inventory-items', icon: 'file' },
      { title: 'Special Items', href: '/docs/special-items', icon: 'sparkles' },
      { title: 'Player Combat and Damage', href: '/docs/player-combat-and-damage', icon: 'shield' },
      { title: 'AI NPC Combat and Navigation', href: '/docs/ai-npc-combat-and-navigation', icon: 'wrench' },
      { title: 'AI NPC Placement Behavior', href: '/docs/ai-npc-placement-behavior', icon: 'wrench' },
      { title: 'Othello Match Flow', href: '/docs/othello-match-flow', icon: 'sparkles' },
      { title: 'Othello Items and Hotbar', href: '/docs/othello-items-and-hotbar', icon: 'file' },
      { title: 'Death Messages and Respawn', href: '/docs/death-messages-and-respawn', icon: 'shield' },
    ],
  },
  {
    title: 'Systems',
    items: [
      { title: 'World Runtime', href: '/docs/world-runtime', icon: 'layers' },
      { title: 'Session State Ownership', href: '/docs/session-state-ownership', icon: 'layers' },
      { title: 'Block and Placement Rules', href: '/docs/block-and-placement-rules', icon: 'layers' },
      { title: 'Rendering Backends', href: '/docs/rendering-backends', icon: 'layers' },
      { title: 'OpenGL Renderer', href: '/docs/opengl-renderer', icon: 'layers' },
      { title: 'WGPU Renderer', href: '/docs/wgpu-renderer', icon: 'layers' },
      { title: 'Shadows and Distance Fog', href: '/docs/shadows-and-distance-fog', icon: 'layers' },
      { title: 'Audio and Visual Feedback', href: '/docs/audio-and-visual-feedback', icon: 'wrench' },
      { title: 'Input and Mouse Capture', href: '/docs/input-and-mouse-capture', icon: 'settings' },
      { title: 'HUD and Overlay State', href: '/docs/hud-and-overlay-state', icon: 'layers' },
      { title: 'AI NPC Behavior', href: '/docs/ai-npc-behavior', icon: 'wrench' },
      { title: 'AI Learning', href: '/docs/ai-learning', icon: 'wrench' },
      { title: 'Persistence and Saved State', href: '/docs/persistence-and-saved-state', icon: 'shield' },
      { title: 'Othello Engine', href: '/docs/othello-engine', icon: 'wrench' },
      { title: 'Native Extensions', href: '/docs/native-extensions', icon: 'wrench' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { title: 'Settings Overview', href: '/docs/settings-overview', icon: 'settings' },
      { title: 'Runtime Settings', href: '/docs/runtime-settings', icon: 'settings' },
      { title: 'Camera Settings', href: '/docs/camera-settings', icon: 'settings' },
      { title: 'Audio Settings', href: '/docs/audio-settings', icon: 'settings' },
      { title: 'Cloud Settings', href: '/docs/cloud-settings', icon: 'settings' },
      { title: 'Cloud Flow Settings', href: '/docs/cloud-flow-settings', icon: 'settings' },
      { title: 'Shadow Settings', href: '/docs/shadow-settings', icon: 'settings' },
      { title: 'Crosshair Settings', href: '/docs/crosshair-settings', icon: 'settings' },
      { title: 'Keybind Settings', href: '/docs/keybind-settings', icon: 'settings' },
      { title: 'Player Name Settings', href: '/docs/player-name-settings', icon: 'settings' },
      { title: 'Player Skin Settings', href: '/docs/player-skin-settings', icon: 'settings' },
      { title: 'AI Settings', href: '/docs/ai-settings', icon: 'settings' },
      { title: 'AI Learning Settings', href: '/docs/ai-learning-settings', icon: 'settings' },
      { title: 'Othello Settings', href: '/docs/othello-settings', icon: 'settings' },
      { title: 'Settings Persistence', href: '/docs/settings-persistence', icon: 'shield' },
      { title: 'Settings Apply Timing', href: '/docs/settings-apply-timing', icon: 'settings' },
      { title: 'Performance Boundaries', href: '/docs/performance-boundaries', icon: 'wrench' },
    ],
  },
  {
    title: 'Data',
    items: [
      { title: 'User Data Root', href: '/docs/user-data-root', icon: 'shield' },
      { title: 'Saved Settings', href: '/docs/saved-settings', icon: 'shield' },
      { title: 'Saved Session State', href: '/docs/saved-session-state', icon: 'shield' },
      { title: 'AI Learning Data Files', href: '/docs/ai-learning-data-files', icon: 'shield' },
      { title: 'Othello Data Files', href: '/docs/othello-data-files', icon: 'shield' },
      { title: 'Generated Application Output', href: '/docs/generated-application-output', icon: 'file' },
      { title: 'User-Created Materials', href: '/docs/data-user-created-materials', icon: 'file' },
      { title: 'Application Output Boundary', href: '/docs/application-output-boundary', icon: 'file' },
      { title: 'Data Failure Handling', href: '/docs/data-failure-handling', icon: 'shield' },
    ],
  },
  {
    title: 'Distribution',
    items: [
      { title: 'Desktop Distribution Overview', href: '/docs/desktop-distribution-overview', icon: 'wrench' },
      { title: 'Windows Executable', href: '/docs/windows-executable', icon: 'file' },
      { title: 'macOS Application Bundle', href: '/docs/macos-application-bundle', icon: 'file' },
      { title: 'Native Extensions', href: '/docs/native-extensions-distribution', icon: 'wrench' },
      { title: 'PyInstaller Build Flow', href: '/docs/pyinstaller-build-flow', icon: 'wrench' },
      { title: 'Generated Artifacts', href: '/docs/generated-artifacts', icon: 'file' },
      { title: 'Legal Materials in Distribution', href: '/docs/legal-materials-in-distribution', icon: 'shield' },
      { title: 'Release Verification', href: '/docs/release-verification', icon: 'shield' },
      { title: 'Build Failure Boundaries', href: '/docs/build-failure-boundaries', icon: 'wrench' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { title: 'License Authority', href: '/docs/license-authority', icon: 'shield' },
      { title: 'Ordinary Application Use', href: '/docs/ordinary-application-use', icon: 'shield' },
      { title: 'Prohibited Use', href: '/docs/prohibited-use', icon: 'shield' },
      { title: 'AI Use Restrictions', href: '/docs/ai-use-restrictions', icon: 'shield' },
      { title: 'Distribution Materials', href: '/docs/distribution-materials', icon: 'shield' },
      { title: 'Official Distribution', href: '/docs/official-distribution', icon: 'shield' },
      { title: 'Third-Party Materials', href: '/docs/third-party-materials', icon: 'file' },
      { title: 'Provenance-Sensitive Materials', href: '/docs/provenance-sensitive-materials', icon: 'file' },
      { title: 'User-Created Materials', href: '/docs/user-created-materials', icon: 'file' },
      { title: 'Application Output', href: '/docs/application-output', icon: 'file' },
      { title: 'Security Reports', href: '/docs/security-reports', icon: 'shield' },
      { title: 'Public Issues', href: '/docs/public-issues', icon: 'shield' },
      { title: 'External Contribution Boundary', href: '/docs/external-contribution-boundary', icon: 'shield' },
      { title: 'GitHub Platform Terms Boundary', href: '/docs/github-platform-terms-boundary', icon: 'shield' },
      { title: 'Legal Disputes', href: '/docs/legal-disputes', icon: 'shield' },
      { title: 'Warranty and Liability', href: '/docs/warranty-and-liability', icon: 'shield' },
      { title: 'Controlling Text', href: '/docs/controlling-text', icon: 'shield' },
    ],
  },
  {
    title: 'Support',
    items: [
      { title: 'Support Overview', href: '/docs/support-overview', icon: 'file' },
      { title: 'Problem Reports', href: '/docs/problem-reports', icon: 'file' },
      { title: 'Limited Questions', href: '/docs/limited-questions', icon: 'file' },
      { title: 'Security Contact', href: '/docs/security-contact', icon: 'shield' },
      { title: 'Public Issue Boundary', href: '/docs/public-issue-boundary', icon: 'shield' },
      { title: 'Useful Report Content', href: '/docs/useful-report-content', icon: 'file' },
      { title: 'Unsupported Requests', href: '/docs/unsupported-requests', icon: 'file' },
    ],
  },
  {
    title: 'Developer',
    items: [
      { title: 'Source Structure', href: '/docs/source-structure', icon: 'layers' },
      { title: 'Runtime Responsibility Boundaries', href: '/docs/runtime-responsibility-boundaries', icon: 'layers' },
      { title: 'Repository Policy', href: '/docs/repository-policy', icon: 'shield' },
      { title: 'Audit and Check Commands', href: '/docs/audit-and-check-commands', icon: 'wrench' },
      { title: 'Tooling Overview', href: '/docs/tooling-overview', icon: 'wrench' },
      { title: 'Build Tools', href: '/docs/build-tools', icon: 'wrench' },
      { title: 'Formatting and Linting Tools', href: '/docs/formatting-and-linting-tools', icon: 'wrench' },
      { title: 'Resource and Shader Checks', href: '/docs/resource-and-shader-checks', icon: 'wrench' },
      { title: 'GitHub Policy Files', href: '/docs/github-policy-files', icon: 'file' },
      { title: 'CI and Dependency Policy', href: '/docs/ci-and-dependency-policy', icon: 'wrench' },
      { title: 'README Role', href: '/docs/readme-role', icon: 'file' },
      { title: 'Contribution Boundary', href: '/docs/contribution-boundary', icon: 'shield' },
      { title: 'Security Reporting for Maintainers', href: '/docs/security-reporting-for-maintainers', icon: 'shield' },
    ],
  },
];

export const getStartedHref = 'https://github.com/5uog/Ludoxel';
