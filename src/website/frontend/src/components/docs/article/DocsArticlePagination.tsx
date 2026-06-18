/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import { type DocsArticlePaginationLink, type DocsArticlePaginationLinks } from '../../../data/docs/articles';

type DocsArticlePaginationProps = {
  links: DocsArticlePaginationLinks;
};

type DocsArticlePaginationLinkProps = {
  direction: 'previous' | 'next';
  link: DocsArticlePaginationLink;
};

type DocsArticlePaginationChevronProps = {
  direction: 'previous' | 'next';
};

const CHEVRON_CLASS_NAME = 'h-1.5 stroke-gray-400 overflow-visible transition-colors group-hover:stroke-white';

function DocsArticlePaginationChevron({ direction }: DocsArticlePaginationChevronProps): React.JSX.Element {
  const className = direction === 'next' ? `rotate-180 ${CHEVRON_CLASS_NAME}` : CHEVRON_CLASS_NAME;

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 3 6">
      <path d="M3 0L0 3L3 6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function DocsArticlePaginationItem({ direction, link }: DocsArticlePaginationLinkProps): React.JSX.Element {
  const isNext = direction === 'next';
  const label = isNext ? `Next article: ${link.title}` : `Previous article: ${link.title}`;
  const linkClassName = isNext ? 'ml-auto flex items-center space-x-3 group text-white' : 'flex items-center space-x-3 group text-white';

  if (isNext) {
    return (
      <Link aria-label={label} className={linkClassName} to={link.href}>
        <span className="text-white transition-colors group-hover:text-white">{link.title}</span>
        <DocsArticlePaginationChevron direction="next" />
      </Link>
    );
  }

  return (
    <Link aria-label={label} className={linkClassName} to={link.href}>
      <DocsArticlePaginationChevron direction="previous" />
      <span className="text-white transition-colors group-hover:text-white">{link.title}</span>
    </Link>
  );
}

export default function DocsArticlePagination({ links }: DocsArticlePaginationProps): React.JSX.Element | null {
  if (links.previous === null && links.next === null) {
    return null;
  }

  return (
    <div className="px-0.5 flex items-center text-sm font-semibold text-white" id="pagination">
      {links.previous ? <DocsArticlePaginationItem direction="previous" link={links.previous} /> : null}
      {links.next ? <DocsArticlePaginationItem direction="next" link={links.next} /> : null}
    </div>
  );
}
