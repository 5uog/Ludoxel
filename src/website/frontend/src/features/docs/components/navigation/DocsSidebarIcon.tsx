/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { FileText, Layers, Settings, Shield, Sparkles, Wrench } from 'lucide-react';

import { type DocsSidebarItem } from '../../../../data/docs/navigation';

type DocsSidebarIconProps = {
  className?: string;
  icon: DocsSidebarItem['icon'];
};

const docsSidebarIconMap = {
  file: FileText,
  wrench: Wrench,
  layers: Layers,
  settings: Settings,
  sparkles: Sparkles,
  shield: Shield,
} satisfies Record<DocsSidebarItem['icon'], React.ComponentType<{ className?: string }>>;

export default function DocsSidebarIcon({ className, icon }: DocsSidebarIconProps): React.JSX.Element {
  const Icon = docsSidebarIconMap[icon];

  return <Icon className={className} aria-hidden="true" />;
}
