import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { CategoryPill } from '../../../shared/components/Pill';
import { StarRatingDisplay } from '../../../shared/components/StarRating';
import { CourseThumbnail } from '../../catalog/components/CourseThumbnail';
import type { Enrollment } from '../learning.types';

/**
 * A course as seen from the learner's dashboard — the same information as a
 * catalog card, reorganised around "where did I get to" rather than "should I
 * buy this".
 */

const CardLink = styled(Link)`
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.raised};
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  transition:
    transform ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut};

  &:hover,
  &:focus-visible {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.lifted};
    text-decoration: none;
    color: inherit;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    grid-template-columns: 1fr;
  }
`;

const ThumbnailFrame = styled.div`
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};

  > img,
  > svg {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    aspect-ratio: 16 / 7;
  }
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProgressBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ProgressTrack = styled.div`
  height: 7px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.surfaceSunken};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${({ $percentage }) => `${Math.max($percentage, 2)}%`};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const ProgressCaption = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const MissingCourseCard = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

interface EnrolledCourseCardProps {
  readonly enrollment: Enrollment;
}

export function EnrolledCourseCard({ enrollment }: EnrolledCourseCardProps): JSX.Element {
  const { course } = enrollment;

  // The instructor may have deleted the course out from under the enrollment.
  if (course === null) {
    return (
      <MissingCourseCard>
        This course is no longer available — its instructor removed it from the catalog.
      </MissingCourseCard>
    );
  }

  return (
    <CardLink to={`/courses/${course.id}`}>
      <ThumbnailFrame>
        <CourseThumbnail
          imageUrl={course.thumbnailImageUrl}
          category={course.category}
          title={course.title}
        />
      </ThumbnailFrame>

      <CardBody>
        <MetaRow>
          <CategoryPill $category={course.category}>{course.category}</CategoryPill>
          <StarRatingDisplay
            rating={course.averageRating}
            reviewCount={course.reviewCount}
            size={13}
          />
        </MetaRow>

        <CardTitle>{course.title}</CardTitle>

        <MetaRow>
          <span>{course.instructor?.fullName ?? 'An EduConnect instructor'}</span>
          <span aria-hidden="true">·</span>
          <span>
            {course.modules.length} {course.modules.length === 1 ? 'module' : 'modules'}
          </span>
        </MetaRow>

        <ProgressBlock>
          <ProgressTrack
            role="progressbar"
            aria-valuenow={enrollment.progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress through ${course.title}`}
          >
            <ProgressFill $percentage={enrollment.progressPercentage} />
          </ProgressTrack>
          <ProgressCaption>
            {enrollment.progressPercentage === 0
              ? 'Not started yet — no rush'
              : enrollment.progressPercentage === 100
                ? 'Finished. Nicely done.'
                : `${enrollment.progressPercentage}% complete`}
          </ProgressCaption>
        </ProgressBlock>
      </CardBody>
    </CardLink>
  );
}
