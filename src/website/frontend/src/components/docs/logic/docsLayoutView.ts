/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getDocsBreadcrumbs, getDocsCollectionBreadcrumbs } from '../../../data/docs/collections';
import { type DocsLayoutProps, type DocsLayoutView } from './docsLayout.types';

export function getDocsLayoutView(props: DocsLayoutProps): DocsLayoutView {
  if ('page' in props) {
    return {
      kind: 'article',
      title: props.page.title,
      description: props.page.description,
      breadcrumbs: getDocsBreadcrumbs(props.page),
      page: props.page,
    };
  }

  return {
    kind: 'collection',
    title: props.collection.title,
    description: props.collection.description,
    breadcrumbs: getDocsCollectionBreadcrumbs(props.collection),
    collection: props.collection,
  };
}

export function getDocsLayoutClassName(view: DocsLayoutView): string {
  return view.kind === 'article' ? 'mx-auto flex w-full max-w-[90rem] grow items-start pt-16 lg:pl-64 xl:pr-56' : 'mx-auto flex w-full max-w-[90rem] grow items-start pt-16 lg:pl-64';
}

export function getDocsContentWidthClassName(view: DocsLayoutView): string {
  if (view.kind === 'article') {
    return 'w-full max-w-3xl';
  }

  return view.collection.pathSegments.length === 0 ? 'w-full max-w-6xl' : 'w-full max-w-5xl';
}
