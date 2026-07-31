import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  ErrorState,
  InlineLoadingState,
} from '../../../shared/components/AsyncStates';
import { Button } from '../../../shared/components/Button';
import {
  Divider,
  PageContainer,
  SectionStack,
  SubsectionHeading,
} from '../../../shared/components/Layout';
import { CategoryPill, Pill } from '../../../shared/components/Pill';
import { StarRatingDisplay } from '../../../shared/components/StarRating';
import { useAuthentication } from '../../identity/hooks/AuthenticationContext';
import { EnrollmentPanel } from '../../learning/components/EnrollmentPanel';
import { ReviewComposer } from '../../learning/components/ReviewComposer';
import { ReviewList } from '../../learning/components/ReviewList';
import {
  useCourseReviewsQuery,
  useMyRelationshipToCourseQuery,
} from '../../learning/hooks/useLearningQueries';
import { CourseThumbnail } from '../components/CourseThumbnail';
import { useCourseDetailQuery } from '../hooks/useCatalogQueries';

const BackLinkRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.large}) {
    grid-template-columns: 1fr;
  }
`;

const HeroImageFrame = styled.figure`
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  aspect-ratio: 16 / 7;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.raised};

  > img,
  > svg {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CourseTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.display};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  }
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InstructorCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const InstructorAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
`;

const InstructorInitials = styled.div`
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background-color: ${({ theme }) => theme.colors.secondarySoft};
  color: ${({ theme }) => theme.colors.secondaryOnSoft};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
`;

const InstructorMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DescriptionProse = styled.p`
  max-width: ${({ theme }) => theme.layout.readingMaxWidth};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  white-space: pre-wrap;
`;

const ModuleList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: module-counter;
`;

const ModuleItem = styled.li`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  counter-increment: module-counter;
  transition: box-shadow ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.raised};
  }

  &::before {
    content: counter(module-counter);
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: ${({ theme }) => theme.radii.circle};
    background-color: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentOnSoft};
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const ModuleBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ModuleTitle = styled.strong`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const ModuleSummary = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

