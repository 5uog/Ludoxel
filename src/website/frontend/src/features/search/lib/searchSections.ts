/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Clock, FileText, Layers, Settings, Shield, Sparkles, Wrench } from 'lucide-react';

import { type SearchSectionMeta } from '../types/searchCommand.types';

const SECTION_META: Record<string, SearchSectionMeta> = {
  manual: {
    label: 'Manual',
    Icon: FileText,
  },
  gameplay: {
    label: 'Gameplay',
    Icon: Sparkles,
  },
  systems: {
    label: 'Systems',
    Icon: Layers,
  },
  settings: {
    label: 'Settings',
    Icon: Settings,
  },
  data: {
    label: 'Data',
    Icon: FileText,
  },
  distribution: {
    label: 'Distribution',
    Icon: Wrench,
  },
  legal: {
    label: 'Legal',
    Icon: Shield,
  },
  support: {
    label: 'Support',
    Icon: FileText,
  },
  application: {
    label: 'Application',
    Icon: FileText,
  },
  project: {
    label: 'Project',
    Icon: Shield,
  },
  updates: {
    label: 'Updates',
    Icon: Clock,
  },
};

export function getSectionMeta(sectionKey: string): SearchSectionMeta {
  return (
    SECTION_META[sectionKey] ?? {
      label: sectionKey,
      Icon: FileText,
    }
  );
}
