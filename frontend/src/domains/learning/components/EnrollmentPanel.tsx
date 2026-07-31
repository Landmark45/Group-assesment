import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../../../shared/components/Button';
import { formatCoursePrice } from '../../../shared/components/Pill';
import { useAuthentication } from '../../identity/hooks/AuthenticationContext';
import { useEnrollInCourse, useWithdrawFromCourse } from '../hooks/useLearningQueries';
import type { LearnerCourseRelationship } from '../learning.types';

/**
 * The sticky decision panel on a course page. It has one job: work out which of
 * five situations the visitor is in — signed out, the instructor, not enrolled,
 * enrolled, or mid-request — and show exactly one clear thing to do.
 */

const PanelShell = styled.aside`
  position: sticky;
  top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lifted};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    position: static;
  }
`;

const PriceLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PriceAmount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  font-size: ${({ theme }) => theme.typography.fontSize.display};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1;
`;

const PriceCaption = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StatusNote = styled.p<{ $tone: 'neutral' | 'positive' }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme, $tone }) =>
    $tone === 'positive' ? theme.colors.successSoft : theme.colors.surfaceMuted};
  color: ${({ theme, $tone }) =>
    $tone === 'positive' ? theme.colors.success : theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

const ErrorNote = styled(StatusNote).attrs({ $tone: 'neutral' as const })`
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  color: ${({ theme }) => theme.colors.danger};
`;

const StatList = styled.dl`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: ${({ theme }) => theme.spacing.xxs} 0 0;
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const StatLabel = styled.dt`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StatValue = styled.dd`
  margin: 0;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ProgressTrack = styled.div`
  height: 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.surfaceSunken};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${({ $percentage }) => `${$percentage}%`};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.secondary};
  transition: width ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
`;

interface EnrollmentPanelProps {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly priceInUnitedStatesDollars: number;
  readonly instructorUserId: string;
  readonly enrollmentCount: number;
  readonly moduleCount: number;
  readonly totalMinutes: number;
  readonly relationship: LearnerCourseRelationship | undefined;
  readonly isRelationshipLoading: boolean;
}

export function EnrollmentPanel({
  courseId,
  courseTitle,
  priceInUnitedStatesDollars,
  instructorUserId,
  enrollmentCount,
  moduleCount,
  totalMinutes,
  relationship,
  isRelationshipLoading,
}: EnrollmentPanelProps): JSX.Element {
  const { currentUser, isAuthenticated } = useAuthentication();
  const enrollInCourse = useEnrollInCourse();
  const withdrawFromCourse = useWithdrawFromCourse();

  const isOwnCourse = currentUser !== null && currentUser.id === instructorUserId;
  const isEnrolled = relationship?.isEnrolled ?? false;
  const isBusy = enrollInCourse.isPending || withdrawFromCourse.isPending;
  const progressPercentage = relationship?.enrollment?.progressPercentage ?? 0;

  const mutationErrorMessage =
    enrollInCourse.error?.message ?? withdrawFromCourse.error?.message ?? null;

  return (
    <PanelShell aria-label={`Enrollment options for ${courseTitle}`}>
      <PriceLine>
        <PriceAmount>{formatCoursePrice(priceInUnitedStatesDollars)}</PriceAmount>
        {priceInUnitedStatesDollars > 0 ? <PriceCaption>one-off</PriceCaption> : null}
      </PriceLine>

      {mutationErrorMessage !== null ? (
        <ErrorNote role="alert">{mutationErrorMessage}</ErrorNote>
      ) : null}

      {isOwnCourse ? (
        <>
          <StatusNote $tone="neutral">
            This is your course. You are seeing it exactly as learners do.
          </StatusNote>
          <Link to={`/courses/${courseId}/edit`}>
            <Button type="button" as="span" $isFullWidth $size="large">
              Edit this course
            </Button>
          </Link>
        </>
      ) : !isAuthenticated ? (
        <>
          <StatusNote $tone="neutral">
            Sign in to enroll. It is free to create an account and takes about a minute.
          </StatusNote>
          <Link to="/login" state={{ redirectTo: `/courses/${courseId}` }}>
            <Button type="button" as="span" $isFullWidth $size="large">
              Sign in to enroll
            </Button>
          </Link>
        </>
      ) : isRelationshipLoading ? (
        <Button type="button" $isFullWidth $size="large" disabled>
          Checking your enrollment…
        </Button>
      ) : isEnrolled ? (
        <>
          <StatusNote $tone="positive">
            You are enrolled. Everything here is yours whenever you have an evening free.
          </StatusNote>

          {progressPercentage > 0 ? (
            <>
              <ProgressTrack
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Your progress through this course"
              >
                <ProgressFill $percentage={progressPercentage} />
              </ProgressTrack>
              <PriceCaption>{progressPercentage}% complete</PriceCaption>
            </>
          ) : null}

          <Button
            type="button"
            $variant="secondary"
            $isFullWidth
            disabled={isBusy}
            onClick={() => withdrawFromCourse.mutate(courseId)}
          >
            {withdrawFromCourse.isPending ? 'Leaving…' : 'Leave this course'}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          $isFullWidth
          $size="large"
          disabled={isBusy}
          onClick={() => enrollInCourse.mutate(courseId)}
        >
          {enrollInCourse.isPending ? 'Enrolling you…' : 'Enroll now'}
        </Button>
      )}

      <StatList>
        <StatRow>
          <StatLabel>Learners enrolled</StatLabel>
          <StatValue>{enrollmentCount}</StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>Modules</StatLabel>
          <StatValue>{moduleCount}</StatValue>
        </StatRow>
        {totalMinutes > 0 ? (
          <StatRow>
            <StatLabel>Roughly</StatLabel>
            <StatValue>
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </StatValue>
          </StatRow>
        ) : null}
      </StatList>
    </PanelShell>
  );
}
