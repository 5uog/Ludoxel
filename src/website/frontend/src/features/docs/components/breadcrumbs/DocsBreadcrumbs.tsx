/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ChevronRight } from 'lucide-react';

import { type DocsBreadcrumb } from '../../../../data/docs/collections';
import DocsBreadcrumbLink from './DocsBreadcrumbLink';

type DocsBreadcrumbsProps = {
  breadcrumbs: DocsBreadcrumb[];
};

export default function DocsBreadcrumbs({ breadcrumbs }: DocsBreadcrumbsProps): React.JSX.Element {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap" key={breadcrumb.href}>
            {index === 0 ? null : <ChevronRight className="h-4 w-4 shrink-0" />}
            <DocsBreadcrumbLink breadcrumb={breadcrumb} index={index} isLast={isLast} />
          </div>
        );
      })}
    </nav>
  );
}