const ModuleDuration = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ReviewSummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SignInToReviewNote = styled.p`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

function buildInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter((namePart) => namePart !== '')
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? '')
    .join('');
}

export function CourseDetailPage(): JSX.Element {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const { currentUser, isAuthenticated } = useAuthentication();

  const courseQuery = useCourseDetailQuery(courseId);
  const reviewsQuery = useCourseReviewsQuery(courseId);
  const relationshipQuery = useMyRelationshipToCourseQuery(courseId, isAuthenticated);

  if (courseQuery.isPending) {
    return (
      <PageContainer>
        <InlineLoadingState message="Opening the course…" />
      </PageContainer>
    );
  }

  if (courseQuery.isError) {
    const isMissing = courseQuery.error.httpStatusCode === 404;
    return (
      <PageContainer>
        <ErrorState
          headline={isMissing ? 'We could not find that course' : 'That did not go to plan'}
          message={
            isMissing
              ? 'It may have been removed by its instructor, or the link might have a typo in it.'
              : courseQuery.error.message
          }
          {...(isMissing ? {} : { onRetry: () => void courseQuery.refetch() })}
        />
        <div style={{ textAlign: 'center' }}>
          <Link to="/courses">
            <Button type="button" as="span" $variant="secondary">
              Back to the catalog
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const course = courseQuery.data;
  const instructorName = course.instructor?.fullName ?? 'An EduConnect instructor';
  const totalMinutes = course.modules.reduce(
    (runningTotal, courseModule) => runningTotal + courseModule.estimatedMinutes,
    0
  );
  const canLeaveReview = relationshipQuery.data?.canLeaveReview ?? false;
  const isOwnCourse = currentUser !== null && currentUser.id === course.instructorUserId;

  return (
    <PageContainer>
      <BackLinkRow>
        <Link to="/courses">← Back to the catalog</Link>
      </BackLinkRow>

      <DetailGrid>
        <SectionStack>
          <HeroImageFrame>
            <CourseThumbnail
              imageUrl={course.thumbnailImageUrl}
              category={course.category}
              title={course.title}
            />
          </HeroImageFrame>

          <PillRow>
            <CategoryPill $category={course.category}>{course.category}</CategoryPill>
            <Pill>{course.difficultyLevel}</Pill>
            <StarRatingDisplay rating={course.averageRating} reviewCount={course.reviewCount} />
          </PillRow>

          <CourseTitle>{course.title}</CourseTitle>

          <InstructorCard>
            {course.instructor !== null && course.instructor.profilePictureUrl !== '' ? (
              <InstructorAvatar src={course.instructor.profilePictureUrl} alt="" />
            ) : (
              <InstructorInitials aria-hidden="true">
                {buildInitials(instructorName)}
              </InstructorInitials>
            )}
            <InstructorMeta>
              <strong style={{ fontSize: '1.0625rem' }}>{instructorName}</strong>
              <span>
                {course.instructor !== null ? `@${course.instructor.username}` : 'Instructor'}
              </span>
            </InstructorMeta>
          </InstructorCard>

          <div>
            <SubsectionHeading>What this course is</SubsectionHeading>
            <DescriptionProse style={{ marginTop: 12 }}>{course.description}</DescriptionProse>
          </div>

          {course.modules.length > 0 ? (
            <div>
              <SubsectionHeading>What is inside</SubsectionHeading>
              <ModuleList style={{ marginTop: 12 }}>
                {course.modules.map((courseModule, moduleIndex) => (
                  <ModuleItem key={`${courseModule.title}-${moduleIndex}`}>
                    <ModuleBody>
                      <ModuleTitle>{courseModule.title}</ModuleTitle>
                      {courseModule.summary !== '' ? (
                        <ModuleSummary>{courseModule.summary}</ModuleSummary>
                      ) : null}
                      <ModuleDuration>About {courseModule.estimatedMinutes} minutes</ModuleDuration>
                    </ModuleBody>
                  </ModuleItem>
                ))}
              </ModuleList>
            </div>
          ) : null}

          <Divider />

          <div>
            <ReviewSummaryRow>
              <SubsectionHeading>
                What learners thought
                {reviewsQuery.data !== undefined && reviewsQuery.data.reviewCount > 0
                  ? ` (${reviewsQuery.data.reviewCount})`
                  : ''}
              </SubsectionHeading>
              {reviewsQuery.data !== undefined && reviewsQuery.data.reviewCount > 0 ? (
                <StarRatingDisplay
                  rating={reviewsQuery.data.averageRating}
                  reviewCount={reviewsQuery.data.reviewCount}
                />
              ) : null}
            </ReviewSummaryRow>

            <SectionStack $gap="16px" style={{ marginTop: 16 }}>
              {canLeaveReview ? (
                <ReviewComposer
                  courseId={course.id}
                  existingReview={relationshipQuery.data?.ownReview ?? null}
                />
              ) : !isAuthenticated ? (
                <SignInToReviewNote>
                  <Link to="/login" state={{ redirectTo: `/courses/${course.id}` }}>
                    Sign in
                  </Link>{' '}
                  and enroll to leave a review of your own.
                </SignInToReviewNote>
              ) : isOwnCourse ? (
                <SignInToReviewNote>
                  Instructors do not review their own courses — but you can see everything your
                  learners have written below.
                </SignInToReviewNote>
              ) : (
                <SignInToReviewNote>
                  Enroll in this course to leave a review. We only publish reviews from people who
                  actually signed up.
                </SignInToReviewNote>
              )}

              <ReviewList
                reviews={reviewsQuery.data?.reviews ?? []}
                currentUserId={currentUser?.id ?? null}
                isLoading={reviewsQuery.isPending}
                errorMessage={reviewsQuery.isError ? reviewsQuery.error.message : undefined}
                onRetry={() => void reviewsQuery.refetch()}
              />
            </SectionStack>
          </div>
        </SectionStack>

        <EnrollmentPanel
          courseId={course.id}
          courseTitle={course.title}
          priceInUnitedStatesDollars={course.priceInUnitedStatesDollars}
          instructorUserId={course.instructorUserId}
          enrollmentCount={course.enrollmentCount}
          moduleCount={course.modules.length}
          totalMinutes={totalMinutes}
          relationship={relationshipQuery.data}
          isRelationshipLoading={relationshipQuery.isPending && isAuthenticated}
        />
      </DetailGrid>
    </PageContainer>
  );
}
