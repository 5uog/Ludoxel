/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import { type NavigationItem } from '../../../data/navigation';
import { isNavigationItemActive } from '../logic/headerNavigationState';

type MobileHeaderNavigationItemProps = {
  currentPath: string;
  item: NavigationItem;
  onNavigate: () => void;
};

export default function MobileHeaderNavigationItem({ currentPath, item, onNavigate }: MobileHeaderNavigationItemProps): React.JSX.Element {
  const isActive = isNavigationItemActive(currentPath, item.href);
  const className = `px-4 py-3 text-base font-medium rounded-xl transition-colors ${isActive ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`;

  return (
    <Link className={className} to={item.href} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}
