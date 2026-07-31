import styled from 'styled-components';

/**
 * The star rating, in two modes: a read-only display (supporting half stars via
 * a clipped overlay) and an interactive input used by the review composer.
 */

const RatingRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const StarTrack = styled.span<{ $size: number }>`
  position: relative;
  display: inline-block;
  font-size: ${({ $size }) => `${$size}px`};
  line-height: 1;
  letter-spacing: 2px;
  white-space: nowrap;
`;

const EmptyStarLayer = styled.span`
  color: ${({ theme }) => theme.colors.surfaceSunken};
`;

const FilledStarLayer = styled.span<{ $fillPercentage: number }>`
  position: absolute;
  inset: 0;
  overflow: hidden;
  width: ${({ $fillPercentage }) => `${$fillPercentage}%`};
  color: ${({ theme }) => theme.colors.accent};
`;

const RatingCaption = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const STAR_GLYPHS = '★★★★★';

interface StarRatingDisplayProps {
  readonly rating: number;
  readonly reviewCount?: number;
  readonly size?: number;
  readonly showCaption?: boolean;
}

export function StarRatingDisplay({
  rating,
  reviewCount,
  size = 16,
  showCaption = true,
}: StarRatingDisplayProps): JSX.Element {
  const clampedRating = Math.max(0, Math.min(5, rating));
  const fillPercentage = (clampedRating / 5) * 100;

  const accessibleLabel =
    reviewCount === undefined
      ? `Rated ${clampedRating.toFixed(1)} out of 5`
      : reviewCount === 0
        ? 'Not rated yet'
        : `Rated ${clampedRating.toFixed(1)} out of 5 from ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`;

  return (
    <RatingRow role="img" aria-label={accessibleLabel}>
      <StarTrack $size={size} aria-hidden="true">
        <EmptyStarLayer>{STAR_GLYPHS}</EmptyStarLayer>
        <FilledStarLayer $fillPercentage={fillPercentage}>{STAR_GLYPHS}</FilledStarLayer>
      </StarTrack>
      {showCaption ? (
        <RatingCaption aria-hidden="true">
          {reviewCount === 0 ? 'New' : clampedRating.toFixed(1)}
          {reviewCount !== undefined && reviewCount > 0 ? ` (${reviewCount})` : ''}
        </RatingCaption>
      ) : null}
    </RatingRow>
  );
}

/* -------------------------------------------------------------------------- */
/* Interactive input                                                          */
/* -------------------------------------------------------------------------- */

const StarButtonGroup = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const StarButton = styled.button<{ $isActive: boolean }>`
  padding: 2px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 30px;
  line-height: 1;
  color: ${({ theme, $isActive }) => ($isActive ? theme.colors.accent : theme.colors.surfaceSunken)};
  transition:
    color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};

  &:hover:not(:disabled) {
    transform: scale(1.15);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

interface StarRatingInputProps {
  readonly value: number;
  readonly onChange: (rating: number) => void;
  readonly isDisabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  isDisabled = false,
}: StarRatingInputProps): JSX.Element {
  return (
    <StarButtonGroup role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <StarButton
          key={starValue}
          type="button"
          role="radio"
          aria-checked={value === starValue}
          aria-label={`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
          disabled={isDisabled}
          $isActive={starValue <= value}
          onClick={() => onChange(starValue)}
        >
          ★
        </StarButton>
      ))}
    </StarButtonGroup>
  );
}
