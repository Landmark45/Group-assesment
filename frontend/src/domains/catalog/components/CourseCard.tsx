import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { CategoryPill, Pill, PriceBadge, formatCoursePrice } from '../../../shared/components/Pill';
import { StarRatingDisplay } from '../../../shared/components/StarRating';
import { CourseThumbnail } from './CourseThumbnail';
import type { Course } from '../catalog.types';

/**
 * The primary visual unit of EduConnect. Everything about it is tuned for
 * scanning a grid: thumbnail first, then the category, then the title, then the
 * three things a person actually decides on — instructor, rating, price.
 */

const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
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
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lifted};
    text-decoration: none;
    color: inherit;
  }

  /* The thumbnail leans in very slightly with the card. */
  &:hover figure > img,
  &:hover figure > svg,
  &:focus-visible figure > img,
  &:focus-visible figure > svg {
    transform: scale(1.04);
  }
`;

const ThumbnailFrame = styled.figure`
  position: relative;
  margin: 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};

  /* Scoped to the media element only — a "> *" here would also stretch the
     absolutely-positioned price badge to fill the whole frame. */
  > img,
  > svg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
  }
`;

const FloatingPriceBadge = styled(PriceBadge)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
`;

const CardBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardSummary = styled.p`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InstructorRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xxs};
`;

const InstructorAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const InstructorInitials = styled.span`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background-color: ${({ theme }) => theme.colors.secondarySoft};
  color: ${({ theme }) => theme.colors.secondaryOnSoft};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
`;

const InstructorName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const LearnerCount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

function buildInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter((namePart) => namePart !== '')
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? '')
    .join('');
}

interface CourseCardProps {
  readonly course: Course;
}

export function CourseCard({ course }: CourseCardProps): JSX.Element {
  const instructorName = course.instructor?.fullName ?? 'An EduConnect instructor';
  const totalMinutes = course.modules.reduce(
    (runningTotal, courseModule) => runningTotal + courseModule.estimatedMinutes,
    0
  );

  return (
    <CardLink to={`/courses/${course.id}`} aria-label={`${course.title} by ${instructorName}`}>
      <ThumbnailFrame>
        <CourseThumbnail
          imageUrl={course.thumbnailImageUrl}
          category={course.category}
          title={course.title}
        />
        <FloatingPriceBadge $isFree={course.priceInUnitedStatesDollars === 0}>
          {formatCoursePrice(course.priceInUnitedStatesDollars)}
        </FloatingPriceBadge>
      </ThumbnailFrame>

      <CardBody>
        <PillRow>
          <CategoryPill $category={course.category}>{course.category}</CategoryPill>
          <Pill>{course.difficultyLevel}</Pill>
        </PillRow>

        <CardTitle>{course.title}</CardTitle>
        <CardSummary>{course.description}</CardSummary>

        <InstructorRow>
          {course.instructor !== null && course.instructor.profilePictureUrl !== '' ? (
            <InstructorAvatar src={course.instructor.profilePictureUrl} alt="" loading="lazy" />
          ) : (
            <InstructorInitials aria-hidden="true">
              {buildInitials(instructorName)}
            </InstructorInitials>
          )}
          <InstructorName>{instructorName}</InstructorName>
        </InstructorRow>

        <CardFooter>
          <StarRatingDisplay rating={course.averageRating} reviewCount={course.reviewCount} />
          <LearnerCount>
            {course.modules.length} {course.modules.length === 1 ? 'module' : 'modules'}
            {totalMinutes > 0 ? ` · ${Math.round(totalMinutes / 60)}h` : ''}
          </LearnerCount>
        </CardFooter>
      </CardBody>
    </CardLink>
  );
}
