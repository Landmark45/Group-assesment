import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { ApiRequestError } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';
import { catalogApi } from '../api/catalog.api';
import type {
  Course,
  CourseCatalogFilters,
  CourseFormPayload,
  PaginatedCourseCatalog,
} from '../catalog.types';

/**
 * All catalog server-state lives in React Query. The `signal` React Query hands
 * each query function is forwarded to fetch, so navigating away mid-request
 * cancels it — our cleanup story for data fetching.
 */

export function useCourseCatalogQuery(
  filters: CourseCatalogFilters
): UseQueryResult<PaginatedCourseCatalog, ApiRequestError> {
  return useQuery<PaginatedCourseCatalog, ApiRequestError>({
    queryKey: queryKeys.courseCatalog(filters),
    queryFn: ({ signal }) => catalogApi.fetchCourseCatalog(filters, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

export function useCourseDetailQuery(courseId: string): UseQueryResult<Course, ApiRequestError> {
  return useQuery<Course, ApiRequestError>({
    queryKey: queryKeys.courseDetail(courseId),
    queryFn: ({ signal }) => catalogApi.fetchCourseById(courseId, signal),
    enabled: courseId !== '',
  });
}

export function useCoursesCreatedByMeQuery(
  isEnabled: boolean
): UseQueryResult<{ courses: readonly Course[] }, ApiRequestError> {
  return useQuery<{ courses: readonly Course[] }, ApiRequestError>({
    queryKey: queryKeys.coursesCreatedByMe,
    queryFn: ({ signal }) => catalogApi.fetchCoursesCreatedByMe(signal),
    enabled: isEnabled,
  });
}

export function useCreateCourse(): UseMutationResult<Course, ApiRequestError, CourseFormPayload> {
  const queryClient = useQueryClient();
  return useMutation<Course, ApiRequestError, CourseFormPayload>({
    mutationFn: (payload) => catalogApi.createCourse(payload),
    onSuccess: (createdCourse) => {
      queryClient.setQueryData(queryKeys.courseDetail(createdCourse.id), createdCourse);
      void queryClient.invalidateQueries({ queryKey: queryKeys.coursesCreatedByMe });
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'list'] });
    },
  });
}

export function useUpdateCourse(
  courseId: string
): UseMutationResult<Course, ApiRequestError, CourseFormPayload> {
  const queryClient = useQueryClient();
  return useMutation<Course, ApiRequestError, CourseFormPayload>({
    mutationFn: (payload) => catalogApi.updateCourse(courseId, payload),
    onSuccess: (updatedCourse) => {
      queryClient.setQueryData(queryKeys.courseDetail(updatedCourse.id), updatedCourse);
      void queryClient.invalidateQueries({ queryKey: queryKeys.coursesCreatedByMe });
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'list'] });
    },
  });
}

export function useDeleteCourse(): UseMutationResult<{ message: string }, ApiRequestError, string> {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, ApiRequestError, string>({
    mutationFn: (courseId) => catalogApi.deleteCourse(courseId),
    onSuccess: (_result, deletedCourseId) => {
      queryClient.removeQueries({ queryKey: queryKeys.courseDetail(deletedCourseId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.coursesCreatedByMe });
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'list'] });
    },
  });
}
