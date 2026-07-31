import { useNavigate } from 'react-router-dom';

import {
  LeadParagraph,
  PageContainer,
  PageHeading,
  SectionStack,
} from '../../../shared/components/Layout';
import { CourseEditorForm } from '../components/CourseEditorForm';
import { useCreateCourse } from '../hooks/useCatalogQueries';

export function CreateCoursePage(): JSX.Element {
  const navigate = useNavigate();
  const createCourse = useCreateCourse();

  return (
    <PageContainer>
      <SectionStack>
        <div>
          <PageHeading>Publish a course</PageHeading>
          <LeadParagraph>
            You do not need a studio or a production team. Write down what you know, break it into
            modules, and put it somewhere people can find it. You can edit any of this later.
          </LeadParagraph>
        </div>

        <CourseEditorForm
          isSubmitting={createCourse.isPending}
          submitErrorMessage={
            createCourse.isError && Object.keys(createCourse.error.fieldErrors).length === 0
              ? createCourse.error.message
              : undefined
          }
          serverFieldErrors={createCourse.error?.fieldErrors ?? {}}
          onCancel={() => navigate('/my-courses')}
          onSubmit={(payload) =>
            createCourse.mutate(payload, {
              onSuccess: (createdCourse) => navigate(`/courses/${createdCourse.id}`),
            })
          }
        />
      </SectionStack>
    </PageContainer>
  );
}
