import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../../../shared/components/Button';
import { CategoryPill, Pill, formatCoursePrice } from '../../../shared/components/Pill';
import { StarRatingDisplay } from '../../../shared/components/StarRating';
import { CourseThumbnail } from './CourseThumbnail';
import type { Course } from '../catalog.types';

/**
 * A course as its own instructor sees it on the My Courses page.
 *
 * Deliberately a <div> rather than a link, unlike `CourseCard`: this card
 * carries its own View and Edit buttons, and an anchor nested inside another
 * anchor is invalid HTML that behaves unpredictably for keyboard users.
 */

const CardShell = styled.article`
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.raised};
  overflow: hidden;
  transition:
    transform ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut};

  &:hover,
  &:focus-within {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.lifted};
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
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

const StatRow = styled.dl`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const StatValue = styled.dd`
  margin: 0;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const StatLabel = styled.dt`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xxs};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

interface AuthoredCourseCardProps {
  readonly course: Course;
}

export function AuthoredCourseCard({ course }: AuthoredCourseCardProps): JSX.Element {
  return (
    <CardShell aria-label={course.title}>
      <ThumbnailFrame>
        <CourseThumbnail
          imageUrl={course.thumbnailImageUrl}
          category={course.category}
          title={course.title}
        />
      </ThumbnailFrame>

      <CardBody>
        <PillRow>
          <CategoryPill $category={course.category}>{course.category}</CategoryPill>
          <Pill>{course.difficultyLevel}</Pill>
          <StarRatingDisplay
            rating={course.averageRating}
            reviewCount={course.reviewCount}
            size={13}
          />
        </PillRow>

        <CardTitle>{course.title}</CardTitle>

        <StatRow>
          <StatItem>
            <StatValue>{course.enrollmentCount}</StatValue>
            <StatLabel>{course.enrollmentCount === 1 ? 'learner' : 'learners'}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{course.modules.length}</StatValue>
            <StatLabel>{course.modules.length === 1 ? 'module' : 'modules'}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{formatCoursePrice(course.priceInUnitedStatesDollars)}</StatValue>
            <StatLabel>price</StatLabel>
          </StatItem>
        </StatRow>

        <ActionRow>
          <Link to={`/courses/${course.id}`}>
            <Button type="button" as="span" $variant="secondary" $size="small">
              View as a learner
            </Button>
          </Link>
          <Link to={`/courses/${course.id}/edit`}>
            <Button type="button" as="span" $size="small">
              Edit
            </Button>
          </Link>
        </ActionRow>
      </CardBody>
    </CardShell>
  );
}
