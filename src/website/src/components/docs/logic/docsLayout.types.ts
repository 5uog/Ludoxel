/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsBreadcrumb, type DocsCollection } from '../../../data/docs/collections';
import { type DocsPageContent } from '../../../data/docs/types';

export type DocsLayoutProps =
  | {
      page: DocsPageContent;
    }
  | {
      collection: DocsCollection;
    };

export type DocsLayoutArticleView = {
  kind: 'article';
  title: string;
  description: string;
  breadcrumbs: DocsBreadcrumb[];
  page: DocsPageContent;
};

export type DocsLayoutCollectionView = {
  kind: 'collection';
  title: string;
  description: string;
  breadcrumbs: DocsBreadcrumb[];
  collection: DocsCollection;
};

export type DocsLayoutView = DocsLayoutArticleView | DocsLayoutCollectionView;
