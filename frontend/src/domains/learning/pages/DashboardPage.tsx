import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  CourseGridLoadingState,
  EmptyState,
  ErrorState,
  InlineLoadingState,
} from '../../../shared/components/AsyncStates';
import { Button } from '../../../shared/components/Button';
import {
  CourseGrid,
  LeadParagraph,
  PageContainer,
  PageHeading,
  RowStack,
  SectionStack,
} from '../../../shared/components/Layout';
import { CourseCard } from '../../catalog/components/CourseCard';
import { useCoursesCreatedByMeQuery } from '../../catalog/hooks/useCatalogQueries';
import { useAuthentication } from '../../identity/hooks/AuthenticationContext';
import { EnrolledCourseCard } from '../components/EnrolledCourseCard';
import { useMyEnrollmentsQuery } from '../hooks/useLearningQueries';

/**
 * The signed-in home: two views of the same person. "Learning" is the learning
 * domain's data, "Teaching" is the catalog's — the tab switch is the only place
 * in the UI where the two sit side by side.
 */

const TabRow = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => theme.spacing.xxs};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.pill};
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.lg}`};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.surface : 'transparent'};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.textPrimary : theme.colors.textSecondary};
  box-shadow: ${({ theme, $isActive }) => ($isActive ? theme.shadows.subtle : 'none')};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const TabCount = styled.span`
  margin-left: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const EnrollmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

type DashboardTab = 'learning' | 'teaching';

export function DashboardPage(): JSX.Element {
  const { currentUser } = useAuthentication();
  const [activeTab, setActiveTab] = useState<DashboardTab>('learning');

  const enrollmentsQuery = useMyEnrollmentsQuery(currentUser !== null);
  const myCoursesQuery = useCoursesCreatedByMeQuery(currentUser !== null);

  const firstName = (currentUser?.fullName ?? '').split(' ')[0] ?? 'there';
  const enrollmentCount = enrollmentsQuery.data?.enrollments.length ?? 0;
  const authoredCourseCount = myCoursesQuery.data?.courses.length ?? 0;

  return (
    <PageContainer>
      <SectionStack>
        <div>
          <PageHeading>Hello, {firstName}.</PageHeading>
          <LeadParagraph>
            Everything you are learning and everything you are teaching, in one place.
          </LeadParagraph>
        </div>

        <HeaderRow>
          <TabRow role="tablist" aria-label="Dashboard sections">
            <TabButton
              type="button"
              role="tab"
              aria-selected={activeTab === 'learning'}
              $isActive={activeTab === 'learning'}
              onClick={() => setActiveTab('learning')}
            >
              Learning
              {enrollmentCount > 0 ? <TabCount>{enrollmentCount}</TabCount> : null}
            </TabButton>
            <TabButton
              type="button"
              role="tab"
              aria-selected={activeTab === 'teaching'}
              $isActive={activeTab === 'teaching'}
              onClick={() => setActiveTab('teaching')}
            >
              Teaching
              {authoredCourseCount > 0 ? <TabCount>{authoredCourseCount}</TabCount> : null}
            </TabButton>
          </TabRow>

          {activeTab === 'teaching' ? (
            <RowStack $gap="8px">
              <Link to="/my-courses">
                <Button type="button" as="span" $variant="secondary">
                  Manage my courses
                </Button>
              </Link>
              <Link to="/courses/new">
                <Button type="button" as="span">
                  + Publish a course
                </Button>
              </Link>
            </RowStack>
          ) : (
            <Link to="/courses">
              <Button type="button" as="span" $variant="secondary">
                Browse the catalog
              </Button>
            </Link>
          )}
        </HeaderRow>

        {activeTab === 'learning' ? (
          enrollmentsQuery.isPending ? (
            <InlineLoadingState message="Gathering your courses…" />
          ) : enrollmentsQuery.isError ? (
            <ErrorState
              message={enrollmentsQuery.error.message}
              onRetry={() => void enrollmentsQuery.refetch()}
            />
          ) : enrollmentCount === 0 ? (
            <EmptyState
              headline="You have not enrolled in anything yet"
              body="That is a perfectly good place to start. Have a wander through the catalog and see what catches your eye — plenty of it is free."
              action={
                <Link to="/courses">
                  <Button type="button" as="span">
                    Find your first course
                  </Button>
                </Link>
              }
            />
          ) : (
            <EnrollmentList>
              {enrollmentsQuery.data.enrollments.map((enrollment) => (
                <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </EnrollmentList>
          )
        ) : myCoursesQuery.isPending ? (
          <CourseGridLoadingState cardCount={3} />
        ) : myCoursesQuery.isError ? (
          <ErrorState
            message={myCoursesQuery.error.message}
            onRetry={() => void myCoursesQuery.refetch()}
          />
        ) : authoredCourseCount === 0 ? (
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
          <CourseGrid>
            {myCoursesQuery.data.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </CourseGrid>
        )}
      </SectionStack>
    </PageContainer>
  );
}
