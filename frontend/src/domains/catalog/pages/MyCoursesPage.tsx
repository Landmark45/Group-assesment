import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  CourseGridLoadingState,
  EmptyState,
  ErrorState,
} from '../../../shared/components/AsyncStates';
import { Button } from '../../../shared/components/Button';
import {
  LeadParagraph,
  PageContainer,
  PageHeading,
  SectionStack,
} from '../../../shared/components/Layout';
import { useFetchOnMount } from '../../../shared/hooks/useFetchOnMount';
import { AuthoredCourseCard } from '../components/AuthoredCourseCard';
import { catalogApi } from '../api/catalog.api';
import type { Course } from '../catalog.types';

/**
 * "My Courses" — the private counterpart to the public catalog, showing only
 * the courses the signed-in user created.
 *
 * This page deliberately fetches with `useFetchOnMount` (useEffect + useState +
 * an AbortController cleanup) rather than React Query. It is the right fit:
 * the list is personal, it is read once when the page opens, and nothing
 * elsewhere in the application needs to invalidate it. It also keeps a plain,
 * readable example of the mount-fetch lifecycle in the codebase.
 */

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SummaryLine = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function MyCoursesPage(): JSX.Element {
  // Wrapped in useCallback purely for clarity — the hook holds the fetcher in a
  // ref, so an unstable identity would not restart the effect either way.
  const fetchMyCourses = useCallback(
    (signal: AbortSignal) => catalogApi.fetchCoursesCreatedByMe(signal),
    []
  );

  const { data, isLoading, errorMessage, refetch } =
    useFetchOnMount<{ courses: readonly Course[] }>(fetchMyCourses);

  const authoredCourses = data?.courses ?? [];
  const totalLearners = authoredCourses.reduce(
    (runningTotal, course) => runningTotal + course.enrollmentCount,
    0
  );

  return (
    <PageContainer>
      <SectionStack>
        <div>
          <PageHeading>My courses</PageHeading>
          <LeadParagraph>
            Everything you have published, and how it is doing. Only you can see this page, and
            only you can edit what is on it.
          </LeadParagraph>
        </div>

        <HeaderRow>
          {!isLoading && errorMessage === null && authoredCourses.length > 0 ? (
            <SummaryLine>
              {authoredCourses.length} {authoredCourses.length === 1 ? 'course' : 'courses'} ·{' '}
              {totalLearners} {totalLearners === 1 ? 'learner' : 'learners'} enrolled in total
            </SummaryLine>
          ) : (
            <span />
          )}

          <Link to="/courses/new">
            <Button type="button" as="span">
              + Publish a course
            </Button>
          </Link>
        </HeaderRow>

        {isLoading ? (
          <CourseGridLoadingState cardCount={3} />
        ) : errorMessage !== null ? (
          <ErrorState
            headline="We could not load your courses"
            message={errorMessage}
            onRetry={refetch}
          />
        ) : authoredCourses.length === 0 ? (
          <EmptyState
            headline="You have not published anything yet"
            body="You almost certainly know something somebody else would like to learn. A first course does not have to be long — it just has to be honest."
            action={
              <Link to="/courses/new">
                <Button type="button" as="span">
                  Publish your first course
                </Button>
              </Link>
            }
          />
        ) : (
          <CourseList>
            {authoredCourses.map((course) => (
              <AuthoredCourseCard key={course.id} course={course} />
            ))}
          </CourseList>
        )}
      </SectionStack>
    </PageContainer>
  );
}
