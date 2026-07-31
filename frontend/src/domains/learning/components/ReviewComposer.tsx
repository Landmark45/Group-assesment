import { useEffect, useState, type FormEvent } from 'react';
import styled from 'styled-components';

import { Button } from '../../../shared/components/Button';
import {
  FormField,
  FormLevelError,
  FormStack,
  FormSuccessNote,
  TextAreaInput,
} from '../../../shared/components/FormField';
import { StarRatingInput } from '../../../shared/components/StarRating';
import { useRetractMyReview, useSubmitCourseReview } from '../hooks/useLearningQueries';
import type { CourseReview } from '../learning.types';

/**
 * Where an enrolled student writes or edits their review. It doubles as the
 * edit form: if the student already has a review, the fields arrive filled in
 * and the API upserts rather than duplicating.
 */

const ComposerShell = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const ComposerHeading = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.primaryOnSoft};
`;

const ComposerPrompt = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primaryOnSoft};
  opacity: 0.85;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const RatingHint = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primaryOnSoft};
`;

const ActionRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`;

const RATING_HINTS: Record<number, string> = {
  1: 'Not for me',
  2: 'It had problems',
  3: 'Solid, with caveats',
  4: 'Really good',
  5: 'I would recommend it to anyone',
};

const REVIEW_MAX_LENGTH = 2000;

interface ReviewComposerProps {
  readonly courseId: string;
  readonly existingReview: CourseReview | null;
}

export function ReviewComposer({ courseId, existingReview }: ReviewComposerProps): JSX.Element {
  const submitReview = useSubmitCourseReview();
  const retractReview = useRetractMyReview();

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [ratingError, setRatingError] = useState<string | undefined>(undefined);

  /** Fill the form once the existing review arrives from the server. */
  useEffect(() => {
    setRating(existingReview?.rating ?? 0);
    setComment(existingReview?.comment ?? '');
  }, [existingReview?.id, existingReview?.updatedAt]);

  /** Let the "thanks" note fade away on its own. */
  useEffect(() => {
    if (!submitReview.isSuccess) {
      return;
    }
    const resetTimerId = window.setTimeout(() => submitReview.reset(), 4000);
    return () => window.clearTimeout(resetTimerId);
  }, [submitReview.isSuccess]);

  function handleSubmit(submitEvent: FormEvent<HTMLFormElement>): void {
    submitEvent.preventDefault();

    if (rating < 1) {
      setRatingError('Please choose a star rating first.');
      return;
    }
    setRatingError(undefined);

    submitReview.mutate({ courseId, payload: { rating, comment: comment.trim() } });
  }

  const isEditingExistingReview = existingReview !== null;
  const isBusy = submitReview.isPending || retractReview.isPending;

  return (
    <ComposerShell>
      <ComposerHeading>
        {isEditingExistingReview ? 'Update your review' : 'How was it?'}
      </ComposerHeading>
      <ComposerPrompt>
        {isEditingExistingReview
          ? 'Changed your mind, or finished more of it? Edit what you wrote.'
          : 'You are enrolled, so you can tell everyone else what it was actually like.'}
      </ComposerPrompt>

      <FormStack onSubmit={handleSubmit} noValidate>
        {submitReview.isError ? (
          <FormLevelError role="alert">
            <span aria-hidden="true">⚠</span>
            {submitReview.error.message}
          </FormLevelError>
        ) : null}

        {retractReview.isError ? (
          <FormLevelError role="alert">
            <span aria-hidden="true">⚠</span>
            {retractReview.error.message}
          </FormLevelError>
        ) : null}

        {submitReview.isSuccess ? (
          <FormSuccessNote role="status">
            <span aria-hidden="true">✓</span>
            Thank you — that helps the next person decide.
          </FormSuccessNote>
        ) : null}

        <RatingRow>
          <StarRatingInput value={rating} onChange={setRating} isDisabled={isBusy} />
          {rating > 0 ? <RatingHint>{RATING_HINTS[rating]}</RatingHint> : null}
        </RatingRow>
        {ratingError !== undefined ? (
          <FormLevelError role="alert">
            <span aria-hidden="true">⚠</span>
            {ratingError}
          </FormLevelError>
        ) : null}

        <FormField
          label="Anything you would tell a friend?"
          helperText="Optional, but the specific reviews are the useful ones."
          isOptional
        >
          {(controlProps) => (
            <TextAreaInput
              {...controlProps}
              name="comment"
              maxLength={REVIEW_MAX_LENGTH}
              placeholder="What worked, what did not, who it is for…"
              value={comment}
              disabled={isBusy}
              onChange={(changeEvent) => setComment(changeEvent.target.value)}
            />
          )}
        </FormField>

        <ActionRow>
          <Button type="submit" disabled={isBusy}>
            {submitReview.isPending
              ? 'Posting…'
              : isEditingExistingReview
                ? 'Save changes'
                : 'Post review'}
          </Button>

          {isEditingExistingReview ? (
            <Button
              type="button"
              $variant="ghost"
              disabled={isBusy}
              onClick={() => retractReview.mutate(courseId)}
            >
              {retractReview.isPending ? 'Removing…' : 'Delete my review'}
            </Button>
          ) : null}
        </ActionRow>
      </FormStack>
    </ComposerShell>
  );
}
