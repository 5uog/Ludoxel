/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import { type NavigationItem } from '../../../../data/navigation';
import { isNavigationItemActive } from '../../lib/headerNavigationState';

type DesktopHeaderNavigationItemProps = {
  currentPath: string;
  item: NavigationItem;
};

export default function DesktopHeaderNavigationItem({ currentPath, item }: DesktopHeaderNavigationItemProps): React.JSX.Element {
  const isActive = isNavigationItemActive(currentPath, item.href);
  const className = `px-3 py-2 text-sm font-medium transition-colors rounded-xl ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <Link className={className} to={item.href}>
      {item.label}
    </Link>
  );
}
