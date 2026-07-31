import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ErrorState, InlineLoadingState } from '../../../shared/components/AsyncStates';
import { Button } from '../../../shared/components/Button';
import {
  Card,
  LeadParagraph,
  PageContainer,
  PageHeading,
  SectionStack,
} from '../../../shared/components/Layout';
import { useAuthentication } from '../../identity/hooks/AuthenticationContext';
import { CourseEditorForm } from '../components/CourseEditorForm';
import { useCourseDetailQuery, useDeleteCourse, useUpdateCourse } from '../hooks/useCatalogQueries';

const DangerZone = styled(Card)`
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DangerHeading = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.danger};
`;

const DangerCopy = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.danger};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

const ConfirmRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export function EditCoursePage(): JSX.Element {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthentication();

  const courseQuery = useCourseDetailQuery(courseId);
  const updateCourse = useUpdateCourse(courseId);
  const deleteCourse = useDeleteCourse();

  const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);

  if (courseQuery.isPending) {
    return (
      <PageContainer>
        <InlineLoadingState message="Loading your course…" />
      </PageContainer>
    );
  }

  if (courseQuery.isError) {
    return (
      <PageContainer>
        <ErrorState
          message={courseQuery.error.message}
          onRetry={() => void courseQuery.refetch()}
        />
      </PageContainer>
    );
  }

  const course = courseQuery.data;

  // The server enforces this too — this is only so the wrong person never sees
  // a form they cannot submit.
  if (currentUser === null || currentUser.id !== course.instructorUserId) {
    return (
      <PageContainer>
        <ErrorState
          headline="This one is not yours to edit"
          message="Only the instructor who created a course can change it. If you think that is a mistake, check which account you are signed in with."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionStack>
        <div>
          <PageHeading>Edit “{course.title}”</PageHeading>
          <LeadParagraph>
            Changes go live the moment you save. Your {course.enrollmentCount}{' '}
            {course.enrollmentCount === 1 ? 'enrolled learner' : 'enrolled learners'} will see the
            updated version straight away.
          </LeadParagraph>
        </div>

        <CourseEditorForm
          existingCourse={course}
          isSubmitting={updateCourse.isPending}
          submitErrorMessage={
            updateCourse.isError && Object.keys(updateCourse.error.fieldErrors).length === 0
              ? updateCourse.error.message
              : undefined
          }
          serverFieldErrors={updateCourse.error?.fieldErrors ?? {}}
          onCancel={() => navigate(`/courses/${course.id}`)}
          onSubmit={(payload) =>
            updateCourse.mutate(payload, {
              onSuccess: () => navigate(`/courses/${course.id}`),
            })
          }
        />

        <DangerZone>
          <DangerHeading>Remove this course</DangerHeading>
          <DangerCopy>
            This deletes the course from the catalog for good, along with its reviews. Anyone
            currently enrolled will lose access. There is no undo.
          </DangerCopy>

          {deleteCourse.isError ? <DangerCopy role="alert">{deleteCourse.error.message}</DangerCopy> : null}

          {isConfirmingDeletion ? (
            <ConfirmRow>
              <Button
                type="button"
                $variant="danger"
                disabled={deleteCourse.isPending}
                onClick={() =>
                  deleteCourse.mutate(course.id, { onSuccess: () => navigate('/my-courses') })
                }
              >
                {deleteCourse.isPending ? 'Removing…' : 'Yes, delete it permanently'}
              </Button>
              <Button
                type="button"
                $variant="ghost"
                disabled={deleteCourse.isPending}
                onClick={() => setIsConfirmingDeletion(false)}
              >
                Keep it
              </Button>
            </ConfirmRow>
          ) : (
            <ConfirmRow>
              <Button type="button" $variant="danger" onClick={() => setIsConfirmingDeletion(true)}>
                Delete this course
              </Button>
            </ConfirmRow>
          )}
        </DangerZone>
      </SectionStack>
    </PageContainer>
  );
}
