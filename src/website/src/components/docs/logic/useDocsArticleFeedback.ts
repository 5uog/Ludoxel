/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

export type DocsArticleFeedbackVote = 'yes' | 'no';

type DocsArticleFeedbackStatus = 'idle' | 'saving' | 'saved' | 'error';

type DocsArticleFeedbackRequest = {
  pagePath: string;
  vote: DocsArticleFeedbackVote;
  voterId: string;
};

type UseDocsArticleFeedbackResult = {
  selectedVote: DocsArticleFeedbackVote | null;
  status: DocsArticleFeedbackStatus;
  submitFeedback: (vote: DocsArticleFeedbackVote) => void;
};

const FEEDBACK_STORAGE_PREFIX = 'ludoxel:docs-feedback:';
const FEEDBACK_VOTER_ID_STORAGE_KEY = 'ludoxel:docs-feedback:voter-id';

function isDocsArticleFeedbackVote(value: string | null): value is DocsArticleFeedbackVote {
  return value === 'yes' || value === 'no';
}

function createFallbackVoterId(): string {
  return `visitor-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateVoterId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedVoterId = window.localStorage.getItem(FEEDBACK_VOTER_ID_STORAGE_KEY);

  if (storedVoterId !== null && storedVoterId.length > 0) {
    return storedVoterId;
  }

  const voterId = typeof window.crypto.randomUUID === 'function' ? window.crypto.randomUUID() : createFallbackVoterId();

  window.localStorage.setItem(FEEDBACK_VOTER_ID_STORAGE_KEY, voterId);

  return voterId;
}

function getFeedbackStorageKey(pagePath: string): string {
  return `${FEEDBACK_STORAGE_PREFIX}${pagePath}`;
}

function readStoredVote(pagePath: string): DocsArticleFeedbackVote | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedVote = window.localStorage.getItem(getFeedbackStorageKey(pagePath));

  return isDocsArticleFeedbackVote(storedVote) ? storedVote : null;
}

function writeStoredVote(pagePath: string, vote: DocsArticleFeedbackVote): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getFeedbackStorageKey(pagePath), vote);
}

async function postDocsArticleFeedback(request: DocsArticleFeedbackRequest): Promise<void> {
  const response = await fetch('/api/docs-feedback', {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Docs article feedback request failed.');
  }
}

export function useDocsArticleFeedback(pagePath: string): UseDocsArticleFeedbackResult {
  const [selectedVote, setSelectedVote] = useState<DocsArticleFeedbackVote | null>(null);
  const [status, setStatus] = useState<DocsArticleFeedbackStatus>('idle');

  const voterId = useMemo(() => getOrCreateVoterId(), []);

  useEffect(() => {
    setSelectedVote(readStoredVote(pagePath));
    setStatus('idle');
  }, [pagePath]);

  const submitFeedback = useCallback(
    (vote: DocsArticleFeedbackVote): void => {
      if (voterId === null || selectedVote === vote) {
        return;
      }

      const previousVote = selectedVote;

      setSelectedVote(vote);
      setStatus('saving');

      postDocsArticleFeedback({
        pagePath,
        vote,
        voterId,
      })
        .then(() => {
          writeStoredVote(pagePath, vote);
          setStatus('saved');
        })
        .catch(() => {
          setSelectedVote(previousVote);
          setStatus('error');
        });
    },
    [pagePath, selectedVote, voterId],
  );

  return {
    selectedVote,
    status,
    submitFeedback,
  };
}
