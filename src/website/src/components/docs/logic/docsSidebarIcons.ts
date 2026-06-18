/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { FileText, Layers, Settings, Shield, Sparkles, Wrench } from 'lucide-react';
import { type ComponentType } from 'react';

import { type DocsSidebarItem } from '../../../data/docs/navigation';

export const docsSidebarIconMap: Record<DocsSidebarItem['icon'], ComponentType<{ className?: string }>> = {
  file: FileText,
  wrench: Wrench,
  layers: Layers,
  settings: Settings,
  sparkles: Sparkles,
  shield: Shield,
};
