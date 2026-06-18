/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Home as HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { type DocsBreadcrumb } from '../../../data/docs/collections';

type DocsBreadcrumbLinkProps = {
  breadcrumb: DocsBreadcrumb;
  index: number;
  isLast: boolean;
};

export default function DocsBreadcrumbLink({ breadcrumb, index, isLast }: DocsBreadcrumbLinkProps): React.JSX.Element {
  return (
    <Link
      aria-current={isLast ? 'page' : undefined}
      className={isLast ? 'inline-flex items-center gap-1 whitespace-nowrap font-medium text-foreground' : 'inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground'}
      to={breadcrumb.href}
    >
      {index === 0 ? <HomeIcon className="h-4 w-4 shrink-0" /> : null}
      <span className="whitespace-nowrap">{breadcrumb.label}</span>
    </Link>
  );
}
