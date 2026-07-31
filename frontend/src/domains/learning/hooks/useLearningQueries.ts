import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { ApiRequestError } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';
import { learningApi } from '../api/learning.api';
import type {
  CourseReview,
  CourseReviewCollection,
  Enrollment,
  LearnerCourseRelationship,
  SubmitCourseReviewPayload,
} from '../learning.types';

/**
 * Learning server-state. Every mutation here also invalidates the *catalog*
 * caches, because enrolling and reviewing change the numbers a course card
 * shows — enrollment count and star rating.
 */

function useInvalidateAfterLearningChange(): (courseId: string) => void {
  const queryClient = useQueryClient();
  return (courseId: string) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.myRelationshipToCourse(courseId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.courseReviews(courseId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.courseDetail(courseId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.myEnrollments });
    void queryClient.invalidateQueries({ queryKey: ['catalog', 'list'] });
  };
}

export function useMyEnrollmentsQuery(
  isEnabled: boolean
): UseQueryResult<{ enrollments: readonly Enrollment[] }, ApiRequestError> {
  return useQuery<{ enrollments: readonly Enrollment[] }, ApiRequestError>({
    queryKey: queryKeys.myEnrollments,
    queryFn: ({ signal }) => learningApi.fetchMyEnrollments(signal),
    enabled: isEnabled,
  });
}

export function useCourseReviewsQuery(
  courseId: string
): UseQueryResult<CourseReviewCollection, ApiRequestError> {
  return useQuery<CourseReviewCollection, ApiRequestError>({
    queryKey: queryKeys.courseReviews(courseId),
    queryFn: ({ signal }) => learningApi.fetchReviewsForCourse(courseId, signal),
    enabled: courseId !== '',
  });
}

export function useMyRelationshipToCourseQuery(
  courseId: string,
  isEnabled: boolean
): UseQueryResult<LearnerCourseRelationship, ApiRequestError> {
  return useQuery<LearnerCourseRelationship, ApiRequestError>({
    queryKey: queryKeys.myRelationshipToCourse(courseId),
    queryFn: ({ signal }) => learningApi.fetchMyRelationshipToCourse(courseId, signal),
    enabled: isEnabled && courseId !== '',
  });
}

export function useEnrollInCourse(): UseMutationResult<Enrollment, ApiRequestError, string> {
  const invalidateAfterChange = useInvalidateAfterLearningChange();
  return useMutation<Enrollment, ApiRequestError, string>({
    mutationFn: (courseId) => learningApi.enrollInCourse(courseId),
    onSuccess: (_enrollment, courseId) => invalidateAfterChange(courseId),
  });
}

export function useWithdrawFromCourse(): UseMutationResult<
  { message: string },
  ApiRequestError,
  string
> {
  const invalidateAfterChange = useInvalidateAfterLearningChange();
  return useMutation<{ message: string }, ApiRequestError, string>({
    mutationFn: (courseId) => learningApi.withdrawFromCourse(courseId),
    onSuccess: (_result, courseId) => invalidateAfterChange(courseId),
  });
}

export function useUpdateEnrollmentProgress(): UseMutationResult<
  Enrollment,
  ApiRequestError,
  { courseId: string; progressPercentage: number }
> {
  const invalidateAfterChange = useInvalidateAfterLearningChange();
  return useMutation<
    Enrollment,
    ApiRequestError,
    { courseId: string; progressPercentage: number }
  >({
    mutationFn: ({ courseId, progressPercentage }) =>
      learningApi.updateEnrollmentProgress(courseId, progressPercentage),
    onSuccess: (_enrollment, variables) => invalidateAfterChange(variables.courseId),
  });
}

export function useSubmitCourseReview(): UseMutationResult<
  CourseReview,
  ApiRequestError,
  { courseId: string; payload: SubmitCourseReviewPayload }
> {
  const invalidateAfterChange = useInvalidateAfterLearningChange();
  return useMutation<
    CourseReview,
    ApiRequestError,
    { courseId: string; payload: SubmitCourseReviewPayload }
  >({
    mutationFn: ({ courseId, payload }) => learningApi.submitReviewForCourse(courseId, payload),
    onSuccess: (_review, variables) => invalidateAfterChange(variables.courseId),
  });
}

export function useRetractMyReview(): UseMutationResult<
  { message: string },
  ApiRequestError,
  string
> {
  const invalidateAfterChange = useInvalidateAfterLearningChange();
  return useMutation<{ message: string }, ApiRequestError, string>({
    mutationFn: (courseId) => learningApi.retractMyReviewForCourse(courseId),
    onSuccess: (_result, courseId) => invalidateAfterChange(courseId),
  });
}
