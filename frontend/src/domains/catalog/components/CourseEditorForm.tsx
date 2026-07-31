import { useState, type FormEvent } from 'react';
import styled from 'styled-components';

import { Button } from '../../../shared/components/Button';
import {
  FormField,
  FormLevelError,
  FormStack,
  SelectInput,
  TextAreaInput,
  TextInput,
} from '../../../shared/components/FormField';
import { Card, SectionStack, SubsectionHeading } from '../../../shared/components/Layout';
import {
  collectFieldErrors,
  hasAnyFieldError,
  validateCourseDescription,
  validateCoursePrice,
  validateCourseTitle,
  validateOptionalUrl,
  type FieldErrorMap,
} from '../../../shared/validation/formValidation';
import {
  COURSE_CATEGORIES,
  COURSE_DIFFICULTY_LEVELS,
  type Course,
  type CourseCategory,
  type CourseDifficultyLevel,
  type CourseFormPayload,
  type CourseModule,
} from '../catalog.types';

/**
 * The shared create/edit form. One component serves both routes because the
 * only difference between publishing and editing is what the fields start as
 * and what the submit button says.
 */

const TwoColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    grid-template-columns: 1fr;
  }
`;

const ModuleCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const ModuleHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ModuleNumber = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyModulesNote = styled.p`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
`;

const ActionRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

interface DraftModule extends CourseModule {
  readonly estimatedMinutes: number;
}

interface CourseEditorFormProps {
  readonly existingCourse?: Course;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage?: string | undefined;
  readonly serverFieldErrors?: FieldErrorMap;
  readonly onSubmit: (payload: CourseFormPayload) => void;
  readonly onCancel: () => void;
  readonly secondaryAction?: JSX.Element;
}

export function CourseEditorForm({
  existingCourse,
  isSubmitting,
  submitErrorMessage,
  serverFieldErrors = {},
  onSubmit,
  onCancel,
  secondaryAction,
}: CourseEditorFormProps): JSX.Element {
  const [title, setTitle] = useState(existingCourse?.title ?? '');
  const [description, setDescription] = useState(existingCourse?.description ?? '');
  const [category, setCategory] = useState<CourseCategory>(
    existingCourse?.category ?? 'Programming'
  );
  const [difficultyLevel, setDifficultyLevel] = useState<CourseDifficultyLevel>(
    existingCourse?.difficultyLevel ?? 'Beginner'
  );
  const [price, setPrice] = useState(
    existingCourse !== undefined ? String(existingCourse.priceInUnitedStatesDollars) : '0'
  );
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState(
    existingCourse?.thumbnailImageUrl ?? ''
  );
  const [modules, setModules] = useState<readonly DraftModule[]>(
    existingCourse?.modules ?? []
  );
  const [localFieldErrors, setLocalFieldErrors] = useState<FieldErrorMap>({});

  const fieldErrors: FieldErrorMap = { ...serverFieldErrors, ...localFieldErrors };

  function updateModuleAtIndex(moduleIndex: number, partialModule: Partial<DraftModule>): void {
    setModules((currentModules) =>
      currentModules.map((currentModule, currentIndex) =>
        currentIndex === moduleIndex ? { ...currentModule, ...partialModule } : currentModule
      )
    );
  }

  function appendEmptyModule(): void {
    setModules((currentModules) => [
      ...currentModules,
      { title: '', summary: '', estimatedMinutes: 30 },
    ]);
  }

  function removeModuleAtIndex(moduleIndex: number): void {
    setModules((currentModules) =>
      currentModules.filter((_currentModule, currentIndex) => currentIndex !== moduleIndex)
    );
  }

  function handleSubmit(submitEvent: FormEvent<HTMLFormElement>): void {
    submitEvent.preventDefault();

    const hasEmptyModuleTitle = modules.some((draftModule) => draftModule.title.trim().length < 2);
    const clientSideErrors = collectFieldErrors({
      title: validateCourseTitle(title),
      description: validateCourseDescription(description),
      priceInUnitedStatesDollars: validateCoursePrice(price),
      thumbnailImageUrl: validateOptionalUrl(thumbnailImageUrl),
      modules: hasEmptyModuleTitle
        ? 'Every module needs a title — or remove the empty ones.'
        : undefined,
    });

    setLocalFieldErrors(clientSideErrors);
    if (hasAnyFieldError(clientSideErrors)) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      difficultyLevel,
      priceInUnitedStatesDollars: Number(price),
      thumbnailImageUrl: thumbnailImageUrl.trim(),
      modules: modules.map((draftModule) => ({
        title: draftModule.title.trim(),
        summary: draftModule.summary.trim(),
        estimatedMinutes: draftModule.estimatedMinutes,
      })),
    });
  }

  return (
    <FormStack onSubmit={handleSubmit} noValidate>
      {submitErrorMessage !== undefined ? (
        <FormLevelError role="alert">
          <span aria-hidden="true">⚠</span>
          {submitErrorMessage}
        </FormLevelError>
      ) : null}

      <Card>
        <SectionStack $gap="16px">
          <SubsectionHeading>The basics</SubsectionHeading>

          <FormField
            label="Course title"
            errorMessage={fieldErrors['title']}
            helperText="Say what someone will be able to do at the end, not just the topic."
          >
            {(controlProps) => (
              <TextInput
                {...controlProps}
                name="title"
                maxLength={140}
                placeholder="Node.js APIs That Survive Production"
                value={title}
                onChange={(changeEvent) => setTitle(changeEvent.target.value)}
              />
            )}
          </FormField>

          <FormField
            label="Description"
            errorMessage={fieldErrors['description']}
            helperText="A paragraph or two. Who it is for, what you cover, what they will build."
          >
            {(controlProps) => (
              <TextAreaInput
                {...controlProps}
                name="description"
                maxLength={4000}
                placeholder="This course is for…"
                value={description}
                onChange={(changeEvent) => setDescription(changeEvent.target.value)}
              />
            )}
          </FormField>

          <TwoColumnRow>
            <FormField label="Category" errorMessage={fieldErrors['category']}>
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  name="category"
                  value={category}
                  onChange={(changeEvent) =>
                    setCategory(changeEvent.target.value as CourseCategory)
                  }
                >
                  {COURSE_CATEGORIES.map((categoryOption) => (
                    <option key={categoryOption} value={categoryOption}>
                      {categoryOption}
                    </option>
                  ))}
                </SelectInput>
              )}
            </FormField>

            <FormField label="Level" errorMessage={fieldErrors['difficultyLevel']}>
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  name="difficultyLevel"
                  value={difficultyLevel}
                  onChange={(changeEvent) =>
                    setDifficultyLevel(changeEvent.target.value as CourseDifficultyLevel)
                  }
                >
                  {COURSE_DIFFICULTY_LEVELS.map((difficultyOption) => (
                    <option key={difficultyOption} value={difficultyOption}>
                      {difficultyOption}
                    </option>
                  ))}
                </SelectInput>
              )}
            </FormField>
          </TwoColumnRow>

          <TwoColumnRow>
            <FormField
              label="Price in US dollars"
              errorMessage={fieldErrors['priceInUnitedStatesDollars']}
              helperText="Enter 0 to make it free."
            >
              {(controlProps) => (
                <TextInput
                  {...controlProps}
                  type="number"
                  name="price"
                  min={0}
                  max={10000}
                  step="1"
                  value={price}
                  onChange={(changeEvent) => setPrice(changeEvent.target.value)}
                />
              )}
            </FormField>

            <FormField
              label="Cover image link"
              errorMessage={fieldErrors['thumbnailImageUrl']}
              helperText="Leave empty and we will draw one for you."
              isOptional
            >
              {(controlProps) => (
                <TextInput
                  {...controlProps}
                  name="thumbnailImageUrl"
                  inputMode="url"
                  placeholder="https://…"
                  value={thumbnailImageUrl}
                  onChange={(changeEvent) => setThumbnailImageUrl(changeEvent.target.value)}
                />
              )}
            </FormField>
          </TwoColumnRow>
        </SectionStack>
      </Card>

      <Card>
        <SectionStack $gap="16px">
          <SubsectionHeading>Modules</SubsectionHeading>

          {fieldErrors['modules'] !== undefined ? (
            <FormLevelError role="alert">
              <span aria-hidden="true">⚠</span>
              {fieldErrors['modules']}
            </FormLevelError>
          ) : null}

          {modules.length === 0 ? (
            <EmptyModulesNote>
              No modules yet. Add the first one — even a rough outline helps people decide.
            </EmptyModulesNote>
          ) : (
            modules.map((draftModule, moduleIndex) => (
              <ModuleCard key={moduleIndex}>
                <ModuleHeaderRow>
                  <ModuleNumber>Module {moduleIndex + 1}</ModuleNumber>
                  <Button
                    type="button"
                    $variant="ghost"
                    $size="small"
                    onClick={() => removeModuleAtIndex(moduleIndex)}
                  >
                    Remove
                  </Button>
                </ModuleHeaderRow>

                <FormField label="Module title">
                  {(controlProps) => (
                    <TextInput
                      {...controlProps}
                      maxLength={120}
                      placeholder="Why layers, really"
                      value={draftModule.title}
                      onChange={(changeEvent) =>
                        updateModuleAtIndex(moduleIndex, { title: changeEvent.target.value })
                      }
                    />
                  )}
                </FormField>

                <FormField label="One-line summary" isOptional>
                  {(controlProps) => (
                    <TextInput
                      {...controlProps}
                      maxLength={400}
                      placeholder="What this module covers"
                      value={draftModule.summary}
                      onChange={(changeEvent) =>
                        updateModuleAtIndex(moduleIndex, { summary: changeEvent.target.value })
                      }
                    />
                  )}
                </FormField>

                <FormField label="Estimated minutes">
                  {(controlProps) => (
                    <TextInput
                      {...controlProps}
                      type="number"
                      min={1}
                      max={1200}
                      value={String(draftModule.estimatedMinutes)}
                      onChange={(changeEvent) =>
                        updateModuleAtIndex(moduleIndex, {
                          estimatedMinutes: Number(changeEvent.target.value) || 1,
                        })
                      }
                    />
                  )}
                </FormField>
              </ModuleCard>
            ))
          )}

          <div>
            <Button type="button" $variant="secondary" $size="small" onClick={appendEmptyModule}>
              + Add a module
            </Button>
          </div>
        </SectionStack>
      </Card>

      <ActionRow>
        <Button type="submit" $size="large" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : existingCourse !== undefined
              ? 'Save changes'
              : 'Publish course'}
        </Button>
        <Button type="button" $variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        {secondaryAction}
      </ActionRow>
    </FormStack>
  );
}
