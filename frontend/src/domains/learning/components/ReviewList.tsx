import styled from 'styled-components';

import { InlineLoadingState, ErrorState } from '../../../shared/components/AsyncStates';
import { StarRatingDisplay } from '../../../shared/components/StarRating';
import type { CourseReview } from '../learning.types';

/**
 * The review list. Kept purely presentational — it receives reviews and renders
 * them, which is what lets the course detail page and any future "recent
 * reviews" widget share it without either knowing about the other.
 */

const ReviewListShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ReviewItem = styled.article`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
`;

const ReviewerAvatar = styled.img`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const ReviewerInitials = styled.div`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background-color: ${({ theme }) => theme.colors.secondarySoft};
  color: ${({ theme }) => theme.colors.secondaryOnSoft};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
`;

const ReviewBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`;

const ReviewerHeader = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ReviewerName = styled.strong`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const ReviewTimestamp = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const OwnReviewMarker = styled.span`
  padding: 2px ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryOnSoft};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const ReviewComment = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  overflow-wrap: anywhere;
`;

const QuietEmptyNote = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const QuietEmptyHeadline = styled.strong`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

function formatReviewDate(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter((namePart) => namePart !== '')
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? '')
    .join('');
}

interface ReviewListProps {
  readonly reviews: readonly CourseReview[];
  readonly currentUserId: string | null;
  readonly isLoading: boolean;
  readonly errorMessage?: string | undefined;
  readonly onRetry?: () => void;
}

export function ReviewList({
  reviews,
  currentUserId,
  isLoading,
  errorMessage,
  onRetry,
}: ReviewListProps): JSX.Element {
  if (isLoading) {
    return <InlineLoadingState message="Fetching what people thought…" />;
  }

  if (errorMessage !== undefined) {
    return (
      <ErrorState
        headline="We could not load the reviews"
        message={errorMessage}
        {...(onRetry !== undefined ? { onRetry } : {})}
      />
    );
  }

  if (reviews.length === 0) {
    return (
      <QuietEmptyNote>
        <span aria-hidden="true" style={{ fontSize: '28px' }}>
          ✎
        </span>
        <QuietEmptyHeadline>No reviews yet</QuietEmptyHeadline>
        <span>
          If you have taken this course, you would be the first to say something about it.
        </span>
      </QuietEmptyNote>
    );
  }

  return (
    <ReviewListShell>
      {reviews.map((review) => {
        const reviewerName = review.author?.fullName ?? 'A learner';
        const isOwnReview = currentUserId !== null && review.authorUserId === currentUserId;

        return (
          <ReviewItem key={review.id}>
            {review.author !== null && review.author.profilePictureUrl !== '' ? (
              <ReviewerAvatar src={review.author.profilePictureUrl} alt="" loading="lazy" />
            ) : (
              <ReviewerInitials aria-hidden="true">{buildInitials(reviewerName)}</ReviewerInitials>
            )}

            <ReviewBody>
              <ReviewerHeader>
                <ReviewerName>{reviewerName}</ReviewerName>
                {isOwnReview ? <OwnReviewMarker>Your review</OwnReviewMarker> : null}
                <StarRatingDisplay rating={review.rating} size={14} showCaption={false} />
                <ReviewTimestamp>{formatReviewDate(review.createdAt)}</ReviewTimestamp>
              </ReviewerHeader>

              {review.comment !== '' ? <ReviewComment>{review.comment}</ReviewComment> : null}
            </ReviewBody>
          </ReviewItem>
        );
      })}
    </ReviewListShell>
  );
}
