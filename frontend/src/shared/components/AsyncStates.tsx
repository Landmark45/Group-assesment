import type { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

import { Button } from './Button';
import {
  EmptyShelfIllustration,
  NoResultsIllustration,
  SpilledMugIllustration,
} from './Illustrations';

/**
 * The three states every asynchronous screen has to answer for: still loading,
 * nothing to show, and something went wrong.
 *
 * They are components rather than inline JSX so that every screen answers all
 * three the same way — an illustration, a sentence in plain English, and where
 * it makes sense, one obvious thing to do next.
 */

const StateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  text-align: center;
`;

const StateHeadline = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const StateBody = styled.p`
  max-width: 44ch;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const StateActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

const shimmer = keyframes`
  0% { background-position: -420px 0; }
  100% { background-position: 420px 0; }
`;

const SkeletonBlock = styled.div<{ $height?: string; $width?: string; $radius?: string }>`
  height: ${({ $height = '16px' }) => $height};
  width: ${({ $width = '100%' }) => $width};
  border-radius: ${({ theme, $radius }) => $radius ?? theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  background-image: ${({ theme }) =>
    `linear-gradient(90deg, ${theme.colors.surfaceMuted} 0%, ${theme.colors.pageBackgroundElevated} 50%, ${theme.colors.surfaceMuted} 100%)`};
  background-size: 840px 100%;
  animation: ${shimmer} 1.5s ${({ theme }) => theme.motion.easeInOut} infinite;
`;

const SkeletonCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

/**
 * A skeleton grid in the shape of the course cards that are about to arrive —
 * the layout does not jump when the real data lands.
 */
export function CourseGridLoadingState({ cardCount = 6 }: { cardCount?: number }): JSX.Element {
  return (
    <SkeletonGrid aria-busy="true" aria-live="polite" aria-label="Loading courses">
      {Array.from({ length: cardCount }, (_unused, cardIndex) => (
        <SkeletonCard key={cardIndex}>
          <SkeletonBlock $height="150px" $radius="12px" />
          <SkeletonBlock $height="12px" $width="35%" $radius="999px" />
          <SkeletonBlock $height="22px" $width="88%" />
          <SkeletonBlock $height="14px" $width="70%" />
          <SkeletonBlock $height="14px" $width="45%" />
        </SkeletonCard>
      ))}
    </SkeletonGrid>
  );
}

const InlineLoadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-7px); opacity: 1; }
`;

const BouncingDot = styled.span<{ $delay: string }>`
  width: 9px;
  height: 9px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background-color: ${({ theme }) => theme.colors.primary};
  animation: ${bounce} 1.3s ${({ theme }) => theme.motion.easeInOut} infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

/** Three warm bouncing dots — friendlier than a spinner, and just as clear. */
export function InlineLoadingState({
  message = 'Just a moment…',
}: {
  message?: string;
}): JSX.Element {
  return (
    <InlineLoadingRow role="status" aria-live="polite">
      <BouncingDot $delay="0s" />
      <BouncingDot $delay="0.16s" />
      <BouncingDot $delay="0.32s" />
      <span>{message}</span>
    </InlineLoadingRow>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty                                                                      */
/* -------------------------------------------------------------------------- */

interface EmptyStateProps {
  readonly variant?: 'shelf' | 'search';
  readonly headline: string;
  readonly body: string;
  readonly action?: ReactNode;
}

export function EmptyState({
  variant = 'shelf',
  headline,
  body,
  action,
}: EmptyStateProps): JSX.Element {
  return (
    <StateContainer>
      {variant === 'search' ? <NoResultsIllustration /> : <EmptyShelfIllustration />}
      <StateHeadline>{headline}</StateHeadline>
      <StateBody>{body}</StateBody>
      {action !== undefined ? <StateActionRow>{action}</StateActionRow> : null}
    </StateContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Error                                                                      */
/* -------------------------------------------------------------------------- */

interface ErrorStateProps {
  readonly headline?: string;
  readonly message: string;
  readonly onRetry?: () => void;
}

export function ErrorState({
  headline = 'That did not go to plan',
  message,
  onRetry,
}: ErrorStateProps): JSX.Element {
  return (
    <StateContainer role="alert">
      <SpilledMugIllustration />
      <StateHeadline>{headline}</StateHeadline>
      <StateBody>{message}</StateBody>
      {onRetry !== undefined ? (
        <StateActionRow>
          <Button type="button" $variant="secondary" onClick={onRetry}>
            Try that again
          </Button>
        </StateActionRow>
      ) : null}
    </StateContainer>
  );
}
