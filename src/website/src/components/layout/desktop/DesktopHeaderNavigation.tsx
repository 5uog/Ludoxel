/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { mainNavigation } from '../../../data/navigation';
import DesktopHeaderNavigationItem from './DesktopHeaderNavigationItem';

type DesktopHeaderNavigationProps = {
  currentPath: string;
};

export default function DesktopHeaderNavigation({ currentPath }: DesktopHeaderNavigationProps): React.JSX.Element {
  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
      {mainNavigation.map((item) => (
        <DesktopHeaderNavigationItem currentPath={currentPath} item={item} key={item.href} />
      ))}
    </nav>
  );
}
