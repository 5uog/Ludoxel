/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export type DocsHighlightTokenKind = 'plain' | 'comment' | 'keyword' | 'control' | 'modifier' | 'string' | 'number' | 'function' | 'type' | 'property' | 'constant' | 'variable' | 'tag' | 'attribute' | 'operator' | 'punctuation' | 'regex' | 'inserted' | 'deleted' | 'meta';

export type DocsHighlightToken = {
  kind: DocsHighlightTokenKind;
  value: string;
};
