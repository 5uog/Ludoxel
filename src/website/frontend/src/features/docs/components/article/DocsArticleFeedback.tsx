/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ThumbsDown, ThumbsUp } from 'lucide-react';

import { type DocsArticleFeedbackVote, useDocsArticleFeedback } from '../../hooks/useDocsArticleFeedback';

type DocsArticleFeedbackProps = {
  pagePath: string;
};

type DocsArticleFeedbackButtonProps = {
  activeVote: DocsArticleFeedbackVote | null;
  disabled: boolean;
  label: string;
  vote: DocsArticleFeedbackVote;
  onSelect: (vote: DocsArticleFeedbackVote) => void;
};

function getFeedbackButtonClassName(isActive: boolean): string {
  const baseClassName =
    'inline-flex flex-row items-center gap-3 rounded-xl border px-3.5 py-2 text-sm font-normal leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60';

  if (isActive) {
    return `${baseClassName} border-foreground bg-foreground text-background`;
  }

  return `${baseClassName} border-border bg-card/50 text-muted-foreground hover:border-muted-foreground hover:text-foreground`;
}

function DocsArticleFeedbackButton({ activeVote, disabled, label, vote, onSelect }: DocsArticleFeedbackButtonProps): React.JSX.Element {
  const isActive = activeVote === vote;
  const Icon = vote === 'yes' ? ThumbsUp : ThumbsDown;

  return (
    <button aria-pressed={isActive} className={getFeedbackButtonClassName(isActive)} disabled={disabled} id={vote === 'yes' ? 'feedback-thumbs-up' : 'feedback-thumbs-down'} onClick={() => onSelect(vote)} type="button">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2} />
      <small className="text-sm font-normal leading-4">{label}</small>
    </button>
  );
}

export default function DocsArticleFeedback({ pagePath }: DocsArticleFeedbackProps): React.JSX.Element {
  const { selectedVote, status, submitFeedback } = useDocsArticleFeedback(pagePath);
  const isSubmitting = status === 'saving';

  return (
    <>
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <p className="inline-block whitespace-nowrap text-sm text-muted-foreground" id="docs-article-feedback-title">
          Was this page helpful?
        </p>

        <div className="flex grow flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-3">
            <DocsArticleFeedbackButton activeVote={selectedVote} disabled={isSubmitting} label="Yes" onSelect={submitFeedback} vote="yes" />
            <DocsArticleFeedbackButton activeVote={selectedVote} disabled={isSubmitting} label="No" onSelect={submitFeedback} vote="no" />
          </div>
        </div>
      </div>

      <p aria-live="polite" className="min-h-4 text-sm text-muted-foreground">
        {status === 'saved' ? 'Feedback saved.' : null}
        {status === 'error' ? 'Feedback could not be saved.' : null}
      </p>
    </>
  );
}
